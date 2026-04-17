"""
Account Freeze Service
- Đóng băng tài khoản khi fraud_probability >= 0.90
- Mở băng tài khoản (chỉ ADMIN)
- Kiểm tra trạng thái tài khoản trước giao dịch

Hỗ trợ 2 loại user_id:
  1. Registered user (user_uid trong bảng users) — cập nhật cột account_status
  2. External user_id (VD: C100000003) — lưu vào bảng frozen_accounts
"""

import logging
from typing import Optional

from db.database import get_pool, is_db_enabled

logger = logging.getLogger("fraud_audit")

FREEZE_THRESHOLD = 0.90  # Ngưỡng tự động đóng băng


async def get_account_status(user_id: str) -> str:
    """
    Lấy trạng thái tài khoản hiện tại.
    Returns: 'active' | 'frozen' | 'suspended'

    Kiểm tra cả 2 nguồn:
    1. Bảng users (registered user)
    2. Bảng frozen_accounts (external user_id)
    """
    if not is_db_enabled():
        return "active"

    pool = get_pool()
    try:
        async with pool.acquire() as conn:
            # 1. Kiểm tra registered user
            row = await conn.fetchrow(
                "SELECT account_status FROM users WHERE user_uid = $1",
                user_id,
            )
            if row is not None:
                return str(row["account_status"])

            # 2. Kiểm tra external user_id trong frozen_accounts
            frozen_row = await conn.fetchrow(
                "SELECT 1 FROM frozen_accounts WHERE user_id = $1",
                user_id,
            )
            if frozen_row is not None:
                return "frozen"

            return "active"
    except Exception as exc:
        logger.warning("get_account_status error for %s: %s", user_id, exc)
        return "active"


async def freeze_account(
    user_id: str,
    fraud_probability: float,
    reason: str,
    transaction_hash: Optional[str] = None,
    triggered_by: str = "SYSTEM_AUTO",
) -> bool:
    """
    Đóng băng tài khoản.
    - Nếu user_id là registered user → UPDATE users.account_status = 'frozen'
    - Nếu user_id là external → INSERT vào frozen_accounts
    - Ghi log vào account_status_log
    Returns: True nếu freeze thành công, False nếu đã frozen rồi.
    """
    if not is_db_enabled():
        logger.warning("DB not enabled — cannot freeze account %s", user_id)
        return False

    current_status = await get_account_status(user_id)
    if current_status == "frozen":
        logger.info("Account %s already frozen, skipping", user_id)
        return False

    pool = get_pool()
    try:
        async with pool.acquire() as conn:
            async with conn.transaction():
                # Thử cập nhật registered user trước
                result = await conn.execute(
                    "UPDATE users SET account_status = 'frozen', updated_at = NOW() "
                    "WHERE user_uid = $1",
                    user_id,
                )

                if result == "UPDATE 0":
                    # User không tồn tại trong bảng users → external user_id
                    # Lưu vào bảng frozen_accounts
                    await conn.execute(
                        """
                        INSERT INTO frozen_accounts
                            (user_id, reason, fraud_probability, transaction_hash, triggered_by)
                        VALUES ($1, $2, $3, $4, $5)
                        ON CONFLICT (user_id) DO NOTHING
                        """,
                        user_id,
                        reason,
                        fraud_probability,
                        transaction_hash,
                        triggered_by,
                    )

                # Ghi log thay đổi trạng thái
                await conn.execute(
                    """
                    INSERT INTO account_status_log
                        (user_uid, previous_status, new_status, reason,
                         triggered_by, fraud_probability, transaction_hash)
                    VALUES ($1, $2, $3, $4, $5, $6, $7)
                    """,
                    user_id,
                    current_status,
                    "frozen",
                    reason,
                    triggered_by,
                    fraud_probability,
                    transaction_hash,
                )

        logger.warning(
            "ACCOUNT FROZEN: user=%s, fraud_prob=%.4f, reason=%s",
            user_id,
            fraud_probability,
            reason,
        )
        return True
    except Exception as exc:
        logger.error("freeze_account error for %s: %s", user_id, exc)
        return False


