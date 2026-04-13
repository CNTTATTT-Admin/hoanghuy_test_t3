"""Transaction API Endpoints"""

import datetime
import hashlib
import json
import os
import time

from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from fastapi.responses import JSONResponse
from typing import Any, Dict, Optional
import logging
from uuid import uuid4

from db.database import (
    acquire_connection,
    release_connection,
    is_db_enabled,
    record_to_dict,
    utcnow,
)
from schemas.transaction import (
    AuthorizeRequest,
    AuthorizeResponse,
    ErrorResponse,
    TransactionCheckRequest,
    TransactionCheckResponse,
    TransactionRequest,
    TransactionResponse,
)
from services.fraud_detection import get_fraud_detection_service
from services.realtime_check_service import get_realtime_check_service
from core.redis_client import get_redis
from core.fraud_decision import make_fraud_decision, FraudDecision
from core.security import get_current_user, require_role
from core.metrics import (
    authorize_latency_seconds,
    blocked_transactions_total,
    fraud_probability_histogram,
    redis_cache_hits_total,
    redis_cache_misses_total,
    transactions_total,
)

logger = logging.getLogger(__name__)

# Flag module-level: đọc một lần khi import — tránh os.getenv() mỗi request
_KAFKA_ENABLED: bool = os.getenv("ENABLE_KAFKA", "false").lower() == "true"

router = APIRouter()
fraud_service = get_fraud_detection_service()
realtime_service = get_realtime_check_service()


