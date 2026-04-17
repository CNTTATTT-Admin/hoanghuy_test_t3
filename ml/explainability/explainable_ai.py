"""Human-readable fraud explanations derived from real model input features.

Explanations are tied exclusively to features that the model was trained on,
preventing misleading justifications from heuristics outside the model's scope.
"""

from __future__ import annotations

import logging
from typing import Any, Dict, List, Sequence

import numpy as np

logger = logging.getLogger(__name__)


# Lightweight labels for FraudExplainer (rule-based fallback for PostProcessor.reasons).
# SHAP handles deep attribution — keep this list minimal and aligned with active features.
_REASON_LABELS: Dict[str, str] = {
    "amount_threshold_ratio": "Số tiền giao dịch cao bất thường so với phân phối trong dữ liệu huấn luyện",
    "type_TRANSFER": "Giao dịch chuyển khoản (TRANSFER) có mức rủi ro gian lận cao hơn trung bình",
    "type_CASH_OUT": "Giao dịch rút tiền (CASH_OUT) có mức rủi ro gian lận cao hơn trung bình",
    "dest_is_merchant": "Tài khoản đích là merchant (không phải khách hàng cá nhân)",
}


class FraudExplainer:
    """Lightweight rule-based fallback that generates plain-English reasons.

    Used by ``PostProcessor`` to populate the ``reasons`` field in API output.
    For deep feature attribution use ``SHAPExplainer``.

    Args:
        feature_names: Ordered feature column names from the artifact bundle.
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

        if float(feature_frame.get("dest_is_merchant", 0)) == 1:
            reasons.append(_REASON_LABELS["dest_is_merchant"])

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

        try:
            import lightgbm as lgb  # type: ignore
            _is_tree = isinstance(model, (lgb.LGBMClassifier, lgb.Booster))
        except ImportError:
            _is_tree = False

        if not _is_tree:
            _is_tree = hasattr(model, "get_booster") or type(model).__name__ in (
                "DecisionTreeClassifier", "RandomForestClassifier",
                "GradientBoostingClassifier", "XGBClassifier",
            )

        if not _is_tree:
            raise NotImplementedError(
                "SHAPExplainer chỉ hỗ trợ tree-based models. "
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

        # SHAP API: list [neg, pos] (shap<0.40) or array for pos class (shap>=0.40)
        if isinstance(sv_raw, list):
            sv: np.ndarray = np.asarray(sv_raw[1])[0]
        else:
            sv = np.asarray(sv_raw)[0]
        ev = self._explainer.expected_value
        base_value = float(ev[1] if hasattr(ev, "__len__") else ev)

        # Clip to actual feature count (guards against artifact version mismatch)
        n = min(len(sv), len(self.feature_names))
        indices = sorted(range(n), key=lambda i: abs(sv[i]), reverse=True)

        top_features: list[dict] = []
        for i in indices[:top_k]:
            fname = self.feature_names[i]
            sval = float(sv[i])
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
        """Chuyển feature + SHAP value thành câu giải thích tiếng Việt.

        shap_value > 0 → làm tăng rủi ro; shap_value < 0 → làm giảm rủi ro.
        """
        d = shap_value

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
            "amount_zscore_user": lambda v, d: (
                f"Số tiền cao hơn {abs(v):.1f} lần độ lệch chuẩn so với lịch sử"
                if d > 0 else
                "Số tiền nằm trong phạm vi bình thường của người dùng"
            ),
            "amount_x_transfer": lambda v, d: (
                f"Chuyển khoản số tiền lớn {'(dấu hiệu rủi ro)' if d > 0 else ''}"
            ).strip(),
            "amount_x_cashout": lambda v, d: (
                f"Rút tiền số tiền lớn {'(dấu hiệu rủi ro)' if d > 0 else ''}"
            ).strip(),
            "amount_to_avg_ratio": lambda v, d: (
                f"Số tiền {'cao hơn' if d > 0 else 'thấp hơn'} {v:.1f}x mức trung bình lịch sử"
            ),
            "large_amount_new_user": lambda v, d: (
                "Tài khoản mới thực hiện giao dịch số tiền lớn (rủi ro cao)"
                if (v == 1 and d > 0) else
                "Không phát hiện pattern tài khoản mới + số tiền lớn"
            ),
            "dest_is_merchant": lambda v, d: (
                "Tài khoản đích là merchant (không phải khách hàng cá nhân)"
                if v == 1 else
                "Tài khoản đích là khách hàng cá nhân"
            ),
            "is_cold_start": lambda v, d: (
                "Tài khoản chưa có lịch sử giao dịch (cold start — dấu hiệu tài khoản mới tạo)"
                if (v == 1 and d > 0) else
                "Tài khoản có lịch sử giao dịch bình thường"
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

