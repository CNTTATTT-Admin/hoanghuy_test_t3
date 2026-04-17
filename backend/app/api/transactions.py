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
from core.redis_client import get_redis, get_repeat_risk_bonus, get_repeat_count
from core.fraud_decision import (
    make_fraud_decision,
    make_fraud_decision_with_escalation,
    FraudDecision,
)
from core.security import get_current_user, require_role
from services.account_freeze_service import get_account_status, freeze_account
from core.metrics import (
    authorize_latency_seconds,
    blocked_transactions_total,
    fraud_probability_histogram,
    transactions_total,
)
from services.rate_limit import _check_rate_limit
from services.alert_service import (
    _emit_block_alert,
    persist_alert_if_needed,
    persist_batch_inference_history,
    persist_inference_history,
)
from services.transaction_utils import (
    _build_transaction_detail,
    _cache_decision,
    _canonical_tx_key,
    _explain_high_value,
    _extract_risk_level,
    _extract_risk_score,
    _extract_user_id,
    _get_cached_decision,
    log_batch_transactions,
    log_transaction,
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

        # ── Account freeze check ──────────────────────────────────────────
        user_id = str(payload.get("user_id", "anonymous"))
        account_status = await get_account_status(user_id)
        if account_status == "frozen":
            raise HTTPException(
                status_code=403,
                detail={
                    "error": "ACCOUNT_FROZEN",
                    "message": (
                        f"Tài khoản {user_id} đã bị đóng băng do nghi ngờ gian lận. "
                        "Liên hệ ADMIN để mở khóa."
                    ),
                    "account_status": "frozen",
                    "decision": "BLOCKED",
                },
            )

        # ── Rate limit check (per user_id) ────────────────────────────────
        redis = await get_redis()
        rate_ok, retry_after = await _check_rate_limit(user_id, redis)
        if not rate_ok:
            logger.warning("[RATE_LIMIT] /check user=%s BLOCKED — too many requests", user_id)
            raise HTTPException(
                status_code=429,
                detail="VELOCITY_ABUSE: quá nhiều giao dịch trong 1 phút",
                headers={"Retry-After": str(retry_after)},
            )

        result = realtime_service.check_transaction(payload)

        # ── Repeat risk escalation ────────────────────────────────────────
        raw_type = payload.get("type", "")
        tx_type_str = str(getattr(raw_type, "value", raw_type))
        receiver = str(payload.get("receiver_account", "") or "")
        repeat_bonus = await get_repeat_risk_bonus(
            user_id=user_id,
            amount=float(payload.get("amount", 0)),
            tx_type=tx_type_str,
            receiver=receiver,
        )
        repeat_count = await get_repeat_count(
            user_id=user_id,
            amount=float(payload.get("amount", 0)),
            tx_type=tx_type_str,
            receiver=receiver,
        )

        if repeat_bonus > 0:
            # Re-run decision with escalated risk
            base_fraud_prob = float(result.get("risk_score", 0))
            tx_hash = hashlib.sha256(
                json.dumps(payload, sort_keys=True, default=str).encode()
            ).hexdigest()[:16]
            escalated = await make_fraud_decision_with_escalation(
                fraud_probability=base_fraud_prob,
                risk_level=str(result.get("risk_level", "LOW")),
                repeat_risk_bonus=repeat_bonus,
                user_id=user_id,
                transaction_hash=tx_hash,
            )
            result["risk_score"] = escalated.fraud_probability
            result["risk_level"] = escalated.risk_level
            result["decision"] = escalated.decision.value
            result["should_block"] = escalated.should_block
            result["requires_review"] = escalated.requires_review
            result["block_reason"] = escalated.block_reason
            result["review_reason"] = escalated.review_reason
            result["is_fraud"] = escalated.should_block or escalated.fraud_probability >= 0.02

        # Thêm thông tin repeat risk vào response
        result["repeat_count"] = repeat_count
        result["repeat_risk_bonus"] = repeat_bonus
        result["base_risk_score"] = float(result.get("risk_score", 0)) * 100 if repeat_bonus == 0 else (float(result.get("risk_score", 0)) * 100 - repeat_bonus)
        result["final_risk_score"] = float(result.get("risk_score", 0)) * 100
        result["account_status"] = account_status

        # ── Auto-freeze: đóng băng tài khoản khi BLOCKED ─────────────────
        final_decision = str(result.get("decision", "")).upper()
        if final_decision == "BLOCKED" and account_status != "frozen":
            tx_hash_freeze = hashlib.sha256(
                json.dumps(payload, sort_keys=True, default=str).encode()
            ).hexdigest()[:16]
            freeze_ok = await freeze_account(
                user_id=user_id,
                fraud_probability=float(result.get("risk_score", 0)),
                reason=f"Auto-freeze: transaction BLOCKED (risk_score={result.get('risk_score', 0):.4f})",
                transaction_hash=tx_hash_freeze,
                triggered_by="SYSTEM_AUTO",
            )
            if freeze_ok:
                result["account_status"] = "frozen"

        # Gán transaction_id để alert có mã giao dịch hiển thị trên header bell
        if "transaction_id" not in result or not result["transaction_id"]:
            result["transaction_id"] = f"CHK-{uuid4().hex[:12].upper()}"
        background_tasks.add_task(persist_inference_history, "/transactions/check", payload, result)
        background_tasks.add_task(persist_alert_if_needed, "/transactions/check", payload, result)
        # Loại transaction_id trước khi trả response (schema không có field này)
        response_data = {k: v for k, v in result.items() if k != "transaction_id"}
        return TransactionCheckResponse(**response_data)
    except HTTPException:
        raise
    except ValueError as e:
        logger.warning(f"Realtime check validation error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected error in realtime check: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


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
            "fraud_probability": 0.92,
            "risk_level": "HIGH",
            "block": True,  # Thống nhất với RULE_DRAIN_ACCOUNT ở các service khác
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

    # ── Account freeze check ──────────────────────────────────────────
    name_orig = str(payload.get("nameOrig", ""))
    account_status = await get_account_status(name_orig)
    if account_status == "frozen":
        return JSONResponse(
            status_code=403,
            content={
                "authorized": False,
                "transaction_id": transaction_id,
                "block_reason": (
                    f"ACCOUNT_FROZEN: Tài khoản {name_orig} đã bị đóng băng "
                    "do nghi ngờ gian lận. Liên hệ ADMIN để mở khóa."
                ),
                "risk_level": "CRITICAL",
                "fraud_probability": 1.0,
                "decision": "BLOCKED",
                "account_status": "frozen",
                "reference_id": reference_id,
            },
        )

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

        # ── [5] Repeat risk escalation ────────────────────────────────────
        _auth_tx_type_str = str(getattr(payload.get("type", ""), "value", payload.get("type", "")))
        name_dest = str(payload.get("nameDest", ""))
        repeat_bonus = await get_repeat_risk_bonus(
            user_id=name_orig,
            amount=float(payload.get("amount", 0)),
            tx_type=_auth_tx_type_str,
            receiver=name_dest,
        )

        # ── [6] Decision Layer — tách biệt khỏi model ML ─────────────────
        # Tính risk_level trước để truyền vào decision layer
        if fraud_probability >= 0.90:
            risk_level_str = "HIGH"
        elif fraud_probability >= 0.70:
            risk_level_str = "MEDIUM"
        elif fraud_probability >= 0.50:
            risk_level_str = "MEDIUM"
        else:
            risk_level_str = "LOW"

        # Sử dụng decision with escalation nếu có repeat bonus
        if repeat_bonus > 0:
            tx_hash = hashlib.sha256(
                json.dumps(payload, sort_keys=True, default=str).encode()
            ).hexdigest()[:16]
            fd_result = await make_fraud_decision_with_escalation(
                fraud_probability=fraud_probability,
                risk_level=risk_level_str,
                repeat_risk_bonus=repeat_bonus,
                user_id=name_orig,
                transaction_hash=tx_hash,
            )
            fraud_probability = fd_result.fraud_probability
            risk_level_str = fd_result.risk_level
        else:
            fd_result = make_fraud_decision(fraud_probability, risk_level_str)

        _tx_type_str = str(getattr(payload.get("type", "UNKNOWN"), "value", payload.get("type", "UNKNOWN")))

        elapsed_ms = (time.perf_counter() - t0) * 1000
        if elapsed_ms > 80:
            logger.warning("Authorize endpoint slow: %.1f ms (decision-layer-check)", elapsed_ms)

        if fd_result.should_block:
            # ── BLOCKED → HTTP 403 ──────────────────────────────────────────
            # Auto-freeze tài khoản khi bị BLOCK
            if account_status != "frozen":
                freeze_tx_hash = hashlib.sha256(
                    json.dumps(payload, sort_keys=True, default=str).encode()
                ).hexdigest()[:16]
                freeze_ok = await freeze_account(
                    user_id=name_orig,
                    fraud_probability=fraud_probability,
                    reason=f"Auto-freeze: authorize BLOCKED (fraud_prob={fraud_probability:.4f})",
                    transaction_hash=freeze_tx_hash,
                    triggered_by="SYSTEM_AUTO",
                )

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
        # Persist alert for PENDING fraud (BLOCKED alerts already created via _emit_block_alert)
        if fd_result.requires_review:
            alert_result = {
                "is_fraud": True,
                "risk_score": fraud_probability,
                "risk_level": risk_level_str,
                "decision": fd_result.decision.value,
                "should_block": fd_result.should_block,
                "block_reason": fd_result.block_reason,
                "transaction_id": transaction_id,
                "reasons": [fd_result.review_reason or f"Fraud probability {fraud_probability:.1%}"],
            }
            background_tasks.add_task(
                persist_alert_if_needed, "/transactions/authorize", payload, alert_result,
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

        # ── Account freeze check ──────────────────────────────────────
        detect_user_id = str(transaction_dict.get("nameOrig", ""))
        detect_account_status = await get_account_status(detect_user_id)
        if detect_account_status == "frozen":
            raise HTTPException(
                status_code=403,
                detail={
                    "error": "ACCOUNT_FROZEN",
                    "message": (
                        f"Tài khoản {detect_user_id} đã bị đóng băng do nghi ngờ gian lận. "
                        "Liên hệ ADMIN để mở khóa."
                    ),
                    "account_status": "frozen",
                    "decision": "BLOCKED",
                },
            )

        # Add background task for additional processing if needed
        background_tasks.add_task(log_transaction, transaction_dict)

        # Detect fraud
        result = fraud_service.detect_fraud(transaction_dict)

        # ── Repeat risk escalation ────────────────────────────────────
        detect_tx_type = str(getattr(transaction_dict.get("type", ""), "value", transaction_dict.get("type", "")))
        detect_name_dest = str(transaction_dict.get("nameDest", ""))
        detect_repeat_bonus = await get_repeat_risk_bonus(
            user_id=detect_user_id,
            amount=float(transaction_dict.get("amount", 0)),
            tx_type=detect_tx_type,
            receiver=detect_name_dest,
        )
        detect_repeat_count = await get_repeat_count(
            user_id=detect_user_id,
            amount=float(transaction_dict.get("amount", 0)),
            tx_type=detect_tx_type,
            receiver=detect_name_dest,
        )

        # Áp dụng decision layer
        fraud_prob = _extract_risk_score(result)
        risk_level = _extract_risk_level(result)

        if detect_repeat_bonus > 0:
            detect_tx_hash = hashlib.sha256(
                json.dumps(transaction_dict, sort_keys=True, default=str).encode()
            ).hexdigest()[:16]
            fd = await make_fraud_decision_with_escalation(
                fraud_probability=fraud_prob,
                risk_level=risk_level,
                repeat_risk_bonus=detect_repeat_bonus,
                user_id=detect_user_id,
                transaction_hash=detect_tx_hash,
            )
        else:
            fd = make_fraud_decision(fraud_prob, risk_level)

        result["decision"]       = fd.decision.value
        result["should_block"]   = fd.should_block
        result["requires_review"] = fd.requires_review
        result["block_reason"]   = fd.block_reason
        result["review_reason"]  = fd.review_reason
        result["risk_score"]     = fd.fraud_probability
        result["risk_level"]     = fd.risk_level

        # Thêm thông tin repeat risk
        result["repeat_count"] = detect_repeat_count
        result["repeat_risk_bonus"] = detect_repeat_bonus
        result["account_status"] = detect_account_status

        # ── Auto-freeze: đóng băng tài khoản khi BLOCKED ─────────────────
        if fd.should_block and detect_account_status != "frozen":
            detect_freeze_hash = hashlib.sha256(
                json.dumps(transaction_dict, sort_keys=True, default=str).encode()
            ).hexdigest()[:16]
            freeze_ok = await freeze_account(
                user_id=detect_user_id,
                fraud_probability=fd.fraud_probability,
                reason=f"Auto-freeze: detect-fraud BLOCKED (fraud_prob={fd.fraud_probability:.4f})",
                transaction_hash=detect_freeze_hash,
                triggered_by="SYSTEM_AUTO",
            )
            if freeze_ok:
                result["account_status"] = "frozen"

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



