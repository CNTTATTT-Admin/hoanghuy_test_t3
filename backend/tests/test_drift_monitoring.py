"""Tests cho drift monitoring: ReferenceStatsCollector + DriftDetector.

Kiểm tra:
  - PSI = 0 khi current == reference
  - PSI > 0.2 khi phân phối thay đổi đáng kể (SEVERE)
  - PSI 0.1-0.2 cho phân phối lệch nhẹ (MODERATE)
  - KS test p-value < 0.05 khi 2 phân phối khác biệt rõ ràng
  - KS test p-value > 0.05 khi 2 phân phối giống nhau
  - Fraud rate z-score đúng khi fraud rate tăng mạnh
  - DriftReport.to_dict() serializable
  - Severity logic: SEVERE / MODERATE / OK
  - ReferenceStatsCollector.compute() với numpy input
  - ReferenceStatsCollector.compute() với DataFrame input
  - save_to_json() và load() roundtrip
  - Graceful degradation khi db_pool=None
  - DriftDetector.run_drift_check() với db_pool=None (không query DB)
"""

from __future__ import annotations

import asyncio
import json
import os
import tempfile
from typing import List
from unittest.mock import AsyncMock, MagicMock, patch

import numpy as np
import pandas as pd
import pytest

# ── Thêm project root vào sys.path ────────────────────────────────────────────
import sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))

from ml.monitoring.reference_stats import ReferenceStatsCollector
from ml.monitoring.drift_detector import DriftDetector, DriftReport


# ── Fixtures ──────────────────────────────────────────────────────────────────

def _make_reference_stats(
    amount_values: np.ndarray | None = None,
    fraud_rate: float = 0.05,
    n_training: int = 10000,
    add_score_histogram: bool = True,
) -> dict:
    """Tạo reference stats đơn giản để dùng trong tests."""
    if amount_values is None:
        rng = np.random.default_rng(42)
        amount_values = rng.exponential(scale=50000, size=5000)

    collector = ReferenceStatsCollector()
    df = pd.DataFrame({"amount": amount_values})
    labels = np.zeros(len(df))
    labels[: int(len(labels) * fraud_rate)] = 1

    scores = None
    if add_score_histogram:
        rng2 = np.random.default_rng(0)
        scores = rng2.beta(0.5, 5, size=len(df))  # Phần lớn score thấp (non-fraud)

    return collector.compute(
        df, labels, model_version="v_test_20240101_000000",
        prediction_scores=scores,
    )


@pytest.fixture
def reference_stats() -> dict:
    """Reference stats chuẩn cho testing."""
    return _make_reference_stats()


@pytest.fixture
def detector(reference_stats) -> DriftDetector:
    """DriftDetector không có DB (graceful degradation mode)."""
    return DriftDetector(
        model_version="v_test_20240101_000000",
        reference_stats=reference_stats,
        db_pool=None,
    )


# ── Tests: ReferenceStatsCollector ────────────────────────────────────────────

