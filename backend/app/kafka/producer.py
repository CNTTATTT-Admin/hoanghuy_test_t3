"""Kafka producer async wrapper dùng aiokafka.

Bootstrap servers: env KAFKA_BOOTSTRAP_SERVERS (default: localhost:9092)
Bật / tắt bằng ENABLE_KAFKA=true|false (default: false).

Thiết kế:
  - Singleton toàn cục — khởi tạo một lần trong lifespan, chia sẻ qua toàn ứng dụng.
  - aiokafka KHÔNG được import ở module-level: chỉ import khi ENABLE_KAFKA=true.
  - Nếu Kafka broker không available khi start → log warning, tiếp tục chạy không Kafka.
  - produce_audit / produce_alert không bao giờ raise exception → không block /authorize.
"""

from __future__ import annotations

import json
import logging
import os
from datetime import datetime, timezone
from typing import Optional

from pydantic import BaseModel

logger = logging.getLogger(__name__)

# ── Cấu hình từ environment ───────────────────────────────────────────────────
KAFKA_BOOTSTRAP_SERVERS: str = os.getenv("KAFKA_BOOTSTRAP_SERVERS", "localhost:9092")
ENABLE_KAFKA: bool = os.getenv("ENABLE_KAFKA", "false").lower() == "true"

TOPIC_AUDIT = "transactions.audit"
TOPIC_ALERTS = "fraud.alerts"


# ── Pydantic schemas cho Kafka messages ───────────────────────────────────────

class AuditEvent(BaseModel):
    """Schema cho message gửi lên Kafka topic 'transactions.audit'.

    Mọi thông tin nhận dạng (nameOrig, nameDest) đều được hash SHA-256
    trước khi ghi vào Kafka — không log raw account number.
    """
    transaction_id: str
    timestamp: datetime
    name_orig_hash: str      # SHA-256(nameOrig)
    name_dest_hash: str      # SHA-256(nameDest)
    amount: float
    tx_type: str
    is_fraud: bool
    fraud_probability: float
    risk_level: str
    latency_ms: float
    triggered_by: str        # "ML_MODEL" | "RULE_BASED" | "RATE_LIMIT" | "CACHE_HIT"
    request_id: str          # correlation ID cho distributed tracing


class FraudAlertEvent(BaseModel):
    """Schema cho message gửi lên Kafka topic 'fraud.alerts'."""
    transaction_id: str
    timestamp: datetime
    fraud_probability: float
    risk_level: str
    reasons: list[str]
    name_orig_hash: str


# ── KafkaProducer ─────────────────────────────────────────────────────────────

class KafkaProducer:
    """aiokafka async producer wrapper với graceful degradation.

    Dùng acks='all' + enable_idempotence=True để at-least-once delivery.
    Mọi lỗi produce đều được log và bỏ qua — không ảnh hưởng critical path.
    """

    def __init__(self) -> None:
        # Kiểu thực ở runtime: AIOKafkaProducer | None
        self._producer: object | None = None

    async def start(self) -> bool:
        """Khởi động producer. Trả về True khi thành công.

        Nếu ENABLE_KAFKA=false hoặc broker không sẵn sàng → trả về False, tiếp tục chạy.
        """
        if not ENABLE_KAFKA:
            return False
        try:
            from aiokafka import AIOKafkaProducer  # type: ignore

            self._producer = AIOKafkaProducer(
                bootstrap_servers=KAFKA_BOOTSTRAP_SERVERS,
                # Serialize Python dict → UTF-8 JSON bytes
                value_serializer=lambda v: json.dumps(v, default=str).encode("utf-8"),
                # Đảm bảo tất cả ISR replica xác nhận trước khi coi là thành công
                acks="all",
                enable_idempotence=True,
                compression_type="gzip",
                request_timeout_ms=5_000,
                retry_backoff_ms=500,
            )
            await self._producer.start()  # type: ignore[attr-defined]
            logger.info(
                "Kafka producer khởi động thành công — bootstrap: %s  topics: %s, %s",
                KAFKA_BOOTSTRAP_SERVERS, TOPIC_AUDIT, TOPIC_ALERTS,
            )
            return True
        except Exception as exc:
            logger.warning(
                "Kafka producer không khởi động được, tiếp tục mà không có Kafka: %s", exc
            )
            self._producer = None
            return False

    async def stop(self) -> None:
        """Dừng producer — gọi trong lifespan shutdown."""
        if self._producer is not None:
            try:
                await self._producer.stop()  # type: ignore[attr-defined]
                logger.info("Kafka producer đã đóng")
            except Exception as exc:
                logger.warning("Kafka producer stop lỗi: %s", exc)
            finally:
                self._producer = None

    async def produce_audit(self, event: AuditEvent) -> None:
        """Gửi AuditEvent lên topic 'transactions.audit'. Fire-and-forget.

        Không raise exception khi lỗi → không block /authorize response.
        """
        if self._producer is None:
            return
        try:
            await self._producer.send_and_wait(  # type: ignore[attr-defined]
                TOPIC_AUDIT,
                value=event.model_dump(mode="json"),
                key=event.transaction_id.encode("utf-8"),
            )
            # Ghi Prometheus counter sau khi produce thành công
            try:
                from core.metrics import kafka_messages_produced_total  # pylint: disable=import-outside-toplevel
                kafka_messages_produced_total.labels(topic=TOPIC_AUDIT).inc()
            except ImportError:
                pass
            logger.debug("Kafka audit event gửi OK: %s", event.transaction_id)
        except Exception as exc:
            logger.error(
                "Kafka produce_audit lỗi (bỏ qua, không block response): %s", exc
            )

    async def produce_alert(self, event: FraudAlertEvent) -> None:
        """Gửi FraudAlertEvent lên topic 'fraud.alerts'. Fire-and-forget."""
        if self._producer is None:
            return
        try:
            await self._producer.send_and_wait(  # type: ignore[attr-defined]
                TOPIC_ALERTS,
                value=event.model_dump(mode="json"),
                key=event.transaction_id.encode("utf-8"),
            )
            # Ghi Prometheus counter sau khi produce thành công
            try:
                from core.metrics import kafka_messages_produced_total  # pylint: disable=import-outside-toplevel
                kafka_messages_produced_total.labels(topic=TOPIC_ALERTS).inc()
            except ImportError:
                pass
            logger.debug("Kafka fraud alert gửi OK: %s", event.transaction_id)
        except Exception as exc:
            logger.error("Kafka produce_alert lỗi (bỏ qua): %s", exc)


# ── Singleton management ──────────────────────────────────────────────────────

_producer_instance: KafkaProducer | None = None


async def get_producer() -> KafkaProducer | None:
    """Trả về KafkaProducer singleton.

    Trả về None khi:
    - ENABLE_KAFKA=false (mặc định)
    - Producer chưa được khởi tạo (lifespan chưa chạy)
    - Kafka broker không available
    """
    if not ENABLE_KAFKA:
        return None
    return _producer_instance


def _set_producer(instance: KafkaProducer) -> None:
    """Gán singleton — chỉ gọi từ lifespan startup."""
    global _producer_instance
    _producer_instance = instance
