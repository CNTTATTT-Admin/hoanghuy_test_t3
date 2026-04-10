"""Train/test split strategies that prevent both temporal and entity leakage."""

from __future__ import annotations

from typing import Tuple

import numpy as np
import pandas as pd


def split_data(
    df: pd.DataFrame,
    method: str = "hybrid",
) -> Tuple[pd.DataFrame, pd.DataFrame]:
    """Split *df* into (train, test) using the specified strategy.

    Args:
        df:     Raw PaySim DataFrame.
        method: One of ``"time_based"``, ``"user_based"``, or ``"hybrid"``.
                Default is ``"hybrid"`` (recommended for production).

    Returns:
        ``(train_df, test_df)`` — both retain all original columns.
    """
    if method == "time_based":
        return _time_based_split(df)
    if method == "user_based":
        return _user_based_split(df)
    if method == "hybrid":
        return _hybrid_split(df)
    raise ValueError(f"Unknown split method: {method!r}. Use 'time_based', 'user_based', or 'hybrid'.")


# ── Individual split implementations ─────────────────────────────────────────

def _time_based_split(df: pd.DataFrame) -> Tuple[pd.DataFrame, pd.DataFrame]:
    """Pure temporal split (80 % early → train, 20 % late → test)."""
    df = df.sort_values("step").reset_index(drop=True)
    cut = int(len(df) * 0.8)
    train, test = df.iloc[:cut].copy(), df.iloc[cut:].copy()
    print(f"Time-based split — train steps: [{train['step'].min()}, {train['step'].max()}]"
          f"  test steps: [{test['step'].min()}, {test['step'].max()}]")
    return train, test


def _user_based_split(df: pd.DataFrame) -> Tuple[pd.DataFrame, pd.DataFrame]:
    """Entity-based split: the same origin user never appears in both sets."""
    users = df["nameOrig"].unique()
    rng = np.random.default_rng(42)
    rng.shuffle(users)
    cut = int(len(users) * 0.8)
    train_users = set(users[:cut])
    train = df[df["nameOrig"].isin(train_users)].copy()
    test = df[~df["nameOrig"].isin(train_users)].copy()
    print(f"User-based split — {len(train_users)} train users, {len(users) - len(train_users)} test users")
    return train, test


def _hybrid_split(df: pd.DataFrame) -> Tuple[pd.DataFrame, pd.DataFrame]:
    """Phân tách kết hợp: loại bỏ ranh giới thời gian **và** sự trùng lặp thực thể.

Các bước:

1. Sắp xếp theo ``step`` và phân tách tại bước thời gian phân vị thứ 80.

2. Loại bỏ khỏi *tập huấn luyện* bất kỳ hàng nào có ``nameOrig`` cũng xuất hiện trong

tập kiểm tra (ngăn ngừa rò rỉ phía người gửi).

3. Đối với ``nameDest``, chỉ loại bỏ sự trùng lặp đối với các tài khoản khách hàng (tiền tố ``C*``

Tài khoản người bán (``M*``) được chia sẻ có chủ ý —

việc loại bỏ chúng sẽ loại bỏ phần lớn dữ liệu huấn luyện.

Đây là chiến lược được khuyến nghị cho tập dữ liệu PaySim.
    """
    df = df.sort_values("step").reset_index(drop=True)
    cutoff = df["step"].quantile(0.8)

    train = df[df["step"] <= cutoff].copy()
    test = df[df["step"] > cutoff].copy()

    # Remove origin-user overlap
    overlap_orig = set(train["nameOrig"].unique()) & set(test["nameOrig"].unique())
    if overlap_orig:
        train = train[~train["nameOrig"].isin(overlap_orig)].copy()
        print(f"Hybrid split: removed {len(overlap_orig):,} overlapping nameOrig from train")

    # Remove destination-user overlap — customers only, NOT merchants
    if "nameDest" in df.columns:
        test_dests = set(test["nameDest"].unique())
        train_dests = set(train["nameDest"].unique())
        overlap_dest = train_dests & test_dests
        # Keep merchant accounts (M* prefix) — they are shared entities, not leakage
        overlap_dest_customers = {d for d in overlap_dest if not d.startswith("M")}
        if overlap_dest_customers:
            train = train[~train["nameDest"].isin(overlap_dest_customers)].copy()
            print(f"Hybrid split: removed {len(overlap_dest_customers):,} overlapping customer nameDest from train")
            print(f"Hybrid split: kept {len(overlap_dest) - len(overlap_dest_customers):,} shared merchant nameDest")

    print(
        f"Hybrid split — train: {train.shape}  (fraud={float(train['isFraud'].mean()):.4%})"
        f"  test: {test.shape}  (fraud={float(test['isFraud'].mean()):.4%})"
    )
    return train, test
