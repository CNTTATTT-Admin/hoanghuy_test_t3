"""Rule Engine Schemas — Định nghĩa request/response cho CRUD rules."""

from __future__ import annotations
from typing import Any, List, Optional
from pydantic import BaseModel, Field, field_validator
from datetime import datetime

VALID_FIELDS: list[str] = [
    "amount", "transaction_type", "balance_ratio",
    "time_of_day", "velocity", "fraud_probability", "risk_score",
]
VALID_OPERATORS: list[str] = [">", ">=", "<", "<=", "==", "!=", "in", "not_in", "between"]
VALID_ACTIONS:   list[str] = ["ALLOW", "BLOCK", "REVIEW"]


class RuleCondition(BaseModel):
    field:    str = Field(..., description="Trường kiểm tra")
    operator: str = Field(..., description="Toán tử so sánh")
    value:    Any = Field(..., description="Giá trị so sánh")

    @field_validator("field")
    @classmethod
    def validate_field(cls, v: str) -> str:
        if v not in VALID_FIELDS:
            raise ValueError(f"field phải là một trong: {VALID_FIELDS}")
        return v

    @field_validator("operator")
    @classmethod
    def validate_operator(cls, v: str) -> str:
        if v not in VALID_OPERATORS:
            raise ValueError(f"operator phải là một trong: {VALID_OPERATORS}")
        return v


class RuleCreateRequest(BaseModel):
    name:        str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    conditions:  List[RuleCondition] = Field(..., min_length=1)
    action:      str
    priority:    int = Field(default=100, ge=1, le=999)
    is_enabled:  bool = Field(default=True)

    @field_validator("action")
    @classmethod
    def validate_action(cls, v: str) -> str:
        if v not in VALID_ACTIONS:
            raise ValueError(f"action phải là: {VALID_ACTIONS}")
        return v


class RuleUpdateRequest(BaseModel):
    name:        Optional[str] = None
    description: Optional[str] = None
    conditions:  Optional[List[RuleCondition]] = None
    action:      Optional[str] = None
    priority:    Optional[int] = Field(default=None, ge=1, le=999)
    is_enabled:  Optional[bool] = None

    @field_validator("action")
    @classmethod
    def validate_action(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and v not in VALID_ACTIONS:
            raise ValueError(f"action phải là: {VALID_ACTIONS}")
        return v


class RuleResponse(BaseModel):
    rule_id:     str
    name:        str
    description: Optional[str] = None
    conditions:  List[RuleCondition]
    action:      str
    priority:    int
    is_enabled:  bool
    created_by:  Optional[str] = None
    created_at:  Optional[datetime] = None
    updated_at:  Optional[datetime] = None


class RulesListResponse(BaseModel):
    rules: List[RuleResponse]
    total: int
