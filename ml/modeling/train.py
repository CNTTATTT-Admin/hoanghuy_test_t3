
from __future__ import annotations

import os
import sys
import warnings
from typing import Any, Dict, List

import numpy as np
import pandas as pd
from sklearn.model_selection import TimeSeriesSplit

# LightGBM auto-generates feature names during fit(); sklearn validation then
# warns when predict() receives a plain numpy array without those names.
# The results are identical — suppress the cosmetic noise.
warnings.filterwarnings(
    "ignore",
    message="X does not have valid feature names",
    category=UserWarning,
)

# ── Path setup (support running as a script from any directory) ───────────────
_HERE = os.path.dirname(os.path.abspath(__file__))
_PROJECT_ROOT = os.path.dirname(os.path.dirname(_HERE))
_DEFAULT_MODEL_DIR = os.path.join(_PROJECT_ROOT, "models")
if _PROJECT_ROOT not in sys.path:
    sys.path.insert(0, _PROJECT_ROOT)

from ml.config.config_runtime import load_config
from ml.inference.safe_feature_engineering import (
    SAFE_TIME_FEATURE_COLUMNS,
    create_safe_time_features,
)
from ml.modeling.calibration import ProbabilityCalibrator
from ml.modeling.evaluate import ModelEvaluator, _expected_calibration_error
from ml.modeling.model_registry import ArtifactBundle, ArtifactRegistry
from ml.pipeline.preprocessing import FraudDetectionPreprocessor
from ml.risk.thresholding import ThresholdOptimizer
from ml.utils.helpers import get_logger

logger = get_logger("ml.train")


# ── Helpers ───────────────────────────────────────────────────────────────────

def _add_behavioral_features(df) -> "pd.DataFrame":
    """Pre-compute behavioural features on a *full* (non-downsampled) frame.

    Must be called BEFORE down-sampling so that every user's history reflects
    the real transaction density, not the skewed density created by majority
    class removal.
    """
    if {"step", "nameOrig", "amount"}.issubset(df.columns):
        if not set(SAFE_TIME_FEATURE_COLUMNS).issubset(df.columns):
            return create_safe_time_features(df)
    return df


# ── Model factory ─────────────────────────────────────────────────────────────

def _build_model(y_train: np.ndarray = None, random_state: int = 42):
    """Return a LightGBM classifier.

    Training data is pre-downsampled upstream.  A modest scale_pos_weight
    is applied on top to further boost fraud signal in the loss function
    without collapsing precision (validated empirically).
    """
    import lightgbm as lgb

    return lgb.LGBMClassifier(
        n_estimators=600,
        max_depth=7,
        learning_rate=0.03,
        num_leaves=50,
        subsample=0.75,
        colsample_bytree=0.75,
        min_child_samples=50,
        reg_alpha=0.3,
        reg_lambda=1.5,
        min_gain_to_split=0.01,
        random_state=random_state,
        n_jobs=-1,
        verbose=-1,
    )


# ── Core training steps ───────────────────────────────────────────────────────

def _train_model(
    X_train: np.ndarray,
    y_train: np.ndarray,
    X_val: np.ndarray = None,
    y_val: np.ndarray = None,
    random_state: int = 42,
):
    import lightgbm as lgb

    logger.info("Fitting LightGBM classifier …")
    model = _build_model(y_train, random_state=random_state)

    fit_kwargs: Dict[str, Any] = {}
    if X_val is not None and y_val is not None:
        fit_kwargs["eval_set"] = [(X_val, y_val)]
        fit_kwargs["eval_metric"] = "binary_logloss"
        fit_kwargs["callbacks"] = [
            lgb.early_stopping(50, verbose=True),
            lgb.log_evaluation(50),
        ]
        logger.info("Early stopping enabled (patience=50).")

    model.fit(X_train, y_train, **fit_kwargs)
    logger.info("Model fitted  (n_estimators used: %d).", model.n_estimators_
                if hasattr(model, 'n_estimators_') else model.n_estimators)
    return model


def _fit_calibration(
    model,
    X_val: np.ndarray,
    y_val: np.ndarray,
    method: str,
    random_state: int = 42,
) -> ProbabilityCalibrator:
    raw_probs = model.predict_proba(X_val)[:, 1]
    calibrator = ProbabilityCalibrator(method=method, random_state=random_state)
    calibrator.fit(raw_probs, y_val)
    logger.info("Calibration fitted (method=%s)", calibrator.method)
    return calibrator


