"""Email Service — Gửi email xác thực tài khoản.

Hỗ trợ 2 chế độ:
1. SMTP thật: khi SMTP_HOST được cấu hình → gửi email qua SMTP (chạy trong thread pool)
2. Development: khi SMTP_HOST rỗng → log mã xác thực ra console

Tính năng:
- Thread pool executor: smtplib (blocking I/O) chạy trong executor, không block event loop
- Retry tự động: tối đa 2 lần retry nếu gửi thất bại, delay 1s giữa các lần
- Startup health check: verify_smtp_connection() kiểm tra kết nối khi server boot
- An toàn: không log SMTP_PASSWORD, không truyền credentials qua HTTP response
"""

from __future__ import annotations

import asyncio
import logging
import os
import smtplib
from concurrent.futures import ThreadPoolExecutor
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

logger = logging.getLogger(__name__)

# Không dùng module-level constants cho SMTP — đọc lazily bên trong hàm qua _smtp_cfg()
# để đảm bảo load_dotenv() đã chạy trước khi giá trị được sử dụng.

# Thread pool riêng cho SMTP — smtplib là blocking I/O, phải chạy ngoài event loop
_smtp_executor = ThreadPoolExecutor(max_workers=2, thread_name_prefix="smtp")


def _smtp_cfg() -> tuple[str, int, str, str, str]:
    """Đọc cấu hình SMTP lazily từ os.environ — gọi trong từng hàm, không phải lúc import.

    Trả về: (host, port, user, password, from_addr)
    """
    host     = os.getenv("SMTP_HOST", "").strip()
    port     = int(os.getenv("SMTP_PORT", "587"))
    user     = os.getenv("SMTP_USER", "").strip()
    password = os.getenv("SMTP_PASSWORD", "").strip()
    from_addr = os.getenv("SMTP_FROM", "noreply@frauddetect.local").strip()
    return host, port, user, password, from_addr


def _is_smtp_configured() -> bool:
    """Kiểm tra SMTP có được cấu hình hay không."""
    host, *_ = _smtp_cfg()
    return bool(host)


def _build_email_message(to_email: str, token: str, full_name: str, from_addr: str) -> MIMEMultipart:
    """Tạo đối tượng MIME email — plain text + HTML."""
    greeting = f"Xin chào {full_name}" if full_name else "Xin chào"

    html_body = f"""
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #1976d2;">&#128274; FraudDetect &#8212; Xác thực email</h2>
        <p>{greeting},</p>
        <p>Mã xác thực của bạn là:</p>
        <div style="background: #f5f5f5; padding: 24px; text-align: center;
                    border-radius: 8px; margin: 20px 0; border: 2px solid #1976d2;">
            <span style="font-size: 36px; font-weight: bold; letter-spacing: 10px;
                         color: #1976d2; font-family: monospace;">{token}</span>
        </div>
        <p>Mã này có hiệu lực trong <strong>30 phút</strong>.</p>
        <p style="color: #666; font-size: 13px;">
            Nếu bạn không yêu cầu tạo tài khoản, vui lòng bỏ qua email này.
        </p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #999; font-size: 11px;">
            FraudDetect &#8212; Hệ thống phát hiện gian lận tài chính
        </p>
    </div>
    """

    text_body = (
        f"{greeting},\n\n"
        f"Mã xác thực FraudDetect của bạn là: {token}\n\n"
        f"Mã có hiệu lực trong 30 phút.\n\n"
        f"Nếu bạn không yêu cầu tạo tài khoản, vui lòng bỏ qua email này."
    )

    msg = MIMEMultipart("alternative")
    msg["Subject"] = "[FraudDetect] Xác thực email của bạn"
    msg["From"] = from_addr
    msg["To"] = to_email
    msg.attach(MIMEText(text_body, "plain", "utf-8"))
    msg.attach(MIMEText(html_body, "html", "utf-8"))
    return msg