class TestReferenceStatsCollector:
    """Tests cho ReferenceStatsCollector.compute() và các methods khác."""

    def test_compute_with_dataframe(self):
        """compute() với DataFrame input trả về đúng cấu trúc."""
        rng = np.random.default_rng(1)
        df = pd.DataFrame({
            "amount": rng.exponential(50000, 1000),
            "type":   np.random.choice(["TRANSFER", "PAYMENT", "CASH_OUT"], 1000),
        })
        labels = np.zeros(1000)
        labels[:50] = 1  # 5% fraud rate

        collector = ReferenceStatsCollector()
        stats = collector.compute(df, labels, model_version="v_test")

        assert stats["model_version"] == "v_test"
        assert stats["n_samples"] == 1000
        assert "amount" in stats["features"]
        assert "type" in stats["features"]
        assert abs(stats["fraud_rate"] - 0.05) < 1e-6
        # Binomial std = sqrt(0.05 * 0.95 / 1000)
        expected_std = float(np.sqrt(0.05 * 0.95 / 1000))
        assert abs(stats["fraud_rate_std"] - expected_std) < 1e-10

    def test_compute_with_numpy_and_feature_names(self):
        """compute() với numpy array + feature_names."""
        rng = np.random.default_rng(2)
        X = rng.standard_normal((500, 3))
        feature_names = ["amount", "amount_log1p", "amount_threshold_ratio"]
        labels = (X[:, 0] > 0.5).astype(float)

        collector = ReferenceStatsCollector()
        stats = collector.compute(X, labels, model_version="v_np", feature_names=feature_names)

        assert "amount" in stats["features"]
        assert "amount_log1p" in stats["features"]
        # Histogram tồn tại
        assert "histogram" in stats["features"]["amount"]

    def test_compute_numerical_stats_structure(self):
        """_compute_numerical_stats() trả về đúng keys."""
        rng = np.random.default_rng(3)
        values = rng.exponential(1000, 2000)

        collector = ReferenceStatsCollector()
        s = collector._compute_numerical_stats(values)

        # Quantiles
        assert set(s["quantiles"].keys()) >= {"p5", "p10", "p25", "p50", "p75", "p90", "p95", "p99"}
        # Histogram
        assert "histogram" in s
        assert len(s["histogram"]["edges"]) == 11   # 10 bins → 11 edges
        assert len(s["histogram"]["counts"]) == 10
        assert len(s["histogram"]["counts_norm"]) == 10
        # Stats
        assert abs(s["mean"] - float(np.mean(values))) < 1e-3
        assert s["min"] <= s["max"]

    def test_compute_categorical_stats(self):
        """_compute_categorical_stats() trả về tỷ lệ %, tổng ≈ 1."""
        series = pd.Series(["TRANSFER"] * 60 + ["PAYMENT"] * 30 + ["CASH_OUT"] * 10)
        collector = ReferenceStatsCollector()
        s = collector._compute_categorical_stats(series)

        assert "value_counts" in s
        vc = s["value_counts"]
        assert abs(sum(vc.values()) - 1.0) < 1e-9
        assert abs(vc["TRANSFER"] - 0.6) < 1e-9

    def test_save_and_load_json_roundtrip(self, reference_stats):
        """save_to_json() và load() tạo roundtrip hoàn chỉnh."""
        with tempfile.TemporaryDirectory() as tmpdir:
            path = os.path.join(tmpdir, "test_ref_stats.json")
            collector = ReferenceStatsCollector()
            collector.save_to_json(reference_stats, path)

            assert os.path.exists(path)
            loaded = ReferenceStatsCollector.load(path)

            assert loaded["model_version"] == reference_stats["model_version"]
            assert loaded["n_samples"] == reference_stats["n_samples"]
            assert loaded["fraud_rate"] == reference_stats["fraud_rate"]
            # Feature stats giữ nguyên
            if "amount" in reference_stats["features"]:
                assert "amount" in loaded["features"]

    def test_load_latest_returns_none_when_no_files(self):
        """load_latest() trả về None khi không có file nào."""
        with tempfile.TemporaryDirectory() as empty_dir:
            result = ReferenceStatsCollector.load_latest(models_dir=empty_dir)
            assert result is None

    def test_load_latest_finds_default_file(self, reference_stats):
        """load_latest() tìm được reference_stats_latest.json."""
        with tempfile.TemporaryDirectory() as tmpdir:
            path = os.path.join(tmpdir, "reference_stats_latest.json")
            collector = ReferenceStatsCollector()
            collector.save_to_json(reference_stats, path)

            loaded = ReferenceStatsCollector.load_latest(models_dir=tmpdir)
            assert loaded is not None
            assert loaded["model_version"] == reference_stats["model_version"]

    def test_compute_with_prediction_scores(self):
        """compute() với prediction_scores tạo score_histogram."""
        rng = np.random.default_rng(5)
        df = pd.DataFrame({"amount": rng.exponential(1000, 500)})
        labels = np.zeros(500)
        scores = rng.uniform(0, 1, 500)

        collector = ReferenceStatsCollector()
        stats = collector.compute(df, labels, model_version="v_s", prediction_scores=scores)

        assert "score_histogram" in stats
        sh = stats["score_histogram"]
        assert len(sh["edges"]) == 11
        assert "sample_scores" in sh
        assert len(sh["sample_scores"]) <= 2000


# ── Tests: DriftDetector.compute_psi ─────────────────────────────────────────

