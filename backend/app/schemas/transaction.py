from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from enum import Enum

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