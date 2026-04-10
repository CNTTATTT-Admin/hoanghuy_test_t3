"""Typed configuration schema for the ML pipeline."""

from __future__ import annotations

from dataclasses import dataclass


@dataclass
class ModelConfig:
    """All training/inference knobs, loaded from configs/model_config.yaml.

    Attributes:
        calibration_method: One of ``"none"``, ``"platt"``, ``"isotonic"``.
        calibration_validation_size: Fraction of the training window reserved
            for validation (calibration + threshold tuning).
        random_state: Global random seed for reproducibility.
        prediction_threshold: Fallback decision threshold when
            ``threshold_selection`` is ``"fixed"``.
        threshold_selection: Threshold search strategy —
            ``"f1"`` (maximise F1), ``"recall"`` (maximise recall),
            ``"precision_at_recall"`` (best precision at target recall),
            or ``"fixed"`` (use ``prediction_threshold`` unchanged).
        train_negative_multiplier: Down-sampling ratio for the majority class
            in the training set (negative : positive).
        temporal_backtest_folds: Number of ``TimeSeriesSplit`` folds used
            during temporal back-testing.
        target_recall: Minimum recall required when using
            ``threshold_selection="precision_at_recall"``.
    """

    calibration_method: str = "none"
    calibration_validation_size: float = 0.2
    random_state: int = 42
    prediction_threshold: float = 0.35
    threshold_selection: str = "precision_at_recall"
    train_negative_multiplier: int = 50
    temporal_backtest_folds: int = 3
    target_recall: float = 0.8
