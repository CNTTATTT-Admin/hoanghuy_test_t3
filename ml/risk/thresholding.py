"""Threshold optimisation over a validation set.

Searches a dense grid of candidate thresholds and selects the one that
maximises the chosen metric on the *unsampled* validation distribution.
"""

from __future__ import annotations

from typing import Literal

import numpy as np
from sklearn.metrics import f1_score, precision_recall_curve, recall_score

ThresholdStrategy = Literal["f1", "recall", "precision_at_recall", "fixed"]

MIN_SAFE_THRESHOLD = 0.05
MAX_SAFE_THRESHOLD = 0.95
_CANDIDATES: np.ndarray = np.unique(
    np.linspace(MIN_SAFE_THRESHOLD, MAX_SAFE_THRESHOLD, 181)
)


class ThresholdOptimizer:
    """Find the best decision threshold for a given strategy.

    Strategies:
        - ``"f1"``                — maximise binary F1-score.
        - ``"recall"``            — maximise recall (prioritise catching fraud).
        - ``"precision_at_recall"`` — maximise precision subject to
          recall >= *target_recall* (default 0.7).  Business-aligned.
        - ``"fixed"``             — return *fallback* unchanged (no search).
    """

    def find_best(
        self,
        probabilities: np.ndarray, 
        y_true: np.ndarray,
        strategy: ThresholdStrategy = "precision_at_recall",
        fallback: float = 0.35,
        target_recall: float = 0.7,
    ) -> float:
        """Return the optimal threshold as a float.

        Args:
            probabilities: Calibrated fraud probabilities (1-D array).
            y_true:        Ground-truth binary labels.
            strategy:      Optimisation objective.
            fallback:      Returned when ``strategy`` is ``"fixed"`` or when
                           the search finds no improvement.
            target_recall: Minimum recall constraint for
                           ``"precision_at_recall"`` strategy.
        """
        if strategy == "fixed":
            return self._clip_to_safe_range(float(fallback))

        if strategy == "precision_at_recall":
            return self._clip_to_safe_range(self._precision_at_target_recall(
                probabilities, y_true, target_recall, fallback
            ))

        best_threshold = float(fallback)
        best_score = -1.0

        for threshold in _CANDIDATES:
            preds = (probabilities >= threshold).astype(int)
            score = (
                recall_score(y_true, preds, zero_division=0)
                if strategy == "recall"
                else f1_score(y_true, preds, zero_division=0)
            )
            if score > best_score:
                best_score = score
                best_threshold = float(threshold)

        return self._clip_to_safe_range(best_threshold)

    @staticmethod
    def _clip_to_safe_range(threshold: float) -> float:
        return float(np.clip(threshold, MIN_SAFE_THRESHOLD, MAX_SAFE_THRESHOLD))

    @staticmethod
    def _precision_at_target_recall(
        probabilities: np.ndarray,
        y_true: np.ndarray,
        target_recall: float,
        fallback: float,
    ) -> float:
        """Find the threshold that maximises precision while recall >= *target_recall*.

        Uses sklearn's ``precision_recall_curve`` for an exact sweep over all
        unique probability values, then filters to the production-safe range
        [0.05, 0.95].
        """
        precisions, recalls, thresholds = precision_recall_curve(y_true, probabilities)

        valid_mask = (
            (recalls[:-1] >= target_recall)
            & (thresholds >= MIN_SAFE_THRESHOLD)
            & (thresholds <= MAX_SAFE_THRESHOLD)
        )

        if not valid_mask.any():
            # Fall back to best F1 above 0.05 if recall target cannot be met
            best_thr = float(fallback)
            best_f1 = -1.0
            for thr in _CANDIDATES:
                preds = (probabilities >= thr).astype(int)
                f1 = f1_score(y_true, preds, zero_division=0)
                if f1 > best_f1:
                    best_f1 = f1
                    best_thr = float(thr)
            return best_thr

        # Among valid thresholds, pick the one with the highest precision
        best_idx = np.argmax(precisions[:-1][valid_mask])
        return float(thresholds[valid_mask][best_idx])