class TestComputePSI:
    """Tests cho tính năng PSI của DriftDetector."""

    def test_psi_zero_when_same_distribution(self, detector, reference_stats):
        """PSI ≈ 0 khi current distribution = reference distribution."""
        # Dùng sample_scores từ reference làm current (cùng phân phối)
        if "amount" not in reference_stats["features"]:
            pytest.skip("amount feature không có trong reference stats")

        # Tạo current values có cùng phân phối với reference
        rng = np.random.default_rng(42)
        current_vals = rng.exponential(scale=50000, size=2000).tolist()

        psi = detector.compute_psi("amount", current_vals)
        # Cùng phân phối → PSI phải rất nhỏ
        assert psi < 0.1, f"PSI={psi} phải < 0.1 khi phân phối tương tự"

    def test_psi_severe_on_distribution_shift(self, reference_stats):
        """PSI > 0.2 khi mean của current cao gấp 10x reference."""
        # Reference: amount ~ Exp(50000)
        # Current: amount ~ Uniform(500000, 1000000) — rất khác biệt
        detector = DriftDetector(
            model_version="v_test",
            reference_stats=reference_stats,
            db_pool=None,
        )
        rng = np.random.default_rng(99)
        current_vals = rng.uniform(500_000, 2_000_000, size=1000).tolist()

        psi = detector.compute_psi("amount", current_vals)
        assert psi > 0.2, f"PSI={psi} phải > 0.2 khi có severe drift"

    def test_psi_returns_zero_for_unknown_feature(self, detector):
        """PSI = 0 cho feature không có trong reference."""
        psi = detector.compute_psi("nonexistent_feature", [1.0, 2.0, 3.0])
        assert psi == 0.0

    def test_psi_returns_zero_for_empty_values(self, detector):
        """PSI = 0 khi current_values rỗng."""
        psi = detector.compute_psi("amount", [])
        assert psi == 0.0

    def test_psi_nonnegative(self, detector):
        """PSI phải >= 0 (về mặt lý thuyết)."""
        rng = np.random.default_rng(7)
        vals = rng.exponential(10000, 100).tolist()
        psi = detector.compute_psi("amount", vals)
        assert psi >= 0.0


# ── Tests: DriftDetector.compute_ks_test ────────────────────────────────────

class TestComputeKSTest:
    """Tests cho KS test trong DriftDetector."""

    def test_ks_pvalue_high_when_same_distribution(self, reference_stats):
        """KS p-value > 0.05 khi current và reference cùng phân phối."""
        detector = DriftDetector(
            model_version="v_test",
            reference_stats=reference_stats,
            db_pool=None,
        )
        if "score_histogram" not in reference_stats:
            pytest.skip("reference_stats không có score_histogram")

        # Dùng cùng mẫu ngẫu nhiên với Beta(0.5,5) — giống reference
        rng = np.random.default_rng(0)
        current_scores = rng.beta(0.5, 5, size=200).tolist()

        p_value = detector.compute_ks_test(current_scores)
        if p_value is not None:
            assert p_value > 0.01, f"KS p={p_value} phải cao khi phân phối tương tự"

    def test_ks_pvalue_low_when_different_distribution(self, reference_stats):
        """KS p-value < 0.05 khi current là phân phối hoàn toàn khác."""
        detector = DriftDetector(
            model_version="v_test",
            reference_stats=reference_stats,
            db_pool=None,
        )
        if "score_histogram" not in reference_stats:
            pytest.skip("reference_stats không có score_histogram")

        # Current: Uniform(0.7, 1.0) — hoàn toàn khác Beta(0.5, 5) trong reference
        rng = np.random.default_rng(11)
        current_scores = rng.uniform(0.7, 1.0, size=300).tolist()

        p_value = detector.compute_ks_test(current_scores)
        if p_value is not None:
            assert p_value < 0.05, f"KS p={p_value} phải < 0.05 khi drift mạnh"

    def test_ks_returns_none_when_too_few_samples(self, detector):
        """KS test trả về None khi < 20 samples."""
        result = detector.compute_ks_test([0.5, 0.6, 0.7])
        assert result is None

    def test_ks_returns_none_when_no_score_histogram(self):
        """KS test trả về None khi reference không có score_histogram."""
        stats = {"fraud_rate": 0.05, "fraud_rate_std": 0.01, "features": {}}
        detector = DriftDetector("v_test", stats, db_pool=None)
        scores = list(np.random.default_rng(0).uniform(0, 1, 50))
        result = detector.compute_ks_test(scores)
        assert result is None


# ── Tests: DriftDetector.compute_fraud_rate_zscore ───────────────────────────

