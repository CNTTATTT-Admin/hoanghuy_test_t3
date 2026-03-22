# Module tiền xử lý phát hiện gian lận
# Tác giả: Tạo cho dự án FraudDetect
# Mô tả: Pipeline tiền xử lý hoàn chỉnh cho tập dữ liệu PaySim

import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
import joblib
import os
from typing import Tuple, List, Dict
import warnings
warnings.filterwarnings('ignore')

from data_loading import load_data
from cleaning import handle_missing_values, remove_unnecessary_columns
from feature_engineering import feature_engineering, prepare_features_and_target
from split import split_data
from safe_feature_engineering import create_safe_features

class FraudDetectionPreprocessor:
    """
    Pipeline tiền xử lý cho phát hiện gian lận sử dụng tập dữ liệu PaySim.
    Hỗ trợ cả chế độ huấn luyện và suy luận.
    """

    def __init__(self, data_path: str = "../data/paysim.csv", model_dir: str = "../models"):
        self.data_path = data_path
        self.model_dir = model_dir
        self.scaler = None
        self.encoder = None
        self.feature_names = None

        # Đảm bảo thư mục mô hình tồn tại
        os.makedirs(self.model_dir, exist_ok=True)

    def get_preprocessor_pipeline(self) -> ColumnTransformer:
        """Tạo pipeline tiền xử lý"""
        # Cột phân loại
        categorical_cols = ['type']

        # Cột số (loại trừ phân loại)
        numerical_cols = ['step', 'amount', 'oldbalanceOrg', 'newbalanceOrig',
                         'oldbalanceDest', 'newbalanceDest', 'balance_diff_org',
                         'balance_diff_dest', 'is_large_amount', 'step_hour', 'step_day']

        # Pipeline tiền xử lý
        preprocessor = ColumnTransformer(
            transformers=[
                ('num', StandardScaler(), numerical_cols),
                ('cat', OneHotEncoder(drop='first', sparse_output=False), categorical_cols)
            ])

        return preprocessor, numerical_cols + categorical_cols

    def preprocess_training(self) -> Tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray, List[str]]:
        """Tiền xử lý đầy đủ cho chế độ huấn luyện"""
        print("=== PREPROCESSING FOR TRAINING MODE ===")

        # Tải dữ liệu
        df = load_data(self.data_path)
        df = handle_missing_values(df)

        # Chia dữ liệu với hybrid method (time + user based) TRƯỚC khi loại bỏ cột
        train_df, test_df = split_data(df, method='hybrid')

        # Loại bỏ cột không cần thiết SAU khi split
        train_df = remove_unnecessary_columns(train_df)
        test_df = remove_unnecessary_columns(test_df)

        # Tách X, y
        X_train, y_train = prepare_features_and_target(train_df)
        X_test, y_test = prepare_features_and_target(test_df)

        # Kỹ thuật đặc trưng chỉ trên dữ liệu train
        X_train, amount_threshold = feature_engineering(X_train, is_training=True)
        X_test, _ = feature_engineering(X_test, is_training=False, amount_threshold=amount_threshold)

        # Tạo features an toàn (chống data leakage) - CẦN nameOrig
        print("Creating safe features...")
        X_train_safe = create_safe_features(X_train, is_training=True)
        X_test_safe = create_safe_features(X_test, is_training=False)

        # Bây giờ mới loại bỏ cột nameOrig
        columns_to_drop = ['nameOrig', 'nameDest'] if 'nameOrig' in X_train_safe.columns else []
        if columns_to_drop:
            X_train_safe = X_train_safe.drop(columns=columns_to_drop, errors='ignore')
            X_test_safe = X_test_safe.drop(columns=columns_to_drop, errors='ignore')

        # Merge safe features
        safe_feature_cols = [col for col in X_train_safe.columns if col not in X_train.columns]
        X_train = pd.concat([X_train, X_train_safe[safe_feature_cols]], axis=1)
        X_test = pd.concat([X_test, X_test_safe[safe_feature_cols]], axis=1)

        print(f"Train target distribution: {y_train.value_counts()}")
        print(f"Test target distribution: {y_test.value_counts()}")

        # Lấy preprocessor
        preprocessor, feature_cols = self.get_preprocessor_pipeline()

        # Fit trên dữ liệu huấn luyện
        X_train_processed = preprocessor.fit_transform(X_train[feature_cols])
        X_test_processed = preprocessor.transform(X_test[feature_cols])

        # Không dùng SMOTE - sử dụng class_weight trong mô hình thay thế
        X_train_balanced = X_train_processed
        y_train_balanced = y_train

        print(f"Train size: {X_train_balanced.shape}")
        print(f"Balanced target distribution: {pd.Series(y_train_balanced).value_counts()}")

        # Lưu preprocessor và ngưỡng
        self.save_preprocessor(preprocessor)
        self.save_threshold(amount_threshold)

        # Lấy tên đặc trưng
        feature_names = self.get_feature_names(preprocessor, feature_cols)

        return X_train_balanced, X_test_processed, y_train_balanced, y_test, feature_names

    def preprocess_inference(self, data: pd.DataFrame) -> np.ndarray:
        """Tiền xử lý cho chế độ suy luận"""
        print("=== PREPROCESSING FOR INFERENCE MODE ===")

        # Tải preprocessor và ngưỡng
        preprocessor = self.load_preprocessor()
        amount_threshold = self.load_threshold()

        # Làm sạch và kỹ thuật đặc trưng
        data = handle_missing_values(data)
        data = remove_unnecessary_columns(data)
        data, _ = feature_engineering(data, is_training=False, amount_threshold=amount_threshold)

        # Lấy cột đặc trưng
        _, feature_cols = self.get_preprocessor_pipeline()

        # Biến đổi
        X_processed = preprocessor.transform(data[feature_cols])

        return X_processed

    def save_preprocessor(self, preprocessor: ColumnTransformer):
        """Lưu preprocessor vào đĩa"""
        path = os.path.join(self.model_dir, 'preprocessor.pkl')
        joblib.dump(preprocessor, path)
        print(f"Preprocessor saved to: {path}")

    def save_threshold(self, threshold: float):
        """Lưu ngưỡng số tiền vào đĩa"""
        path = os.path.join(self.model_dir, 'amount_threshold.pkl')
        joblib.dump(threshold, path)
        print(f"Amount threshold saved to: {path}")

    def load_preprocessor(self) -> ColumnTransformer:
        """Tải preprocessor từ đĩa"""
        path = os.path.join(self.model_dir, 'preprocessor.pkl')
        preprocessor = joblib.load(path)
        print(f"Preprocessor loaded from: {path}")
        return preprocessor

    def load_threshold(self) -> float:
        """Tải ngưỡng số tiền từ đĩa"""
        path = os.path.join(self.model_dir, 'amount_threshold.pkl')
        threshold = joblib.load(path)
        print(f"Amount threshold loaded from: {path}: {threshold}")
        return threshold

    def get_feature_names(self, preprocessor: ColumnTransformer, feature_cols: List[str]) -> List[str]:
        """Lấy tên đặc trưng sau tiền xử lý"""
        # Lấy đặc trưng số
        num_features = feature_cols[:11]  # Điều chỉnh dựa trên cột số của bạn

        # Lấy đặc trưng phân loại
        cat_features = []
        if hasattr(preprocessor.named_transformers_['cat'], 'get_feature_names_out'):
            cat_features = preprocessor.named_transformers_['cat'].get_feature_names_out(['type']).tolist()

        feature_names = num_features + cat_features
        return feature_names

