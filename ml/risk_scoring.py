"""Backward-compatibility shim - canonical code lives in ml.risk.risk_scoring."""

import os, sys
_PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if _PROJECT_ROOT not in sys.path:
    sys.path.insert(0, _PROJECT_ROOT)

from ml.risk.risk_scoring import RiskScorer, RiskThresholds  # noqa: F401

__all__ = ["RiskScorer", "RiskThresholds"]

if __name__ == "__main__":
    print("--- Test RiskThresholds mặc định ---")
    thresholds = RiskThresholds()
    print(f"[OK] decision_threshold={thresholds.decision_threshold}")
    print(f"[OK] high_risk_threshold={thresholds.high_risk_threshold}")

    print("\n--- Test RiskScorer ---")
    scorer = RiskScorer(thresholds)
    test_probs = [0.05, 0.20, 0.40, 0.60, 0.85, 0.99]
    print(f"{'Xác suất':>12} | {'score':>8} | {'risk_level':>10}")
    print("-" * 40)
    for p in test_probs:
        out = scorer.score_output(p)
        print(f"{p:>12.2f} | {out['risk_score']:>8.4f} | {out['risk_level']:>10}")

    print("\n--- Test RiskThresholds tùy chỉnh ---")
    custom = RiskThresholds(decision_threshold=0.5, high_risk_threshold=0.9)
    scorer2 = RiskScorer(custom)
    for p in test_probs:
        out = scorer2.score_output(p)
        print(f"{p:>12.2f} => {out['risk_level']}")
