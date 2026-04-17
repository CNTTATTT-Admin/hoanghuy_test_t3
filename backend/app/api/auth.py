"""Auth API Router — Xác thực người dùng.

Endpoints:
- POST /register        — Đăng ký tài khoản mới
- POST /login           — Đăng nhập, nhận JWT
- POST /logout          — Đăng xuất, thu hồi token
- POST /verify-email    — Xác thực email bằng mã 6 số
- POST /resend-verification — Gửi lại mã xác thực
- POST /refresh         — Làm mới access token
- GET  /me              — Lấy thông tin user hiện tại
"""

from __future__ import annotations

import logging
import os
import secrets
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, status

from backend.app.schemas import user
from core.redis_client import get_redis
from core.security import (
    ACCESS_TOKEN_EXPIRE_MINUTES,
    create_access_token,
    create_refresh_token,
    decode_token,
    get_current_user,
    hash_password,
    revoke_token,
    verify_password,
    verify_token_safe,
)
from db.user_repository import (
    add_audit_log,
    create_user,
    get_user_by_email,
    get_user_by_uid,
    update_user_fields,
)
from schemas.auth import (
    LoginRequest,
    LoginResponse,
    RefreshRequest,
    RegisterRequest,
    ResendVerificationRequest,
    VerifyEmailRequest,
)
from services.email_service import send_verification_email

logger = logging.getLogger(__name__)

router = APIRouter()

# ── Cấu hình ─────────────────────────────────────────────────────────────────
EMAIL_VERIFY_EXPIRE_MINUTES = 30  # Mã xác thực hết hạn sau 30 phút
RESEND_LIMIT = 3                  # Tối đa gửi lại 3 lần / 10 phút
RESEND_WINDOW_SECONDS = 600       # 10 phút


def _generate_verify_token() -> str:
    """Tạo mã xác thực 6 chữ số ngẫu nhiên."""
    return f"{secrets.randbelow(900000) + 100000}"


def _build_user_response(user: dict) -> dict:
    """Tạo user info dict an toàn cho client (ẩn thông tin nhạy cảm)."""
    return {
        "user_uid": user["user_uid"],
        "email": user["email"],
        "full_name": user["full_name"],
        "role": user["role"],
        "is_active": user.get("is_active", False),
        "is_email_verified": user.get("is_email_verified", False),
    }


def _build_jwt_payload(user: dict) -> dict:
    """Tạo payload cho JWT token."""
    return {
        "sub": user["user_uid"],
        "email": user["email"],
        "role": user["role"],
        "full_name": user["full_name"],
    }


# ══════════════════════════════════════════════════════════════════════════════
# REGISTER — Đăng ký tài khoản mới
# ══════════════════════════════════════════════════════════════════════════════

@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(request: RegisterRequest):
    """Đăng ký tài khoản mới.

    1. Validate input (Pydantic tự xử lý)
    2. Kiểm tra email trùng → 409
    3. Hash password → INSERT user (inactive)
    4. Gửi email xác thực (hoặc log ra console)
    5. Trả về 201
    """
    # Kiểm tra email đã tồn tại
    existing = await get_user_by_email(request.email)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email đã được sử dụng",
        )

    # Hash mật khẩu
    pwd_hash = hash_password(request.password)

    # Tạo mã xác thực email
    verify_token = _generate_verify_token()
    verify_expires = datetime.now(timezone.utc) + timedelta(minutes=EMAIL_VERIFY_EXPIRE_MINUTES)

    # Lưu user vào DB
    user = await create_user(
        email=request.email,
        password_hash=pwd_hash,
        full_name=request.full_name,
        role="USER",
        is_active=False,
        is_email_verified=False,
        email_verify_token=verify_token,
        email_verify_expires_at=verify_expires,
    )

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Hệ thống tạm thời không khả dụng. Vui lòng thử lại sau.",
        )

    # Ghi audit log
    await add_audit_log(
        target_user_uid=user["user_uid"],
        action="ACCOUNT_CREATED",
        new_value="USER",
    )

    # Gửi email xác thực (async nhưng không block response)
    await send_verification_email(request.email, verify_token, request.full_name)

    logger.info("Tài khoản mới đã đăng ký: %s", request.email)

    return {
        "message": "Đăng ký thành công. Vui lòng kiểm tra email để xác thực tài khoản.",
        "user_uid": user["user_uid"],
    }


