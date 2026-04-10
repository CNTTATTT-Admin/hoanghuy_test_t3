"""Post-processing: convert a calibrated probability into a structured result.

``PostProcessor`` is the final stage of the inference pipeline.  It combines:
  - Decision-threshold classification (``is_fraud``).
  - Risk scoring (``risk_score``, ``risk_level``).
  - Human-readable explanation (``reasons``).

Keeping this logic separate from ``FraudPredictor`` means the threshold,
risk boundaries, and explanation rules can be updated independently of the
model — no retraining required.
"""

from __future__ import annotations

import os
import sys
from typing import Any, Dict, List

_HERE = os.path.dirname(os.path.abspath(__file__))
_PROJECT_ROOT = os.path.dirname(os.path.dirname(_HERE))
if _PROJECT_ROOT not in sys.path:
    sys.path.insert(0, _PROJECT_ROOT)

from ml.explainability.explainable_ai import FraudExplainer
from ml.risk.risk_scoring import RiskScorer, RiskThresholds
from ml.utils.helpers import get_logger

logger = get_logger("ml.postprocessor")


class PostProcessor:
    """Apply threshold, risk scoring, and explanation to a raw probability.

    Args:
        decision_threshold: Probability at or above which the transaction is
            flagged as fraud.
        high_risk_threshold: Probability at or above which risk level is
            ``"HIGH"`` (must be ≥ *decision_threshold*).
        feature_names:      Ordered feature names from the artifact bundle,
            used to validate explanation keys.
    """

    def __init__(
        self,
        decision_threshold: float = 0.35,
        high_risk_threshold: float | None = None,
        feature_names: List[str] | None = None,
    ) -> None:
        if high_risk_threshold is None:
            high_risk_threshold = max(0.75, min(0.95, decision_threshold + 0.25))

        self.thresholds = RiskThresholds(
            decision_threshold=decision_threshold,
            high_risk_threshold=high_risk_threshold,
        )
        self._scorer = RiskScorer(thresholds=self.thresholds)
        self._explainer = FraudExplainer(feature_names or [])

    def update_feature_names(self, feature_names: List[str]) -> None:
        """Refresh feature names after loading new artifacts."""
        self._explainer.update_feature_names(feature_names)

    def process(
        self,
        probability: float,
        feature_frame: Dict[str, Any],
        top_k: int = 3,
    ) -> Dict[str, Any]:
        """Produce the final inference output dict.

        Args:
            probability:   Calibrated fraud probability from ``FraudPredictor``.
            feature_frame: Pre-transform feature values (used for explanation).
            top_k:         Maximum number of explanation reasons.

        Returns:
            Dict with keys ``is_fraud``, ``fraud_probability``, ``risk_score``,
            ``risk_level``, ``decision_threshold``, ``reasons``.
        """
        is_fraud = bool(probability >= self.thresholds.decision_threshold)
        scored = self._scorer.score_output(probability)
        reasons = self._explainer.explain(
            probability=probability,
            decision_threshold=self.thresholds.decision_threshold,
            feature_frame=feature_frame,
            top_k=top_k,
        )

        return {
            "is_fraud": is_fraud,
            "fraud_probability": float(probability),
            "risk_score": float(scored["risk_score"]),
            "risk_level": str(scored["risk_level"]),
            "decision_threshold": float(self.thresholds.decision_threshold),
            "reasons": reasons,
        }
