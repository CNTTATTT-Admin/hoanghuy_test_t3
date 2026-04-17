"""Settings API — Quản lý cài đặt hệ thống.

Endpoints:
  GET  /api/v1/settings             — Lấy tất cả settings (ADMIN, ML_ENGINEER)
  GET  /api/v1/settings/{namespace} — Lấy settings theo namespace
  PUT  /api/v1/settings             — Cập nhật settings (ADMIN only)
  PUT  /api/v1/settings/bulk        — Cập nhật nhiều namespace cùng lúc
"""

from __future__ import annotations
import json
import logging
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status

from core.security import require_role
from db.database import get_pool, is_db_enabled
from schemas.settings import (
    AllSettingsResponse,
    SettingsBulkUpdateRequest,
    SettingsResponse,
    SettingsUpdateRequest,
    VALID_NAMESPACES,
)

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/v1/settings", tags=["settings"])

# ── Đường dẫn gốc project ─────────────────────────────────────────────────────
_PROJECT_ROOT = Path(__file__).resolve().parents[3]


def _parse_metadata(path: Path) -> dict:
    """Parse models/metadata.txt thành dict."""
    result: dict = {}
    try:
        text = path.read_text(encoding="utf-8")
        for line in text.strip().splitlines():
            if ":" in line:
                key, _, val = line.partition(":")
                result[key.strip()] = val.strip()
    except Exception:
        pass
    return result


def _validate_model_settings(settings: dict) -> None:
    """Kiểm tra giá trị model settings hợp lệ."""
    if "confidence_threshold" in settings:
        val = settings["confidence_threshold"]
        if not isinstance(val, (int, float)) or not (0.05 <= val <= 0.95):
            raise HTTPException(400, "confidence_threshold phải trong khoảng [0.05, 0.95]")

    if "calibration_method" in settings:
        val = settings["calibration_method"]
        if val not in ("isotonic", "platt", "none"):
            raise HTTPException(400, "calibration_method phải là: isotonic, platt, hoặc none")

    if "feature_engineering" in settings:
        if not isinstance(settings["feature_engineering"], bool):
            raise HTTPException(400, "feature_engineering phải là boolean")


def _validate_notifications_settings(settings: dict) -> None:
    """Validate notification channel settings."""
    if "alert_cooldown_min" in settings:
        val = settings["alert_cooldown_min"]
        if not isinstance(val, int) or not (0 <= val <= 60):
            raise HTTPException(400, "alert_cooldown_min phải trong khoảng [0, 60]")

    if "slack_webhook" in settings:
        val = settings["slack_webhook"]
        if val and not val.startswith("https://hooks.slack.com/"):
            raise HTTPException(400, "Slack webhook URL không hợp lệ (phải bắt đầu bằng https://hooks.slack.com/)")

    if "telegram_bot_token" in settings:
        val = settings["telegram_bot_token"]
        if val and ":" not in val:
            raise HTTPException(400, "Telegram bot token không hợp lệ (format: 123456:ABC...)")

    if "custom_webhook_url" in settings:
        val = settings["custom_webhook_url"]
        if val and not val.startswith("https://"):
            raise HTTPException(400, "custom_webhook_url phải bắt đầu bằng https://")

    if "routing_config" in settings:
        valid_severities = {"CRITICAL", "HIGH", "MEDIUM", "LOW"}
        valid_channels   = {"email", "slack", "telegram", "webhook", "console"}
        config = settings["routing_config"]
        if not isinstance(config, dict):
            raise HTTPException(400, "routing_config phải là object")
        for sev, channels in config.items():
            if sev not in valid_severities:
                raise HTTPException(400, f"Severity không hợp lệ: {sev}")
            if not isinstance(channels, list) or not all(c in valid_channels for c in channels):
                raise HTTPException(400, f"Channels không hợp lệ cho {sev}")


