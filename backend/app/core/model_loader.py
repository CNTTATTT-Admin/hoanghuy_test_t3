"""Model Loader and Management"""

import joblib
import os
from typing import Optional, List
import logging

logger = logging.getLogger(__name__)

class ModelLoader:
    """Class để load và quản lý các model ML"""

    def __init__(self, model_dir: str = "../../models"):
        self.model_dir = model_dir
        self.model = None
        self.preprocessor = None
        self.amount_threshold = None
        self.feature_names = None

    def load_model(self) -> bool:
        """Load trained model từ disk"""
        try:
            model_path = os.path.join(self.model_dir, 'fraud_detection_model.pkl')
            preprocessor_path = os.path.join(self.model_dir, 'preprocessor.pkl')
            threshold_path = os.path.join(self.model_dir, 'amount_threshold.pkl')
            feature_names_path = os.path.join(self.model_dir, 'feature_names.pkl')

            if not all(os.path.exists(p) for p in [model_path, preprocessor_path, threshold_path]):
                logger.error("Model files not found")
                return False

            self.model = joblib.load(model_path)
            self.preprocessor = joblib.load(preprocessor_path)
            self.amount_threshold = joblib.load(threshold_path)

            if os.path.exists(feature_names_path):
                self.feature_names = joblib.load(feature_names_path)

            logger.info("Model loaded successfully")
            return True

        except Exception as e:
            logger.error(f"Error loading model: {str(e)}")
            return False

    def is_loaded(self) -> bool:
        """Kiểm tra model đã được load chưa"""
        return self.model is not None and self.preprocessor is not None

    def get_model(self):
        """Trả về model đã load"""
        return self.model

    def get_preprocessor(self):
        """Trả về preprocessor đã load"""
        return self.preprocessor

    def get_amount_threshold(self) -> Optional[float]:
        """Trả về ngưỡng số tiền"""
        return self.amount_threshold

    def get_feature_names(self) -> Optional[List[str]]:
        """Trả về tên các đặc trưng"""
        return self.feature_names

# Global instance
model_loader = ModelLoader()

def get_model_loader() -> ModelLoader:
    """Factory function để lấy model loader instance"""
    return model_loader
