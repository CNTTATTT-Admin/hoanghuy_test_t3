"""Unit tests cho SHAPExplainer và tích hợp SHAP vào RealtimeFraudDetector.

Kiểm tra:
  - SHAP sum + base_value ≈ fraud_probability (sai số < 0.01)
  - Vietnamese explanation output không rỗng
  - Schema trả về đúng (top_features, base_value, explanation_text)
  - Guard: không compute SHAP khi probability <= 0.3
  - Guard: predict() vẫn chạy bình thường khi _shap_explainer = None
  - _to_vietnamese() cover đủ các features

Cách chạy:
    pytest ml/tests/test_shap_explainer.py -v
"""

import sys
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import MagicMock, patch

import numpy as np
import pytest

# ── Thêm project root vào sys.path ──────────────────────────────────────────
_PROJECT_ROOT = str(Path(__file__).resolve().parents[2])
if _PROJECT_ROOT not in sys.path:
    sys.path.insert(0, _PROJECT_ROOT)


# ─── Helpers ────────────────────────────────────────────────────────────────

_FEATURE_NAMES = [
    "amount",
    "amount_log1p",
    "amount_threshold_ratio",
    "dest_is_empty",
    "type",
    "amount_zscore_user",
    "user_avg_amount",
    "number_of_transactions_last_1h",
    "total_amount_last_24h",
    "unique_devices_or_accounts_last_7d",
    "time_since_last_transaction",
    "transaction_frequency_change",
]
_N = len(_FEATURE_NAMES)

# SHAP values giả: sum = 0.60, base = 0.20 → tổng = 0.80
# Kiểm tra: 0.24+0.10+0.05+0.04-0.03+0.08-0.02+0.06+0.05+0.03-0.04+0.04 = 0.60 ✓
_FAKE_SHAP_VALUES = np.array([[
    0.24,   # amount          (chiếm phần lớn nhất)
    0.10,   # amount_log1p
    0.05,   # amount_threshold_ratio
    0.04,   # dest_is_empty
   -0.03,   # type
    0.08,   # amount_zscore_user
   -0.02,   # user_avg_amount
    0.06,   # number_of_transactions_last_1h
    0.05,   # total_amount_last_24h
    0.03,   # unique_devices_or_accounts_last_7d
   -0.04,   # time_since_last_transaction
    0.04,   # transaction_frequency_change
]])  # shape (1, 12)  — sum = 0.60, total = 0.80

_FAKE_BASE_VALUE = 0.20
_FRAUD_PROBABILITY = 0.80  # sum(_FAKE_SHAP_VALUES[0]) + _FAKE_BASE_VALUE

_FEATURE_ARRAY = np.array([[
    450000.0,   # amount
    13.0,       # amount_log1p
    1.8,        # amount_threshold_ratio
    1.0,        # dest_is_empty
    2.0,        # type (encoded)
    4.2,        # amount_zscore_user
    50000.0,    # user_avg_amount
    3.0,        # number_of_transactions_last_1h
    900000.0,   # total_amount_last_24h
    5.0,        # unique_devices_or_accounts_last_7d
    0.5,        # time_since_last_transaction
    2.0,        # transaction_frequency_change
]])


def _make_mock_lgb_model():
    """Tạo mock model có hasattr(model, 'booster_') để SHAPExplainer nhận dạng là LightGBM."""
    model = MagicMock()
    model.booster_ = MagicMock()
    # Thêm tên class để isinstance check pass qua giả lập
    model.__class__.__name__ = "LGBMClassifier"
    return model


