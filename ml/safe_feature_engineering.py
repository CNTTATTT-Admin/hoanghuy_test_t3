"""Feature Engineering An Toàn - Tránh Data Leakage"""

import pandas as pd
import numpy as np
from typing import Dict, List, Tuple, Optional
from datetime import datetime, timedelta
import warnings
warnings.filterwarnings('ignore')

class SafeFeatureEngineer:
    """
    Feature engineering an toàn cho fraud detection.
    Chỉ sử dụng thông tin quá khứ, không có data leakage.
    """

    def __init__(self):
        self.user_history = {}
        self.global_stats = {}

    def create_safe_features(self, df: pd.DataFrame, is_training: bool = True) -> pd.DataFrame:
        """
        Tạo features an toàn từ dữ liệu giao dịch

        Args:
            df: DataFrame với các giao dịch
            is_training: True nếu đang train, False nếu inference

        Returns:
            DataFrame với features an toàn
        """
        print("=== CREATING SAFE FEATURES ===")

        # Sắp xếp theo thời gian để đảm bảo tính tuần tự
        df = df.sort_values(['step', 'nameOrig']).reset_index(drop=True)

        # Khởi tạo user history nếu training
        if is_training:
            self._build_user_history(df)

        # Tạo features cho từng giao dịch
        features_df = df.copy()

        # 1. Khoảng thời gian từ giao dịch hiện tại đến giao dịch trước đó
        features_df['time_since_last_tx'] = self._calculate_time_since_last_transaction(features_df)

        # 2. Số giao dịch của user trong 1 giờ trước đó
        features_df['tx_count_1h'] = self._calculate_transaction_count_1h(features_df)

        # 3. Tổng tiền giao dịch trong 24 giờ trước đó
        features_df['total_amount_24h'] = self._calculate_total_amount_24h(features_df)

        # 4. Số quốc gia/IP/device khác nhau user đã dùng trong 7 ngày trước
        # (Trong PaySim dataset, ta dùng type và amount patterns thay thế)
        features_df['unique_types_7d'] = self._calculate_unique_types_7d(features_df)
        features_df['amount_variability_7d'] = self._calculate_amount_variability_7d(features_df)

        # 5. Tần suất giao dịch bất thường so với lịch sử trước đây
        features_df['amount_anomaly_score'] = self._calculate_amount_anomaly_score(features_df)
        features_df['frequency_anomaly_score'] = self._calculate_frequency_anomaly_score(features_df)

        # 6. Features bổ sung an toàn
        features_df['is_weekend'] = (features_df['step'] % 7).isin([0, 6]).astype(int)
        features_df['hour_of_day'] = features_df['step'] % 24
        features_df['is_business_hour'] = features_df['hour_of_day'].between(9, 17).astype(int)

        print(f"Đã tạo {len([col for col in features_df.columns if col not in df.columns])} features an toàn")

        return features_df

    def _build_user_history(self, df: pd.DataFrame):
        """Xây dựng lịch sử user cho tính toán features"""
        print("Building user history...")

        self.user_history = {}

        for user in df['nameOrig'].unique():
            user_data = df[df['nameOrig'] == user].sort_values('step')
            self.user_history[user] = {
                'transactions': user_data.to_dict('records'),
                'stats': self._calculate_user_stats(user_data)
            }

        print(f"Đã xây lịch sử cho {len(self.user_history)} users")

    def _calculate_user_stats(self, user_data: pd.DataFrame) -> Dict:
        """Tính thống kê cơ bản của user"""
        return {
            'total_tx': len(user_data),
            'avg_amount': user_data['amount'].mean(),
            'std_amount': user_data['amount'].std(),
            'avg_time_between_tx': self._calculate_avg_time_between(user_data),
            'common_types': user_data['type'].value_counts().to_dict(),
            'first_tx_step': user_data['step'].min(),
            'last_tx_step': user_data['step'].max()
        }

    def _calculate_avg_time_between(self, user_data: pd.DataFrame) -> float:
        """Tính thời gian trung bình giữa các giao dịch"""
        if len(user_data) <= 1:
            return 0

        steps = user_data['step'].sort_values()
        time_diffs = steps.diff().dropna()
        return time_diffs.mean()

    def _calculate_time_since_last_transaction(self, df: pd.DataFrame) -> pd.Series:
        """Tính khoảng thời gian từ giao dịch hiện tại đến giao dịch trước đó của cùng user"""
        time_since_last = []

        for idx, row in df.iterrows():
            user = row['nameOrig']
            current_step = row['step']

            if user in self.user_history:
                # Tìm giao dịch trước đó của user này
                prev_tx = None
                for tx in self.user_history[user]['transactions']:
                    if tx['step'] < current_step:
                        prev_tx = tx
                    else:
                        break

                if prev_tx:
                    time_since_last.append(current_step - prev_tx['step'])
                else:
                    time_since_last.append(0)  # Giao dịch đầu tiên
            else:
                time_since_last.append(0)  # User mới

        return pd.Series(time_since_last, index=df.index)

    def _calculate_transaction_count_1h(self, df: pd.DataFrame) -> pd.Series:
        """Đếm số giao dịch của user trong 1 giờ (24 steps) trước đó"""
        tx_counts = []

        for idx, row in df.iterrows():
            user = row['nameOrig']
            current_step = row['step']

            if user in self.user_history:
                # Đếm giao dịch trong 24 steps trước
                count = sum(1 for tx in self.user_history[user]['transactions']
                          if tx['step'] < current_step and current_step - tx['step'] <= 24)
                tx_counts.append(count)
            else:
                tx_counts.append(0)

        return pd.Series(tx_counts, index=df.index)

    def _calculate_total_amount_24h(self, df: pd.DataFrame) -> pd.Series:
        """Tính tổng tiền giao dịch của user trong 24 giờ (576 steps) trước đó"""
        total_amounts = []

        for idx, row in df.iterrows():
            user = row['nameOrig']
            current_step = row['step']

            if user in self.user_history:
                # Tính tổng amount trong 576 steps trước
                total = sum(tx['amount'] for tx in self.user_history[user]['transactions']
                          if tx['step'] < current_step and current_step - tx['step'] <= 576)
                total_amounts.append(total)
            else:
                total_amounts.append(0)

        return pd.Series(total_amounts, index=df.index)

    def _calculate_unique_types_7d(self, df: pd.DataFrame) -> pd.Series:
        """Đếm số loại giao dịch khác nhau user đã dùng trong 7 ngày (1680 steps) trước"""
        unique_counts = []

        for idx, row in df.iterrows():
            user = row['nameOrig']
            current_step = row['step']

            if user in self.user_history:
                # Thu thập types trong 1680 steps trước
                types = set(tx['type'] for tx in self.user_history[user]['transactions']
                          if tx['step'] < current_step and current_step - tx['step'] <= 1680)
                unique_counts.append(len(types))
            else:
                unique_counts.append(0)

        return pd.Series(unique_counts, index=df.index)

    def _calculate_amount_variability_7d(self, df: pd.DataFrame) -> pd.Series:
        """Tính độ biến động số tiền trong 7 ngày trước"""
        variabilities = []

        for idx, row in df.iterrows():
            user = row['nameOrig']
            current_step = row['step']

            if user in self.user_history:
                # Thu thập amounts trong 1680 steps trước
                amounts = [tx['amount'] for tx in self.user_history[user]['transactions']
                          if tx['step'] < current_step and current_step - tx['step'] <= 1680]

                if len(amounts) > 1:
                    # Coefficient of variation (std/mean)
                    cv = np.std(amounts) / np.mean(amounts) if np.mean(amounts) > 0 else 0
                    variabilities.append(cv)
                else:
                    variabilities.append(0)
            else:
                variabilities.append(0)

        return pd.Series(variabilities, index=df.index)

    def _calculate_amount_anomaly_score(self, df: pd.DataFrame) -> pd.Series:
        """Tính điểm bất thường của số tiền so với lịch sử user"""
        anomaly_scores = []

        for idx, row in df.iterrows():
            user = row['nameOrig']
            current_amount = row['amount']

            if user in self.user_history and self.user_history[user]['stats']['total_tx'] > 1:
                stats = self.user_history[user]['stats']
                mean_amount = stats['avg_amount']
                std_amount = stats['std_amount'] or 1  # Tránh chia cho 0

                # Z-score
                z_score = abs(current_amount - mean_amount) / std_amount
                anomaly_scores.append(min(z_score, 5))  # Cap at 5
            else:
                anomaly_scores.append(0)  # Không đủ dữ liệu lịch sử

        return pd.Series(anomaly_scores, index=df.index)

    def _calculate_frequency_anomaly_score(self, df: pd.DataFrame) -> pd.Series:
        """Tính điểm bất thường về tần suất giao dịch"""
        frequency_scores = []

        for idx, row in df.iterrows():
            user = row['nameOrig']
            current_step = row['step']

            if user in self.user_history and self.user_history[user]['stats']['total_tx'] > 1:
                stats = self.user_history[user]['stats']
                avg_time_between = stats['avg_time_between_tx']

                if avg_time_between > 0:
                    # Tìm giao dịch trước đó
                    prev_tx_time = None
                    for tx in reversed(self.user_history[user]['transactions']):
                        if tx['step'] < current_step:
                            prev_tx_time = tx['step']
                            break

                    if prev_tx_time:
                        time_since_last = current_step - prev_tx_time
                        # So sánh với pattern bình thường
                        if time_since_last < avg_time_between * 0.5:  # Giao dịch quá nhanh
                            frequency_scores.append(2.0)
                        elif time_since_last > avg_time_between * 3:  # Giao dịch quá chậm
                            frequency_scores.append(1.0)
                        else:
                            frequency_scores.append(0.0)
                    else:
                        frequency_scores.append(0.0)
                else:
                    frequency_scores.append(0.0)
            else:
                frequency_scores.append(0.0)

        return pd.Series(frequency_scores, index=df.index)

# Global instance
safe_engineer = SafeFeatureEngineer()

def create_safe_features(df: pd.DataFrame, is_training: bool = True) -> pd.DataFrame:
    """Function wrapper để tạo features an toàn"""
    return safe_engineer.create_safe_features(df, is_training)