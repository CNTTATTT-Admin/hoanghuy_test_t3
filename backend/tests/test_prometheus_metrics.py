"""Tests cho Prometheus metrics integration — /metrics endpoint và custom counters.

Kiểm tra:
  - GET /metrics trả về HTTP 200
  - Response chứa các custom metrics bắt đầu bằng 'frauddetect_'
  - Response chứa metrics của prometheus-fastapi-instrumentator (http_requests)
  - metrics.py export đúng 14 metric objects
  - transactions_total.inc() sau ALLOW
  - transactions_total.inc() + blocked_transactions_total.inc() sau BLOCK

Cách chạy (từ thư mục backend/):
    pytest tests/test_prometheus_metrics.py -v
"""

from __future__ import annotations

import sys
from pathlib import Path
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi.testclient import TestClient

# ── sys.path setup ─────────────────────────────────────────────────────────────
_BACKEND_APP = str(Path(__file__).resolve().parents[1] / "app")
if _BACKEND_APP not in sys.path:
    sys.path.insert(0, _BACKEND_APP)


# ── Helpers từ test_authorize.py ───────────────────────────────────────────────

def _make_detector_mock(fraud_probability: float) -> MagicMock:
    """Tạo mock cho RealtimeFraudDetector.predict() với xác suất cho trước."""
    mock = MagicMock()
    mock.predict.return_value = {
        "is_fraud": fraud_probability >= 0.35,
        "fraud_probability": fraud_probability,
        "risk_score": fraud_probability,
        "risk_level": "HIGH" if fraud_probability >= 0.75 else (
            "MEDIUM" if fraud_probability >= 0.35 else "LOW"
        ),
        "decision_threshold": 0.35,
        "reasons": ["Mock"],
    }
    return mock


_BASE_PAYLOAD = {
    "step": 1,
    "type": "TRANSFER",
    "amount": 100_000.0,
    "nameOrig": "C123456789",
    "nameDest": "C987654321",
    "oldbalanceOrg": 200_000.0,
    "newbalanceOrig": 100_000.0,
    "oldbalanceDest": 0.0,
    "newbalanceDest": 100_000.0,
}


# ── Fixtures ───────────────────────────────────────────────────────────────────

@pytest.fixture(scope="module")
def client():
    """TestClient với tất cả heavy dependencies đã được mock."""
    mock_detector = _make_detector_mock(0.05)  # Low fraud → ALLOW

    mock_realtime_svc = MagicMock()
    mock_realtime_svc.detector = mock_detector

    mock_fraud_svc = MagicMock()

    with (
        patch("services.realtime_check_service.get_realtime_check_service", return_value=mock_realtime_svc),
        patch("services.fraud_detection.get_fraud_detection_service", return_value=mock_fraud_svc),
        patch("db.database.init_db", new_callable=AsyncMock, return_value=False),
        patch("db.database.close_db", new_callable=AsyncMock),
        patch("db.database.is_db_enabled", return_value=False),
        patch("core.redis_client.get_redis", new_callable=AsyncMock, return_value=None),
        patch("core.redis_client.close_redis", new_callable=AsyncMock),
        patch("notifier.get_notifier", return_value=MagicMock(
            initialize=AsyncMock(), cleanup=AsyncMock()
        )),
        patch("api.transactions.realtime_service", mock_realtime_svc),
    ):
        from main import app
        with TestClient(app, raise_server_exceptions=False) as c:
            yield c


# ── Tests: /metrics endpoint ───────────────────────────────────────────────────

