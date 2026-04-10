"""Async Kafka consumer chạy như background asyncio task trong FastAPI lifespan.

Topics consume:
  - transactions.audit : INSERT inference_history + produce fraud.alerts nếu is_fraud=True
  - fraud.alerts       : INSERT alerts table + gọi notifier.send_alert()

Group IDs:
  - fraud-audit-group  (transactions.audit)
  - fraud-alerts-group (fraud.alerts)

Auto offset reset: "earliest"
Commit: MANUAL sau khi persist thành công → at-least-once delivery.
"""

from __future__ import annotations

import asyncio
import logging
import os
from uuid import uuid4

logger = logging.getLogger(__name__)

# ── Cấu hình từ environment ───────────────────────────────────────────────────
KAFKA_BOOTSTRAP_SERVERS: str = os.getenv("KAFKA_BOOTSTRAP_SERVERS", "localhost:9092")
ENABLE_KAFKA: bool = os.getenv("ENABLE_KAFKA", "false").lower() == "true"

TOPIC_AUDIT = "transactions.audit"
TOPIC_ALERTS = "fraud.alerts"
GROUP_ID_AUDIT = "fraud-audit-group"
GROUP_ID_ALERTS = "fraud-alerts-group"


class KafkaConsumer:
    """Async consumer cho hai topics: transactions.audit và fraud.alerts.

    Mỗi topic chạy trong một asyncio.Task riêng biệt — non-blocking lifespan.
    Manual commit đảm bảo: message chỉ được ACK sau khi persist thành công.
    Graceful degradation: nếu Kafka không available → log warning, bỏ qua.
    """

    def __init__(self) -> None:
        # Kiểu thực ở runtime: AIOKafkaConsumer | None
        self._consumer_audit: object | None = None
        self._consumer_alerts: object | None = None
        self._task_audit: asyncio.Task | None = None
        self._task_alerts: asyncio.Task | None = None
        self._running: bool = False

    async def start(self) -> None:
        """Khởi động cả hai consumer và tạo background asyncio tasks.

        Graceful degradation: nếu Kafka không available → log warning, return sớm.
        """
        if not ENABLE_KAFKA:
            return
        try:
            import json
            from aiokafka import AIOKafkaConsumer as _AIOKafkaConsumer  # type: ignore

            # Consumer cho topic transactions.audit
            self._consumer_audit = _AIOKafkaConsumer(
                TOPIC_AUDIT,
                bootstrap_servers=KAFKA_BOOTSTRAP_SERVERS,
                group_id=GROUP_ID_AUDIT,
                auto_offset_reset="earliest",
                enable_auto_commit=False,           # commit thủ công sau khi persist
                value_deserializer=lambda v: json.loads(v.decode("utf-8")),
                session_timeout_ms=30_000,
                heartbeat_interval_ms=10_000,
            )

            # Consumer cho topic fraud.alerts
            self._consumer_alerts = _AIOKafkaConsumer(
                TOPIC_ALERTS,
                bootstrap_servers=KAFKA_BOOTSTRAP_SERVERS,
                group_id=GROUP_ID_ALERTS,
                auto_offset_reset="earliest",
                enable_auto_commit=False,
                value_deserializer=lambda v: json.loads(v.decode("utf-8")),
                session_timeout_ms=30_000,
                heartbeat_interval_ms=10_000,
            )

            await self._consumer_audit.start()    # type: ignore[attr-defined]
            await self._consumer_alerts.start()   # type: ignore[attr-defined]
            self._running = True

            # Tạo background tasks — không block lifespan startup
            self._task_audit = asyncio.create_task(
                self._consume_audit_loop(),
                name="kafka-audit-consumer",
            )
            self._task_alerts = asyncio.create_task(
                self._consume_alerts_loop(),
                name="kafka-alerts-consumer",
            )
            logger.info(
                "Kafka consumer khởi động thành công — %s, %s  bootstrap=%s",
                TOPIC_AUDIT, TOPIC_ALERTS, KAFKA_BOOTSTRAP_SERVERS,
            )
        except Exception as exc:
            logger.warning(
                "Kafka consumer không khởi động được, tiếp tục mà không có Kafka: %s", exc
            )

    async def stop(self) -> None:
        """Dừng consumer — gọi trong lifespan shutdown."""
        self._running = False

        # Cancel background tasks trước
        for task in (self._task_audit, self._task_alerts):
            if task is not None and not task.done():
                task.cancel()
                try:
                    await task
                except (asyncio.CancelledError, Exception):
                    pass

        # Đóng consumer connections
        for consumer in (self._consumer_audit, self._consumer_alerts):
            if consumer is not None:
                try:
                    await consumer.stop()  # type: ignore[attr-defined]
                except Exception as exc:
                    logger.warning("Kafka consumer stop lỗi: %s", exc)

        logger.info("Kafka consumer đã đóng")

    # ── Consume loops ─────────────────────────────────────────────────────────

    async def _consume_audit_loop(self) -> None:
        """Vòng lặp consume topic 'transactions.audit'."""
        try:
            async for msg in self._consumer_audit:  # type: ignore[union-attr]
                if not self._running:
                    break
                try:
                    from kafka.producer import AuditEvent
                    event = AuditEvent(**msg.value)
                    await self._handle_audit_event(event)
                    # Manual commit CHỈ sau khi persist thành công
                    await self._consumer_audit.commit()  # type: ignore[union-attr]
                except Exception as exc:
                    # Không commit → message sẽ được retry (at-least-once)
                    logger.error(
                        "Xử lý audit event lỗi (không commit, sẽ retry): %s", exc
                    )
        except asyncio.CancelledError:
            pass
        except Exception as exc:
            logger.error("Consume audit loop lỗi bất ngờ: %s", exc)

    async def _consume_alerts_loop(self) -> None:
        """Vòng lặp consume topic 'fraud.alerts'."""
        try:
            async for msg in self._consumer_alerts:  # type: ignore[union-attr]
                if not self._running:
                    break
                try:
                    from kafka.producer import FraudAlertEvent
                    event = FraudAlertEvent(**msg.value)
                    await self._handle_alert_event(event)
                    await self._consumer_alerts.commit()  # type: ignore[union-attr]
                except Exception as exc:
                    logger.error(
                        "Xử lý alert event lỗi (không commit, sẽ retry): %s", exc
                    )
        except asyncio.CancelledError:
            pass
        except Exception as exc:
            logger.error("Consume alerts loop lỗi bất ngờ: %s", exc)

    # ── Event handlers ────────────────────────────────────────────────────────

    async def _handle_audit_event(self, event: object) -> None:
        """Xử lý AuditEvent từ topic 'transactions.audit'.

        Bước 1: INSERT vào PostgreSQL inference_history.
        Bước 2: Nếu is_fraud=True → produce FraudAlertEvent sang 'fraud.alerts'.
        """
        from db.database import acquire_connection, is_db_enabled, release_connection, utcnow

        # ── Bước 1: Persist vào inference_history ────────────────────────────
        if is_db_enabled():
            try:
                conn = await acquire_connection()
                try:
                    await conn.execute(
                        """
                        INSERT INTO inference_history
                            (request_id, source_endpoint, user_id, transaction_type, amount,
                             inference_timestamp, input, output, is_fraud, risk_score,
                             risk_level, created_at)
                        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
                        ON CONFLICT (request_id) DO NOTHING
                        """,
                        event.request_id,
                        "kafka/transactions.audit",
                        event.name_orig_hash,       # user_id = hashed để bảo vệ PII
                        event.tx_type,
                        event.amount,
                        event.timestamp.isoformat(),
                        {
                            "transaction_id": event.transaction_id,
                            "triggered_by": event.triggered_by,
                            "name_orig_hash": event.name_orig_hash,
                            "name_dest_hash": event.name_dest_hash,
                        },
                        {
                            "is_fraud": event.is_fraud,
                            "fraud_probability": event.fraud_probability,
                            "risk_level": event.risk_level,
                            "latency_ms": event.latency_ms,
                        },
                        event.is_fraud,
                        event.fraud_probability,
                        event.risk_level,
                        utcnow(),
                    )
                finally:
                    await release_connection(conn)
                logger.debug(
                    "Kafka: INSERT inference_history request_id=%s", event.request_id
                )
            except Exception as exc:
                logger.warning("Kafka _handle_audit_event: INSERT lỗi: %s", exc)
                raise  # Re-raise để consumer không commit → retry

        # ── Bước 2: Nếu gian lận → produce sang fraud.alerts ─────────────────
        if event.is_fraud:
            from datetime import datetime, timezone as _tz

            from kafka.producer import FraudAlertEvent, get_producer

            producer = await get_producer()
            if producer is not None:
                alert = FraudAlertEvent(
                    transaction_id=event.transaction_id,
                    timestamp=datetime.now(_tz.utc),
                    fraud_probability=event.fraud_probability,
                    risk_level=event.risk_level,
                    reasons=[f"Triggered by: {event.triggered_by}"],
                    name_orig_hash=event.name_orig_hash,
                )
                await producer.produce_alert(alert)

    async def _handle_alert_event(self, event: object) -> None:
        """Xử lý FraudAlertEvent từ topic 'fraud.alerts'.

        Bước 1: INSERT vào PostgreSQL alerts table.
        Bước 2: Gọi notifier.send_alert() — console / email / slack.
        """
        from db.database import acquire_connection, is_db_enabled, release_connection, utcnow

        # ── Bước 1: Persist vào alerts ────────────────────────────────────────
        if is_db_enabled():
            try:
                conn = await acquire_connection()
                try:
                    details = {
                        "fraud_probability": event.fraud_probability,
                        "risk_level": event.risk_level,
                        "reasons": event.reasons,
                        "name_orig_hash": event.name_orig_hash,
                    }
                    severity = "high" if event.risk_level == "HIGH" else "medium"
                    await conn.execute(
                        """
                        INSERT INTO alerts
                            (alert_id, type, message, severity, status, source_endpoint,
                             timestamp, details, created_at, acknowledged_at)
                        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                        """,
                        str(uuid4()),
                        "FRAUD_DETECTED",
                        f"Kafka fraud alert: transaction {event.transaction_id}",
                        severity,
                        "active",
                        "kafka/fraud.alerts",
                        event.timestamp.isoformat(),
                        details,
                        utcnow(),
                        None,
                    )
                finally:
                    await release_connection(conn)
                logger.debug(
                    "Kafka: INSERT alerts transaction_id=%s", event.transaction_id
                )
            except Exception as exc:
                logger.warning("Kafka _handle_alert_event: INSERT alerts lỗi: %s", exc)
                raise  # Re-raise để consumer không commit → retry

        # ── Bước 2: Gửi notification qua notifier.py ─────────────────────────
        try:
            from notifier import get_notifier

            notifier = get_notifier()
            await notifier.send_alert(
                "FRAUD_KAFKA_ALERT",
                {
                    "transaction_id": event.transaction_id,
                    "fraud_probability": event.fraud_probability,
                    "risk_level": event.risk_level,
                    "reasons": event.reasons,
                },
            )
        except Exception as exc:
            # Lỗi notifier không nên block commit — chỉ log
            logger.warning("Kafka _handle_alert_event: notifier lỗi (bỏ qua): %s", exc)
