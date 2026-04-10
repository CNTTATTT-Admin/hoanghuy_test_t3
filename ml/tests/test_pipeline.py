"""Unit tests for the FraudDetect ML pipeline.

Run with::

    cd D:\\FraudDetect
    python -m pytest ml/tests/test_pipeline.py -v
"""

from __future__ import annotations

import os
import sys

import numpy as np
import pandas as pd
import pytest

# Allow importing ml.* when running from any directory
_PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
if _PROJECT_ROOT not in sys.path:
    sys.path.insert(0, _PROJECT_ROOT)

from ml.config.config_runtime import load_config
from ml.config.schema import ModelConfig
from ml.explainability.explainable_ai import FraudExplainer
from ml.inference.postprocessing import PostProcessor
from ml.modeling.calibration import ProbabilityCalibrator
from ml.pipeline.feature_engineering import (
    REALTIME_SAFE_FEATURE_COLUMNS,
    drop_post_transaction_columns,
    feature_engineering,
)
from ml.pipeline.validation import DataValidator
from ml.risk.risk_scoring import RiskScorer
from ml.risk.thresholding import ThresholdOptimizer


# ── Fixtures ──────────────────────────────────────────────────────────────────

@pytest.fixture
def sample_df() -> pd.DataFrame:
    """Minimal PaySim-like DataFrame for testing."""
    rng = np.random.default_rng(42)
    n = 200
    return pd.DataFrame({
        "step": np.arange(n),
        "type": rng.choice(["TRANSFER", "CASH_OUT", "PAYMENT", "DEBIT", "CASH_IN"], n),
        "amount": rng.uniform(100, 200_000, n),
        "nameOrig": [f"C{i}" for i in rng.integers(0, 50, n)],
        "oldbalanceOrg": rng.uniform(0, 500_000, n),
        "newbalanceOrig": rng.uniform(0, 500_000, n),
        "nameDest": [f"M{i}" for i in rng.integers(0, 30, n)],
        "oldbalanceDest": rng.uniform(0, 100_000, n),
        "newbalanceDest": rng.uniform(0, 200_000, n),
        "isFraud": np.concatenate([np.ones(20, dtype=int), np.zeros(n - 20, dtype=int)]),
    })


# ── Config ────────────────────────────────────────────────────────────────────

class TestConfig:
    def test_load_config_returns_dataclass(self):
        cfg = load_config()
        assert isinstance(cfg, ModelConfig)

    def test_model_config_defaults(self):
        cfg = ModelConfig()
        assert cfg.calibration_method == "none"
        assert cfg.threshold_selection == "precision_at_recall"
        assert cfg.target_recall == 0.8


# ── Validation ────────────────────────────────────────────────────────────────

class TestValidation:
    def test_valid_df_passes(self, sample_df: pd.DataFrame):
        DataValidator().validate(sample_df, context="test fixture")

    def test_missing_column_raises(self, sample_df: pd.DataFrame):
        broken = sample_df.drop(columns=["amount"])
        with pytest.raises(ValueError, match="Missing required columns"):
            DataValidator().validate(broken, context="broken df")


# ── Feature Engineering ───────────────────────────────────────────────────────

class TestFeatureEngineering:
    def test_no_leakage_columns(self, sample_df: pd.DataFrame):
        df = drop_post_transaction_columns(sample_df)
        leakage_cols = {"newbalanceOrig", "newbalanceDest", "balance_diff_org", "balance_diff_dest"}
        assert leakage_cols.isdisjoint(set(df.columns))

    def test_feature_engineering_adds_columns(self, sample_df: pd.DataFrame):
        df = drop_post_transaction_columns(sample_df.drop(columns=["isFraud"]))
        out, threshold, _ = feature_engineering(df, is_training=True)
        assert "amount_threshold_ratio" in out.columns
        assert "amount_log1p" in out.columns
        assert isinstance(threshold, float) and threshold > 0

    def test_balance_features_added(self, sample_df: pd.DataFrame):
        df = drop_post_transaction_columns(sample_df.drop(columns=["isFraud"]))
        out, _, _ = feature_engineering(df, is_training=True)
        assert "amount_threshold_ratio" in out.columns
        assert "dest_is_empty" in out.columns
        assert "step_hour_of_day" in out.columns

    def test_amount_threshold_ratio_positive(self, sample_df: pd.DataFrame):
        df = drop_post_transaction_columns(sample_df.drop(columns=["isFraud"]))
        out, _, _ = feature_engineering(df, is_training=True)
        assert (out["amount_threshold_ratio"] >= 0).all()
        assert (out["amount_threshold_ratio"] <= 3.0).all()

    def test_realtime_safe_columns_complete(self):
        expected = {
            "amount", "amount_log1p", "amount_threshold_ratio",
            "dest_is_empty",
            "type", "step", "step_hour_of_day",
        }
        assert set(REALTIME_SAFE_FEATURE_COLUMNS) == expected


