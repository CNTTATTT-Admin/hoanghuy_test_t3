import pandas as pd
from typing import Tuple

def feature_engineering(df: pd.DataFrame, is_training: bool = True, amount_threshold: float = None) -> Tuple[pd.DataFrame, float]:
    """Tạo các đặc trưng mới để phát hiện gian lận"""
    print("Performing feature engineering...")

    # Sự khác biệt về số dư (dễ hiểu hơn error_balance)
    df['balance_diff_org'] = df['oldbalanceOrg'] - df['newbalanceOrig']
    df['balance_diff_dest'] = df['newbalanceDest'] - df['oldbalanceDest']

    # Loại bỏ đặc trưng error_balance vì chúng trùng lặp (amount - balance_diff)
    # Trong trường hợp gian lận: balance_diff ≈ amount, nên error_balance ≈ 0
    # Trong trường hợp hợp pháp: cũng thường error_balance ≈ 0

    # Chỉ báo số tiền lớn (top 5% số tiền)
    if is_training and amount_threshold is None:
        amount_threshold = df['amount'].quantile(0.95)
        print(f"Amount threshold (training): {amount_threshold}")
    elif amount_threshold is not None:
        print(f"Using provided amount threshold: {amount_threshold}")
    else:
        # Đối với suy luận, sử dụng giá trị mặc định hợp lý hoặc tải từ mô hình đã lưu
        amount_threshold = 100000  # Giá trị mặc định bảo thủ
        print(f"Using default amount threshold: {amount_threshold}")

    df['is_large_amount'] = (df['amount'] > amount_threshold).astype(int)

    # Đặc trưng tần suất giao dịch (đơn giản hóa)
    df['step_hour'] = df['step'] % 24
    df['step_day'] = df['step'] // 24

    print(f"New features created: balance_diff_org, balance_diff_dest, is_large_amount, step_hour, step_day")
    return df, amount_threshold

def prepare_features_and_target(df: pd.DataFrame) -> Tuple[pd.DataFrame, pd.Series]:
    """Tách đặc trưng và mục tiêu"""
    # Biến mục tiêu
    y = df['isFraud']

    # Đặc trưng (loại trừ mục tiêu)
    X = df.drop('isFraud', axis=1)

    print(f"Feature size: {X.shape}, Target size: {y.shape}")
    print(f"Target distribution: {y.value_counts()}")
    return X, y

if __name__ == "__main__":
    from data_loading import load_data
    from cleaning import handle_missing_values, remove_unnecessary_columns

    # Demo feature engineering
    data_path = "../data/paysim.csv"
    df = load_data(data_path)
    df = handle_missing_values(df)
    df = remove_unnecessary_columns(df)

    print("\n=== BEFORE FEATURE ENGINEERING ===")
    print(f"Shape: {df.shape}")
    print(f"Columns: {list(df.columns)}")

    X, y = prepare_features_and_target(df)
    X, _ = feature_engineering(X, is_training=True)

    print("\n=== SAU KHI FEATURE ENGINEERING ===")
    print(f"X shape: {X.shape}")
    print(f"y shape: {y.shape}")
    print(f"Target distribution: {y.value_counts()}")
    print(f"New columns: {list(X.columns)}")
    print("\nFirst 5 rows of X:")
    print(X.head())