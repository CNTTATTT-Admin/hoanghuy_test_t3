"""Security module — Xác thực và phân quyền.

Bao gồm:
- Hash / verify mật khẩu (bcrypt, cost factor 12)
- Tạo / decode JWT (access + refresh token)
- FastAPI dependency: get_current_user, require_role
- Token blacklist check (Redis ưu tiên, fallback PostgreSQL)
"""

from __future__ import annotations
import hashlib
import hmac
import logging
import os
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, List, Optional
from uuid import uuid4

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

import jwt
from passlib.context import CryptContext

from core.redis_client import get_redis
from db.user_repository import get_user_by_uid, is_token_blacklisted

logger = logging.getLogger(__name__)

# ── Cấu hình JWT ─────────────────────────────────────────────────────────────
JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "frauddetect-dev-secret-change-in-production-minimum-32-chars")
JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
REFRESH_TOKEN_EXPIRE_DAYS: int = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", "7"))

# Feature flag — cho phép tắt auth để backward compatibility
ENABLE_AUTH: bool = os.getenv("ENABLE_AUTH", "true").lower() == "true"

# ── Password hashing (bcrypt, cost factor 12) ────────────────────────────────
_pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto", bcrypt__rounds=12)

# ── FastAPI security scheme ──────────────────────────────────────────────────
_bearer_scheme = HTTPBearer(auto_error=False)


def hash_password(password: str) -> str:
    # hash trước để fix giới hạn 72 bytes
    hashed = hashlib.sha256(password.encode()).hexdigest()
    return _pwd_context.hash(hashed)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """So sánh mật khẩu plain với hash — timing-safe bên trong passlib.
    
    Phải SHA256 trước khi verify, khớp với cách hash_password đã hash.
    """
    prehashed = hashlib.sha256(plain_password.encode()).hexdigest()
    return _pwd_context.verify(prehashed, hashed_password)


def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """Tạo JWT access token.

    Payload chứa: sub (user_uid), email, role, full_name, type="access", jti, iat, exp
    """
    to_encode = data.copy()
    now = datetime.now(timezone.utc)
    expire = now + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))

    to_encode.update({
        "type": "access",
        "jti": str(uuid4()),  # JWT ID — dùng cho blacklist khi logout
        "iat": int(now.timestamp()),
        "exp": int(expire.timestamp()),
    })
    return jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)


def create_refresh_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """Tạo JWT refresh token — thời hạn dài hơn access token."""
    to_encode = data.copy()
    now = datetime.now(timezone.utc)
    expire = now + (expires_delta or timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS))

    to_encode.update({
        "type": "refresh",
        "jti": str(uuid4()),
        "iat": int(now.timestamp()),
        "exp": int(expire.timestamp()),
    })
    return jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)


def decode_token(token: str) -> Dict[str, Any]:
    """Decode và validate JWT token.

    Raises:
        HTTPException 401: Token không hợp lệ hoặc hết hạn
    """
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token đã hết hạn",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token không hợp lệ",
            headers={"WWW-Authenticate": "Bearer"},
        )


async def _is_token_revoked(jti: str) -> bool:
    """Kiểm tra token đã bị thu hồi (logout) chưa.

    Ưu tiên kiểm tra Redis, fallback PostgreSQL.
    """
    # Thử Redis trước (nhanh hơn)
    try:
        redis = await get_redis()
        if redis is not None:
            result = await redis.get(f"token_blacklist:{jti}")
            return result is not None
    except Exception:
        pass  # Fallback sang PostgreSQL

    # Fallback: kiểm tra trong DB
    return await is_token_blacklisted(jti)


async def revoke_token(jti: str, expires_at: datetime) -> None:
    """Thu hồi token — lưu vào Redis (TTL) và PostgreSQL (backup).

    Gọi khi logout để invalidate token ngay lập tức.
    """
    ttl_seconds = max(0, int((expires_at - datetime.now(timezone.utc)).total_seconds()))

    # Lưu vào Redis với TTL tự động xóa
    try:
        redis = await get_redis()
        if redis is not None and ttl_seconds > 0:
            await redis.setex(f"token_blacklist:{jti}", ttl_seconds, "1")
    except Exception as exc:
        logger.warning("Không thể lưu token blacklist vào Redis: %s", exc)

    # Lưu vào PostgreSQL (backup)
    from db.user_repository import add_token_to_blacklist
    await add_token_to_blacklist(jti, expires_at)


async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(_bearer_scheme),
) -> Dict[str, Any]:
    """FastAPI dependency — lấy user hiện tại từ JWT token.

    Nếu ENABLE_AUTH=false, trả về user admin giả để backward compatibility.
    """
    if not ENABLE_AUTH:
        # Backward compatibility — trả về admin giả khi auth bị tắt
        return {
            "user_uid": "system",
            "email": "system@frauddetect.local",
            "full_name": "System (Auth Disabled)",
            "role": "ADMIN",
            "is_active": True,
        }

    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Yêu cầu xác thực. Vui lòng đăng nhập.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = credentials.credentials
    payload = decode_token(token)

    # Kiểm tra loại token
    if payload.get("type") != "access":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token không phải access token",
        )

    # Kiểm tra blacklist
    jti = payload.get("jti")
    if jti and await _is_token_revoked(jti):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token đã bị thu hồi. Vui lòng đăng nhập lại.",
        )

    # Lấy user từ DB để kiểm tra trạng thái mới nhất
    user_uid = payload.get("sub")
    if not user_uid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token không chứa thông tin user",
        )

    user = await get_user_by_uid(user_uid)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Tài khoản không tồn tại",
        )

    if not user.get("is_active", False):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Tài khoản đã bị vô hiệu hóa",
        )

    return user


def require_role(allowed_roles: List[str]):
    """Dependency Factory — kiểm tra role của user hiện tại.

    Sử dụng: Depends(require_role(["ADMIN", "ANALYST"]))
    Trả về user dict nếu role hợp lệ, raise 403 nếu không.
    """
    async def role_checker(
        current_user: Dict[str, Any] = Depends(get_current_user),
    ) -> Dict[str, Any]:
        if not ENABLE_AUTH:
            return current_user

        user_role = current_user.get("role", "")
        if user_role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Bạn không có quyền truy cập. Yêu cầu vai trò: {', '.join(allowed_roles)}",
            )
        return current_user

    return role_checker


def verify_token_safe(token: str, expected_token: str) -> bool:
    """So sánh hai token (timing-safe) — dùng cho email verification."""
    return hmac.compare_digest(token.encode(), expected_token.encode())
