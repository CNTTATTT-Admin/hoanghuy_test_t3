"""Load configs/model_config.yaml into a :class:`ModelConfig` dataclass.

The parser is dependency-free: it reads the YAML file line-by-line with simple
key-value extraction so PyYAML is not required at runtime.
"""

from __future__ import annotations

import dataclasses
from pathlib import Path
from typing import Any, Dict

from .schema import ModelConfig


def _coerce(raw: str) -> Any:
    """Convert a raw YAML scalar string to the most appropriate Python type."""
    value = raw.strip()
    lower = value.lower()
    if lower in {"true", "false"}:
        return lower == "true"
    try:
        return float(value) if "." in value else int(value)
    except ValueError:
        return value.strip("\"'")


def load_config(config_path: str | None = None) -> ModelConfig:
    """Parse ``model_config.yaml`` and return a validated :class:`ModelConfig`.

    Unknown keys are silently ignored.  Invalid enum values are reset to their
    safe defaults.
    """
    if config_path is None:
        config_path = str(
            Path(__file__).resolve().parents[2] / "configs" / "model_config.yaml"
        )
    cfg = ModelConfig()
    path = Path(config_path)
    if not path.exists():
        return cfg

    for line in path.read_text(encoding="utf-8").splitlines():
        text = line.strip()
        if not text or text.startswith("#") or ":" not in text:
            continue
        key, value = text.split(":", 1)
        key = key.strip()
        if hasattr(cfg, key):
            setattr(cfg, key, _coerce(value))

    # Validate enum-like fields
    if cfg.calibration_method not in {"none", "platt", "isotonic"}:
        cfg.calibration_method = "none"
    if cfg.threshold_selection not in {"fixed", "f1", "recall", "precision_at_recall"}:
        cfg.threshold_selection = "precision_at_recall"

    return cfg


def load_model_settings(config_path: str | None = None) -> Dict[str, Any]:
    """Backward-compatible wrapper: returns a plain ``dict`` instead of dataclass.

    New code should call :func:`load_config` directly.
    """
    return dataclasses.asdict(load_config(config_path))
