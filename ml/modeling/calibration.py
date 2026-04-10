"""Probability calibration for fraud model outputs.

Supports three strategies:
- ``"none"``     — raw probabilities passthrough
- ``"platt"``    — logistic-regression calibration (Platt scaling)
- ``"isotonic"`` — isotonic-regression calibration
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Literal, Optional

import numpy as np
from sklearn.isotonic import IsotonicRegression
from sklearn.linear_model import LogisticRegression

CalibrationMethod = Literal["none", "platt", "isotonic"]


@dataclass
class ProbabilityCalibrator:
    """Fit and apply probability calibration on validation-set predictions only.

    Attributes:
        method: Calibration strategy.
        model: Fitted sklearn estimator, or ``None`` when method is ``"none"``.
    """

    method: CalibrationMethod = "none"
    model: Optional[object] = None
    random_state: int = 42

    def fit(self, raw_probabilities: np.ndarray, y_true: np.ndarray) -> "ProbabilityCalibrator":
        """Fit the calibrator on held-out validation predictions."""
        probs = np.asarray(raw_probabilities, dtype=float).reshape(-1)
        labels = np.asarray(y_true, dtype=int).reshape(-1)

        if self.method == "none":
            self.model = None
            return self

        if len(np.unique(labels)) < 2:
            # Calibration is undefined with a single class — fall back to passthrough.
            self.method = "none"
            self.model = None
            return self

        if self.method == "platt":
            cal = LogisticRegression(max_iter=1000, random_state=self.random_state)
            cal.fit(probs.reshape(-1, 1), labels)
            self.model = cal
            return self

        if self.method == "isotonic":
            cal = IsotonicRegression(out_of_bounds="clip")
            cal.fit(probs, labels)
            self.model = cal
            return self

        raise ValueError(f"Unsupported calibration method: {self.method!r}")

    def transform(self, raw_probabilities: np.ndarray) -> np.ndarray:
        """Apply calibration to a batch of raw probabilities."""
        probs = np.asarray(raw_probabilities, dtype=float).reshape(-1)

        if self.method == "none" or self.model is None:
            return np.clip(probs, 0.0, 1.0)

        if self.method == "platt":
            calibrated = self.model.predict_proba(probs.reshape(-1, 1))[:, 1]
            return np.clip(calibrated, 0.0, 1.0)

        if self.method == "isotonic":
            return np.clip(self.model.predict(probs), 0.0, 1.0)

        return np.clip(probs, 0.0, 1.0)

    def transform_one(self, raw_probability: float) -> float:
        """Apply calibration to a single raw probability scalar."""
        return float(self.transform(np.array([raw_probability]))[0])
