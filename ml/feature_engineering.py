"""Backward-compatibility shim - canonical code lives in ml.pipeline.feature_engineering."""

import os, sys
_PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if _PROJECT_ROOT not in sys.path:
    sys.path.insert(0, _PROJECT_ROOT)

from ml.pipeline.feature_engineering import (  # noqa: F401
    REALTIME_SAFE_FEATURE_COLUMNS,
    feature_engineering,
    prepare_features_and_target,
    drop_post_transaction_columns,
)

__all__ = ["REALTIME_SAFE_FEATURE_COLUMNS", "feature_engineering", "prepare_features_and_target", "drop_post_transaction_columns"]

if __name__ == "__main__":
    import pandas as pd
    import os

    DATA_PATH = os.path.join(_PROJECT_ROOT, "data", "paysim.csv")
    print(f"[TEST] Đọc dữ liệu từ: {DATA_PATH}")
    df = pd.read_csv(DATA_PATH)

    # Lấy mẫu nhỏ để test nhanh
    sample = df.sample(n=5000, random_state=42).reset_index(drop=True)
    print(f"[TEST] Mẫu test: {sample.shape}")

    # Test drop_post_transaction_columns dịch sang tiếng việt là "xóa các cột sau giao dịch", bạn có thể chạy lại ml/feature_engineering.py để xem kết quả của hàm này
    print("\n--- Test drop_post_transaction_columns ---")
    df_dropped = drop_post_transaction_columns(sample)
    print(f"[OK] Cột còn sau khi drop leakage: {list(df_dropped.columns)}")

    # Test feature_engineering
    print("\n--- Test feature_engineering (is_training=True) ---") # Khi is_training=True, hàm sẽ tính threshold và clip dựa trên dữ liệu mẫu, sau đó tạo các feature mới 
    df_feat, amount_threshold, amount_clip = feature_engineering(sample, is_training=True)
    print(f"[OK] amount_threshold={amount_threshold:,.2f}, amount_clip={amount_clip:,.2f}")
    print(f"[OK] Features có trong DataFrame: {[c for c in REALTIME_SAFE_FEATURE_COLUMNS if c in df_feat.columns]}")
    print(f"[OK] Shape sau feature engineering: {df_feat.shape}")

    # Test prepare_features_and_target
    print("\n--- Test prepare_features_and_target ---")
    X, y = prepare_features_and_target(df_feat)
    print(f"[OK] X shape: {X.shape}, y shape: {y.shape}")
    print(f"[OK] Tỷ lệ fraud trong mẫu: {y.mean():.4%}")
    print(f"\n[OK] Tất cả test REALTIME_SAFE_FEATURE_COLUMNS = {REALTIME_SAFE_FEATURE_COLUMNS}")

