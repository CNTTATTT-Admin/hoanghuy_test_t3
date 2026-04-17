"""Leakage-safe time-dependent features for online (realtime) fraud detection.

In a production streaming system, behavioural features like "how many
transactions did this user make in the last hour?" must be computed from
*past* events only.  This module provides:

  - :class:`OnlineFeatureState`  — stateful tracker updated event-by-event.
  - :func:`create_safe_time_features` — batch computation for offline analysis.
"""

from __future__ import annotations

import json
import logging
from collections import deque
from dataclasses import dataclass, field
from typing import Any, Deque, Dict, Optional, Tuple

import numpy as np
import pandas as pd

logger = logging.getLogger(__name__)

HOURS_1 = 1.0
HOURS_24 = 24.0
HOURS_7D = 24.0 * 7.0

SAFE_TIME_FEATURE_COLUMNS = [
    "number_of_transactions_last_1h",
    "total_amount_last_24h",
    "unique_devices_or_accounts_last_7d",
    "time_since_last_transaction",
    "transaction_frequency_change",
    "amount_zscore_user",      # How unusual is this amount vs. user history?
    "user_avg_amount",         # Baseline spending level for the user.
    "is_cold_start",           # 1 nếu user chưa có lịch sử giao dịch.
]

# Cold-start defaults — giá trị impute cho user mới chưa có lịch sử.
# Được thiết kế để KHÔNG route vào leaf "safe" của model:
#  - time_since_last_transaction = 168.0 (7 ngày) → biểu thị "rất lâu rồi"
#  - amount_zscore_user = 2.0 → giao dịch bất thường so với baseline
#  - user_avg_amount = -1.0 → flag đặc biệt: chưa có baseline
# Các giá trị này sẽ bị ghi đè bởi population_stats nếu có.
COLD_START_DEFAULTS = {
    "number_of_transactions_last_1h": 0.0,
    "total_amount_last_24h": 0.0,
    "unique_devices_or_accounts_last_7d": 0.0,
    "time_since_last_transaction": 168.0,
    "transaction_frequency_change": 0.0,
    "amount_zscore_user": 2.0,
    "user_avg_amount": -1.0,
    "is_cold_start": 1.0,
}


# ── Online stateful tracker ───────────────────────────────────────────────────