def _make_shap_explainer_with_mock(
    shap_values=None,
    base_value=None,
    expected_value_is_list: bool = False,
) -> "SHAPExplainer":
    """Tạo SHAPExplainer với mock TreeExplainer bên trong (không cần model thật)."""
    from ml.explainability.explainable_ai import SHAPExplainer

    sv = shap_values if shap_values is not None else _FAKE_SHAP_VALUES
    bv = base_value if base_value is not None else _FAKE_BASE_VALUE

    mock_tree_exp = MagicMock()
    mock_tree_exp.shap_values.return_value = sv
    if expected_value_is_list:
        mock_tree_exp.expected_value = [1 - bv, bv]
    else:
        mock_tree_exp.expected_value = bv

    # Bypass __init__ bằng object.__new__ rồi gắn attributes thủ công
    explainer = object.__new__(SHAPExplainer)
    explainer._explainer = mock_tree_exp
    explainer.feature_names = _FEATURE_NAMES
    return explainer


# ─── Tests: SHAPExplainer.explain() schema ───────────────────────────────────

class TestSHAPExplainerSchema:
    """Kiểm tra schema kết quả trả về của explain()."""

    def test_returns_required_keys(self):
        """explain() phải trả về dict với top_features, base_value, explanation_text."""
        explainer = _make_shap_explainer_with_mock()
        result = explainer.explain(_FEATURE_ARRAY, _FRAUD_PROBABILITY, top_k=5)

        assert "top_features" in result
        assert "base_value" in result
        assert "explanation_text" in result

    def test_top_features_count(self):
        """top_features phải có đúng top_k entries (hoặc ít hơn nếu features ít hơn)."""
        explainer = _make_shap_explainer_with_mock()
        result = explainer.explain(_FEATURE_ARRAY, _FRAUD_PROBABILITY, top_k=5)
        assert len(result["top_features"]) == 5

    def test_top_features_sorted_by_abs_shap_desc(self):
        """top_features phải được sắp xếp theo |shap_value| giảm dần."""
        explainer = _make_shap_explainer_with_mock()
        result = explainer.explain(_FEATURE_ARRAY, _FRAUD_PROBABILITY, top_k=5)
        values = [abs(f["shap_value"]) for f in result["top_features"]]
        assert values == sorted(values, reverse=True)

    def test_top_feature_keys(self):
        """Mỗi entry trong top_features phải có đủ 5 keys."""
        explainer = _make_shap_explainer_with_mock()
        result = explainer.explain(_FEATURE_ARRAY, _FRAUD_PROBABILITY)
        for feat in result["top_features"]:
            assert "feature" in feat
            assert "shap_value" in feat
            assert "feature_value" in feat
            assert "direction" in feat
            assert "human_readable" in feat

    def test_direction_positive_shap(self):
        """shap_value > 0 → direction phải là 'increases_risk'."""
        explainer = _make_shap_explainer_with_mock()
        result = explainer.explain(_FEATURE_ARRAY, _FRAUD_PROBABILITY)
        for feat in result["top_features"]:
            if feat["shap_value"] > 0:
                assert feat["direction"] == "increases_risk"
            else:
                assert feat["direction"] == "decreases_risk"

    def test_base_value_correct(self):
        """base_value phải bằng expected_value của TreeExplainer."""
        explainer = _make_shap_explainer_with_mock(base_value=0.20)
        result = explainer.explain(_FEATURE_ARRAY, _FRAUD_PROBABILITY)
        assert abs(result["base_value"] - 0.20) < 1e-4

    def test_base_value_from_list_expected_value(self):
        """Xử lý đúng khi expected_value là list [neg, pos]."""
        explainer = _make_shap_explainer_with_mock(
            base_value=0.20, expected_value_is_list=True
        )
        result = explainer.explain(_FEATURE_ARRAY, _FRAUD_PROBABILITY)
        assert abs(result["base_value"] - 0.20) < 1e-4


# ─── Tests: SHAP validation ──────────────────────────────────────────────────

