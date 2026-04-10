"""Backward-compatibility shim — canonical code lives in ml.config.config_runtime."""

import os, sys
_PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if _PROJECT_ROOT not in sys.path:
    sys.path.insert(0, _PROJECT_ROOT)

from ml.config.config_runtime import load_model_settings  # noqa: F401

__all__ = ["load_model_settings"]
