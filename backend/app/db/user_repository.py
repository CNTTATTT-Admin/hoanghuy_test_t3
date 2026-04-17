"""User Repository — CRUD operations cho bảng users trong PostgreSQL.

Tất cả truy vấn dùng parameterized queries ($1, $2, ...) để chống SQL injection.
"""

from __future__ import annotations

import logging
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from uuid import uuid4

from db.database import acquire_connection, release_connection, is_db_enabled, record_to_dict

logger = logging.getLogger(__name__)


def _utcnow() -> datetime:
    """Trả về thời gian UTC hiện tại (timezone-aware)."""
    return datetime.now(timezone.utc)


async def create_user(
    email: str,
    password_hash: str,
    full_name: str,
    role: str = "USER",
    is_active: bool = False,
    is_email_verified: bool = False,
    email_verify_token: Optional[str] = None,
    email_verify_expires_at: Optional[datetime] = None,
) -> Optional[Dict[str, Any]]:
    """Tạo user mới, trả về dict thông tin user hoặc None nếu DB không khả dụng."""
    if not is_db_enabled():
        return None

    user_uid = str(uuid4())
    now = _utcnow()

    conn = await acquire_connection()
    try:
        row = await conn.fetchrow(
            """
            INSERT INTO users (
                user_uid, email, password_hash, full_name, role,
                is_active, is_email_verified, email_verify_token,
                email_verify_expires_at, created_at, updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            RETURNING *
            """,
            user_uid, email, password_hash, full_name, role,
            is_active, is_email_verified, email_verify_token,
            email_verify_expires_at, now, now,
        )
        return record_to_dict(row)
    finally:
        await release_connection(conn)


async def get_user_by_email(email: str) -> Optional[Dict[str, Any]]:
    """Tìm user theo email (case-insensitive qua lower())."""
    if not is_db_enabled():
        return None

    conn = await acquire_connection()
    try:
        row = await conn.fetchrow(
            "SELECT * FROM users WHERE email = $1",
            email.lower().strip(),
        )
        return record_to_dict(row) if row else None
    finally:
        await release_connection(conn)


async def get_user_by_uid(user_uid: str) -> Optional[Dict[str, Any]]:
    """Tìm user theo user_uid (public ID)."""
    if not is_db_enabled():
        return None

    conn = await acquire_connection()
    try:
        row = await conn.fetchrow(
            "SELECT * FROM users WHERE user_uid = $1",
            user_uid,
        )
        return record_to_dict(row) if row else None
    finally:
        await release_connection(conn)


async def update_user_fields(user_uid: str, **fields) -> Optional[Dict[str, Any]]:
    """Cập nhật các trường tùy ý cho user.

    Ví dụ: update_user_fields("uid-xxx", role="ANALYST", is_active=True)
    Chỉ cập nhật các trường được truyền, tự thêm updated_at.
    """
    if not is_db_enabled() or not fields:
        return None

    fields["updated_at"] = _utcnow()

    # Xây dựng câu SET động với parameterized placeholders
    set_parts = []
    values = []
    for idx, (key, val) in enumerate(fields.items(), start=1):
        set_parts.append(f"{key} = ${idx}")
        values.append(val)

    where_idx = len(values) + 1
    values.append(user_uid)

    sql = f"UPDATE users SET {', '.join(set_parts)} WHERE user_uid = ${where_idx} RETURNING *"

    conn = await acquire_connection()
    try:
        row = await conn.fetchrow(sql, *values)
        return record_to_dict(row) if row else None
    finally:
        await release_connection(conn)


async def list_users(
    page: int = 1,
    page_size: int = 20,
    role: Optional[str] = None,
    search: Optional[str] = None,
    is_active: Optional[bool] = None,
) -> Dict[str, Any]:
    """Danh sách user phân trang, có filter và search.

    Trả về: {"users": [...], "total": int, "page": int, "page_size": int, "total_pages": int}
    """
    if not is_db_enabled():
        return {"users": [], "total": 0, "page": page, "page_size": page_size, "total_pages": 0}

    conditions = []
    params: list = []
    idx = 1

    if role:
        conditions.append(f"role = ${idx}")
        params.append(role)
        idx += 1

    if is_active is not None:
        conditions.append(f"is_active = ${idx}")
        params.append(is_active)
        idx += 1

    if search:
        conditions.append(f"(email ILIKE ${idx} OR full_name ILIKE ${idx})")
        params.append(f"%{search}%")
        idx += 1

    where_clause = f"WHERE {' AND '.join(conditions)}" if conditions else ""
    offset = (page - 1) * page_size

    conn = await acquire_connection()
    try:
        # Đếm tổng
        count_sql = f"SELECT COUNT(*) FROM users {where_clause}"
        total = await conn.fetchval(count_sql, *params)

        # Lấy danh sách
        list_sql = (
            f"SELECT * FROM users {where_clause} "
            f"ORDER BY created_at DESC LIMIT ${idx} OFFSET ${idx + 1}"
        )
        rows = await conn.fetch(list_sql, *params, page_size, offset)

        users = [record_to_dict(r) for r in rows]
        # Ẩn password_hash khỏi kết quả
        for u in users:
            u.pop("password_hash", None)
            u.pop("email_verify_token", None)

        total_pages = (total + page_size - 1) // page_size if total > 0 else 0

        return {
            "users": users,
            "total": total,
            "page": page,
            "page_size": page_size,
            "total_pages": total_pages,
        }
    finally:
        await release_connection(conn)


