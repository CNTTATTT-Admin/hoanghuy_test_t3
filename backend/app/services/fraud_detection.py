"""Fraud Detection Service"""

from typing import Dict, Any, Optional
import logging
from datetime import datetime

from core.model_loader import get_model_loader
from core.inference import get_inference_engine
from services.risk_scoring import get_risk_scorer
from services.explainable_ai import get_xai_service
from notifier import get_notifier

logger = logging.getLogger(__name__)

class FraudDetectionService:
    """Main service để điều phối phát hiện gian lận"""

    def __init__(self):
        self.model_loader = get_model_loader()
        self.inference_engine = get_inference_engine()
        self.risk_scorer = get_risk_scorer()
        self.xai_service = get_xai_service()
        self.notifier = get_notifier()

        # Initialize components
        self._initialize_components()

    def _initialize_components(self):
        """Khởi tạo các components"""
        try:
            # Load model and preprocessor
            model = self.model_loader.get_model()
            preprocessor = self.model_loader.get_preprocessor()

            # Set up inference engine
            self.inference_engine.set_model_and_preprocessor(model, preprocessor)

            # Set up XAI service
            self.xai_service.set_model_and_preprocessor(model, preprocessor)

            logger.info("Fraud detection service initialized successfully")

        except Exception as e:
            logger.error(f"Error initializing fraud detection service: {str(e)}")
            raise

    def detect_fraud(self, transaction: Dict[str, Any]) -> Dict[str, Any]:
        """Phát hiện gian lận cho một giao dịch"""
        try:
            start_time = datetime.now()

            # Validate transaction
            self._validate_transaction(transaction)

            # Preprocess transaction
            processed_data = self.inference_engine.preprocess_transaction(transaction)

            # Get model prediction
            model_score = self.inference_engine.predict_transaction(processed_data)

            # Calculate comprehensive risk score
            risk_score = self.risk_scorer.calculate_risk_score(transaction, model_score)

            # Generate explanation
            explanation = self.xai_service.explain_prediction(transaction, risk_score)

            # Determine if fraud
            is_fraud = risk_score >= 0.5  # Threshold có thể config

            # Prefer transaction_id nếu client gửi, fallback nameOrig
            transaction_id = transaction.get('transaction_id') or transaction.get('nameOrig', 'unknown')

            # Create result
            result = {
                'transaction_id': transaction_id,
                'is_fraud': is_fraud,
                'fraud_score': risk_score,
                'model_score': model_score,
                'explanation': explanation,
                'processed_at': datetime.now().isoformat(),
                'processing_time_ms': (datetime.now() - start_time).total_seconds() * 1000
            }

            # Send alert if fraud detected
            if is_fraud:
                # Non-blocking fire-and-forget (asynchronous)
                import asyncio
                asyncio.create_task(self._send_fraud_alert(result))

            logger.info(f"Fraud detection completed for transaction {result['transaction_id']}: fraud={is_fraud}, score={risk_score:.4f}")
            return result

        except Exception as e:
            logger.error(f"Error in fraud detection: {str(e)}")
            return self._create_error_result(transaction, str(e))

    def _validate_transaction(self, transaction: Dict[str, Any]):
        """Validate transaction data"""
        required_fields = ['step', 'type', 'amount', 'nameOrig', 'oldbalanceOrg',
                          'newbalanceOrig', 'nameDest', 'oldbalanceDest', 'newbalanceDest']

        missing_fields = [field for field in required_fields if field not in transaction]
        if missing_fields:
            raise ValueError(f"Missing required fields: {missing_fields}")

        # Validate data types
        if not isinstance(transaction.get('amount', 0), (int, float)):
            raise ValueError("Amount must be numeric")

        if transaction.get('amount', 0) < 0:
            raise ValueError("Amount cannot be negative")

    async def _send_fraud_alert(self, result: Dict[str, Any]):
        """Gửi cảnh báo gian lận"""
        try:
            alert_data = {
                'transaction_id': result['transaction_id'],
                'fraud_score': result['fraud_score'],
                'amount': result.get('amount', 0),
                'risk_level': result['explanation']['risk_level'],
                'key_factors': result['explanation']['key_factors'],
                'recommendations': result['explanation']['recommendations']
            }

            await self.notifier.send_alert("FRAUD_DETECTED", alert_data)
            logger.warning(f"Fraud alert sent for transaction {result['transaction_id']}")

        except Exception as e:
            logger.error(f"Error sending fraud alert: {str(e)}")

    def _create_error_result(self, transaction: Dict[str, Any], error: str) -> Dict[str, Any]:
        """Tạo kết quả lỗi"""
        return {
            'transaction_id': transaction.get('nameOrig', 'unknown'),
            'is_fraud': None,
            'fraud_score': None,
            'model_score': None,
            'error': error,
            'processed_at': datetime.now().isoformat(),
            'explanation': {
                'prediction': None,
                'risk_level': 'Không xác định',
                'key_factors': [],
                'recommendations': ['Kiểm tra thủ công do lỗi hệ thống'],
                'confidence': 'Không xác định'
            }
        }

    def get_service_status(self) -> Dict[str, Any]:
        """Kiểm tra trạng thái service"""
        try:
            return {
                'status': 'healthy',
                'model_loaded': self.model_loader.is_model_loaded(),
                'components': {
                    'model_loader': 'ready',
                    'inference_engine': 'ready',
                    'risk_scorer': 'ready',
                    'xai_service': 'ready',
                    'notifier': 'ready'
                },
                'last_check': datetime.now().isoformat()
            }
        except Exception as e:
            logger.error(f"Error checking service status: {str(e)}")
            return {
                'status': 'unhealthy',
                'error': str(e),
                'last_check': datetime.now().isoformat()
            }

# Global instance
fraud_detection_service = FraudDetectionService()

def get_fraud_detection_service() -> FraudDetectionService:
    """Factory function để lấy fraud detection service instance"""
    return fraud_detection_service