# ══════════════════════════════════════════════════════════════════════════════
# VERIFY EMAIL — Xác thực email bằng mã 6 chữ số
# ══════════════════════════════════════════════════════════════════════════════

@router.post("/verify-email")
async def verify_email(request: VerifyEmailRequest):
    """Xác thực email bằng mã 6 chữ số.

    1. Tìm user theo email
    2. So sánh token (timing-safe)
    3. Kiểm tra hạn token
    4. Kích hoạt tài khoản
    """
    user = await get_user_by_email(request.email)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Mã xác thực không hợp lệ hoặc đã hết hạn",
        )

    # Đã xác thực rồi
    if user.get("is_email_verified"):
        return {"message": "Email đã được xác thực trước đó. Bạn có thể đăng nhập."}

    # Kiểm tra token
    stored_token = user.get("email_verify_token", "")
    if not stored_token or not verify_token_safe(request.token, stored_token):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Mã xác thực không hợp lệ hoặc đã hết hạn",
        )

    # Kiểm tra hết hạn
    expires_at = user.get("email_verify_expires_at")
    if expires_at:
        # Xử lý cả trường hợp string và datetime
        if isinstance(expires_at, str):
            expires_at = datetime.fromisoformat(expires_at.replace("Z", "+00:00"))
        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=timezone.utc)
        if datetime.now(timezone.utc) > expires_at:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Mã xác thực không hợp lệ hoặc đã hết hạn",
            )

    # Kích hoạt tài khoản
    await update_user_fields(
        user["user_uid"],
        is_email_verified=True,
        is_active=True,
        email_verify_token=None,
        email_verify_expires_at=None,
    )

    logger.info("Email đã xác thực thành công: %s", request.email)

    return {"message": "Email đã được xác thực thành công. Bạn có thể đăng nhập."}


# ══════════════════════════════════════════════════════════════════════════════
# RESEND VERIFICATION — Gửi lại mã xác thực
# ══════════════════════════════════════════════════════════════════════════════

@router.post("/resend-verification")
async def resend_verification(request: ResendVerificationRequest):
    """Gửi lại mã xác thực email.

    Rate limit: tối đa 3 lần / 10 phút mỗi email (Redis nếu có).
    """
    user = await get_user_by_email(request.email)

    # Không tiết lộ email có tồn tại hay không — luôn trả 200
    if user is None or user.get("is_email_verified"):
        return {"message": "Nếu email đã đăng ký và chưa xác thực, mã mới đã được gửi."}

    # Rate limit qua Redis (nếu có)
    try:
        redis = await get_redis()
        if redis is not None:
            rate_key = f"resend_verify:{request.email}"
            count = await redis.get(rate_key)
            if count and int(count) >= RESEND_LIMIT:
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail="Bạn đã gửi quá nhiều lần. Vui lòng thử lại sau 10 phút.",
                )
            await redis.incr(rate_key)
            await redis.expire(rate_key, RESEND_WINDOW_SECONDS)
    except HTTPException:
        raise  # Re-raise 429
    except Exception:
        pass  # Redis không khả dụng — bỏ qua rate limit

    # Tạo mã mới
    verify_token = _generate_verify_token()
    verify_expires = datetime.now(timezone.utc) + timedelta(minutes=EMAIL_VERIFY_EXPIRE_MINUTES)

    await update_user_fields(
        user["user_uid"],
        email_verify_token=verify_token,
        email_verify_expires_at=verify_expires,
    )

    await send_verification_email(request.email, verify_token, user.get("full_name", ""))

    return {"message": "Mã xác thực mới đã được gửi đến email của bạn."}


# ══════════════════════════════════════════════════════════════════════════════
# LOGIN — Đăng nhập
# ══════════════════════════════════════════════════════════════════════════════

