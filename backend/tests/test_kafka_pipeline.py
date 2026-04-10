"""Unit tests cho Kafka audit pipeline (Prompt 04).

Kiểm tra:
  - AuditEvent / FraudAlertEvent schema validation
  - KafkaProducer graceful degradation khi ENABLE_KAFKA=false
  - KafkaProducer.produce_audit / produce_alert gọi send_and_wait
  - KafkaConsumer._handle_audit_event: INSERT inference_history + produce alert khi is_fraud
  - KafkaConsumer._handle_alert_event: INSERT alerts + gọi notifier.send_alert
  - _produce_kafka_audit: no-op khi ENABLE_KAFKA=false; gọi producer khi bật
  - /authorize endpoint: background task Kafka thêm đúng vị trí

Cách chạy (từ thư mục gốc dự án):
    pytest backend/tests/test_kafka_pipeline.py -v
"""

import sys
from datetime import datetime, timezone
from pathlib import Path
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

# ── Thêm backend/app vào sys.path ────────────────────────────────────────────
_BACKEND_APP = str(Path(__file__).resolve().parents[1] / "app")
if _BACKEND_APP not in sys.path:
    sys.path.insert(0, _BACKEND_APP)


# ─── Fixtures & helpers ───────────────────────────────────────────────────────

def _now() -> datetime:
    return datetime.now(timezone.utc)


def _make_audit_event(**kwargs):
    """Tạo AuditEvent với các giá trị mặc định hợp lệ."""
    from kafka.producer import AuditEvent  # noqa: PLC0415

    defaults = {
        "transaction_id": "TXN-ABCDEF123456",
        "timestamp": _now(),
        "name_orig_hash": "a" * 64,
        "name_dest_hash": "b" * 64,
        "amount": 250_000.0,
        "tx_type": "TRANSFER",
        "is_fraud": True,
        "fraud_probability": 0.87,
        "risk_level": "HIGH",
        "latency_ms": 42.5,
        "triggered_by": "ML_MODEL",
        "request_id": "FD-REQ001",
    }
    defaults.update(kwargs)
    return AuditEvent(**defaults)


def _make_alert_event(**kwargs):
    """Tạo FraudAlertEvent với các giá trị mặc định hợp lệ."""
    from kafka.producer import FraudAlertEvent  # noqa: PLC0415

    defaults = {
        "transaction_id": "TXN-ABCDEF123456",
        "timestamp": _now(),
        "fraud_probability": 0.87,
        "risk_level": "HIGH",
        "reasons": ["Triggered by: ML_MODEL"],
        "name_orig_hash": "a" * 64,
    }
    defaults.update(kwargs)
    return FraudAlertEvent(**defaults)


# ─── Tests: Pydantic schemas ──────────────────────────────────────────────────

class TestAuditEventSchema:
    """Kiểm tra AuditEvent Pydantic schema."""

    def test_valid_event_creates_ok(self):
        """AuditEvent tạo được với đầy đủ required fields."""
        event = _make_audit_event()
        assert event.transaction_id == "TXN-ABCDEF123456"
        assert event.is_fraud is True

    def test_timestamp_accepts_string(self):
        """Pydantic auto-parses ISO string → datetime object."""
        from kafka.producer import AuditEvent

        event = AuditEvent(
            transaction_id="TXN-001",
            timestamp="2026-04-07T10:00:00+00:00",
            name_orig_hash="a" * 64,
            name_dest_hash="b" * 64,
            amount=100.0,
            tx_type="TRANSFER",
            is_fraud=False,
            fraud_probability=0.1,
            risk_level="LOW",
            latency_ms=15.0,
            triggered_by="ML_MODEL",
            request_id="FD-001",
        )
        assert isinstance(event.timestamp, datetime)

    def test_model_dump_json_serializable(self):
        """model_dump(mode='json') phải trả về dict JSON-serializable (datetime → str)."""
        import json

        event = _make_audit_event()
        dumped = event.model_dump(mode="json")
        # Không raise exception khi json.dumps
        payload = json.dumps(dumped)
        assert "TXN-ABCDEF123456" in payload

    def test_triggered_by_values(self):
        """triggered_by chấp nhận mọi string (ML_MODEL, RULE_BASED, RATE_LIMIT, CACHE_HIT)."""
        for val in ("ML_MODEL", "RULE_BASED", "RATE_LIMIT", "CACHE_HIT", "RULE_ZERO_AMOUNT"):
            event = _make_audit_event(triggered_by=val)
            assert event.triggered_by == val


