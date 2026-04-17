"""Redis client singleton dùng redis.asyncio.

Kết nối từ env: REDIS_URL (default: redis://localhost:6379/0)
Connection pool: max_connections=50, socket_timeout=0.1 (fail fast)
ENABLE_REDIS env flag: nếu False → get_redis() trả về None (graceful degradation).
"""

from __future__ import annotations

import logging
import os
from typing import Optional

logger = logging.getLogger(__name__)

# ── State singleton ───────────────────────────────────────────────────────────
_redis_instance: Optional[object] = None   # redis.asyncio.Redis hoặc None
_redis_disabled_warned: bool = False


def _is_redis_enabled() -> bool:
    """Trả về True nếu ENABLE_REDIS=true trong env."""
    global _redis_disabled_warned
    enabled = os.getenv("ENABLE_REDIS", "false").lower() == "true"
    if not enabled and not _redis_disabled_warned:
        _redis_disabled_warned = True
        logger.warning(
            "[REDIS] ENABLE_REDIS is '%s' (not 'true') — Redis DISABLED. "
            "Rate limiting will use in-memory fallback. "
            "Behavioral state will NOT persist across restarts.",
            os.getenv("ENABLE_REDIS", "(not set)"),
        )
    return enabled


async def get_redis():
    """Lấy Redis client singleton (lazy init).

    Trả về None nếu:
    - ENABLE_REDIS != 'true'
    - Kết nối thất bại (graceful degradation)
    """
    global _redis_instance

    if not _is_redis_enabled():
        return None

    if _redis_instance is not None:
        return _redis_instance

    try:
        import redis.asyncio as aioredis  # type: ignore

        redis_url = os.getenv("REDIS_URL", "redis://localhost:6379/0")
        pool = aioredis.ConnectionPool.from_url(
            redis_url,
            max_connections=50,
            socket_timeout=0.1,       # fail-fast: không đợi Redis lâu
            socket_connect_timeout=0.1,
            decode_responses=True,
        )
        _redis_instance = aioredis.Redis(connection_pool=pool)
        # Kiểm tra kết nối ngay lúc khởi tạo
        await _redis_instance.ping()
        logger.info("Redis singleton đã kết nối: %s", redis_url)
    except Exception as exc:
        logger.warning("Không thể kết nối Redis, chạy không có cache: %s", exc)
        _redis_instance = None

    return _redis_instance


async def redis_health() -> bool:
    """Kiểm tra Redis còn sống không — dùng cho health check endpoint.

    Trả về True nếu PING thành công, False nếu Redis không khả dụng.
    """
    try:
        r = await get_redis()
        if r is None:
            return False
        await r.ping()
        return True
    except Exception:
        return False


async def close_redis() -> None:
    """Đóng connection pool khi shutdown — gọi trong FastAPI lifespan."""
    global _redis_instance
    if _redis_instance is not None:
        try:
            await _redis_instance.aclose()
            logger.info("Redis connection pool đã đóng.")
        except Exception as exc:
            logger.warning("Lỗi khi đóng Redis: %s", exc)
        finally:
            _redis_instance = None


# ── Repeat Transaction Risk Escalation ────────────────────────────────────────

import hashlib  # noqa: E402

REPEAT_RISK_INCREMENT = 20   # Mỗi lần lặp +20 risk score
REPEAT_RISK_TTL = 300        # Reset sau 5 phút không hoạt động
REPEAT_RISK_MAX = 100        # Giới hạn max risk score = 100


def _build_transaction_fingerprint(
    user_id: str, amount: float, tx_type: str, receiver: str = ""
) -> str:
    """
    Tạo fingerprint SHA256 từ thông tin giao dịch để nhận diện giao dịch lặp.
    Cùng user_id + amount + type + receiver → cùng fingerprint.
    """
    raw = f"{user_id}|{amount}|{tx_type}|{receiver}"
    return hashlib.sha256(raw.encode()).hexdigest()


async def get_repeat_risk_bonus(
    user_id: str, amount: float, tx_type: str, receiver: str = ""
) -> int:
    """
    Tính risk bonus cho giao dịch lặp.
    - Lần 1: return 0 (không cộng)
    - Lần 2: return 20
    - Lần 3: return 40
    - ...
    - Max: 100
    """
    r = await get_redis()
    if r is None:
        return 0

    fingerprint = _build_transaction_fingerprint(user_id, amount, tx_type, receiver)
    key = f"repeat_risk:{fingerprint}"

    try:
        count = await r.incr(key)
        await r.expire(key, REPEAT_RISK_TTL)
        bonus = (count - 1) * REPEAT_RISK_INCREMENT
        return min(bonus, REPEAT_RISK_MAX)
    except Exception as exc:
        logger.debug("get_repeat_risk_bonus error: %s", exc)
        return 0


async def get_repeat_count(
    user_id: str, amount: float, tx_type: str, receiver: str = ""
) -> int:
    """Lấy số lần giao dịch đã lặp (dùng cho logging/response)."""
    r = await get_redis()
    if r is None:
        return 1

    fingerprint = _build_transaction_fingerprint(user_id, amount, tx_type, receiver)
    key = f"repeat_risk:{fingerprint}"
    try:
        count = await r.get(key)
        return int(count) if count else 1
    except Exception:
        return 1