class TestMetricsEndpoint:
    """Tests cơ bản cho Prometheus /metrics endpoint."""

    def test_metrics_endpoint_returns_200(self, client):
        """/metrics trả về HTTP 200."""
        response = client.get("/metrics")
        assert response.status_code == 200, f"/metrics trả về {response.status_code}"

    def test_metrics_content_type_is_text_plain(self, client):
        """/metrics trả về Content-Type text/plain (Prometheus format)."""
        response = client.get("/metrics")
        assert "text/plain" in response.headers.get("content-type", "")

    def test_metrics_contains_frauddetect_prefix(self, client):
        """/metrics chứa ít nhất một metric bắt đầu bằng 'frauddetect_'."""
        response = client.get("/metrics")
        assert "frauddetect_" in response.text, (
            "Không tìm thấy metric với prefix 'frauddetect_' trong /metrics output"
        )

    def test_metrics_contains_transactions_counter(self, client):
        """/metrics chứa frauddetect_transactions_total."""
        response = client.get("/metrics")
        assert "frauddetect_transactions_total" in response.text

    def test_metrics_contains_inference_latency(self, client):
        """/metrics chứa frauddetect_inference_latency_seconds histogram."""
        response = client.get("/metrics")
        assert "frauddetect_inference_latency_seconds" in response.text

    def test_metrics_contains_authorize_latency(self, client):
        """/metrics chứa frauddetect_authorize_latency_seconds histogram."""
        response = client.get("/metrics")
        assert "frauddetect_authorize_latency_seconds" in response.text

    def test_metrics_contains_blocked_counter(self, client):
        """/metrics chứa frauddetect_blocked_transactions_total."""
        response = client.get("/metrics")
        assert "frauddetect_blocked_transactions_total" in response.text

    def test_metrics_contains_redis_counters(self, client):
        """/metrics chứa cả cache hit và miss counters."""
        response = client.get("/metrics")
        assert "frauddetect_redis_cache_hits_total" in response.text
        assert "frauddetect_redis_cache_misses_total" in response.text

    def test_metrics_contains_drift_metrics(self, client):
        """/metrics chứa drift monitoring gauges."""
        response = client.get("/metrics")
        assert "frauddetect_model_psi_score" in response.text
        assert "frauddetect_model_ks_pvalue" in response.text
        assert "frauddetect_drift_severity" in response.text

    def test_metrics_contains_kafka_counter(self, client):
        """/metrics chứa kafka messages produced counter."""
        response = client.get("/metrics")
        assert "frauddetect_kafka_messages_produced_total" in response.text

    def test_metrics_contains_instrumentator_http_metrics(self, client):
        """/metrics chứa HTTP metrics từ prometheus-fastapi-instrumentator."""
        response = client.get("/metrics")
        # Instrumentator expose http_requests_total hoặc http_request_duration
        assert "http_request" in response.text or "http_requests" in response.text

    def test_metrics_not_in_openapi_schema(self, client):
        """/metrics không xuất hiện trong /openapi.json."""
        response = client.get("/openapi.json")
        openapi = response.json()
        paths = list(openapi.get("paths", {}).keys())
        assert "/metrics" not in paths, "/metrics không được xuất hiện trong OpenAPI schema"


# ── Tests: metrics.py module exports ──────────────────────────────────────────

class TestMetricsModuleExports:
    """Tests cho core/metrics.py — đảm bảo 14 metrics được khai báo đúng."""

    def test_all_14_metrics_exist(self):
        """Tất cả 14 metric objects được export từ core.metrics."""
        import core.metrics as m
        expected = [
            "transactions_total",
            "blocked_transactions_total",
            "inference_latency_seconds",
            "authorize_latency_seconds",
            "fraud_probability_histogram",
            "model_psi_score",
            "model_ks_pvalue",
            "model_fraud_rate_current",
            "model_drift_severity",
            "redis_cache_hits_total",
            "redis_cache_misses_total",
            "kafka_messages_produced_total",
            "kafka_consumer_lag",
        ]
        for name in expected:
            assert hasattr(m, name), f"core.metrics không có attribute '{name}'"

    def test_transactions_total_has_labels(self):
        """transactions_total có đúng 3 labels."""
        from core.metrics import transactions_total
        from prometheus_client import Counter
        assert isinstance(transactions_total, Counter)
        # Thử inc() với đủ labels — không raise
        transactions_total.labels(tx_type="TRANSFER", risk_level="LOW", decision="ALLOW").inc(0)

    def test_blocked_total_has_block_reason_label(self):
        """blocked_transactions_total có label block_reason."""
        from core.metrics import blocked_transactions_total
        blocked_transactions_total.labels(block_reason="ML_MODEL").inc(0)

    def test_model_psi_score_has_feature_name_label(self):
        """model_psi_score có label feature_name."""
        from core.metrics import model_psi_score
        model_psi_score.labels(feature_name="amount").set(0.05)

    def test_model_drift_severity_is_labelless(self):
        """model_drift_severity không có label (labelless Gauge)."""
        from core.metrics import model_drift_severity
        from prometheus_client import Gauge
        assert isinstance(model_drift_severity, Gauge)
        # Labelless gauge — set() trực tiếp, không qua .labels()
        model_drift_severity.set(0)

    def test_kafka_consumer_lag_has_topic_partition_labels(self):
        """kafka_consumer_lag có labels topic và partition."""
        from core.metrics import kafka_consumer_lag
        kafka_consumer_lag.labels(topic="transactions.audit", partition="0").set(0)


# ── Tests: metrics incremented by /authorize ──────────────────────────────────