class TestFraudAlertEventSchema:
    """Kiểm tra FraudAlertEvent Pydantic schema."""

    def test_valid_event_creates_ok(self):
        event = _make_alert_event()
        assert event.risk_level == "HIGH"
        assert isinstance(event.reasons, list)

    def test_reasons_can_be_empty(self):
        event = _make_alert_event(reasons=[])
        assert event.reasons == []


# ─── Tests: KafkaProducer ─────────────────────────────────────────────────────

class TestKafkaProducerGracefulDegradation:
    """Kiểm tra KafkaProducer không raise exception trong mọi trường hợp lỗi."""

    def test_produce_audit_no_op_when_producer_is_none(self):
        """produce_audit không raise khi _producer=None (Kafka chưa khởi động)."""
        from kafka.producer import KafkaProducer

        producer = KafkaProducer()
        # _producer = None theo mặc định
        assert producer._producer is None

        event = _make_audit_event()
        import asyncio
        # Không raise exception
        asyncio.run(producer.produce_audit(event))

    def test_produce_alert_no_op_when_producer_is_none(self):
        """produce_alert không raise khi _producer=None."""
        from kafka.producer import KafkaProducer

        producer = KafkaProducer()
        event = _make_alert_event()
        import asyncio
        asyncio.run(producer.produce_alert(event))

    @pytest.mark.asyncio
    async def test_start_returns_false_when_kafka_disabled(self):
        """start() trả về False ngay khi ENABLE_KAFKA=false."""
        from kafka.producer import KafkaProducer

        with patch("kafka.producer.ENABLE_KAFKA", False):
            producer = KafkaProducer()
            result = await producer.start()
        assert result is False
        assert producer._producer is None

    @pytest.mark.asyncio
    async def test_start_returns_false_when_broker_unavailable(self):
        """start() trả về False và không raise khi broker không available."""
        from kafka.producer import KafkaProducer

        with patch("kafka.producer.ENABLE_KAFKA", True):
            # Mock AIOKafkaProducer để simulate connection failure
            mock_aioproducer = MagicMock()
            mock_aioproducer.return_value.start = AsyncMock(
                side_effect=Exception("Connection refused")
            )
            with patch.dict("sys.modules", {"aiokafka": MagicMock(AIOKafkaProducer=mock_aioproducer)}):
                producer = KafkaProducer()
                result = await producer.start()
        assert result is False


class TestKafkaProducerCalls:
    """Kiểm tra KafkaProducer gọi đúng aiokafka API."""

    @pytest.mark.asyncio
    async def test_produce_audit_calls_send_and_wait(self):
        """produce_audit gọi send_and_wait với topic và key đúng."""
        from kafka.producer import KafkaProducer

        producer = KafkaProducer()
        mock_inner = MagicMock()
        mock_inner.send_and_wait = AsyncMock(return_value=None)
        producer._producer = mock_inner

        event = _make_audit_event()
        await producer.produce_audit(event)

        mock_inner.send_and_wait.assert_awaited_once()
        call_args = mock_inner.send_and_wait.call_args
        assert call_args.args[0] == "transactions.audit"
        assert call_args.kwargs["key"] == event.transaction_id.encode("utf-8")

    @pytest.mark.asyncio
    async def test_produce_alert_calls_send_and_wait(self):
        """produce_alert gọi send_and_wait với topic đúng."""
        from kafka.producer import KafkaProducer

        producer = KafkaProducer()
        mock_inner = MagicMock()
        mock_inner.send_and_wait = AsyncMock(return_value=None)
        producer._producer = mock_inner

        event = _make_alert_event()
        await producer.produce_alert(event)

        mock_inner.send_and_wait.assert_awaited_once()
        call_args = mock_inner.send_and_wait.call_args
        assert call_args.args[0] == "fraud.alerts"

    @pytest.mark.asyncio
    async def test_produce_audit_no_raise_on_send_error(self):
        """produce_audit không raise khi send_and_wait throw exception."""
        from kafka.producer import KafkaProducer

        producer = KafkaProducer()
        mock_inner = MagicMock()
        mock_inner.send_and_wait = AsyncMock(side_effect=Exception("Broker unreachable"))
        producer._producer = mock_inner

        event = _make_audit_event()
        # Không raise
        await producer.produce_audit(event)


