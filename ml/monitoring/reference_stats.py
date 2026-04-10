"""Tính và lưu reference statistics từ training data.

Gọi một lần sau khi train model xong để thiết lập baseline phân phối.
Reference stats được dùng bởi DriftDetector để so sánh với production data.

Lưu vào 2 nơi (redundancy):
  1. JSON file: models/reference_stats_latest.json   — độc lập, không cần DB
  2. PostgreSQL table: model_reference_stats          — optional khi DB available

Raw features được ưu tiên vì chúng khớp với dữ liệu trong inference_history.input.
"""

from __future__ import annotations

import json
import logging
import os
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, Optional

import numpy as np
import pandas as pd

logger = logging.getLogger(__name__)

_PROJECT_ROOT = Path(__file__).resolve().parents[2]
_DEFAULT_MODELS_DIR = str(_PROJECT_ROOT / "models")

# Features numerical cần tính histogram + quantiles
# Thứ tự ưu tiên: features có trong raw payload của inference_history.input trước
NUMERICAL_FEATURES = [
    "amount",                           # Có trong raw payload (ưu tiên cao)
    "amount_log1p",                     # Engineered — có nếu dùng DataFrame đã transform
    "amount_threshold_ratio",           # Engineered
    "amount_zscore_user",               # Behavioral
    "transaction_frequency_change",     # Behavioral
    "number_of_transactions_last_1h",   # Behavioral
    "dest_is_empty",                    # Binary flag
]

# Features categorical cần tính value_counts
CATEGORICAL_FEATURES = ["type"]


