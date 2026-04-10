"""PostgreSQL connection and table helpers for backend APIs."""

from __future__ import annotations

import json
import logging
import os
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

import asyncpg

logger = logging.getLogger(__name__)

_pool: Optional[asyncpg.Pool] = None


def utcnow() -> datetime:
    """Return timezone-aware UTC datetime."""
    return datetime.now(timezone.utc)


async def init_db() -> bool:
    """Khởi tạo connection pool PostgreSQL và tạo bảng. Trả về True khi thành công."""
    global _pool

    if _pool is not None:
        return True

    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        logger.warning("DATABASE_URL is not set. Database integration is disabled.")
        return False

    try:
        _pool = await asyncpg.create_pool(
            database_url,
            min_size=int(os.getenv("DB_MIN_POOL_SIZE", "5")),
            max_size=int(os.getenv("DB_MAX_POOL_SIZE", "20")),
            command_timeout=int(os.getenv("DB_COMMAND_TIMEOUT", "30")),
        )
        # Đăng ký codec JSON cho asyncpg
        async with _pool.acquire() as conn:
            await conn.set_type_codec(
                "jsonb", encoder=json.dumps, decoder=json.loads, schema="pg_catalog"
            )
        await _ensure_tables()
        logger.info("PostgreSQL connected successfully.")
        return True
    except Exception as exc:
        logger.error("PostgreSQL initialization failed: %s", exc)
        _pool = None
        return False


async def close_db() -> None:
    """Đóng connection pool PostgreSQL."""
    global _pool

    if _pool is None:
        return

    await _pool.close()
    _pool = None
    logger.info("PostgreSQL connection closed.")


def is_db_enabled() -> bool:
    """Kiểm tra PostgreSQL có sẵn sàng hay không."""
    return _pool is not None


def get_pool() -> asyncpg.Pool:
    """Lấy connection pool đang hoạt động."""
    if _pool is None:
        raise RuntimeError("PostgreSQL is not initialized")
    return _pool


async def acquire_connection() -> asyncpg.Connection:
    """Lấy một connection từ pool (dùng trong async with)."""
    pool = get_pool()
    conn = await pool.acquire()
    await conn.set_type_codec(
        "jsonb", encoder=json.dumps, decoder=json.loads, schema="pg_catalog"
    )
    return conn


async def release_connection(conn: asyncpg.Connection) -> None:
    """Trả connection về pool."""
    pool = get_pool()
    await pool.release(conn)


