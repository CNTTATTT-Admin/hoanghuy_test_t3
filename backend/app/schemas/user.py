"""Pydantic schemas cho User — dùng chung giữa auth và user management.

Bao gồm:
- UserRole enum: 5 vai trò hệ thống
- UserCreate: tạo user mới (internal)
- UserResponse: trả về client (ẩn password_hash)
- UserInDB: đầy đủ thông tin từ DB
"""

from __future__ import annotations

from datetime import datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel, EmailStr, Field


class UserRole(str, Enum):
    """Các vai trò trong hệ thống FraudDetect."""
    USER = "USER"                # Người dùng cuối — chỉ kiểm tra giao dịch
    ANALYST = "ANALYST"          # Chuyên viên phân tích gian lận
    ADMIN = "ADMIN"              # Quản trị viên hệ thống
    ML_ENGINEER = "ML_ENGINEER"  # Kỹ sư ML — quản lý mô hình
    COMPLIANCE = "COMPLIANCE"    # Bộ phận tuân thủ — chỉ xem báo cáo


class UserCreate(BaseModel):
    """Dữ liệu nội bộ để tạo user trong DB."""
    email: str
    password_hash: str
    full_name: str
    role: UserRole = UserRole.USER
    is_active: bool = False
    is_email_verified: bool = False


class UserResponse(BaseModel):
    """Thông tin user trả về cho client — không bao gồm mật khẩu."""
    user_uid: str
    email: str
    full_name: str
    role: UserRole
    is_active: bool
    is_email_verified: bool
    created_at: Optional[datetime] = None
    last_login_at: Optional[datetime] = None


class UserInDB(BaseModel):
    """Đầy đủ thông tin user từ DB — chỉ dùng nội bộ backend."""
    id: int
    user_uid: str
    email: str
    password_hash: str
    full_name: str
    role: UserRole
    is_active: bool
    is_email_verified: bool
    email_verify_token: Optional[str] = None
    email_verify_expires_at: Optional[datetime] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    last_login_at: Optional[datetime] = None


class UpdateRoleRequest(BaseModel):
    """Request đổi vai trò user — chỉ ADMIN được dùng."""
    role: UserRole = Field(..., description="Vai trò mới")


class UpdateStatusRequest(BaseModel):
    """Request kích hoạt / vô hiệu hóa user — chỉ ADMIN."""
    is_active: bool = Field(..., description="True = kích hoạt, False = vô hiệu hóa")