def _validate_system_settings(settings: dict) -> None:
    """Validate system & security settings."""
    if "rate_limit_per_minute" in settings:
        val = settings["rate_limit_per_minute"]
        if not isinstance(val, int) or not (1 <= val <= 1000):
            raise HTTPException(400, "rate_limit_per_minute phải trong khoảng [1, 1000]")

    if "session_timeout_min" in settings:
        val = settings["session_timeout_min"]
        if not isinstance(val, int) or not (5 <= val <= 1440):
            raise HTTPException(400, "session_timeout_min phải trong khoảng [5, 1440] (5 phút đến 24 giờ)")

    if "ip_whitelist" in settings:
        val = settings["ip_whitelist"]
        if not isinstance(val, list):
            raise HTTPException(400, "ip_whitelist phải là mảng IP addresses")
        import ipaddress  # pylint: disable=import-outside-toplevel
        for ip in val:
            try:
                ipaddress.ip_network(ip, strict=False)
            except ValueError:
                raise HTTPException(400, f"IP không hợp lệ: {ip}")

    if "log_retention_days" in settings:
        val = settings["log_retention_days"]
        if val not in (7, 30, 90, 180, 365):
            raise HTTPException(400, "log_retention_days phải là: 7, 30, 90, 180, hoặc 365")

    if "audit_log_enabled" in settings:
        if not isinstance(settings["audit_log_enabled"], bool):
            raise HTTPException(400, "audit_log_enabled phải là boolean")

    if "test_mode" in settings:
        if not isinstance(settings["test_mode"], bool):
            raise HTTPException(400, "test_mode phải là boolean")


def _validate_risk_settings(settings: dict) -> None:
    """Validate risk threshold settings với ràng buộc logic."""
    high = settings.get("risk_score_high")
    critical = settings.get("risk_score_critical")
    prob = settings.get("fraud_probability_threshold")

    if prob is not None:
        if not isinstance(prob, (int, float)) or not (0.1 <= prob <= 0.95):
            raise HTTPException(400, "fraud_probability_threshold phải trong khoảng [0.1, 0.95]")

    if high is not None:
        if not isinstance(high, (int, float)) or not (30 <= high <= 95):
            raise HTTPException(400, "risk_score_high phải trong khoảng [30, 95]")

    if critical is not None:
        if not isinstance(critical, (int, float)) or not (50 <= critical <= 99):
            raise HTTPException(400, "risk_score_critical phải trong khoảng [50, 99]")

    if high is not None and critical is not None:
        if critical <= high + 4:
            raise HTTPException(
                400,
                f"risk_score_critical ({critical}) phải lớn hơn risk_score_high ({high}) ít nhất 5 điểm",
            )

# ── Giá trị mặc định khi chưa có dữ liệu trong DB ─────────────────────────────
DEFAULT_SETTINGS: dict = {
    "model": {
        "current_model":        "lightgbm",
        "model_version":        "v1",
        "feature_engineering":   True,
        "confidence_threshold":  0.35,
        "calibration_method":   "isotonic",
    },
    "risk": {
        "fraud_probability_threshold": 0.5,
        "risk_score_high":     70,
        "risk_score_critical": 90,
    },
    "rules": {
        "rules": []
    },
    "notifications": {
        "email_on_critical":    True,
        "email_on_high":        False,
        "slack_webhook":        "",
        "telegram_bot_token":   "",
        "telegram_chat_id":     "",
        "custom_webhook_url":   "",
        "alert_cooldown_min":   5,
        "routing_by_severity":  False,
        "routing_config": {
            "CRITICAL": ["email", "slack", "telegram", "webhook"],
            "HIGH":     ["email", "slack"],
            "MEDIUM":   ["slack"],
            "LOW":      ["console"],
        },
    },
    "system": {
        "rate_limit_per_minute":  10,
        "session_timeout_min":    30,
        "ip_whitelist":           [],
        "audit_log_enabled":      True,
        "log_retention_days":     30,
        "test_mode":              False,
    },
}


async def _seed_defaults() -> None:
    """Chèn giá trị mặc định cho tất cả namespace nếu chưa tồn tại."""
    if not is_db_enabled():
        return
    pool = get_pool()
    async with pool.acquire() as conn:
        for ns, entries in DEFAULT_SETTINGS.items():
            for key, value in entries.items():
                await conn.execute(
                    """
                    INSERT INTO system_settings (namespace, key, value)
                    VALUES ($1, $2, $3::jsonb)
                    ON CONFLICT (namespace, key) DO NOTHING
                    """,
                    ns, key, json.dumps(value),
                )
    logger.info("Settings defaults seeded.")


