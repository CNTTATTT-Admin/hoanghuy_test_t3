"""Alert API Endpoints"""

from fastapi import APIRouter, HTTPException
from typing import Dict, Any, List, Optional
import logging

from notifier import get_notifier

logger = logging.getLogger(__name__)

router = APIRouter()
notifier = get_notifier()

@router.get("/alerts")
async def get_alerts(
    limit: int = 50,
    offset: int = 0,
    alert_type: Optional[str] = None
) -> Dict[str, Any]:
    """
    Lấy danh sách cảnh báo

    - **limit**: Số lượng cảnh báo tối đa trả về
    - **offset**: Vị trí bắt đầu
    - **alert_type**: Loại cảnh báo để lọc (FRAUD_DETECTED, SYSTEM_ERROR, etc.)
    """
    try:
        # This would be implemented with actual alert storage
        # For now, return mock data
        alerts = [
            {
                "id": "alert_001",
                "type": "FRAUD_DETECTED",
                "message": "Gian lận được phát hiện",
                "severity": "high",
                "timestamp": "2024-01-01T10:00:00Z",
                "details": {
                    "transaction_id": "C1234567890",
                    "fraud_score": 0.85
                }
            }
        ]

        # Filter by type if specified
        if alert_type:
            alerts = [a for a in alerts if a["type"] == alert_type]

        return {
            "alerts": alerts[offset:offset + limit],
            "total": len(alerts),
            "limit": limit,
            "offset": offset
        }

    except Exception as e:
        logger.error(f"Error getting alerts: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/alerts/{alert_id}")
async def get_alert(alert_id: str) -> Dict[str, Any]:
    """
    Lấy chi tiết một cảnh báo

    - **alert_id**: ID của cảnh báo
    """
    try:
        # This would query actual alert storage
        # For now, return mock data
        alert = {
            "id": alert_id,
            "type": "FRAUD_DETECTED",
            "message": "Gian lận được phát hiện",
            "severity": "high",
            "timestamp": "2024-01-01T10:00:00Z",
            "details": {
                "transaction_id": "C1234567890",
                "fraud_score": 0.85,
                "amount": 1000000,
                "recommendations": ["Kiểm tra danh tính", "Chặn giao dịch"]
            }
        }

        return alert

    except Exception as e:
        logger.error(f"Error getting alert {alert_id}: {str(e)}")
        raise HTTPException(status_code=404, detail="Alert not found")

@router.post("/alerts/{alert_id}/acknowledge")
async def acknowledge_alert(alert_id: str) -> Dict[str, Any]:
    """
    Xác nhận đã xử lý cảnh báo

    - **alert_id**: ID của cảnh báo
    """
    try:
        # This would update alert status in storage
        return {
            "alert_id": alert_id,
            "status": "acknowledged",
            "acknowledged_at": "2024-01-01T10:30:00Z"
        }

    except Exception as e:
        logger.error(f"Error acknowledging alert {alert_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/alerts/stats")
async def get_alert_stats() -> Dict[str, Any]:
    """
    Lấy thống kê cảnh báo
    """
    try:
        # This would calculate real statistics
        return {
            "total_alerts": 150,
            "active_alerts": 12,
            "acknowledged_today": 8,
            "by_type": {
                "FRAUD_DETECTED": 120,
                "SYSTEM_ERROR": 20,
                "PERFORMANCE_WARNING": 10
            },
            "by_severity": {
                "high": 45,
                "medium": 75,
                "low": 30
            }
        }

    except Exception as e:
        logger.error(f"Error getting alert stats: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")
