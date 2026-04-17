"""Service adapter to connect backend API with ML realtime inference."""

from __future__ import annotations

import datetime
import logging
import sys
from pathlib import Path
from typing import Any, Dict

from core.fraud_decision import make_fraud_decision

logger = logging.getLogger(__name__)


class RealtimeCheckService:
    """Backend service wrapper around ML RealtimeFraudDetector."""

    def __init__(self, model_dir: str | None = None):
        project_root = Path(__file__).resolve().parents[3]

        root_str = str(project_root)
        if root_str not in sys.path:
            sys.path.insert(0, root_str)

        from ml.realtime_inference import RealtimeFraudDetector  # pylint: disable=import-outside-toplevel

        resolved_model_dir = model_dir or str(project_root / "models")
        audit_path = str(project_root / "logs" / "fraud_audit.log")

        self.detector = RealtimeFraudDetector(
            model_dir=resolved_model_dir,
            audit_log_path=audit_path,
        )

        # Inject sync Redis client for behavioral state persistence
        self._inject_redis_sync()

    def _inject_redis_sync(self) -> None:
        """Try to create a sync Redis client for behavioral state persistence."""
        try:
            import os
            if os.environ.get("ENABLE_REDIS", "").lower() != "true":
                logger.warning(
                    "[REDIS_SYNC] ENABLE_REDIS is not 'true' — behavioral state will be IN-MEMORY ONLY. "
                    "State will be LOST on server restart."
                )
                return
            import redis  # pylint: disable=import-outside-toplevel
            redis_url = os.environ.get("REDIS_URL", "redis://localhost:6379/0")
            client = redis.Redis.from_url(redis_url, decode_responses=True)
            client.ping()  # Verify connection works
            self.detector.set_redis_sync(client)
            logger.info("[REDIS_SYNC] Connected successfully — behavioral state will be persisted to Redis")
        except Exception as exc:
            logger.warning("[REDIS_SYNC] Connection failed — behavioral state IN-MEMORY ONLY: %s", exc)

    def _build_detector_payload(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        amount = float(payload["amount"])
        raw_type = payload["type"]
        tx_type = raw_type.value if hasattr(raw_type, "value") else str(raw_type)
        user_id = str(payload["user_id"])
        oldbalance_org = float(payload["oldbalanceOrg"])
        oldbalance_dest = float(payload["oldbalanceDest"])

        # Tính step từ timestamp — epoch hours để giữ temporal ordering nhất quán
        # với behavioral feature windows (1h, 24h, 7d)
        try:
            ts = datetime.datetime.fromisoformat(
                str(payload.get("timestamp", "")).replace("Z", "+00:00")
            )
            # Dùng epoch hours thay vì mod 744 — đảm bảo step luôn tăng theo thời gian
            epoch = datetime.datetime(2026, 1, 1, tzinfo=datetime.timezone.utc)
            step = max(1, int((ts - epoch).total_seconds() / 3600))
        except (ValueError, AttributeError):
            epoch = datetime.datetime(2026, 1, 1, tzinfo=datetime.timezone.utc)
            now = datetime.datetime.now(datetime.timezone.utc)
            step = max(1, int((now - epoch).total_seconds() / 3600))

        # Sử dụng receiver_account thực từ request thay vì fabricate
        name_dest = str(payload.get("receiver_account") or payload.get("nameDest") or f"C_UNKNOWN_{tx_type}")

        return {
            "step": step,
            "type": tx_type,
            "amount": amount,
            "nameOrig": user_id,
            "oldbalanceOrg": oldbalance_org,
            "nameDest": name_dest,
            "oldbalanceDest": oldbalance_dest,
        }

    def _rule_based_precheck(self, payload: Dict[str, Any]) -> Dict[str, Any] | None:
        """Kiểm tra nhanh các quy tắc nghiệp vụ trước khi gọi ML.

        Trả về dict kết quả nếu rule được kích hoạt, None nếu cần ML inference.
        """
        amount = float(payload.get("amount", 0))
        raw_type = payload.get("type", "")
        tx_type = (raw_type.value if hasattr(raw_type, "value") else str(raw_type)).upper()
        oldbalance_org = float(payload.get("oldbalanceOrg", 0))
        oldbalance_dest = float(payload.get("oldbalanceDest", 0))

        # Rule 0: Số tiền vượt quá số dư — không đủ tiền (TRANSFER, CASH_OUT, PAYMENT)
        if (
            tx_type in ("TRANSFER", "CASH_OUT", "PAYMENT")
            and amount > 0
            and oldbalance_org >= 0
            and amount > oldbalance_org
        ):
            return {
                "fraud_probability": 0.95,
                "risk_level": "HIGH",
                "block": True,
                "reason": f"Số tiền ({amount:,.0f}) vượt quá số dư tài khoản nguồn ({oldbalance_org:,.0f})",
                "triggered_by": "RULE_INSUFFICIENT_BALANCE",
            }

        # Rule 1: Chuyển khoản 0 đồng — probe attack
        if amount == 0 and tx_type == "TRANSFER":
            return {
                "fraud_probability": 0.95,
                "risk_level": "HIGH",
                "block": True,
                "reason": "Chuyển khoản 0 đồng — có thể là tấn công thăm dò",
                "triggered_by": "RULE_ZERO_AMOUNT",
            }

        # Rule 2: Rút toàn bộ số dư (amount == oldbalanceOrg) → drain account
        if (
            tx_type in ("TRANSFER", "CASH_OUT")
            and amount > 0
            and oldbalance_org > 0
            and amount == oldbalance_org
            and oldbalance_dest == 0
        ):
            return {
                "fraud_probability": 0.92,
                "risk_level": "HIGH",
                "block": True,
                "reason": "Rút toàn bộ số dư tài khoản đến tài khoản có số dư = 0",
                "triggered_by": "RULE_DRAIN_ACCOUNT",
            }

        # Rule 3: Chuyển khoản lớn đến tài khoản zero-balance (> 100K)
        if (
            tx_type in ("TRANSFER", "CASH_OUT")
            and oldbalance_dest == 0
            and amount > 100_000
        ):
            return {
                "fraud_probability": 0.80,
                "risk_level": "HIGH",
                "block": False,
                "reason": "Giao dịch lớn đến tài khoản mới (số dư = 0)",
                "triggered_by": "RULE_LARGE_TO_EMPTY",
            }

        return None

    def check_transaction(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        # Bước 0: Kiểm tra rule-based trước khi gọi ML
        rule_result = self._rule_based_precheck(payload)
        if rule_result is not None:
            fraud_prob = float(rule_result["fraud_probability"])
            risk_level = str(rule_result["risk_level"])
            decision_result = make_fraud_decision(fraud_prob, risk_level)
            reasons = [rule_result["reason"]]
            # Nếu rule chặn trực tiếp → override decision thành BLOCKED
            if rule_result.get("block"):
                from core.fraud_decision import FraudDecision, DecisionResult
                decision_result = DecisionResult(
                    decision=FraudDecision.BLOCKED,
                    fraud_probability=fraud_prob,
                    risk_level=risk_level,
                    should_block=True,
                    requires_review=False,
                    block_reason=rule_result["reason"],
                    review_reason=None,
                )
            return {
                "is_fraud": True,
                "risk_score": fraud_prob,
                "risk_level": risk_level,
                "reasons": reasons,
                "timestamp": str(payload.get("timestamp", "")),
                "type": payload.get("type"),
                "decision": decision_result.decision.value,
                "should_block": decision_result.should_block,
                "requires_review": decision_result.requires_review,
                "block_reason": decision_result.block_reason,
                "review_reason": decision_result.review_reason,
            }

        # Bước 1: ML inference
        detector_payload = self._build_detector_payload(payload)
        result = self.detector.predict(detector_payload)

        fraud_prob = float(result["risk_score"])
        risk_level = str(result["risk_level"])
        reasons = list(result.get("reasons", []))

        # Extract SHAP explanation_text nếu có
        shap_explanation = result.get("explanation")
        explanation_text = None
        if isinstance(shap_explanation, dict):
            explanation_text = shap_explanation.get("explanation_text")
            # Merge SHAP top_features vào reasons nếu reasons rỗng
            if not reasons and shap_explanation.get("top_features"):
                reasons = [
                    f"{f['feature']}: {f['contribution']:.4f}"
                    for f in shap_explanation["top_features"]
                ]

        # Áp dụng fraud decision layer
        decision_result = make_fraud_decision(fraud_prob, risk_level)

        return {
            "is_fraud": decision_result.should_block or fraud_prob >= result.get("decision_threshold", 0.02),
            "risk_score": fraud_prob,
            "risk_level": risk_level,
            "reasons": reasons,
            "explanation_text": explanation_text,
            "timestamp": str(payload.get("timestamp", "")),
            "type": payload.get("type"),
            "decision": decision_result.decision.value,
            "should_block": decision_result.should_block,
            "requires_review": decision_result.requires_review,
            "block_reason": decision_result.block_reason,
            "review_reason": decision_result.review_reason,
        }

    def reload_model(self, model_dir: str | None = None) -> None:
        """Reload ML artifacts từ disk — dùng sau khi retrain mà không cần restart server."""
        from ml.realtime_inference import RealtimeFraudDetector  # pylint: disable=import-outside-toplevel
        project_root = Path(__file__).resolve().parents[3]
        resolved = model_dir or str(project_root / "models")
        self.detector = RealtimeFraudDetector(
            model_dir=resolved,
            audit_log_path=str(project_root / "logs" / "fraud_audit.log"),
        )
        logger.info("Model reloaded from %s", resolved)


realtime_check_service = RealtimeCheckService()


def get_realtime_check_service() -> RealtimeCheckService:
    return realtime_check_service