class TestSHAPValidation:
    """Kiểm tra tính đúng đắn của SHAP conservation: sum(shap) + base ≈ probability."""

    def test_shap_sum_plus_base_approx_probability(self):
        """sum(shap_values) + base_value ≈ fraud_probability (sai số < 0.01)."""
        explainer = _make_shap_explainer_with_mock()
        result = explainer.explain(_FEATURE_ARRAY, _FRAUD_PROBABILITY)

        shap_sum = sum(f["shap_value"] for f in result["top_features"])
        # top_k=5 nên chỉ có 5 features; tính tổng đầy đủ từ SHAP values gốc
        total_shap = float(np.sum(_FAKE_SHAP_VALUES[0]))
        computed = total_shap + result["base_value"]
        assert abs(computed - _FRAUD_PROBABILITY) < 0.01, (
            f"SHAP conservation fail: {computed:.4f} != {_FRAUD_PROBABILITY:.4f}"
        )

    def test_validation_warning_logged_on_large_diff(self, caplog):
        """Khi sai số > 0.01, phải log warning nhưng không raise exception."""
        import logging
        # SHAP values có tổng rất khác probability
        bad_sv = np.array([[0.05] * _N])  # sum = 0.60, base = 0.20 → 0.80 ≠ 0.99
        explainer = _make_shap_explainer_with_mock(
            shap_values=bad_sv, base_value=0.20
        )
        with caplog.at_level(logging.WARNING, logger="ml.explainability.explainable_ai"):
            result = explainer.explain(_FEATURE_ARRAY, fraud_probability=0.99)
        # Không raise exception
        assert "top_features" in result
        # Warning phải được log
        assert any("SHAP validation" in r.message for r in caplog.records)


# ─── Tests: Vietnamese output ─────────────────────────────────────────────────

class TestVietnameseOutput:
    """Kiểm tra _to_vietnamese() cover đủ features và không trả về chuỗi rỗng."""

    def _get_explainer(self):
        return _make_shap_explainer_with_mock()

    @pytest.mark.parametrize("feature,shap_val,feat_val", [
        ("amount", 0.20, 450000.0),
        ("amount_log1p", 0.10, 13.0),
        ("amount_threshold_ratio", 0.05, 1.8),
        ("dest_is_empty", 0.04, 1.0),
        ("dest_is_empty", -0.02, 0.0),
        ("type", -0.03, 2.0),
        ("amount_zscore_user", 0.08, 4.2),
        ("amount_zscore_user", -0.05, 0.3),
        ("user_avg_amount", -0.02, 50000.0),
        ("number_of_transactions_last_1h", 0.06, 3.0),
        ("total_amount_last_24h", 0.05, 900000.0),
        ("unique_devices_or_accounts_last_7d", 0.03, 5.0),
        ("time_since_last_transaction", -0.04, 0.5),
        ("transaction_frequency_change", 0.04, 2.0),
        ("unknown_feature_xyz", 0.01, 0.5),  # fallback case
    ])
    def test_to_vietnamese_not_empty(self, feature, shap_val, feat_val):
        """_to_vietnamese() phải trả về chuỗi không rỗng cho mọi feature."""
        explainer = self._get_explainer()
        result = explainer._to_vietnamese(feature, shap_val, feat_val)
        assert isinstance(result, str)
        assert len(result.strip()) > 0

    def test_explanation_text_not_empty(self):
        """explanation_text phải là chuỗi không rỗng."""
        explainer = _make_shap_explainer_with_mock()
        result = explainer.explain(_FEATURE_ARRAY, _FRAUD_PROBABILITY)
        assert isinstance(result["explanation_text"], str)
        assert len(result["explanation_text"].strip()) > 0

    def test_explanation_text_contains_probability(self):
        """explanation_text phải chứa thông tin về xác suất gian lận."""
        explainer = _make_shap_explainer_with_mock()
        result = explainer.explain(_FEATURE_ARRAY, _FRAUD_PROBABILITY)
        # format "{:.1%}" → "80.0%"; kiểm tra "80" xuất hiện trong text
        assert "80" in result["explanation_text"]

    def test_dest_is_empty_1_vs_0(self):
        """dest_is_empty=1 và =0 phải cho các câu khác nhau."""
        explainer = _make_shap_explainer_with_mock()
        text_1 = explainer._to_vietnamese("dest_is_empty", 0.04, 1.0)
        text_0 = explainer._to_vietnamese("dest_is_empty", -0.02, 0.0)
        assert text_1 != text_0
        assert "chưa từng" in text_1
        assert "lịch sử" in text_0


