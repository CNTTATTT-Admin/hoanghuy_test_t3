"""Human-readable fraud explanations derived from real model input features.

Explanations are tied exclusively to features that the model was trained on,
preventing misleading justifications from heuristics outside the model's scope.
"""

from __future__ import annotations

import logging
from typing import Any, Dict, List, Optional, Sequence

import numpy as np

logger = logging.getLogger(__name__)


# Maps an engineered feature name to a plain-English reason string.
# Only features present in REALTIME_SAFE_FEATURE_COLUMNS are listed here.
_REASON_LABELS: Dict[str, str] = {
    "amount_threshold_ratio": "Transaction amount is high relative to the training distribution",
    "type_TRANSFER": "Transfer transactions carry above-average fraud risk",
    "type_CASH_OUT": "Cash-out transactions carry above-average fraud risk",
    "dest_is_empty": "Destination account has a zero starting balance",
}


class FraudExplainer:
    """Generate reasons from engineered features actually used by the model.

    Args:
        feature_names: The ordered list of feature column names that were
            passed to the fitted ``ColumnTransformer``.  Used to validate that
            explanations reference real features.
    """

    def __init__(self, feature_names: Sequence[str] | None = None) -> None:
        self.feature_names: List[str] = list(feature_names or [])

    def update_feature_names(self, feature_names: Sequence[str]) -> None:
        """Replace the stored feature list (e.g., after reloading artifacts)."""
        self.feature_names = list(feature_names)

    def explain(
        self,
        probability: float,
        decision_threshold: float,
        feature_frame: Dict[str, Any],
        top_k: int = 3,
    ) -> List[str]:
        """Return up to *top_k* plain-English reasons for the prediction.

        Args:
            probability:        Calibrated fraud probability.
            decision_threshold: The threshold used to produce ``is_fraud``.
            feature_frame:      Dict of ``{feature_name: value}`` for the
                                transaction (pre-transform values).
            top_k:              Maximum number of reasons to return.

        Note:
            Amount reasoning is now based on a continuous soft amount signal,
            not a hard thresholded binary feature.
        """
        reasons: List[str] = []

        if float(feature_frame.get("amount_threshold_ratio", 0.0)) >= 1.0:
            reasons.append(_REASON_LABELS["amount_threshold_ratio"])

        if float(feature_frame.get("dest_is_empty", 0)) == 1:
            reasons.append(_REASON_LABELS["dest_is_empty"])

        tx_type = str(feature_frame.get("type", "")).upper()
        type_key = f"type_{tx_type}"
        if type_key in _REASON_LABELS:
            reasons.append(_REASON_LABELS[type_key])

        if probability < decision_threshold:
            if reasons:
                return [
                    "Some risk indicators were present, but calibrated probability "
                    "stayed below the decision threshold"
                ]
            return ["No strong fraud indicators exceeded the configured decision threshold"]

        return reasons[:top_k] if reasons else [
            "Fraud probability exceeded the configured decision threshold"
        ]


# ── SHAP Explainer ────────────────────────────────────────────────────────────