def calculate_risk_score(probabilities: np.ndarray) -> float:
    """Tính điểm rủi ro từ xác suất dự đoán"""
    # Giả định probabilities[:, 1] là xác suất gian lận
    return float(probabilities[0][1]) if len(probabilities.shape) > 1 else float(probabilities[1])

def explain_prediction(features: Dict[str, float], prediction: int, risk_score: float) -> List[str]:
    """Giải thích dựa trên quy tắc cải tiến cho dự đoán gian lận với quy tắc hành vi"""
    reasons = []

    amount = float(features.get('amount', 0.0))
    obs = float(features.get('oldbalanceOrg', 0.0))
    nbs = float(features.get('newbalanceOrig', 0.0))
    bdiff_org = float(features.get('balance_diff_org', 0.0))
    bdiff_dest = float(features.get('balance_diff_dest', 0.0))

    # 1. Hành vi rút hết tiền (withdraw-all)
    if obs > 0 and nbs == 0:
        reasons.append("Tài khoản gốc đã về 0 sau giao dịch")

    # 2. Chuyển toàn bộ số dư (transfer entire balance)
    if obs > 0 and abs(amount - obs) / obs >= 0.95:
        reasons.append("Giao dịch bằng hoặc gần bằng toàn bộ số dư gốc")

    # 3. Biến động số dư lớn so với amount
    if amount > 0 and abs(bdiff_org - amount) / amount >= 0.2:
        reasons.append("Mức chênh lệch số dư gốc không phù hợp với amount")
    if amount > 0 and abs(bdiff_dest - amount) / amount >= 0.2:
        reasons.append("Mức chênh lệch số dư đích không phù hợp với amount")

    # 4. Loại giao dịch
    if features.get('type_CASH_OUT', 0) > 0:
        reasons.append("Loại giao dịch là CASH_OUT (rút tiền mặt), thường liên quan fraud")
    if features.get('type_TRANSFER', 0) > 0:
        reasons.append("Loại giao dịch là TRANSFER (chuyển khoản), rủi ro cao")

    # Nếu quá nhiều lý do, giữ 3 lý do quan trọng nhất
    unique_reasons = []
    for r in reasons:
        if r not in unique_reasons:
            unique_reasons.append(r)

    if prediction == 0 and not unique_reasons:
        return ["Không phát hiện dấu hiệu bất thường"]

    return unique_reasons[:3]

if __name__ == "__main__":
    # Demo preprocessing
    preprocessor = FraudDetectionPreprocessor()

    print("=== DEMO PREPROCESSING ===")
    X_train, X_test, y_train, y_test, feature_names = preprocessor.preprocess_training()

    print("\n=== PREPROCESSING RESULTS ===")
    print(f"X_train shape: {X_train.shape}")
    print(f"X_test shape: {X_test.shape}")
    print(f"y_train shape: {y_train.shape}")
    print(f"y_test shape: {y_test.shape}")
    print(f"Feature names: {feature_names}")
    print(f"Train target distribution: {pd.Series(y_train).value_counts()}")
    print(f"Test target distribution: {pd.Series(y_test).value_counts()}")