def _smtp_send_blocking(msg_string: str, to_email: str) -> None:
    """Gửi email qua SMTP — hàm blocking, chạy trong thread pool.

    Raises:
        Exception: bất kỳ lỗi SMTP nào — caller xử lý retry.
    """
    host, port, user, password, from_addr = _smtp_cfg()
    with smtplib.SMTP(host, port, timeout=10) as server:
        server.ehlo()
        if port == 587:
            server.starttls()
            server.ehlo()
        if user and password:
            server.login(user, password)
        # Lấy địa chỉ From thuần (bỏ phần display name nếu có)
        raw_from = from_addr.split("<")[-1].rstrip(">").strip() if "<" in from_addr else from_addr
        server.sendmail(raw_from, [to_email], msg_string)


async def verify_smtp_connection() -> bool:
    """Kiểm tra kết nối SMTP khi server khởi động (startup health check).

    Returns:
        True nếu kết nối thành công, False nếu lỗi hoặc chưa cấu hình.
    """
    if not _is_smtp_configured():
        logger.warning(
            "SMTP chưa cấu hình (SMTP_HOST trống) — "
            "email sẽ được log ra console (dev mode)."
        )
        return False
    try:
        loop = asyncio.get_running_loop()
        await loop.run_in_executor(_smtp_executor, _check_smtp_blocking)
        host, port, user, *_ = _smtp_cfg()
        logger.info("✓ Kết nối SMTP thành công: %s:%s (user=%s)", host, port, user)
        return True
    except Exception as exc:
        host, port, *_ = _smtp_cfg()
        logger.error(
            "✗ Không thể kết nối SMTP %s:%s — %s. "
            "Email sẽ fallback về dev mode (log console).",
            host, port, exc,
        )
        return False


def _check_smtp_blocking() -> None:
    """Kiểm tra kết nối SMTP (blocking) — chạy trong thread pool."""
    host, port, user, password, _ = _smtp_cfg()
    with smtplib.SMTP(host, port, timeout=5) as server:
        server.ehlo()
        if port == 587:
            server.starttls()
            server.ehlo()
        if user and password:
            server.login(user, password)


async def send_verification_email(
    email: str,
    token: str,
    full_name: str = "",
    retries: int = 2,
) -> bool:
    """Gửi email xác thực có chứa mã 6 chữ số.

    - Nếu SMTP chưa cấu hình: log mã ra console (dev mode).
    - Nếu SMTP đã cấu hình: gửi email thật, retry tối đa `retries` lần nếu thất bại.
    - SMTP blocking call chạy trong thread pool → không block async event loop.

    Args:
        email: Địa chỉ email người nhận.
        token: Mã xác thực 6 chữ số.
        full_name: Tên người dùng (dùng trong lời chào).
        retries: Số lần retry nếu gửi thất bại (mặc định 2).

    Returns:
        True nếu gửi / log thành công, False nếu thất bại sau tất cả lần thử.
    """
    if not _is_smtp_configured():
        # Dev mode — hiển thị mã ở console để tiện test
        logger.info(
            "═══ EMAIL XÁC THỰC (dev mode) ═══\n"
            "  To:    %s\n"
            "  Token: %s\n"
            "  (Đặt SMTP_HOST để gửi email thật)\n"
            "══════════════════════════════════",
            email, token,
        )
        return True

    # Tạo MIME message một lần, dùng lại cho các lần retry
    _, _, _, _, from_addr = _smtp_cfg()
    msg = _build_email_message(email, token, full_name, from_addr)
    msg_string = msg.as_string()

    loop = asyncio.get_running_loop()

    for attempt in range(1, retries + 2):   # attempt: 1, 2, 3 (= retries+1 lần tổng)
        try:
            await loop.run_in_executor(
                _smtp_executor,
                _smtp_send_blocking,
                msg_string,
                email,
            )
            logger.info("Email xác thực đã gửi thành công đến %s (lần %d)", email, attempt)
            return True
        except Exception as exc:
            if attempt <= retries:
                logger.warning(
                    "Gửi email thất bại (lần %d/%d) đến %s: %s — thử lại sau 1s",
                    attempt, retries + 1, email, exc,
                )
                await asyncio.sleep(1)
            else:
                logger.error(
                    "Gửi email thất bại sau %d lần thử đến %s: %s",
                    retries + 1, email, exc,
                )

    return False
