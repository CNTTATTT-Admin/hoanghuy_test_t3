"""Shared utilities: logging factory and project-root path resolution."""

from __future__ import annotations

import logging
import os
from pathlib import Path

# ── Project path anchors ──────────────────────────────────────────────────────
# ml/utils/ → ml/ → FraudDetect/
PROJECT_ROOT: Path = Path(__file__).resolve().parents[2]
MODELS_DIR: Path = PROJECT_ROOT / "models"
LOGS_DIR: Path = PROJECT_ROOT / "logs"
CONFIGS_DIR: Path = PROJECT_ROOT / "configs"
DATA_DIR: Path = PROJECT_ROOT / "data"


def get_logger(name: str, level: int = logging.INFO) -> logging.Logger:
    """Return a named logger with a consistent console format.

    Re-uses an existing logger rather than adding duplicate handlers,
    so it is safe to call multiple times with the same *name*.
    """
    logger = logging.getLogger(name)
    if not logger.handlers:
        handler = logging.StreamHandler()
        handler.setFormatter(
            logging.Formatter(
                "%(asctime)s  %(levelname)-8s  %(name)s — %(message)s",
                datefmt="%Y-%m-%d %H:%M:%S",
            )
        )
        logger.addHandler(handler)
    logger.setLevel(level)
    return logger


def build_audit_logger(log_path: str | os.PathLike) -> logging.Logger:
    """Return a file logger that appends one JSON line per prediction.

    The parent directory is created automatically if it does not exist.
    """
    path = Path(log_path)
    path.parent.mkdir(parents=True, exist_ok=True)

    audit = logging.getLogger("fraud_audit")
    audit.setLevel(logging.INFO)
    if not audit.handlers:
        fh = logging.FileHandler(path, encoding="utf-8")
        fh.setFormatter(logging.Formatter("%(message)s"))
        audit.addHandler(fh)
    return audit