# ─── Tests: get_producer() singleton ─────────────────────────────────────────

class TestGetProducer:
    """Kiểm tra singleton get_producer()."""

    @pytest.mark.asyncio
    async def test_returns_none_when_kafka_disabled(self):
        """get_producer() trả về None khi ENABLE_KAFKA=false."""
        with patch("kafka.producer.ENABLE_KAFKA", False):
            from kafka.producer import get_producer
            result = await get_producer()
        assert result is None

    @pytest.mark.asyncio
    async def test_returns_instance_when_set(self):
        """get_producer() trả về singleton sau khi _set_producer được gọi."""
        from kafka.producer import KafkaProducer, _set_producer, get_producer

        original = None
        try:
            import kafka.producer as _kp
            original = _kp._producer_instance

            dummy = KafkaProducer()
            with patch("kafka.producer.ENABLE_KAFKA", True):
                _set_producer(dummy)
                result = await get_producer()
            assert result is dummy
        finally:
            # Khôi phục singleton sau test
            import kafka.producer as _kp
            _kp._producer_instance = original


# ─── Tests: KafkaConsumer handlers ───────────────────────────────────────────

class TestHandleAuditEvent:
    """Kiểm tra KafkaConsumer._handle_audit_event."""

    @pytest.mark.asyncio
    async def test_inserts_to_db_when_enabled(self):
        """_handle_audit_event INSERT vào PostgreSQL khi DB enabled."""
        from kafka.consumer import KafkaConsumer

        consumer = KafkaConsumer()
        event = _make_audit_event(is_fraud=False)

        mock_conn = AsyncMock()
        with patch("kafka.consumer.KafkaConsumer._handle_audit_event",
                   wraps=consumer._handle_audit_event):
            with patch("db.database.is_db_enabled", return_value=True), \
                 patch("db.database.acquire_connection", return_value=mock_conn), \
                 patch("db.database.release_connection", new_callable=AsyncMock), \
                 patch("db.database.utcnow", return_value=datetime.now(timezone.utc)):
                mock_conn.__aenter__ = AsyncMock(return_value=mock_conn)
                mock_conn.__aexit__ = AsyncMock(return_value=False)
                mock_conn.execute = AsyncMock()

                await consumer._handle_audit_event(event)
                mock_conn.execute.assert_awaited_once()

    @pytest.mark.asyncio
    async def test_produces_alert_when_is_fraud_true(self):
        """_handle_audit_event gọi produce_alert khi is_fraud=True."""
        from kafka.consumer import KafkaConsumer

        consumer = KafkaConsumer()
        event = _make_audit_event(is_fraud=True)

        mock_producer = MagicMock()
        mock_producer.produce_alert = AsyncMock()

        with patch("db.database.is_db_enabled", return_value=False), \
             patch("kafka.consumer.KafkaConsumer._handle_audit_event",
                   wraps=consumer._handle_audit_event):
            with patch("kafka.producer.ENABLE_KAFKA", True), \
                 patch("kafka.producer.get_producer", new_callable=AsyncMock,
                       return_value=mock_producer):
                await consumer._handle_audit_event(event)

        mock_producer.produce_alert.assert_awaited_once()
        alert_arg = mock_producer.produce_alert.call_args[0][0]
        assert alert_arg.transaction_id == event.transaction_id
        assert alert_arg.fraud_probability == event.fraud_probability

    @pytest.mark.asyncio
    async def test_no_alert_when_is_fraud_false(self):
        """_handle_audit_event KHÔNG gọi produce_alert khi is_fraud=False."""
        from kafka.consumer import KafkaConsumer

        consumer = KafkaConsumer()
        event = _make_audit_event(is_fraud=False)

        mock_producer = MagicMock()
        mock_producer.produce_alert = AsyncMock()

        with patch("db.database.is_db_enabled", return_value=False), \
             patch("kafka.producer.ENABLE_KAFKA", True), \
             patch("kafka.producer.get_producer", new_callable=AsyncMock,
                   return_value=mock_producer):
            await consumer._handle_audit_event(event)

        mock_producer.produce_alert.assert_not_awaited()


