"""
Fraud Decision Layer — Tầng quyết định gian lận.

Hoàn toàn tách biệt khỏi model ML. Chỉ chứa business rules thuần túy.
Input: fraud_probability (float 0–1) + risk_level (str)
Output: DecisionResult với đầy đủ thông tin để xử lý tiếp
"""
from __future__ import annotations
import json
import logging
from dataclasses import dataclass
from enum import Enum
from typing import Optional

logger = logging.getLogger(__name__)


class FraudDecision(str, Enum):
    BLOCKED  = "BLOCKED"
    PENDING  = "PENDING"
    APPROVED = "APPROVED"


# ── Ngưỡng quyết định mặc định (fallback) ─────────────────────────────────────
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


async def get_dynamic_thresholds() -> tuple[float, float]:
    """Lấy block/pending threshold từ Redis. Fallback sang hằng số mặc định.

    Returns:
        (block_threshold, pending_threshold) — cả 2 là float [0, 1]
    """
    try:
        from core.redis_client import get_redis  # pylint: disable=import-outside-toplevel
        redis = await get_redis()
        if redis:
            block  = await redis.get("settings:risk:block_threshold")
            pending = await redis.get("settings:risk:pending_threshold")
            if block and pending:
                return float(block), float(pending)
    except Exception as exc:
        logger.warning("Không đọc được threshold từ Redis: %s", exc)

    return BLOCK_THRESHOLD, PENDING_THRESHOLD


async def get_fraud_probability_threshold() -> float:
    """Lấy confidence threshold cho model inference từ Redis. Fallback sang 0.35."""
    try:
        from core.redis_client import get_redis  # pylint: disable=import-outside-toplevel
        redis = await get_redis()
        if redis:
            val = await redis.get("settings:model:confidence_threshold")
            if val:
                return float(val)
    except Exception as exc:
        logger.warning("Không đọc được confidence_threshold từ Redis: %s", exc)

    return 0.35


async def is_test_mode() -> bool:
    """Kiểm tra hệ thống đang ở test mode hay không."""
    try:
        from core.redis_client import get_redis  # pylint: disable=import-outside-toplevel
        redis = await get_redis()
        if redis:
            val = await redis.get("settings:system:test_mode")
            return val is not None and val.lower() == "true"
    except Exception:
        pass
    return False


# ── Rule Evaluation Engine ────────────────────────────────────────────────────

def _calc_balance_ratio(transaction: dict) -> float:
    """Tính tỷ lệ số dư / số tiền giao dịch."""
    amount = float(transaction.get("amount", 0))
    balance = float(transaction.get("oldbalanceOrg", transaction.get("old_balance_orig", 0)))
    if amount <= 0:
        return 0.0
    return balance / amount if balance > 0 else 0.0


def _get_hour_from_step(step: int) -> int:
    """Chuyển step (giờ mô phỏng) thành giờ trong ngày (0–23)."""
    return int(step) % 24


def _evaluate_operator(field_value: object, operator: str, target_value: object) -> bool:
    """Đánh giá 1 điều kiện đơn."""
    ops = {
        ">":       lambda a, b: a > b,
        ">=":      lambda a, b: a >= b,
        "<":       lambda a, b: a < b,
        "<=":      lambda a, b: a <= b,
        "==":      lambda a, b: a == b,
        "!=":      lambda a, b: a != b,
        "in":      lambda a, b: a in b,
        "not_in":  lambda a, b: a not in b,
        "between": lambda a, b: b[0] <= a <= b[1],
    }
    fn = ops.get(operator)
    if fn is None:
        return False
    try:
        return bool(fn(field_value, target_value))
    except (TypeError, IndexError, ValueError):
        return False


