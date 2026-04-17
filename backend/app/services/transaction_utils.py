"""Helper utilities shared across transaction API endpoints."""

import hashlib
import json
import logging
from typing import Any, Dict

from core.metrics import redis_cache_hits_total, redis_cache_misses_total
from db.database import utcnow

logger = logging.getLogger(__name__)


def _safe_float(value: Any, default: float = 0.0) -> float:
    try:
        if value is None:
            return default
        return float(value)
    except (TypeError, ValueError):
        return default


def _extract_event_timestamp(payload: Dict[str, Any]) -> str:
    raw = payload.get("timestamp")
    if isinstance(raw, str) and raw:
        return raw
    return utcnow().isoformat()


def _extract_user_id(payload: Dict[str, Any]) -> str:
    return str(payload.get("user_id") or payload.get("nameOrig") or "unknown")


def _extract_risk_level(result: Dict[str, Any]) -> str:
    if result.get("risk_level") is not None:
        return str(result.get("risk_level"))
    explanation = result.get("explanation", {})
    if isinstance(explanation, dict) and explanation.get("risk_level") is not None:
        return str(explanation.get("risk_level"))
    return "UNKNOWN"


def _extract_risk_score(result: Dict[str, Any]) -> float:
    if result.get("risk_score") is not None:
        return _safe_float(result.get("risk_score"))
    if result.get("fraud_score") is not None:
        return _safe_float(result.get("fraud_score"))
    if result.get("model_score") is not None:
        return _safe_float(result.get("model_score"))
    return 0.0


def _extract_reasons(result: Dict[str, Any]) -> list[str]:
    if isinstance(result.get("reasons"), list):
        return [str(reason) for reason in result.get("reasons", [])]

    explanation = result.get("explanation", {})
    if isinstance(explanation, dict) and isinstance(explanation.get("key_factors"), list):
        return [str(reason) for reason in explanation.get("key_factors", [])]

    return []


def _explain_high_value(amount: float | None) -> str | None:
    """Trả về cảnh báo nếu giao dịch có giá trị lớn (> 10 000 đơn vị)."""
    if not amount:
        return None
    if amount > 10_000:
        return f"Giá trị giao dịch {amount:,.0f} vượt ngưỡng cảnh báo giao dịch lớn."
    return None


def _build_transaction_detail(row: dict) -> dict:
    """
    Làm phẳng các trường từ JSONB 'explanation' ra top-level.
    Ưu tiên top-level column; fallback về JSONB nếu column trống.
    """
    explanation = row.get("explanation") or {}
    return {
        "transaction_id":    row.get("transaction_id"),
        "type":              row.get("type") or explanation.get("type"),
        "amount":            row.get("amount"),
        "name_orig":         row.get("name_orig") or explanation.get("name_orig"),
        "name_dest":         row.get("name_dest") or explanation.get("name_dest"),
        "fraud_score":       row.get("fraud_score"),
        "risk_level":        row.get("risk_level"),
        "decision":          row.get("decision"),
        "status":            row.get("status"),
        "key_factors":       explanation.get("key_factors") or [],
        "recommendations":   explanation.get("recommendations") or [],
        "high_value_reason": _explain_high_value(row.get("amount")),
        "processed_at":      str(row.get("processed_at") or ""),
    }


def _canonical_tx_key(tx: dict) -> str:
    """Tạo cache key duy nhất từ canonical JSON của giao dịch (sha256).

    Canonical JSON: sắp xếp key, không có khoảng trắng.
    """
    # Chỉ lấy các trường ảnh hưởng tới quyết định gian lận
    relevant = {
        k: (getattr(v, "value", v) if hasattr(v, "value") else v)
        for k, v in tx.items()
        if k in ("step", "type", "amount", "nameOrig", "nameDest",
                 "oldbalanceOrg", "newbalanceOrig", "oldbalanceDest", "newbalanceDest")
    }
    canonical = json.dumps(dict(sorted(relevant.items())), separators=(",", ":"))
    digest = hashlib.sha256(canonical.encode()).hexdigest()
    return f"decision:{digest}"


async def _get_cached_decision(tx: dict, redis) -> dict | None:
    """Kiểm tra decision cache trong Redis.

    Cache key: "decision:{sha256(canonical_json(tx))}"
    TTL: 60 giây.
    Use case: payment gateway retry khi timeout → không re-compute ML.
    Trả về cached result nếu hit, None nếu miss hoặc redis=None.
    """
    if redis is None:
        return None
    try:
        key = _canonical_tx_key(tx)
        raw = await redis.get(key)
        if raw is None:
            redis_cache_misses_total.inc()  # Cache miss — sẽ chạy ML inference
            return None
        redis_cache_hits_total.inc()        # Cache hit — trả kết quả cached
        return json.loads(raw)
    except Exception as exc:
        logger.debug("Cache get lỗi, bỏ qua: %s", exc)
        return None


async def _cache_decision(tx: dict, result: dict, redis) -> None:
    """Lưu kết quả quyết định vào Redis cache sau khi inference xong.

    Chỉ lưu nếu redis không None. TTL: 60 giây.
    """
    if redis is None:
        return
    try:
        key = _canonical_tx_key(tx)
        await redis.set(key, json.dumps(result, ensure_ascii=False), ex=60)
    except Exception as exc:
        logger.debug("Cache set lỗi, bỏ qua: %s", exc)


async def log_transaction(transaction: Dict[str, Any]):
    try:
        logger.info(f"Transaction logged: {transaction.get('nameOrig', 'unknown')}")
        # Here you could save to database, send to monitoring system, etc.
    except Exception as e:
        logger.error(f"Error logging transaction: {str(e)}")


async def log_batch_transactions(transactions: list[Dict[str, Any]]):
    """Background task để ghi log batch giao dịch"""
    try:
        logger.info(f"Batch transactions logged: {len(transactions)} transactions")
        # Here you could save to database, send to monitoring system, etc.
    except Exception as e:
        logger.error(f"Error logging batch transactions: {str(e)}")
