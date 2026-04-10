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


def _is_redis_enabled() -> bool:
    """Trả về True nếu ENABLE_REDIS=true trong env."""
    return os.getenv("ENABLE_REDIS", "false").lower() == "true"


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