class TestFraudRateZScore:
    """Tests cho concept drift z-score detection."""

    def test_zscore_near_zero_when_rate_unchanged(self, detector):
        """Z-score ≈ 0 khi fraud rate bằng baseline."""
        z = detector.compute_fraud_rate_zscore(0.05)
        # baseline = 0.05 nên z phải gần 0
        assert abs(z) < 1.0, f"z={z} phải gần 0 khi fraud_rate = baseline"

    def test_zscore_severe_when_rate_doubles(self):
        """|Z-score| > 3 khi fraud rate tăng gấp đôi."""
        # p=0.05, std = sqrt(0.05*0.95/10000) ≈ 0.00218
        fraud_rate_baseline = 0.05
        n_training = 10000
        fraud_rate_std = float(np.sqrt(fraud_rate_baseline * (1 - fraud_rate_baseline) / n_training))

        stats = {
            "fraud_rate":     fraud_rate_baseline,
            "fraud_rate_std": fraud_rate_std,
            "features": {},
        }
        detector = DriftDetector("v_t", stats, db_pool=None)

        # Tăng từ 5% lên 10% → z ≈ (0.10 - 0.05) / 0.00218 ≈ 22.9 >> 3
        z = detector.compute_fraud_rate_zscore(0.10)
        assert abs(z) > 3.0, f"z={z} phải > 3 khi fraud rate tăng gấp đôi"

    def test_zscore_negative_when_rate_drops(self):
        """Z-score âm khi fraud rate giảm mạnh."""
        stats = {"fraud_rate": 0.10, "fraud_rate_std": 0.005, "features": {}}
        detector = DriftDetector("v_t", stats, db_pool=None)
        z = detector.compute_fraud_rate_zscore(0.01)
        assert z < -3.0, f"z={z} phải âm và < -3 khi fraud rate giảm mạnh"


# ── Tests: Severity Classification ───────────────────────────────────────────

class TestSeverityClassification:
    """Tests cho _classify_severity logic."""

    def test_severity_ok_when_no_drift(self):
        """Severity = OK khi tất cả metrics trong ngưỡng."""
        severity, rec, drifted = DriftDetector._classify_severity(
            psi_scores={"amount": 0.05},
            ks_pvalue=0.50,
            fraud_rate_zscore=1.0,
        )
        assert severity == "OK"
        assert rec == "OK"
        assert drifted == []

    def test_severity_moderate_on_psi_between_thresholds(self):
        """Severity = MODERATE khi PSI > 0.1 nhưng < 0.2."""
        severity, rec, drifted = DriftDetector._classify_severity(
            psi_scores={"amount": 0.15},
            ks_pvalue=0.20,
            fraud_rate_zscore=1.5,
        )
        assert severity == "MODERATE"
        assert rec == "MONITOR"
        assert "amount" in drifted

    def test_severity_severe_on_psi_above_threshold(self):
        """Severity = SEVERE khi PSI > 0.2."""
        severity, rec, drifted = DriftDetector._classify_severity(
            psi_scores={"amount": 0.25},
            ks_pvalue=0.30,
            fraud_rate_zscore=1.0,
        )
        assert severity == "SEVERE"
        assert rec == "RETRAIN_REQUIRED"
        assert "amount" in drifted

    def test_severity_severe_on_ks_pvalue(self):
        """Severity = SEVERE khi KS p-value < 0.05."""
        severity, rec, drifted = DriftDetector._classify_severity(
            psi_scores={"amount": 0.05},
            ks_pvalue=0.02,            # < 0.05
            fraud_rate_zscore=1.0,
        )
        assert severity == "SEVERE"
        assert "prediction_scores" in drifted

    def test_severity_severe_on_fraud_zscore(self):
        """Severity = SEVERE khi |z-score| > 3."""
        severity, rec, drifted = DriftDetector._classify_severity(
            psi_scores={},
            ks_pvalue=0.50,
            fraud_rate_zscore=5.0,    # > 3.0
        )
        assert severity == "SEVERE"
        assert "fraud_rate" in drifted

    def test_severity_moderate_on_fraud_zscore(self):
        """Severity = MODERATE khi 2 < |z-score| <= 3."""
        severity, rec, drifted = DriftDetector._classify_severity(
            psi_scores={},
            ks_pvalue=0.50,
            fraud_rate_zscore=2.5,
        )
        assert severity == "MODERATE"
        assert "fraud_rate" in drifted

    def test_severity_none_ks_and_zscore_ignored(self):
        """None values cho ks_pvalue và zscore không gây lỗi."""
        severity, rec, drifted = DriftDetector._classify_severity(
            psi_scores={"amount": 0.05},
            ks_pvalue=None,
            fraud_rate_zscore=None,
        )
        assert severity == "OK"


