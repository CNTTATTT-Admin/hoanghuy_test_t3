"""Backward-compatibility shim - canonical code lives in ml.pipeline.preprocessing."""

import os, sys
_PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if _PROJECT_ROOT not in sys.path:
    sys.path.insert(0, _PROJECT_ROOT)

from ml.pipeline.feature_engineering import drop_post_transaction_columns, prepare_features_and_target
from ml.pipeline.preprocessing import FraudDetectionPreprocessor  # noqa: F401

__all__ = ["FraudDetectionPreprocessor"]

if __name__ == "__main__":
    import os

    DATA_PATH = os.path.join(_PROJECT_ROOT, "data", "paysim.csv")
    MODEL_DIR = os.path.join(_PROJECT_ROOT, "models")
    print(f"[TEST] Khởi tạo FraudDetectionPreprocessor")
    print(f"       data_path  = {DATA_PATH}")
    print(f"       model_dir  = {MODEL_DIR}")

    preprocessor = FraudDetectionPreprocessor(data_path=DATA_PATH, model_dir=MODEL_DIR)
    print("[OK] Khởi tạo thành công")

    # Test load raw split
    print("\n--- Test load_base_split_frames ---")
    train_df, test_df = preprocessor.load_base_split_frames()
    print(f"[OK] train_df: {train_df.shape} | test_df: {test_df.shape}")
    print(f"[OK] Fraud trong train: {train_df['isFraud'].mean():.4%}")
    print(f"[OK] Fraud trong test:  {test_df['isFraud'].mean():.4%}")

    # Test temporal validation split
    print("\n--- Test temporal_train_validation_split ---")
    model_train, val_df = preprocessor.temporal_train_validation_split(train_df)
    print(f"[OK] model_train: {model_train.shape} | val_df: {val_df.shape}")

    #leakage columns
    print("\n--- Test drop_post_transaction_columns ---")
    X_train, y_train = prepare_features_and_target(train_df)
    X_train = drop_post_transaction_columns(X_train)
    print(X_train.columns)
