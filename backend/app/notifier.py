"""Alert Notification System"""

import asyncio
import json
import logging
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
from abc import ABC, abstractmethod

logger = logging.getLogger(__name__)

class NotificationChannel(ABC):
    """Abstract base class cho notification channels"""

    @abstractmethod
    async def send(self, alert_type: str, data: Dict[str, Any]) -> bool:
        """Gửi notification"""
        pass

    @abstractmethod
    async def initialize(self):
        """Khởi tạo channel"""
        pass

    @abstractmethod
    async def cleanup(self):
        """Dọn dẹp channel"""
        pass

class ConsoleNotifier(NotificationChannel):
    """Notification channel cho console output"""

    async def send(self, alert_type: str, data: Dict[str, Any]) -> bool:
        try:
            message = f"ALERT [{alert_type}]: {json.dumps(data, indent=2, ensure_ascii=False)}"
            print(message)
            logger.info(f"Console alert sent: {alert_type}")
            return True
        except Exception as e:
            logger.error(f"Error sending console alert: {str(e)}")
            return False

    async def initialize(self):
        logger.info("Console notifier initialized")

    async def cleanup(self):
        logger.info("Console notifier cleaned up")

class EmailNotifier(NotificationChannel):
    """Notification channel cho email (mock implementation)"""

    def __init__(self, smtp_config: Optional[Dict[str, Any]] = None):
        self.smtp_config = smtp_config or {}
        self.recipients = ["admin@fraudsystem.com", "security@fraudsystem.com"]

    async def send(self, alert_type: str, data: Dict[str, Any]) -> bool:
        try:
            # Mock email sending
            subject = f"Fraud Alert: {alert_type}"
            body = f"""
            Fraud Detection Alert

            Type: {alert_type}
            Time: {datetime.now().isoformat()}

            Details:
            {json.dumps(data, indent=2, ensure_ascii=False)}

            Please review immediately.
            """

            # In real implementation, this would send actual email
            logger.warning(f"EMAIL ALERT: {subject}")
            logger.warning(body)
            return True

        except Exception as e:
            logger.error(f"Error sending email alert: {str(e)}")
            return False

    async def initialize(self):
        logger.info("Email notifier initialized")

    async def cleanup(self):
        logger.info("Email notifier cleaned up")

class SlackNotifier(NotificationChannel):
    """Notification channel cho Slack (mock implementation)"""

    def __init__(self, webhook_url: Optional[str] = None):
        self.webhook_url = webhook_url
        self.channel = "#fraud-alerts"

    async def send(self, alert_type: str, data: Dict[str, Any]) -> bool:
        try:
            # Mock Slack message
            message = {
                "channel": self.channel,
                "text": f":warning: Fraud Alert: {alert_type}",
                "blocks": [
                    {
                        "type": "header",
                        "text": {
                            "type": "plain_text",
                            "text": f"Fraud Detection Alert: {alert_type}"
                        }
                    },
                    {
                        "type": "section",
                        "text": {
                            "type": "mrkdwn",
                            "text": f"*Time:* {datetime.now().isoformat()}\n*Details:* ```{json.dumps(data, indent=2, ensure_ascii=False)}```"
                        }
                    }
                ]
            }

            # In real implementation, this would post to Slack webhook
            logger.warning(f"SLACK ALERT: {json.dumps(message, indent=2, ensure_ascii=False)}")
            return True

        except Exception as e:
            logger.error(f"Error sending Slack alert: {str(e)}")
            return False

    async def initialize(self):
        logger.info("Slack notifier initialized")

    async def cleanup(self):
        logger.info("Slack notifier cleaned up")


class TelegramNotifier(NotificationChannel):
    """Gửi cảnh báo qua Telegram Bot API."""

    def __init__(self, bot_token: str = "", chat_id: str = ""):
        self.bot_token = bot_token
        self.chat_id   = chat_id
        self._session  = None

    async def initialize(self):
        if not self.bot_token or not self.chat_id:
            logger.info("Telegram notifier: chưa cấu hình bot_token/chat_id.")
            return
        try:
            import aiohttp  # pylint: disable=import-outside-toplevel
            self._session = aiohttp.ClientSession()
            logger.info("Telegram notifier initialized.")
        except ImportError:
            logger.warning("aiohttp không được cài đặt — Telegram notifier không khả dụng.")

    async def send(self, alert_type: str, data: Dict[str, Any]) -> bool:
        if not self.bot_token or not self.chat_id or not self._session:
            return False
        try:
            text = self._format_message(alert_type, data)
            url  = f"https://api.telegram.org/bot{self.bot_token}/sendMessage"
            payload = {"chat_id": self.chat_id, "text": text, "parse_mode": "HTML"}
            async with self._session.post(url, json=payload, timeout=10) as resp:
                if resp.status == 200:
                    logger.info("Telegram alert sent: %s", alert_type)
                    return True
                body = await resp.text()
                logger.error("Telegram API error %d: %s", resp.status, body)
                return False
        except Exception as exc:  # noqa: BLE001
            logger.error("Telegram send failed: %s", exc)
            return False

    def _format_message(self, alert_type: str, data: dict) -> str:
        severity = data.get("severity", "UNKNOWN")
        emoji = {"CRITICAL": "🔴", "HIGH": "🟠", "MEDIUM": "🟡", "LOW": "🟢"}.get(severity, "⚪")
        return (
            f"{emoji} <b>Fraud Alert: {alert_type}</b>\n"
            f"Severity: {severity}\n"
            f"Transaction: {data.get('transaction_id', 'N/A')}\n"
            f"Amount: ${data.get('amount', 0):,.2f}\n"
            f"Fraud Probability: {data.get('fraud_probability', 0):.1%}\n"
            f"Risk Score: {data.get('risk_score', 0)}\n"
            f"Decision: {data.get('decision', 'N/A')}"
        )

    async def cleanup(self):
        if self._session:
            await self._session.close()
            logger.info("Telegram notifier cleaned up.")


