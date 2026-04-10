"""Central preprocessing orchestrator for the fraud detection pipeline.

Responsibilities:
  - Load raw data and produce the primary train / test split.
  - Perform temporal validation split within the training window.
  - Down-sample the majority class in the training set *only*.
  - Fit the ``ColumnTransformer`` on training data and apply it consistently
    to validation, test, and inference inputs.
  - Persist and reload all preprocessing artifacts.

Key design constraints
  - **Split first, sample second**: the validation and test sets always reflect
    the real class imbalance (~0.13 % fraud in PaySim).
  - **No leakage**: only ``REALTIME_SAFE_FEATURE_COLUMNS`` are fed to the model.
"""

from __future__ import annotations

import os
from typing import Dict, List, Tuple

import joblib
import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder, StandardScaler

try:
    from .cleaning import handle_missing_values, remove_unnecessary_columns
    from .data_loading import load_data
    from .feature_engineering import (
        REALTIME_SAFE_FEATURE_COLUMNS,
        drop_post_transaction_columns,
        feature_engineering,
        prepare_features_and_target,
    )
    from .split import split_data
    from .validation import DataValidator
except ImportError:
    from pipeline.cleaning import handle_missing_values, remove_unnecessary_columns
    from pipeline.data_loading import load_data
    from pipeline.feature_engineering import (
        REALTIME_SAFE_FEATURE_COLUMNS,
        drop_post_transaction_columns,
        feature_engineering,
        prepare_features_and_target,
    )
    from pipeline.split import split_data
    from pipeline.validation import DataValidator

from ml.inference.safe_feature_engineering import (
    SAFE_TIME_FEATURE_COLUMNS,
    create_safe_time_features,
)

# Absolute path anchors — work regardless of cwd
_ML_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
_PROJECT_ROOT = os.path.dirname(_ML_DIR)
_DEFAULT_DATA_PATH = os.path.join(_PROJECT_ROOT, "data", "paysim.csv")
_DEFAULT_MODEL_DIR = os.path.join(_PROJECT_ROOT, "models")


