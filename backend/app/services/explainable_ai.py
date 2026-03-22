"""Explainable AI Service"""

import numpy as np
import pandas as pd
from typing import Dict, Any, List, Optional
import logging
from sklearn.inspection import permutation_importance

logger = logging.getLogger(__name__)

class ExplainableAIService:
    """Service để giải thích quyết định của model AI"""

    def __init__(self, model=None, preprocessor=None):
        self.model = model
        self.preprocessor = preprocessor
        self.feature_names = None

    def set_model_and_preprocessor(self, model, preprocessor):
        """Thiết lập model và preprocessor để giải thích"""
        self.model = model
        self.preprocessor = preprocessor
        if hasattr(preprocessor, 'get_feature_names_out'):
            self.feature_names = preprocessor.get_feature_names_out()
        else:
            # Fallback feature names
            self.feature_names = [
                'step', 'amount', 'oldbalanceOrg', 'newbalanceOrig',
                'oldbalanceDest', 'newbalanceDest', 'type_CASH_IN',
                'type_CASH_OUT', 'type_DEBIT', 'type_PAYMENT', 'type_TRANSFER'
            ]

    def explain_prediction(self, transaction: Dict[str, Any], prediction: float) -> Dict[str, Any]:
        """Giải thích dự đoán cho một giao dịch"""
        try:
            explanation = {
                'prediction': prediction,
                'risk_level': self._get_risk_level(prediction),
                'key_factors': self._get_key_factors(transaction),
                'recommendations': self._get_recommendations(transaction, prediction),
                'confidence': self._calculate_confidence(prediction)
            }

            logger.info(f"Explanation generated for prediction: {prediction:.4f}")
            return explanation

        except Exception as e:
            logger.error(f"Error generating explanation: {str(e)}")
            return self._fallback_explanation(transaction, prediction)

    def _get_risk_level(self, prediction: float) -> str:
        """Xác định mức độ rủi ro"""
        if prediction >= 0.8:
            return "Rất cao"
        elif prediction >= 0.6:
            return "Cao"
        elif prediction >= 0.4:
            return "Trung bình"
        elif prediction >= 0.2:
            return "Thấp"
        else:
            return "Rất thấp"

    def _get_key_factors(self, transaction: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Xác định các yếu tố chính ảnh hưởng đến dự đoán"""
        factors = []

        # Amount factor
        amount = transaction.get('amount', 0)
        if amount > 100000:
            factors.append({
                'factor': 'Số tiền lớn',
                'value': f"{amount:,.0f}",
                'impact': 'Tăng rủi ro',
                'reason': 'Giao dịch với số tiền lớn thường có rủi ro cao hơn'
            })

        # Balance change factor
        old_org = transaction.get('oldbalanceOrg', 0)
        new_org = transaction.get('newbalanceOrig', 0)
        if old_org > 0 and new_org == 0:
            factors.append({
                'factor': 'Tài khoản gốc hết tiền',
                'value': '0',
                'impact': 'Tăng rủi ro đáng kể',
                'reason': 'Giao dịch làm trống tài khoản thường đáng ngờ'
            })

        # Transaction type factor
        tx_type = transaction.get('type', '')
        if tx_type in ['TRANSFER', 'CASH_OUT']:
            factors.append({
                'factor': 'Loại giao dịch',
                'value': tx_type,
                'impact': 'Tăng rủi ro',
                'reason': 'Transfer và Cash_out thường liên quan đến gian lận'
            })

        # Time factor
        step = transaction.get('step', 0)
        hour = step % 24
        if 0 <= hour <= 6:
            factors.append({
                'factor': 'Thời gian giao dịch',
                'value': f"{hour}:00",
                'impact': 'Tăng rủi ro',
                'reason': 'Giao dịch vào nửa đêm thường đáng ngờ'
            })

        return factors

    def _get_recommendations(self, transaction: Dict[str, Any], prediction: float) -> List[str]:
        """Đưa ra khuyến nghị dựa trên dự đoán"""
        recommendations = []

        if prediction >= 0.6:
            recommendations.extend([
                "Kiểm tra danh tính người nhận",
                "Xác minh nguồn gốc số tiền",
                "Theo dõi giao dịch tiếp theo của tài khoản này",
                "Cân nhắc tạm thời khóa giao dịch nếu nghi ngờ"
            ])

        if prediction >= 0.4:
            recommendations.extend([
                "Ghi nhận giao dịch vào hệ thống giám sát",
                "Kiểm tra lịch sử giao dịch của tài khoản"
            ])

        # Amount-based recommendations
        amount = transaction.get('amount', 0)
        if amount > 200000:
            recommendations.append("Áp dụng quy trình kiểm soát giao dịch lớn")

        # Type-based recommendations
        tx_type = transaction.get('type', '')
        if tx_type == 'TRANSFER':
            recommendations.append("Kiểm tra mối quan hệ giữa người gửi và người nhận")

        return list(set(recommendations))  # Remove duplicates

    def _calculate_confidence(self, prediction: float) -> str:
        """Tính độ tin cậy của dự đoán"""
        if prediction > 0.8 or prediction < 0.2:
            return "Cao"
        elif prediction > 0.6 or prediction < 0.4:
            return "Trung bình"
        else:
            return "Thấp"

    def _fallback_explanation(self, transaction: Dict[str, Any], prediction: float) -> Dict[str, Any]:
        """Fallback explanation khi có lỗi"""
        return {
            'prediction': prediction,
            'risk_level': self._get_risk_level(prediction),
            'key_factors': [{
                'factor': 'Không thể phân tích chi tiết',
                'value': 'N/A',
                'impact': 'Không xác định',
                'reason': 'Lỗi trong quá trình phân tích'
            }],
            'recommendations': [
                "Thực hiện kiểm tra thủ công",
                "Ghi nhận vào hệ thống giám sát"
            ],
            'confidence': 'Không xác định'
        }

    def get_feature_importance(self, X_test: pd.DataFrame, y_test: pd.Series) -> Dict[str, float]:
        """Tính toán độ quan trọng của các features"""
        try:
            if self.model is None:
                return {}

            # Calculate permutation importance
            perm_importance = permutation_importance(
                self.model, X_test, y_test, n_repeats=10, random_state=42
            )

            # Create feature importance dict
            importance_dict = {}
            for i, feature in enumerate(self.feature_names):
                if i < len(perm_importance.importances_mean):
                    importance_dict[feature] = perm_importance.importances_mean[i]

            return importance_dict

        except Exception as e:
            logger.error(f"Error calculating feature importance: {str(e)}")
            return {}

# Global instance
xai_service = ExplainableAIService()

def get_xai_service() -> ExplainableAIService:
    """Factory function để lấy XAI service instance"""
    return xai_service
