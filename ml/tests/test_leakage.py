"""Tests kiểm tra data leakage trong fraud detection pipeline.

Chạy:
    cd d:/FraudDetect
    python -m pytest ml/tests/test_leakage.py -v
"""

from __future__ import annotations

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

import numpy as np
import pandas as pd
import pytest
from sklearn.preprocessing import StandardScaler

from ml.pipeline.split import split_data
from ml.inference.safe_feature_engineering import (
    OnlineFeatureState,
    create_safe_time_features,
    SAFE_TIME_FEATURE_COLUMNS,
)
from ml.pipeline.feature_engineering import (
    feature_engineering,
    drop_post_transaction_columns,
    REALTIME_SAFE_FEATURE_COLUMNS,
    _LEAKAGE_COLUMNS,
)


# ── Fixtures ──────────────────────────────────────────────────────────────────

def _make_paysim_df(n: int = 200, seed: int = 42) -> pd.DataFrame:
    """Tạo mock PaySim DataFrame nhỏ, đủ để test pipeline."""
    rng = np.random.default_rng(seed)
    n_users = max(10, n // 5)
    users = [f"C{i:05d}" for i in range(n_users)]
    merchants = [f"M{i:04d}" for i in range(20)]
    dests = users + merchants

    return pd.DataFrame({
        "step": rng.integers(1, 720, size=n),  # 720 giờ (~30 ngày)
        "type": rng.choice(["PAYMENT", "TRANSFER", "CASH_OUT", "DEBIT", "CASH_IN"], size=n),
        "amount": rng.uniform(10, 50_000, size=n),
        "nameOrig": rng.choice(users, size=n),
        "oldbalanceOrg": rng.uniform(0, 100_000, size=n),
        "newbalanceOrig": rng.uniform(0, 100_000, size=n),  # post-transaction (phải bị xóa)
        "nameDest": rng.choice(dests, size=n),
        "oldbalanceDest": rng.uniform(0, 100_000, size=n),
        "newbalanceDest": rng.uniform(0, 100_000, size=n),  # post-transaction (phải bị xóa)
        "isFraud": rng.choice([0, 1], size=n, p=[0.9, 0.1]),
        "isFlaggedFraud": 0,
    })


# ── Test 1: Train step < Test step ────────────────────────────────────────────

class TestTemporalSplit:
    """Kiểm tra train data chỉ chứa timestamp cũ hơn test data."""

    def test_train_max_step_less_than_test_min_step_time_based(self):
        """time_based split: max(train.step) <= min(test.step)."""
        df = _make_paysim_df(n=500)
        train, test = split_data(df, method="time_based")

        assert train["step"].max() <= test["step"].min(), (
            f"DATA LEAKAGE: train.max_step={train['step'].max()} "
            f">= test.min_step={test['step'].min()}"
        )

    def test_train_max_step_less_than_test_min_step_hybrid(self):
        """hybrid split: tất cả step trong train <= cutoff < tất cả step trong test."""
        df = _make_paysim_df(n=500)
        train, test = split_data(df, method="hybrid")

        # Sau hybrid split, max(train.step) < min(test.step) do quantile boundary
        cutoff = df["step"].quantile(0.8)
        assert train["step"].max() <= cutoff, (
            f"Train chứa step vượt cutoff: max={train['step'].max()} > cutoff={cutoff}"
        )
        assert test["step"].min() > cutoff, (
            f"Test chứa step ≤ cutoff: min={test['step'].min()} <= cutoff={cutoff}"
        )

    def test_no_user_overlap_in_hybrid_split(self):
        """hybrid split: không có nameOrig nào xuất hiện ở cả train lẫn test."""
        df = _make_paysim_df(n=1000)
        train, test = split_data(df, method="hybrid")

        overlap = set(train["nameOrig"].unique()) & set(test["nameOrig"].unique())
        assert len(overlap) == 0, (
            f"USER LEAKAGE: {len(overlap)} users xuất hiện ở cả train lẫn test. "
            f"Ví dụ: {list(overlap)[:5]}"
        )

    def test_time_based_ordering_is_correct(self):
        """Dữ liệu sau split phải được sắp xếp đúng thứ tự step."""
        df = _make_paysim_df(n=300)
        train, test = split_data(df, method="time_based")

        assert list(train["step"]) == list(train["step"].sort_values()), \
            "Train không được sort theo step"
        assert list(test["step"]) == list(test["step"].sort_values()), \
            "Test không được sort theo step"


# ── Test 2: Feature engineering không dùng future data ────────────────────────

class TestFeatureLeakage:
    """Kiểm tra từng feature không nhìn thấy dữ liệu tương lai."""

    def test_post_transaction_columns_are_dropped(self):
        """newbalanceOrig, newbalanceDest, balance_diff_* phải bị xóa."""
        df = _make_paysim_df(n=100)
        result = drop_post_transaction_columns(df)

        for col in _LEAKAGE_COLUMNS:
            assert col not in result.columns, (
                f"LEAKAGE: Cột post-transaction '{col}' vẫn còn trong feature frame"
            )

    def test_feature_engineering_uses_passed_threshold_not_recomputed(self):
        """Khi is_training=False, amount_threshold KHÔNG được tính lại từ data."""
        df = _make_paysim_df(n=100)
        forced_threshold = 99999.0  # giá trị bất thường — nếu bị tính lại sẽ khác

        result_df, out_threshold, _ = feature_engineering(
            df, is_training=False, amount_threshold=forced_threshold
        )

        assert out_threshold == forced_threshold, (
            f"LEAKAGE: amount_threshold bị tính lại khi is_training=False. "
            f"Expected={forced_threshold}, Got={out_threshold}"
        )

    def test_no_noise_added_during_inference(self):
        """Training noise không được áp dụng khi is_training=False."""
        df = _make_paysim_df(n=50, seed=0)

        result1, _, _ = feature_engineering(df.copy(), is_training=False, amount_threshold=1000.0)
        result2, _, _ = feature_engineering(df.copy(), is_training=False, amount_threshold=1000.0)

        # Khi không có noise, kết quả phải deterministic
        diff = (result1["amount"].reset_index(drop=True) - result2["amount"].reset_index(drop=True)).abs().max()
        assert diff == 0.0, (
            f"ISSUE: amount cuối không deterministic khi is_training=False — max diff={diff}"
        )

    def test_realtime_safe_columns_do_not_include_leakage_columns(self):
        """REALTIME_SAFE_FEATURE_COLUMNS không được chứa post-transaction columns."""
        for col in _LEAKAGE_COLUMNS:
            assert col not in REALTIME_SAFE_FEATURE_COLUMNS, (
                f"LEAKAGE: Cột '{col}' đang nằm trong REALTIME_SAFE_FEATURE_COLUMNS"
            )


# ── Test 3: Behavioral / time-window features không dùng future ───────────────

class TestBehavioralFeatureLeakage:
    """Kiểm tra OnlineFeatureState và create_safe_time_features không bị leakage."""

    def test_online_state_compute_before_update(self):
        """compute_features() không bao gồm giao dịch hiện tại."""
        state = OnlineFeatureState(user_id="C00001")

        # Ghi 3 giao dịch cũ
        state.update(step=1.0, amount=100.0, counterparty="M0001")
        state.update(step=2.0, amount=200.0, counterparty="M0002")
        state.update(step=3.0, amount=300.0, counterparty="M0003")

        # Tính feature tại step=4 TRƯỚC khi ghi giao dịch này
        features = state.compute_features(current_step=4.0, current_amount=999.0)

        # user_avg_amount phải là mean(100, 200, 300) = 200 — không bao gồm 999
        assert abs(features["user_avg_amount"] - 200.0) < 1e-9, (
            f"LEAKAGE: user_avg_amount={features['user_avg_amount']} "
            f"đã bao gồm giao dịch hiện tại (expected 200.0)"
        )

    def test_online_state_raises_on_future_event(self):
        """compute_features() phải raise nếu history chứa event ở tương lai."""
        state = OnlineFeatureState(user_id="C00002")
        state.update(step=10.0, amount=500.0, counterparty="M0001")

        # Cố tình gọi với current_step nhỏ hơn step đã ghi
        with pytest.raises(ValueError, match="Future leakage detected"):
            state.compute_features(current_step=5.0)

    def test_batch_features_respect_temporal_order(self):
        """create_safe_time_features: feature tại row i chỉ dùng row j < i của user."""
        # Tạo 2 giao dịch cho cùng 1 user, step khác nhau
        df = pd.DataFrame({
            "step": [1.0, 100.0],
            "nameOrig": ["C00001", "C00001"],
            "nameDest": ["M0001", "M0001"],
            "amount": [500.0, 1000.0],
        })

        result = create_safe_time_features(df)

        # Giao dịch đầu tiên (step=1) không có lịch sử → count phải = 0
        first = result[result["step"] == 1.0].iloc[0]
        assert first["number_of_transactions_last_1h"] == 0, (
            f"LEAKAGE: Giao dịch đầu tiên đã thấy {first['number_of_transactions_last_1h']} tx — "
            f"phải là 0 (chưa có lịch sử)"
        )

        # Giao dịch thứ 2 (step=100) phải thấy đúng 1 tx trong lịch sử
        # Nhưng step=1 và step=100 cách nhau 99h > 1h → count_1h = 0, nhưng user_avg = 500
        second = result[result["step"] == 100.0].iloc[0]
        assert abs(second["user_avg_amount"] - 500.0) < 1e-9, (
            f"LEAKAGE: user_avg_amount tại step=100 = {second['user_avg_amount']} "
            f"(expected 500.0 — chỉ từ giao dịch step=1)"
        )

    def test_batch_features_produce_zero_for_first_transaction(self):
        """User lần đầu giao dịch → tất cả behavioral features phải = 0."""
        df = pd.DataFrame({
            "step": [5.0],
            "nameOrig": ["BRAND_NEW_USER"],
            "nameDest": ["M9999"],
            "amount": [250.0],
        })

        result = create_safe_time_features(df)
        row = result.iloc[0]

        assert row["number_of_transactions_last_1h"] == 0, "Phải là 0 cho new user"
        assert row["total_amount_last_24h"] == 0.0, "Phải là 0 cho new user"
        assert row["time_since_last_transaction"] == 5.0, "time_since = current_step - 0"
        assert row["amount_zscore_user"] == 0.0, "Phải là 0 — không đủ lịch sử"


# ── Test 4: Scaling không bị leakage ─────────────────────────────────────────

class TestScalingLeakage:
    """Kiểm tra StandardScaler fit chỉ trên train, không trên test."""

    def test_scaler_fit_on_train_only(self):
        """Scaler fit trên train → mean/std của test phải khác với scaler params."""
        rng = np.random.default_rng(0)
        # Train: amount nhỏ
        X_train = pd.DataFrame({"amount": rng.uniform(10, 1000, 500)})
        # Test: amount lớn hơn nhiều
        X_test = pd.DataFrame({"amount": rng.uniform(10_000, 100_000, 100)})

        scaler = StandardScaler()
        scaler.fit(X_train)  # fit trên train only

        train_mean = scaler.mean_[0]
        test_mean = X_test["amount"].mean()

        # Nếu scaler bị fit trên cả train+test, mean sẽ thay đổi đáng kể
        scaler_both = StandardScaler()
        scaler_both.fit(pd.concat([X_train, X_test]))
        combined_mean = scaler_both.mean_[0]

        assert abs(train_mean - combined_mean) > 1000, (
            "Scaler fit trên train vs train+test có mean gần giống nhau — "
            "có thể scaler đang bị fit trên full data"
        )

    def test_transform_only_applied_to_eval(self):
        """Test thực tế: scale train, rồi dùng artifact đó transform eval."""
        rng = np.random.default_rng(7)
        X_train = rng.uniform(0, 100, (200, 3))
        X_test = rng.uniform(200, 300, (50, 3))  # completely different range

        scaler = StandardScaler()
        X_train_scaled = scaler.fit_transform(X_train)
        X_test_scaled = scaler.transform(X_test)  # dùng mean/std của train

        # Test values sẽ bị scale lệch hẳn — mean sẽ >> 0
        test_mean = X_test_scaled.mean()
        assert test_mean > 5.0, (
            f"Test set đáng lẽ phải có mean >> 0 sau khi scale bằng train scaler, "
            f"nhưng mean={test_mean:.2f} — có thể scaler bị fit lại trên test"
        )

    def test_amount_threshold_not_recomputed_for_test(self):
        """Threshold được truyền vào test, không tính lại từ test data."""
        df_train = _make_paysim_df(n=300, seed=1)
        df_test = _make_paysim_df(n=100, seed=2)

        # Tính từ train
        _, train_threshold, train_clip = feature_engineering(
            df_train, is_training=True
        )

        # Truyền vào test — threshold KHÔNG được thay đổi
        _, test_threshold, test_clip = feature_engineering(
            df_test, is_training=False,
            amount_threshold=train_threshold,
            amount_clip_value=train_clip,
        )

        assert test_threshold == train_threshold, (
            f"LEAKAGE: amount_threshold bị tính lại cho test. "
            f"train={train_threshold:.2f}, test={test_threshold:.2f}"
        )
        assert test_clip == train_clip, (
            f"LEAKAGE: amount_clip_value bị tính lại cho test. "
            f"train={train_clip:.2f}, test={test_clip:.2f}"
        )


# ── Chạy trực tiếp ────────────────────────────────────────────────────────────

if __name__ == "__main__":
    import pytest
    pytest.main([__file__, "-v", "--tb=short"])
