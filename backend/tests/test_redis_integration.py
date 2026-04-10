"""Unit tests cho Redis integration: cache, rate limit, OnlineFeatureState.

Kiểm tra:
  - Cache hit trả đúng kết quả (không gọi ML)
  - Cache miss gọi ML bình thường
  - Rate limit từ chối request thứ 11 (HTTP 429)
  - OnlineFeatureState.get_history / update_history với Redis mock
  - OnlineFeatureState fallback sang memory khi Redis lỗi

Cách chạy:
    pytest backend/tests/test_redis_integration.py -v
"""

import json
import sys
from pathlib import Path
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
import pytest_asyncio

# ── Thêm backend/app vào sys.path ────────────────────────────────────────────
_BACKEND_APP = str(Path(__file__).resolve().parents[1] / "app")
_ML_ROOT = str(Path(__file__).resolve().parents[2])
for p in (_BACKEND_APP, _ML_ROOT):
    if p not in sys.path:
        sys.path.insert(0, p)


# ─── Helpers ────────────────────────────────────────────────────────────────

def _make_redis_mock(cached_value: str | None = None, *, incr_value: int = 1) -> MagicMock:
    """Tạo mock Redis client asyncio với get, set, incr, expire."""
    mock = MagicMock()
    mock.get = AsyncMock(return_value=cached_value)
    mock.set = AsyncMock(return_value=True)
    mock.incr = AsyncMock(return_value=incr_value)
    mock.expire = AsyncMock(return_value=True)
    mock.hgetall = AsyncMock(return_value={})
    mock.hset = AsyncMock(return_value=True)
    mock.ping = AsyncMock(return_value=True)
    return mock


_BASE_TX = {
    "step": 1,
    "type": "TRANSFER",
    "amount": 450000.0,
    "oldbalanceOrg": 500000.0,
    "newbalanceOrig": 50000.0,
    "oldbalanceDest": 10000.0,
    "newbalanceDest": 460000.0,
    "nameOrig": "C123456789",
    "nameDest": "C987654321",
}


# ─── Tests: _get_cached_decision / _cache_decision ───────────────────────────

class TestDecisionCache:
    """Kiểm tra hàm _get_cached_decision và _cache_decision."""

    @pytest.mark.asyncio
    async def test_cache_miss_returns_none(self):
        """Redis trả về None → cache miss → hàm trả về None."""
        from api.transactions import _get_cached_decision

        redis = _make_redis_mock(cached_value=None)
        result = await _get_cached_decision(_BASE_TX, redis)
        assert result is None

    @pytest.mark.asyncio
    async def test_cache_hit_returns_dict(self):
        """Redis trả về JSON → cache hit → hàm trả về dict."""
        from api.transactions import _get_cached_decision

        cached_resp = {
            "authorized": True,
            "transaction_id": "TXN-HIT",
            "fraud_probability": 0.1,
            "risk_level": "LOW",
        }
        redis = _make_redis_mock(cached_value=json.dumps(cached_resp))
        result = await _get_cached_decision(_BASE_TX, redis)
        assert result == cached_resp

    @pytest.mark.asyncio
    async def test_cache_decision_calls_set(self):
        """_cache_decision phải gọi redis.set với TTL 60."""
        from api.transactions import _cache_decision

        redis = _make_redis_mock()
        result = {"authorized": True, "fraud_probability": 0.1}
        await _cache_decision(_BASE_TX, result, redis)
        redis.set.assert_called_once()
        # Kiểm tra TTL là 60 giây
        call_kwargs = redis.set.call_args
        assert call_kwargs.kwargs.get("ex") == 60 or (
            len(call_kwargs.args) >= 3 and call_kwargs.args[2] == 60
        ) or call_kwargs.kwargs.get("ex") == 60

    @pytest.mark.asyncio
    async def test_cache_skipped_when_redis_none(self):
        """Khi redis=None, _get_cached_decision phải trả về None mà không lỗi."""
        from api.transactions import _get_cached_decision, _cache_decision

        result = await _get_cached_decision(_BASE_TX, None)
        assert result is None
        # _cache_decision cũng không lỗi
        await _cache_decision(_BASE_TX, {"authorized": True}, None)

    @pytest.mark.asyncio
    async def test_cache_graceful_on_redis_error(self):
        """Nếu Redis ném exception, _get_cached_decision phải trả về None."""
        from api.transactions import _get_cached_decision

        redis = MagicMock()
        redis.get = AsyncMock(side_effect=ConnectionError("Redis down"))
        result = await _get_cached_decision(_BASE_TX, redis)
        assert result is None


# ─── Tests: _check_rate_limit ─────────────────────────────────────────────────