class FraudDetectionPreprocessor:
    """Training and inference preprocessor with strict feature consistency.

    Public interface
    ────────────────
    Training path:
        1. ``load_base_split_frames()``          → raw train / test DataFrames
        2. ``temporal_train_validation_split()`` → model_train / validation
        3. ``_downsample_training_frame()``      → sampled model_train
        4. ``fit_transform_train_eval()``        → X/y arrays + artifacts dict

    Inference path (single transaction):
        ``prepare_inference_frame()`` + ``preprocess_inference()``
    """

    def __init__(
        self,
        data_path: str = None,
        model_dir: str = None,
    ) -> None:
        self.data_path = data_path or _DEFAULT_DATA_PATH
        self.model_dir = model_dir or _DEFAULT_MODEL_DIR
        self._validator = DataValidator()
        os.makedirs(self.model_dir, exist_ok=True)

    # ── Training path ──────────────────────────────────────────────────────

    def load_base_split_frames(self) -> Tuple[pd.DataFrame, pd.DataFrame]:
        """Load PaySim CSV and return (train_raw, test_raw)."""
        raw_df = load_data(self.data_path)
        self._validator.validate(raw_df, context="PaySim CSV")
        train_raw, test_raw = split_data(raw_df, method="hybrid")
        return train_raw, test_raw

    def temporal_train_validation_split(
        self,
        train_raw: pd.DataFrame,
        validation_size: float = 0.2,
    ) -> Tuple[pd.DataFrame, pd.DataFrame]:
        """Split the training window temporally into model_train / validation.

        The validation set is kept at real prevalence — no down-sampling.
        """
        ordered = train_raw.sort_values("step").reset_index(drop=True)
        cut = max(1, int(len(ordered) * (1.0 - validation_size)))
        model_train = ordered.iloc[:cut].copy()
        validation = ordered.iloc[cut:].copy()
        print(
            f"Temporal validation split: "
            f"model_train: {model_train.shape}  (max_step={model_train['step'].max()})"
            f"  validation: {validation.shape}  (min_step={validation['step'].min()})"
        )
        return model_train, validation

    def _downsample_training_frame(
        self,
        train_df: pd.DataFrame,
        negative_multiplier: int = 10,
        random_state: int = 42,
    ) -> pd.DataFrame:
        """Down-sample the majority (non-fraud) class in the training set.

        Validation and test sets are never touched by this method.
        """
        fraud_df = train_df[train_df["isFraud"] == 1].copy()
        nonfraud_df = train_df[train_df["isFraud"] == 0].copy()

        if fraud_df.empty or nonfraud_df.empty:
            return train_df.sort_values("step").reset_index(drop=True)

        n_sample = min(len(nonfraud_df), len(fraud_df) * negative_multiplier)
        nonfraud_sample = nonfraud_df.sample(n=n_sample, random_state=random_state)
        sampled = (
            pd.concat([fraud_df, nonfraud_sample])
            .sort_values("step")
            .reset_index(drop=True)
        )
        print(
            f"Down-sampled training frame: {sampled.shape}  "
            f"fraud_rate={float(sampled['isFraud'].mean()):.4%}"
        )
        return sampled

    def fit_transform_train_eval(
        self,
        train_raw: pd.DataFrame,
        eval_raw: pd.DataFrame,
        persist_artifacts: bool = True,
        amount_threshold: float | None = None,
        amount_clip_value: float | None = None,
        random_state: int = 42,
    ) -> Tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray, List[str], Dict[str, object]]:
        """Fit the preprocessor on *train_raw* and transform both splits.

        Args:
            amount_threshold: If provided, use this threshold for large transaction flagging.
                            If None, compute from train_raw via quantile(0.95).

        Returns:
            ``(X_train, X_eval, y_train, y_eval, feature_names, artifacts)``
        """
        train_df, computed_threshold, computed_clip = self._build_feature_frame(
            train_raw,
            amount_threshold=amount_threshold,
            amount_clip_value=amount_clip_value,
            is_training=True,
            random_state=random_state,
        )
        if amount_threshold is None:
            amount_threshold = computed_threshold
        if amount_clip_value is None:
            amount_clip_value = computed_clip
        eval_df, _, _ = self._build_feature_frame(
            eval_raw,
            amount_threshold=amount_threshold,
            amount_clip_value=amount_clip_value,
            is_training=False,
            random_state=random_state,
        )

        X_train, y_train = prepare_features_and_target(train_df)
        X_eval, y_eval = prepare_features_and_target(eval_df)

        preprocessor, feature_cols = self._build_column_transformer(X_train)
        X_train_t = preprocessor.fit_transform(X_train[feature_cols])
        X_eval_t = preprocessor.transform(X_eval[feature_cols])
        feature_names = self._get_feature_names(preprocessor, feature_cols)

        if persist_artifacts:
            self._save_preprocessor(preprocessor)
            self._save_amount_threshold(amount_threshold)
            self._save_amount_clip_value(amount_clip_value)
            self._save_feature_columns(feature_cols)

        print(
            f"Transformed: train={X_train_t.shape}  eval={X_eval_t.shape}  "
            f"fraud_ratio: train={float(np.mean(y_train)):.4%}  eval={float(np.mean(y_eval)):.4%}"
        )
        artifacts: Dict[str, object] = {
            "preprocessor": preprocessor,
            "feature_cols": feature_cols,
            "feature_names": feature_names,
            "amount_threshold": amount_threshold,
            "amount_clip_value": amount_clip_value,
        }
        return X_train_t, X_eval_t, y_train.to_numpy(), y_eval.to_numpy(), feature_names, artifacts

    def transform_raw_frame_with_artifacts(
        self,
        raw_df: pd.DataFrame,
        artifacts: Dict[str, object],
    ) -> Tuple[np.ndarray, np.ndarray]:
        """Transform a raw frame using a pre-fitted artifact dict."""
        prepared, _, _ = self._build_feature_frame(
            raw_df,
            amount_threshold=float(artifacts["amount_threshold"]),
            amount_clip_value=float(artifacts.get("amount_clip_value", np.inf)),
            is_training=False,
        )
        X, y = prepare_features_and_target(prepared)
        X_t = artifacts["preprocessor"].transform(X[artifacts["feature_cols"]])
        return X_t, y.to_numpy()

    def preprocess_evaluation_frame(self, raw_df: pd.DataFrame) -> Tuple[np.ndarray, np.ndarray]:
        """Transform a held-out test frame using persisted artifacts."""
        artifacts: Dict[str, object] = {
            "preprocessor": self._load_preprocessor(),
            "feature_cols": self._load_feature_columns(),
            "amount_threshold": self._load_amount_threshold(),
            "amount_clip_value": self._load_amount_clip_value(),
        }
        return self.transform_raw_frame_with_artifacts(raw_df, artifacts)

    # ── Inference path ─────────────────────────────────────────────────────

    def prepare_inference_frame(self, data: pd.DataFrame) -> pd.DataFrame:
        """Build the exact feature frame for a single inference row.

        Applies the same transformations as training (cleaning, feature
        engineering) and fills any missing columns with safe defaults,
        ensuring the schema matches the fitted ``ColumnTransformer``.
        """
        amount_threshold = self._load_amount_threshold()
        amount_clip_value = self._load_amount_clip_value()
        feature_cols = self._load_feature_columns()

        working = data.copy()
        working = handle_missing_values(working)
        working = remove_unnecessary_columns(working)
        if {"step", "nameOrig", "amount"}.issubset(working.columns):
            if not set(SAFE_TIME_FEATURE_COLUMNS).issubset(working.columns):
                working = create_safe_time_features(working)
        working = drop_post_transaction_columns(working)
        working, _, _ = feature_engineering(
            working,
            is_training=False,
            amount_threshold=amount_threshold,
            amount_clip_value=amount_clip_value,
        )
        self._validate_feature_frame(working, context="inference feature frame")

        # Fill any columns the model expects but the request omitted.
        for col in feature_cols:
            if col not in working.columns:
                working[col] = "UNKNOWN" if col == "type" else 0.0

        return working[feature_cols].copy()

    def preprocess_inference(self, data: pd.DataFrame) -> np.ndarray:
        """Return a transformed numpy array ready for ``model.predict_proba``."""
        preprocessor = self._load_preprocessor()
        feature_frame = self.prepare_inference_frame(data)
        return preprocessor.transform(feature_frame)

    # ── Internal helpers ───────────────────────────────────────────────────

    def _build_feature_frame(
        self,
        df: pd.DataFrame,
        amount_threshold: float | None = None,
        amount_clip_value: float | None = None,
        is_training: bool = True,
        add_behavioral: bool = True,
        random_state: int = 42,
    ) -> Tuple[pd.DataFrame, float, float]:
        """Clean → feature-engineer a raw frame, returning (feature_df, threshold).

        When *add_behavioral* is ``True``, safe time-window features are
        computed from past transactions per user (no future leakage).
        """
        cleaned = handle_missing_values(df.copy())
        cleaned = remove_unnecessary_columns(cleaned)

        # Behavioral features BEFORE dropping post-transaction columns,
        # because create_safe_time_features only needs step/nameOrig/amount.
        # Skip if already pre-computed on the full (non-downsampled) frame.
        if add_behavioral and {"step", "nameOrig", "amount"}.issubset(cleaned.columns):
            if not set(SAFE_TIME_FEATURE_COLUMNS).issubset(cleaned.columns):
                cleaned = create_safe_time_features(cleaned)

        cleaned = drop_post_transaction_columns(cleaned)
        X, y = prepare_features_and_target(cleaned)
        X, threshold, clip_value = feature_engineering(
            X,
            is_training=is_training,
            amount_threshold=amount_threshold,
            amount_clip_value=amount_clip_value,
            random_state=random_state,
        )
        self._validate_feature_frame(X, context="feature frame")
        X["isFraud"] = y.values
        return X, threshold, clip_value

    def compute_amount_parameters(
        self,
        train_raw: pd.DataFrame,
        random_state: int = 42,
    ) -> Tuple[float, float]:
        """Compute amount soft-scale and clipping cap before downsampling.

        Use case: compute both values from model_train_raw BEFORE downsampling,
        so inference uses the same softened amount distribution as training.
        """
        _, threshold, clip_value = self._build_feature_frame(
            train_raw,
            amount_threshold=None,
            amount_clip_value=None,
            is_training=True,
            add_behavioral=True,
            random_state=random_state,
        )
        return threshold, clip_value

    def compute_amount_threshold(
        self,
        train_raw: pd.DataFrame,
        random_state: int = 42,
    ) -> float:
        threshold, _ = self.compute_amount_parameters(train_raw, random_state=random_state)
        return threshold

    def _validate_feature_frame(self, feature_df: pd.DataFrame, context: str) -> None:
        numeric = feature_df.select_dtypes(include=[np.number])
        if numeric.isnull().any().any():
            raise ValueError(f"[{context}] NaN detected in numeric features")
        if not np.isfinite(numeric.to_numpy()).all():
            raise ValueError(f"[{context}] Non-finite values detected in numeric features")

    def _build_column_transformer(
        self, X_train: pd.DataFrame
    ) -> Tuple[ColumnTransformer, List[str]]:
        """Build a ColumnTransformer from the training feature frame."""
        all_expected = REALTIME_SAFE_FEATURE_COLUMNS + SAFE_TIME_FEATURE_COLUMNS
        categorical_cols = ["type"] if "type" in X_train.columns else []
        numerical_cols = [
            c for c in all_expected
            if c in X_train.columns and c not in categorical_cols
        ]
        feature_cols = numerical_cols + categorical_cols
        transformer = ColumnTransformer(
            transformers=[
                ("num", StandardScaler(), numerical_cols),
                ("cat", OneHotEncoder(handle_unknown="ignore", sparse_output=False), categorical_cols),
            ],
            remainder="drop",
        )
        return transformer, feature_cols

    @staticmethod
    def _get_feature_names(
        transformer: ColumnTransformer, feature_cols: List[str]
    ) -> List[str]:
        names: List[str] = []
        for name, estimator, cols in transformer.transformers_:
            if name == "cat" and hasattr(estimator, "get_feature_names_out"):
                names.extend(estimator.get_feature_names_out(cols).tolist())
            elif name != "remainder":
                names.extend(cols if isinstance(cols, list) else [cols])
        return names

    # ── Artifact persistence ───────────────────────────────────────────────

    def _path(self, filename: str) -> str:
        return os.path.join(self.model_dir, filename)

    def _save_preprocessor(self, preprocessor: ColumnTransformer) -> None:
        path = self._path("preprocessor.pkl")
        joblib.dump(preprocessor, path)
        print(f"Preprocessor saved: {path}")

    def _load_preprocessor(self) -> ColumnTransformer:
        return joblib.load(self._path("preprocessor.pkl"))

    def _save_feature_columns(self, feature_cols: List[str]) -> None:
        path = self._path("feature_columns.pkl")
        joblib.dump(feature_cols, path)
        print(f"Feature columns saved: {path}")

    def _load_feature_columns(self) -> List[str]:
        cols = list(joblib.load(self._path("feature_columns.pkl")))

        # Backward compatibility: older artifacts may store one-hot output names
        # (e.g. type_TRANSFER) instead of raw input columns expected by the preprocessor.
        if "type" not in cols and any(c.startswith("type_") for c in cols):
            return REALTIME_SAFE_FEATURE_COLUMNS.copy()

        return cols

    def _save_amount_threshold(self, threshold: float) -> None:
        path = self._path("amount_threshold.pkl")
        joblib.dump(threshold, path)
        print(f"Amount threshold saved: {path}")

    def _load_amount_threshold(self) -> float:
        return float(joblib.load(self._path("amount_threshold.pkl")))

    def _save_amount_clip_value(self, amount_clip_value: float) -> None:
        path = self._path("amount_clip_value.pkl")
        joblib.dump(amount_clip_value, path)
        print(f"Amount clip value saved: {path}")

    def _load_amount_clip_value(self) -> float:
        path = self._path("amount_clip_value.pkl")
        if not os.path.exists(path):
            return float("inf")
        return float(joblib.load(path))