@router.post(
    "/transactions/check",
    response_model=TransactionCheckResponse,
    responses={
        400: {"model": ErrorResponse},
        500: {"model": ErrorResponse},
    },
)
async def check_transaction(
    transaction: TransactionCheckRequest,
    background_tasks: BackgroundTasks,
    current_user: dict = Depends(require_role(["USER", "ANALYST", "ADMIN", "ML_ENGINEER"])),
) -> TransactionCheckResponse:
    """Production realtime fraud check endpoint integrated with ML realtime detector."""
    try:
        payload = transaction.dict()
        result = realtime_service.check_transaction(payload)
        # Gán transaction_id để alert có mã giao dịch hiển thị trên header bell
        if "transaction_id" not in result or not result["transaction_id"]:
            result["transaction_id"] = f"CHK-{uuid4().hex[:12].upper()}"
        background_tasks.add_task(persist_inference_history, "/transactions/check", payload, result)
        background_tasks.add_task(persist_alert_if_needed, "/transactions/check", payload, result)
        # Loại transaction_id trước khi trả response (schema không có field này)
        response_data = {k: v for k, v in result.items() if k != "transaction_id"}
        return TransactionCheckResponse(**response_data)
    except ValueError as e:
        logger.warning(f"Realtime check validation error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected error in realtime check: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


# ─── Hàm hỗ trợ Redis cho endpoint /authorize ────────────────────────────────

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


async def _check_rate_limit(name_orig: str, redis) -> tuple[bool, int]:
    """Kiểm tra rate limit theo cửa sổ 1 phút cho user.

    Key: "ratelimit:{name_orig}:{YYYY-MM-DD:HH:MM}" — cửa sổ 1 phút.
    Logic:
      count = INCR key
      if count == 1: EXPIRE key 60
      if count > 10: return (False, 60)  → VELOCITY_ABUSE
    Trả về (True, 0) nếu OK, (False, 60) nếu vượt giới hạn.
    Nếu redis=None: luôn trả về (True, 0) — không rate limit khi Redis down.
    """
    if redis is None:
        return True, 0
    try:
        window = datetime.datetime.utcnow().strftime("%Y-%m-%d:%H:%M")
        key = f"ratelimit:{name_orig}:{window}"
        count = await redis.incr(key)
        if count == 1:
            await redis.expire(key, 60)  # TTL bắt buộc — không để key tồn tại vĩnh viễn
        if count > 10:
            return False, 60
        return True, 0
    except Exception as exc:
        logger.debug("Rate limit check lỗi, bỏ qua: %s", exc)
        return True, 0  # graceful degradation: nếu Redis lỗi → cho phép


# ─── Hàm hỗ trợ cho endpoint /authorize ─────────────────────────────────────

def _rule_based_precheck(tx: dict) -> dict | None:
    """Kiểm tra nhanh các trường hợp gian lận rõ ràng mà không cần ML.

    Trả về dict chứa fraud_probability, risk_level, block, reason và triggered_by
    nếu rule được kích hoạt; trả về None nếu không match rule nào → cần chạy ML.
    """
    # Lấy giá trị chuỗi thuần — xử lý cả trường hợp là str Enum (Pydantic dict())
    type_raw = tx.get("type", "")
    tx_type = str(getattr(type_raw, "value", type_raw)).upper()

    amount = float(tx.get("amount", 0))
    old_bal_org = float(tx.get("oldbalanceOrg", 0))
    new_bal_orig = float(tx.get("newbalanceOrig", -1))
    old_bal_dest = float(tx.get("oldbalanceDest", -1))
    name_dest = str(tx.get("nameDest", ""))

    # Rule 0: Số tiền vượt quá số dư tài khoản nguồn — không đủ tiền
    # Áp dụng cho TRANSFER, CASH_OUT, PAYMENT (các loại rút/chuyển tiền)
    if (
        tx_type in ("TRANSFER", "CASH_OUT", "PAYMENT")
        and amount > 0
        and old_bal_org >= 0
        and amount > old_bal_org
    ):
        return {
            "fraud_probability": 0.95,
            "risk_level": "HIGH",
            "block": True,
            "reason": f"Số tiền ({amount:,.0f}) vượt quá số dư tài khoản nguồn ({old_bal_org:,.0f})",
            "triggered_by": "RULE_INSUFFICIENT_BALANCE",
        }

    # Rule 1: Chuyển khoản 0 đồng — có thể là probe attack
    if amount == 0 and tx_type == "TRANSFER":
        return {
            "fraud_probability": 0.95,
            "risk_level": "HIGH",
            "block": True,
            "reason": "Zero-amount transfer",
            "triggered_by": "RULE_ZERO_AMOUNT",
        }

    # Rule 2: Tài khoản nguồn về 0 sau TRANSFER — dấu hiệu rút toàn bộ
    if (
        tx_type == "TRANSFER"
        and old_bal_org == amount
        and new_bal_orig == 0.0
    ):
        return {
            "fraud_probability": 0.85,
            "risk_level": "HIGH",
            "block": False,  # flag HIGH nhưng để ML/threshold quyết định
            "reason": "Origin balance fully drained in transfer",
            "triggered_by": "RULE_DRAIN_ORIGIN",
        }

    # Rule 3: Tài khoản đích bắt đầu bằng 'C', số dư ban đầu = 0, amount lớn
    if (
        name_dest.startswith("C")
        and old_bal_dest == 0.0
        and amount > 100_000
    ):
        return {
            "fraud_probability": 0.80,
            "risk_level": "HIGH",
            "block": False,
            "reason": "Large transfer to new zero-balance account",
            "triggered_by": "RULE_NEW_DEST_LARGE",
        }

    return None


async def _produce_kafka_audit(
    transaction_id: str,
    request_id: str,
    payload: dict,
    is_fraud: bool,
    fraud_probability: float,
    risk_level: str,
    latency_ms: float,
    triggered_by: str,
) -> None:
    """Background task: produce AuditEvent lên Kafka 'transactions.audit'.

    Fire-and-forget — không raise exception, không block /authorize.
    Chỉ thực thi khi ENABLE_KAFKA=true; bỏ qua hoàn toàn khi Kafka tắt.
    """
    if not _KAFKA_ENABLED:
        return
    try:
        from datetime import timezone as _tz

        from kafka.producer import AuditEvent, get_producer  # pylint: disable=import-outside-toplevel

        producer = await get_producer()
        if producer is None:
            return
        event = AuditEvent(
            transaction_id=transaction_id,
            timestamp=datetime.datetime.now(tz=_tz.utc),
            name_orig_hash=hashlib.sha256(
                str(payload.get("nameOrig", "")).encode()
            ).hexdigest(),
            name_dest_hash=hashlib.sha256(
                str(payload.get("nameDest", "")).encode()
            ).hexdigest(),
            amount=float(payload.get("amount", 0.0)),
            tx_type=str(
                getattr(payload.get("type", "UNKNOWN"), "value",
                        payload.get("type", "UNKNOWN"))
            ),
            is_fraud=is_fraud,
            fraud_probability=round(fraud_probability, 6),
            risk_level=risk_level,
            latency_ms=round(latency_ms, 2),
            triggered_by=triggered_by,
            request_id=request_id,
        )
        await producer.produce_audit(event)
    except Exception as exc:
        logger.debug("_produce_kafka_audit lỗi (bỏ qua): %s", exc)


async def _audit_log_decision(
    transaction_id: str,
    decision: str,
    fraud_probability: float,
    risk_level: str,
    tx: dict,
    triggered_by: str,
) -> None:
    """Ghi một JSON-line vào logs/fraud_audit.log (bất đồng bộ, fire-and-forget).

    Bảo mật: nameOrig và nameDest được hash SHA-256 trước khi ghi, không log raw.
    """
    try:
        # Xác định đường dẫn file log
        _project_root = os.path.normpath(
            os.path.join(os.path.dirname(__file__), "..", "..", "..")
        )
        log_path = os.path.join(_project_root, "logs", "fraud_audit.log")
        os.makedirs(os.path.dirname(log_path), exist_ok=True)

        # Hash thông tin nhận dạng trước khi lưu (bảo vệ PII)
        def _sha256(value: str) -> str:
            return hashlib.sha256(value.encode("utf-8")).hexdigest()

        record = {
            "event": "AUTHORIZE",
            "timestamp": datetime.datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ"),
            "transaction_id": transaction_id,
            "decision": decision,
            "fraud_probability": round(fraud_probability, 6),
            "risk_level": risk_level,
            "name_orig_hash": _sha256(str(tx.get("nameOrig", ""))),
            "name_dest_hash": _sha256(str(tx.get("nameDest", ""))),
            "amount": float(tx.get("amount", 0)),
            "triggered_by": triggered_by,
        }

        with open(log_path, "a", encoding="utf-8") as f:
            f.write(json.dumps(record, ensure_ascii=False) + "\n")
    except Exception as exc:
        logger.warning("Audit log write failed: %s", exc)


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


@router.post(
    "/transactions/authorize",
    responses={
        200: {"model": AuthorizeResponse},
        403: {"model": AuthorizeResponse},
        400: {"model": ErrorResponse},
        500: {"model": ErrorResponse},
    },
)
async def authorize_transaction(
    transaction: AuthorizeRequest,
    background_tasks: BackgroundTasks,
    current_user: dict = Depends(require_role(["ANALYST", "ADMIN"])),
) -> JSONResponse:
    """Endpoint chặn/cho phép giao dịch real-time TRƯỚC khi thực thi.

    Critical path (< 100ms):
      [1] Redis: kiểm tra decision cache (nếu ENABLE_REDIS_CACHE=true)
      [2] Redis: kiểm tra rate limit (nếu ENABLE_REDIS_RATELIMIT=true)
      [3] Rule-based pre-filter — không cần ML
      [4] ML inference: RealtimeFraudDetector.predict()
      [5] Áp dụng threshold → ALLOW hoặc BLOCK
      → BackgroundTask: audit log + persist
    """
    t0 = time.perf_counter()

    payload = transaction.dict()
    # Tạo ID duy nhất cho giao dịch này
    transaction_id = f"TXN-{uuid4().hex[:12].upper()}"
    reference_id = f"FD-{uuid4().hex[:8].upper()}"

    # Lấy chuỗi type để trả về trong response
    _type_raw = payload.get("type")
    _tx_type_val: str | None = str(getattr(_type_raw, "value", _type_raw)) if _type_raw else None

    fraud_probability: float = 0.0
    triggered_by: str = "ML_MODEL"
    rule_result: dict | None = None

    # Lấy Redis client (singleton) — None nếu ENABLE_REDIS=false hoặc không kết nối được
    redis = await get_redis()

    try:
        # ── [1] Redis decision cache ──────────────────────────────────────
        cached = await _get_cached_decision(payload, redis)
        if cached is not None:
            logger.debug("Cache hit cho transaction_id=%s", transaction_id)
            return JSONResponse(
                status_code=403 if not cached.get("authorized") else 200,
                content=cached,
            )

        # ── [2] Rate limit check ──────────────────────────────────────────
        rate_ok, retry_after = await _check_rate_limit(
            str(payload.get("nameOrig", "")), redis
        )
        if not rate_ok:
            fraud_probability = 1.0
            triggered_by = "VELOCITY_ABUSE"
            block_resp = {
                "authorized": False,
                "transaction_id": transaction_id,
                "block_reason": "VELOCITY_ABUSE: quá nhiều giao dịch trong 1 phút",
                "risk_level": "HIGH",
                "fraud_probability": fraud_probability,
                "type": _tx_type_val,
                "retry_after_seconds": retry_after,
                "recommendations": [
                    "Tài khoản bị tạm khóa do vượt giới hạn giao dịch",
                    "Liên hệ ngân hàng để được hỗ trợ",
                ],
                "reference_id": reference_id,
            }
            background_tasks.add_task(
                _audit_log_decision,
                transaction_id, "BLOCK", fraud_probability, "HIGH",
                payload, triggered_by,
            )
            elapsed_ms = (time.perf_counter() - t0) * 1000
            if elapsed_ms > 80:
                logger.warning("Authorize endpoint slow: %.1f ms (VELOCITY_ABUSE)", elapsed_ms)
            background_tasks.add_task(
                _produce_kafka_audit,
                transaction_id, reference_id, payload,
                True, fraud_probability, "HIGH", elapsed_ms, triggered_by,
            )
            return JSONResponse(status_code=429, content=block_resp,
                                headers={"Retry-After": str(retry_after)})

        # ── [3] Rule-based pre-filter ─────────────────────────────────────
        rule_result = _rule_based_precheck(payload)
        if rule_result is not None:
            fraud_probability = rule_result["fraud_probability"]
            triggered_by = rule_result["triggered_by"]

            # Rule chặn ngay (block=True) → trả 403 không cần ML
            if rule_result.get("block"):
                block_resp = {
                    "authorized": False,
                    "transaction_id": transaction_id,
                    "block_reason": rule_result["reason"],
                    "risk_level": rule_result["risk_level"],
                    "fraud_probability": fraud_probability,
                    "type": _tx_type_val,
                    "recommendations": [
                        "Kiểm tra lại số tiền giao dịch",
                        "Liên hệ ngân hàng nếu giao dịch hợp lệ",
                    ],
                    "reference_id": reference_id,
                }
                background_tasks.add_task(
                    _audit_log_decision,
                    transaction_id, "BLOCK", fraud_probability, rule_result["risk_level"],
                    payload, triggered_by,
                )
                elapsed_ms = (time.perf_counter() - t0) * 1000
                if elapsed_ms > 80:
                    logger.warning("Authorize endpoint slow: %.1f ms (RULE_BLOCK)", elapsed_ms)
                background_tasks.add_task(
                    _produce_kafka_audit,
                    transaction_id, reference_id, payload,
                    True, fraud_probability, rule_result["risk_level"],
                    elapsed_ms, triggered_by,
                )
                return JSONResponse(status_code=403, content=block_resp)
            # Rule không chặn ngay nhưng đã có fraud_probability cao → tiếp tục dùng threshold

        # ── [4] ML inference ──────────────────────────────────────────────
        if rule_result is None:
            # Chỉ gọi ML khi không có rule nào match
            # Chuẩn hóa type: xử lý cả str Enum từ Pydantic dict()
            type_raw = payload["type"]
            type_str = str(getattr(type_raw, "value", type_raw))
            ml_payload = {
                "step": payload["step"],
                "type": type_str,
                "amount": payload["amount"],
                "nameOrig": payload["nameOrig"],
                "nameDest": payload["nameDest"],
                "oldbalanceOrg": payload["oldbalanceOrg"],
                "oldbalanceDest": payload["oldbalanceDest"],
            }
            ml_result = realtime_service.detector.predict(ml_payload)
            fraud_probability = float(ml_result.get("fraud_probability", ml_result.get("risk_score", 0.0)))
            triggered_by = "ML_MODEL"

        # ── [5] Decision Layer — tách biệt khỏi model ML ─────────────────
        # Tính risk_level trước để truyền vào decision layer
        if fraud_probability >= 0.90:
            risk_level_str = "HIGH"
        elif fraud_probability >= 0.70:
            risk_level_str = "MEDIUM"
        elif fraud_probability >= 0.50:
            risk_level_str = "MEDIUM"
        else:
            risk_level_str = "LOW"

        fd_result = make_fraud_decision(fraud_probability, risk_level_str)
        _tx_type_str = str(getattr(payload.get("type", "UNKNOWN"), "value", payload.get("type", "UNKNOWN")))

        elapsed_ms = (time.perf_counter() - t0) * 1000
        if elapsed_ms > 80:
            logger.warning("Authorize endpoint slow: %.1f ms (decision-layer-check)", elapsed_ms)

        if fd_result.should_block:
            # ── BLOCKED → HTTP 403 ──────────────────────────────────────────
            block_resp = {
                "authorized": False,
                "transaction_id": transaction_id,
                "block_reason": fd_result.block_reason,
                "risk_level": risk_level_str,
                "fraud_probability": round(fraud_probability, 6),
                "decision": FraudDecision.BLOCKED,
                "type": _tx_type_val,
                "recommendations": [
                    "Liên hệ ngân hàng để xác minh giao dịch",
                    "Kiểm tra tài khoản nếu bạn không thực hiện giao dịch này",
                    "Đổi mật khẩu và mã PIN ngay nếu nghi ngờ bị lộ",
                ],
                "reference_id": reference_id,
            }
            # Lưu vào cache để tránh re-compute nếu retry
            await _cache_decision(payload, block_resp, redis)
            # Ghi Prometheus metrics cho BLOCK decision
            transactions_total.labels(tx_type=_tx_type_str, risk_level=risk_level_str, decision="BLOCK").inc()
            blocked_transactions_total.labels(block_reason=triggered_by).inc()
            background_tasks.add_task(
                _audit_log_decision,
                transaction_id, "BLOCKED", fraud_probability, risk_level_str,
                payload, triggered_by,
            )
            background_tasks.add_task(
                persist_inference_history,
                "/transactions/authorize",
                payload,
                {"is_fraud": True, "fraud_probability": fraud_probability,
                 "risk_score": fraud_probability, "risk_level": risk_level_str,
                 "decision": "BLOCKED", "transaction_id": transaction_id},
            )
            background_tasks.add_task(
                _emit_block_alert,
                payload, fraud_probability, transaction_id,
            )
            elapsed_ms = (time.perf_counter() - t0) * 1000
            background_tasks.add_task(
                _produce_kafka_audit,
                transaction_id, reference_id, payload,
                True, fraud_probability, risk_level_str, elapsed_ms, triggered_by,
            )
            return JSONResponse(status_code=403, content=block_resp)

        # ── APPROVED / PENDING ──────────────────────────────────────────────
        allow_resp: dict = {
            "authorized": (fd_result.decision == FraudDecision.APPROVED),
            "transaction_id": transaction_id,
            "risk_score": round(fraud_probability, 6),
            "risk_level": risk_level_str,
            "fraud_probability": round(fraud_probability, 6),
            "decision": fd_result.decision,
            "type": _tx_type_val,
        }
        if fd_result.requires_review:
            allow_resp["flagged_for_review"] = True
            allow_resp["review_reason"] = fd_result.review_reason

        # Lưu vào cache để tránh re-compute nếu retry
        await _cache_decision(payload, allow_resp, redis)
        # Ghi Prometheus metrics cho ALLOW/PENDING decision
        transactions_total.labels(tx_type=_tx_type_str, risk_level=risk_level_str, decision="ALLOW").inc()

        background_tasks.add_task(
            _audit_log_decision,
            transaction_id, fd_result.decision.value, fraud_probability, risk_level_str,
            payload, triggered_by,
        )
        background_tasks.add_task(
            persist_inference_history,
            "/transactions/authorize",
            payload,
            {"is_fraud": fd_result.requires_review, "fraud_probability": fraud_probability,
             "risk_score": fraud_probability, "risk_level": risk_level_str,
             "decision": fd_result.decision.value, "transaction_id": transaction_id},
        )

        elapsed_ms = (time.perf_counter() - t0) * 1000
        authorize_latency_seconds.observe(elapsed_ms / 1000)  # Ghi tổng latency /authorize (tính bằng giây)
        if elapsed_ms > 80:
            logger.warning("Authorize endpoint slow: %.1f ms (ALLOW/PENDING)", elapsed_ms)
        background_tasks.add_task(
            _produce_kafka_audit,
            transaction_id, reference_id, payload,
            False, fraud_probability, risk_level_str, elapsed_ms, triggered_by,
        )
        return JSONResponse(status_code=200, content=allow_resp)

    except ValueError as e:
        logger.warning("Authorize validation error: %s", e)
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error("Unexpected error in authorize: %s", e)
        raise HTTPException(status_code=500, detail="Internal server error")


@router.post(
    "/detect-fraud",
    response_model=TransactionResponse,
    responses={
        400: {"model": ErrorResponse},
        500: {"model": ErrorResponse}
    }
)
async def detect_fraud(
    transaction: TransactionRequest,
    background_tasks: BackgroundTasks,
    current_user: dict = Depends(require_role(["USER", "ANALYST", "ADMIN", "ML_ENGINEER"])),
) -> TransactionResponse:
    """
    Phát hiện gian lận cho một giao dịch

    - **transaction**: Thông tin giao dịch cần kiểm tra
    - **return**: Kết quả phân tích gian lận với giải thích chi tiết
    """
    try:
        # Convert Pydantic model to dict
        transaction_dict = transaction.dict()

        # Add background task for additional processing if needed
        background_tasks.add_task(log_transaction, transaction_dict)

        # Detect fraud
        result = fraud_service.detect_fraud(transaction_dict)

        # Áp dụng decision layer — giống /transactions/check
        fraud_prob = _extract_risk_score(result)
        risk_level = _extract_risk_level(result)
        fd = make_fraud_decision(fraud_prob, risk_level)
        result["decision"]       = fd.decision.value
        result["should_block"]   = fd.should_block
        result["requires_review"] = fd.requires_review
        result["block_reason"]   = fd.block_reason
        result["review_reason"]  = fd.review_reason

        background_tasks.add_task(persist_inference_history, "/detect-fraud", transaction_dict, result)
        background_tasks.add_task(persist_alert_if_needed, "/detect-fraud", transaction_dict, result)

        # Convert to response model
        response = TransactionResponse(**result)

        logger.info(f"Fraud detection API called for transaction {transaction.nameOrig}")
        return response

    except ValueError as e:
        logger.warning(f"Validation error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected error in fraud detection: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.post("/batch-detect-fraud")
async def batch_detect_fraud(
    transactions: list[TransactionRequest],
    background_tasks: BackgroundTasks,
    current_user: dict = Depends(require_role(["ANALYST", "ADMIN"])),
) -> Dict[str, Any]:
    """
    Phát hiện gian lận cho nhiều giao dịch cùng lúc

    - **transactions**: Danh sách giao dịch cần kiểm tra
    - **return**: Kết quả phân tích cho tất cả giao dịch
    """
    try:
        if len(transactions) > 500:
            raise HTTPException(status_code=400, detail="Maximum 500 transactions per batch")

        results = []
        transaction_dicts: list[Dict[str, Any]] = []

        for transaction in transactions:
            transaction_dict = transaction.dict()
            transaction_dicts.append(transaction_dict)
            result = fraud_service.detect_fraud(transaction_dict)

            # Áp dụng decision layer — chặn giao dịch fraud cao
            fraud_prob = _extract_risk_score(result)
            risk_level = _extract_risk_level(result)
            fd = make_fraud_decision(fraud_prob, risk_level)
            result["decision"]       = fd.decision.value
            result["should_block"]   = fd.should_block
            result["requires_review"] = fd.requires_review
            result["block_reason"]   = fd.block_reason
            result["review_reason"]  = fd.review_reason

            results.append(result)

        # ĐỒNG BỘ: Persist alerts cho giao dịch gian lận TRƯỚC khi trả response
        # Đảm bảo notification bell cập nhật ngay khi frontend poll (sau 1.5s)
        for payload, result in zip(transaction_dicts, results):
            if result.get("is_fraud") is True:
                await persist_alert_if_needed("/batch-detect-fraud", payload, result)

        # BACKGROUND: Persist inference history (không gọi persist_alert lại — đã làm đồng bộ ở trên)
        background_tasks.add_task(log_batch_transactions, transaction_dicts)
        background_tasks.add_task(
            persist_batch_inference_history,
            "/batch-detect-fraud",
            transaction_dicts,
            results,
            False,  # persist_alerts=False — tránh tạo alert trùng lặp
        )

        return {
            "total_transactions": len(transactions),
            "results": results,
            "processed_at": "now"
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in batch fraud detection: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/health")
async def health_check() -> Dict[str, Any]:
    """
    Kiểm tra trạng thái service

    - **return**: Trạng thái của các components
    """
    try:
        status = fraud_service.get_service_status()
        return status
    except Exception as e:
        logger.error(f"Error in health check: {str(e)}")
        return {
            "status": "unhealthy",
            "error": str(e)
        }

@router.post("/admin/reload-model")
async def reload_model() -> Dict[str, Any]:
    """
    Reload ML model artifacts từ disk mà không cần restart server.
    Dùng sau khi retrain model.
    """
    try:
        realtime_service.reload_model()
        return {"status": "ok", "message": "Model reloaded successfully"}
    except Exception as e:
        logger.error(f"Error reloading model: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/stats")
async def get_stats() -> Dict[str, Any]:
    """
    Lấy thống kê về hoạt động của service từ DB (inference_history),
    bao gồm dữ liệu hôm qua để tính % thay đổi realtime trên Dashboard.
    """
    _fallback = {
        "total_requests": 0, "fraud_detected": 0,
        "today_requests": 0, "today_fraud": 0,
        "yesterday_requests": 0, "yesterday_fraud": 0,
        "avg_risk_score": 0, "yesterday_avg_risk": 0,
        "risk_distribution": {"LOW": 0, "MEDIUM": 0, "HIGH": 0},
        "average_processing_time": 0, "uptime": "unknown",
    }
    if not is_db_enabled():
        return _fallback

    try:
        conn = await acquire_connection()
        try:
            today_start     = utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
            yesterday_start = today_start - datetime.timedelta(days=1)

            total = await conn.fetchval("SELECT COUNT(*) FROM inference_history") or 0
            fraud = await conn.fetchval("SELECT COUNT(*) FROM inference_history WHERE is_fraud = TRUE") or 0

            today_total = await conn.fetchval(
                "SELECT COUNT(*) FROM inference_history WHERE created_at >= $1", today_start
            ) or 0
            today_fraud = await conn.fetchval(
                "SELECT COUNT(*) FROM inference_history WHERE is_fraud = TRUE AND created_at >= $1", today_start
            ) or 0
            today_avg = await conn.fetchval(
                "SELECT COALESCE(AVG(risk_score), 0) FROM inference_history WHERE created_at >= $1", today_start
            ) or 0

            yesterday_total = await conn.fetchval(
                "SELECT COUNT(*) FROM inference_history WHERE created_at >= $1 AND created_at < $2",
                yesterday_start, today_start,
            ) or 0
            yesterday_fraud = await conn.fetchval(
                "SELECT COUNT(*) FROM inference_history WHERE is_fraud = TRUE AND created_at >= $1 AND created_at < $2",
                yesterday_start, today_start,
            ) or 0
            yesterday_avg = await conn.fetchval(
                "SELECT COALESCE(AVG(risk_score), 0) FROM inference_history WHERE created_at >= $1 AND created_at < $2",
                yesterday_start, today_start,
            ) or 0

            dist_rows = await conn.fetch(
                """SELECT UPPER(risk_level) as lvl, COUNT(*) as cnt
                   FROM inference_history
                   WHERE created_at >= $1 AND risk_level IS NOT NULL
                   GROUP BY risk_level""",
                today_start,
            )
            risk_distribution: Dict[str, int] = {"LOW": 0, "MEDIUM": 0, "HIGH": 0, "CRITICAL": 0}
            for row in dist_rows:
                key = str(row["lvl"]).upper()
                if key in risk_distribution:
                    risk_distribution[key] = int(row["cnt"])

            return {
                "total_requests":      total,
                "fraud_detected":      fraud,
                "today_requests":      today_total,
                "today_fraud":         today_fraud,
                "yesterday_requests":  yesterday_total,
                "yesterday_fraud":     yesterday_fraud,
                "avg_risk_score":      round(float(today_avg), 4),
                "yesterday_avg_risk":  round(float(yesterday_avg), 4),
                "risk_distribution":   risk_distribution,
                "average_processing_time": 0,
                "uptime": "running",
            }
        finally:
            await release_connection(conn)
    except Exception as e:
        logger.warning("Stats query failed: %s", e)
        return _fallback


@router.get("/stats/daily-trend")
async def get_daily_trend(days: int = 30) -> Dict[str, Any]:
    """
    Trả về số giao dịch gian lận và bình thường theo từng ngày trong N ngày qua.
    Dùng cho biểu đồ DetectionTrends trên Dashboard.
    """
    if days < 1 or days > 90:
        raise HTTPException(status_code=400, detail="days phải trong khoảng 1–90")
    if not is_db_enabled():
        return {"labels": [], "fraud": [], "normal": []}

    try:
        conn = await acquire_connection()
        try:
            since = utcnow().replace(hour=0, minute=0, second=0, microsecond=0) - datetime.timedelta(days=days - 1)
            rows = await conn.fetch(
                """
                SELECT
                    DATE(created_at AT TIME ZONE 'UTC') AS day,
                    COUNT(*) FILTER (WHERE is_fraud = TRUE)  AS fraud_count,
                    COUNT(*) FILTER (WHERE is_fraud = FALSE) AS normal_count
                FROM inference_history
                WHERE created_at >= $1
                GROUP BY day
                ORDER BY day ASC
                """,
                since,
            )
        finally:
            await release_connection(conn)

        date_map: Dict[str, Dict[str, int]] = {}
        for row in rows:
            key = str(row["day"])
            date_map[key] = {
                "fraud":  int(row["fraud_count"] or 0),
                "normal": int(row["normal_count"] or 0),
            }

        labels, fraud_list, normal_list = [], [], []
        for i in range(days):
            d = (utcnow() - datetime.timedelta(days=days - 1 - i)).date()
            key = str(d)
            dv = date_map.get(key, {"fraud": 0, "normal": 0})
            # Windows-compatible strftime (no %-d)
            short = d.strftime("%d/%m").lstrip("0") or "0"
            labels.append(short + "/" + d.strftime("%m") if False else d.strftime("%d/%m"))
            fraud_list.append(dv["fraud"])
            normal_list.append(dv["normal"])

        return {"labels": labels, "fraud": fraud_list, "normal": normal_list}

    except Exception as e:
        logger.warning("Daily trend query failed: %s", e)
        return {"labels": [], "fraud": [], "normal": []}


@router.get("/inference-history")
async def get_inference_history(
    today_only: bool = False,
    is_fraud: Optional[bool] = None,
    transaction_type: Optional[str] = None,
    sort_by: str = "created_at",
    sort_dir: str = "desc",
    limit: int = 100,
    offset: int = 0,
) -> Dict[str, Any]:
    """
    Lấy lịch sử inference từ bảng inference_history.
    Dùng cho modal chi tiết các thẻ thống kê trên Dashboard.
    """
    if not is_db_enabled():
        return {"transactions": [], "total": 0}
    if limit > 500:
        raise HTTPException(status_code=400, detail="limit tối đa 500")
    if sort_by not in ("created_at", "amount", "risk_score"):
        raise HTTPException(status_code=400, detail="sort_by không hợp lệ")
    if sort_dir not in ("asc", "desc"):
        raise HTTPException(status_code=400, detail="sort_dir không hợp lệ")

    try:
        today_start = utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
        conditions: list[str] = []
        params: list = []
        idx = 1

        if today_only:
            conditions.append(f"created_at >= ${idx}")
            params.append(today_start)
            idx += 1
        if is_fraud is not None:
            conditions.append(f"is_fraud = ${idx}")
            params.append(is_fraud)
            idx += 1
        if transaction_type:
            conditions.append(f"UPPER(transaction_type) = UPPER(${idx})")
            params.append(transaction_type)
            idx += 1

        where = (" WHERE " + " AND ".join(conditions)) if conditions else ""
        order = f"ORDER BY {sort_by} {sort_dir.upper()}"

        conn = await acquire_connection()
        try:
            total = await conn.fetchval(
                f"SELECT COUNT(*) FROM inference_history{where}", *params
            ) or 0
            rows = await conn.fetch(
                f"SELECT * FROM inference_history{where} {order} OFFSET ${idx} LIMIT ${idx + 1}",
                *params, offset, limit,
            )
        finally:
            await release_connection(conn)

        def map_row(doc: dict) -> dict:
            inp         = doc.get("input") or {}
            out         = doc.get("output") or {}
            amount      = float(doc.get("amount") or 0)
            old_balance = float(inp.get("oldbalanceOrg") or 0)
            new_balance = max(old_balance - amount, 0.0)
            name_orig   = str(inp.get("nameOrig") or inp.get("user_id") or doc.get("user_id") or "") or None
            name_dest   = str(inp.get("nameDest") or "") or None
            return {
                "id":               doc.get("request_id"),
                "user_id":          doc.get("user_id"),
                "type":             doc.get("transaction_type"),
                "amount":           amount,
                "old_balance":      old_balance,
                "new_balance":      new_balance,
                "is_fraud":         bool(doc.get("is_fraud")),
                "risk_score":       float(doc.get("risk_score") or 0),
                "risk_level":       (str(doc.get("risk_level") or "").upper()) or None,
                "reasons":          out.get("reasons") or [],
                "features":         inp,
                "timestamp":        str(doc.get("inference_timestamp") or doc.get("created_at") or ""),
                "created_at":       str(doc.get("created_at") or ""),
                # ── Trường cho detail view ───────────────────────────────
                "transaction_id":   out.get("transaction_id") or doc.get("request_id"),
                "name_orig":        name_orig,
                "name_dest":        name_dest,
                "decision":         out.get("decision"),
                "fraud_score":      float(doc.get("risk_score") or 0),
                "key_factors":      out.get("reasons") or [],
                "high_value_reason": _explain_high_value(amount),
            }

        transactions = [map_row(record_to_dict(r)) for r in rows]
        return {"transactions": transactions, "total": total}

    except HTTPException:
        raise
    except Exception as e:
        logger.error("inference-history error: %s", e)
        raise HTTPException(status_code=500, detail="Internal server error")

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


async def persist_inference_history(
    source_endpoint: str,
    payload: Dict[str, Any],
    result: Dict[str, Any],
) -> None:
    """Lưu một cặp request/response inference vào PostgreSQL."""
    if not is_db_enabled():
        return

    try:
        import json
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
