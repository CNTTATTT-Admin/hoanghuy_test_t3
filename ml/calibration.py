"""Backward-compatibility shim - canonical code lives in ml.modeling.calibration."""

import os, sys
_PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if _PROJECT_ROOT not in sys.path:
    sys.path.insert(0, _PROJECT_ROOT)

from ml.modeling.calibration import ProbabilityCalibrator, CalibrationMethod  # noqa: F401

__all__ = ["ProbabilityCalibrator", "CalibrationMethod"]

if __name__ == "__main__":
    import numpy as np

    # Dữ liệu giả: xác suất thô và nhãn thật
    np.random.seed(42)
    raw_probs = np.concatenate([
        np.random.beta(2, 8, 500),   # xác suất thấp — hầu hết là hợp lệ
        np.random.beta(8, 2, 100),   # xác suất cao  — hầu hết là gian lận
    ])
    y_true = np.array([0] * 500 + [1] * 100)

    for method in ["none", "platt", "isotonic"]:
        print(f"\n--- Test ProbabilityCalibrator(method='{method}') ---")
        cal = ProbabilityCalibrator(method=method)
        cal.fit(raw_probs, y_true)
        calibrated = cal.transform(raw_probs)
        print(f"[OK] Trước calibrate: min={raw_probs.min():.4f} max={raw_probs.max():.4f} mean={raw_probs.mean():.4f}")
        print(f"[OK] Sau  calibrate:  min={calibrated.min():.4f} max={calibrated.max():.4f} mean={calibrated.mean():.4f}")
        single = cal.transform_one(0.6)
        print(f"[OK] transform_one(0.6) => {single:.4f}")
