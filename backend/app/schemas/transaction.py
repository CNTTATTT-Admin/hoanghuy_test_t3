from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from enum import Enum

from core.fraud_decision import FraudDecision  # noqa: F401

class TransactionType(str, Enum):
    CASH_IN = "CASH_IN"
    CASH_OUT = "CASH_OUT"
    DEBIT = "DEBIT"
    PAYMENT = "PAYMENT"
    TRANSFER = "TRANSFER"

class RiskLevel(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"

class TransactionRequest(BaseModel):
    """Schema cho request transaction mới"""
    step: int = Field(..., description="Bước thời gian của giao dịch", ge=1)
    type: TransactionType = Field(..., description="Loại giao dịch")
    amount: float = Field(..., description="Số tiền giao dịch", gt=0)
    oldbalanceOrg: float = Field(..., description="Số dư gốc trước giao dịch", ge=0)
    newbalanceOrig: float = Field(..., description="Số dư gốc sau giao dịch", ge=0)
    oldbalanceDest: float = Field(..., description="Số dư đích trước giao dịch", ge=0)
    newbalanceDest: float = Field(..., description="Số dư đích sau giao dịch", ge=0)
    nameOrig: str = Field(..., description="ID tài khoản nguồn")
    nameDest: str = Field(..., description="ID tài khoản đích")

    class Config:
        schema_extra = {
            "example": {
                "step": 1,
                "type": "TRANSFER",
                "amount": 100000.0,
                "oldbalanceOrg": 100000.0,
                "newbalanceOrig": 0.0,
                "oldbalanceDest": 0.0,
                "newbalanceDest": 100000.0
            }
        }

class TransactionResponse(BaseModel):
    """Schema cho response kết quả phát hiện gian lận"""
    transaction_id: str = Field(..., description="ID giao dịch")
    is_fraud: Optional[bool] = Field(None, description="Kết luận gian lận")
    fraud_score: Optional[float] = Field(None, description="Điểm fraud tổng hợp (0-1)", ge=0, le=1)
    model_score: Optional[float] = Field(None, description="Xác suất model trả về (0-1)", ge=0, le=1)
    explanation: Optional[Dict[str, Any]] = Field(None, description="Chi tiết giải thích")
    processed_at: Optional[str] = Field(None, description="Thời điểm xử lý")
    processing_time_ms: Optional[float] = Field(None, description="Thời gian xử lý (ms)")
    error: Optional[str] = Field(None, description="Lỗi nếu có")

    class Config:
        schema_extra = {
            "example": {
                "fraud": True,
                "risk_score": 0.85,
                "risk_level": "HIGH",
                "explanations": [
                    "Loại giao dịch là TRANSFER (chuyển khoản), rủi ro cao",
                    "Tài khoản gốc đã về 0 sau giao dịch"
                ]
            }
        }

class ErrorResponse(BaseModel):
    """Schema cho error response"""
    error: str = Field(..., description="Thông báo lỗi")
    details: Optional[str] = Field(None, description="Chi tiết lỗi")

    class Config:
        schema_extra = {
            "example": {
                "error": "Validation Error",
                "details": "Amount must be greater than 0"
            }
        }


class TransactionCheckRequest(BaseModel):
    """Request schema for realtime transaction check endpoint."""
    user_id: str = Field(..., description="User identifier")
    amount: float = Field(..., gt=0, description="Transaction amount")
    type: TransactionType = Field(..., description="Transaction type")
    oldbalanceOrg: float = Field(..., ge=0, description="Origin balance before transaction")
    oldbalanceDest: float = Field(..., ge=0, description="Destination balance before transaction")
    timestamp: str = Field(..., description="ISO-8601 timestamp")

    class Config:
        schema_extra = {
            "example": {
                "user_id": "C123",
                "amount": 120000.0,
                "type": "TRANSFER",
                "oldbalanceOrg": 150000.0,
                "oldbalanceDest": 0.0,
                "timestamp": "2026-03-24T10:30:00Z"
            }
        }


class TransactionCheckResponse(BaseModel):
    """Response schema for realtime transaction check endpoint."""
    is_fraud: bool = Field(..., description="Fraud prediction")
    risk_score: float = Field(..., ge=0, le=1, description="Calibrated risk score")
    risk_level: RiskLevel = Field(..., description="LOW, MEDIUM or HIGH")
    reasons: List[str] = Field(default_factory=list, description="Human-readable reasons")
    timestamp: str = Field(..., description="Inference timestamp")
    type: Optional[TransactionType] = Field(None, description="Loại giao dịch")
    decision: str = Field(..., description="APPROVED, PENDING hoặc BLOCKED")
    should_block: bool = Field(False, description="True nếu giao dịch cần bị chặn")
    requires_review: bool = Field(False, description="True nếu cần xét duyệt thủ công")
    block_reason: Optional[str] = Field(None, description="Lý do chặn giao dịch")
    review_reason: Optional[str] = Field(None, description="Lý do cần xét duyệt")


# ─── Schema cho endpoint /authorize ──────────────────────────────────────────

class AuthorizeRequest(BaseModel):
    """Request schema cho endpoint /transactions/authorize.
    Cho phép amount=0 để rule-based filter có thể chặn zero-amount transfer.
    """
    step: int = Field(..., description="Bước thời gian của giao dịch", ge=1)
    type: TransactionType = Field(..., description="Loại giao dịch")
    amount: float = Field(..., description="Số tiền giao dịch", ge=0)
    oldbalanceOrg: float = Field(..., description="Số dư gốc trước giao dịch", ge=0)
    newbalanceOrig: float = Field(..., description="Số dư gốc sau giao dịch", ge=0)
    oldbalanceDest: float = Field(..., description="Số dư đích trước giao dịch", ge=0)
    newbalanceDest: float = Field(..., description="Số dư đích sau giao dịch", ge=0)
    nameOrig: str = Field(..., description="ID tài khoản nguồn")
    nameDest: str = Field(..., description="ID tài khoản đích")

    class Config:
        schema_extra = {
            "example": {
                "step": 1,
                "type": "TRANSFER",
                "amount": 450000.0,
                "oldbalanceOrg": 450000.0,
                "newbalanceOrig": 0.0,
                "oldbalanceDest": 0.0,
                "newbalanceDest": 450000.0,
                "nameOrig": "C123456789",
                "nameDest": "C987654321",
            }
        }


class AuthorizeResponse(BaseModel):
    """Response schema cho endpoint /transactions/authorize.
    Dùng cho cả ALLOW (200) và BLOCK (403).
    """
    authorized: bool = Field(..., description="True = cho phép, False = chặn")
    transaction_id: str = Field(..., description="ID giao dịch sinh ra bởi hệ thống")
    fraud_probability: float = Field(..., ge=0, le=1, description="Xác suất gian lận từ model")
    risk_level: RiskLevel = Field(..., description="Mức độ rủi ro: LOW / MEDIUM / HIGH")

    # ── Decision Layer ──
    decision: Optional[FraudDecision] = Field(None, description="BLOCKED / PENDING / APPROVED")

    # ── Loại giao dịch ──
    type: Optional[TransactionType] = Field(None, description="Loại giao dịch")

    # ── Trường chỉ có khi ALLOW ──
    risk_score: Optional[float] = Field(None, ge=0, le=1, description="Risk score (khi được phép)")

    # ── Trường chỉ có khi BLOCK ──
    block_reason: Optional[str] = Field(None, description="Lý do chặn giao dịch")
    recommendations: Optional[List[str]] = Field(None, description="Khuyến nghị cho người dùng")
    reference_id: Optional[str] = Field(None, description="Mã tham chiếu nội bộ")

    # ── Trường chỉ có khi cần manual review ──
    flagged_for_review: Optional[bool] = Field(False, description="Có cần review thủ công không")
    review_reason: Optional[str] = Field(None, description="Lý do cần review")

    class Config:
        schema_extra = {
            "example": {
                "is_fraud": True,
                "risk_score": 0.83,
                "risk_level": "HIGH",
                "reasons": [
                    "High transaction amount",
                    "Unusual transaction frequency",
                    "Balance drop anomaly"
                ],
                "timestamp": "2026-03-24T10:30:00Z"
            }
        }