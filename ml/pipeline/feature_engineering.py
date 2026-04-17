"""Production-hardened feature engineering for the fraud detection model.

Only features that are available **before** a transaction completes are
created here. Post-transaction balance columns are explicitly excluded, and
all brittle balance / ratio proxies have been removed from the model input.
"""

from __future__ import annotations

from typing import Tuple

import numpy as np
import pandas as pd

from ml.inference.safe_feature_engineering import SAFE_TIME_FEATURE_COLUMNS

_AMOUNT_NOISE_STD = 0.05
_BEHAVIORAL_NOISE_STD = 0.10
_AMOUNT_RATIO_UPPER = 3.0

# Canonical set of realtime-safe feature columns consumed by the model.
# Any change here must be reflected in the saved ``feature_columns.pkl`` artifact.
# NOTE: `step` và `step_hour_of_day` đã bị loại bỏ khỏi model input.
# Chúng là artifact của simulation PaySim (fraudsters hoạt động theo giờ cụ thể),
# không phải signal thực tế. Giữ trong pipeline để tính step_hour_of_day nếu cần
# nhưng KHÔNG đưa vào model.
REALTIME_SAFE_FEATURE_COLUMNS = [
    # Amount features
    "amount",
    "amount_log1p",
    "amount_threshold_ratio",
    # Transaction type — signal thực tế (TRANSFER/CASH_OUT rủi ro hơn)
    "type",
    # Interaction features — amount × type cross signals
    "amount_x_transfer",
    "amount_x_cashout",
    # Behavioural interaction features
    "amount_to_avg_ratio",
    "large_amount_new_user",
    # Destination pattern
    "dest_is_merchant",
]

# Post-transaction columns that are only known *after* a transaction settles.
_LEAKAGE_COLUMNS = [
    "newbalanceOrig",
    "newbalanceDest",
    "balance_diff_org",
    "balance_diff_dest",
]


def drop_post_transaction_columns(df: pd.DataFrame) -> pd.DataFrame:
    """Remove columns that are only available after transaction completion."""
    return df.drop(
        columns=[c for c in _LEAKAGE_COLUMNS if c in df.columns],
        errors="ignore",
    )