@router.get("", response_model=AllSettingsResponse)
async def get_all_settings(
    current_user: dict = Depends(require_role(["ADMIN", "ML_ENGINEER"]))
):
    """Lấy toàn bộ settings, nhóm theo namespace."""
    if not is_db_enabled():
        return AllSettingsResponse(data=DEFAULT_SETTINGS)

    pool = get_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch(
            "SELECT namespace, key, value FROM system_settings ORDER BY namespace, key"
        )

    result: dict = {}
    for row in rows:
        ns = row["namespace"]
        if ns not in result:
            result[ns] = {}
        result[ns][row["key"]] = row["value"]

    # Merge với defaults cho các key chưa tồn tại
    for ns, defaults in DEFAULT_SETTINGS.items():
        if ns not in result:
            result[ns] = dict(defaults)
        else:
            for k, v in defaults.items():
                if k not in result[ns]:
                    result[ns][k] = v

    return AllSettingsResponse(data=result)


@router.get("/{namespace}", response_model=SettingsResponse)
async def get_settings_by_namespace(
    namespace: str,
    current_user: dict = Depends(require_role(["ADMIN", "ML_ENGINEER"]))
):
    """Lấy settings theo namespace cụ thể."""
    if namespace not in VALID_NAMESPACES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Namespace không hợp lệ. Cho phép: {VALID_NAMESPACES}"
        )

    if not is_db_enabled():
        return SettingsResponse(
            namespace=namespace,
            settings=DEFAULT_SETTINGS.get(namespace, {})
        )

    pool = get_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch(
            "SELECT key, value FROM system_settings WHERE namespace = $1",
            namespace,
        )

    settings = {row["key"]: row["value"] for row in rows}

    # Merge defaults cho key chưa tồn tại
    for k, v in DEFAULT_SETTINGS.get(namespace, {}).items():
        if k not in settings:
            settings[k] = v

    return SettingsResponse(namespace=namespace, settings=settings)


@router.put("")
async def update_settings(
    body: SettingsUpdateRequest,
    current_user: dict = Depends(require_role(["ADMIN"]))
):
    """Cập nhật settings cho 1 namespace. Chỉ ADMIN mới được phép."""
    if body.namespace not in VALID_NAMESPACES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Namespace không hợp lệ. Cho phép: {VALID_NAMESPACES}"
        )

    if not is_db_enabled():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database chưa sẵn sàng."
        )

    # Validation theo namespace
    if body.namespace == "model":
        _validate_model_settings(body.settings)
    elif body.namespace == "risk":
        _validate_risk_settings(body.settings)
    elif body.namespace == "notifications":
        _validate_notifications_settings(body.settings)
    elif body.namespace == "system":
        _validate_system_settings(body.settings)

    pool = get_pool()
    user_uid = current_user.get("user_uid", "unknown")
    now = datetime.now(timezone.utc)

    async with pool.acquire() as conn:
        for key, value in body.settings.items():
            await conn.execute(
                """
                INSERT INTO system_settings (namespace, key, value, updated_by, updated_at)
                VALUES ($1, $2, $3::jsonb, $4, $5)
                ON CONFLICT (namespace, key)
                DO UPDATE SET value = $3::jsonb, updated_by = $4, updated_at = $5
                """,
                body.namespace, key, json.dumps(value), user_uid, now,
            )

    logger.info(
        "Settings updated: namespace=%s keys=%s by=%s",
        body.namespace, list(body.settings.keys()), user_uid,
    )

    # ── Sync sang Redis để các service đọc realtime ────────────────────────
    await _sync_to_redis(body.namespace, body.settings)

    return {
        "status": "ok",
        "namespace": body.namespace,
        "updated_keys": list(body.settings.keys()),
    }


