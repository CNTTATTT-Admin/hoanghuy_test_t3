# """MongoDB Atlas connection and collection helpers for backend APIs."""

# from __future__ import annotations

# import logging
# import os
# from datetime import datetime, timezone
# from typing import Any, Optional

# from bson import ObjectId
# from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorCollection, AsyncIOMotorDatabase
# from pymongo import ASCENDING, DESCENDING

# logger = logging.getLogger(__name__)

# _client: Optional[AsyncIOMotorClient] = None
# _db: Optional[AsyncIOMotorDatabase] = None


# def utcnow() -> datetime:
#     """Return timezone-aware UTC datetime."""
#     return datetime.now(timezone.utc)


# def _resolve_db_name(client: AsyncIOMotorClient) -> str:
#     configured_name = os.getenv("MONGODB_DB_NAME")
#     if configured_name:
#         return configured_name

#     default_db = client.get_default_database()
#     if default_db is not None and default_db.name:
#         return default_db.name

#     return "fraud_db"


# async def init_mongo() -> bool:
#     """Initialize MongoDB connection and indexes. Returns True when enabled."""
#     global _client, _db

#     if _db is not None:
#         return True

#     uri = os.getenv("MONGODB_URI")
#     if not uri:
#         logger.warning("MONGODB_URI is not set. MongoDB integration is disabled.")
#         return False

#     try:
#         _client = AsyncIOMotorClient(
#             uri,
#             appname=os.getenv("MONGODB_APP_NAME", "frauddetect-backend"),
#             maxPoolSize=int(os.getenv("MONGODB_MAX_POOL_SIZE", "100")),
#             minPoolSize=int(os.getenv("MONGODB_MIN_POOL_SIZE", "5")),
#             serverSelectionTimeoutMS=int(os.getenv("MONGODB_SERVER_SELECTION_TIMEOUT_MS", "3000")),
#         )
#         await _client.admin.command("ping")

#         _db = _client[_resolve_db_name(_client)]
#         await _ensure_indexes()
#         logger.info("MongoDB connected successfully to database '%s'.", _db.name)
#         return True
#     except Exception as exc:
#         logger.error("MongoDB initialization failed: %s", exc)
#         _client = None
#         _db = None
#         return False


# async def close_mongo() -> None:
#     """Close MongoDB client if initialized."""
#     global _client, _db

#     if _client is None:
#         return

#     _client.close()
#     _client = None
#     _db = None
#     logger.info("MongoDB connection closed.")


# def is_mongo_enabled() -> bool:
#     """Return whether MongoDB is currently available for this process."""
#     return _db is not None


# def get_db() -> AsyncIOMotorDatabase:
#     """Get active database handle."""
#     if _db is None:
#         raise RuntimeError("MongoDB is not initialized")
#     return _db


# def get_inference_history_collection() -> AsyncIOMotorCollection:
#     return get_db()["inference_history"]


# def get_alerts_collection() -> AsyncIOMotorCollection:
#     return get_db()["alerts"]


# def get_user_profiles_collection() -> AsyncIOMotorCollection:
#     return get_db()["user_risk_profiles"]


# async def _ensure_indexes() -> None:
#     history = get_inference_history_collection()
#     alerts = get_alerts_collection()
#     profiles = get_user_profiles_collection()

#     await history.create_index([("request_id", ASCENDING)], unique=True, name="uq_request_id")
#     await history.create_index([("user_id", ASCENDING), ("inference_timestamp", DESCENDING)], name="idx_user_time")
#     await history.create_index([("is_fraud", ASCENDING), ("inference_timestamp", DESCENDING)], name="idx_fraud_time")
#     await history.create_index([("risk_level", ASCENDING), ("inference_timestamp", DESCENDING)], name="idx_risk_time")
#     await history.create_index([("created_at", DESCENDING)], name="idx_history_created")

#     ttl_days = int(os.getenv("MONGODB_HISTORY_TTL_DAYS", "0"))
#     if ttl_days > 0:
#         await history.create_index(
#             [("created_at", ASCENDING)],
#             expireAfterSeconds=ttl_days * 24 * 60 * 60,
#             name="ttl_history_created_at",
#         )

#     await alerts.create_index([("alert_id", ASCENDING)], unique=True, name="uq_alert_id")
#     await alerts.create_index([("status", ASCENDING), ("created_at", DESCENDING)], name="idx_status_created")
#     await alerts.create_index([("type", ASCENDING), ("created_at", DESCENDING)], name="idx_type_created")
#     await alerts.create_index([("severity", ASCENDING), ("created_at", DESCENDING)], name="idx_severity_created")

#     await profiles.create_index([("user_id", ASCENDING)], unique=True, name="uq_user_profile")


# def serialize_mongo_document(data: Any) -> Any:
#     """Convert ObjectId/datetime recursively into JSON-safe values."""
#     if isinstance(data, ObjectId):
#         return str(data)
#     if isinstance(data, datetime):
#         return data.isoformat()
#     if isinstance(data, list):
#         return [serialize_mongo_document(item) for item in data]
#     if isinstance(data, dict):
#         return {key: serialize_mongo_document(value) for key, value in data.items()}
#     return data