@dataclass
class OnlineFeatureState:
    """Per-user state for computing safe time-window features in real time.

    Update with :meth:`update` before reading :meth:`compute_features` to
    ensure each feature sees only *past* transactions (exclusive of the current
    one).

    Args:
        user_id:      Identifier of the user this state tracks.
        redis_client: Redis client async (tùy chọn). Nếu None → dùng in-memory.
    """

    user_id: str
    # redis_client không dùng field() của dataclass vì nó không serializable
    _events: Deque[Tuple[float, float, str]] = field(
        default_factory=deque, repr=False
    )  # (step, amount, counterparty)

    def __post_init__(self) -> None:
        # Redis client và memory fallback dict được khởi tạo sau dataclass init
        self._redis: Any = None       # redis.asyncio.Redis hoặc None
        self._redis_sync: Any = None  # redis.Redis (sync) hoặc None
        self._memory: Dict[str, Any] = {}  # fallback store khi không có Redis
        self._hydrated: bool = False  # True nếu đã load từ Redis/memory

    # ── Phương thức đặt Redis client sau khi khởi tạo ────────────────────────

    def set_redis(self, redis_client: Any) -> None:
        """Gắn Redis client vào state sau khi object đã được tạo."""
        self._redis = redis_client

    def set_redis_sync(self, redis_client_sync: Any) -> None:
        """Gắn sync Redis client để compute_features/update có thể persist."""
        self._redis_sync = redis_client_sync

    # ── Sync Redis hydration — load events từ Redis vào _events deque ────────

    def _hydrate_if_needed(self) -> None:
        """Load event history từ Redis (sync) vào _events nếu chưa load."""
        if self._hydrated:
            return
        self._hydrated = True

        if self._redis_sync is None:
            logger.debug("[HYDRATE] user=%s — no sync Redis client, using in-memory only", self.user_id)
            return

        try:
            redis_key = f"user_state:{self.user_id}"
            raw = self._redis_sync.hgetall(redis_key)
            if raw:
                # decode_responses=True → keys are strings; fallback for bytes
                amounts = json.loads(raw.get("amounts") or raw.get(b"amounts", "[]"))
                steps = json.loads(raw.get("steps") or raw.get(b"steps", "[]"))
                counterparties = json.loads(raw.get("counterparties") or raw.get(b"counterparties", "[]"))
                self._events.clear()
                for s, a, cp in zip(steps, amounts, counterparties):
                    self._events.append((float(s), float(a), str(cp)))
                logger.info(
                    "[HYDRATE] user=%s — restored %d events from Redis",
                    self.user_id, len(self._events),
                )
            else:
                logger.debug("[HYDRATE] user=%s — no history in Redis (truly new user)", self.user_id)
        except Exception as exc:
            logger.warning("[HYDRATE] user=%s — Redis load failed, using in-memory: %s", self.user_id, exc)

    def _persist_to_redis(self) -> None:
        """Ghi _events hiện tại ra Redis (sync)."""
        if self._redis_sync is None:
            return
        try:
            # Trim to MAX_HISTORY before persisting
            events_list = list(self._events)
            if len(events_list) > self._MAX_HISTORY:
                events_list = events_list[-self._MAX_HISTORY:]

            amounts = [e[1] for e in events_list]
            steps = [e[0] for e in events_list]
            counterparties = [e[2] for e in events_list]

            redis_key = f"user_state:{self.user_id}"
            self._redis_sync.hset(redis_key, mapping={
                "amounts": json.dumps(amounts),
                "steps": json.dumps(steps),
                "counterparties": json.dumps(counterparties),
            })
            self._redis_sync.expire(redis_key, self._REDIS_TTL)
            logger.debug(
                "[PERSIST] user=%s — saved %d events to Redis",
                self.user_id, len(events_list),
            )
        except Exception as exc:
            logger.warning("[PERSIST] user=%s — Redis save failed: %s", self.user_id, exc)

    # ── Async methods — Redis primary, memory fallback ────────────────────────

    _REDIS_TTL = 2592000  # 30 ngày (giây)
    _MAX_HISTORY = 100    # số entry tối đa giữ lại cho mỗi user

    async def get_history(self, user_id: str) -> Dict[str, Any]:
        """Lấy lịch sử giao dịch từ Redis; fallback sang in-memory nếu cần.

        Trả về dict với keys: 'amounts', 'steps', 'counterparties' (list).
        """
        if self._redis is not None:
            try:
                redis_key = f"user_state:{user_id}"
                raw = await self._redis.hgetall(redis_key)
                if raw:
                    return {
                        "amounts":        json.loads(raw.get("amounts", "[]")),
                        "steps":          json.loads(raw.get("steps", "[]")),
                        "counterparties": json.loads(raw.get("counterparties", "[]")),
                    }
            except Exception:
                pass  # fallback sang memory

        # Memory fallback
        mem = self._memory.get(user_id, {})
        return {
            "amounts":        mem.get("amounts", []),
            "steps":          mem.get("steps", []),
            "counterparties": mem.get("counterparties", []),
        }

    async def update_history(
        self,
        user_id: str,
        amount: float,
        step: float,
        counterparty: str,
    ) -> None:
        """Thêm entry mới vào lịch sử; trim về MAX_HISTORY; reset TTL.

        Primary store: Redis Hash "user_state:{user_id}".
        Fallback: in-memory dict khi Redis không sẵn sàng.
        Tất cả Redis key đều có TTL — không để key tồn tại vĩnh viễn.
        """
        history = await self.get_history(user_id)
        history["amounts"].append(float(amount))
        history["steps"].append(float(step))
        history["counterparties"].append(str(counterparty))

        # Trim FIFO về MAX_HISTORY entries
        for k in ("amounts", "steps", "counterparties"):
            if len(history[k]) > self._MAX_HISTORY:
                history[k] = history[k][-self._MAX_HISTORY:]

        if self._redis is not None:
            try:
                redis_key = f"user_state:{user_id}"
                await self._redis.hset(redis_key, mapping={
                    "amounts":        json.dumps(history["amounts"]),
                    "steps":          json.dumps(history["steps"]),
                    "counterparties": json.dumps(history["counterparties"]),
                })
                # Refresh TTL mỗi lần update
                await self._redis.expire(redis_key, self._REDIS_TTL)
                return
            except Exception:
                pass  # fallback sang memory

        # Memory fallback
        self._memory[user_id] = history

    # ── Sync methods (backward compatibility) ────────────────────────────────

    # ── Sync methods (backward compatibility) ────────────────────────────────

    def compute_features(self, current_step: float, current_amount: float = 0.0) -> Dict[str, float]:
        """Return safe time features computed from *past* events.

        Must be called **before** :meth:`update` for the current transaction.

        Khi user chưa có lịch sử (cold-start), trả về COLD_START_DEFAULTS
        thay vì tất cả = 0 — tránh route vào leaf "safe" của model.
        """
        self._hydrate_if_needed()
        self._evict_old(current_step)

        # Cold-start: user chưa có lịch sử giao dịch nào
        if len(self._events) == 0:
            return dict(COLD_START_DEFAULTS)

        if any(step > current_step for step, _, _ in self._events):
            raise ValueError(
                f"Future leakage detected for user={self.user_id}: found event after current step"
            )

        steps = np.array([e[0] for e in self._events])
        amounts = np.array([e[1] for e in self._events])
        counterparties = [e[2] for e in self._events]

        count_1h = int(np.sum(steps >= current_step - HOURS_1))
        total_24h = float(np.sum(amounts[steps >= current_step - HOURS_24]))
        unique_7d = len(set(cp for s, _, cp in self._events if current_step - s <= HOURS_7D))
        last_step = float(steps.max()) if len(steps) > 0 else 0.0
        time_since = float(current_step - last_step)

        recent_10 = float(np.sum(steps >= current_step - 10))
        prior_10 = float(np.sum((steps >= current_step - 20) & (steps < current_step - 10)))
        freq_change = recent_10 - prior_10

        # User-level amount statistics — how anomalous is this transaction?
        if len(amounts) >= 2:
            user_mean = float(np.mean(amounts))
            user_std = float(np.std(amounts))
            # Z-score capped at [-5, 5] to avoid extreme outlier influence
            z = (current_amount - user_mean) / max(user_std, 1.0)
            amount_zscore = float(np.clip(z, -5.0, 5.0))
        elif len(amounts) == 1:
            user_mean = float(amounts[0])
            amount_zscore = 0.0  # single observation — no deviation
        else:
            user_mean = 0.0
            amount_zscore = 0.0  # first transaction — no history

        return {
            "number_of_transactions_last_1h": float(count_1h),
            "total_amount_last_24h": total_24h,
            "unique_devices_or_accounts_last_7d": float(unique_7d),
            "time_since_last_transaction": time_since,
            "transaction_frequency_change": freq_change,
            "amount_zscore_user": amount_zscore,
            "user_avg_amount": user_mean,
            "is_cold_start": 0.0,
        }

    def update(self, step: float, amount: float, counterparty: str) -> None:
        """Record the current transaction in the state (call after scoring)."""
        self._events.append((step, amount, counterparty))
        self._persist_to_redis()

    def _evict_old(self, current_step: float) -> None:
        """Remove events older than the longest window (7 days)."""
        cutoff = current_step - HOURS_7D
        while self._events and self._events[0][0] < cutoff:
            self._events.popleft()


