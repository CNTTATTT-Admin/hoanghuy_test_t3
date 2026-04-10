"""DataFrame cleaning: missing-value handling and unnecessary-column removal."""

from __future__ import annotations

import pandas as pd

# Columns that leak target information or carry no predictive signal.
_COLUMNS_TO_DROP = ["isFlaggedFraud"]


def handle_missing_values(df: pd.DataFrame) -> pd.DataFrame:
    """Drop rows with any missing value.

    PaySim is a synthetic dataset with no real missing values; this guard
    exists to make the pipeline robust against upstream data quality issues.
    """
    missing_counts = df.isnull().sum()
    non_zero_missing = missing_counts[missing_counts > 0]
    if not non_zero_missing.empty:
        print(f"Missing values detected:\n{non_zero_missing}")
    df = df.dropna()
    print(f"After missing-value handling: {df.shape}")
    return df


def remove_unnecessary_columns(df: pd.DataFrame) -> pd.DataFrame:
    """Drop columns that should not reach the feature-engineering step.

    ``nameOrig`` and ``nameDest`` are intentionally retained for the
    entity-overlap split step and for online behavioural features.
    """
    df = df.drop(
        columns=[col for col in _COLUMNS_TO_DROP if col in df.columns],
        errors="ignore",
    )
    print(f"Columns after cleaning: {list(df.columns)}")
    return df
