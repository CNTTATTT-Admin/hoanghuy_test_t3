import pandas as pd
import os

def load_data(data_path: str) -> pd.DataFrame:
    """Tải tập dữ liệu PaySim"""
    print("Loading data from:", data_path)
    df = pd.read_csv(data_path)
    print(f"Dataset size: {df.shape}")
    print(f"Columns: {list(df.columns)}")

    # Để mục đích demo, lấy mẫu một tập con nhỏ hơn để tránh vấn đề bộ nhớ
    # Lấy mẫu các trường hợp gian lận và 10x các trường hợp không gian lận
    fraud_cases = df[df['isFraud'] == 1]
    n_fraud = len(fraud_cases)
    non_fraud_cases = df[df['isFraud'] == 0].sample(n=min(n_fraud * 10, len(df[df['isFraud'] == 0])), random_state=42)
    df = pd.concat([fraud_cases, non_fraud_cases]).sample(frac=1, random_state=42).reset_index(drop=True)
    print(f"Sampled dataset size: {df.shape}")

    return df

if __name__ == "__main__":
    # Demo load dữ liệu
    data_path = "../data/paysim.csv"
    df = load_data(data_path)
    print("\n=== DEBUG RESULTS ===")
    print(f"Shape: {df.shape}")
    print(f"Columns: {list(df.columns)}")
    print(f"Target distribution: {df['isFraud'].value_counts()}")
    print("\nFirst 5 rows:")
    print(df.head())