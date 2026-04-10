"""Backward-compatibility shim - canonical code lives in ml.pipeline.split."""

import os, sys
_PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if _PROJECT_ROOT not in sys.path:
    sys.path.insert(0, _PROJECT_ROOT)

from ml.pipeline.split import split_data  # noqa: F401

__all__ = ["split_data"]

if __name__ == "__main__":
    import pandas as pd
    import os

    DATA_PATH = os.path.join(_PROJECT_ROOT, "data", "paysim.csv")
    print(f"[TEST] Đọc dữ liệu từ: {DATA_PATH}")
    df = pd.read_csv(DATA_PATH)
    print(f"[TEST] Dữ liệu gốc: {df.shape}")

    for method in ["time_based", "user_based", "hybrid"]:
        print(f"\n--- Test split_data(method='{method}') ---")
        train, test = split_data(df, method=method)
        fraud_train = train["isFraud"].mean()
        fraud_test  = test["isFraud"].mean()
        print(f"[OK] Train: {train.shape} | fraud={fraud_train:.4%}")
        print(f"[OK] Test:  {test.shape}  | fraud={fraud_test:.4%}")
