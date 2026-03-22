"""Demo Pipeline An Toàn - Tránh Data Leakage"""

import pandas as pd
import numpy as np
from preprocessing import FraudDetectionPreprocessor
from train import FraudDetectionModel
from safe_feature_engineering import create_safe_features

def demo_safe_pipeline():
    """Demo pipeline training an toàn"""
    print("🚀 SAFE FRAUD DETECTION PIPELINE DEMO")
    print("=" * 60)

    # 1. Khởi tạo components
    print("\n📊 1. Initializing preprocessor and model")
    preprocessor = FraudDetectionPreprocessor()
    model_trainer = FraudDetectionModel()

    # 2. Load và preprocess data
    print("\n🔄 2. Tiền xử lý dữ liệu với hybrid split")
    X_train, X_test, y_train, y_test, feature_names = preprocessor.preprocess_training()

    print("\n✅ Kết quả split:")
    print(f"   Train: {X_train.shape[0]} samples, {len(X_train['nameOrig'].unique())} users")
    print(f"   Test:  {X_test.shape[0]} samples, {len(X_test['nameOrig'].unique())} users")

    # 3. Kiểm tra data leakage
    print("\n🔍 3. Kiểm tra data leakage")
    train_users = set(X_train['nameOrig'].unique())
    test_users = set(X_test['nameOrig'].unique())

    overlap_users = train_users & test_users
    if overlap_users:
        print(f"❌ CẢNH BÁO: {len(overlap_users)} users bị overlap!")
        print(f"   Users: {list(overlap_users)[:5]}...")
    else:
        print("✅ OK: Không có user nào ở cả train và test")

    # Kiểm tra time leakage
    max_train_step = X_train['step'].max()
    min_test_step = X_test['step'].min()

    if max_train_step >= min_test_step:
        print(f"❌ CẢNH BÁO: Time leakage! Train max step: {max_train_step}, Test min step: {min_test_step}")
    else:
        print(f"✅ OK: Time-based split đúng. Train ≤ step {max_train_step}, Test ≥ step {min_test_step}")

    # 4. Hiển thị features an toàn
    print("\n📈 4. Features an toàn được tạo")
    safe_features = [col for col in X_train.columns if col not in [
        'step', 'type', 'amount', 'nameOrig', 'oldbalanceOrg', 'newbalanceOrig',
        'nameDest', 'oldbalanceDest', 'newbalanceDest', 'isFlaggedFraud'
    ]]
    print(f"   Tổng số features: {len(X_train.columns)}")
    print(f"   Features an toàn: {len(safe_features)}")
    print("   Các features chính:")
    for feature in safe_features[:10]:  # Display first 10 features
        print(f"     - {feature}")

    # 5. Train model
    print("\n🤖 5. Huấn luyện model")
    model_trainer.train_model(X_train[feature_names], y_train, feature_names)

    # 6. Evaluate
    print("\n📊 6. Đánh giá model")
    evaluation = model_trainer.evaluate_model(X_test[feature_names], y_test)

    print("\n🎯 Kết quả:")
    print(".4f")
    print(".4f")
    print(".4f")
    print(".4f")
    # 7. Test với sample transaction
    print("\n🧪 7. Test với giao dịch mẫu")
    sample_tx = {
        'step': X_test['step'].max() + 10,  # Tương lai
        'type': 'TRANSFER',
        'amount': 50000.0,
        'oldbalanceOrg': 50000.0,
        'newbalanceOrig': 0.0,
        'oldbalanceDest': 100000.0,
        'newbalanceDest': 150000.0,
        'nameOrig': 'TestUser123',
        'nameDest': 'TestDest456'
    }

    # Tạo features an toàn cho sample
    sample_df = pd.DataFrame([sample_tx])
    sample_with_features = create_safe_features(sample_df, is_training=False)

    print("   Sample transaction features an toan:"
    for col in safe_features[:5]:
        if col in sample_with_features.columns:
            value = sample_with_features[col].iloc[0]
            print(".4f")
    print("\n🎉 Demo hoàn thành! Pipeline an toàn không có data leakage.")

if __name__ == "__main__":
    demo_safe_pipeline()