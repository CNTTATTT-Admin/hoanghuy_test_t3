"""Rule Engine API — CRUD quản lý business rules.

Endpoints:
  GET    /api/v1/rules                    — Danh sách rules (sắp theo priority)
  POST   /api/v1/rules                    — Tạo rule mới
  PUT    /api/v1/rules/{rule_id}          — Cập nhật rule
  DELETE /api/v1/rules/{rule_id}          — Xóa rule
  PATCH  /api/v1/rules/{rule_id}/toggle   — Bật/tắt rule
"""

from __future__ import annotations
import json
import logging
import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status

from core.security import require_role
from db.database import get_pool, is_db_enabled
from schemas.rule import (
    RuleCondition,
    RuleCreateRequest,
    RuleResponse,
    RulesListResponse,
    RuleUpdateRequest,
)

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/v1/rules", tags=["rules"])

# ── Default seed rules ────────────────────────────────────────────────────────
DEFAULT_RULES: list[dict] = [
    {
        "name": "Block giao dịch cực lớn",
        "description": "Tự động chặn giao dịch trên 500,000",
        "conditions": [{"field": "amount", "operator": ">", "value": 500000}],
        "action": "BLOCK",
        "priority": 1,
    },
    {
        "name": "Review chuyển khoản lớn đêm khuya",
        "description": "Giao dịch TRANSFER > 100k trong khung 0h-5h",
        "conditions": [
            {"field": "transaction_type", "operator": "==", "value": "TRANSFER"},
            {"field": "amount", "operator": ">", "value": 100000},
            {"field": "time_of_day", "operator": "between", "value": [0, 5]},
        ],
        "action": "REVIEW",
        "priority": 2,
    },
    {
        "name": "Review velocity cao",
        "description": "Nhiều hơn 5 giao dịch/phút từ cùng tài khoản",
        "conditions": [{"field": "velocity", "operator": ">", "value": 5}],
        "action": "REVIEW",
        "priority": 3,
    },
]


# ── Redis helper ─────────────────────────────────────────────────────────────
async def _invalidate_rules_cache() -> None:
    """Xóa Redis cache để fraud_decision.py reload rules mới nhất."""
    try:
        from core.redis_client import get_redis  # pylint: disable=import-outside-toplevel
        redis = await get_redis()
        if redis:
            await redis.delete("rules:active_rules")
    except Exception as exc:  # noqa: BLE001
        logger.warning("Không xóa được rules cache: %s", exc)


# ── DB row → schema ──────────────────────────────────────────────────────────
def _row_to_rule(row: dict) -> RuleResponse:
    conditions_raw = row["conditions"]
    if isinstance(conditions_raw, str):
        conditions_raw = json.loads(conditions_raw)
    conditions = [RuleCondition(**c) for c in conditions_raw]
    return RuleResponse(
        rule_id=row["rule_id"],
        name=row["name"],
        description=row.get("description"),
        conditions=conditions,
        action=row["action"],
        priority=row["priority"],
        is_enabled=row["is_enabled"],
        created_by=row.get("created_by"),
        created_at=row.get("created_at"),
        updated_at=row.get("updated_at"),
    )


# ── Seed defaults ─────────────────────────────────────────────────────────────
async def _seed_default_rules() -> None:
    """Chèn 3 rules mặc định khi bảng fraud_rules còn rỗng."""
    if not is_db_enabled():
        return
    pool = get_pool()
    try:
        async with pool.acquire() as conn:
            count = await conn.fetchval("SELECT COUNT(*) FROM fraud_rules")
            if count and count > 0:
                return
            for rule in DEFAULT_RULES:
                await conn.execute(
                    """
                    INSERT INTO fraud_rules
                        (rule_id, name, description, conditions, action, priority, is_enabled, created_by)
                    VALUES ($1, $2, $3, $4::jsonb, $5, $6, TRUE, 'system')
                    ON CONFLICT (rule_id) DO NOTHING
                    """,
                    str(uuid.uuid4()),
                    rule["name"],
                    rule.get("description"),
                    json.dumps(rule["conditions"]),
                    rule["action"],
                    rule["priority"],
                )
        logger.info("Default rules seeded.")
    except Exception as exc:  # noqa: BLE001
        logger.warning("Seed default rules lỗi: %s", exc)


# ── GET /api/v1/rules ─────────────────────────────────────────────────────────
@router.get("", response_model=RulesListResponse)
async def list_rules(
    current_user: dict = Depends(require_role(["ADMIN", "COMPLIANCE"])),
):
    """Lấy danh sách tất cả rules, sắp xếp theo priority ASC."""
    if not is_db_enabled():
        return RulesListResponse(rules=[], total=0)

    pool = get_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch(
            """
            SELECT rule_id, name, description, conditions, action,
                   priority, is_enabled, created_by, created_at, updated_at
            FROM fraud_rules
            ORDER BY priority ASC
            """
        )
    rules = [_row_to_rule(dict(r)) for r in rows]
    return RulesListResponse(rules=rules, total=len(rules))


