"""Rate limiting logic — Redis-backed with in-process sliding-window fallback."""

import datetime
import logging
import time
from typing import Dict

from core.redis_client import get_redis

logger = logging.getLogger(__name__)

# ── In-process rate limit fallback when Redis is unavailable ──────────────────
_local_rate_counters: Dict[str, list] = {}  # key → list of timestamps


def _local_rate_check(name_orig: str, max_requests: int = 10, window_seconds: int = 60) -> tuple[bool, int]:
    """In-process sliding window rate limiter — fallback when Redis is None."""
    now = time.monotonic()
    key = f"ratelimit:{name_orig}"
    timestamps = _local_rate_counters.get(key, [])
    # Evict entries outside window
    cutoff = now - window_seconds
    timestamps = [t for t in timestamps if t > cutoff]
    timestamps.append(now)
    _local_rate_counters[key] = timestamps
    count = len(timestamps)
    logger.debug("[RATE_LIMIT] local user=%s count=%d/%d", name_orig, count, max_requests)
    if count > max_requests:
        logger.warning("[RATE_LIMIT] local user=%s BLOCKED count=%d", name_orig, count)
        return False, window_seconds
    return True, 0


async def _get_rate_limit() -> int:
    try:
        redis = await get_redis()
        if redis:
            val = await redis.get("settings:system:rate_limit_per_minute")
            if val:
                return int(val)
    except Exception:
        pass
    return 10


async def _check_rate_limit(name_orig: str, redis) -> tuple[bool, int]:
    """Kiểm tra rate limit theo cửa sổ 1 phút cho user.

    Key: "ratelimit:{name_orig}:{YYYY-MM-DD:HH:MM}" — cửa sổ 1 phút.
    Logic:
      count = INCR key
      if count == 1: EXPIRE key 60
      if count > 10: return (False, 60)  → VELOCITY_ABUSE
    Trả về (True, 0) nếu OK, (False, 60) nếu vượt giới hạn.
    Nếu redis=None: dùng in-process sliding window fallback.
    """
    if redis is None:
        logger.debug("[RATE_LIMIT] redis=None — using in-process fallback for user=%s", name_orig)
        return _local_rate_check(name_orig)
    logger.debug("[RATE_LIMIT] redis type=%s for user=%s", type(redis).__name__, name_orig)
    try:
        window = datetime.datetime.utcnow().strftime("%Y-%m-%d:%H:%M")
        key = f"ratelimit:{name_orig}:{window}"
        count = await redis.incr(key)
        if count == 1:
            await redis.expire(key, 60)  # TTL bắt buộc — không để key tồn tại vĩnh viễn
        rate_limit = await _get_rate_limit()
        logger.debug("[RATE_LIMIT] redis user=%s count=%d/%d", name_orig, count, rate_limit)
        if count > rate_limit:
            logger.warning("[RATE_LIMIT] redis user=%s BLOCKED count=%d", name_orig, count)
            return False, 60
        return True, 0
    except Exception as exc:
        logger.warning("[RATE_LIMIT] redis.incr() failed (type=%s), fallback to local: %s", type(redis).__name__, exc)
        return _local_rate_check(name_orig)