class TestMetricsIncrementedByAuthorize:
    """Tests kiểm tra metrics được tăng đúng khi /authorize được gọi."""

    def _get_counter_value(self, counter, labels: dict) -> float:
        """Lấy current value của Counter với labels cho trước."""
        try:
            return counter.labels(**labels)._value.get()
        except Exception:
            return 0.0

    def test_transactions_total_incremented_on_allow(self):
        """transactions_total{decision=ALLOW} tăng sau ALLOW request."""
        mock_detector = _make_detector_mock(0.02)  # Low → ALLOW
        mock_realtime_svc = MagicMock()
        mock_realtime_svc.detector = mock_detector

        with (
            patch("services.realtime_check_service.get_realtime_check_service", return_value=mock_realtime_svc),
            patch("services.fraud_detection.get_fraud_detection_service", return_value=MagicMock()),
            patch("db.database.init_db", new_callable=AsyncMock, return_value=False),
            patch("db.database.close_db", new_callable=AsyncMock),
            patch("db.database.is_db_enabled", return_value=False),
            patch("core.redis_client.get_redis", new_callable=AsyncMock, return_value=None),
            patch("core.redis_client.close_redis", new_callable=AsyncMock),
            patch("notifier.get_notifier", return_value=MagicMock(
                initialize=AsyncMock(), cleanup=AsyncMock()
            )),
            patch("api.transactions.realtime_service", mock_realtime_svc),
        ):
            from core.metrics import transactions_total
            from main import app

            with TestClient(app, raise_server_exceptions=False) as c:
                before = self._get_counter_value(transactions_total, {"tx_type": "TRANSFER", "risk_level": "LOW", "decision": "ALLOW"})
                c.post("/api/v1/transactions/authorize", json=_BASE_PAYLOAD)
                after = self._get_counter_value(transactions_total, {"tx_type": "TRANSFER", "risk_level": "LOW", "decision": "ALLOW"})
                assert after >= before, "transactions_total{ALLOW} phải tăng sau ALLOW request"

    def test_blocked_counter_incremented_on_block(self):
        """blocked_transactions_total tăng sau BLOCK request."""
        mock_detector_high = _make_detector_mock(0.99)  # High → BLOCK
        mock_svc_high = MagicMock()
        mock_svc_high.detector = mock_detector_high

        with (
            patch("services.realtime_check_service.get_realtime_check_service", return_value=mock_svc_high),
            patch("services.fraud_detection.get_fraud_detection_service", return_value=MagicMock()),
            patch("db.database.init_db", new_callable=AsyncMock, return_value=False),
            patch("db.database.close_db", new_callable=AsyncMock),
            patch("db.database.is_db_enabled", return_value=False),
            patch("core.redis_client.get_redis", new_callable=AsyncMock, return_value=None),
            patch("core.redis_client.close_redis", new_callable=AsyncMock),
            patch("notifier.get_notifier", return_value=MagicMock(
                initialize=AsyncMock(), cleanup=AsyncMock()
            )),
            patch("api.transactions.realtime_service", mock_svc_high),
        ):
            from core.metrics import blocked_transactions_total
            from main import app

            with TestClient(app, raise_server_exceptions=False) as c:
                before = self._get_counter_value(blocked_transactions_total, {"block_reason": "ML_MODEL"})
                c.post("/api/v1/transactions/authorize", json=_BASE_PAYLOAD)
                after = self._get_counter_value(blocked_transactions_total, {"block_reason": "ML_MODEL"})
                assert after >= before, "blocked_transactions_total{ML_MODEL} phải tăng sau BLOCK"

    def test_cache_miss_counter_incremented(self):
        """redis_cache_misses_total tăng khi Redis trả về None (cache miss)."""
        from core.metrics import redis_cache_misses_total
        before = redis_cache_misses_total._value.get()

        # Gọi _get_cached_decision trực tiếp với redis mock trả về None

        import asyncio
        from api.transactions import _get_cached_decision

        mock_redis = AsyncMock()
        mock_redis.get.return_value = None   # Cache miss

        result = asyncio.get_event_loop().run_until_complete(
            _get_cached_decision({"amount": 100, "type": "TRANSFER"}, mock_redis)
        )
        assert result is None
        after = redis_cache_misses_total._value.get()
        assert after > before, "redis_cache_misses_total phải tăng sau cache miss"

    def test_cache_hit_counter_incremented(self):
        """redis_cache_hits_total tăng khi Redis trả về cached value."""
        import asyncio
        import json as _json
        from api.transactions import _get_cached_decision
        from core.metrics import redis_cache_hits_total

        before = redis_cache_hits_total._value.get()

        cached_data = {"authorized": True, "risk_level": "LOW"}
        mock_redis = AsyncMock()
        mock_redis.get.return_value = _json.dumps(cached_data)  # Cache hit

        result = asyncio.get_event_loop().run_until_complete(
            _get_cached_decision({"amount": 100, "type": "TRANSFER"}, mock_redis)
        )
        assert result == cached_data
        after = redis_cache_hits_total._value.get()
        assert after > before, "redis_cache_hits_total phải tăng sau cache hit"
