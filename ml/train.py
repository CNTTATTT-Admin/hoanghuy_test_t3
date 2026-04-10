"""Backward-compatibility shim - canonical code lives in ml.modeling.train."""

import os, sys
_PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if _PROJECT_ROOT not in sys.path:
    sys.path.insert(0, _PROJECT_ROOT)

from ml.modeling.train import train_and_evaluate  # noqa: F401

__all__ = ["train_and_evaluate"]

if __name__ == "__main__":
    print("=" * 50)
    print("[TEST] Bắt đầu huấn luyện model fraud detection...")
    print("=" * 50)
    summary = train_and_evaluate()

    print("\n" + "=" * 50)
    print("=== TRAINING COMPLETE ===")
    print("=" * 50)
    print(f"[OK] Số features     : {summary['n_features']}")
    print(f"[OK] Threshold       : {summary['prediction_threshold']:.4f}")

    ev = summary['evaluation']
    print(f"\n--- Kết quả trên tập Test ---")
    print(f"  Precision : {ev['precision']:.4f}")
    print(f"  Recall    : {ev['recall']:.4f}")
    print(f"  F1 Score  : {ev['f1_score']:.4f}")
    print(f"  ROC AUC   : {ev['roc_auc']:.4f}")

    if 'val_evaluation' in summary:
        val = summary['val_evaluation']
        print(f"\n--- Kết quả trên tập Validation ---")
        print(f"  Precision : {val['precision']:.4f}")
        print(f"  Recall    : {val['recall']:.4f}")
        print(f"  F1 Score  : {val['f1_score']:.4f}")
        print(f"  ROC AUC   : {val['roc_auc']:.4f}")