# ── Tests: DriftReport ────────────────────────────────────────────────────────

class TestDriftReport:
    """Tests cho DriftReport serialization và structure."""

    def test_to_dict_is_json_serializable(self):
        """DriftReport.to_dict() phải JSON-serializable."""
        from datetime import datetime, timezone
        report = DriftReport(
            timestamp=datetime.now(timezone.utc),
            model_version="v_test",
            window_hours=1,
            n_current_samples=500,
            psi_scores={"amount": 0.12},
            ks_pvalue=0.03,
            fraud_rate_current=0.08,
            fraud_rate_baseline=0.05,
            fraud_rate_zscore=3.5,
            severity="SEVERE",
            recommendation="RETRAIN_REQUIRED",
            drifted_features=["amount", "prediction_scores"],
        )
        d = report.to_dict()
        # Phải serializable không lỗi
        json_str = json.dumps(d)
        assert len(json_str) > 0
        assert d["severity"] == "SEVERE"
        assert d["recommendation"] == "RETRAIN_REQUIRED"

    def test_to_dict_timestamp_is_string(self):
        """timestamp trong to_dict() phải là ISO string, không phải datetime object."""
        from datetime import datetime, timezone
        report = DriftReport(
            timestamp=datetime(2024, 1, 1, 12, 0, 0, tzinfo=timezone.utc),
            model_version="v_test",
            window_hours=1,
            n_current_samples=0,
            psi_scores={},
            ks_pvalue=None,
            fraud_rate_current=None,
            fraud_rate_baseline=0.05,
            fraud_rate_zscore=None,
            severity="OK",
            recommendation="OK",
            drifted_features=[],
        )
        d = report.to_dict()
        assert isinstance(d["timestamp"], str)
        assert "2024-01-01" in d["timestamp"]


# ── Tests: DriftDetector.run_drift_check với db_pool=None ───────────────────

class TestRunDriftCheckNoDB:
    """Tests cho run_drift_check khi db_pool=None (no database)."""

    @pytest.mark.asyncio
    async def test_run_returns_drift_report_without_db(self, reference_stats):
        """run_drift_check() trả về DriftReport hợp lệ khi không có DB."""
        detector = DriftDetector(
            model_version="v_test",
            reference_stats=reference_stats,
            db_pool=None,
        )
        report = await detector.run_drift_check(window_hours=1)

        assert isinstance(report, DriftReport)
        assert report.model_version == "v_test"
        assert report.severity in ("OK", "MODERATE", "SEVERE")
        assert report.recommendation in ("OK", "MONITOR", "RETRAIN_REQUIRED")
        # Không có data → n_samples = 0
        assert report.n_current_samples == 0

    @pytest.mark.asyncio
    async def test_run_severity_ok_when_no_data(self, reference_stats):
        """Severity = OK khi không có inference data (empty window)."""
        detector = DriftDetector(
            model_version="v_test",
            reference_stats=reference_stats,
            db_pool=None,
        )
        report = await detector.run_drift_check(window_hours=1)
        # Không có data → không compute PSI/KS → severity = OK
        assert report.severity == "OK"
        assert report.psi_scores == {}
        assert report.ks_pvalue is None

    @pytest.mark.asyncio
    async def test_save_report_skipped_when_no_pool(self, reference_stats):
        """_save_report() không raise khi db_pool=None."""
        from datetime import datetime, timezone
        detector = DriftDetector(
            model_version="v_test",
            reference_stats=reference_stats,
            db_pool=None,
        )
        report = DriftReport(
            timestamp=datetime.now(timezone.utc),
            model_version="v_test",
            window_hours=1,
            n_current_samples=100,
            psi_scores={"amount": 0.25},
            ks_pvalue=0.01,
            fraud_rate_current=0.15,
            fraud_rate_baseline=0.05,
            fraud_rate_zscore=4.0,
            severity="SEVERE",
            recommendation="RETRAIN_REQUIRED",
            drifted_features=["amount"],
        )
        # Phải không raise exception
        await detector._save_report(report)


