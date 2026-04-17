"""Alert persistence and inference history storage logic."""

import datetime
import logging
from typing import Any, Dict
from uuid import uuid4

from db.database import acquire_connection, release_connection, is_db_enabled, utcnow
from services.transaction_utils import (
    _extract_risk_score,
    _extract_risk_level,
    _extract_reasons,
    _extract_event_timestamp,
    _safe_float,
    _extract_user_id,
)

logger = logging.getLogger(__name__)


async def _emit_block_alert(tx_payload: dict, fraud_prob: float, transaction_id: str) -> None:
    """Lưu alert FRAUD_BLOCKED vào bảng alerts để frontend polling hiển thị
    thông báo trong thanh header.
    Không ném exception — lỗi chỉ được ghi log.
    """
    from datetime import timezone as _tz

    if not is_db_enabled():
        return
    details = {
        "tx_type":        str(getattr(tx_payload.get("type", ""), "value",
                                     tx_payload.get("type", ""))) or None,
        "amount":         float(tx_payload["amount"]) if tx_payload.get("amount") is not None else None,
        "name_orig":      str(tx_payload.get("nameOrig", "")) or None,
        "block_reason":   f"Tự động chặn: xác suất gian lận {fraud_prob:.1%}",
        "blocked_at":     datetime.datetime.now(_tz.utc).isoformat(),
        "transaction_id": transaction_id,
        "risk_score":     fraud_prob,
    }
    try:
        conn = await acquire_connection()
        try:
            await conn.execute(
                """
                INSERT INTO alerts
                    (alert_id, type, message, severity, status, source_endpoint,
                     timestamp, details, created_at, acknowledged_at)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                """,
                str(uuid4()),
                "FRAUD_BLOCKED",
                f"Giao dịch bị chặn tự động: xác suất gian lận {fraud_prob:.1%}",
                "high",
                "blocked",
                "/transactions/authorize",
                datetime.datetime.now(_tz.utc).isoformat(),
                details,
                datetime.datetime.now(_tz.utc),
                None,
            )
        finally:
            await release_connection(conn)
    except Exception as exc:
        logger.warning("_emit_block_alert failed: %s", exc)


async def persist_inference_history(
    source_endpoint: str,
    payload: Dict[str, Any],
    result: Dict[str, Any],
) -> None:
    """Lưu một cặp request/response inference vào PostgreSQL."""
    if not is_db_enabled():
        return

    try:
        conn = await acquire_connection()
        try:
            await conn.execute(
                """
                INSERT INTO inference_history
                    (request_id, source_endpoint, user_id, transaction_type, amount,
                     inference_timestamp, input, output, is_fraud, risk_score, risk_level, created_at)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
                """,
                str(uuid4()),
                source_endpoint,
                _extract_user_id(payload),
                str(getattr(payload.get("type", "UNKNOWN"), "value", payload.get("type", "UNKNOWN"))),
                _safe_float(payload.get("amount")),
                _extract_event_timestamp(payload),
                payload,
                result,
                result.get("is_fraud"),
                _extract_risk_score(result),
                _extract_risk_level(result),
                utcnow(),
            )
        finally:
            await release_connection(conn)
    except Exception as exc:
        logger.warning("Failed to persist inference history: %s", exc)


async def persist_alert_if_needed(
    source_endpoint: str,
    payload: Dict[str, Any],
    result: Dict[str, Any],
) -> None:
    """Lưu cảnh báo gian lận khi model phân loại giao dịch là fraud.

    - Nếu decision == BLOCKED (hoặc should_block == True): lưu type=FRAUD_BLOCKED, status=blocked
    - Các trường hợp gian lận khác: lưu type=FRAUD_DETECTED, status=open
    """
    if not is_db_enabled():
        return

    is_fraud = result.get("is_fraud")
    if is_fraud is not True:
        return

    try:
        conn = await acquire_connection()
        try:
            # Xác định type và status alert theo decision layer
            decision   = str(result.get("decision") or "").upper()
            should_block = result.get("should_block") is True
            is_blocked = (decision == "BLOCKED") or should_block

            alert_type   = "FRAUD_BLOCKED" if is_blocked else "FRAUD_DETECTED"
            alert_status = "blocked"       if is_blocked else "open"
            fraud_prob   = _extract_risk_score(result)

            # Lấy transaction_id từ result (authorize) hoặc payload (check)
            transaction_id = (
                result.get("transaction_id")
                or str(payload.get("transaction_id") or "")
                or None
            )
            block_reason = (
                result.get("block_reason")
                or (f"Tự động chặn: xác suất gian lận {fraud_prob:.1%}" if is_blocked else None)
            )
            details = {
                "transaction_id": transaction_id,
                "tx_type":        str(getattr(payload.get("type", "UNKNOWN"), "value", payload.get("type", "UNKNOWN"))),
                "amount":         _safe_float(payload.get("amount")),
                "risk_score":     fraud_prob,
                "risk_level":     _extract_risk_level(result),
                "nameOrig":       str(payload.get("nameOrig") or payload.get("user_id") or ""),
                "nameDest":       str(payload.get("nameDest") or ""),
                "reasons":        _extract_reasons(result),
                "block_reason":   block_reason,
                "blocked_at":     utcnow().isoformat() if is_blocked else None,
                "assigned_to":    None,
            }
            message = (
                f"Giao dịch bị chặn tự động: xác suất gian lận {fraud_prob:.1%}"
                if is_blocked
                else "Fraudulent transaction detected by realtime model"
            )
            await conn.execute(
                """
                INSERT INTO alerts
                    (alert_id, type, message, severity, status, source_endpoint,
                     timestamp, details, created_at, acknowledged_at)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                """,
                str(uuid4()),
                alert_type,
                message,
                "high" if _extract_risk_level(result) == "HIGH" else "medium",
                alert_status,
                source_endpoint,
                _extract_event_timestamp(payload),
                details,
                utcnow(),
                None,
            )
        finally:
            await release_connection(conn)
    except Exception as exc:
        logger.warning("Failed to persist fraud alert: %s", exc)


async def persist_batch_inference_history(
    source_endpoint: str,
    payloads: list[Dict[str, Any]],
    results: list[Dict[str, Any]],
    persist_alerts: bool = True,
) -> None:
    """Persist batch inference history as individual records.

    Args:
        persist_alerts: Set False khi gọi từ batch_detect_fraud — alerts đã được
                        persist đồng bộ trong endpoint để tránh tạo duplicate.
    """
    if len(payloads) != len(results):
        logger.warning("Batch persistence skipped due to payload/result size mismatch.")
        return

    for payload, result in zip(payloads, results):
        await persist_inference_history(source_endpoint, payload, result)
        if persist_alerts:
            await persist_alert_if_needed(source_endpoint, payload, result)