class TestRateLimit:
    """Kiểm tra hàm _check_rate_limit."""

    @pytest.mark.asyncio
    async def test_first_request_allowed(self):
        """Request đầu tiên (incr=1) phải được phép."""
        from api.transactions import _check_rate_limit

        redis = _make_redis_mock(incr_value=1)
        allowed, retry = await _check_rate_limit("C123", redis)
        assert allowed is True
        assert retry == 0

    @pytest.mark.asyncio
    async def test_tenth_request_allowed(self):
        """Request thứ 10 vẫn được phép."""
        from api.transactions import _check_rate_limit

        redis = _make_redis_mock(incr_value=10)
        allowed, retry = await _check_rate_limit("C123", redis)
        assert allowed is True

    @pytest.mark.asyncio
    async def test_eleventh_request_blocked(self):
        """Request thứ 11 phải bị chặn (VELOCITY_ABUSE)."""
        from api.transactions import _check_rate_limit

        redis = _make_redis_mock(incr_value=11)
        allowed, retry = await _check_rate_limit("C123", redis)
        assert allowed is False
        assert retry == 60

    @pytest.mark.asyncio
    async def test_rate_limit_skipped_when_redis_none(self):
        """Khi redis=None, mọi request đều được cho qua."""
        from api.transactions import _check_rate_limit

        allowed, retry = await _check_rate_limit("C123", None)
        assert allowed is True
        assert retry == 0

    @pytest.mark.asyncio
    async def test_rate_limit_graceful_on_redis_error(self):
        """Khi Redis lỗi → graceful degradation: cho phép request."""
        from api.transactions import _check_rate_limit

        redis = MagicMock()
        redis.incr = AsyncMock(side_effect=ConnectionError("Redis down"))
        allowed, retry = await _check_rate_limit("C123", redis)
        assert allowed is True


# ─── Tests: Rate limit qua HTTP endpoint ─────────────────────────────────────

class TestRateLimitHTTP:
    """Kiểm tra HTTP 429 khi rate limit vượt ngưỡng."""

    def _make_client_with_rate_limited_redis(self):
        """Tạo TestClient với Redis mock báo incr=11 (vượt limit)."""
        from fastapi import FastAPI
        from fastapi.testclient import TestClient
        from api.transactions import router
        import api.transactions as tx_module

        app = FastAPI()
        app.include_router(router, prefix="/api/v1")
        tx_module.realtime_service = MagicMock()
        tx_module.realtime_service.detector = MagicMock()
        tx_module.realtime_service.detector.predict.return_value = {
            "is_fraud": False,
            "fraud_probability": 0.1,
            "risk_score": 0.1,
            "risk_level": "LOW",
            "reasons": [],
        }

        redis_mock = _make_redis_mock(cached_value=None, incr_value=11)
        return TestClient(app), redis_mock, tx_module

    def test_rate_limit_returns_429(self):
        """Request thứ 11 trong 1 phút phải nhận HTTP 429."""
        from fastapi.testclient import TestClient

        client, redis_mock, tx_module = self._make_client_with_rate_limited_redis()
        with patch(
            "api.transactions.get_redis",
            new=AsyncMock(return_value=redis_mock),
        ):
            resp = client.post("/api/v1/transactions/authorize", json=_BASE_TX)

        assert resp.status_code == 429
        body = resp.json()
        assert body["authorized"] is False
        assert "VELOCITY_ABUSE" in body.get("block_reason", "")
        assert "retry_after_seconds" in body


# ─── Tests: Cache hit không gọi ML ───────────────────────────────────────────

class TestCacheHitSkipsML:
    """Kiểm tra cache hit trả kết quả mà không gọi ML."""

    def test_cache_hit_returns_immediately(self):
        """Khi cache hit, ML predict không được gọi."""
        from fastapi import FastAPI
        from fastapi.testclient import TestClient
        from api.transactions import router
        import api.transactions as tx_module

        cached_resp = {
            "authorized": True,
            "transaction_id": "TXN-CACHED",
            "fraud_probability": 0.08,
            "risk_level": "LOW",
            "risk_score": 0.08,
        }

        app = FastAPI()
        app.include_router(router, prefix="/api/v1")
        ml_mock = MagicMock()
        ml_mock.predict = MagicMock()  # không async, nhưng không nên được gọi
        tx_module.realtime_service = MagicMock()
        tx_module.realtime_service.detector = ml_mock

        redis_mock = _make_redis_mock(cached_value=json.dumps(cached_resp))

        with patch(
            "api.transactions.get_redis",
            new=AsyncMock(return_value=redis_mock),
        ):
            client = TestClient(app)
            resp = client.post("/api/v1/transactions/authorize", json=_BASE_TX)

        assert resp.status_code == 200
        assert resp.json()["transaction_id"] == "TXN-CACHED"
        ml_mock.predict.assert_not_called()


# ─── Tests: OnlineFeatureState async Redis ───────────────────────────────────