def _check_conditions(
    conditions: list,
    transaction: dict,
    fraud_probability: float,
    risk_score: float,
) -> bool:
    """Kiểm tra tất cả conditions (AND logic). True nếu mọi condition thỏa mãn."""
    context: dict = {
        "amount":            float(transaction.get("amount", 0)),
        "transaction_type":  transaction.get("type", transaction.get("transaction_type", "")),
        "balance_ratio":     _calc_balance_ratio(transaction),
        "time_of_day":       _get_hour_from_step(transaction.get("step", 0)),
        "velocity":          float(transaction.get("velocity", 0)),
        "fraud_probability": fraud_probability,
        "risk_score":        risk_score,
    }

    for cond in conditions:
        field     = cond.get("field")   if isinstance(cond, dict) else getattr(cond, "field", None)
        operator  = cond.get("operator") if isinstance(cond, dict) else getattr(cond, "operator", None)
        value     = cond.get("value")   if isinstance(cond, dict) else getattr(cond, "value", None)

        field_value = context.get(field)
        if field_value is None or field is None:
            return False
        if not _evaluate_operator(field_value, operator, value):
            return False

    return True


async def _load_active_rules() -> list:
    """Load active rules từ Redis cache (TTL 5 min). Fallback từ DB."""
    redis = None
    try:
        from core.redis_client import get_redis  # pylint: disable=import-outside-toplevel
        redis = await get_redis()
        if redis:
            cached = await redis.get("rules:active_rules")
            if cached:
                return json.loads(cached)
    except Exception as exc:  # noqa: BLE001
        logger.warning("Không đọc được rules cache từ Redis: %s", exc)

    # Fallback: query DB
    from db.database import get_pool, is_db_enabled  # pylint: disable=import-outside-toplevel
    if not is_db_enabled():
        return []

    pool = get_pool()
    rules: list = []
    try:
        async with pool.acquire() as conn:
            rows = await conn.fetch(
                """
                SELECT rule_id, name, conditions, action, priority
                FROM fraud_rules
                WHERE is_enabled = TRUE
                ORDER BY priority ASC
                """
            )
        rules = []
        for r in rows:
            row = dict(r)
            raw = row.get("conditions")
            if isinstance(raw, str):
                row["conditions"] = json.loads(raw)
            rules.append(row)

        # Cache vào Redis, TTL 5 phút
        try:
            if redis:
                await redis.set("rules:active_rules", json.dumps(rules, default=str), ex=300)
        except Exception as exc:  # noqa: BLE001
            logger.warning("Không cache được rules vào Redis: %s", exc)
    except Exception as exc:  # noqa: BLE001
        logger.warning("Không load được rules từ DB: %s", exc)

    return rules


async def invalidate_rules_cache() -> None:
    """Xóa cache rules khi có thay đổi CRUD."""
    try:
        from core.redis_client import get_redis  # pylint: disable=import-outside-toplevel
        redis = await get_redis()
        if redis:
            await redis.delete("rules:active_rules")
    except Exception as exc:  # noqa: BLE001
        logger.warning("Không xóa được rules cache: %s", exc)


async def evaluate_rules(
    transaction: dict,
    fraud_probability: float,
    risk_score: float,
) -> Optional[DecisionResult]:
    """Áp dụng business rules lên giao dịch.

    Rules được load từ Redis cache (key: rules:active_rules).
    Trả về DecisionResult nếu có rule match, None nếu không có rule nào khớp.
    """
    rules = await _load_active_rules()

    for rule in rules:  # Đã sắp xếp theo priority ASC
        if _check_conditions(rule.get("conditions", []), transaction, fraud_probability, risk_score):
            action = rule.get("action", "REVIEW")
            name   = rule.get("name", "Unknown rule")

            if action == "BLOCK":
                return DecisionResult(
                    decision=FraudDecision.BLOCKED,
                    fraud_probability=fraud_probability,
                    risk_level=_risk_level_from_score(risk_score),
                    should_block=True,
                    requires_review=False,
                    block_reason=f"Rule '{name}' triggered",
                    review_reason=None,
                )
            if action == "REVIEW":
                return DecisionResult(
                    decision=FraudDecision.PENDING,
                    fraud_probability=fraud_probability,
                    risk_level=_risk_level_from_score(risk_score),
                    should_block=False,
                    requires_review=True,
                    block_reason=None,
                    review_reason=f"Rule '{name}' triggered",
                )
            # action == "ALLOW" — override về APPROVED
            return DecisionResult(
                decision=FraudDecision.APPROVED,
                fraud_probability=fraud_probability,
                risk_level=_risk_level_from_score(risk_score),
                should_block=False,
                requires_review=False,
                block_reason=None,
                review_reason=None,
            )

    return None  # Không match rule nào → dùng threshold logic