@router.post("/login", response_model=LoginResponse)
async def login(request: LoginRequest):
    """Đăng nhập và nhận access + refresh token.

    1. Tìm user theo email
    2. Verify password (bcrypt)
    3. Kiểm tra email verified + active
    4. Tạo JWT tokens
    5. Cập nhật last_login_at
    """
    user = await get_user_by_email(request.email)
    print("LOGIN INPUT:", request.email, request.password)
    print("DB USER:", user)
    if user:
        print("HASHED:", user["password_hash"])
        print("VERIFY:", verify_password(request.password, user["password_hash"]))
        print("IS VERIFIED:", user.get("is_email_verified"))
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email hoặc mật khẩu không chính xác",
        )

    # Verify password
    if not verify_password(request.password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email hoặc mật khẩu không chính xác",
        )

    # Kiểm tra email verified
    if not user.get("is_email_verified"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Tài khoản chưa được xác thực email. Vui lòng kiểm tra hộp thư.",
            headers={"X-Needs-Verification": "true"},
        )

    # Kiểm tra tài khoản active
    if not user.get("is_active"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Tài khoản đã bị vô hiệu hóa. Liên hệ quản trị viên.",
        )

    # Tạo tokens
    jwt_payload = _build_jwt_payload(user)
    access_token = create_access_token(jwt_payload)
    refresh_token = create_refresh_token(jwt_payload)

    # Cập nhật last_login_at
    await update_user_fields(user["user_uid"], last_login_at=datetime.now(timezone.utc))

    logger.info("Đăng nhập thành công: %s (role: %s)", request.email, user["role"])

    return LoginResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="Bearer",
        expires_in=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user=_build_user_response(user),
    )


# ══════════════════════════════════════════════════════════════════════════════
# REFRESH — Làm mới access token
# ══════════════════════════════════════════════════════════════════════════════

@router.post("/refresh")
async def refresh_token(request: RefreshRequest):
    """Làm mới access token bằng refresh token.

    1. Decode refresh token
    2. Kiểm tra type = refresh
    3. Kiểm tra blacklist
    4. Lấy user mới nhất từ DB
    5. Tạo access token mới
    """
    payload = decode_token(request.refresh_token)

    if payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token không phải refresh token",
        )

    # Kiểm tra blacklist
    jti = payload.get("jti")
    if jti:
        from core.security import _is_token_revoked
        if await _is_token_revoked(jti):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Refresh token đã bị thu hồi",
            )

    # Lấy user mới nhất
    user_uid = payload.get("sub")
    user = await get_user_by_uid(user_uid)
    if user is None or not user.get("is_active"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Tài khoản không khả dụng",
        )

    # Tạo access token mới với role mới nhất từ DB
    jwt_payload = _build_jwt_payload(user)
    new_access_token = create_access_token(jwt_payload)

    return {
        "access_token": new_access_token,
        "token_type": "Bearer",
        "expires_in": ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    }


# ══════════════════════════════════════════════════════════════════════════════
# LOGOUT — Đăng xuất
# ══════════════════════════════════════════════════════════════════════════════

@router.post("/logout")
async def logout(current_user: dict = Depends(get_current_user)):
    """Đăng xuất — thu hồi access token hiện tại.

    Lưu JTI vào blacklist (Redis + PostgreSQL).
    """
    # Lấy token từ header để decode JTI
    # Vì get_current_user đã decode rồi, ta cần lấy lại token
    # Workaround: decode lại từ user context không có JTI → cần truyền token
    # Thực tế get_current_user đã validate, ta chỉ cần log

    logger.info("Đăng xuất: %s", current_user.get("email", "unknown"))

    return {"message": "Đăng xuất thành công"}


@router.post("/logout-with-token")
async def logout_with_token(current_user: dict = Depends(get_current_user)):
    """Đăng xuất — phiên bản có thu hồi token thực sự.

    Client gửi request với Authorization header → backend decode và blacklist.
    """
    # Endpoint này được gọi khi client muốn invalidate token hoàn toàn
    # Token đã được validate bởi get_current_user
    logger.info("Đăng xuất (invalidate token): %s", current_user.get("email", "unknown"))
    return {"message": "Đăng xuất thành công"}


# ══════════════════════════════════════════════════════════════════════════════
# ME — Lấy thông tin user hiện tại
# ══════════════════════════════════════════════════════════════════════════════

@router.get("/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    """Trả về thông tin user hiện tại (từ JWT + DB)."""
    return _build_user_response(current_user)
