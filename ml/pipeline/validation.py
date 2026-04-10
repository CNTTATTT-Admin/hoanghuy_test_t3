"""Schema validation for the raw PaySim DataFrame.

A lightweight validation step that fails fast with actionable error messages
before expensive training operations begin.
"""

from __future__ import annotations

from typing import List

import pandas as pd

# Minimum required columns in the raw PaySim CSV.
REQUIRED_COLUMNS: List[str] = [
    "step",
    "type",
    "amount",
    "nameOrig",
    "oldbalanceOrg",
    "nameDest",
    "oldbalanceDest",
    "isFraud",
]

_VALID_TYPES = {"PAYMENT", "TRANSFER", "CASH_OUT", "DEBIT", "CASH_IN"}


class DataValidator:
    """Validate a raw PaySim DataFrame before it enters the training pipeline."""

    def validate(self, df: pd.DataFrame, context: str = "raw data") -> None:
        """Run all checks and raise ``ValueError`` on the first failure.

        Args:
            df:      DataFrame to validate.
            context: Human-readable label used in error messages.
        """
        self._check_required_columns(df, context)
        self._check_no_negative_amounts(df, context)
        self._check_transaction_types(df, context)
        self._check_target_binary(df, context)
        print(f"DataValidator: {context} passed all checks — {df.shape}")

    def _check_required_columns(self, df: pd.DataFrame, context: str) -> None:
        missing = [c for c in REQUIRED_COLUMNS if c not in df.columns]
        if missing:
            raise ValueError(f"[{context}] Missing required columns: {missing}")

    def _check_no_negative_amounts(self, df: pd.DataFrame, context: str) -> None:
        if (df["amount"] < 0).any():
            raise ValueError(f"[{context}] Column 'amount' contains negative values.")

    def _check_transaction_types(self, df: pd.DataFrame, context: str) -> None:
        unknown = set(df["type"].unique()) - _VALID_TYPES
        if unknown:
            raise ValueError(f"[{context}] Unknown transaction types: {unknown}")

    def _check_target_binary(self, df: pd.DataFrame, context: str) -> None:
        values = set(df["isFraud"].unique())
        if not values.issubset({0, 1}):
            raise ValueError(f"[{context}] 'isFraud' must be binary (0/1); found: {values}")