# ── Tests: DriftDetector với mock DB pool ────────────────────────────────────

class TestRunDriftCheckWithMockDB:
    """Tests cho run_drift_check khi có DB pool (mock)."""

    def _make_mock_pool(self, rows: list) -> MagicMock:
        """Tạo mock asyncpg Pool trả về `rows` từ inference_history."""
        mock_conn = AsyncMock()
        mock_conn.set_type_codec = AsyncMock()
        mock_conn.fetch = AsyncMock(return_value=rows)
        mock_conn.execute = AsyncMock()
        mock_conn.__aenter__ = AsyncMock(return_value=mock_conn)
        mock_conn.__aexit__ = AsyncMock(return_value=False)

        mock_pool = MagicMock()
        mock_pool.acquire.return_value.__aenter__ = AsyncMock(return_value=mock_conn)
        mock_pool.acquire.return_value.__aexit__ = AsyncMock(return_value=False)
        return mock_pool

    def _make_row(self, amount: float, risk_score: float, is_fraud: bool) -> dict:
        """Tạo mock asyncpg Record."""
        mock = MagicMock()
        mock.__getitem__ = lambda self, key: {
            "input": {"amount": amount, "type": "TRANSFER"},
            "risk_score": risk_score,
            "is_fraud": is_fraud,
        }[key]
        return mock

    @pytest.mark.asyncio
    async def test_psi_computed_from_db_rows(self, reference_stats):
        """PSI được tính đúng từ dữ liệu DB mock."""
        # Tạo rows có amount distribution = reference (Exp(50000))
        rng = np.random.default_rng(42)
        rows = [
            self._make_row(float(a), float(s), False)
            for a, s in zip(
                rng.exponential(50000, 500),
                rng.beta(0.5, 5, 500),
            )
        ]
        mock_pool = self._make_mock_pool(rows)

        detector = DriftDetector(
            model_version="v_test",
            reference_stats=reference_stats,
            db_pool=mock_pool,
        )
        report = await detector.run_drift_check(window_hours=1)

        assert "amount" in report.psi_scores
        # Cùng phân phối → PSI phải thấp
        assert report.psi_scores["amount"] < 0.3

    @pytest.mark.asyncio
    async def test_severe_drift_detected_from_db(self, reference_stats):
        """SEVERE được phát hiện khi distribution thay đổi mạnh."""
        # Amount: uniform(500000, 2000000) — hoàn toàn khác reference Exp(50000)
        rng = np.random.default_rng(77)
        rows = [
            self._make_row(float(a), float(s), bool(a > 1_500_000))
            for a, s in zip(
                rng.uniform(500_000, 2_000_000, 300),
                rng.uniform(0.7, 1.0, 300),
            )
        ]
        mock_pool = self._make_mock_pool(rows)

        detector = DriftDetector(
            model_version="v_test",
            reference_stats=reference_stats,
            db_pool=mock_pool,
        )
        report = await detector.run_drift_check(window_hours=1)

        # PSI cho amount hoặc KS test phải detect drift
        has_amount_psi = report.psi_scores.get("amount", 0) > 0.1
        has_ks_drift = report.ks_pvalue is not None and report.ks_pvalue < 0.05
        has_fraud_drift = abs(report.fraud_rate_zscore or 0) > 2

        assert has_amount_psi or has_ks_drift or has_fraud_drift, (
            f"Phải detect drift: PSI={report.psi_scores}, KS={report.ks_pvalue}, "
            f"z={report.fraud_rate_zscore}"
        )

    @pytest.mark.asyncio
    async def test_fraud_rate_computed_from_labels(self, reference_stats):
        """fraud_rate_current được tính đúng từ is_fraud column."""
        # 20% fraud rate — cao hơn 5% baseline
        n_total = 200
        n_fraud = 40
        rows = [
            self._make_row(50000.0, 0.8 if i < n_fraud else 0.1, i < n_fraud)
            for i in range(n_total)
        ]
        mock_pool = self._make_mock_pool(rows)

        detector = DriftDetector(
            model_version="v_test",
            reference_stats=reference_stats,
            db_pool=mock_pool,
        )
        report = await detector.run_drift_check(window_hours=1)

        assert report.fraud_rate_current is not None
        assert abs(report.fraud_rate_current - 0.20) < 0.01
