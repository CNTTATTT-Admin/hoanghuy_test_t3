"""Realtime fraud detection entry point.

Run from the project root::

    python -m ml.inference.realtime_inference

Or import directly::

    from ml.inference.realtime_inference import RealtimeFraudDetector

``RealtimeFraudDetector`` is the **single public interface** for scoring one
transaction at a time.  It wires together:

  - :class:`~ml.pipeline.preprocessing.FraudDetectionPreprocessor`  — feature transform
  - :class:`~ml.inference.predictor.FraudPredictor`                  — model + calibration
  - :class:`~ml.inference.postprocessing.PostProcessor`               — threshold + risk + XAI
  - An audit logger that records every prediction to a JSON-lines file.

Backward compatibility
──────────────────────
The legacy ``ml/realtime_inference.py`` root shim re-exports this class, so
existing backend imports remain unchanged::

    from ml.realtime_inference import RealtimeFraudDetector  # still works
"""

from __future__ import annotations

import json
import logging
import os
import sys
import warnings
from typing import Any, Dict

import pandas as pd

# ── Path setup ────────────────────────────────────────────────────────────────
_HERE = os.path.dirname(os.path.abspath(__file__))
_PROJECT_ROOT = os.path.dirname(os.path.dirname(_HERE))
if _PROJECT_ROOT not in sys.path:
    sys.path.insert(0, _PROJECT_ROOT)

from ml.inference.postprocessing import PostProcessor
from ml.inference.predictor import FraudPredictor
from ml.inference.safe_feature_engineering import COLD_START_DEFAULTS, OnlineFeatureState
from ml.pipeline.preprocessing import FraudDetectionPreprocessor
from ml.utils.helpers import LOGS_DIR, MODELS_DIR, build_audit_logger, get_logger

logger = get_logger("ml.realtime_inference")