# ── Batch computation (offline) ───────────────────────────────────────────────

def create_safe_time_features(df: pd.DataFrame) -> pd.DataFrame:
    """Add safe time-window features to a sorted batch DataFrame.

    Features for row *i* are computed from all rows *j < i* for the same user,
    preserving the temporal ordering guarantee.

    Args:
        df: DataFrame sorted by ``step``, containing at least
            ``["step", "nameOrig", "amount"]``.

    Returns:
        Input DataFrame with ``SAFE_TIME_FEATURE_COLUMNS`` added.
    """
    required = ["step", "nameOrig", "amount"]
    missing = [c for c in required if c not in df.columns]
    if missing:
        raise ValueError(f"Missing required columns: {missing}")

    if df["step"].isnull().any() or df["amount"].isnull().any():
        raise ValueError("Behavioral feature input contains NaN in step/amount")

    result = df.copy().sort_values("step", kind="mergesort").reset_index(drop=True)
    user_states: Dict[str, OnlineFeatureState] = {}

    feature_rows = []
    for _, row in result.iterrows():
        user_id = str(row["nameOrig"])
        if user_id not in user_states:
            user_states[user_id] = OnlineFeatureState(user_id=user_id)

        state = user_states[user_id]
        features = state.compute_features(float(row["step"]), current_amount=float(row["amount"]))
        feature_rows.append(features)
        state.update(
            step=float(row["step"]),
            amount=float(row["amount"]),
            counterparty=str(row.get("nameDest", "UNKNOWN")),
        )

    features_df = pd.DataFrame(feature_rows, index=result.index)
    combined = pd.concat([result, features_df], axis=1)

    numeric = combined[SAFE_TIME_FEATURE_COLUMNS].select_dtypes(include=[np.number])
    if numeric.isnull().any().any():
        raise ValueError("Behavioral feature generation produced NaN values")
    if not np.isfinite(numeric.to_numpy()).all():
        raise ValueError("Behavioral feature generation produced non-finite values")

    return combined