class ReferenceStatsCollector:
    """Tính và lưu reference distribution statistics từ training data.

    Hỗ trợ 2 loại input:
    - Raw DataFrame (model_train_raw): có amount, type, isFraud, ...
    - Engineered DataFrame (từ X_train numpy): có engineered feature names

    Ưu tiên dùng raw DataFrame để khớp với inference_history.input.
    """

    def compute(
        self,
        X_train,                                  # pd.DataFrame hoặc np.ndarray
        y_train,                                  # pd.Series hoặc np.ndarray
        model_version: str,
        feature_names: Optional[list] = None,     # Cần khi X_train là numpy
        prediction_scores: Optional[Any] = None,  # Scores từ model.predict_proba
    ) -> dict:
        """Compute reference statistics từ training data.

        Tính cho mỗi numerical feature: quantiles (p5-p99), mean, std, histogram 10 bins.
        Tính cho categorical feature: value_counts (tỷ lệ %).
        Tính global: fraud_rate, fraud_rate_std (Binomial estimate).
        Tính optional: prediction score histogram nếu prediction_scores được cung cấp.

        Args:
            X_train:          DataFrame hoặc numpy array của training features.
            y_train:          Labels (0/1).
            model_version:    String version identifier.
            feature_names:    Tên features theo thứ tự — bắt buộc khi X_train là numpy.
            prediction_scores: Probability scores từ model trên training set.

        Returns:
            dict với keys: model_version, n_samples, features, fraud_rate,
                           fraud_rate_std, n_training, score_histogram (optional).
        """
        # ── Chuẩn hoá input → DataFrame ──────────────────────────────────────
        if isinstance(X_train, np.ndarray):
            if feature_names is None:
                feature_names = [f"feature_{i}" for i in range(X_train.shape[1])]
            X_df = pd.DataFrame(X_train, columns=feature_names)
        else:
            X_df = pd.DataFrame(X_train).copy()

        y_arr = np.asarray(y_train, dtype=float)

        stats: dict = {
            "model_version": model_version,
            "n_samples": int(len(X_df)),
            "features": {},
        }

        # ── Numerical features ────────────────────────────────────────────────
        for feat in NUMERICAL_FEATURES:
            if feat not in X_df.columns:
                continue
            values = X_df[feat].dropna().values.astype(float)
            if len(values) == 0:
                continue
            stats["features"][feat] = self._compute_numerical_stats(values)
            logger.debug("Reference stats: numerical feature '%s' (%d values)", feat, len(values))

        # ── Categorical features ──────────────────────────────────────────────
        for feat in CATEGORICAL_FEATURES:
            if feat not in X_df.columns:
                continue
            stats["features"][feat] = self._compute_categorical_stats(X_df[feat])
            logger.debug("Reference stats: categorical feature '%s'", feat)

        # ── Global: fraud rate (Binomial baseline) ────────────────────────────
        n_training = int(len(y_arr))
        fraud_rate = float(np.nanmean(y_arr)) if n_training > 0 else 0.0
        # Ước tính std từ Binomial distribution: sqrt(p*(1-p)/n)
        fraud_rate_std = float(
            np.sqrt(fraud_rate * (1.0 - fraud_rate) / max(n_training, 1))
        )
        stats["fraud_rate"] = fraud_rate
        stats["fraud_rate_std"] = fraud_rate_std
        stats["n_training"] = n_training

        # ── Prediction score histogram (optional) ────────────────────────────
        if prediction_scores is not None:
            scores = np.asarray(prediction_scores, dtype=float)
            scores = scores[np.isfinite(scores)]
            if len(scores) > 0:
                hist_counts, hist_edges = np.histogram(scores, bins=10, range=(0.0, 1.0))
                total = float(hist_counts.sum())
                stats["score_histogram"] = {
                    "edges": hist_edges.tolist(),
                    "counts": hist_counts.tolist(),
                    "counts_norm": (hist_counts / max(total, 1.0)).tolist(),
                    # Lưu tối đa 2000 điểm để dùng cho KS test trực tiếp
                    "sample_scores": scores[:2000].tolist(),
                }

        logger.info(
            "Reference stats computed: %d features, n_samples=%d, fraud_rate=%.4f, version=%s",
            len(stats["features"]),
            stats["n_samples"],
            fraud_rate,
            model_version,
        )
        return stats

    # ── Helpers ───────────────────────────────────────────────────────────────

    def _compute_numerical_stats(self, values: np.ndarray) -> dict:
        """Tính quantiles p5-p99, mean, std, min, max, histogram 10 bins."""
        quantiles = np.nanpercentile(values, [5, 10, 25, 50, 75, 90, 95, 99])
        hist_counts, hist_edges = np.histogram(values, bins=10)
        total = float(hist_counts.sum())
        return {
            "quantiles": {
                "p5":  float(quantiles[0]),
                "p10": float(quantiles[1]),
                "p25": float(quantiles[2]),
                "p50": float(quantiles[3]),
                "p75": float(quantiles[4]),
                "p90": float(quantiles[5]),
                "p95": float(quantiles[6]),
                "p99": float(quantiles[7]),
            },
            "mean": float(np.nanmean(values)),
            "std":  float(np.nanstd(values)),
            "min":  float(np.nanmin(values)),
            "max":  float(np.nanmax(values)),
            "histogram": {
                "edges":       hist_edges.tolist(),
                "counts":      hist_counts.tolist(),
                # counts_norm dùng bởi DriftDetector.compute_psi()
                "counts_norm": (hist_counts / max(total, 1.0)).tolist(),
            },
        }

    def _compute_categorical_stats(self, series: pd.Series) -> dict:
        """Tính value_counts (tỷ lệ %) cho categorical feature."""
        counts = series.astype(str).value_counts(normalize=True)
        return {"value_counts": counts.to_dict()}

    # ── Persist / Load ────────────────────────────────────────────────────────

    def save_to_json(self, stats: dict, path: str) -> None:
        """Lưu stats ra JSON file (sync — dùng trong train script)."""
        p = Path(path)
        p.parent.mkdir(parents=True, exist_ok=True)
        with open(p, "w", encoding="utf-8") as f:
            json.dump(stats, f, ensure_ascii=False, indent=2, default=str)
        logger.info("Reference stats saved → %s", p)

    async def save_to_db(self, stats: dict, pool: Any, model_version: str) -> None:
        """INSERT reference stats vào PostgreSQL table model_reference_stats.

        Graceful degradation: nếu pool=None hoặc DB lỗi → log warning, không raise.
        """
        if pool is None:
            return
        try:
            async with pool.acquire() as conn:
                await conn.set_type_codec(
                    "jsonb",
                    encoder=json.dumps,
                    decoder=json.loads,
                    schema="pg_catalog",
                )
                now = datetime.now(timezone.utc)

                # Insert global fraud_rate
                await conn.execute(
                    """
                    INSERT INTO model_reference_stats
                        (model_version, feature_name, stat_type, value, created_at)
                    VALUES ($1, $2, $3, $4, $5)
                    """,
                    model_version,
                    "__global__",
                    "fraud_rate",
                    {
                        "fraud_rate":     stats["fraud_rate"],
                        "fraud_rate_std": stats["fraud_rate_std"],
                        "n_training":     stats["n_training"],
                    },
                    now,
                )

                # Insert per-feature stats (histogram + quantiles)
                for feat_name, feat_stats in stats.get("features", {}).items():
                    for stat_type, stat_value in feat_stats.items():
                        # Đảm bảo value là dict cho JSONB column
                        db_value = (
                            stat_value
                            if isinstance(stat_value, dict)
                            else {"value": stat_value}
                        )
                        await conn.execute(
                            """
                            INSERT INTO model_reference_stats
                                (model_version, feature_name, stat_type, value, created_at)
                            VALUES ($1, $2, $3, $4, $5)
                            """,
                            model_version,
                            feat_name,
                            stat_type,
                            db_value,
                            now,
                        )

                # Insert prediction score histogram (optional)
                if "score_histogram" in stats:
                    await conn.execute(
                        """
                        INSERT INTO model_reference_stats
                            (model_version, feature_name, stat_type, value, created_at)
                        VALUES ($1, $2, $3, $4, $5)
                        """,
                        model_version,
                        "__prediction__",
                        "score_histogram",
                        stats["score_histogram"],
                        now,
                    )

            logger.info(
                "Reference stats saved → PostgreSQL (version=%s)", model_version
            )
        except Exception as exc:
            logger.warning("Reference stats save_to_db failed (non-critical): %s", exc)

    @staticmethod
    def load(path: str) -> dict:
        """Load reference stats từ JSON file.

        Raises FileNotFoundError nếu file không tồn tại.
        """
        with open(path, "r", encoding="utf-8") as f:
            stats = json.load(f)
        logger.info("Reference stats loaded ← %s", path)
        return stats

    @staticmethod
    def load_latest(models_dir: str | None = None) -> Optional[dict]:
        """Load reference stats file mới nhất trong models/ directory.

        Ưu tiên 'reference_stats_latest.json', sau đó glob tìm file khác.
        Trả về None nếu không tìm thấy file nào.
        """
        models_dir_path = Path(models_dir or _DEFAULT_MODELS_DIR)

        # Ưu tiên file chuẩn
        default = models_dir_path / "reference_stats_latest.json"
        if default.exists():
            try:
                return ReferenceStatsCollector.load(str(default))
            except Exception as exc:
                logger.warning("Load reference_stats_latest.json lỗi: %s", exc)

        # Fallback: tìm bất kỳ file reference_stats_*.json nào
        candidates = sorted(models_dir_path.glob("reference_stats_*.json"), reverse=True)
        for candidate in candidates:
            try:
                return ReferenceStatsCollector.load(str(candidate))
            except Exception:
                continue

        logger.warning(
            "Không tìm thấy reference stats trong %s — drift monitoring sẽ bị bỏ qua",
            models_dir_path,
        )
        return None
