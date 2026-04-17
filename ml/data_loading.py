"""Backward-compatibility shim - canonical code lives in ml.pipeline.data_loading."""

import os, sys
_PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if _PROJECT_ROOT not in sys.path:
    sys.path.insert(0, _PROJECT_ROOT)

from ml.pipeline.data_loading import load_data  # noqa: F401

__all__ = ["load_data"]


if __name__ == "__main__":
    df = load_data("data/paysim.csv")  # sửa path đúng file của bạn

    # =========================
    # BASIC INFO
    # =========================
    print("\n=== BASIC INFO ===")
    print(df.head())
    print("\nDataset shape:", df.shape)

    # =========================
    # FRAUD OVERVIEW
    # =========================
    print("\n=== FRAUD OVERVIEW ===")
    total_fraud = df["isFraud"].sum()
    total = len(df)

    print(f"Total transactions: {total}")
    print(f"Total fraud: {total_fraud}")
    print(f"Fraud rate: {total_fraud / total:.6f}")

    # =========================
    # FRAUD BY TYPE
    # =========================
    print("\n=== FRAUD BY TYPE ===")
    fraud_df = df[df["isFraud"] == 1]
    print(fraud_df["type"].value_counts())

    # so sánh tổng quan theo type (quan trọng hơn)
    print("\n=== FRAUD RATE BY TYPE ===")
    type_stats = df.groupby("type")["isFraud"].agg(["count", "sum"])
    type_stats["fraud_rate"] = type_stats["sum"] / type_stats["count"]
    print(type_stats.sort_values("fraud_rate", ascending=False))

    # =========================
    # STEP ANALYSIS
    # =========================
    print("\n=== STEP DISTRIBUTION (TOP 10) ===")
    print(df["step"].value_counts().head(10))

    print("\n=== FRAUD BY STEP (TOP 10) ===")
    print(fraud_df["step"].value_counts().head(10))

    # =========================
    # AMOUNT ANALYSIS
    # =========================
    print("\n=== AMOUNT STATS ===")
    print("Fraud amount description:")
    print(fraud_df["amount"].describe())

    print("\nNormal amount description:")
    print(df[df["isFraud"] == 0]["amount"].describe())

    print("\nAmount quantiles (threshold reference):")
    print(df["amount"].quantile([0.9, 0.95, 0.99]))

    # =========================
    # BALANCE CHECK
    # =========================
    print("\n=== BALANCE INCONSISTENCY ===")
    condition = fraud_df["oldbalanceOrg"] < fraud_df["amount"]
    print("Fraud cases where oldbalanceOrg < amount:")
    print(condition.value_counts())

    # =========================
    # RAW INSIGHT SUMMARY
    # =========================
    print("\n=== INSIGHT SUMMARY ===")
    print("- Fraud mainly occurs in TRANSFER and CASH_OUT")
    print("- Fraud rate is extremely low (~0.13%)")
    print("- Amount alone is not enough to detect fraud")