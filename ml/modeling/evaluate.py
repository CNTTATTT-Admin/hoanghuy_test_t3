"""Model evaluation utilities: metrics computation and report generation."""

from __future__ import annotations

from typing import Any, Dict, List

import numpy as np
from sklearn.metrics import (
    average_precision_score,
    classification_report,
    confusion_matrix,
    f1_score,
    precision_recall_curve,
    precision_recall_fscore_support,
    roc_auc_score,
)


def _expected_calibration_error(
    y_true: np.ndarray, y_prob: np.ndarray, n_bins: int = 10
) -> float:
    """Compute Expected Calibration Error (ECE).

    Measures how well calibrated probabilities match observed frequencies.
    Lower is better; < 0.05 is considered well-calibrated.
    """
    bin_boundaries = np.linspace(0.0, 1.0, n_bins + 1)
    ece = 0.0
    total = len(y_true)
    if total == 0:
        return 0.0
    for i in range(n_bins):
        mask = (y_prob >= bin_boundaries[i]) & (y_prob < bin_boundaries[i + 1])
        count = int(mask.sum())
        if count == 0:
            continue
        bin_acc = float(y_true[mask].mean())
        bin_conf = float(y_prob[mask].mean())
        ece += count * abs(bin_acc - bin_conf)
    return ece / total


