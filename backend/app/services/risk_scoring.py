"""Risk Scoring Service"""

import numpy as np
from typing import Dict, Any, Optional
import logging

logger = logging.getLogger(__name__)

class RiskScorer:
    """Service để tính điểm rủi ro realtime"""

    def __init__(self):
        # Risk weights cho các yếu tố
        self.risk_weights = {
            'amount': 0.3,
            'balance_diff': 0.25,
            'transaction_type': 0.2,
            'time_pattern': 0.15,
            'behavioral': 0.1
        }

    def calculate_risk_score(self, transaction: Dict[str, Any], model_score: float) -> float:
        """Tính điểm rủi ro tổng hợp từ nhiều yếu tố"""
        try:
            # Base score từ model
            base_score = model_score

            # Amount risk
            amount_risk = self._calculate_amount_risk(transaction)

            # Balance difference risk
            balance_risk = self._calculate_balance_risk(transaction)

            # Transaction type risk
            type_risk = self._calculate_type_risk(transaction)

            # Time pattern risk
            time_risk = self._calculate_time_risk(transaction)

            # Behavioral risk
            behavioral_risk = self._calculate_behavioral_risk(transaction)

            # Weighted sum
            total_risk = (
                base_score * self.risk_weights['amount'] +
                amount_risk * self.risk_weights['amount'] +
                balance_risk * self.risk_weights['balance_diff'] +
                type_risk * self.risk_weights['transaction_type'] +
                time_risk * self.risk_weights['time_pattern'] +
                behavioral_risk * self.risk_weights['behavioral']
            )

            # Normalize to 0-1
            final_score = min(max(total_risk, 0.0), 1.0)

            logger.info(f"Risk score calculated: {final_score:.4f}")
            return final_score

        except Exception as e:
            logger.error(f"Error calculating risk score: {str(e)}")
            return model_score  # Fallback to model score

    def _calculate_amount_risk(self, transaction: Dict[str, Any]) -> float:
        """Tính rủi ro dựa trên số tiền"""
        amount = transaction.get('amount', 0)

        # High risk thresholds
        if amount > 500000:
            return 0.9
        elif amount > 100000:
            return 0.7
        elif amount > 50000:
            return 0.5
        elif amount > 10000:
            return 0.3
        else:
            return 0.1

    def _calculate_balance_risk(self, transaction: Dict[str, Any]) -> float:
        """Tính rủi ro dựa trên thay đổi số dư"""
        old_org = transaction.get('oldbalanceOrg', 0)
        new_org = transaction.get('newbalanceOrig', 0)
        old_dest = transaction.get('oldbalanceDest', 0)
        new_dest = transaction.get('newbalanceDest', 0)

        # Check if origin account is emptied
        if old_org > 0 and new_org == 0:
            return 0.8

        # Check large balance changes
        org_change = abs(old_org - new_org)
        dest_change = abs(new_dest - old_dest)

        if org_change > old_org * 0.9:  # Transfer almost entire balance
            return 0.7

        return 0.2

    def _calculate_type_risk(self, transaction: Dict[str, Any]) -> float:
        """Tính rủi ro dựa trên loại giao dịch"""
        tx_type = transaction.get('type', '')

        risk_map = {
            'TRANSFER': 0.8,
            'CASH_OUT': 0.7,
            'PAYMENT': 0.2,
            'CASH_IN': 0.3,
            'DEBIT': 0.4
        }

        return risk_map.get(tx_type, 0.5)

    def _calculate_time_risk(self, transaction: Dict[str, Any]) -> float:
        """Tính rủi ro dựa trên pattern thời gian"""
        step = transaction.get('step', 0)
        hour = step % 24

        # High risk hours (midnight to 6 AM)
        if 0 <= hour <= 6:
            return 0.6
        # Medium risk hours (evening)
        elif 18 <= hour <= 23:
            return 0.4
        else:
            return 0.2

    def _calculate_behavioral_risk(self, transaction: Dict[str, Any]) -> float:
        """Tính rủi ro dựa trên pattern hành vi"""
        # This could be extended with historical data
        # For now, simple heuristics
        amount = transaction.get('amount', 0)
        old_org = transaction.get('oldbalanceOrg', 0)

        if old_org > 0 and amount == old_org:
            return 0.8  # Exact balance transfer

        return 0.3

# Global instance
risk_scorer = RiskScorer()

def get_risk_scorer() -> RiskScorer:
    """Factory function để lấy risk scorer instance"""
    return risk_scorer
