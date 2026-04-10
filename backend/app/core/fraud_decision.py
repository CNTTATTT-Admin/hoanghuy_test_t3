"""
Fraud Decision Layer — Tầng quyết định gian lận.

Hoàn toàn tách biệt khỏi model ML. Chỉ chứa business rules thuần túy.
Input: fraud_probability (float 0–1) + risk_level (str)
Output: DecisionResult với đầy đủ thông tin để xử lý tiếp
"""
from __future__ import annotations
from dataclasses import dataclass
from enum import Enum
from typing import Optional


class FraudDecision(str, Enum):
    BLOCKED  = "BLOCKED"
    PENDING  = "PENDING"
    APPROVED = "APPROVED"


# ── Ngưỡng quyết định ── chỉnh tại đây, không ở nơi khác ──────────────────────
BLOCK_THRESHOLD   = 0.90   # ≥ 0.90  → BLOCK ngay lập tức
PENDING_THRESHOLD = 0.70   # ≥ 0.70  → PENDING, chờ xét duyệt thủ công


@dataclass(frozen=True)
class DecisionResult:
    decision:          FraudDecision
    fraud_probability: float
    risk_level:        str
    should_block:      bool           # True → dừng luồng giao dịch
    requires_review:   bool           # True → đưa vào hàng đợi xét duyệt
    block_reason:      Optional[str]  # Chỉ có giá trị khi BLOCKED
    review_reason:     Optional[str]  # Chỉ có giá trị khi PENDING


def make_fraud_decision(fraud_probability: float, risk_level: str) -> DecisionResult:
    """
    Áp dụng ngưỡng kinh doanh để tạo quyết định từ xác suất gian lận.

    Args:
        fraud_probability: float [0.0, 1.0] — đầu ra từ model ML
        risk_level:        'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'

    Returns:
        DecisionResult bất biến chứa quyết định và lý do
    """
    p = float(fraud_probability)

    if p >= BLOCK_THRESHOLD:
        return DecisionResult(
            decision=FraudDecision.BLOCKED,
            fraud_probability=p,
            risk_level=risk_level,
            should_block=True,
            requires_review=False,
            block_reason=(
                f"Xác suất gian lận {p:.1%} vượt ngưỡng chặn tự động "
                f"({BLOCK_THRESHOLD:.0%}). Giao dịch bị từ chối."
            ),
            review_reason=None,
        )

    if p >= PENDING_THRESHOLD:
        return DecisionResult(
            decision=FraudDecision.PENDING,
            fraud_probability=p,
            risk_level=risk_level,
            should_block=False,
            requires_review=True,
            block_reason=None,
            review_reason=(
                f"Xác suất gian lận {p:.1%} nằm trong vùng xét duyệt "
                f"({PENDING_THRESHOLD:.0%}–{BLOCK_THRESHOLD:.0%}). "
                "Cần xét duyệt thủ công."
            ),
        )

    return DecisionResult(
        decision=FraudDecision.APPROVED,
        fraud_probability=p,
        risk_level=risk_level,
        should_block=False,
        requires_review=False,
        block_reason=None,
        review_reason=None,
    )