async def unfreeze_account(
    user_id: str,
    admin_uid: str,
    reason: str,
) -> bool:
    """
    Mở băng tài khoản (chỉ ADMIN mới được gọi).
    Xóa khỏi cả users.account_status và frozen_accounts.
    """
    if not is_db_enabled():
        return False

    current_status = await get_account_status(user_id)
    if current_status != "frozen":
        return False

    pool = get_pool()
    try:
        async with pool.acquire() as conn:
            async with conn.transaction():
                # Cập nhật registered user (nếu có)
                await conn.execute(
                    "UPDATE users SET account_status = 'active', updated_at = NOW() "
                    "WHERE user_uid = $1",
                    user_id,
                )

                # Xóa khỏi frozen_accounts (nếu có)
                await conn.execute(
                    "DELETE FROM frozen_accounts WHERE user_id = $1",
                    user_id,
                )

                # Ghi log
                await conn.execute(
                    """
                    INSERT INTO account_status_log
                        (user_uid, previous_status, new_status, reason,
                         triggered_by, fraud_probability, transaction_hash)
                    VALUES ($1, $2, $3, $4, $5, $6, $7)
                    """,
                    user_id,
                    "frozen",
                    "active",
                    f"Unfrozen by ADMIN {admin_uid}: {reason}",
                    "ADMIN_MANUAL",
                    None,
                    None,
                )

        logger.info("ACCOUNT UNFROZEN: user=%s, by admin=%s", user_id, admin_uid)
        return True
    except Exception as exc:
        logger.error("unfreeze_account error for %s: %s", user_id, exc)
        return False


async def list_frozen_accounts() -> list:
    """Danh sách tất cả tài khoản đang bị đóng băng (cả registered và external)."""
    if not is_db_enabled():
        return []

    pool = get_pool()
    try:
        async with pool.acquire() as conn:
            # Registered users bị frozen
            user_rows = await conn.fetch(
                "SELECT user_uid, email, full_name, updated_at "
                "FROM users WHERE account_status = 'frozen' "
                "ORDER BY updated_at DESC"
            )
            results = [
                {
                    "user_id": r["user_uid"],
                    "email": r["email"],
                    "full_name": r["full_name"],
                    "frozen_since": r["updated_at"].isoformat() if r["updated_at"] else None,
                    "source": "registered",
                }
                for r in user_rows
            ]

            # External user_ids bị frozen
            ext_rows = await conn.fetch(
                "SELECT user_id, reason, fraud_probability, frozen_at "
                "FROM frozen_accounts ORDER BY frozen_at DESC"
            )
            results.extend([
                {
                    "user_id": r["user_id"],
                    "email": None,
                    "full_name": None,
                    "reason": r["reason"],
                    "fraud_probability": r["fraud_probability"],
                    "frozen_since": r["frozen_at"].isoformat() if r["frozen_at"] else None,
                    "source": "external",
                }
                for r in ext_rows
            ])

            return results
    except Exception as exc:
        logger.error("list_frozen_accounts error: %s", exc)
        return []


async def get_account_status_log(user_id: str) -> list:
    """Lịch sử thay đổi trạng thái tài khoản."""
    if not is_db_enabled():
        return []

    pool = get_pool()
    try:
        async with pool.acquire() as conn:
            rows = await conn.fetch(
                "SELECT * FROM account_status_log "
                "WHERE user_uid = $1 ORDER BY created_at DESC",
                user_id,
            )
            result = []
            for r in rows:
                entry = dict(r)
                if entry.get("created_at"):
                    entry["created_at"] = entry["created_at"].isoformat()
                result.append(entry)
            return result
    except Exception as exc:
        logger.error("get_account_status_log error for %s: %s", user_id, exc)
        return []