async def _ensure_tables() -> None:
    """Tạo bảng và index nếu chưa tồn tại."""
    pool = get_pool()
    async with pool.acquire() as conn:
        await conn.set_type_codec(
            "jsonb", encoder=json.dumps, decoder=json.loads, schema="pg_catalog"
        )

        # Bảng inference_history - lưu lịch sử inference
        await conn.execute("""
            CREATE TABLE IF NOT EXISTS inference_history (
                id BIGSERIAL PRIMARY KEY,
                request_id VARCHAR(64) UNIQUE NOT NULL,
                source_endpoint VARCHAR(255),
                user_id VARCHAR(255),
                transaction_type VARCHAR(50),
                amount DOUBLE PRECISION DEFAULT 0,
                inference_timestamp VARCHAR(255),
                input JSONB,
                output JSONB,
                is_fraud BOOLEAN DEFAULT FALSE,
                risk_score DOUBLE PRECISION DEFAULT 0,
                risk_level VARCHAR(50),
                created_at TIMESTAMPTZ DEFAULT NOW()
            );
        """)

        # Bảng alerts - lưu cảnh báo gian lận
        await conn.execute("""
            CREATE TABLE IF NOT EXISTS alerts (
                id BIGSERIAL PRIMARY KEY,
                alert_id VARCHAR(64) UNIQUE NOT NULL,
                type VARCHAR(100),
                message TEXT,
                severity VARCHAR(50),
                status VARCHAR(50) DEFAULT 'open',
                source_endpoint VARCHAR(255),
                timestamp VARCHAR(255),
                details JSONB,
                created_at TIMESTAMPTZ DEFAULT NOW(),
                acknowledged_at TIMESTAMPTZ
            );
        """)
        # ── Migration: chuẩn hóa status values (chạy thủ công 1 lần nếu DB cũ đang dùng 'active'/'acknowledged')
        # ALTER TABLE alerts ALTER COLUMN status SET DEFAULT 'open';
        # UPDATE alerts SET status = 'open'          WHERE status = 'active';
        # UPDATE alerts SET status = 'resolved'      WHERE status = 'acknowledged';
        # UPDATE alerts SET status = 'false_positive' WHERE status = 'closed';

        # Bảng user_risk_profiles - cache hồ sơ rủi ro user
        await conn.execute("""
            CREATE TABLE IF NOT EXISTS user_risk_profiles (
                id BIGSERIAL PRIMARY KEY,
                user_id VARCHAR(255) UNIQUE NOT NULL,
                data JSONB DEFAULT '{}',
                updated_at TIMESTAMPTZ DEFAULT NOW()
            );
        """)

        # Indexes cho inference_history
        await conn.execute(
            "CREATE INDEX IF NOT EXISTS idx_history_user_time "
            "ON inference_history (user_id, created_at DESC);"
        )
        await conn.execute(
            "CREATE INDEX IF NOT EXISTS idx_history_fraud_time "
            "ON inference_history (is_fraud, created_at DESC);"
        )
        await conn.execute(
            "CREATE INDEX IF NOT EXISTS idx_history_risk_time "
            "ON inference_history (risk_level, created_at DESC);"
        )
        await conn.execute(
            "CREATE INDEX IF NOT EXISTS idx_history_created "
            "ON inference_history (created_at DESC);"
        )

        # Indexes cho alerts
        await conn.execute(
            "CREATE INDEX IF NOT EXISTS idx_alerts_status_created "
            "ON alerts (status, created_at DESC);"
        )
        await conn.execute(
            "CREATE INDEX IF NOT EXISTS idx_alerts_type_created "
            "ON alerts (type, created_at DESC);"
        )
        await conn.execute(
            "CREATE INDEX IF NOT EXISTS idx_alerts_severity_created "
            "ON alerts (severity, created_at DESC);"
        )

        # Bảng model_reference_stats — lưu reference distribution từ training
        await conn.execute("""
            CREATE TABLE IF NOT EXISTS model_reference_stats (
                id           BIGSERIAL PRIMARY KEY,
                model_version VARCHAR(64) NOT NULL,
                feature_name  VARCHAR(128) NOT NULL,
                stat_type     VARCHAR(64) NOT NULL,
                value         JSONB NOT NULL,
                created_at    TIMESTAMPTZ DEFAULT NOW()
            );
        """)
        await conn.execute(
            "CREATE INDEX IF NOT EXISTS idx_ref_stats_version_feature "
            "ON model_reference_stats (model_version, feature_name);"
        )

        # Bảng drift_reports — lưu kết quả mỗi lần drift check
        await conn.execute("""
            CREATE TABLE IF NOT EXISTS drift_reports (
                id                   BIGSERIAL PRIMARY KEY,
                timestamp            TIMESTAMPTZ NOT NULL,
                model_version        VARCHAR(64),
                severity             VARCHAR(32),
                recommendation       VARCHAR(64),
                psi_scores           JSONB,
                ks_pvalue            DOUBLE PRECISION,
                fraud_rate_current   DOUBLE PRECISION,
                fraud_rate_baseline  DOUBLE PRECISION,
                fraud_rate_zscore    DOUBLE PRECISION,
                drifted_features     JSONB,
                window_hours         INTEGER DEFAULT 1,
                n_current_samples    INTEGER DEFAULT 0,
                created_at           TIMESTAMPTZ DEFAULT NOW()
            );
        """)
        await conn.execute(
            "CREATE INDEX IF NOT EXISTS idx_drift_reports_timestamp "
            "ON drift_reports (timestamp DESC);"
        )
        await conn.execute(
            "CREATE INDEX IF NOT EXISTS idx_drift_reports_severity "
            "ON drift_reports (severity, timestamp DESC);"
        )

    logger.info("PostgreSQL tables and indexes ensured.")


def record_to_dict(record: asyncpg.Record) -> Dict[str, Any]:
    """Chuyển đổi asyncpg Record thành dict, xử lý datetime thành ISO string."""
    if record is None:
        return {}
    result = dict(record)
    for key, value in result.items():
        if isinstance(value, datetime):
            result[key] = value.isoformat()
    return result
