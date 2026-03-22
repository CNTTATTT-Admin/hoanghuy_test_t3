# Huấn luyện và đánh giá mô hình phát hiện gian lận
# Tác giả: Tạo cho dự án FraudDetect

import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import cross_val_score, StratifiedKFold
from sklearn.metrics import classification_report, confusion_matrix, roc_auc_score, precision_recall_fscore_support
import joblib
import os
from typing import Dict, List, Any, Tuple
from split import split_data
import warnings
warnings.filterwarnings('ignore')

class FraudDetectionModel:
    """Mô hình phát hiện gian lận với khả năng huấn luyện, đánh giá và dự đoán"""

    def __init__(self, model_dir: str = "../models"):
        self.model_dir = model_dir
        self.model = None
        self.feature_names = None

        # Đảm bảo thư mục mô hình tồn tại
        os.makedirs(self.model_dir, exist_ok=True)

    def train_model(self, X_train: np.ndarray, y_train: np.ndarray, feature_names: List[str]):
        """Huấn luyện mô hình phát hiện gian lận"""
        print("=== MODEL TRAINING ===")

        # Sử dụng Random Forest với regularization để ngăn overfitting
        self.model = RandomForestClassifier(
            n_estimators=100,
            max_depth=6,  # Giảm từ 10 để ngăn overfitting
            min_samples_split=10,
            min_samples_leaf=5,
            random_state=42,
            class_weight='balanced',  # Xử lý imbalance mà không dùng SMOTE
            n_jobs=-1
        )

        print("Training Random Forest model...")
        self.model.fit(X_train, y_train)
        self.feature_names = feature_names

        # Lưu mô hình
        self.save_model()

    def cross_validate_model(self, X_train: np.ndarray, y_train: np.ndarray, cv: int = 5) -> Dict[str, Any]:
        """Cross-validate mô hình để kiểm tra overfitting"""
        print("=== CROSS-VALIDATE MODEL ===")

        # Tạo mô hình cho CV
        cv_model = RandomForestClassifier(
            n_estimators=100,
            max_depth=6,
            min_samples_split=10,
            min_samples_leaf=5,
            random_state=42,
            class_weight='balanced',
            n_jobs=-1
        )

        # Stratified K-Fold CV
        cv_strategy = StratifiedKFold(n_splits=cv, shuffle=True, random_state=42)

        # Điểm cross-validation
        cv_scores_precision = cross_val_score(cv_model, X_train, y_train, cv=cv_strategy, scoring='precision')
        cv_scores_recall = cross_val_score(cv_model, X_train, y_train, cv=cv_strategy, scoring='recall')
        cv_scores_f1 = cross_val_score(cv_model, X_train, y_train, cv=cv_strategy, scoring='f1')
        cv_scores_auc = cross_val_score(cv_model, X_train, y_train, cv=cv_strategy, scoring='roc_auc')

        cv_results = {
            'cv_precision_mean': cv_scores_precision.mean(),
            'cv_precision_std': cv_scores_precision.std(),
            'cv_recall_mean': cv_scores_recall.mean(),
            'cv_recall_std': cv_scores_recall.std(),
            'cv_f1_mean': cv_scores_f1.mean(),
            'cv_f1_std': cv_scores_f1.std(),
            'cv_auc_mean': cv_scores_auc.mean(),
            'cv_auc_std': cv_scores_auc.std()
        }

        print("Cross-validation results:")
        for metric, value in cv_results.items():
            print(".4f")

        return cv_results

    def evaluate_model(self, X_test: np.ndarray, y_test: np.ndarray) -> Dict[str, Any]:
        """Đánh giá hiệu suất mô hình"""
        print("=== MODEL EVALUATION ===")

        # Dự đoán
        y_pred = self.model.predict(X_test)
        y_pred_proba = self.model.predict_proba(X_test)

        # Chỉ số
        precision, recall, f1, _ = precision_recall_fscore_support(y_test, y_pred, average='binary')
        roc_auc = roc_auc_score(y_test, y_pred_proba[:, 1])

        # Ma trận nhầm lẫn
        cm = confusion_matrix(y_test, y_pred)

        # Báo cáo phân loại
        report = classification_report(y_test, y_pred, output_dict=True)

        evaluation_results = {
            'precision': precision,
            'recall': recall,
            'f1_score': f1,
            'roc_auc': roc_auc,
            'confusion_matrix': cm.tolist(),
            'classification_report': report
        }

        print(".4f")
        print(".4f")
        print(".4f")
        print(".4f")
        print(f"Confusion matrix:\n{cm}")

        return evaluation_results

    def predict_with_explanation(self, transaction_data: Dict[str, Any]) -> Dict[str, Any]:
        """Dự đoán gian lận với giải thích"""
        print("=== PREDICT WITH EXPLANATION ===")

        # Chuyển thành DataFrame
        df = pd.DataFrame([transaction_data])

        # Tiền xử lý cho suy luận
        preprocessor = FraudDetectionPreprocessor()
        X_processed = preprocessor.preprocess_inference(df)

        # Tải mô hình nếu chưa tải
        if self.model is None:
            self.load_model()

        # Dự đoán
        prediction = self.model.predict(X_processed)[0]
        probabilities = self.model.predict_proba(X_processed)

        # Tính điểm rủi ro
        risk_score = calculate_risk_score(probabilities)

        # Xác định mức rủi ro
        if risk_score >= 0.7:
            risk_level = "HIGH"
        elif risk_score >= 0.3:
            risk_level = "MEDIUM"
        else:
            risk_level = "LOW"

        # Lấy giá trị đặc trưng để giải thích
        feature_dict = dict(zip(self.feature_names, X_processed[0]))

        # Giải thích dự đoán
        reasons = explain_prediction(feature_dict, prediction, risk_score)

        result = {
            "fraud": bool(prediction),
            "risk_score": risk_score,
            "risk_level": risk_level,
            "reasons": reasons
        }

        print(f"Prediction: {result}")
        return result

    def save_model(self):
        """Lưu mô hình đã huấn luyện"""
        path = os.path.join(self.model_dir, 'fraud_detection_model.pkl')
        joblib.dump(self.model, path)
        print(f"Model saved to: {path}")

    def load_model(self):
        """Tải mô hình đã huấn luyện"""
        path = os.path.join(self.model_dir, 'fraud_detection_model.pkl')
        self.model = joblib.load(path)
        print(f"Model loaded from: {path}")

        # Tải tên đặc trưng nếu có
        feature_path = os.path.join(self.model_dir, 'feature_names.pkl')
        if os.path.exists(feature_path):
            self.feature_names = joblib.load(feature_path)

