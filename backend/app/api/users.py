"""User API Endpoints"""

from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, Depends
from typing import Dict, Any, Optional
import logging

from db.database import (
    acquire_connection,
    release_connection,
    is_db_enabled,
    record_to_dict,
    utcnow,
)
from core.security import get_current_user, require_role
logger = logging.getLogger(__name__)

router = APIRouter()


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


def _estimate_user_risk_level(fraud_rate: float) -> str:
    if fraud_rate >= 0.3:
        return "high"
    if fraud_rate >= 0.1:
        return "medium"
    return "low"

@router.get("/users/{user_id}")
async def get_user(user_id: str, _user=Depends(require_role(["ANALYST", "ADMIN", "COMPLIANCE"]))) -> Dict[str, Any]:
    """
    Lấy thông tin người dùng

    - **user_id**: ID của người dùng
    """
    try:
        if not is_db_enabled():
            raise HTTPException(status_code=503, detail="Database is not enabled")

        conn = await acquire_connection()
        try:
            total_transactions = await conn.fetchval(
                "SELECT COUNT(*) FROM inference_history WHERE user_id = $1", user_id
            )
            fraud_transactions = await conn.fetchval(
                "SELECT COUNT(*) FROM inference_history WHERE user_id = $1 AND is_fraud = TRUE", user_id
            )
            latest = await conn.fetchrow(
                "SELECT * FROM inference_history WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1", user_id
            )
        finally:
            await release_connection(conn)

        if total_transactions == 0:
            raise HTTPException(status_code=404, detail="User not found")

        fraud_rate = float(fraud_transactions) / float(total_transactions)
        latest_dict = record_to_dict(latest) if latest else {}
        latest_ts = latest_dict.get("inference_timestamp") if latest_dict else None

        return {
            "id": user_id,
            "name": user_id,
            "email": None,
            "account_type": "standard",
            "risk_profile": _estimate_user_risk_level(fraud_rate),
            "created_at": latest_ts,
            "last_login": latest_ts,
            "stats": {
                "total_transactions": total_transactions,
                "fraud_transactions": fraud_transactions,
                "fraud_rate": round(fraud_rate, 4),
            },
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting user {user_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/users/{user_id}/transactions")
async def get_user_transactions(
    user_id: str,
    limit: int = 20,
    offset: int = 0,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    _user=Depends(require_role(["ANALYST", "ADMIN", "COMPLIANCE"]))
) -> Dict[str, Any]:
    """
    Lấy lịch sử giao dịch của người dùng

    - **user_id**: ID của người dùng
    - **limit**: Số lượng giao dịch tối đa
    - **offset**: Vị trí bắt đầu
    - **start_date**: Ngày bắt đầu (ISO format)
    - **end_date**: Ngày kết thúc (ISO format)
    """
    try:
        if not is_db_enabled():
            raise HTTPException(status_code=503, detail="Database is not enabled")

        start_dt = _parse_iso_utc(start_date, "start_date")
        end_dt = _parse_iso_utc(end_date, "end_date")

        conditions = ["user_id = $1"]
        params: list = [user_id]
        param_idx = 2

        if start_dt:
            conditions.append(f"created_at >= ${param_idx}")
            params.append(start_dt)
            param_idx += 1
        if end_dt:
            conditions.append(f"created_at <= ${param_idx}")
            params.append(end_dt)
            param_idx += 1

        where_clause = " WHERE " + " AND ".join(conditions)

        conn = await acquire_connection()
        try:
            total = await conn.fetchval(
                f"SELECT COUNT(*) FROM inference_history{where_clause}", *params
            )
            rows = await conn.fetch(
                f"SELECT * FROM inference_history{where_clause} ORDER BY created_at DESC OFFSET ${param_idx} LIMIT ${param_idx + 1}",
                *params, offset, limit,
            )
        finally:
            await release_connection(conn)

        transactions = []
        for row in rows:
            doc = record_to_dict(row)
            output = doc.get("output", {}) if isinstance(doc.get("output"), dict) else {}
            transaction = {
                "id": doc.get("request_id"),
                "amount": doc.get("amount"),
                "type": doc.get("transaction_type"),
                "timestamp": doc.get("inference_timestamp"),
                "status": "flagged" if doc.get("is_fraud") else "completed",
                "fraud_score": output.get("risk_score", output.get("fraud_score")),
                "risk_level": output.get("risk_level") or doc.get("risk_level"),
                "is_fraud": doc.get("is_fraud"),
            }
            transactions.append(transaction)

        return {
            "user_id": user_id,
            "transactions": transactions,
            "total": total,
            "limit": limit,
            "offset": offset
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting transactions for user {user_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/users/{user_id}/risk-profile")
async def get_user_risk_profile(user_id: str, _user=Depends(require_role(["ANALYST", "ADMIN", "COMPLIANCE"]))) -> Dict[str, Any]:
    """
    Lấy hồ sơ rủi ro của người dùng

    - **user_id**: ID của người dùng
    """
    try:
        if not is_db_enabled():
            raise HTTPException(status_code=503, detail="Database is not enabled")

        conn = await acquire_connection()
        try:
            rows = await conn.fetch(
                "SELECT * FROM inference_history WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50",
                user_id,
            )

            if not rows:
                profile_row = await conn.fetchrow(
                    "SELECT * FROM user_risk_profiles WHERE user_id = $1", user_id
                )
                if profile_row:
                    profile = record_to_dict(profile_row)
                    return profile.get("data", profile)
                raise HTTPException(status_code=404, detail="No risk profile found")

            docs = [record_to_dict(r) for r in rows]
            scores = [float(doc.get("risk_score", 0.0)) for doc in docs]
            avg_score = sum(scores) / len(scores) if scores else 0.0
            fraud_count = sum(1 for doc in docs if doc.get("is_fraud") is True)
            fraud_rate = fraud_count / len(docs)
            risk_level = _estimate_user_risk_level(fraud_rate)

            risk_profile = {
                "user_id": user_id,
                "overall_risk_score": round(avg_score, 4),
                "risk_level": risk_level,
                "risk_factors": [
                    {
                        "factor": "fraud_rate_recent_50",
                        "score": round(fraud_rate, 4),
                        "description": "Tỷ lệ giao dịch bị gắn cờ trong 50 giao dịch gần nhất",
                    },
                    {
                        "factor": "avg_risk_score_recent_50",
                        "score": round(avg_score, 4),
                        "description": "Điểm rủi ro trung bình 50 giao dịch gần nhất",
                    },
                ],
                "recommendations": [
                    "Tiếp tục theo dõi realtime" if risk_level == "low" else "Tăng cường xác minh giao dịch",
                    "Thiết lập cảnh báo theo user" if risk_level != "low" else "Duy trì ngưỡng hiện tại",
                ],
                "last_updated": utcnow().isoformat(),
            }

            import json
            await conn.execute(
                """
                INSERT INTO user_risk_profiles (user_id, data, updated_at)
                VALUES ($1, $2, $3)
                ON CONFLICT (user_id) DO UPDATE SET data = $2, updated_at = $3
                """,
                user_id, risk_profile, utcnow(),
            )
        finally:
            await release_connection(conn)

        return risk_profile

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting risk profile for user {user_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.post("/users/{user_id}/update-risk-profile")
async def update_user_risk_profile(user_id: str, updates: Dict[str, Any], _user=Depends(require_role(["ADMIN"]))) -> Dict[str, Any]:
    """
    Cập nhật hồ sơ rủi ro của người dùng

    - **user_id**: ID của người dùng
    - **updates**: Thông tin cập nhật
    """
    try:
        if not is_db_enabled():
            raise HTTPException(status_code=503, detail="Database is not enabled")

        now = utcnow()
        update_payload = {
            **updates,
            "user_id": user_id,
        }

        import json
        conn = await acquire_connection()
        try:
            await conn.execute(
                """
                INSERT INTO user_risk_profiles (user_id, data, updated_at)
                VALUES ($1, $2, $3)
                ON CONFLICT (user_id) DO UPDATE SET
                    data = user_risk_profiles.data || $2,
                    updated_at = $3
                """,
                user_id, update_payload, now,
            )
        finally:
            await release_connection(conn)

        return {
            "user_id": user_id,
            "status": "updated",
            "updated_fields": list(updates.keys()),
            "updated_at": now.isoformat()
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating risk profile for user {user_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")