# ── Calibration ───────────────────────────────────────────────────────────────

class TestCalibration:
    def test_none_passthrough(self):
        cal = ProbabilityCalibrator(method="none")
        cal.fit(np.array([0.1, 0.9]), np.array([0, 1]))
        assert cal.transform_one(0.5) == pytest.approx(0.5, abs=1e-6)

    def test_platt_calibration(self):
        rng = np.random.default_rng(0)
        probs = np.concatenate([rng.uniform(0.0, 0.3, 80), rng.uniform(0.7, 1.0, 20)])
        labels = np.array([0] * 80 + [1] * 20)
        cal = ProbabilityCalibrator(method="platt")
        cal.fit(probs, labels)
        assert 0.0 <= cal.transform_one(0.5) <= 1.0


# ── Risk & Threshold ─────────────────────────────────────────────────────────

class TestRisk:
    def test_risk_levels(self):
        scorer = RiskScorer()
        assert scorer.risk_level(0.01) == "LOW"
        assert scorer.risk_level(0.50) == "MEDIUM"
        assert scorer.risk_level(0.90) == "HIGH"

    def test_threshold_optimizer_f1(self):
        probs = np.concatenate([np.full(80, 0.1), np.full(20, 0.8)])
        labels = np.array([0] * 80 + [1] * 20)
        opt = ThresholdOptimizer()
        thr = opt.find_best(probs, labels, strategy="f1")
        assert 0.05 <= thr <= 0.30

    def test_threshold_optimizer_precision_at_recall(self):
        probs = np.concatenate([np.full(80, 0.1), np.full(20, 0.8)])
        labels = np.array([0] * 80 + [1] * 20)
        opt = ThresholdOptimizer()
        thr = opt.find_best(probs, labels, strategy="precision_at_recall", target_recall=0.7)
        assert 0.05 <= thr <= 0.30

    def test_threshold_never_below_005(self):
        rng = np.random.default_rng(42)
        probs = rng.uniform(0, 0.1, 100)
        labels = np.array([0] * 90 + [1] * 10)
        opt = ThresholdOptimizer()
        thr = opt.find_best(probs, labels, strategy="f1")
        assert thr >= 0.05

    def test_threshold_never_above_030(self):
        probs = np.concatenate([np.full(90, 0.01), np.full(10, 0.99)])
        labels = np.array([0] * 90 + [1] * 10)
        opt = ThresholdOptimizer()
        thr = opt.find_best(probs, labels, strategy="precision_at_recall", target_recall=0.9)
        assert thr <= 0.30


# ── Explainability ────────────────────────────────────────────────────────────

class TestExplainability:
    def test_below_threshold_returns_reason(self):
        explainer = FraudExplainer(["amount", "type"])
        reasons = explainer.explain(0.01, 0.35, {"amount_threshold_ratio": 0.6, "type": "PAYMENT"})
        assert len(reasons) >= 1

    def test_above_threshold_with_indicators(self):
        explainer = FraudExplainer(["amount", "type"])
        reasons = explainer.explain(0.80, 0.35, {"amount_threshold_ratio": 1.2, "type": "TRANSFER"})
        assert any("high" in r.lower() or "transfer" in r.lower() for r in reasons)

    def test_destination_empty_explanation(self):
        explainer = FraudExplainer(["amount", "type"])
        reasons = explainer.explain(0.80, 0.35, {
            "amount_threshold_ratio": 1.1, "type": "TRANSFER",
            "dest_is_empty": 1,
        })
        assert len(reasons) > 0


# ── PostProcessor ─────────────────────────────────────────────────────────────

class TestPostProcessor:
    def test_output_keys(self):
        pp = PostProcessor(decision_threshold=0.5, feature_names=["amount", "type"])
        result = pp.process(0.8, {"amount_threshold_ratio": 1.1, "type": "TRANSFER"})
        assert result["is_fraud"] is True
        assert 0.0 <= result["risk_score"] <= 1.0
        assert result["risk_level"] in {"LOW", "MEDIUM", "HIGH"}
        assert isinstance(result["reasons"], list)

    def test_below_threshold_not_fraud(self):
        pp = PostProcessor(decision_threshold=0.5)
        result = pp.process(0.1, {"amount_threshold_ratio": 0.4, "type": "PAYMENT"})
        assert result["is_fraud"] is False
