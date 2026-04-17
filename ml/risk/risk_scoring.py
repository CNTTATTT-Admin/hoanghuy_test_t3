"""Business risk layer: map calibrated probability → risk score and risk level."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Dict


@dataclass
class RiskThresholds:
    """Ngưỡng quyết định dùng để phân loại rủi ro gian lận.

    Attributes:
        decision_threshold:      Xác suất từ ngưỡng này trở lên → is_fraud = True.
        high_risk_threshold:     Xác suất từ ngưỡng này trở lên → risk_level = "HIGH".
                                 Phải >= decision_threshold.
        auto_block_threshold:    Xác suất từ ngưỡng này trở lên → chặn ngay lập tức,
                                 không cần review (= high_risk_threshold).
        manual_review_threshold: Xác suất từ ngưỡng này → allow nhưng flag để review thủ công.
    """

    decision_threshold: float = 0.02
    high_risk_threshold: float = 0.50
    auto_block_threshold: float = 0.50       # chặn ngay, không cần review
    manual_review_threshold: float = 0.10    # allow nhưng đánh dấu cần review


class RiskScorer:
    """Convert a calibrated probability into a stable risk score and level.

    The score is simply the clipped probability — no heuristic additive
    boosts — so it stays faithful to the model's calibration.
    """

    def __init__(self, thresholds: RiskThresholds | None = None) -> None:
        self.thresholds = thresholds or RiskThresholds()

    def score(self, probability: float) -> float:
        """Return the risk score (= clipped probability)."""
        return float(min(max(probability, 0.0), 1.0))

    def risk_level(self, risk_score: float) -> str:
        """Map a risk score to a human-readable level."""
        if risk_score < self.thresholds.decision_threshold:
            return "LOW"
        if risk_score < self.thresholds.high_risk_threshold:
            return "MEDIUM"
        return "HIGH"

    def score_output(self, probability: float) -> Dict[str, object]:
        """Return a dict with ``risk_score`` and ``risk_level``."""
        s = self.score(probability)
        return {"risk_score": s, "risk_level": self.risk_level(s)}
