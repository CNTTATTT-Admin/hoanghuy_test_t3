"""Backward-compatibility shim - canonical code lives in ml.inference.safe_feature_engineering."""

import os, sys
_PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if _PROJECT_ROOT not in sys.path:
    sys.path.insert(0, _PROJECT_ROOT)

from ml.inference.safe_feature_engineering import (  # noqa: F401
    OnlineFeatureState,
    create_safe_time_features,
    SAFE_TIME_FEATURE_COLUMNS,
)

# Re-export drop_post_transaction_columns from its canonical location
from ml.pipeline.feature_engineering import drop_post_transaction_columns  # noqa: F401

__all__ = ["OnlineFeatureState", "create_safe_time_features", "SAFE_TIME_FEATURE_COLUMNS", "drop_post_transaction_columns"]
if __name__ == "__main__":
    print(f"[OK] SAFE_TIME_FEATURE_COLUMNS = {SAFE_TIME_FEATURE_COLUMNS}")

    # Test OnlineFeatureState
    print("\n--- Test OnlineFeatureState (realtime per-user state) ---")
    state = OnlineFeatureState(user_id="C123456")

    # Mô phỏng 5 giao dịch liên tiếp của user C123456
    transactions = [
        (1.0,   500.0,  "M987654"),
        (2.0,   1200.0, "M111222"),
        (5.0,   300.0,  "M987654"),
        (25.0,  8000.0, "C999888"),
        (26.0,  150.0,  "M111222"),
    ]
    for step, amount, counterparty in transactions:
        features = state.compute_features(current_step=step, current_amount=amount)
        state.update(step=step, amount=amount, counterparty=counterparty)
        print(f"  step={step:5.1f} | tx_1h={features['number_of_transactions_last_1h']} "
              f"| total_24h={features['total_amount_last_24h']:,.0f} "
              f"| time_since={features['time_since_last_transaction']:.1f}")

    # Test create_safe_time_features (batch)
    print("\n--- Test create_safe_time_features (batch) ---")
    import pandas as pd
    import os
    DATA_PATH = os.path.join(_PROJECT_ROOT, "data", "paysim.csv")
    df = pd.read_csv(DATA_PATH, nrows=2000)
    df_with_time_feats = create_safe_time_features(df)
    new_cols = [c for c in SAFE_TIME_FEATURE_COLUMNS if c in df_with_time_feats.columns]
    print(f"[OK] Batch shape: {df_with_time_feats.shape}")
    print(f"[OK] Time features đã tạo: {new_cols}")
    print(df_with_time_feats[new_cols].describe().T[["mean", "min", "max"]].to_string())