"""Backward-compatibility shim - canonical code lives in ml.pipeline.data_loading."""

import os, sys
_PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if _PROJECT_ROOT not in sys.path:
    sys.path.insert(0, _PROJECT_ROOT)

from ml.pipeline.data_loading import load_data  # noqa: F401

__all__ = ["load_data"]
if __name__ == "__main__":
    df = load_data("data/paysim.csv")  # sửa path đúng file của bạn
    count_step_1 = (df["step"] == 1).sum()
    print(f"số lương giao dịch có step = 1: {count_step_1}")
    unique_steps = df["step"].unique()
    unique_steps.sort()
    print(f"các giá trị duy nhất của step: {unique_steps}")
    # mỗi số xuất hiện bao nhiêu lần trong tập dữ liệu
    print(df["step"].value_counts())
    print(df.head())
    print(df.shape)