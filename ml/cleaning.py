"""Backward-compatibility shim - canonical code lives in ml.pipeline.cleaning."""

import os, sys
_PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if _PROJECT_ROOT not in sys.path:
    sys.path.insert(0, _PROJECT_ROOT)

from ml.pipeline.cleaning import handle_missing_values, remove_unnecessary_columns  # noqa: F401

__all__ = ["handle_missing_values", "remove_unnecessary_columns"]

if __name__ == "__main__":
    import pandas as pd
    import os

    # Đường dẫn tới file dữ liệu
    DATA_PATH = os.path.join(_PROJECT_ROOT, "data", "paysim.csv")
    print(f"[TEST] Đọc dữ liệu từ: {DATA_PATH}")
    df = pd.read_csv(DATA_PATH)
    print(f"[TEST] Dữ liệu gốc: {df.shape} rows x cols")
    print(f"[TEST] Cột: {list(df.columns)}")

    # đoạn này để test từng hàm một, bạn có thể chạy lại ml/cleaning.py để xem kết quả của từng hàm đó
    print("\n--- Test handle_missing_values ---")
    df_clean = handle_missing_values(df)
    print(f"[OK] Sau khi xử lý missing: {df_clean.shape}")

    # Test remove_unnecessary_columns dịch sang tiếng việt là "xóa các cột không cần thiết", bạn có thể chạy lại ml/cleaning.py để xem kết quả của hàm này
    print("\n--- Test remove_unnecessary_columns ---")
    df_clean2 = remove_unnecessary_columns(df_clean)
    print(f"[OK] Sau khi xóa cột thừa: {df_clean2.shape}")
    print(f"[OK] Cột còn lại: {list(df_clean2.columns)}")
