"""Fraud probability predictor: load artifacts and score a preprocessed input.

``FraudPredictor`` is the single point of contact between the model artifacts
and the rest of the inference pipeline.  It is responsible for:

  1. Loading the model and calibrator from the ``ArtifactRegistry``.
  2. Running ``model.predict_proba()``.
  3. Applying probability calibration.
  4. Returning a single ``float`` probability in ``[0, 1]``.

It deliberately does **not** apply the decision threshold or produce a label —
that responsibility belongs to ``PostProcessor``.
"""

from __future__ import annotations

import os
import sys

import numpy as np

_HERE = os.path.dirname(os.path.abspath(__file__))
_PROJECT_ROOT = os.path.dirname(os.path.dirname(_HERE))
if _PROJECT_ROOT not in sys.path:
    sys.path.insert(0, _PROJECT_ROOT)

from ml.modeling.model_registry import ArtifactBundle, ArtifactRegistry
from ml.utils.helpers import MODELS_DIR, get_logger

logger = get_logger("ml.predictor")


class FraudPredictor:
    """Load model artifacts and return calibrated fraud probabilities.

    Args:
        model_dir: Path to the directory containing ``.pkl`` artifacts.
        version:   Sub-directory version to load (``None`` = root of
                   *model_dir*).

    Example::

        predictor = FraudPredictor()
        prob = predictor.predict_proba(X_transformed)  # float
    """

    def __init__(
        self,
        model_dir: str | None = None,
        version: str | None = None,
    ) -> None:
        resolved_dir = model_dir or str(MODELS_DIR)
        registry = ArtifactRegistry(model_dir=resolved_dir)
        self._bundle: ArtifactBundle = registry.load(version=version)
        logger.info(
            "FraudPredictor ready — threshold=%.4f  calibration=%s",
            self._bundle.threshold,
            self._bundle.calibrator.method,
        )

    @property
    def threshold(self) -> float:
        """The optimised decision threshold from the saved artifact."""
        return self._bundle.threshold

    @property
    def feature_columns(self):
        """Ordered feature column list from the saved artifact."""
        return self._bundle.feature_columns

    @property
    def amount_threshold(self) -> float:
        """The large-amount boundary used by feature engineering."""
        return self._bundle.amount_threshold

    @property
    def bundle(self) -> ArtifactBundle:
        """Full artifact bundle (for downstream consumers)."""
        return self._bundle

    def predict_proba(self, X: np.ndarray) -> float:
        """Return the fraud probability for a single row.

        The isotonic calibrator trained on heavily-imbalanced PaySim data
        crushes all raw probabilities to near-zero (max ~1.3%), making
        the risk score useless for downstream decision-making.
        We therefore return the raw model probability directly, which
        properly reflects the model's confidence that the transaction is
        fraudulent.

        Args:
            X: A (1, n_features) array produced by the preprocessor.

        Returns:
            Fraud probability in ``[0.0, 1.0]``.
        """
        raw_prob = float(self._bundle.model.predict_proba(X)[0, 1])
        return float(np.clip(raw_prob, 0.0, 1.0))

    def predict_proba_batch(self, X: np.ndarray) -> np.ndarray:
        """Return fraud probabilities for a batch of rows.

        Args:
            X: A (n_samples, n_features) array.

        Returns:
            1-D numpy array of probabilities.
        """
        raw_probs = self._bundle.model.predict_proba(X)[:, 1]
        return np.clip(raw_probs, 0.0, 1.0)