def feature_engineering(
    df: pd.DataFrame,
    is_training: bool = True,
    amount_threshold: float | None = None,
    amount_clip_value: float | None = None,
    random_state: int = 42,
) -> Tuple[pd.DataFrame, float, float]:
    """Build production-safe features from the raw transaction frame.

    Hardening decisions:
      - Remove all direct balance / ratio features from model input.
      - Replace binary ``is_large_amount`` with continuous
        ``amount_threshold_ratio``.
      - Clip extreme amounts using a training-only 99.9th percentile cap and
        persist that cap for inference-time consistency.
      - Add deterministic training-only noise to amount and behavioural
        features to smooth sharp probability cliffs.

    Args:
        df:               Input DataFrame (post-cleaning, pre-split).
        is_training:      When ``True`` and *amount_threshold* is ``None``,
                          the soft amount reference is computed from the 95th
                          percentile of the clipped amount distribution.
        amount_threshold: Continuous amount reference scale persisted from training.
        amount_clip_value: Upper clipping cap persisted from training.
        random_state:     Seed used for deterministic training-only noise.

    Returns:
        ``(feature_df, amount_threshold, amount_clip_value)``.
    """
    working = df.copy()
    working = drop_post_transaction_columns(working)

    raw_amount = working["amount"].clip(lower=0.0)

    if is_training and amount_clip_value is None:
        amount_clip_value = float(raw_amount.quantile(0.999))
        print(f"Amount clip value computed from training data: {amount_clip_value:,.2f}")
    elif amount_clip_value is not None:
        amount_clip_value = float(amount_clip_value)
        print(f"Using supplied amount clip value: {amount_clip_value:,.2f}")
    else:
        amount_clip_value = float(raw_amount.max()) if len(raw_amount) else 100_000.0
        print(f"Using default amount clip value: {amount_clip_value:,.2f}")

    amount_clipped = raw_amount.clip(upper=amount_clip_value)

    if is_training and amount_threshold is None:
        amount_threshold = float(amount_clipped.quantile(0.95))
        print(f"Amount threshold computed from training data: {amount_threshold:,.2f}")
    elif amount_threshold is not None:
        amount_threshold = float(amount_threshold)
        print(f"Using supplied amount threshold: {amount_threshold:,.2f}")
    else:
        amount_threshold = 100_000.0
        print(f"Using default amount threshold: {amount_threshold:,.2f}")

    # ── Pre-transaction balance features (available before settlement) ──
    old_bal_org = (
        working["oldbalanceOrg"].clip(lower=0.0)
        if "oldbalanceOrg" in working.columns
        else pd.Series(0.0, index=working.index)
    )
    working["balance_log1p_org"] = np.log1p(old_bal_org)
    working["amount_balance_ratio"] = (
        working["amount"] / np.maximum(old_bal_org, 1.0)
    ).clip(upper=10.0)

    working["oldbalanceDest"] = (
        working["oldbalanceDest"].clip(lower=0.0)
        if "oldbalanceDest" in working.columns else 0.0
    )
    working["balance_log1p_dest"] = np.log1p(working["oldbalanceDest"])
    working["dest_is_empty"] = (working["oldbalanceDest"] == 0.0).astype(int)

    rng = np.random.default_rng(random_state)
    if is_training:
        amount_noise = rng.normal(0.0, _AMOUNT_NOISE_STD, len(working))
        amount_clipped = np.clip(
            amount_clipped.to_numpy() * (1.0 + amount_noise),
            0.0,
            amount_clip_value,
        )
        working["amount"] = amount_clipped
    else:
        working["amount"] = amount_clipped

    working["amount_log1p"] = np.log1p(working["amount"].clip(lower=0.0))
    working["amount_threshold_ratio"] = (
        working["amount"] / max(amount_threshold, 1.0)
    ).clip(lower=0.0, upper=_AMOUNT_RATIO_UPPER)

    if is_training:
        for column in SAFE_TIME_FEATURE_COLUMNS:
            if column not in working.columns:
                continue
            if column in {"transaction_frequency_change", "amount_zscore_user"}:
                working[column] = working[column] + rng.normal(
                    0.0, _BEHAVIORAL_NOISE_STD, len(working)
                )
            else:
                scale_noise = rng.normal(0.0, _BEHAVIORAL_NOISE_STD, len(working))
                working[column] = np.clip(
                    working[column].to_numpy() * (1.0 + scale_noise),
                    0.0,
                    None,
                )

    # ── Time features ──────────────────────────────────────────────────────
    if "step" in working.columns:
        working["step_hour_of_day"] = working["step"] % 24

    # ── Interaction features ───────────────────────────────────────────────
    if "type" in working.columns:
        working["amount_x_transfer"] = (
            working["amount"] * (working["type"] == "TRANSFER").astype(float)
        )
        working["amount_x_cashout"] = (
            working["amount"] * (working["type"] == "CASH_OUT").astype(float)
        )

    if "user_avg_amount" in working.columns:
        working["amount_to_avg_ratio"] = (
            working["amount"] / np.maximum(working["user_avg_amount"], 1.0)
        ).clip(upper=10.0)
    else:
        working["amount_to_avg_ratio"] = 1.0

    if "is_cold_start" in working.columns and "amount_threshold_ratio" in working.columns:
        working["large_amount_new_user"] = (
            working["is_cold_start"] * working["amount_threshold_ratio"]
        )
    else:
        working["large_amount_new_user"] = 0.0

    if "nameDest" in working.columns:
        working["dest_is_merchant"] = (
            working["nameDest"].astype(str).str.startswith("M").astype(int)
        )
    else:
        working["dest_is_merchant"] = 0

    print(f"Features engineered: {[c for c in REALTIME_SAFE_FEATURE_COLUMNS if c in working.columns]}")
    return working, amount_threshold, amount_clip_value


def prepare_features_and_target(df: pd.DataFrame) -> Tuple[pd.DataFrame, pd.Series]:
    """Split the DataFrame into feature matrix ``X`` and target series ``y``."""
    y = df["isFraud"]
    X = df.drop(columns=["isFraud"])
    print(f"X: {X.shape}  |  y distribution: {dict(y.value_counts())}")
    return X, y
