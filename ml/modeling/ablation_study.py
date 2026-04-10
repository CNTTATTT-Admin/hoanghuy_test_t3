"""Ablation study: compare model performance with/without deterministic features.

Trains two model configurations on the same data split:

  - **Model A (Full)**: All features including balance_ratio_org, is_full_drain
  - **Model B (Hardened)**: Removes near-deterministic features to test whether
    the model has learned generalisable patterns or just memorised synthetic rules.

Run from project root::

    python -m ml.modeling.ablation_study
"""

from __future__ import annotations

import os
import sys
import warnings
from typing import Any, Dict, List, Tuple

import numpy as np

warnings.filterwarnings("ignore", message="X does not have valid feature names", category=UserWarning)

_HERE = os.path.dirname(os.path.abspath(__file__))
_PROJECT_ROOT = os.path.dirname(os.path.dirname(_HERE))
if _PROJECT_ROOT not in sys.path:
    sys.path.insert(0, _PROJECT_ROOT)

from ml.config.config_runtime import load_config
from ml.inference.safe_feature_engineering import SAFE_TIME_FEATURE_COLUMNS, create_safe_time_features
from ml.modeling.calibration import ProbabilityCalibrator
from ml.modeling.evaluate import ModelEvaluator
from ml.pipeline.preprocessing import FraudDetectionPreprocessor
from ml.risk.thresholding import ThresholdOptimizer
from ml.utils.helpers import get_logger

logger = get_logger("ml.ablation")

# Features to ablate — these are near-deterministic fraud proxies in PaySim.
ABLATION_FEATURES = ["balance_ratio_org", "is_full_drain"]


def _add_behavioral_features(df):
    if {"step", "nameOrig", "amount"}.issubset(df.columns):
        if not set(SAFE_TIME_FEATURE_COLUMNS).issubset(df.columns):
            return create_safe_time_features(df)
    return df


def _build_model(y_train: np.ndarray):
    import lightgbm as lgb
    n_neg = int((y_train == 0).sum())
    n_pos = max(int((y_train == 1).sum()), 1)
    return lgb.LGBMClassifier(
        n_estimators=500, max_depth=8, learning_rate=0.05,
        scale_pos_weight=n_neg / n_pos,
        subsample=0.8, colsample_bytree=0.8, min_child_samples=50,
        reg_alpha=0.1, reg_lambda=1.0, random_state=42, n_jobs=-1, verbose=-1,
    )


def _train_variant(
    X_train: np.ndarray,
    X_val: np.ndarray,
    y_train: np.ndarray,
    y_val: np.ndarray,
    X_test: np.ndarray,
    y_test: np.ndarray,
    feature_names: List[str],
    drop_cols: List[str],
    variant_name: str,
    cfg,
) -> Dict[str, Any]:
    """Train one ablation variant and return metrics."""
    # Identify column indices to drop
    drop_indices = [i for i, name in enumerate(feature_names) if name in drop_cols]
    keep_indices = [i for i in range(X_train.shape[1]) if i not in drop_indices]

    X_tr = X_train[:, keep_indices]
    X_vl = X_val[:, keep_indices]
    X_te = X_test[:, keep_indices]
    kept_names = [feature_names[i] for i in keep_indices]

    logger.info("=== %s: %d features (dropped %s) ===", variant_name, len(kept_names), drop_cols or "none")

    model = _build_model(y_train)
    model.fit(X_tr, y_train)

    # Calibration
    raw_probs_val = model.predict_proba(X_vl)[:, 1]
    calibrator = ProbabilityCalibrator(method=cfg.calibration_method)
    calibrator.fit(raw_probs_val, y_val)

    val_probs = calibrator.transform(model.predict_proba(X_vl)[:, 1])
    optimizer = ThresholdOptimizer()
    threshold = optimizer.find_best(
        val_probs, y_val,
        strategy=cfg.threshold_selection,
        fallback=cfg.prediction_threshold,
        target_recall=getattr(cfg, "target_recall", 0.7),
    )

    # Test evaluation
    test_probs = calibrator.transform(model.predict_proba(X_te)[:, 1])
    evaluator = ModelEvaluator()
    metrics = evaluator.evaluate(y_test, test_probs, threshold, label=f"{variant_name}")

    # Probability distribution analysis
    fraud_probs = test_probs[y_test == 1]
    nonfraud_probs = test_probs[y_test == 0]
    metrics["prob_fraud_mean"] = float(np.mean(fraud_probs)) if len(fraud_probs) > 0 else 0.0
    metrics["prob_fraud_std"] = float(np.std(fraud_probs)) if len(fraud_probs) > 0 else 0.0
    metrics["prob_nonfraud_mean"] = float(np.mean(nonfraud_probs)) if len(nonfraud_probs) > 0 else 0.0
    metrics["prob_nonfraud_std"] = float(np.std(nonfraud_probs)) if len(nonfraud_probs) > 0 else 0.0
    metrics["prob_collapse_check"] = (
        float(np.mean(fraud_probs > 0.99)) if len(fraud_probs) > 0 else 0.0
    )
    metrics["n_features"] = len(kept_names)
    metrics["dropped"] = drop_cols

    return metrics


