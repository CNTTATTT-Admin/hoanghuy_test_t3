"""Phát hiện data drift và concept drift trong production inference.

DriftDetector chạy định kỳ (mặc định 1h) để so sánh phân phối dữ liệu
inference gần đây với reference distribution từ training.

Metrics được tính:
  - PSI (Population Stability Index): đo data drift cho features
  - KS test (Kolmogorov-Smirnov): đo prediction score drift
  - Fraud rate z-score: đo concept drift

Severity levels:
  - SEVERE:   PSI > 0.2 HOẶC ks_pvalue < 0.05 HOẶC |z_score| > 3
  - MODERATE: PSI > 0.1 HOẶC |z_score| > 2
  - OK:       All metrics trong ngưỡng bình thường

Graceful degradation: nếu db_pool=None thì vẫn compute metrics nhưng
không persist vào database.
"""

from __future__ import annotations

import json
import logging
import math
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, List, Optional

import numpy as np

logger = logging.getLogger(__name__)

# ── Thresholds ────────────────────────────────────────────────────────────────
PSI_SEVERE   = 0.20   # PSI > 0.20 → SEVERE drift
PSI_MODERATE = 0.10   # PSI > 0.10 → MODERATE drift
KS_PVALUE_SEVERE = 0.05  # p-value < 0.05 → SEVERE prediction drift
ZSCORE_SEVERE   = 3.0    # |z| > 3 → SEVERE concept drift
ZSCORE_MODERATE = 2.0    # |z| > 2 → MODERATE concept drift
EPSILON = 1e-4           # Tránh log(0) trong PSI computation


class DriftReport:
    """Kết quả một lần chạy drift check.

    Không dùng Pydantic để tránh dependency trong ml/ package.
    """

    def __init__(
        self,
        timestamp: datetime,
        model_version: str,
        window_hours: int,
        n_current_samples: int,
        psi_scores: Dict[str, float],
        ks_pvalue: Optional[float],
        fraud_rate_current: Optional[float],
        fraud_rate_baseline: float,
        fraud_rate_zscore: Optional[float],
        severity: str,                  # "OK" | "MODERATE" | "SEVERE"
        recommendation: str,            # "OK" | "MONITOR" | "RETRAIN_REQUIRED"
        drifted_features: List[str],
    ):
        self.timestamp            = timestamp
        self.model_version        = model_version
        self.window_hours         = window_hours
        self.n_current_samples    = n_current_samples
        self.psi_scores           = psi_scores
        self.ks_pvalue            = ks_pvalue
        self.fraud_rate_current   = fraud_rate_current
        self.fraud_rate_baseline  = fraud_rate_baseline
        self.fraud_rate_zscore    = fraud_rate_zscore
        self.severity             = severity
        self.recommendation       = recommendation
        self.drifted_features     = drifted_features

    def to_dict(self) -> dict:
        """Chuyển thành dict (JSON-serializable)."""
        return {
            "timestamp":            self.timestamp.isoformat(),
            "model_version":        self.model_version,
            "window_hours":         self.window_hours,
            "n_current_samples":    self.n_current_samples,
            "psi_scores":           self.psi_scores,
            "ks_pvalue":            self.ks_pvalue,
            "fraud_rate_current":   self.fraud_rate_current,
            "fraud_rate_baseline":  self.fraud_rate_baseline,
            "fraud_rate_zscore":    self.fraud_rate_zscore,
            "severity":             self.severity,
            "recommendation":       self.recommendation,
            "drifted_features":     self.drifted_features,
        }

    def __repr__(self) -> str:  # pragma: no cover
        return (
            f"DriftReport(version={self.model_version}, severity={self.severity}, "
            f"samples={self.n_current_samples}, drifted={self.drifted_features})"
        )


