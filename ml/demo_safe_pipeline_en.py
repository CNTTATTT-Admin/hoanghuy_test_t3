"""Safe Fraud Detection Pipeline Demo - No Data Leakage"""

import pandas as pd
import numpy as np
from preprocessing import FraudDetectionPreprocessor
from train import FraudDetectionModel
from safe_feature_engineering import create_safe_features

def demo_safe_pipeline():
    """Demo safe training pipeline"""
    print("🚀 SAFE FRAUD DETECTION PIPELINE DEMO")
    print("=" * 60)

    # 1. Initialize components
    print("\n📊 1. Initializing preprocessor and model")
    preprocessor = FraudDetectionPreprocessor()
    model_trainer = FraudDetectionModel()

    # 2. Load and preprocess data
    print("\n🔄 2. Preprocessing data with hybrid split")
    X_train, X_test, y_train, y_test, feature_names = preprocessor.preprocess_training()

    print("\n✅ Split results:")
    print(f"   Train: {X_train.shape[0]} samples, {len(X_train['nameOrig'].unique())} users")
    print(f"   Test:  {X_test.shape[0]} samples, {len(X_test['nameOrig'].unique())} users")

    # 3. Check for data leakage
    print("\n🔍 3. Checking for data leakage")
    train_users = set(X_train['nameOrig'].unique())
    test_users = set(X_test['nameOrig'].unique())

    overlap_users = train_users & test_users
    if overlap_users:
        print(f"❌ WARNING: {len(overlap_users)} users overlap!")
        print(f"   Users: {list(overlap_users)[:5]}...")
    else:
        print("✅ OK: No users appear in both train and test")

    # Check time leakage
    max_train_step = X_train['step'].max()
    min_test_step = X_test['step'].min()

    if max_train_step >= min_test_step:
        print(f"❌ WARNING: Time leakage! Train max step: {max_train_step}, Test min step: {min_test_step}")
    else:
        print(f"✅ OK: Time-based split correct. Train ≤ step {max_train_step}, Test ≥ step {min_test_step}")

    # 4. Display safe features
    print("\n📈 4. Safe features created")
    safe_features = [col for col in X_train.columns if col not in [
        'step', 'type', 'amount', 'nameOrig', 'oldbalanceOrg', 'newbalanceOrig',
        'nameDest', 'oldbalanceDest', 'newbalanceDest', 'isFlaggedFraud'
    ]]
    print(f"   Total features: {len(X_train.columns)}")
    print(f"   Safe features: {len(safe_features)}")
    print("   Main features:")
    for feature in safe_features[:10]:  # Display first 10 features
        print(f"     - {feature}")

    # 5. Train model
    print("\n🤖 5. Training model")
    model_trainer.train_model(X_train[feature_names], y_train, feature_names)

    # 6. Evaluate
    print("\n📊 6. Evaluating model")
    evaluation = model_trainer.evaluate_model(X_test[feature_names], y_test)

    print("\n🎯 Results:")
    print(f"   Accuracy: {evaluation.get('accuracy', 0):.4f}")
    print(f"   Precision: {evaluation.get('precision', 0):.4f}")
    print(f"   Recall: {evaluation.get('recall', 0):.4f}")
    print(f"   F1-Score: {evaluation.get('f1', 0):.4f}")

    # 7. Test with sample transaction
    print("\n🧪 7. Testing with sample transaction")
    sample_tx = {
        'step': X_test['step'].max() + 10,  # Future
        'type': 'TRANSFER',
        'amount': 50000.0,
        'oldbalanceOrg': 50000.0,
        'newbalanceOrig': 0.0,
        'oldbalanceDest': 100000.0,
        'newbalanceDest': 150000.0,
        'nameOrig': 'TestUser123',
        'nameDest': 'TestDest456'
    }

    # Create safe features for sample
    sample_df = pd.DataFrame([sample_tx])
    sample_with_features = create_safe_features(sample_df, is_training=False)

    print("   Sample transaction safe features:")
    for col in safe_features[:5]:
        if col in sample_with_features.columns:
            value = sample_with_features[col].iloc[0]
            print(f"     {col}: {value:.4f}")
    print("\n🎉 Demo completed! Safe pipeline with no data leakage.")

if __name__ == "__main__":
    demo_safe_pipeline()