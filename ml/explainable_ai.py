"""Backward-compatibility shim - canonical code lives in ml.explainability.explainable_ai."""

import os, sys
_PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if _PROJECT_ROOT not in sys.path:
    sys.path.insert(0, _PROJECT_ROOT)

from ml.explainability.explainable_ai import FraudExplainer  # noqa: F401

__all__ = ["FraudExplainer"]

if __name__ == "__main__":
    from ml.pipeline.feature_engineering import REALTIME_SAFE_FEATURE_COLUMNS

    explainer = FraudExplainer(feature_names=REALTIME_SAFE_FEATURE_COLUMNS)
    print(f"[OK] FraudExplainer khởi tạo với {len(explainer.feature_names)} features")

    # Các scenario test
    test_cases = [
        {
            "label": "TRANSFER lớn đến tài khoản rỗng (xác suất cao)",
            "probability": 0.87,
            "threshold": 0.35,
            "features": {"type": "TRANSFER", "amount_threshold_ratio": 2.1, "dest_is_empty": 1},
        },
        {
            "label": "CASH_OUT nhỏ, tài khoản đích có số dư (xác suất vừa)",
            "probability": 0.42,
            "threshold": 0.35,
            "features": {"type": "CASH_OUT", "amount_threshold_ratio": 0.3, "dest_is_empty": 0},
        },
        {
            "label": "PAYMENT thông thường (xác suất thấp)",
            "probability": 0.08,
            "threshold": 0.35,
            "features": {"type": "PAYMENT", "amount_threshold_ratio": 0.1, "dest_is_empty": 0},
        },
    ]

    print()
    for case in test_cases:
        reasons = explainer.explain(
            probability=case["probability"],
            decision_threshold=case["threshold"],
            feature_frame=case["features"],
        )
        print(f"--- {case['label']} (p={case['probability']}) ---")
        for r in reasons:
            print(f"  * {r}")
        print()