@router.put("/bulk")
async def update_settings_bulk(
    body: SettingsBulkUpdateRequest,
    current_user: dict = Depends(require_role(["ADMIN"]))
):
    """Cập nhật nhiều namespace cùng lúc. Dùng khi frontend gửi toàn bộ Settings page."""
    results = []
    user_uid = current_user.get("user_uid", "unknown")
    now = datetime.now(timezone.utc)

    for update in body.updates:
        if update.namespace not in VALID_NAMESPACES:
            results.append({
                "namespace": update.namespace,
                "status": "error",
                "detail": "Invalid namespace",
            })
            continue

        if not is_db_enabled():
            results.append({
                "namespace": update.namespace,
                "status": "error",
                "detail": "DB unavailable",
            })
            continue

        pool = get_pool()
        async with pool.acquire() as conn:
            for key, value in update.settings.items():
                await conn.execute(
                    """
                    INSERT INTO system_settings (namespace, key, value, updated_by, updated_at)
                    VALUES ($1, $2, $3::jsonb, $4, $5)
                    ON CONFLICT (namespace, key)
                    DO UPDATE SET value = $3::jsonb, updated_by = $4, updated_at = $5
                    """,
                    update.namespace, key, json.dumps(value), user_uid, now,
                )

        logger.info(
            "Settings bulk updated: namespace=%s keys=%s by=%s",
            update.namespace, list(update.settings.keys()), user_uid,
        )
        await _sync_to_redis(update.namespace, update.settings)
        results.append({
            "namespace": update.namespace,
            "status": "ok",
            "updated_keys": list(update.settings.keys()),
        })

    return {"status": "ok", "results": results}


# ── Helper: sync settings sang Redis cache ────────────────────────────────────
async def _sync_to_redis(namespace: str, settings: dict) -> None:
    """Đồng bộ settings vào Redis để các service đọc realtime."""
    try:
        from core.redis_client import get_redis  # pylint: disable=import-outside-toplevel
        redis = await get_redis()
        if not redis:
            return
        for key, value in settings.items():
            redis_val = json.dumps(value) if isinstance(value, (list, dict, bool)) else str(value)
            await redis.set(f"settings:{namespace}:{key}", redis_val)
    except Exception as exc:
        logger.warning("Không sync được settings sang Redis: %s", exc)


# ── Model info endpoint ───────────────────────────────────────────────────────
@router.get("/model/info")
async def get_model_info(
    current_user: dict = Depends(require_role(["ADMIN", "ML_ENGINEER"]))
):
    """Lấy thông tin model đang chạy — đọc từ models/metadata.txt + model_config.yaml."""
    try:
        import yaml  # pylint: disable=import-outside-toplevel
    except ImportError:
        yaml = None  # type: ignore

    info: dict = {
        "model_type": "LightGBM (LGBMClassifier)",
        "model_file": None,
        "metadata":   {},
        "config":     {},
    }

    # Đọc metadata.txt
    metadata_path = _PROJECT_ROOT / "models" / "metadata.txt"
    if metadata_path.exists():
        info["metadata"] = _parse_metadata(metadata_path)

    # Đọc model_config.yaml
    config_path = _PROJECT_ROOT / "configs" / "model_config.yaml"
    if config_path.exists() and yaml is not None:
        with open(config_path, encoding="utf-8") as f:
            info["config"] = yaml.safe_load(f)

    # Tìm model file mới nhất
    models_dir = _PROJECT_ROOT / "models"
    pkl_files = sorted(
        models_dir.glob("*.pkl"),
        key=lambda p: p.stat().st_mtime,
        reverse=True,
    )
    if pkl_files:
        info["model_file"] = pkl_files[0].name

    return info


