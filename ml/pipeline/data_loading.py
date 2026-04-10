"""PaySim CSV loader for the offline training pipeline."""

from __future__ import annotations

import pandas as pd


def load_data(data_path: str, sample_for_demo: bool = False, negative_multiplier: int = 10) -> pd.DataFrame:
    """Load the PaySim dataset from *data_path*.

    Args:
        data_path:           Path to ``paysim.csv``.
        sample_for_demo:     When ``True``, return a small balanced sample
                             suitable for quick local tests.  **Never use
                             in production training.**
        negative_multiplier: Negative : positive ratio used when building
                             the demo sample.

    Returns:
        Raw ``DataFrame`` with all original PaySim columns intact.
    """
    print(f"Loading data from: {data_path}")
    df = pd.read_csv(data_path)
    print(f"Dataset shape: {df.shape}  |  columns: {list(df.columns)}")

    if sample_for_demo:
        fraud_rows = df[df["isFraud"] == 1]
        n_fraud = len(fraud_rows)
        non_fraud_rows = df[df["isFraud"] == 0].sample(
            n=min(n_fraud * negative_multiplier, len(df[df["isFraud"] == 0])),
            random_state=42,
        )
        df = (
            pd.concat([fraud_rows, non_fraud_rows])
            .sample(frac=1, random_state=42)
            .reset_index(drop=True)
        )
        print(f"Demo sample shape: {df.shape}")

    return df