def _calibrated_probs(
    model,
    calibrator: ProbabilityCalibrator,
    X: np.ndarray,
) -> np.ndarray:
    return calibrator.transform(model.predict_proba(X)[:, 1])


def _fit_calibration_with_guard(
    model,
    X_calib: np.ndarray,
    y_calib: np.ndarray,
    X_guard: np.ndarray,
    y_guard: np.ndarray,
    method: str,
    random_state: int,
) -> tuple[ProbabilityCalibrator, Dict[str, Dict[str, float]]]:
    raw_calib = model.predict_proba(X_calib)[:, 1]
    raw_guard = model.predict_proba(X_guard)[:, 1]

    calibrator = _fit_calibration(
        model,
        X_calib,
        y_calib,
        method=method,
        random_state=random_state,
    )
    calibrated_calib = calibrator.transform(raw_calib)
    calibrated_guard = calibrator.transform(raw_guard)

    evaluator = ModelEvaluator()
    report = {
        "calibration_set": evaluator.calibration_report(
            y_calib, raw_calib, calibrated_calib, label="calibration set"
        ),
        "threshold_set": evaluator.calibration_report(
            y_guard, raw_guard, calibrated_guard, label="threshold set"
        ),
    }

    if (
        not report["calibration_set"]["improved"]
        or not report["threshold_set"]["improved"]
    ):
        logger.warning(
            "Calibration worsened ECE; falling back to raw probabilities (method=none)."
        )
        return ProbabilityCalibrator(method="none", random_state=random_state), report

    return calibrator, report


