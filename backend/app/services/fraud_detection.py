"""Fraud Detection Service backed by the audited ML realtime detector."""

from __future__ import annotations

from datetime import datetime
import logging
import sys
from pathlib import Path
from typing import Any, Dict

from notifier import get_notifier

logger = logging.getLogger(__name__)


class FraudDetectionService:
    """Single backend service that delegates inference to the audited detector.

    Shares the same RealtimeFraudDetector instance with RealtimeCheckService
    to ensure consistent behavioral state (_user_states) across endpoints.
    """

    def __init__(self, model_dir: str | None = None):
        project_root = Path(__file__).resolve().parents[3]
        root_str = str(project_root)
        if root_str not in sys.path:
            sys.path.insert(0, root_str)

        # Import the shared detector from RealtimeCheckService (singleton)
        # to avoid creating a second RealtimeFraudDetector with separate _user_states
        from services.realtime_check_service import get_realtime_check_service  # pylint: disable=import-outside-toplevel
        self.detector = get_realtime_check_service().detector
        self.notifier = get_notifier()

    # ── Rule-based precheck (trước khi gọi ML) ────────────────────────────

    def _rule_based_precheck(self, transaction: Dict[str, Any]) -> Dict[str, Any] | None:
        """Kiểm tra quy tắc nghiệp vụ trước ML. Trả dict nếu bắt, None nếu cần ML."""
        amount = float(transaction.get("amount", 0))
        tx_type = str(transaction.get("type", "")).upper()
        old_bal_org = float(transaction.get("oldbalanceOrg", 0))
        old_bal_dest = float(transaction.get("oldbalanceDest", 0))

        # Rule 0: Số tiền vượt quá số dư tài khoản nguồn
        if (
            tx_type in ("TRANSFER", "CASH_OUT", "PAYMENT")
            and amount > 0
            and old_bal_org >= 0
            and amount > old_bal_org
        ):
            return {
                "fraud_probability": 0.95,
                "risk_level": "HIGH",
                "risk_score": 0.95,
                "is_fraud": True,
                "block": True,
                "reason": f"Số tiền ({amount:,.0f}) vượt quá số dư tài khoản nguồn ({old_bal_org:,.0f})",
                "triggered_by": "RULE_INSUFFICIENT_BALANCE",
            }

        # Rule 1: Chuyển khoản 0 đồng — probe attack
        if amount == 0 and tx_type == "TRANSFER":
            return {
                "fraud_probability": 0.95,
                "risk_level": "HIGH",
                "risk_score": 0.95,
                "is_fraud": True,
                "block": True,
                "reason": "Chuyển khoản 0 đồng — có thể là tấn công thăm dò",
                "triggered_by": "RULE_ZERO_AMOUNT",
            }

        # Rule 2: Rút toàn bộ số dư đến tài khoản zero-balance (drain account)
        if (
            tx_type in ("TRANSFER", "CASH_OUT")
            and amount > 0
            and old_bal_org > 0
            and amount == old_bal_org
            and old_bal_dest == 0
        ):
            return {
                "fraud_probability": 0.92,
                "risk_level": "HIGH",
                "risk_score": 0.92,
                "is_fraud": True,
                "block": True,
                "reason": "Rút toàn bộ số dư tài khoản đến tài khoản có số dư = 0",
                "triggered_by": "RULE_DRAIN_ACCOUNT",
            }

        # Rule 3: Giao dịch lớn đến tài khoản zero-balance (> 100K)
        if (
            tx_type in ("TRANSFER", "CASH_OUT")
            and old_bal_dest == 0
            and amount > 100_000
        ):
            return {
                "fraud_probability": 0.80,
                "risk_level": "HIGH",
                "risk_score": 0.80,
                "is_fraud": True,
                "block": False,
                "reason": "Giao dịch lớn đến tài khoản mới (số dư = 0)",
                "triggered_by": "RULE_LARGE_TO_EMPTY",
            }

        return None

    def detect_fraud(self, transaction: Dict[str, Any]) -> Dict[str, Any]:
        """Run audited realtime inference for a full transaction payload."""
        start_time = datetime.now()
        try:
            self._validate_transaction(transaction)

            # Kiểm tra rule-based trước ML
            rule_result = self._rule_based_precheck(transaction)
            if rule_result is not None:
                transaction_id = str(transaction.get("transaction_id") or transaction.get("nameOrig", "unknown"))
                result = {
                    "transaction_id": transaction_id,
                    "is_fraud": True,
                    "fraud_score": float(rule_result["risk_score"]),
                    "model_score": float(rule_result["fraud_probability"]),
                    "risk_level": rule_result["risk_level"],
                    "explanation": {
                        "prediction": float(rule_result["fraud_probability"]),
                        "risk_level": rule_result["risk_level"],
                        "key_factors": [rule_result["reason"]],
                        "recommendations": [
                            "Giao dịch bị chặn bởi quy tắc nghiệp vụ",
                            "Kiểm tra lại thông tin giao dịch",
                        ],
                        "confidence": "HIGH",
                    },
                    "processed_at": datetime.now().isoformat(),
                    "processing_time_ms": (datetime.now() - start_time).total_seconds() * 1000,
                }
                logger.info(
                    "Rule-based detection for %s: triggered=%s, score=%.4f",
                    transaction_id, rule_result["triggered_by"], rule_result["risk_score"],
                )
                return result

            # ML inference
            detector_result = self.detector.predict(transaction)

            fraud_prob = float(detector_result["risk_score"])
            risk_level = str(detector_result["risk_level"])
            reasons = list(detector_result.get("reasons", []))

            transaction_id = str(transaction.get("transaction_id") or transaction.get("nameOrig", "unknown"))
            explanation = {
                "prediction": fraud_prob,
                "risk_level": risk_level,
                "key_factors": reasons,
                "recommendations": self._build_recommendations({"fraud_probability": fraud_prob}),
                "confidence": self._confidence_label(fraud_prob),
            }

            result = {
                "transaction_id": transaction_id,
                "is_fraud": bool(detector_result.get("is_fraud", fraud_prob >= detector_result.get("decision_threshold", 0.02))),
                "fraud_score": fraud_prob,
                "model_score": fraud_prob,
                "risk_level": risk_level,
                "explanation": explanation,
                "processed_at": datetime.now().isoformat(),
                "processing_time_ms": (datetime.now() - start_time).total_seconds() * 1000,
            }

            if result["is_fraud"]:
                # Note: _send_fraud_alert is handled by persist_alert_if_needed
                # in the endpoint layer. Do NOT use asyncio.create_task here
                # because detect_fraud() is sync and runs in a threadpool
                # where there is no running event loop.
                logger.info(
                    "Fraud detected for %s — score=%.4f, will be alerted by endpoint layer",
                    transaction_id, result["fraud_score"],
                )

            logger.info(
                "Fraud detection completed for transaction %s: fraud=%s, score=%.6f",
                transaction_id,
                result["is_fraud"],
                result["fraud_score"],
            )
            return result
        except Exception as exc:
            logger.error("Error in fraud detection: %s", exc)
            return self._create_error_result(transaction, str(exc))

    def _validate_transaction(self, transaction: Dict[str, Any]) -> None:
        required_fields = [
            "step",
            "type",
            "amount",
            "nameOrig",
            "oldbalanceOrg",
            "newbalanceOrig",
            "nameDest",
            "oldbalanceDest",
            "newbalanceDest",
        ]
        missing_fields = [field for field in required_fields if field not in transaction]
        if missing_fields:
            raise ValueError(f"Missing required fields: {missing_fields}")

        if not isinstance(transaction.get("amount", 0), (int, float)):
            raise ValueError("Amount must be numeric")
        if float(transaction.get("amount", 0)) < 0:
            raise ValueError("Amount cannot be negative")

    def _build_recommendations(self, detector_result: Dict[str, Any]) -> list[str]:
        probability = float(detector_result["fraud_probability"])
        if probability >= 0.05:
            return [
                "Review the transaction manually",
                "Verify sender and recipient relationship",
                "Monitor subsequent activity for the same account",
            ]
        return ["Continue monitoring under normal controls"]

    def _confidence_label(self, probability: float) -> str:
        if probability >= 0.05:
            return "HIGH"
        if probability >= 0.005:
            return "MEDIUM"
        return "LOW"

    async def _send_fraud_alert(self, result: Dict[str, Any]) -> None:
        alert_data = {
            "transaction_id": result["transaction_id"],
            "fraud_score": result["fraud_score"],
            "risk_level": result["explanation"]["risk_level"],
            "key_factors": result["explanation"]["key_factors"],
            "recommendations": result["explanation"]["recommendations"],
        }
        await self.notifier.send_alert("FRAUD_DETECTED", alert_data)

    def _create_error_result(self, transaction: Dict[str, Any], error: str) -> Dict[str, Any]:
        return {
            "transaction_id": str(transaction.get("transaction_id") or transaction.get("nameOrig", "unknown")),
            "is_fraud": None,
            "fraud_score": None,
            "model_score": None,
            "error": error,
            "processed_at": datetime.now().isoformat(),
            "explanation": {
                "prediction": None,
                "risk_level": "UNKNOWN",
                "key_factors": [],
                "recommendations": ["Manual review required because inference failed"],
                "confidence": "UNKNOWN",
            },
        }

    def get_service_status(self) -> Dict[str, Any]:
        return {
            "status": "healthy",
            "components": {
                "realtime_detector": "ready",
                "notifier": "ready",
            },
            "last_check": datetime.now().isoformat(),
        }


fraud_detection_service = FraudDetectionService()


def get_fraud_detection_service() -> FraudDetectionService:
    return fraud_detection_service