class TestHandleAlertEvent:
    """Kiểm tra KafkaConsumer._handle_alert_event."""

    @pytest.mark.asyncio
    async def test_calls_notifier_send_alert(self):
        """_handle_alert_event gọi notifier.send_alert với đúng alert_type."""
        from kafka.consumer import KafkaConsumer

        consumer = KafkaConsumer()
        event = _make_alert_event()

        mock_notifier = MagicMock()
        mock_notifier.send_alert = AsyncMock()

        with patch("db.database.is_db_enabled", return_value=False), \
             patch("notifier.get_notifier", return_value=mock_notifier):
            await consumer._handle_alert_event(event)

        mock_notifier.send_alert.assert_awaited_once()
        call_args = mock_notifier.send_alert.call_args
        assert call_args[0][0] == "FRAUD_KAFKA_ALERT"
        data = call_args[0][1]
        assert data["transaction_id"] == event.transaction_id
        assert data["fraud_probability"] == event.fraud_probability

    @pytest.mark.asyncio
    async def test_inserts_to_alerts_table_when_db_enabled(self):
        """_handle_alert_event INSERT vào bảng alerts khi DB enabled."""
        from kafka.consumer import KafkaConsumer

        consumer = KafkaConsumer()
        event = _make_alert_event()

        mock_conn = AsyncMock()
        mock_conn.execute = AsyncMock()

        with patch("db.database.is_db_enabled", return_value=True), \
             patch("db.database.acquire_connection", return_value=mock_conn), \
             patch("db.database.release_connection", new_callable=AsyncMock), \
             patch("db.database.utcnow", return_value=datetime.now(timezone.utc)), \
             patch("notifier.get_notifier", return_value=MagicMock(
                 send_alert=AsyncMock())):
            await consumer._handle_alert_event(event)

        mock_conn.execute.assert_awaited_once()
        # Kiểm tra SQL có nhắc đến 'alerts'
        sql = mock_conn.execute.call_args[0][0]
        assert "alerts" in sql.lower()

    @pytest.mark.asyncio
    async def test_notifier_error_does_not_raise(self):
        """Lỗi notifier không được raise (chỉ log) — commit vẫn được thực thi."""
        from kafka.consumer import KafkaConsumer

        consumer = KafkaConsumer()
        event = _make_alert_event()

        mock_notifier = MagicMock()
        mock_notifier.send_alert = AsyncMock(side_effect=Exception("SMTP timeout"))

        with patch("db.database.is_db_enabled", return_value=False), \
             patch("notifier.get_notifier", return_value=mock_notifier):
            # Không raise exception
            await consumer._handle_alert_event(event)


# ─── Tests: _produce_kafka_audit helper ──────────────────────────────────────

class TestProduceKafkaAuditHelper:
    """Kiểm tra helper _produce_kafka_audit trong transactions.py."""

    @pytest.mark.asyncio
    async def test_no_op_when_kafka_disabled(self):
        """_produce_kafka_audit không làm gì khi ENABLE_KAFKA=false."""
        from api.transactions import _produce_kafka_audit

        with patch("api.transactions._KAFKA_ENABLED", False):
            # Không import kafka, không gọi gì — không raise
            await _produce_kafka_audit(
                "TXN-001", "FD-001",
                {"nameOrig": "C001", "nameDest": "C002", "amount": 1000.0, "type": "TRANSFER"},
                True, 0.88, "HIGH", 35.0, "ML_MODEL",
            )

    @pytest.mark.asyncio
    async def test_calls_produce_audit_when_enabled(self):
        """_produce_kafka_audit gọi producer.produce_audit khi ENABLE_KAFKA=true."""
        from api.transactions import _produce_kafka_audit

        mock_producer = MagicMock()
        mock_producer.produce_audit = AsyncMock()

        async def _fake_get_producer():
            return mock_producer

        with patch("api.transactions._KAFKA_ENABLED", True), \
             patch("kafka.producer.get_producer", side_effect=_fake_get_producer):
            with patch("kafka.producer.ENABLE_KAFKA", True):
                await _produce_kafka_audit(
                    "TXN-002", "FD-002",
                    {"nameOrig": "C099", "nameDest": "M777",
                     "amount": 500_000.0, "type": "TRANSFER"},
                    True, 0.92, "HIGH", 55.0, "ML_MODEL",
                )

        mock_producer.produce_audit.assert_awaited_once()
        produced_event = mock_producer.produce_audit.call_args[0][0]
        assert produced_event.transaction_id == "TXN-002"
        assert produced_event.is_fraud is True
        assert produced_event.risk_level == "HIGH"

    @pytest.mark.asyncio
    async def test_no_raise_when_producer_is_none(self):
        """_produce_kafka_audit không raise khi get_producer() trả về None."""
        from api.transactions import _produce_kafka_audit

        async def _return_none():
            return None

        with patch("api.transactions._KAFKA_ENABLED", True), \
             patch("kafka.producer.get_producer", side_effect=_return_none), \
             patch("kafka.producer.ENABLE_KAFKA", True):
            await _produce_kafka_audit(
                "TXN-003", "FD-003",
                {"nameOrig": "C100", "nameDest": "C200", "amount": 0.0, "type": "PAYMENT"},
                False, 0.05, "LOW", 10.0, "ML_MODEL",
            )