# ── POST /api/v1/rules ────────────────────────────────────────────────────────
@router.post("", response_model=RuleResponse, status_code=status.HTTP_201_CREATED)
async def create_rule(
    body: RuleCreateRequest,
    current_user: dict = Depends(require_role(["ADMIN"])),
):
    """Tạo rule mới. Chỉ ADMIN mới được phép."""
    if not is_db_enabled():
        raise HTTPException(status_code=503, detail="Database không khả dụng")

    new_id = str(uuid.uuid4())
    username = current_user.get("username", "unknown")
    conditions_json = json.dumps([c.model_dump() for c in body.conditions])

    pool = get_pool()
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            """
            INSERT INTO fraud_rules
                (rule_id, name, description, conditions, action, priority, is_enabled, created_by)
            VALUES ($1, $2, $3, $4::jsonb, $5, $6, $7, $8)
            RETURNING rule_id, name, description, conditions, action,
                      priority, is_enabled, created_by, created_at, updated_at
            """,
            new_id,
            body.name,
            body.description,
            conditions_json,
            body.action,
            body.priority,
            body.is_enabled,
            username,
        )

    await _invalidate_rules_cache()
    logger.info("Rule tạo mới: %s bởi %s", new_id, username)
    return _row_to_rule(dict(row))


# ── PUT /api/v1/rules/{rule_id} ───────────────────────────────────────────────
@router.put("/{rule_id}", response_model=RuleResponse)
async def update_rule(
    rule_id: str,
    body: RuleUpdateRequest,
    current_user: dict = Depends(require_role(["ADMIN"])),
):
    """Cập nhật rule theo rule_id. Chỉ ADMIN mới được phép."""
    if not is_db_enabled():
        raise HTTPException(status_code=503, detail="Database không khả dụng")

    pool = get_pool()
    async with pool.acquire() as conn:
        existing = await conn.fetchrow(
            "SELECT * FROM fraud_rules WHERE rule_id = $1", rule_id
        )
        if not existing:
            raise HTTPException(status_code=404, detail=f"Rule '{rule_id}' không tìm thấy")

        # Chỉ cập nhật các trường được cung cấp
        name        = body.name        if body.name        is not None else existing["name"]
        description = body.description if body.description is not None else existing["description"]
        action      = body.action      if body.action      is not None else existing["action"]
        priority    = body.priority    if body.priority    is not None else existing["priority"]
        is_enabled  = body.is_enabled  if body.is_enabled  is not None else existing["is_enabled"]

        if body.conditions is not None:
            conditions_json = json.dumps([c.model_dump() for c in body.conditions])
        else:
            raw = existing["conditions"]
            conditions_json = raw if isinstance(raw, str) else json.dumps(raw)

        row = await conn.fetchrow(
            """
            UPDATE fraud_rules
            SET name=$1, description=$2, conditions=$3::jsonb, action=$4,
                priority=$5, is_enabled=$6, updated_at=NOW()
            WHERE rule_id=$7
            RETURNING rule_id, name, description, conditions, action,
                      priority, is_enabled, created_by, created_at, updated_at
            """,
            name, description, conditions_json, action, priority, is_enabled, rule_id,
        )

    await _invalidate_rules_cache()
    logger.info("Rule cập nhật: %s bởi %s", rule_id, current_user.get("username"))
    return _row_to_rule(dict(row))


# ── DELETE /api/v1/rules/{rule_id} ────────────────────────────────────────────
@router.delete("/{rule_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_rule(
    rule_id: str,
    current_user: dict = Depends(require_role(["ADMIN"])),
):
    """Xóa rule theo rule_id. Chỉ ADMIN mới được phép."""
    if not is_db_enabled():
        raise HTTPException(status_code=503, detail="Database không khả dụng")

    pool = get_pool()
    async with pool.acquire() as conn:
        result = await conn.execute("DELETE FROM fraud_rules WHERE rule_id = $1", rule_id)

    if result == "DELETE 0":
        raise HTTPException(status_code=404, detail=f"Rule '{rule_id}' không tìm thấy")

    await _invalidate_rules_cache()
    logger.info("Rule xóa: %s bởi %s", rule_id, current_user.get("username"))


# ── PATCH /api/v1/rules/{rule_id}/toggle ─────────────────────────────────────
@router.patch("/{rule_id}/toggle", response_model=RuleResponse)
async def toggle_rule(
    rule_id: str,
    current_user: dict = Depends(require_role(["ADMIN"])),
):
    """Toggle is_enabled cho rule. Chỉ ADMIN mới được phép."""
    if not is_db_enabled():
        raise HTTPException(status_code=503, detail="Database không khả dụng")

    pool = get_pool()
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            """
            UPDATE fraud_rules
            SET is_enabled = NOT is_enabled, updated_at = NOW()
            WHERE rule_id = $1
            RETURNING rule_id, name, description, conditions, action,
                      priority, is_enabled, created_by, created_at, updated_at
            """,
            rule_id,
        )

    if not row:
        raise HTTPException(status_code=404, detail=f"Rule '{rule_id}' không tìm thấy")

    await _invalidate_rules_cache()
    logger.info(
        "Rule toggle: %s → is_enabled=%s bởi %s",
        rule_id, dict(row)["is_enabled"], current_user.get("username"),
    )
    return _row_to_rule(dict(row))