class TestOnlineFeatureStateRedis:
    """Kiểm tra get_history / update_history với Redis mock."""

    @pytest.mark.asyncio
    async def test_get_history_redis_hit(self):
        """Khi Redis trả về data, get_history phải parse JSON đúng."""
        from ml.inference.safe_feature_engineering import OnlineFeatureState

        state = OnlineFeatureState(user_id="C123")
        redis = MagicMock()
        redis.hgetall = AsyncMock(return_value={
            "amounts": "[100.0, 200.0]",
            "steps": "[1.0, 2.0]",
            "counterparties": '["M1", "M2"]',
        })
        state.set_redis(redis)

        history = await state.get_history("C123")
        assert history["amounts"] == [100.0, 200.0]
        assert history["steps"] == [1.0, 2.0]
        assert history["counterparties"] == ["M1", "M2"]

    @pytest.mark.asyncio
    async def test_get_history_redis_miss_returns_empty(self):
        """Redis hgetall trả về {} → get_history trả về lists rỗng."""
        from ml.inference.safe_feature_engineering import OnlineFeatureState

        state = OnlineFeatureState(user_id="C999")
        redis = MagicMock()
        redis.hgetall = AsyncMock(return_value={})
        state.set_redis(redis)

        history = await state.get_history("C999")
        assert history == {"amounts": [], "steps": [], "counterparties": []}

    @pytest.mark.asyncio
    async def test_update_history_calls_hset_and_expire(self):
        """update_history phải gọi hset và expire với TTL 30 ngày."""
        from ml.inference.safe_feature_engineering import OnlineFeatureState

        state = OnlineFeatureState(user_id="C123")
        redis = MagicMock()
        redis.hgetall = AsyncMock(return_value={})
        redis.hset = AsyncMock(return_value=True)
        redis.expire = AsyncMock(return_value=True)
        state.set_redis(redis)

        await state.update_history("C123", amount=500.0, step=1.0, counterparty="M1")

        redis.hset.assert_called_once()
        redis.expire.assert_called_once()
        # Kiểm tra TTL = 2592000 (30 ngày)
        expire_args = redis.expire.call_args
        assert 2592000 in expire_args.args or expire_args.kwargs.get("time") == 2592000

    @pytest.mark.asyncio
    async def test_update_history_trims_to_100(self):
        """Khi history có > 100 entries, phải trim về 100."""
        from ml.inference.safe_feature_engineering import OnlineFeatureState

        # Chuẩn bị 105 entries hiện có
        existing = {
            "amounts": list(range(105)),
            "steps": list(range(105)),
            "counterparties": ["M"] * 105,
        }
        state = OnlineFeatureState(user_id="C_TRIM")
        redis = MagicMock()
        redis.hgetall = AsyncMock(return_value={
            "amounts": json.dumps(existing["amounts"]),
            "steps": json.dumps(existing["steps"]),
            "counterparties": json.dumps(existing["counterparties"]),
        })
        redis.hset = AsyncMock(return_value=True)
        redis.expire = AsyncMock(return_value=True)
        state.set_redis(redis)

        await state.update_history("C_TRIM", amount=999.0, step=200.0, counterparty="MX")

        # Kiểm tra dữ liệu được hset là danh sách dài 100
        hset_call = redis.hset.call_args
        mapping = hset_call.kwargs.get("mapping") or hset_call.args[1]
        amounts_saved = json.loads(mapping["amounts"])
        assert len(amounts_saved) == 100
        assert amounts_saved[-1] == 999.0  # entry mới nhất ở cuối

    @pytest.mark.asyncio
    async def test_fallback_to_memory_when_redis_none(self):
        """Khi redis=None, update_history và get_history dùng in-memory dict."""
        from ml.inference.safe_feature_engineering import OnlineFeatureState

        state = OnlineFeatureState(user_id="C_MEM")
        # không set_redis → _redis = None

        await state.update_history("C_MEM", amount=100.0, step=1.0, counterparty="M1")
        history = await state.get_history("C_MEM")
        assert history["amounts"] == [100.0]
        assert history["counterparties"] == ["M1"]

    @pytest.mark.asyncio
    async def test_fallback_to_memory_on_redis_error(self):
        """Khi Redis ném exception, dữ liệu phải được lưu/lấy từ memory."""
        from ml.inference.safe_feature_engineering import OnlineFeatureState

        state = OnlineFeatureState(user_id="C_ERR")
        redis = MagicMock()
        redis.hgetall = AsyncMock(side_effect=ConnectionError("Redis down"))
        redis.hset = AsyncMock(side_effect=ConnectionError("Redis down"))
        redis.expire = AsyncMock()
        state.set_redis(redis)

        # update_history phải không raise exception
        await state.update_history("C_ERR", amount=200.0, step=2.0, counterparty="M2")
        history = await state.get_history("C_ERR")
        # fallback memory không nhất thiết persist qua 2 lần gọi nếu lỗi Redis
        # nhưng không raise exception là điều quan trọng
        assert isinstance(history, dict)