class WebhookNotifier(NotificationChannel):
    """Gửi cảnh báo qua custom webhook URL (HTTP POST JSON)."""

    def __init__(self, webhook_url: str = ""):
        self.webhook_url = webhook_url
        self._session    = None

    async def initialize(self):
        if not self.webhook_url:
            logger.info("Webhook notifier: chưa cấu hình webhook_url.")
            return
        try:
            import aiohttp  # pylint: disable=import-outside-toplevel
            self._session = aiohttp.ClientSession()
            logger.info("Webhook notifier initialized: %s", self.webhook_url)
        except ImportError:
            logger.warning("aiohttp không được cài đặt — Webhook notifier không khả dụng.")

    async def send(self, alert_type: str, data: Dict[str, Any]) -> bool:
        if not self.webhook_url or not self._session:
            return False
        try:
            payload = {
                "alert_type": alert_type,
                "timestamp":  datetime.now(timezone.utc).isoformat(),
                **data,
            }
            async with self._session.post(self.webhook_url, json=payload, timeout=10) as resp:
                if resp.status < 400:
                    logger.info("Webhook alert sent: %s → %s", alert_type, self.webhook_url)
                    return True
                logger.error("Webhook error %d", resp.status)
                return False
        except Exception as exc:  # noqa: BLE001
            logger.error("Webhook send failed: %s", exc)
            return False

    async def cleanup(self):
        if self._session:
            await self._session.close()
            logger.info("Webhook notifier cleaned up.")


# ── Alert Cooldown (Redis-based) ─────────────────────────────────────────────

async def should_send_alert(alert_key: str, cooldown_minutes: int) -> bool:
    """Kiểm tra cooldown trước khi gửi alert.

    Trả về True nếu đủ thời gian kể từ lần gửi cuối (hoặc Redis không có).
    """
    if cooldown_minutes <= 0:
        return True
    try:
        from core.redis_client import get_redis  # pylint: disable=import-outside-toplevel
        redis = await get_redis()
        if not redis:
            return True

        cache_key = f"alert_cooldown:{alert_key}"
        exists = await redis.exists(cache_key)
        if exists:
            return False  # Đang trong cooldown

        await redis.set(cache_key, "1", ex=cooldown_minutes * 60)
        return True
    except Exception:  # noqa: BLE001
        return True  # Lỗi Redis → luôn gửi


# ── Notification Router (routing by severity) ─────────────────────────────────

class NotificationRouter:
    """Routing cảnh báo theo severity → channels cụ thể.

    routing_config ví dụ:
    {
        "CRITICAL": ["email", "slack", "telegram"],
        "HIGH":     ["email", "slack"],
        "MEDIUM":   ["slack"],
        "LOW":      ["console"],
    }
    """

    DEFAULT_ROUTING: Dict[str, List[str]] = {
        "CRITICAL": ["email", "slack", "telegram", "webhook"],
        "HIGH":     ["email", "slack"],
        "MEDIUM":   ["slack"],
        "LOW":      ["console"],
    }

    def __init__(
        self,
        routing_config: Optional[Dict[str, List[str]]],
        channels: Dict[str, "NotificationChannel"],
    ):
        self.routing_config = routing_config or self.DEFAULT_ROUTING
        self.channels = channels

    async def route_alert(self, alert_type: str, severity: str, data: Dict[str, Any]) -> None:
        target_names = self.routing_config.get(severity, ["console"])
        tasks = []
        for ch_name in target_names:
            channel = self.channels.get(ch_name)
            if channel:
                tasks.append(channel.send(alert_type, {**data, "severity": severity}))
        if tasks:
            await asyncio.gather(*tasks, return_exceptions=True)


class Notifier:
    """Main notification service"""

    def __init__(self):
        self.channels: List[NotificationChannel] = []
        self._initialized = False

    def add_channel(self, channel: NotificationChannel):
        """Thêm notification channel"""
        self.channels.append(channel)
        logger.info(f"Added notification channel: {type(channel).__name__}")

    async def initialize(self):
        """Khởi tạo tất cả channels"""
        if self._initialized:
            return

        # Add default channels
        self.add_channel(ConsoleNotifier())
        self.add_channel(EmailNotifier())
        self.add_channel(SlackNotifier())

        # Initialize all channels
        for channel in self.channels:
            await channel.initialize()

        self._initialized = True
        logger.info("All notification channels initialized")

    async def cleanup(self):
        """Dọn dẹp tất cả channels"""
        for channel in self.channels:
            await channel.cleanup()
        logger.info("All notification channels cleaned up")

    async def send_alert(self, alert_type: str, data: Dict[str, Any]):
        """Gửi alert đến tất cả channels"""
        if not self._initialized:
            await self.initialize()

        tasks = []
        for channel in self.channels:
            task = asyncio.create_task(channel.send(alert_type, data))
            tasks.append(task)

        # Wait for all notifications to complete
        results = await asyncio.gather(*tasks, return_exceptions=True)

        # Log results
        success_count = sum(1 for r in results if r is True)
        error_count = sum(1 for r in results if isinstance(r, Exception))

        logger.info(f"Alert sent to {len(self.channels)} channels: {success_count} success, {error_count} errors")

        if error_count > 0:
            for i, result in enumerate(results):
                if isinstance(result, Exception):
                    logger.error(f"Channel {i} failed: {str(result)}")

# Global instance
notifier = Notifier()

def get_notifier() -> Notifier:
    """Factory function để lấy notifier instance"""
    return notifier
