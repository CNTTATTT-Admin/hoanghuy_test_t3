"""Pydantic schemas cho xác thực (Authentication).

Bao gồm request/response models cho:
- Đăng ký (Register)
- Đăng nhập (Login)
- Xác thực email (Verify Email)
- Làm mới token (Refresh)
"""

from __future__ import annotations

import re
from typing import Optional

from pydantic import BaseModel, EmailStr, Field, field_validator


class RegisterRequest(BaseModel):
    """Yêu cầu đăng ký tài khoản mới."""
    email: EmailStr = Field(..., description="Email đăng nhập")
    password: str = Field(..., min_length=8, max_length=128, description="Mật khẩu")
    full_name: str = Field(..., min_length=2, max_length=100, description="Họ tên đầy đủ")

    @field_validator("password")
    @classmethod
    def validate_password_strength(cls, v: str) -> str:
        """Kiểm tra độ mạnh mật khẩu: ít nhất 1 hoa, 1 thường, 1 số, 1 ký tự đặc biệt."""
        if not re.search(r"[A-Z]", v):
            raise ValueError("Mật khẩu phải chứa ít nhất 1 chữ hoa")
        if not re.search(r"[a-z]", v):
            raise ValueError("Mật khẩu phải chứa ít nhất 1 chữ thường")
        if not re.search(r"\d", v):
            raise ValueError("Mật khẩu phải chứa ít nhất 1 chữ số")
        if not re.search(r"[!@#$%^&*()_+\-=\[\]{};':\"\\|,.<>\/?]", v):
            raise ValueError("Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt")
        return v

    @field_validator("email", mode="before")
    @classmethod
    def normalize_email(cls, v: str) -> str:
        """Chuẩn hóa email: lowercase, trim khoảng trắng."""
        return v.strip().lower()


class LoginRequest(BaseModel):
    """Yêu cầu đăng nhập."""
    email: EmailStr = Field(..., description="Email đăng nhập")
    password: str = Field(..., description="Mật khẩu")

    @field_validator("email", mode="before")
    @classmethod
    def normalize_email(cls, v: str) -> str:
        return v.strip().lower()


class LoginResponse(BaseModel):
    """Phản hồi đăng nhập thành công."""
    access_token: str
    refresh_token: str
    token_type: str = "Bearer"
    expires_in: int  # giây
    user: dict  # UserResponse dạng dict


class VerifyEmailRequest(BaseModel):
    """Yêu cầu xác thực email."""
    email: EmailStr = Field(..., description="Email đã đăng ký")
    token: str = Field(..., min_length=6, max_length=6, description="Mã xác thực 6 chữ số")

    @field_validator("email", mode="before")
    @classmethod
    def normalize_email(cls, v: str) -> str:
        return v.strip().lower()


class ResendVerificationRequest(BaseModel):
    """Yêu cầu gửi lại mã xác thực."""
    email: EmailStr = Field(..., description="Email đã đăng ký")

    @field_validator("email", mode="before")
    @classmethod
    def normalize_email(cls, v: str) -> str:
        return v.strip().lower()


class RefreshRequest(BaseModel):
    """Yêu cầu làm mới access token."""
    refresh_token: str = Field(..., description="Refresh token hiện tại")


class TokenPayload(BaseModel):
    """Payload được decode từ JWT — dùng nội bộ."""
    sub: str  # user_uid
    email: str
    role: str
    full_name: str
    type: str  # "access" hoặc "refresh"
    jti: Optional[str] = None  # JWT ID — dùng cho blacklist
    exp: Optional[int] = None
    iat: Optional[int] = None