class SHAPExplainer:
    """Giải thích dự đoán gian lận bằng SHAP TreeExplainer cho LightGBM.

    Dùng shap.TreeExplainer — nhanh nhất cho tree-based model, không cần
    background data.  Fallback: nếu model không phải tree-based → raise.

    Init một lần khi load model — KHÔNG init lại cho mỗi request.

    Args:
        model:         Fitted LGBMClassifier hoặc lgb.Booster.
        feature_names: Danh sách tên feature tương ứng với X_transformed.
    """

    def __init__(self, model: object, feature_names: list[str]) -> None:
        import shap  # type: ignore

        # Kiểm tra model có phải tree-based không
        try:
            import lightgbm as lgb  # type: ignore
            _lgb_types: tuple = (lgb.LGBMClassifier, lgb.Booster)
        except ImportError:
            _lgb_types = ()

        _is_tree = (
            (_lgb_types and isinstance(model, _lgb_types))
            # XGBoost / scikit-learn tree estimators cũng OK
            or hasattr(model, "get_booster")
            or type(model).__name__ in (
                "DecisionTreeClassifier", "RandomForestClassifier",
                "GradientBoostingClassifier", "XGBClassifier",
            )
        )
        if not _is_tree:
            raise NotImplementedError(
                "SHAPExplainer chỉ hỗ trợ tree-based models trong MVP. "
                f"Nhận model type: {type(model).__name__}"
            )

        # Với LGBMClassifier, lấy underlying booster để TreeExplainer hoạt động chính xác
        if hasattr(model, "booster_"):
            underlying = model.booster_
        else:
            underlying = model

        self._explainer = shap.TreeExplainer(underlying)
        self.feature_names: list[str] = list(feature_names)
        logger.info(
            "SHAPExplainer khởi tạo thành công — %d features, model=%s",
            len(self.feature_names),
            type(model).__name__,
        )

    # ── Public API ────────────────────────────────────────────────────────────

    def explain(
        self,
        feature_array: np.ndarray,   # shape (1, n_features) sau preprocessor
        fraud_probability: float,
        top_k: int = 5,
    ) -> dict:
        """Tính SHAP values và trả về structured explanation.

        Args:
            feature_array:    Mảng numpy shape (1, n_features) đã qua preprocessor.
            fraud_probability: Xác suất gian lận đã calibrate từ model.
            top_k:            Số features quan trọng nhất cần trả về.

        Returns:
            dict với keys:
              - ``top_features``: list[dict] sắp xếp theo |shap_value| DESC
              - ``base_value``:   E[f(x)] — tỉ lệ gian lận baseline của training set
              - ``explanation_text``: tóm tắt 1-2 câu tiếng Việt
        """
        sv_raw = self._explainer.shap_values(feature_array)

        # Xử lý cả hai trường hợp SHAP API:
        # - Cũ: list [neg_class_array, pos_class_array]
        # - Mới: array shape (1, n_features) cho positive class
        if isinstance(sv_raw, list):
            # Lấy class 1 (fraud class)
            sv: np.ndarray = np.asarray(sv_raw[1])[0]
            base_value = float(
                self._explainer.expected_value[1]
                if hasattr(self._explainer.expected_value, "__len__")
                else self._explainer.expected_value
            )
        else:
            sv = np.asarray(sv_raw)[0]
            ev = self._explainer.expected_value
            base_value = float(
                ev[1] if hasattr(ev, "__len__") else ev
            )

        # Validate: sum(shap) + base ≈ fraud_probability (sai số < 0.01)
        shap_sum = float(np.sum(sv))
        predicted_by_shap = shap_sum + base_value
        if abs(predicted_by_shap - fraud_probability) > 0.01:
            logger.warning(
                "SHAP validation: sum(shap)+base=%.4f, probability=%.4f, diff=%.4f",
                predicted_by_shap, fraud_probability,
                abs(predicted_by_shap - fraud_probability),
            )

        # Số features an toàn — đề phòng feature_names ngắn hơn sv
        n = min(len(sv), len(self.feature_names))
        sv_trimmed = sv[:n]
        feature_names_trimmed = self.feature_names[:n]

        # Sắp xếp theo |shap_value| giảm dần
        indices = sorted(range(n), key=lambda i: abs(sv_trimmed[i]), reverse=True)

        top_features: list[dict] = []
        for i in indices[:top_k]:
            fname = feature_names_trimmed[i]
            sval = float(sv_trimmed[i])
            fval = float(feature_array[0, i]) if feature_array.ndim == 2 else float(feature_array[i])
            top_features.append({
                "feature": fname,
                "shap_value": round(sval, 6),
                "feature_value": round(fval, 6),
                "direction": "increases_risk" if sval > 0 else "decreases_risk",
                "human_readable": self._to_vietnamese(fname, sval, fval),
            })

        explanation_text = self._build_explanation_text(top_features[:3], fraud_probability)

        return {
            "top_features": top_features,
            "base_value": round(base_value, 6),
            "explanation_text": explanation_text,
        }

    # ── Nội bộ ───────────────────────────────────────────────────────────────

    def _to_vietnamese(self, feature_name: str, shap_value: float, feature_value: float) -> str:
        """Chuyển feature + giá trị SHAP thành câu giải thích tiếng Việt.

        direction > 0 → làm tăng rủi ro; direction < 0 → làm giảm rủi ro.
        """
        d = shap_value  # ký hiệu ngắn gọn cho direction

        mappings: dict[str, Any] = {
            "amount": lambda v, d: (
                f"Số tiền {v:,.0f} {'làm tăng' if d > 0 else 'làm giảm'} rủi ro"
            ),
            "amount_log1p": lambda v, d: (
                f"Quy mô giao dịch {'lớn' if d > 0 else 'nhỏ'} so với baseline"
            ),
            "amount_threshold_ratio": lambda v, d: (
                f"Số tiền {'cao hơn' if d > 0 else 'thấp hơn'} {v:.1f}x ngưỡng phổ biến"
            ),
            "dest_is_empty": lambda v, d: (
                "Tài khoản đích chưa từng có giao dịch (dấu hiệu tài khoản mới tạo)"
                if v == 1 else
                "Tài khoản đích đã có lịch sử giao dịch"
            ),
            "type": lambda v, d: (
                f"Loại giao dịch {v} {'có rủi ro cao' if d > 0 else 'ít rủi ro'}"
            ),
            "amount_zscore_user": lambda v, d: (
                f"Số tiền cao hơn {abs(v):.1f} lần độ lệch chuẩn so với lịch sử"
                if d > 0 else
                "Số tiền nằm trong phạm vi bình thường của người dùng"
            ),
            "user_avg_amount": lambda v, d: (
                f"Mức chi tiêu trung bình của người dùng: {v:,.0f}"
            ),
            "number_of_transactions_last_1h": lambda v, d: (
                f"Thực hiện {v:.0f} giao dịch trong 1 giờ qua {'(bất thường)' if d > 0 else ''}"
            ).strip(),
            "total_amount_last_24h": lambda v, d: (
                f"Tổng tiền 24h qua: {v:,.0f} {'(cao bất thường)' if d > 0 else ''}"
            ).strip(),
            "unique_devices_or_accounts_last_7d": lambda v, d: (
                f"Giao dịch với {v:.0f} đối tác khác nhau trong 7 ngày"
            ),
            "time_since_last_transaction": lambda v, d: (
                f"Giao dịch cách đây {v:.1f} step {'(quá nhanh, bất thường)' if d < 0 else ''}"
            ).strip(),
            "transaction_frequency_change": lambda v, d: (
                f"Tần suất giao dịch {'tăng đột biến' if d > 0 else 'bình thường'} ({v:+.2f}x)"
            ),
        }

        fn = mappings.get(feature_name)
        if fn is not None:
            try:
                return fn(feature_value, d)
            except Exception:
                pass  # fallback nếu lambda gặp lỗi format

        # Fallback cho feature không có trong mapping
        direction_str = "làm tăng" if shap_value > 0 else "làm giảm"
        return f"Feature '{feature_name}' {direction_str} xác suất gian lận"

    def _build_explanation_text(
        self, top3: list[dict], fraud_probability: float
    ) -> str:
        """Tạo đoạn tóm tắt 1-2 câu tiếng Việt từ top 2-3 yếu tố quan trọng nhất."""
        if not top3:
            return (
                f"Xác suất gian lận là {fraud_probability:.1%}. "
                "Không có đủ thông tin để giải thích chi tiết."
            )

        increase_factors = [f["human_readable"] for f in top3 if f["direction"] == "increases_risk"]
        decrease_factors = [f["human_readable"] for f in top3 if f["direction"] == "decreases_risk"]

        parts: list[str] = []
        if increase_factors:
            parts.append(
                "Các yếu tố làm tăng rủi ro: " + "; ".join(increase_factors[:2]) + "."
            )
        if decrease_factors:
            parts.append(
                "Yếu tố giảm rủi ro: " + "; ".join(decrease_factors[:1]) + "."
            )

        summary = " ".join(parts) if parts else (
            f"Giao dịch có {fraud_probability:.1%} xác suất gian lận."
        )
        return f"Xác suất gian lận: {fraud_probability:.1%}. {summary}"