class DriftDetector:
    """Phát hiện data drift và concept drift từ inference history.

    Usage:
        detector = DriftDetector(
            model_version="v_20240101_120000",
            reference_stats=ReferenceStatsCollector.load_latest(),
            db_pool=get_pool(),        # optional
        )
        report = await detector.run_drift_check(window_hours=1)

    DriftDetector hoạt động hoàn toàn khi db_pool=None — chỉ mất khả năng
    persist report vào DB.
    """

    def __init__(
        self,
        model_version: str,
        reference_stats: dict,
        db_pool: Any = None,       # asyncpg.Pool — optional
        redis_client: Any = None,  # aioredis client — không dùng hiện tại
    ):
        self._model_version   = model_version
        self._ref             = reference_stats
        self._db_pool         = db_pool
        self._redis_client    = redis_client

        # Lấy baseline fraud rate từ reference stats
        self._baseline_fraud_rate = float(self._ref.get("fraud_rate", 0.01))
        self._baseline_fraud_std  = float(self._ref.get("fraud_rate_std", 1e-4))
        if self._baseline_fraud_std < 1e-8:
            self._baseline_fraud_std = 1e-4   # Tránh chia cho 0

    # ── PSI ───────────────────────────────────────────────────────────────────

    def compute_psi(
        self,
        feature_name: str,
        current_values: List[float],
    ) -> float:
        """Tính PSI giữa current values và reference histogram.

        PSI = sum((actual_pct - expected_pct) * ln(actual_pct / expected_pct))

        Sử dụng cùng bin edges của reference histogram để đảm bảo nhất quán.
        Epsilon=1e-4 được thêm vào các bin 0 để tránh log(0).

        Args:
            feature_name:    Tên feature (phải có trong reference_stats["features"]).
            current_values:  Danh sách giá trị từ production inference.

        Returns:
            PSI value (0 = không đổi, >0.1 = MODERATE, >0.2 = SEVERE).
            Trả về 0.0 nếu không đủ dữ liệu hoặc feature không có trong reference.
        """
        if not current_values:
            return 0.0

        feat_stats = self._ref.get("features", {}).get(feature_name)
        if feat_stats is None:
            logger.debug("PSI: feature '%s' không có trong reference stats", feature_name)
            return 0.0

        hist_info = feat_stats.get("histogram")
        if hist_info is None:
            return 0.0   # Categorical feature — không tính PSI

        edges = np.array(hist_info["edges"], dtype=float)
        expected_norm = np.array(hist_info["counts_norm"], dtype=float)

        # Clip current values vào range của reference histogram để values ngoài range
        # không bị bỏ qua mà được đưa vào bin đầu/cuối — quan trọng khi có drift mạnh
        current_arr = np.asarray(current_values, dtype=float)
        current_arr = np.clip(current_arr, edges[0], edges[-1])
        actual_counts, _ = np.histogram(current_arr, bins=edges)
        total_current = float(actual_counts.sum())
        if total_current == 0:
            return 0.0

        actual_norm = actual_counts / total_current

        # Áp dụng epsilon cho các bin có giá trị = 0
        actual_norm_safe   = np.where(actual_norm   < EPSILON, EPSILON, actual_norm)
        expected_norm_safe = np.where(expected_norm < EPSILON, EPSILON, expected_norm)

        psi = float(
            np.sum(
                (actual_norm_safe - expected_norm_safe)
                * np.log(actual_norm_safe / expected_norm_safe)
            )
        )
        return max(psi, 0.0)   # PSI luôn >= 0 về mặt lý thuyết

    # ── KS Test ───────────────────────────────────────────────────────────────

    def compute_ks_test(self, current_scores: List[float]) -> Optional[float]:
        """Tính KS test giữa current prediction scores và reference sample.

        Dùng scipy.stats.ks_2samp để so sánh 2 sample distributions.

        Args:
            current_scores: Prediction scores từ inference trong window hiện tại.

        Returns:
            p-value của KS test. None nếu không đủ dữ liệu (< 20 samples).
        """
        if len(current_scores) < 20:
            logger.debug("KS test: không đủ samples (%d < 20)", len(current_scores))
            return None

        score_hist = self._ref.get("score_histogram")
        if score_hist is None:
            return None

        reference_sample = score_hist.get("sample_scores", [])
        if len(reference_sample) < 20:
            return None

        try:
            from scipy import stats as scipy_stats  # Import lazy để không crash khi scipy chưa install
            _, p_value = scipy_stats.ks_2samp(
                np.asarray(current_scores, dtype=float),
                np.asarray(reference_sample, dtype=float),
            )
            return float(p_value)
        except ImportError:
            logger.warning("scipy chưa được cài đặt — KS test bị bỏ qua")
            return None
        except Exception as exc:
            logger.warning("KS test lỗi: %s", exc)
            return None

    # ── Fraud Rate Z-score ────────────────────────────────────────────────────

    def compute_fraud_rate_zscore(self, current_fraud_rate: float) -> float:
        """Tính z-score để phát hiện concept drift trong fraud rate.

        z = (current - baseline) / baseline_std

        Dùng Binomial std từ reference stats làm ước tính độ biến động.

        Args:
            current_fraud_rate: Fraud rate từ production inference trong window.

        Returns:
            Z-score (signed). |z| > 2 = MODERATE, |z| > 3 = SEVERE.
        """
        z = (current_fraud_rate - self._baseline_fraud_rate) / self._baseline_fraud_std
        return float(z)

    # ── Severity ──────────────────────────────────────────────────────────────

    @staticmethod
    def _classify_severity(
        psi_scores: Dict[str, float],
        ks_pvalue: Optional[float],
        fraud_rate_zscore: Optional[float],
    ) -> tuple[str, str, List[str]]:
        """Xác định severity và recommendation từ tất cả metrics.

        Returns:
            (severity, recommendation, drifted_features)
        """
        drifted_features: List[str] = []
        is_severe   = False
        is_moderate = False

        # Kiểm tra PSI từng feature
        for feat, psi in psi_scores.items():
            if psi > PSI_SEVERE:
                drifted_features.append(feat)
                is_severe = True
            elif psi > PSI_MODERATE:
                if feat not in drifted_features:
                    drifted_features.append(feat)
                is_moderate = True

        # Kiểm tra KS test (prediction drift)
        if ks_pvalue is not None and ks_pvalue < KS_PVALUE_SEVERE:
            is_severe = True
            if "prediction_scores" not in drifted_features:
                drifted_features.append("prediction_scores")

        # Kiểm tra fraud rate (concept drift)
        if fraud_rate_zscore is not None:
            abs_z = abs(fraud_rate_zscore)
            if abs_z > ZSCORE_SEVERE:
                is_severe = True
                if "fraud_rate" not in drifted_features:
                    drifted_features.append("fraud_rate")
            elif abs_z > ZSCORE_MODERATE:
                is_moderate = True
                if "fraud_rate" not in drifted_features:
                    drifted_features.append("fraud_rate")

        if is_severe:
            return ("SEVERE", "RETRAIN_REQUIRED", drifted_features)
        if is_moderate:
            return ("MODERATE", "MONITOR", drifted_features)
        return ("OK", "OK", drifted_features)

    # ── Main Entry Point ──────────────────────────────────────────────────────

    async def run_drift_check(self, window_hours: int = 1) -> DriftReport:
        """Chạy đầy đủ drift detection cho window vừa qua.

        Flow:
          1. Query inference_history cho window_hours giờ gần nhất.
          2. Extract: amount từ input JSONB, risk_score, is_fraud.
          3. Compute: PSI cho amount, KS test cho scores, z-score cho fraud_rate.
          4. Classify severity.
          5. Persist report vào DB (nếu có pool).
          6. Update Prometheus metrics.
          7. Return DriftReport.

        Args:
            window_hours: Số giờ nhìn lại từ NOW().

        Returns:
            DriftReport với đầy đủ drift metrics.
        """
        now = datetime.now(timezone.utc)
        cutoff = now - timedelta(hours=window_hours)

        logger.info(
            "Drift check [%s h window] from %s to %s",
            window_hours,
            cutoff.isoformat(),
            now.isoformat(),
        )

        # ── Query inference_history ───────────────────────────────────────────
        amounts: List[float] = []
        scores:  List[float] = []
        fraud_labels: List[int] = []

        if self._db_pool is not None:
            try:
                async with self._db_pool.acquire() as conn:
                    await conn.set_type_codec(
                        "jsonb",
                        encoder=json.dumps,
                        decoder=json.loads,
                        schema="pg_catalog",
                    )
                    rows = await conn.fetch(
                        """
                        SELECT input, risk_score, is_fraud
                        FROM inference_history
                        WHERE created_at >= $1
                        """,
                        cutoff,
                    )

                for row in rows:
                    inp = row["input"] or {}
                    # Extract amount từ raw payload
                    raw_amount = inp.get("amount")
                    if raw_amount is not None:
                        try:
                            amounts.append(float(raw_amount))
                        except (ValueError, TypeError):
                            pass
                    # Prediction score từ column trực tiếp
                    if row["risk_score"] is not None:
                        scores.append(float(row["risk_score"]))
                    # Fraud label
                    if row["is_fraud"] is not None:
                        fraud_labels.append(int(bool(row["is_fraud"])))

                logger.info(
                    "Drift check: %d rows fetched (%d amounts, %d scores, %d labels)",
                    len(rows), len(amounts), len(scores), len(fraud_labels),
                )
            except Exception as exc:
                logger.warning("Drift check: query inference_history lỗi: %s", exc)
        else:
            logger.debug("Drift check: db_pool=None, bỏ qua query inference_history")

        n_samples = max(len(amounts), len(scores), len(fraud_labels))

        # ── Tính PSI ──────────────────────────────────────────────────────────
        psi_scores: Dict[str, float] = {}
        if amounts:
            psi_amount = self.compute_psi("amount", amounts)
            psi_scores["amount"] = round(psi_amount, 6)

        # ── Tính KS test ──────────────────────────────────────────────────────
        ks_pvalue = self.compute_ks_test(scores)

        # ── Tính fraud rate z-score ───────────────────────────────────────────
        fraud_rate_current: Optional[float] = None
        fraud_rate_zscore: Optional[float]  = None
        if fraud_labels:
            fraud_rate_current = float(sum(fraud_labels) / len(fraud_labels))
            fraud_rate_zscore  = self.compute_fraud_rate_zscore(fraud_rate_current)

        # ── Classify severity ─────────────────────────────────────────────────
        severity, recommendation, drifted_features = self._classify_severity(
            psi_scores, ks_pvalue, fraud_rate_zscore
        )

        report = DriftReport(
            timestamp            = now,
            model_version        = self._model_version,
            window_hours         = window_hours,
            n_current_samples    = n_samples,
            psi_scores           = psi_scores,
            ks_pvalue            = ks_pvalue,
            fraud_rate_current   = fraud_rate_current,
            fraud_rate_baseline  = self._baseline_fraud_rate,
            fraud_rate_zscore    = fraud_rate_zscore,
            severity             = severity,
            recommendation       = recommendation,
            drifted_features     = drifted_features,
        )

        logger.info(
            "Drift report [%s]: severity=%s, PSI=%s, ks_p=%.4f, fraud_z=%.2f",
            self._model_version,
            severity,
            psi_scores,
            ks_pvalue if ks_pvalue is not None else float("nan"),
            fraud_rate_zscore if fraud_rate_zscore is not None else 0.0,
        )

        # ── Persist report ────────────────────────────────────────────────────
        await self._save_report(report)

        # ── Update Prometheus metrics ─────────────────────────────────────────
        self._update_prometheus(report)

        return report

    # ── Persistence ───────────────────────────────────────────────────────────

    async def _save_report(self, report: DriftReport) -> None:
        """INSERT drift report vào DB. Nếu severity != OK → INSERT alert."""
        if self._db_pool is None:
            return

        try:
            async with self._db_pool.acquire() as conn:
                await conn.set_type_codec(
                    "jsonb",
                    encoder=json.dumps,
                    decoder=json.loads,
                    schema="pg_catalog",
                )
                await conn.execute(
                    """
                    INSERT INTO drift_reports (
                        timestamp, model_version, severity, recommendation,
                        psi_scores, ks_pvalue, fraud_rate_current,
                        fraud_rate_baseline, fraud_rate_zscore,
                        drifted_features, window_hours, n_current_samples
                    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
                    """,
                    report.timestamp,
                    report.model_version,
                    report.severity,
                    report.recommendation,
                    report.psi_scores,
                    report.ks_pvalue,
                    report.fraud_rate_current,
                    report.fraud_rate_baseline,
                    report.fraud_rate_zscore,
                    report.drifted_features,
                    report.window_hours,
                    report.n_current_samples,
                )

                # Tạo alert nếu drift đáng kể
                if report.severity != "OK":
                    import uuid
                    alert_id = str(uuid.uuid4())
                    severity_map = {"MODERATE": "medium", "SEVERE": "high"}
                    await conn.execute(
                        """
                        INSERT INTO alerts (
                            alert_id, type, message, severity,
                            status, source_endpoint, details
                        ) VALUES ($1,$2,$3,$4,$5,$6,$7)
                        """,
                        alert_id,
                        "model_drift",
                        (
                            f"Model drift detected ({report.severity}): "
                            f"features={report.drifted_features}"
                        ),
                        severity_map.get(report.severity, "medium"),
                        "active",
                        "/drift_monitoring",
                        report.to_dict(),
                    )
                    logger.warning(
                        "Drift alert created: alert_id=%s, severity=%s",
                        alert_id,
                        report.severity,
                    )
        except Exception as exc:
            logger.warning("_save_report lỗi (non-critical): %s", exc)

    # ── Prometheus ────────────────────────────────────────────────────────────

    def _update_prometheus(self, report: DriftReport) -> None:
        """Update Prometheus Gauge metrics.

        Graceful degradation: nếu metrics chưa được tạo (import fail) → skip.
        """
        try:
            from core.metrics import (  # Import late để tránh circular import
                model_drift_severity,
                model_fraud_rate_current,
                model_ks_pvalue,
                model_psi_score,
            )

            # PSI per feature
            for feat_name, psi_val in report.psi_scores.items():
                model_psi_score.labels(feature_name=feat_name).set(psi_val)

            # KS p-value
            if report.ks_pvalue is not None:
                model_ks_pvalue.set(report.ks_pvalue)

            # Fraud rate current window
            if report.fraud_rate_current is not None:
                model_fraud_rate_current.set(report.fraud_rate_current)

            # Drift severity tổng hợp: 0=OK, 1=MODERATE, 2=SEVERE (không có label)
            severity_value = {"OK": 0, "MODERATE": 1, "SEVERE": 2}.get(
                report.severity, 0
            )
            model_drift_severity.set(severity_value)

        except ImportError:
            # backend metrics không available (e.g., chạy trong ml/ context)
            logger.debug("Prometheus metrics không available — bỏ qua update")
        except Exception as exc:
            logger.debug("Prometheus update lỗi (non-critical): %s", exc)