class RealtimeFraudDetector:
    """Score a single transaction and return a structured risk assessment.

    Args:
        model_dir:      Directory containing ``.pkl`` artifacts.
        audit_log_path: Path for the audit log (one JSON line per prediction).
        version:        Artifact version to load (``None`` = root of *model_dir*).

    Basic usage::

        detector = RealtimeFraudDetector()
        result = detector.predict({
            "type": "TRANSFER",
            "amount": 90_000.0,
            "nameOrig": "C123",
            "nameDest": "M777",
            "oldbalanceDest": 0.0,
            "step": 501,
        })
        # result: {is_fraud, fraud_probability, risk_score, risk_level, decision_threshold, reasons}
    """

    def __init__(
        self,
        model_dir: str | None = None,
        audit_log_path: str | None = None,
        version: str | None = None,
    ) -> None:
        resolved_model_dir = model_dir or str(MODELS_DIR)
        resolved_log_path = audit_log_path or str(LOGS_DIR / "fraud_audit.log")

        # Components
        self._predictor = FraudPredictor(model_dir=resolved_model_dir, version=version)
        self._preprocessor = FraudDetectionPreprocessor(model_dir=resolved_model_dir)
        self._postprocessor = PostProcessor(
            decision_threshold=self._predictor.threshold,
            feature_names=self._predictor.feature_columns,
        )
        self._audit_logger: logging.Logger = build_audit_logger(resolved_log_path)
        self._user_states: Dict[str, OnlineFeatureState] = {}

        # Load population statistics cho cold-start imputation
        import joblib  # pylint: disable=import-outside-toplevel
        _pop_path = os.path.join(resolved_model_dir, "population_stats.pkl")
        if os.path.exists(_pop_path):
            self._population_stats: Dict[str, float] = joblib.load(_pop_path)
            logger.info("Population stats loaded (%d keys)", len(self._population_stats))
        else:
            self._population_stats = {}
            logger.warning("population_stats.pkl not found — cold-start will use hardcoded defaults")

        # Khởi tạo SHAP explainer một lần khi load model — KHÔNG init lại per-request
        from ml.explainability.explainable_ai import SHAPExplainer  # pylint: disable=import-outside-toplevel
        try:
            self._shap_explainer: SHAPExplainer | None = SHAPExplainer(
                model=self._predictor.bundle.model,
                feature_names=list(self._predictor.feature_columns or []),
            )
        except Exception as _shap_init_err:
            logger.warning(
                "SHAPExplainer không khởi tạo được, sẽ skip SHAP trong predict(): %s",
                _shap_init_err,
            )
            self._shap_explainer = None

        logger.info(
            "RealtimeFraudDetector ready — threshold=%.4f  model_dir=%s",
            self._predictor.threshold,
            resolved_model_dir,
        )

        # Sync Redis client for behavioral state persistence (optional)
        self._redis_sync: Any = None

    def set_redis_sync(self, redis_client_sync: Any) -> None:
        """Inject a sync Redis client for behavioral state persistence."""
        self._redis_sync = redis_client_sync

    # ── Public API ────────────────────────────────────────────────────────

    def seed_user_history(
        self,
        user_id: str,
        past_amounts: list,
        past_steps: list,
        past_counterparties: list | None = None,
    ) -> None:
        """Nạp lịch sử giao dịch quá khứ cho một user trước khi inference.

        Dùng trong môi trường test/simulation khi cần behavioral history thực tế
        để ``OnlineFeatureState`` có thể tính z-score, frequency change, v.v.

        Args:
            user_id:             ID của user (nameOrig).
            past_amounts:        Danh sách số tiền giao dịch quá khứ.
            past_steps:          Danh sách step tương ứng (cùng thứ tự).
            past_counterparties: Danh sách nameDest tương ứng (tùy chọn).
        """
        state = self._user_states.setdefault(user_id, OnlineFeatureState(user_id=user_id))
        counterparties = past_counterparties or ["UNKNOWN"] * len(past_amounts)
        for step, amount, cp in zip(past_steps, past_amounts, counterparties):
            state.update(step=float(step), amount=float(amount), counterparty=str(cp))

    def predict(self, transaction: Dict[str, Any]) -> Dict[str, Any]:
        """Score a single transaction dict and return a risk assessment.

        Args:
            transaction: Raw transaction fields.  The minimum required keys
                are ``type``, ``amount``. Optional keys
                include ``nameOrig``, ``nameDest``, ``oldbalanceDest``, ``step``.

        Returns:
            Dict with keys::

                is_fraud            bool
                fraud_probability   float  (calibrated)
                risk_score          float  (= fraud_probability, clipped)
                risk_level          str    ("LOW" | "MEDIUM" | "HIGH")
                decision_threshold  float
                reasons             List[str]
        """
        import time as _time
        _t0 = _time.perf_counter()

        transaction = self._attach_behavioral_features(dict(transaction))

        # 1. Preprocess: raw dict → feature frame → transformed numpy array
        frame = pd.DataFrame([transaction])
        feature_frame = self._preprocessor.prepare_inference_frame(frame)
        X_transformed = self._preprocessor._load_preprocessor().transform(feature_frame)

        # 2. Predict: transformed array → calibrated probability
        # Suppress cosmetic warning về feature names — LightGBM được train với numpy
        # nên không có tên feature; kết quả không bị ảnh hưởng.
        with warnings.catch_warnings():
            warnings.filterwarnings(
                "ignore",
                message="X does not have valid feature names",
                category=UserWarning,
            )
            probability = self._predictor.predict_proba(X_transformed)

        # 2.5. SHAP explanation — chỉ compute khi probability > 0.1 để tiết kiệm latency
        # (~20ms cho TreeExplainer; bỏ qua cho requests có risk rất thấp)
        shap_explanation: dict | None = None
        if probability > 0.1 and self._shap_explainer is not None:
            try:
                shap_explanation = self._shap_explainer.explain(
                    X_transformed, probability, top_k=5
                )
            except Exception as shap_err:
                logger.debug("SHAP explain thất bại, bỏ qua: %s", shap_err)

        # 3. Postprocess: probability + feature values → structured output
        feature_values = feature_frame.iloc[0].to_dict()
        result = self._postprocessor.process(probability, feature_values)

        # Gắn SHAP explanation vào kết quả
        result["explanation"] = shap_explanation

        # 4. Audit log
        self._audit(transaction, feature_values, result)

        # Ghi inference latency vào Prometheus (graceful degradation — không crash khi không có metrics)
        try:
            from core.metrics import inference_latency_seconds  # pylint: disable=import-outside-toplevel
            inference_latency_seconds.observe(_time.perf_counter() - _t0)
        except ImportError:
            pass  # Chạy ngoài backend context (ví dụ: test, train) — bỏ qua

        return result

    # ── Internal ──────────────────────────────────────────────────────────

    def _audit(
        self,
        transaction: Dict[str, Any],
        feature_values: Dict[str, Any],
        result: Dict[str, Any],
    ) -> None:
        """Write one JSON-lines entry to the audit log."""
        payload = {
            "event": "fraud_inference",
            "transaction": transaction,
            "model_features": feature_values,
            "output": result,
        }
        self._audit_logger.info(json.dumps(payload, ensure_ascii=False))

    def _attach_behavioral_features(self, transaction: Dict[str, Any]) -> Dict[str, Any]:
        user_id = str(transaction.get("nameOrig", ""))
        if not user_id or "step" not in transaction or "amount" not in transaction:
            logger.debug("[BEHAVIORAL] Skipped — missing nameOrig/step/amount")
            return transaction

        state = self._user_states.setdefault(user_id, OnlineFeatureState(user_id=user_id))
        # Inject sync Redis client nếu có — cho phép persist behavioral state
        if self._redis_sync is not None and state._redis_sync is None:
            state.set_redis_sync(self._redis_sync)
        features = state.compute_features(
            current_step=float(transaction["step"]),
            current_amount=float(transaction["amount"]),
        )

        logger.info(
            "[BEHAVIORAL] user=%s step=%s | tx_1h=%s total_24h=%.0f unique_7d=%s "
            "time_since=%.1f freq_change=%.1f zscore=%.2f cold_start=%s | events_in_memory=%d",
            user_id,
            transaction["step"],
            features.get("number_of_transactions_last_1h"),
            features.get("total_amount_last_24h", 0),
            features.get("unique_devices_or_accounts_last_7d"),
            features.get("time_since_last_transaction", 0),
            features.get("transaction_frequency_change", 0),
            features.get("amount_zscore_user", 0),
            features.get("is_cold_start"),
            len(state._events),
        )

        # Cold-start: ghi đè bằng population stats nếu có
        if features.get("is_cold_start", 0) == 1.0 and self._population_stats:
            for key in list(features.keys()):
                median_key = f"{key}_median"
                if median_key in self._population_stats:
                    features[key] = self._population_stats[median_key]
            # Giữ lại cold-start flag và zscore cao cho user mới
            features["is_cold_start"] = 1.0
            features["amount_zscore_user"] = max(
                features.get("amount_zscore_user", 2.0),
                float(self._population_stats.get("amount_zscore_user_p75", 2.0)),
            )

        state.update(
            step=float(transaction["step"]),
            amount=float(transaction["amount"]),
            counterparty=str(transaction.get("nameDest", "UNKNOWN")),
        )
        transaction.update(features)
        return transaction


# ── Script entry point ────────────────────────────────────────────────────────

if __name__ == "__main__":
    detector = RealtimeFraudDetector()

    sample_tx = {
        "step": 501,
        "type": "TRANSFER",
        "amount": 90_000.0,
        "nameOrig": "C123",
        "nameDest": "M777",
        "oldbalanceDest": 0.0,
    }

    print(json.dumps(detector.predict(sample_tx), indent=2, ensure_ascii=False))
