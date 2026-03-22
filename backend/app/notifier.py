"""Alert Notification System"""

import asyncio
import json
import logging
from typing import Dict, Any, List, Optional
from datetime import datetime
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
