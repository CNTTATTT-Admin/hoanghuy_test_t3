"""Alert API Endpoints"""

from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, Depends
from typing import Dict, Any, Optional
import logging

from pydantic import BaseModel

import json

from db.database import get_pool, is_db_enabled, record_to_dict, utcnow, acquire_connection, release_connection
from core.security import get_current_user, require_role
from notifier import get_notifier

logger = logging.getLogger(__name__)

router = APIRouter()
notifier = get_notifier()


class AcknowledgeRequest(BaseModel):
    """Request body cho endpoint acknowledge_alert."""
    action: str  # "ignore" | "resolve" | "mark_fraud" | "mark_legit"


def _parse_iso_utc(value: Optional[str], field_name: str) -> Optional[datetime]:
    if value is None:
        return None

    try:
        normalized = value.replace("Z", "+00:00")
        parsed = datetime.fromisoformat(normalized)
        if parsed.tzinfo is None:
            parsed = parsed.replace(tzinfo=timezone.utc)
        return parsed.astimezone(timezone.utc)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=f"Invalid {field_name} format") from exc

@router.get("/alerts")
async def get_alerts(
    limit: int = 50, 
    offset: int = 0,
    alert_type: Optional[str] = None,
    status: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    _user=Depends(require_role(["ANALYST", "ADMIN", "COMPLIANCE"])),
) -> Dict[str, Any]:
    """
    Lấy danh sách cảnh báo

    - **limit**: Số lượng cảnh báo tối đa trả về
    - **offset**: Vị trí bắt đầu
    - **alert_type**: Loại cảnh báo để lọc (FRAUD_DETECTED, SYSTEM_ERROR, etc.)
    - **status**: Trạng thái cảnh báo để lọc (open, investigating, resolved, false_positive)
    - **start_date**: Ngày bắt đầu lọc theo thời gian tạo (ISO 8601)
    - **end_date**: Ngày kết thúc lọc theo thời gian tạo (ISO 8601)
    """
    try:
        if not is_db_enabled():
            raise HTTPException(status_code=503, detail="Database is not enabled")

        if limit < 1 or limit > 200:
            raise HTTPException(status_code=400, detail="limit must be between 1 and 200") 
        if offset < 0: 
            raise HTTPException(status_code=400, detail="offset must be >= 0")

        conditions = []
        params = []
        param_idx = 1

        if alert_type: 
            conditions.append(f"type = ${param_idx}")
            params.append(alert_type)
            param_idx += 1
        if status: 
            conditions.append(f"status = ${param_idx}")
            params.append(status)
            param_idx += 1

        start_dt = _parse_iso_utc(start_date, "start_date")
        end_dt = _parse_iso_utc(end_date, "end_date")
        if start_dt:
            conditions.append(f"created_at >= ${param_idx}")
            params.append(start_dt)
            param_idx += 1
        if end_dt:
            conditions.append(f"created_at <= ${param_idx}")
            params.append(end_dt)
            param_idx += 1

        where_clause = (" WHERE " + " AND ".join(conditions)) if conditions else ""

        conn = await acquire_connection()
        try:
            total = await conn.fetchval(
                f"SELECT COUNT(*) FROM alerts{where_clause}", *params
            )
            rows = await conn.fetch(
                f"SELECT * FROM alerts{where_clause} ORDER BY created_at DESC OFFSET ${param_idx} LIMIT ${param_idx + 1}",
                *params, offset, limit,
            )
        finally:
            await release_connection(conn)

        alerts = []
        for row in rows:
            alert = record_to_dict(row)
            alert["id"] = alert.get("alert_id")
            raw_details = alert.get("details")
            details: dict = raw_details if isinstance(raw_details, dict) else {}
            # Flatten các field quan trọng từ JSONB details lên top-level cho frontend
            alert.setdefault("risk_score",     details.get("risk_score", 0))
            alert.setdefault("amount",         details.get("amount", 0))
            alert.setdefault("transaction_id", details.get("transaction_id") or details.get("tx_id"))
            alert.setdefault("assigned_to",    details.get("assigned_to"))
            alerts.append(alert)

        return {
            "alerts": alerts,
            "total": total,
            "limit": limit,
            "offset": offset
        } 

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting alerts: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/alerts/stats")
async def get_alert_stats(_user=Depends(require_role(["ANALYST", "ADMIN", "COMPLIANCE"]))) -> Dict[str, Any]:
    """
    Lấy thống kê cảnh báo
    """
    try:
        if not is_db_enabled():
            raise HTTPException(status_code=503, detail="Database is not enabled")

        conn = await acquire_connection()
        try:
            total_alerts = await conn.fetchval("SELECT COUNT(*) FROM alerts")
            # Đếm các cảnh báo đang mở (open/investigating) — sau migration status đã chuẩn hóa
            active_alerts = await conn.fetchval(
                "SELECT COUNT(*) FROM alerts WHERE status IN ('open', 'investigating')"
            )

            today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
            resolved_today = await conn.fetchval(
                "SELECT COUNT(*) FROM alerts WHERE status = 'resolved' AND acknowledged_at >= $1",
                today_start,
            )

            type_rows = await conn.fetch(
                "SELECT type, COUNT(*) as count FROM alerts GROUP BY type"
            )
            severity_rows = await conn.fetch(
                "SELECT severity, COUNT(*) as count FROM alerts GROUP BY severity"
            )
        finally:
            await release_connection(conn)

        by_type = {row["type"] or "UNKNOWN": int(row["count"]) for row in type_rows}
        by_severity = {row["severity"] or "UNKNOWN": int(row["count"]) for row in severity_rows}

        return {
            "total_alerts": total_alerts,
            "active_alerts": active_alerts,
            "resolved_today": resolved_today,
            "by_type": by_type,
            "by_severity": by_severity,
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting alert stats: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/alerts/analysts")
async def get_analysts(_user=Depends(require_role(["ANALYST", "ADMIN", "COMPLIANCE"]))) -> Dict[str, Any]:
    """Lấy danh sách analyst và admin để phân công xử lý cảnh báo."""
    try:
        if not is_db_enabled():
            return {"analysts": []}

        conn = await acquire_connection()
        try:
            rows = await conn.fetch(
                "SELECT email, full_name FROM users WHERE role IN ('ANALYST', 'ADMIN') AND is_active = TRUE ORDER BY full_name"
            )
        finally:
            await release_connection(conn)

        analysts = [
            {"email": r["email"], "full_name": r["full_name"] or r["email"]}
            for r in rows
        ]
        return {"analysts": analysts}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching analysts: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/alerts/{alert_id}")
async def get_alert(alert_id: str, _user=Depends(require_role(["ANALYST", "ADMIN", "COMPLIANCE"]))) -> Dict[str, Any]:
    """
    Lấy chi tiết một cảnh báo

    - **alert_id**: ID của cảnh báo
    """
    try:
        if not is_db_enabled():
            raise HTTPException(status_code=503, detail="Database is not enabled")

        conn = await acquire_connection()
        try:
            row = await conn.fetchrow("SELECT * FROM alerts WHERE alert_id = $1", alert_id)
        finally:
            await release_connection(conn)

        if row is None:
            raise HTTPException(status_code=404, detail="Alert not found")

        alert = record_to_dict(row)
        alert["id"] = alert.get("alert_id")
        raw_details = alert.get("details")
        details: dict = raw_details if isinstance(raw_details, dict) else {}
        # Flatten các field quan trọng từ JSONB details lên top-level cho frontend
        alert.setdefault("risk_score",     details.get("risk_score", 0))
        alert.setdefault("amount",         details.get("amount", 0))
        alert.setdefault("transaction_id", details.get("transaction_id") or details.get("tx_id"))
        alert.setdefault("assigned_to",    details.get("assigned_to"))
        return alert

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting alert {alert_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.post("/alerts/{alert_id}/acknowledge")
async def acknowledge_alert(alert_id: str, body: AcknowledgeRequest, user=Depends(require_role(["ANALYST", "ADMIN"]))) -> Dict[str, Any]:
    """
    Xác nhận đã xử lý cảnh báo

    - **alert_id**: ID của cảnh báo
    - **body.action**: "ignore" | "resolve" | "mark_fraud" | "mark_legit"
    """
    action_to_status = {
        "ignore":     "false_positive",
        "resolve":    "resolved",
        "mark_fraud": "confirmed_fraud",
        "mark_legit": "false_positive",
    }
    new_status = action_to_status.get(body.action)
    if new_status is None:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid action '{body.action}'. Must be one of: ignore, resolve, mark_fraud, mark_legit.",
        )

    try:
        if not is_db_enabled():
            raise HTTPException(status_code=503, detail="Database is not enabled")

        now = utcnow()
        actor = user.get("email") or user.get("full_name", "unknown") if isinstance(user, dict) else getattr(user, "email", "unknown")
        metadata = {
            "action": body.action,
            "actioned_by": actor,
            "actioned_at": now.isoformat(),
        }
        conn = await acquire_connection()
        try:
            result = await conn.execute(
                """UPDATE alerts
                   SET status = $1, acknowledged_at = $2,
                       details = COALESCE(details, '{}'::jsonb) || $3::jsonb
                   WHERE alert_id = $4""",
                new_status, now, json.dumps(metadata), alert_id,
            )
        finally:
            await release_connection(conn)

        if result == "UPDATE 0":
            raise HTTPException(status_code=404, detail="Alert not found")

        return {
            "alert_id": alert_id,
            "status": new_status,
            "acknowledged_at": now.isoformat(),
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error acknowledging alert {alert_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.put("/alerts/{alert_id}/assign")
async def assign_alert(alert_id: str, body: Dict[str, Any], user=Depends(require_role(["ANALYST", "ADMIN"]))) -> Dict[str, Any]:
    """Phân công analyst xử lý cảnh báo."""
    assignee = (body.get("assignee") or "").strip()
    if not assignee:
        raise HTTPException(status_code=400, detail="Assignee is required")

    try:
        if not is_db_enabled():
            raise HTTPException(status_code=503, detail="Database is not enabled")

        now = utcnow()
        actor = user.get("email") or user.get("full_name", "unknown") if isinstance(user, dict) else getattr(user, "email", "unknown")
        conn = await acquire_connection()
        try:
            result = await conn.execute(
                """UPDATE alerts
                   SET details = jsonb_set(
                       jsonb_set(COALESCE(details, '{}'::jsonb), '{assigned_to}', $1::jsonb),
                       '{assigned_by}', $2::jsonb
                   )
                   WHERE alert_id = $3""",
                json.dumps(assignee), json.dumps(actor), alert_id,
            )
        finally:
            await release_connection(conn)

        if result == "UPDATE 0":
            raise HTTPException(status_code=404, detail="Alert not found")

        return {"alert_id": alert_id, "assigned_to": assignee, "assigned_by": actor, "assigned_at": now.isoformat()}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error assigning alert {alert_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/alerts/{alert_id}/comments")
async def get_alert_comments(alert_id: str, _user=Depends(require_role(["ANALYST", "ADMIN", "COMPLIANCE"]))) -> Dict[str, Any]:
    """Lấy danh sách comment của cảnh báo."""
    try:
        if not is_db_enabled():
            raise HTTPException(status_code=503, detail="Database is not enabled")

        conn = await acquire_connection()
        try:
            row = await conn.fetchrow(
                "SELECT details FROM alerts WHERE alert_id = $1", alert_id
            )
        finally:
            await release_connection(conn)

        if row is None:
            raise HTTPException(status_code=404, detail="Alert not found")

        raw_details = row["details"]
        details: dict = raw_details if isinstance(raw_details, dict) else {}
        comments = details.get("comments", [])
        return {"alert_id": alert_id, "comments": comments}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting comments for alert {alert_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.post("/alerts/{alert_id}/comments")
async def add_alert_comment(alert_id: str, body: Dict[str, Any], user=Depends(require_role(["ANALYST", "ADMIN", "COMPLIANCE"]))) -> Dict[str, Any]:
    """Thêm ghi chú điều tra vào cảnh báo."""
    text = (body.get("text") or "").strip()
    if not text:
        raise HTTPException(status_code=400, detail="Comment text is required")
    if len(text) > 1000:
        raise HTTPException(status_code=400, detail="Comment too long (max 1000 chars)")

    try:
        if not is_db_enabled():
            raise HTTPException(status_code=503, detail="Database is not enabled")

        now = utcnow()
        actor = user.get("email") or user.get("full_name", "unknown") if isinstance(user, dict) else getattr(user, "email", "unknown")
        comment = {"author": actor, "text": text, "created_at": now.isoformat()}

        conn = await acquire_connection()
        try:
            result = await conn.execute(
                """UPDATE alerts
                   SET details = jsonb_set(
                       COALESCE(details, '{}'::jsonb),
                       '{comments}',
                       COALESCE(details->'comments', '[]'::jsonb) || $1::jsonb
                   )
                   WHERE alert_id = $2""",
                json.dumps([comment]), alert_id,
            )
        finally:
            await release_connection(conn)

        if result == "UPDATE 0":
            raise HTTPException(status_code=404, detail="Alert not found")

        return {"alert_id": alert_id, "comment": comment}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error adding comment to alert {alert_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


# (get_analysts đã được chuyển lên trước /alerts/{alert_id} để tránh route shadowing)