class ModelEvaluator:
    """Evaluate a trained model on a labelled dataset and return structured metrics.

    The evaluator is stateless — it takes predictions/probabilities as inputs
    and returns plain Python data structures, making it easy to log, serialise,
    or compare across runs.
    """

    def evaluate(
        self,
        y_true: np.ndarray,
        probabilities: np.ndarray,
        threshold: float,
        label: str = "test",
    ) -> Dict[str, Any]:
        """Compute and print classification metrics.

        Args:
            y_true:        Ground-truth binary labels.
            probabilities: Calibrated fraud probabilities.
            threshold:     Decision boundary used to convert probabilities to
                           binary predictions.
            label:         Human-readable name for this evaluation (used in
                           print output).

        Returns:
            Dict with keys: ``precision``, ``recall``, ``f1_score``,
            ``roc_auc``, ``threshold``, ``confusion_matrix``,
            ``classification_report``, ``alert_rate``, ``ece``,
            ``average_precision``, ``pr_curve``.
        """
        predictions = (probabilities >= threshold).astype(int)
        precision, recall, f1, _ = precision_recall_fscore_support(
            y_true, predictions, average="binary", zero_division=0
        )
        roc_auc = roc_auc_score(y_true, probabilities)
        cm = confusion_matrix(y_true, predictions)

        # Alert rate: fraction of all transactions flagged as fraud
        alert_rate = float(predictions.mean())

        # Expected Calibration Error
        ece = _expected_calibration_error(y_true, probabilities)

        # Precision-Recall curve
        pr_precisions, pr_recalls, pr_thresholds = precision_recall_curve(
            y_true, probabilities
        )
        avg_precision = average_precision_score(y_true, probabilities)

        results: Dict[str, Any] = {
            "precision": float(precision),
            "recall": float(recall),
            "f1_score": float(f1),
            "roc_auc": float(roc_auc),
            "threshold": float(threshold),
            "confusion_matrix": cm.tolist(),
            "classification_report": classification_report(
                y_true, predictions, output_dict=True, zero_division=0
            ),
            "alert_rate": alert_rate,
            "ece": ece,
            "average_precision": float(avg_precision),
            "pr_curve": {
                "precisions": pr_precisions.tolist(),
                "recalls": pr_recalls.tolist(),
                "thresholds": pr_thresholds.tolist(),
            },
        }

        print(f"\n=== {label.upper()} EVALUATION ===")
        print(f"  Threshold     : {threshold:.4f}")
        print(f"  Precision     : {precision:.4f}")
        print(f"  Recall        : {recall:.4f}")
        print(f"  F1            : {f1:.4f}")
        print(f"  ROC-AUC       : {roc_auc:.4f}")
        print(f"  Avg Precision : {avg_precision:.4f}")
        print(f"  Alert rate    : {alert_rate:.4%} of transactions flagged")
        print(f"  ECE           : {ece:.4f}")
        print(f"  Confusion matrix:\n{cm}")

        return results

    def evaluate_robustness(
        self,
        y_true: np.ndarray,
        probabilities: np.ndarray,
        label: str = "test",
    ) -> Dict[str, Any]:
        """Print probability distribution diagnostics and return a summary.

        This is a *separate* analysis step meant to surface overconfidence,
        probability collapse, and unrealistic separation — symptoms of models
        that have memorised synthetic data rather than learning generalisable
        fraud patterns.
        """
        fraud_probs = probabilities[y_true == 1]
        nonfraud_probs = probabilities[y_true == 0]
        ece = _expected_calibration_error(y_true, probabilities)
        overall_mean = float(np.mean(probabilities)) if len(probabilities) else 0.0
        overall_std = float(np.std(probabilities)) if len(probabilities) else 0.0
        overall_pct_above_095 = float(np.mean(probabilities > 0.95)) if len(probabilities) else 0.0
        overall_pct_below_001 = float(np.mean(probabilities < 0.01)) if len(probabilities) else 0.0

        diag: Dict[str, Any] = {
            "overall_prob_mean": overall_mean,
            "overall_prob_std": overall_std,
            "overall_pct_above_095": overall_pct_above_095,
            "overall_pct_below_001": overall_pct_below_001,
            "fraud_prob_mean": float(np.mean(fraud_probs)) if len(fraud_probs) else 0.0,
            "fraud_prob_median": float(np.median(fraud_probs)) if len(fraud_probs) else 0.0,
            "fraud_prob_std": float(np.std(fraud_probs)) if len(fraud_probs) else 0.0,
            "fraud_pct_above_099": float(np.mean(fraud_probs > 0.99)) if len(fraud_probs) else 0.0,
            "fraud_pct_above_095": float(np.mean(fraud_probs > 0.95)) if len(fraud_probs) else 0.0,
            "nonfraud_prob_mean": float(np.mean(nonfraud_probs)) if len(nonfraud_probs) else 0.0,
            "nonfraud_prob_median": float(np.median(nonfraud_probs)) if len(nonfraud_probs) else 0.0,
            "nonfraud_prob_std": float(np.std(nonfraud_probs)) if len(nonfraud_probs) else 0.0,
            "nonfraud_pct_below_001": float(np.mean(nonfraud_probs < 0.01)) if len(nonfraud_probs) else 0.0,
            "ece": ece,
            "separation_gap": (
                float(np.mean(fraud_probs)) - float(np.mean(nonfraud_probs))
                if len(fraud_probs) and len(nonfraud_probs) else 0.0
            ),
        }

        # Probability percentile breakdown for fraud
        if len(fraud_probs) > 0:
            for p in [10, 25, 50, 75, 90]:
                diag[f"fraud_prob_p{p}"] = float(np.percentile(fraud_probs, p))

        print(f"\n=== {label.upper()} ROBUSTNESS DIAGNOSTICS ===")
        print(f"  Overall probability distribution:")
        print(f"    mean={overall_mean:.6f}  std={overall_std:.6f}")
        print(f"    % with P > 0.95: {overall_pct_above_095:.2%}")
        print(f"    % with P < 0.01: {overall_pct_below_001:.2%}")
        print(f"  Fraud probability distribution:")
        print(f"    mean={diag['fraud_prob_mean']:.4f}  median={diag['fraud_prob_median']:.4f}  std={diag['fraud_prob_std']:.4f}")
        if len(fraud_probs) > 0:
            print(f"    P10={diag['fraud_prob_p10']:.4f}  P25={diag['fraud_prob_p25']:.4f}  P50={diag['fraud_prob_p50']:.4f}  P75={diag['fraud_prob_p75']:.4f}  P90={diag['fraud_prob_p90']:.4f}")
        print(f"    % with P > 0.99: {diag['fraud_pct_above_099']:.2%}")
        print(f"    % with P > 0.95: {diag['fraud_pct_above_095']:.2%}")
        print(f"  Non-fraud probability distribution:")
        print(f"    mean={diag['nonfraud_prob_mean']:.6f}  median={diag['nonfraud_prob_median']:.6f}")
        print(f"    % with P < 0.01: {diag['nonfraud_pct_below_001']:.2%}")
        print(f"  ECE: {ece:.4f}")
        print(f"  Separation gap (fraud mean - nonfraud mean): {diag['separation_gap']:.4f}")

        # Warnings
        warnings = []
        if overall_mean > 0.5:
            warnings.append("SUSPICIOUS PROBABILITY MEAN: overall mean probability > 0.5")
        if overall_std < 0.05:
            warnings.append("PROBABILITY COLLAPSE: overall probability std < 0.05")
        if overall_pct_above_095 > 0.10 or overall_pct_below_001 > 0.95:
            warnings.append("OVERCONFIDENT DISTRIBUTION: too many extreme probabilities")
        if diag["fraud_pct_above_099"] > 0.5:
            warnings.append("PROBABILITY COLLAPSE: >50% of fraud cases have P>0.99 — model is deterministic, not probabilistic")
        if diag["separation_gap"] > 0.95:
            warnings.append("NEAR-PERFECT SEPARATION: gap > 0.95 suggests model memorised synthetic patterns")
        if ece > 0.10:
            warnings.append(f"POOR CALIBRATION: ECE={ece:.4f} — probabilities are unreliable")
        if diag["fraud_prob_std"] < 0.05:
            warnings.append("LOW VARIANCE in fraud probabilities — all fraud looks identical to the model")

        if warnings:
            print(f"  ⚠ WARNINGS:")
            for w in warnings:
                print(f"    - {w}")
        else:
            print(f"  ✓ No robustness warnings — probability distributions look healthy")

        diag["warnings"] = warnings
        return diag

    @staticmethod
    def calibration_report(
        y_true: np.ndarray,
        raw_probabilities: np.ndarray,
        calibrated_probabilities: np.ndarray,
        label: str,
    ) -> Dict[str, float]:
        raw_ece = _expected_calibration_error(y_true, raw_probabilities)
        calibrated_ece = _expected_calibration_error(y_true, calibrated_probabilities)
        print(
            f"{label} calibration ECE: raw={raw_ece:.6f}  calibrated={calibrated_ece:.6f}"
        )
        return {
            "raw_ece": float(raw_ece),
            "calibrated_ece": float(calibrated_ece),
            "improved": bool(calibrated_ece <= raw_ece),
        }

    @staticmethod
    def print_backtest_summary(fold_results: List[Dict[str, float]]) -> None:
        """Print mean ± std across backtest folds."""
        metrics = ["precision", "recall", "f1_score", "roc_auc"]
        print("\n=== TEMPORAL BACKTEST SUMMARY ===")
        for metric in metrics:
            values = [f[metric] for f in fold_results]
            print(f"  {metric:12s}: {np.mean(values):.4f} ± {np.std(values):.4f}")
