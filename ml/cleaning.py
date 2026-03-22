import pandas as pd

def handle_missing_values(df: pd.DataFrame) -> pd.DataFrame:
    """Xử lý giá trị thiếu"""
    print("Handling missing values...")
    # Kiểm tra giá trị thiếu
    missing = df.isnull().sum()
    print(f"Missing values:\n{missing[missing > 0]}")

    # Đối với tập dữ liệu này, giả định không có giá trị thiếu, nhưng xử lý nếu có
    df = df.dropna()  # Đơn giản loại bỏ tạm thời
    print(f"After handling missing values: {df.shape}")
    return df

def remove_unnecessary_columns(df: pd.DataFrame) -> pd.DataFrame:
    """Loại bỏ cột ID và các đặc trưng không cần thiết"""
    print("Removing unnecessary columns...")
    # Loại bỏ cột ID - GIỮ LẠI nameOrig cho safe features
    columns_to_drop = ['nameDest', 'isFlaggedFraud']
    df = df.drop(columns=[col for col in columns_to_drop if col in df.columns], errors='ignore')
    print(f"Remaining columns: {list(df.columns)}")
    return df

if __name__ == "__main__":
    from data_loading import load_data

    # Demo cleaning
    data_path = "../data/paysim.csv"
    df = load_data(data_path)

    print("\n=== TRƯỚC KHI CLEANING ===")
    print(f"Shape: {df.shape}")
    print(f"Missing values: {df.isnull().sum().sum()}")

    df_cleaned = handle_missing_values(df)
    df_cleaned = remove_unnecessary_columns(df_cleaned)

    print("\n=== SAU KHI CLEANING ===")
    print(f"Shape: {df_cleaned.shape}")
    print(f"Columns: {list(df_cleaned.columns)}")
    print(f"Missing values: {df_cleaned.isnull().sum().sum()}")
    print("\nFirst 5 rows:")
    print(df_cleaned.head())