async def count_users() -> int:
    """Đếm tổng số user trong hệ thống."""
    if not is_db_enabled():
        return 0

    conn = await acquire_connection()
    try:
        return await conn.fetchval("SELECT COUNT(*) FROM users") or 0
    finally:
        await release_connection(conn)


async def user_stats() -> Dict[str, Any]:
    """Thống kê tổng quan user: total, active, inactive, unverified, phân bổ theo role."""
    if not is_db_enabled():
        return {}

    conn = await acquire_connection()
    try:
        total = await conn.fetchval("SELECT COUNT(*) FROM users") or 0
        active = await conn.fetchval("SELECT COUNT(*) FROM users WHERE is_active = TRUE") or 0
        inactive = total - active
        unverified = await conn.fetchval(
            "SELECT COUNT(*) FROM users WHERE is_email_verified = FALSE"
        ) or 0

        # Phân bổ theo role
        role_rows = await conn.fetch(
            "SELECT role, COUNT(*) as cnt FROM users GROUP BY role"
        )
        by_role = {r["role"]: r["cnt"] for r in role_rows}

        return {
            "total_users": total,
            "active_users": active,
            "inactive_users": inactive,
            "unverified_users": unverified,
            "by_role": by_role,
        }
    finally:
        await release_connection(conn)


# ── Token Blacklist ───────────────────────────────────────────────────────────

async def add_token_to_blacklist(jti: str, expires_at: datetime) -> None:
    """Thêm JWT ID vào blacklist (dùng khi logout)."""
    if not is_db_enabled():
        return

    conn = await acquire_connection()
    try:
        await conn.execute(
            """
            INSERT INTO token_blacklist (jti, expires_at)
            VALUES ($1, $2)
            ON CONFLICT (jti) DO NOTHING
            """,
            jti, expires_at,
        )
    finally:
        await release_connection(conn)


async def is_token_blacklisted(jti: str) -> bool:
    """Kiểm tra JWT ID có trong blacklist không."""
    if not is_db_enabled():
        return False

    conn = await acquire_connection()
    try:
        row = await conn.fetchval(
            "SELECT 1 FROM token_blacklist WHERE jti = $1 AND expires_at > $2",
            jti, _utcnow(),
        )
        return row is not None
    finally:
        await release_connection(conn)


async def cleanup_expired_tokens() -> int:
    """Xóa token đã hết hạn khỏi blacklist — gọi định kỳ để giảm kích thước bảng."""
    if not is_db_enabled():
        return 0

    conn = await acquire_connection()
    try:
        result = await conn.execute(
            "DELETE FROM token_blacklist WHERE expires_at <= $1",
            _utcnow(),
        )
        # result dạng "DELETE 5" — lấy số lượng
        count = int(result.split()[-1]) if result else 0
        return count
    finally:
        await release_connection(conn)


# ── Audit Log ─────────────────────────────────────────────────────────────────

async def add_audit_log(
    target_user_uid: str,
    action: str,
    old_value: Optional[str] = None,
    new_value: Optional[str] = None,
    changed_by_uid: Optional[str] = None,
) -> None:
    """Ghi log thay đổi role/status vào bảng user_audit_log."""
    if not is_db_enabled():
        return

    conn = await acquire_connection()
    try:
        await conn.execute(
            """
            INSERT INTO user_audit_log (target_user_uid, action, old_value, new_value, changed_by_uid)
            VALUES ($1, $2, $3, $4, $5)
            """,
            target_user_uid, action, old_value, new_value, changed_by_uid,
        )
    finally:
        await release_connection(conn)


async def get_audit_log(target_user_uid: str, limit: int = 50) -> List[Dict[str, Any]]:
    """Lấy lịch sử thay đổi của một user."""
    if not is_db_enabled():
        return []

    conn = await acquire_connection()
    try:
        rows = await conn.fetch(
            """
            SELECT al.*, u.email as changed_by_email
            FROM user_audit_log al
            LEFT JOIN users u ON al.changed_by_uid = u.user_uid
            WHERE al.target_user_uid = $1
            ORDER BY al.created_at DESC
            LIMIT $2
            """,
            target_user_uid, limit,
        )
        return [record_to_dict(r) for r in rows]
    finally:
        await release_connection(conn)
