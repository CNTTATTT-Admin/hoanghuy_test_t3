"""Settings schemas — Định nghĩa cấu trúc request/response cho Settings API."""

from __future__ import annotations
from typing import Any, Dict, Optional, List
from pydantic import BaseModel, Field
from datetime import datetime

# ── Namespace constants ──────────────────────────────────────────
VALID_NAMESPACES = ["model", "risk", "rules", "notifications", "system"]

# ── Request schemas ──────────────────────────────────────────────
class SettingsUpdateRequest(BaseModel):
    """Body cho PUT /api/v1/settings — cập nhật 1 hoặc nhiều namespace."""
    namespace: str = Field(..., description="Namespace: model | risk | rules | notifications | system")
    settings:  Dict[str, Any] = Field(..., description="Key-value pairs cần cập nhật")

class SettingsBulkUpdateRequest(BaseModel):
    """Body cho PUT /api/v1/settings/bulk — cập nhật nhiều namespace cùng lúc."""
    updates: List[SettingsUpdateRequest]

# ── Response schemas ─────────────────────────────────────────────
class SettingsEntry(BaseModel):
    namespace:  str
    key:        str
    value:      Any
    updated_by: Optional[str] = None
    updated_at: Optional[datetime] = None

class SettingsResponse(BaseModel):
    """Response chứa settings theo namespace."""
    namespace: str
    settings:  Dict[str, Any]

class AllSettingsResponse(BaseModel):
    """Response chứa tất cả settings, nhóm theo namespace."""
    data: Dict[str, Dict[str, Any]]  # { "model": {...}, "risk": {...}, ... }