def save_feature_names(feature_names: List[str], model_dir: str = "../models"):
    """Lưu tên đặc trưng để sử dụng sau"""
    path = os.path.join(model_dir, 'feature_names.pkl')
    joblib.dump(feature_names, path)
    print(f"Feature names saved to: {path}")

# Ví dụ sử dụng và demo
if __name__ == "__main__":
    print("=== START MODEL TRAINING ===")
    # Khởi tạo các thành phần
    preprocessor = FraudDetectionPreprocessor()
    model_trainer = FraudDetectionModel()

    # Tiền xử lý dữ liệu với hybrid split (time + user based)
    X_train, X_test, y_train, y_test, feature_names = preprocessor.preprocess_training()

    # Thêm thông tin về split method
    print("\n=== DATA SPLIT INFO ===")
    print("✅ Using HYBRID SPLIT: Time-based + User-based")
    print("✅ No user appears in both train and test")
    print("✅ Features only use historical information")
    print("✅ No future information leakage")

    # Lưu tên đặc trưng
    save_feature_names(feature_names)

    # Huấn luyện mô hình
    model = model_trainer.train_model(X_train, y_train, feature_names)

    # Cross-validate để kiểm tra overfitting
    cv_results = model_trainer.cross_validate_model(X_train, y_train)

    # Đánh giá mô hình
    evaluation = model_trainer.evaluate_model(X_test, y_test)

    print("\n=== OVERALL RESULTS ===")
    print(f"Training completed with {len(feature_names)} features")
    print(f"Model evaluation: Precision={evaluation['precision']:.4f}, Recall={evaluation['recall']:.4f}, F1={evaluation['f1_score']:.4f}")

    # Dự đoán demo
    sample_transaction = {
        'step': 1,
        'type': 'TRANSFER',
        'amount': 100000.0,
        'oldbalanceOrg': 100000.0,
        'newbalanceOrig': 0.0,
        'oldbalanceDest': 0.0,
        'newbalanceDest': 100000.0
    }

    result = model_trainer.predict_with_explanation(sample_transaction)
    print("Sample prediction results:")
    print(result)