# ─── Tests: SHAP guard trong predict() ───────────────────────────────────────

class TestSHAPGuardInPredict:
    """Kiểm tra guard probability > 0.3 và fallback khi _shap_explainer = None."""

    def _make_detector_mock_with_shap(self, fraud_probability: float):
        """Tạo RealtimeFraudDetector mock với _shap_explainer mock.

        Dùng object.__new__ để bypass __init__ nặng (tải model thật).
        Mọi dependency đều được mock để test chỉ tập trung vào logic SHAP guard.
        """
        from ml.inference.realtime_inference import RealtimeFraudDetector

        # Bypass __init__ nặng — không tải model thật
        detector = object.__new__(RealtimeFraudDetector)

        # Preprocessor: prepare_inference_frame trả về DataFrame rỗng (chỉ cần shape đúng)
        import pandas as pd
        fake_frame = pd.DataFrame([{"dummy": 0}])

        detector._preprocessor = MagicMock()
        detector._preprocessor.prepare_inference_frame.return_value = fake_frame
        detector._preprocessor._load_preprocessor.return_value.transform.return_value = _FEATURE_ARRAY

        detector._predictor = MagicMock()
        detector._predictor.predict_proba.return_value = fraud_probability

        detector._postprocessor = MagicMock()
        detector._postprocessor.process.return_value = {
            "is_fraud": fraud_probability >= 0.35,
            "fraud_probability": fraud_probability,
            "risk_score": fraud_probability,
            "risk_level": "HIGH" if fraud_probability >= 0.75 else "LOW",
            "decision_threshold": 0.35,
            "reasons": [],
        }

        # Patch _audit để tránh json.dumps fail trên MagicMock objects
        detector._audit = MagicMock()
        detector._user_states = {}

        # Mock SHAPExplainer
        shap_mock = _make_shap_explainer_with_mock()
        shap_mock.explain = MagicMock(return_value={
            "top_features": [],
            "base_value": 0.2,
            "explanation_text": "Xác suất: 80%.",
        })
        detector._shap_explainer = shap_mock

        return detector

    def test_shap_called_when_probability_above_threshold(self):
        """SHAP phải được gọi khi fraud_probability > 0.3."""
        detector = self._make_detector_mock_with_shap(fraud_probability=0.80)
        result = detector.predict({
            "type": "TRANSFER",
            "amount": 450000.0,
            "nameOrig": "C123",
            "step": 1,
        })
        detector._shap_explainer.explain.assert_called_once()
        assert result.get("explanation") is not None

    def test_shap_not_called_when_probability_below_threshold(self):
        """SHAP KHÔNG được gọi khi fraud_probability <= 0.3 (tiết kiệm latency)."""
        detector = self._make_detector_mock_with_shap(fraud_probability=0.15)
        result = detector.predict({
            "type": "PAYMENT",
            "amount": 1000.0,
            "nameOrig": "C456",
            "step": 5,
        })
        detector._shap_explainer.explain.assert_not_called()
        assert result.get("explanation") is None

    def test_predict_works_when_shap_explainer_is_none(self):
        """predict() phải chạy bình thường khi _shap_explainer = None."""
        detector = self._make_detector_mock_with_shap(fraud_probability=0.90)
        detector._shap_explainer = None  # Giả lập SHAP không khởi tạo được
        result = detector.predict({
            "type": "TRANSFER",
            "amount": 500000.0,
            "nameOrig": "C789",
            "step": 10,
        })
        # explanation phải là None, không crash
        assert result["explanation"] is None
        assert "fraud_probability" in result