def _risk_level_from_score(risk_score: float) -> str:
    """Ánh xạ risk score thành risk level string."""
    if risk_score >= 90:
        return "CRITICAL"
    if risk_score >= 70:
        return "HIGH"
    if risk_score >= 40:
        return "MEDIUM"
    return "LOW"


async def make_fraud_decision_with_rules(
    fraud_probability: float,
    risk_level: str,
    transaction: dict,
    risk_score: float = 0.0,
) -> DecisionResult:
    """Wrapper kết hợp Rule Engine + threshold logic.

    Thứ tự ưu tiên:
      1. Business rules (evaluate_rules) — match trước thì dùng luôn
      2. Fallback sang make_fraud_decision (threshold-based)
    """
    rule_result = await evaluate_rules(transaction, fraud_probability, risk_score)
    if rule_result is not None:
        return rule_result
    return make_fraud_decision(fraud_probability, risk_level)


async def make_fraud_decision_with_escalation(
    fraud_probability: float,
    risk_level: str,
    repeat_risk_bonus: int = 0,
    user_id: str = "",
    transaction_hash: str = "",
) -> DecisionResult:
    """
    Quyết định giao dịch VỚI repeat risk escalation + auto-freeze.

    Tính toán:
    - base_risk_score = fraud_probability * 100  (VD: 0.10 → 10)
    - final_risk_score = base_risk_score + repeat_risk_bonus
    - final_risk_score = min(final_risk_score, 100)
    - Dùng final_risk_score / 100 để so sánh ngưỡng
    - Nếu adjusted_probability >= 0.90 → auto-freeze account
    """
    base_risk_score = fraud_probability * 100
    final_risk_score = min(base_risk_score + repeat_risk_bonus, 100)
    adjusted_probability = final_risk_score / 100.0

    # Cập nhật risk_level dựa trên adjusted score
    if adjusted_probability >= 0.90:
        adj_risk_level = "CRITICAL"
    elif adjusted_probability >= 0.70:
        adj_risk_level = "HIGH"
    elif adjusted_probability >= 0.40:
        adj_risk_level = "MEDIUM"
    else:
        adj_risk_level = risk_level  # Giữ nguyên nếu không escalate

    if adjusted_probability >= BLOCK_THRESHOLD:  # ≥ 0.90
        # Auto-freeze account
        if user_id:
            try:
                from services.account_freeze_service import freeze_account  # pylint: disable=import-outside-toplevel
                await freeze_account(
                    user_id=user_id,
                    fraud_probability=adjusted_probability,
                    reason=(
                        f"Auto-freeze: adjusted_score={final_risk_score:.0f}, "
                        f"base={base_risk_score:.1f}, repeat_bonus={repeat_risk_bonus}"
                    ),
                    transaction_hash=transaction_hash,
                    triggered_by="SYSTEM_AUTO",
                )
            except Exception as exc:
                logger.warning("Auto-freeze failed for %s: %s", user_id, exc)

        return DecisionResult(
            decision=FraudDecision.BLOCKED,
            fraud_probability=adjusted_probability,
            risk_level=adj_risk_level,
            should_block=True,
            requires_review=False,
            block_reason=(
                f"ACCOUNT FROZEN — fraud score {final_risk_score:.0f}/100 "
                f"(base: {base_risk_score:.0f} + repeat: {repeat_risk_bonus})"
            ),
            review_reason=None,
        )

    if adjusted_probability >= PENDING_THRESHOLD:  # ≥ 0.70
        return DecisionResult(
            decision=FraudDecision.PENDING,
            fraud_probability=adjusted_probability,
            risk_level=adj_risk_level,
            should_block=False,
            requires_review=True,
            block_reason=None,
            review_reason=(
                f"Risk escalation: score {final_risk_score:.0f}/100 "
                f"(base: {base_risk_score:.0f} + repeat: {repeat_risk_bonus}). "
                "Cần xét duyệt thủ công."
            ),
        )

    return DecisionResult(
        decision=FraudDecision.APPROVED,
        fraud_probability=adjusted_probability,
        risk_level=adj_risk_level,
        should_block=False,
        requires_review=False,
        block_reason=None,
        review_reason=None,
    )



