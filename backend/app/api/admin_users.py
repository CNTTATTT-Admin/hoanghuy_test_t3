"""Admin Users API — Quản lý tài khoản hệ thống (chỉ ADMIN).

Endpoints:
- GET    /admin/users              — Danh sách user phân trang + filter
- GET    /admin/users/stats        — Thống kê user
- GET    /admin/users/{uid}        — Chi tiết user
- PUT    /admin/users/{uid}/role   — Đổi vai trò
- PUT    /admin/users/{uid}/status — Kích hoạt / vô hiệu hóa
- GET    /admin/users/{uid}/audit  — Lịch sử thay đổi
"""

import logging
import os
from typing import Any, Dict, Optional

from fastapi import APIRouter, Depends, HTTPException, status

from core.security import require_role
from db.user_repository import (
    get_user_by_uid,
    list_users,
    update_user_fields,
    user_stats,
    add_audit_log,
    get_audit_log,
)
from schemas.user import UpdateRoleRequest, UpdateStatusRequest, UserRole

logger = logging.getLogger(__name__)
router = APIRouter()

# Email của admin mặc định (seed) — không cho phép đổi role
_DEFAULT_ADMIN_EMAIL = os.getenv("DEFAULT_ADMIN_EMAIL", "admin@frauddetect.local")


# ── GET /admin/users — Danh sách user ────────────────────────────────────────

@router.get("/admin/users")
async def admin_list_users(
    page: int = 1,
    page_size: int = 20,
    role: Optional[str] = None,
    search: Optional[str] = None,
    is_active: Optional[bool] = None,
    _user: dict = Depends(require_role(["ADMIN"])),
) -> Dict[str, Any]:
    """Lấy danh sách tất cả user — phân trang, filter theo role/search/is_active."""
    if page < 1:
        page = 1
    if page_size < 1 or page_size > 100:
        page_size = 20

    # Validate role filter nếu có
    if role:
        valid_roles = [r.value for r in UserRole]
        if role not in valid_roles:
            raise HTTPException(
                status_code=400,
                detail=f"Role không hợp lệ. Các role hợp lệ: {', '.join(valid_roles)}",
            )

    return await list_users(
        page=page,
        page_size=page_size,
        role=role,
        search=search,
        is_active=is_active,
    )


# ── GET /admin/users/stats — Thống kê user ──────────────────────────────────

@router.get("/admin/users/stats")
async def admin_user_stats(
    _user: dict = Depends(require_role(["ADMIN"])),
) -> Dict[str, Any]:
    """Thống kê tổng quan: total, active, inactive, unverified, phân bổ theo role."""
    return await user_stats()


# ── GET /admin/users/{user_uid} — Chi tiết user ─────────────────────────────

@router.get("/admin/users/{user_uid}")
async def admin_get_user(
    user_uid: str,
    _user: dict = Depends(require_role(["ADMIN"])),
) -> Dict[str, Any]:
    """Lấy thông tin chi tiết một user (ẩn password_hash)."""
    user = await get_user_by_uid(user_uid)
    if not user:
        raise HTTPException(status_code=404, detail="Không tìm thấy user")

    # Ẩn thông tin nhạy cảm
    user.pop("password_hash", None)
    user.pop("email_verify_token", None)
    return user


# ── PUT /admin/users/{user_uid}/role — Đổi vai trò ──────────────────────────

