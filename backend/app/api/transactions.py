"""Transaction API Endpoints"""

from fastapi import APIRouter, HTTPException, BackgroundTasks
from typing import Dict, Any
import logging

from schemas.transaction import TransactionRequest, TransactionResponse, ErrorResponse
from services.fraud_detection import get_fraud_detection_service

logger = logging.getLogger(__name__)

router = APIRouter()
fraud_service = get_fraud_detection_service()

@router.post(
    "/detect-fraud",
    response_model=TransactionResponse,
    responses={
        400: {"model": ErrorResponse},
        500: {"model": ErrorResponse}
    }
)
async def detect_fraud(
    transaction: TransactionRequest,
    background_tasks: BackgroundTasks
) -> TransactionResponse:
    """
    Phát hiện gian lận cho một giao dịch

    - **transaction**: Thông tin giao dịch cần kiểm tra
    - **return**: Kết quả phân tích gian lận với giải thích chi tiết
    """
    try:
        # Convert Pydantic model to dict
        transaction_dict = transaction.dict()

        # Add background task for additional processing if needed
        background_tasks.add_task(log_transaction, transaction_dict)

        # Detect fraud
        result = fraud_service.detect_fraud(transaction_dict)

        # Convert to response model
        response = TransactionResponse(**result)

        logger.info(f"Fraud detection API called for transaction {transaction.nameOrig}")
        return response

    except ValueError as e:
        logger.warning(f"Validation error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected error in fraud detection: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.post("/batch-detect-fraud")
async def batch_detect_fraud(
    transactions: list[TransactionRequest],
    background_tasks: BackgroundTasks
) -> Dict[str, Any]:
    """
    Phát hiện gian lận cho nhiều giao dịch cùng lúc

    - **transactions**: Danh sách giao dịch cần kiểm tra
    - **return**: Kết quả phân tích cho tất cả giao dịch
    """
    try:
        if len(transactions) > 100:
            raise HTTPException(status_code=400, detail="Maximum 100 transactions per batch")

        results = []
        for transaction in transactions:
            transaction_dict = transaction.dict()
            result = fraud_service.detect_fraud(transaction_dict)
            results.append(result)

        # Add background task for batch processing
        background_tasks.add_task(log_batch_transactions, [t.dict() for t in transactions])

        return {
            "total_transactions": len(transactions),
            "results": results,
            "processed_at": "now"
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in batch fraud detection: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/health")
async def health_check() -> Dict[str, Any]:
    """
    Kiểm tra trạng thái service

    - **return**: Trạng thái của các components
    """
    try:
        status = fraud_service.get_service_status()
        return status
    except Exception as e:
        logger.error(f"Error in health check: {str(e)}")
        return {
            "status": "unhealthy",
            "error": str(e)
        }

@router.get("/stats")
async def get_stats() -> Dict[str, Any]:
    """
    Lấy thống kê về hoạt động của service

    - **return**: Thống kê sử dụng
    """
    # This would be implemented with actual metrics collection
    return {
        "total_requests": 0,
        "fraud_detected": 0,
        "average_processing_time": 0,
        "uptime": "unknown"
    }

async def log_transaction(transaction: Dict[str, Any]):
    """Background task để ghi log giao dịch"""
    try:
        logger.info(f"Transaction logged: {transaction.get('nameOrig', 'unknown')}")
        # Here you could save to database, send to monitoring system, etc.
    except Exception as e:
        logger.error(f"Error logging transaction: {str(e)}")

async def log_batch_transactions(transactions: list[Dict[str, Any]]):
    """Background task để ghi log batch giao dịch"""
    try:
        logger.info(f"Batch transactions logged: {len(transactions)} transactions")
        # Here you could save to database, send to monitoring system, etc.
    except Exception as e:
        logger.error(f"Error logging batch transactions: {str(e)}")