def run_ablation() -> Dict[str, Dict[str, Any]]:
    """Run the full ablation study: Model A (full) vs Model B (hardened)."""
    logger.info("=== ABLATION STUDY STARTED ===")
    cfg = load_config()
    preprocessor = FraudDetectionPreprocessor()

    # 1. Load and split
    train_base_raw, test_raw = preprocessor.load_base_split_frames()
    logger.info("Computing behavioural features …")
    train_base_raw = _add_behavioral_features(train_base_raw)
    test_raw = _add_behavioral_features(test_raw)

    # 2. Temporal split + down-sample
    model_train_raw, validation_raw = preprocessor.temporal_train_validation_split(
        train_base_raw, validation_size=cfg.calibration_validation_size
    )
    model_train_sampled = preprocessor._downsample_training_frame(
        model_train_raw,
        negative_multiplier=cfg.train_negative_multiplier,
        random_state=cfg.random_state,
    )

    # 3. Fit preprocessor
    X_train, X_val, y_train, y_val, feature_names, artifacts = preprocessor.fit_transform_train_eval(
        model_train_sampled, validation_raw, persist_artifacts=False
    )
    X_test, y_test = preprocessor.transform_raw_frame_with_artifacts(test_raw, artifacts)

    # 4. Model A: full features
    model_a = _train_variant(
        X_train, X_val, y_train, y_val, X_test, y_test,
        feature_names, drop_cols=[], variant_name="Model A (Full)", cfg=cfg,
    )

    # 5. Model B: remove deterministic features
    model_b = _train_variant(
        X_train, X_val, y_train, y_val, X_test, y_test,
        feature_names, drop_cols=ABLATION_FEATURES, variant_name="Model B (Hardened)", cfg=cfg,
    )

    # 6. Print comparison
    _print_comparison(model_a, model_b)

    return {"model_a": model_a, "model_b": model_b}


def _print_comparison(a: Dict, b: Dict) -> None:
    """Print a clean comparison table."""
    print("\n" + "=" * 72)
    print("  ABLATION STUDY: Model A (Full) vs Model B (Hardened)")
    print("  Hardened model drops:", ABLATION_FEATURES)
    print("=" * 72)
    header = f"  {'Metric':<25s} {'Model A':>12s} {'Model B':>12s} {'Delta':>12s}"
    print(header)
    print("  " + "-" * 61)

    keys = [
        ("n_features", "Features"),
        ("threshold", "Threshold"),
        ("precision", "Precision"),
        ("recall", "Recall"),
        ("f1_score", "F1"),
        ("roc_auc", "ROC-AUC"),
        ("average_precision", "Avg Precision"),
        ("alert_rate", "Alert rate"),
        ("ece", "ECE"),
        ("prob_fraud_mean", "P(fraud) mean"),
        ("prob_fraud_std", "P(fraud) std"),
        ("prob_nonfraud_mean", "P(non-fraud) mean"),
        ("prob_nonfraud_std", "P(non-fraud) std"),
        ("prob_collapse_check", "Fraud P>0.99 %"),
    ]
    for key, label in keys:
        va = a.get(key, 0.0)
        vb = b.get(key, 0.0)
        delta = vb - va
        if isinstance(va, int):
            print(f"  {label:<25s} {va:>12d} {vb:>12d} {delta:>+12d}")
        else:
            print(f"  {label:<25s} {va:>12.4f} {vb:>12.4f} {delta:>+12.4f}")

    print("=" * 72)

    # Interpretation
    print("\n  INTERPRETATION:")
    auc_drop = a["roc_auc"] - b["roc_auc"]
    recall_drop = a["recall"] - b["recall"]
    if auc_drop < 0.02 and recall_drop < 0.05:
        print("  * Model B retains most performance → model is learning real patterns.")
        print("  * Deterministic features provide marginal lift, NOT the sole signal.")
        print("  ➜ RECOMMENDATION: Use Model B (Hardened) for production.")
    elif auc_drop < 0.05:
        print("  * Model B shows moderate degradation → some reliance on proxy features.")
        print("  * Still usable but consider adding more diverse features.")
        print("  ➜ RECOMMENDATION: Use softened features (clipping + noise) as compromise.")
    else:
        print("  * Model B shows significant drop → model is OVER-RELIANT on proxy features.")
        print("  * Original model is essentially a rule-based system wearing an ML mask.")
        print("  ➜ RECOMMENDATION: Invest in better feature engineering before production.")

    collapse_a = a.get("prob_collapse_check", 0)
    if collapse_a > 0.5:
        print(f"\n  ⚠ PROBABILITY COLLAPSE: {collapse_a:.1%} of fraud cases have P > 0.99")
        print("    This indicates deterministic separation — unrealistic for real fraud.")


if __name__ == "__main__":
    run_ablation()