# ── Test notification endpoint ────────────────────────────────────────────────
@router.post("/test-notification")
async def test_notification(
    body: dict,
    current_user: dict = Depends(require_role(["ADMIN"])),
):
    """Gửi test notification qua kênh được chọn.

    Body: { "channel": "slack" | "telegram" | "webhook" }
    """
    channel_name = body.get("channel", "")
    if channel_name not in ("slack", "telegram", "webhook"):
        raise HTTPException(400, "channel phải là: slack, telegram, hoặc webhook")

    # Đọc settings notification hiện tại để lấy config
    notif_settings: dict = {}
    if is_db_enabled():
        pool = get_pool()
        async with pool.acquire() as conn:
            rows = await conn.fetch(
                "SELECT key, value FROM system_settings WHERE namespace = 'notifications'"
            )
        for row in rows:
            raw = row["value"]
            notif_settings[row["key"]] = json.loads(raw) if isinstance(raw, str) else raw

    test_data = {
        "alert_type":       "TEST",
        "severity":         "LOW",
        "transaction_id":   "TEST-0000",
        "amount":           0.0,
        "fraud_probability": 0.0,
        "risk_score":       0,
        "decision":         "TEST",
        "message":          "Đây là tin nhắn test từ FraudDetect Settings.",
        "timestamp":        datetime.now(timezone.utc).isoformat(),
    }

    success = False
    error_detail = ""

    try:
        if channel_name == "slack":
            webhook_url = notif_settings.get("slack_webhook", "")
            if not webhook_url:
                raise HTTPException(400, "Slack webhook URL chưa được cấu hình")
            from notifier import SlackNotifier  # pylint: disable=import-outside-toplevel
            ch = SlackNotifier(webhook_url=webhook_url)
            await ch.initialize()
            success = await ch.send("TEST", test_data)
            await ch.cleanup()

        elif channel_name == "telegram":
            token   = notif_settings.get("telegram_bot_token", "")
            chat_id = notif_settings.get("telegram_chat_id", "")
            if not token or not chat_id:
                raise HTTPException(400, "Telegram bot token và chat_id chưa được cấu hình")
            from notifier import TelegramNotifier  # pylint: disable=import-outside-toplevel
            ch = TelegramNotifier(bot_token=token, chat_id=chat_id)
            await ch.initialize()
            success = await ch.send("TEST", test_data)
            await ch.cleanup()

        elif channel_name == "webhook":
            webhook_url = notif_settings.get("custom_webhook_url", "")
            if not webhook_url:
                raise HTTPException(400, "Custom webhook URL chưa được cấu hình")
            from notifier import WebhookNotifier  # pylint: disable=import-outside-toplevel
            ch = WebhookNotifier(webhook_url=webhook_url)
            await ch.initialize()
            success = await ch.send("TEST", test_data)
            await ch.cleanup()

    except HTTPException:
        raise
    except Exception as exc:  # noqa: BLE001
        error_detail = str(exc)
        logger.error("Test notification failed: %s", exc)

    if not success and not error_detail:
        error_detail = f"Kênh {channel_name} gửi thất bại — kiểm tra lại config"

    return {
        "channel": channel_name,
        "success": success,
        "detail":  error_detail if not success else f"Test message đã gửi qua {channel_name}",
    }


# ── Log cleanup ───────────────────────────────────────────────────────────────

def _parse_delete_count(result: str) -> int:
    """Parse asyncpg DELETE result string 'DELETE N'."""
    try:
        return int(result.split()[-1])
    except (IndexError, ValueError):
        return 0


@router.post("/system/cleanup-logs")
async def cleanup_old_logs(
    current_user: dict = Depends(require_role(["ADMIN"]))
):
    """Xóa log cũ hơn retention period. Chạy manual hoặc định kỳ."""
    if not is_db_enabled():
        raise HTTPException(503, "Database chưa sẵn sàng")

    from datetime import timedelta  # pylint: disable=import-outside-toplevel

    pool = get_pool()
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            "SELECT value FROM system_settings WHERE namespace='system' AND key='log_retention_days'"
        )
    retention_days = 30
    if row:
        try:
            raw = row["value"]
            retention_days = int(json.loads(raw) if isinstance(raw, str) else raw)
        except (ValueError, TypeError):
            pass

    cutoff = datetime.now(timezone.utc) - timedelta(days=retention_days)

    async with pool.acquire() as conn:
        result1 = await conn.execute(
            "DELETE FROM inference_history WHERE created_at < $1", cutoff
        )
        result2 = await conn.execute(
            "DELETE FROM user_audit_log WHERE created_at < $1", cutoff
        )
        result3 = await conn.execute(
            "DELETE FROM token_blacklist WHERE expires_at < $1", cutoff
        )

    logger.info(
        "Log cleanup by %s: retention=%d days, cutoff=%s",
        current_user.get("user_uid", "unknown"), retention_days, cutoff.isoformat(),
    )

    return {
        "status": "ok",
        "retention_days": retention_days,
        "cutoff_date": cutoff.isoformat(),
        "deleted": {
            "inference_history": _parse_delete_count(result1),
            "user_audit_log":    _parse_delete_count(result2),
            "token_blacklist":   _parse_delete_count(result3),
        },
    }