def _split_validation_in_half(val_raw):
    """Tách validation set thành 2 nửa theo thứ tự thời gian (step).

    - Nửa đầu (calib_raw)  → dùng để fit calibrator.
    - Nửa sau (thr_raw)    → dùng để tối ưu threshold.

    Tách theo temporal order để tránh leakage chéo giữa 2 tập.
    """
    ordered = val_raw.sort_values("step").reset_index(drop=True)
    cut = max(1, len(ordered) // 2)
    return ordered.iloc[:cut].copy(), ordered.iloc[cut:].copy()


# ── Temporal back-test ────────────────────────────────────────────────────────

def _temporal_backtest(
    preprocessor: FraudDetectionPreprocessor,
    train_base_raw,  # raw DataFrame
    cfg,
    folds: int,
    random_state: int,
) -> Dict[str, Any]:
    """Run TimeSeriesSplit back-test over the raw training window.

    Each fold trains on earlier data and evaluates on later data,
    giving a realistic estimate of out-of-time generalisation.
    """
    logger.info("=== TEMPORAL BACK-TEST  (%d folds) ===", folds)
    ordered = train_base_raw.sort_values("step").reset_index(drop=True)

    # Pre-compute behavioural features on the full training window so every
    # fold's train/val/test slices inherit correct per-user history.
    ordered = _add_behavioral_features(ordered)

    splitter = TimeSeriesSplit(n_splits=folds)
    evaluator = ModelEvaluator()
    optimizer = ThresholdOptimizer()
    fold_metrics: List[Dict[str, float]] = []

    for fold_idx, (hist_idx, test_idx) in enumerate(splitter.split(ordered), start=1):
        fold_history = ordered.iloc[hist_idx].copy()
        fold_test_raw = ordered.iloc[test_idx].copy()

        fold_train_raw, fold_val_raw = preprocessor.temporal_train_validation_split(
            fold_history,
            validation_size=cfg.calibration_validation_size,
        )

        fold_amount_threshold, fold_amount_clip_value = preprocessor.compute_amount_parameters(
            fold_train_raw,
            random_state=random_state,
        )

        fold_train_sampled = preprocessor._downsample_training_frame(
            fold_train_raw,
            negative_multiplier=cfg.train_negative_multiplier,
            random_state=random_state,
        )
        # Tách fold_val_raw → calib (fit calibrator) / thr (optimize threshold)
        fold_calib_raw, fold_thr_raw = _split_validation_in_half(fold_val_raw)

        X_tr, X_calib, y_tr, y_calib, _, artifacts = preprocessor.fit_transform_train_eval(
            fold_train_sampled,
            fold_calib_raw,
            persist_artifacts=False,
            amount_threshold=fold_amount_threshold,
            amount_clip_value=fold_amount_clip_value,
            random_state=random_state,
        )
        X_fold_thr, y_fold_thr = preprocessor.transform_raw_frame_with_artifacts(
            fold_thr_raw, artifacts
        )

        fold_model = _train_model(
            X_tr, y_tr,
            X_val=X_calib, y_val=y_calib,
            random_state=random_state,
        )
        fold_cal, _ = _fit_calibration_with_guard(
            fold_model,
            X_calib,
            y_calib,
            X_fold_thr,
            y_fold_thr,
            method=cfg.calibration_method,
            random_state=random_state,
        )
        fold_thr_probs = _calibrated_probs(fold_model, fold_cal, X_fold_thr)
        fold_thr = optimizer.find_best(
            fold_thr_probs,
            y_fold_thr,
            strategy=cfg.threshold_selection,
            fallback=cfg.prediction_threshold,
            target_recall=getattr(cfg, "target_recall", 0.7),
        )

        X_fold_test, y_fold_test = preprocessor.transform_raw_frame_with_artifacts(
            fold_test_raw, artifacts
        )
        fold_probs = _calibrated_probs(fold_model, fold_cal, X_fold_test)
        metrics = evaluator.evaluate(y_fold_test, fold_probs, fold_thr, label=f"backtest fold {fold_idx}")
        fold_metrics.append(
            {k: metrics[k] for k in ("precision", "recall", "f1_score", "roc_auc")}
        )

    evaluator.print_backtest_summary(fold_metrics)
    summary: Dict[str, Any] = {"folds": fold_metrics}
    for key in ("precision", "recall", "f1_score", "roc_auc"):
        vals = [f[key] for f in fold_metrics]
        summary[f"{key}_mean"] = float(np.mean(vals))
        summary[f"{key}_std"] = float(np.std(vals))
    return summary


# ── Main orchestrator ─────────────────────────────────────────────────────────

def train_and_evaluate(
    model_dir: str = None,
    versioned: bool = False,
) -> Dict[str, Any]:
    """Full training run: data → artifacts → metrics.

    Args:
        model_dir: Directory where artifacts will be written.
                   Defaults to ``<project_root>/models``.
        versioned: Pass ``True`` to write to a timestamped sub-folder and keep
                   a ``latest/`` copy (useful for CI/CD pipelines).

    Returns:
        Dict with keys ``backtest_results``, ``evaluation``, ``n_features``,
        ``calibration_method``, ``prediction_threshold``.
    """
    if model_dir is None:
        model_dir = _DEFAULT_MODEL_DIR
    logger.info("=== FRAUD DETECTION TRAINING STARTED ===")
    cfg = load_config()
    preprocessor = FraudDetectionPreprocessor(model_dir=model_dir)
    registry = ArtifactRegistry(model_dir=model_dir, versioned=versioned)
    evaluator = ModelEvaluator()
    optimizer = ThresholdOptimizer()

    # 1. Primary split
    train_base_raw, test_raw = preprocessor.load_base_split_frames()

    # 1b. Pre-compute behavioural features on FULL data before any down-sampling.
    # This ensures every user's history reflects real transaction density.
    logger.info("Computing behavioural features on full training window (%d rows) …", len(train_base_raw))
    train_base_raw = _add_behavioral_features(train_base_raw)
    test_raw = _add_behavioral_features(test_raw)

    # 2. Temporal split + down-sample
    model_train_raw, validation_raw = preprocessor.temporal_train_validation_split(
        train_base_raw, validation_size=cfg.calibration_validation_size
    )

    # 3. Compute amount_threshold from UNDOWNSAMPLED training data.
    #    If computed from downsampled data (1:10 fraud ratio), the 95th percentile
    #    will be skewed upward by fraudulent high-amount transactions.
    logger.info("Computing amount parameters from raw training frame (before downsampling) …")
    amount_threshold, amount_clip_value = preprocessor.compute_amount_parameters(
        model_train_raw,
        random_state=cfg.random_state,
    )
    logger.info("Amount threshold: %.2f", amount_threshold)
    logger.info("Amount clip value: %.2f", amount_clip_value)

    model_train_sampled = preprocessor._downsample_training_frame(
        model_train_raw,
        negative_multiplier=cfg.train_negative_multiplier,
        random_state=cfg.random_state,
    )

    # 4. Tách validation thành 2 nửa độc lập:
    #    calib_raw  → fit calibrator (Platt)
    #    thr_raw    → tối ưu threshold (tránh threshold overfit trên tập calibration)
    calib_raw, thr_raw = _split_validation_in_half(validation_raw)

    # 5. Fit preprocessor trên train, transform calib split
    X_train, X_calib, y_train, y_calib, feature_names, artifacts = preprocessor.fit_transform_train_eval(
        model_train_sampled,
        calib_raw,
        persist_artifacts=True,
        amount_threshold=amount_threshold,
        amount_clip_value=amount_clip_value,
        random_state=cfg.random_state,
    )
    # Transform threshold split bằng artifacts đã fit (không fit lại)
    X_thr, y_thr = preprocessor.transform_raw_frame_with_artifacts(thr_raw, artifacts)

    # 5. Train model (early stopping on calibration split)
    model = _train_model(
        X_train, y_train,
        X_val=X_calib, y_val=y_calib,
        random_state=cfg.random_state,
    )

    # 5b. Feature importance validation — phát hiện PaySim artifacts / leakage
    importances = model.feature_importances_
    total_imp = float(sum(importances))
    logger.info("=== FEATURE IMPORTANCE ===")
    for fname, imp in sorted(zip(feature_names, importances), key=lambda x: -x[1]):
        pct = 100.0 * imp / total_imp if total_imp > 0 else 0.0
        logger.info("  %-40s  %.4f  (%.1f%%)", fname, imp, pct)
        if total_imp > 0 and imp / total_imp > 0.50:
            logger.warning(
                "Feature '%s' chiếm %.1f%% total importance — "
                "có thể là data leakage hoặc PaySim artifact!",
                fname, pct,
            )

    # 6. Calibration — fit trên calib split
    calibrator, calibration_report = _fit_calibration_with_guard(
        model,
        X_calib,
        y_calib,
        X_thr,
        y_thr,
        method=cfg.calibration_method,
        random_state=cfg.random_state,
    )

    # 7. Threshold optimisation — optimize trên thr split (độc lập với calib split)
    thr_probs = _calibrated_probs(model, calibrator, X_thr)
    threshold = optimizer.find_best(
        thr_probs, y_thr,
        strategy=cfg.threshold_selection,
        fallback=cfg.prediction_threshold,
        target_recall=getattr(cfg, "target_recall", 0.7),
    )
    logger.info("Optimal threshold: %.4f  (strategy=%s)", threshold, cfg.threshold_selection)
    threshold_evaluation = evaluator.evaluate(y_thr, thr_probs, threshold, label="threshold set")
    evaluator.evaluate_robustness(y_thr, thr_probs, label="threshold set")
    logger.info(
        "Threshold-set summary: threshold=%.4f  alert_rate=%.4f  precision=%.4f  recall=%.4f",
        threshold,
        threshold_evaluation["alert_rate"],
        threshold_evaluation["precision"],
        threshold_evaluation["recall"],
    )

    # 7. Temporal back-test
    backtest_results = _temporal_backtest(
        preprocessor, train_base_raw, cfg, folds=cfg.temporal_backtest_folds,
        random_state=cfg.random_state,
    )

    # 8. Final test evaluation
    X_test, y_test = preprocessor.preprocess_evaluation_frame(test_raw)
    raw_test_probs = model.predict_proba(X_test)[:, 1]
    test_probs = calibrator.transform(raw_test_probs)
    calibration_report["test_set"] = evaluator.calibration_report(
        y_test,
        raw_test_probs,
        test_probs,
        label="test set",
    )
    evaluation = evaluator.evaluate(y_test, test_probs, threshold, label="test set")

    # 8b. Robustness diagnostics — surface overconfidence / probability collapse
    robustness = evaluator.evaluate_robustness(y_test, test_probs, label="test set")

    # 9. Persist everything
    bundle = ArtifactBundle(
        model=model,
        preprocessor=preprocessor._load_preprocessor(),
        calibrator=calibrator,
        threshold=threshold,
        # Persist raw input schema expected by ColumnTransformer, not one-hot names.
        feature_columns=list(artifacts["feature_cols"]),
        amount_threshold=preprocessor._load_amount_threshold(),
        amount_clip_value=preprocessor._load_amount_clip_value(),
    )
    registry.save(bundle)

    # Lưu population statistics cho cold-start imputation
    import joblib as _jl
    try:
        _pop_stats = {}
        for _col_name in SAFE_TIME_FEATURE_COLUMNS:
            if _col_name in model_train_raw.columns:
                _vals = model_train_raw[_col_name].dropna()
                _pop_stats[f"{_col_name}_median"] = float(_vals.median())
                _pop_stats[f"{_col_name}_mean"] = float(_vals.mean())
                _pop_stats[f"{_col_name}_p25"] = float(_vals.quantile(0.25))
                _pop_stats[f"{_col_name}_p75"] = float(_vals.quantile(0.75))
        _pop_path = os.path.join(model_dir, "population_stats.pkl")
        _jl.dump(_pop_stats, _pop_path)
        logger.info("Population stats saved → %s (%d keys)", _pop_path, len(_pop_stats))
    except Exception as _pop_exc:
        logger.warning("Population stats saving failed (non-critical): %s", _pop_exc)

    # Lưu reference statistics cho drift monitoring
    # Dùng model_train_raw (raw features) để khớp với inference_history.input
    try:
        from datetime import datetime as _dt
        from ml.monitoring.reference_stats import ReferenceStatsCollector as _RSC

        _model_version = _dt.utcnow().strftime("v_%Y%m%d_%H%M%S")
        _col = _RSC()
        # Tính prediction scores trên training set để lưu score histogram
        _train_raw_scores = calibrator.transform(model.predict_proba(X_train)[:, 1])
        # Dùng X_train numpy + feature_names để reference stats có đủ engineered features
        _ref_stats = _col.compute(
            pd.DataFrame(X_train, columns=feature_names),
            y_train,
            model_version=_model_version,
            prediction_scores=_train_raw_scores,
        )
        # Bổ sung stats cho raw 'amount' và 'type' từ model_train_raw (khớp với inference_history.input)
        if "amount" not in _ref_stats["features"] and "amount" in model_train_raw.columns:
            _ref_stats["features"]["amount"] = _col._compute_numerical_stats(
                model_train_raw["amount"].dropna().values.astype(float)
            )
        if "type" not in _ref_stats["features"] and "type" in model_train_raw.columns:
            _ref_stats["features"]["type"] = _col._compute_categorical_stats(
                model_train_raw["type"]
            )
        # fraud_rate từ raw (không downsampled) — gần thực tế hơn
        _n_raw = len(model_train_raw)
        _p_raw = float(model_train_raw["isFraud"].mean())
        _ref_stats["fraud_rate"]       = _p_raw
        _ref_stats["fraud_rate_std"]   = float(np.sqrt(_p_raw * (1 - _p_raw) / max(_n_raw, 1)))
        _ref_stats["n_training"]       = _n_raw

        _stats_path = os.path.join(model_dir, "reference_stats_latest.json")
        _col.save_to_json(_ref_stats, _stats_path)
        logger.info("Reference stats saved → %s (version=%s)", _stats_path, _model_version)
    except Exception as _ref_exc:
        logger.warning("Reference stats saving failed (non-critical): %s", _ref_exc)

    return {
        "backtest_results": backtest_results,
        "evaluation": evaluation,
        "threshold_evaluation": threshold_evaluation,
        "robustness": robustness,
        "calibration_report": calibration_report,
        "n_features": len(feature_names),
        "calibration_method": calibrator.method,
        "prediction_threshold": threshold,
    }


# ── Script entry point ────────────────────────────────────────────────────────

if __name__ == "__main__":
    summary = train_and_evaluate()
    logger.info("=== TRAINING COMPLETE ===")
    logger.info("Features        : %d", summary["n_features"])
    logger.info("Calibration     : %s", summary["calibration_method"])
    logger.info("Threshold       : %.4f", summary["prediction_threshold"])
    ev = summary["evaluation"]
    logger.info(
        "Test metrics    : Precision=%.4f  Recall=%.4f  F1=%.4f  ROC-AUC=%.4f",
        ev["precision"], ev["recall"], ev["f1_score"], ev["roc_auc"],
    )
