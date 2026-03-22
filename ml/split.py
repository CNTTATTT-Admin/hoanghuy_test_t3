import pandas as pd
from typing import Tuple
import numpy as np

def split_data(df: pd.DataFrame, method: str = 'time_based') -> Tuple[pd.DataFrame, pd.DataFrame]:
    """Chia dữ liệu thành tập train và test với các phương pháp chống data leakage"""

    if method == 'time_based':
        return _time_based_split(df)
    elif method == 'user_based':
        return _user_based_split(df)
    elif method == 'hybrid':
        return _hybrid_split(df)
    else:
        raise ValueError("Method must be 'time_based', 'user_based', or 'hybrid'")

def _time_based_split(df: pd.DataFrame) -> Tuple[pd.DataFrame, pd.DataFrame]:
    """Chia theo thời gian - đảm bảo không có thông tin tương lai"""
    # Sắp xếp theo thời gian
    df = df.sort_values('step').reset_index(drop=True)

    # Chia theo thời gian (80% đầu cho train, 20% sau cho test)
    split_idx = int(len(df) * 0.8)

    train_df = df[:split_idx]
    test_df = df[split_idx:]

    print(f"Time-based split: Train steps {train_df['step'].min()}-{train_df['step'].max()}")
    print(f"Time-based split: Test steps {test_df['step'].min()}-{test_df['step'].max()}")

    return train_df, test_df

def _user_based_split(df: pd.DataFrame) -> Tuple[pd.DataFrame, pd.DataFrame]:
    """Chia theo user - đảm bảo cùng user không ở cả train và test"""
    # Lấy danh sách user duy nhất
    users = df['nameOrig'].unique()

    # Shuffle users để random
    np.random.seed(42)
    np.random.shuffle(users)

    # Chia users thành train/test (80/20)
    split_idx = int(len(users) * 0.8)
    train_users = users[:split_idx]
    test_users = users[split_idx:]

    # Chia data theo users
    train_df = df[df['nameOrig'].isin(train_users)]
    test_df = df[df['nameOrig'].isin(test_users)]

    print(f"User-based split: {len(train_users)} train users, {len(test_users)} test users")

    return train_df, test_df

def _hybrid_split(df: pd.DataFrame) -> Tuple[pd.DataFrame, pd.DataFrame]:
    """Chia hybrid: time-based + user-based để tối ưu"""
    # Bước 1: Time-based split trước
    df = df.sort_values('step').reset_index(drop=True)
    time_split_idx = int(len(df) * 0.8)

    temp_train = df[:time_split_idx]
    temp_test = df[time_split_idx:]

    # Bước 2: Trong temp_train, đảm bảo không có user nào ở cả train và test
    # (nếu có user xuất hiện ở cả 2 phần, chuyển user đó sang test)
    train_users = set(temp_train['nameOrig'].unique())
    test_users = set(temp_test['nameOrig'].unique())

    # Users bị overlap
    overlap_users = train_users & test_users

    if overlap_users:
        # Chuyển tất cả giao dịch của overlap users từ train sang test
        overlap_mask = temp_train['nameOrig'].isin(overlap_users)
        overlap_data = temp_train[overlap_mask]

        temp_train = temp_train[~overlap_mask]
        temp_test = pd.concat([temp_test, overlap_data], ignore_index=True)

        print(f"Hybrid split: Moved {len(overlap_users)} overlapping users to test")

    print(f"Hybrid split: Train {temp_train.shape[0]} samples, Test {temp_test.shape[0]} samples")
    print(f"Hybrid split: Train users {len(temp_train['nameOrig'].unique())}, Test users {len(temp_test['nameOrig'].unique())}")

    return temp_train, temp_test

if __name__ == "__main__":
    from data_loading import load_data
    from cleaning import handle_missing_values, remove_unnecessary_columns
    from feature_engineering import prepare_features_and_target, feature_engineering

    # Demo split
    data_path = "../data/paysim.csv"
    df = load_data(data_path)
    df = handle_missing_values(df)
    df = remove_unnecessary_columns(df)
    X, y = prepare_features_and_target(df)
    X, _ = feature_engineering(X, is_training=True)

    # Combine back for split
    df_full = X.copy()
    df_full['isFraud'] = y

    print("\n=== BEFORE SPLIT ===")
    print(f"Shape: {df_full.shape}")
    print(f"Target distribution: {df_full['isFraud'].value_counts()}")

    train_df, test_df = split_data(df_full)

    print("\n=== SAU KHI SPLIT ===")
    print(f"Train shape: {train_df.shape}")
    print(f"Test shape: {test_df.shape}")
    print(f"Train target: {train_df['isFraud'].value_counts()}")
    print(f"Test target: {test_df['isFraud'].value_counts()}")