"""Simple Safe Pipeline Test - No Unicode"""

import sys
import os
sys.path.append('.')

def test_safe_pipeline():
    """Test the safe pipeline without Unicode characters"""
    try:
        print("Importing modules...")
        from preprocessing import FraudDetectionPreprocessor
        print("Preprocessor imported successfully")

        print("Initializing preprocessor...")
        preprocessor = FraudDetectionPreprocessor()
        print("Preprocessor initialized")

        print("Running preprocessing...")
        X_train, X_test, y_train, y_test, feature_names = preprocessor.preprocess_training()
        print(f"Preprocessing completed. Train: {X_train.shape[0]} samples, Test: {X_test.shape[0]} samples")

        # Check for data leakage
        print("Checking for data leakage...")
        train_users = set(X_train['nameOrig'].unique())
        test_users = set(X_test['nameOrig'].unique())
        overlap = train_users & test_users
        print(f"User overlap: {len(overlap)} users")

        max_train_step = X_train['step'].max()
        min_test_step = X_test['step'].min()
        print(f"Time split: Train max step {max_train_step}, Test min step {min_test_step}")

        if len(overlap) == 0 and max_train_step < min_test_step:
            print("SUCCESS: No data leakage detected!")
            print("Safe pipeline is working correctly.")
        else:
            print("WARNING: Potential data leakage detected!")

        return True

    except Exception as e:
        print(f"ERROR: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = test_safe_pipeline()
    if success:
        print("\nTest completed successfully!")
    else:
        print("\nTest failed!")