@router.put("/admin/users/{user_uid}/role")
async def admin_update_role(
    user_uid: str,
    body: UpdateRoleRequest,
    current_user: dict = Depends(require_role(["ADMIN"])),
) -> Dict[str, Any]:
    """Thay đổi vai trò của user. Không thể tự đổi role mình hoặc đổi role admin mặc định."""
    # Không cho phép tự đổi role chính mình
    if current_user.get("user_uid") == user_uid:
        raise HTTPException(
            status_code=400,
            detail="Không thể thay đổi vai trò của chính mình",
        )

    # Tìm user mục tiêu
    target = await get_user_by_uid(user_uid)
    if not target:
        raise HTTPException(status_code=404, detail="Không tìm thấy user")

    # Không cho đổi role của admin mặc định (seed account)
    if target.get("email") == _DEFAULT_ADMIN_EMAIL:
        raise HTTPException(
            status_code=400,
            detail="Không thể thay đổi vai trò của tài khoản admin mặc định",
        )

    old_role = target.get("role", "")
    new_role = body.role.value

    if old_role == new_role:
        raise HTTPException(status_code=400, detail="Vai trò mới trùng với vai trò hiện tại")

    # Cập nhật role
    updated = await update_user_fields(user_uid, role=new_role)
    if not updated:
        raise HTTPException(status_code=500, detail="Cập nhật thất bại")

    # Ghi audit log
    await add_audit_log(
        target_user_uid=user_uid,
        action="CHANGE_ROLE",
        old_value=old_role,
        new_value=new_role,
        changed_by_uid=current_user.get("user_uid"),
    )

    logger.info(
        "Admin %s đã đổi role %s: %s → %s",
        current_user.get("email"),
        target.get("email"),
        old_role,
        new_role,
    )

    updated.pop("password_hash", None)
    updated.pop("email_verify_token", None)

    return {
        "message": f"Đã cập nhật vai trò thành {new_role}",
        "user": {
            "user_uid": updated["user_uid"],
            "email": updated["email"],
            "full_name": updated["full_name"],
            "role": updated["role"],
        },
    }


# ── PUT /admin/users/{user_uid}/status — Kích hoạt / Vô hiệu hóa ───────────

@router.put("/admin/users/{user_uid}/status")
async def admin_update_status(
    user_uid: str,
    body: UpdateStatusRequest,
    current_user: dict = Depends(require_role(["ADMIN"])),
) -> Dict[str, Any]:
    """Kích hoạt hoặc vô hiệu hóa tài khoản user."""
    # Không cho tự vô hiệu hóa chính mình
    if current_user.get("user_uid") == user_uid:
        raise HTTPException(
            status_code=400,
            detail="Không thể thay đổi trạng thái của chính mình",
        )

    target = await get_user_by_uid(user_uid)
    if not target:
        raise HTTPException(status_code=404, detail="Không tìm thấy user")

    # Không cho vô hiệu hóa admin mặc định
    if target.get("email") == _DEFAULT_ADMIN_EMAIL and not body.is_active:
        raise HTTPException(
            status_code=400,
            detail="Không thể vô hiệu hóa tài khoản admin mặc định",
        )

    old_status = "active" if target.get("is_active") else "inactive"
    new_status = "active" if body.is_active else "inactive"

    if old_status == new_status:
        raise HTTPException(status_code=400, detail="Trạng thái mới trùng với trạng thái hiện tại")

    updated = await update_user_fields(user_uid, is_active=body.is_active)
    if not updated:
        raise HTTPException(status_code=500, detail="Cập nhật thất bại")

    # Ghi audit log
    await add_audit_log(
        target_user_uid=user_uid,
        action="CHANGE_STATUS",
        old_value=old_status,
        new_value=new_status,
        changed_by_uid=current_user.get("user_uid"),
    )

    logger.info(
        "Admin %s đã %s tài khoản %s",
        current_user.get("email"),
        "kích hoạt" if body.is_active else "vô hiệu hóa",
        target.get("email"),
    )

    return {
        "message": f"Đã {'kích hoạt' if body.is_active else 'vô hiệu hóa'} tài khoản",
        "user": {
            "user_uid": updated["user_uid"],
            "email": updated["email"],
            "is_active": updated["is_active"],
        },
    }


# ── GET /admin/users/{user_uid}/audit — Lịch sử thay đổi ───────────────────

@router.get("/admin/users/{user_uid}/audit")
async def admin_get_audit_log(
    user_uid: str,
    limit: int = 50,
    _user: dict = Depends(require_role(["ADMIN", "COMPLIANCE"])),
) -> Dict[str, Any]:
    """Lấy lịch sử thay đổi (audit log) của một user."""
    target = await get_user_by_uid(user_uid)
    if not target:
        raise HTTPException(status_code=404, detail="Không tìm thấy user")

    logs = await get_audit_log(user_uid, limit=min(limit, 200))
    return {
        "user_uid": user_uid,
        "email": target.get("email"),
        "logs": logs,
    }
