"""Inference Engine for Fraud Detection"""

import pandas as pd
import numpy as np
from typing import Dict, Any, Optional
import logging

from .model_loader import get_model_loader

logger = logging.getLogger(__name__)

class InferenceEngine:
    """Engine để thực hiện inference với model ML"""

    def __init__(self):
        self.model_loader = get_model_loader()
        self.model = None
        self.preprocessor = None

    def set_model_and_preprocessor(self, model, preprocessor):
        """Thiết lập model và preprocessor cho inference"""
        self.model = model
        self.preprocessor = preprocessor
        logger.info("Model and preprocessor set for inference engine")

    def preprocess_transaction(self, transaction_data: Dict[str, Any]) -> Optional[np.ndarray]:
        """Tiền xử lý transaction cho inference"""
        try:
            # Convert to DataFrame
            df = pd.DataFrame([transaction_data])

            # Handle missing values
            df = df.dropna()

            # Remove unnecessary columns
            columns_to_drop = ['nameOrig', 'nameDest', 'isFlaggedFraud']
            df = df.drop(columns=[col for col in columns_to_drop if col in df.columns], errors='ignore')

            # Feature engineering
            df['balance_diff_org'] = df['oldbalanceOrg'] - df['newbalanceOrig']
            df['balance_diff_dest'] = df['newbalanceDest'] - df['oldbalanceDest']

            amount_threshold = self.model_loader.get_amount_threshold() or 100000
            df['is_large_amount'] = (df['amount'] > amount_threshold).astype(int)

            df['step_hour'] = df['step'] % 24
            df['step_day'] = df['step'] // 24

            # Get feature columns for preprocessing
            feature_cols = ['step', 'amount', 'oldbalanceOrg', 'newbalanceOrig',
                          'oldbalanceDest', 'newbalanceDest', 'balance_diff_org',
                          'balance_diff_dest', 'is_large_amount', 'step_hour', 'step_day']

            # Transform using preprocessor
            if self.preprocessor is None:
                logger.error("Preprocessor not set")
                return None

            X_processed = self.preprocessor.transform(df[feature_cols])
            return X_processed

        except Exception as e:
            logger.error(f"Error preprocessing transaction: {str(e)}")
            return None

    def predict_transaction(self, X_processed: np.ndarray) -> float:
        """Dự đoán transaction và trả về risk score"""
        try:
            if self.model is None:
                logger.error("Model not set")
                return 0.5

            # Predict probabilities
            probabilities = self.model.predict_proba(X_processed)

            # Return fraud probability (class 1)
            risk_score = float(probabilities[0][1]) if len(probabilities.shape) > 1 else float(probabilities[0])

            logger.info(f"Prediction completed: risk_score={risk_score:.4f}")
            return risk_score

        except Exception as e:
            logger.error(f"Error predicting transaction: {str(e)}")
            return 0.5  # Default risk score

# Global instance
inference_engine = InferenceEngine()

def get_inference_engine() -> InferenceEngine:
    """Factory function để lấy inference engine instance"""
    return inference_engine
