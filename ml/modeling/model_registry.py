"""Artifact registry: save and load all model artifacts with optional versioning.

An *artifact bundle* is the complete set of objects needed to make predictions:
  - ``model``           — the fitted sklearn estimator
  - ``preprocessor``    — the fitted ``ColumnTransformer``
  - ``calibrator``      — the fitted ``ProbabilityCalibrator``
  - ``threshold``       — the optimised decision threshold (float)
  - ``feature_columns`` — ordered list of input feature names
  - ``amount_threshold``— the 95th-percentile amount cut-off

Versioning
──────────
When ``versioned=True``, artifacts are written to a timestamped sub-directory
(e.g. ``models/v_20260326_143022/``).  A ``models/latest/`` symlink (or copy
on Windows) always points to the most recent version.
Non-versioned saves write directly to *model_dir* for backward compatibility.
"""

from __future__ import annotations

import os
import shutil
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path

# Absolute default model directory
_PROJECT_ROOT = Path(__file__).resolve().parents[2]
_DEFAULT_MODEL_DIR = str(_PROJECT_ROOT / "models")
from typing import List, Optional

import joblib

try:
    from ..modeling.calibration import ProbabilityCalibrator
except ImportError:
    from modeling.calibration import ProbabilityCalibrator


@dataclass
class ArtifactBundle:
    """Container for all artifacts required by the inference pipeline."""

    model: object
    preprocessor: object
    calibrator: ProbabilityCalibrator
    threshold: float
    feature_columns: List[str]
    amount_threshold: float
    amount_clip_value: float = float("inf")
    version: str = "latest"


class ArtifactRegistry:
    """Save and load model artifact bundles.

    Args:
        model_dir: Root directory where artifacts are stored.
        versioned: When ``True``, each save creates a timestamped sub-folder.
    """

    _FILENAMES = {
        "model": "model.pkl",
        "model_named": "fraud_detection_model.pkl",
        "preprocessor": "preprocessor.pkl",
        "calibration": "calibration.pkl",
        "threshold": "threshold.pkl",
        "feature_columns": "feature_columns.pkl",
        "feature_names": "feature_names.pkl",
        "amount_threshold": "amount_threshold.pkl",
        "amount_clip_value": "amount_clip_value.pkl",
        "metadata": "metadata.txt",
    }

    def __init__(self, model_dir: str = None, versioned: bool = False) -> None:
        self.model_dir = Path(model_dir or _DEFAULT_MODEL_DIR)
        self.versioned = versioned
        self.model_dir.mkdir(parents=True, exist_ok=True)

    # ── Save ──────────────────────────────────────────────────────────────

    def save(self, bundle: ArtifactBundle) -> Path:
        """Persist all artifacts in *bundle* and return the save directory.

        If ``versioned=True``, writes to a timestamped sub-directory and
        copies the contents to ``<model_dir>/latest/``.
        """
        if self.versioned:
            version_tag = datetime.now().strftime("v_%Y%m%d_%H%M%S")
            save_dir = self.model_dir / version_tag
        else:
            save_dir = self.model_dir
            version_tag = "latest"

        save_dir.mkdir(parents=True, exist_ok=True)

        # Core artifacts
        joblib.dump(bundle.model, save_dir / self._FILENAMES["model"])
        joblib.dump(bundle.model, save_dir / self._FILENAMES["model_named"])
        joblib.dump(bundle.preprocessor, save_dir / self._FILENAMES["preprocessor"])
        joblib.dump(
            {"method": bundle.calibrator.method, "model": bundle.calibrator.model},
            save_dir / self._FILENAMES["calibration"],
        )
        joblib.dump(bundle.threshold, save_dir / self._FILENAMES["threshold"])
        joblib.dump(bundle.feature_columns, save_dir / self._FILENAMES["feature_columns"])
        joblib.dump(bundle.feature_columns, save_dir / self._FILENAMES["feature_names"])
        joblib.dump(bundle.amount_threshold, save_dir / self._FILENAMES["amount_threshold"])
        joblib.dump(bundle.amount_clip_value, save_dir / self._FILENAMES["amount_clip_value"])

        # Human-readable metadata
        meta_lines = [
            f"version={version_tag}",
            f"saved_at={datetime.now().isoformat()}",
            f"threshold={bundle.threshold:.6f}",
            f"calibration_method={bundle.calibrator.method}",
            f"n_features={len(bundle.feature_columns)}",
            f"amount_threshold={bundle.amount_threshold:.2f}",
            f"amount_clip_value={bundle.amount_clip_value:.2f}",
        ]
        (save_dir / self._FILENAMES["metadata"]).write_text("\n".join(meta_lines), encoding="utf-8")

        print(f"Artifacts saved to: {save_dir}")

        # Keep a 'latest' copy when versioning is on
        if self.versioned and version_tag != "latest":
            latest_dir = self.model_dir / "latest"
            if latest_dir.exists():
                shutil.rmtree(latest_dir)
            shutil.copytree(save_dir, latest_dir)
            print(f"'latest' symlink updated: {latest_dir}")

        return save_dir

    # ── Load ──────────────────────────────────────────────────────────────

    def load(self, version: Optional[str] = None) -> ArtifactBundle:
        """Load an artifact bundle from *version* (default: ``model_dir`` root).

        Args:
            version: Sub-directory name (e.g. ``"v_20260326_143022"`` or
                     ``"latest"``).  ``None`` loads from ``model_dir`` root.
        """
        load_dir = self.model_dir / version if version else self.model_dir

        model = self._load_pkl(load_dir, "model", fallback="model_named")
        preprocessor = self._load_pkl(load_dir, "preprocessor")
        threshold = float(self._load_pkl(load_dir, "threshold", default=0.35))
        feature_columns = self._load_pkl(load_dir, "feature_columns", fallback="feature_names", default=[])
        amount_threshold = float(self._load_pkl(load_dir, "amount_threshold", default=100_000.0))
        amount_clip_value = float(self._load_pkl(load_dir, "amount_clip_value", default=float("inf")))
        calibrator = self._load_calibrator(load_dir)

        print(f"Artifacts loaded from: {load_dir}")
        return ArtifactBundle(
            model=model,
            preprocessor=preprocessor,
            calibrator=calibrator,
            threshold=threshold,
            feature_columns=feature_columns,
            amount_threshold=amount_threshold,
            amount_clip_value=amount_clip_value,
            version=str(version or "root"),
        )

    # ── Helpers ───────────────────────────────────────────────────────────

    def _load_pkl(self, directory: Path, key: str, fallback: Optional[str] = None, default=None):
        path = directory / self._FILENAMES[key]
        if path.exists():
            return joblib.load(path)
        if fallback:
            fb_path = directory / self._FILENAMES[fallback]
            if fb_path.exists():
                return joblib.load(fb_path)
        if default is not None:
            return default
        raise FileNotFoundError(f"Artifact not found: {path}")

    def _load_calibrator(self, directory: Path) -> ProbabilityCalibrator:
        path = directory / self._FILENAMES["calibration"]
        if not path.exists():
            return ProbabilityCalibrator(method="none")
        try:
            loaded = joblib.load(path)
            if isinstance(loaded, dict):
                return ProbabilityCalibrator(
                    method=str(loaded.get("method", "none")),
                    model=loaded.get("model"),
                )
            return loaded
        except Exception as exc:  # noqa: BLE001
            print(f"Warning: failed to load calibrator — using passthrough. Reason: {exc}")
            return ProbabilityCalibrator(method="none")