# ─── Tests: /authorize endpoint Kafka integration ────────────────────────────

class TestAuthorizeEndpointKafkaIntegration:
    """Kiểm tra /authorize thêm BackgroundTask Kafka đúng lúc."""

    def _setup_client(self, fraud_probability: float):
        """Tạo TestClient với ML mock trả về fraud_probability cho trước."""
        from fastapi.testclient import TestClient

        mock_detector = MagicMock()
        mock_detector.predict.return_value = {
            "is_fraud": fraud_probability >= 0.75,
            "fraud_probability": fraud_probability,
            "risk_score": fraud_probability,
            "risk_level": "HIGH" if fraud_probability >= 0.75 else "LOW",
            "decision_threshold": 0.35,
            "reasons": [],
        }

        mock_realtime = MagicMock()
        mock_realtime.detector = mock_detector

        with patch("services.realtime_check_service.get_realtime_check_service",
                   return_value=mock_realtime), \
             patch("services.fraud_detection.get_fraud_detection_service",
                   return_value=MagicMock()), \
             patch("api.transactions.get_realtime_check_service",
                   return_value=mock_realtime):
            from app.main import app  # pylint: disable=import-outside-toplevel
            return TestClient(app), mock_detector

    def test_kafka_background_task_added_on_allow(self):
        """/authorize ALLOW: _produce_kafka_audit thêm vào BackgroundTasks."""
        produce_calls = []

        async def _fake_produce(*args, **kwargs):
            produce_calls.append(args)

        _sample_tx = {
            "step": 1,
            "type": "PAYMENT",
            "amount": 500.0,
            "nameOrig": "C001",
            "nameDest": "C002",
            "oldbalanceOrg": 10000.0,
            "newbalanceOrig": 9500.0,
            "oldbalanceDest": 0.0,
            "newbalanceDest": 500.0,
        }

        with patch("api.transactions._KAFKA_ENABLED", True), \
             patch("api.transactions._produce_kafka_audit",
                   side_effect=_fake_produce) as mock_produce:
            # Use sys.modules manipulation to avoid full app setup
            with patch("api.transactions.get_redis", new_callable=AsyncMock,
                       return_value=None):
                mock_detector = MagicMock()
                mock_detector.predict.return_value = {
                    "fraud_probability": 0.1,
                    "risk_score": 0.1,
                    "risk_level": "LOW",
                    "is_fraud": False,
                    "decision_threshold": 0.35,
                    "reasons": [],
                }
                mock_svc = MagicMock()
                mock_svc.detector = mock_detector

                with patch("api.transactions.realtime_service", mock_svc):
                    from fastapi import FastAPI
                    from fastapi.testclient import TestClient
                    from api.transactions import router

                    _app = FastAPI()
                    _app.include_router(router, prefix="/api/v1")
                    client = TestClient(_app)
                    resp = client.post("/api/v1/transactions/authorize",
                                       json=_sample_tx)

            # Response phải 200 (ALLOW)
            assert resp.status_code == 200
            # _produce_kafka_audit phải được gọi một lần
            mock_produce.assert_called_once()
            # is_fraud phải False cho ALLOW
            call_kwargs = mock_produce.call_args
            assert call_kwargs[0][3] is False   # is_fraud positional arg
