# Demo suy luận phát hiện gian lận
# Tác giả: Tạo cho dự án FraudDetect
# Mô tả: Script demo cho suy luận phát hiện gian lận thời gian thực

import json
from train import FraudDetectionModel

def demo_inference():
    """Demo suy luận với các giao dịch mẫu"""

    # Khởi tạo mô hình
    model = FraudDetectionModel()

    # Các giao dịch mẫu (một số hợp pháp, một số gian lận)
    sample_transactions = [
        {
            "step": 1,
            "type": "PAYMENT",
            "amount": 100.0,
            "oldbalanceOrg": 1000.0,
            "newbalanceOrig": 900.0,
            "oldbalanceDest": 500.0,
            "newbalanceDest": 600.0
        },
        {
            "step": 2,
            "type": "TRANSFER",
            "amount": 50000.0,
            "oldbalanceOrg": 50000.0,
            "newbalanceOrig": 0.0,
            "oldbalanceDest": 0.0,
            "newbalanceDest": 50000.0
        },
        {
            "step": 3,
            "type": "CASH_OUT",
            "amount": 100000.0,
            "oldbalanceOrg": 100000.0,
            "newbalanceOrig": 0.0,
            "oldbalanceDest": 10000.0,
            "newbalanceDest": 110000.0
        }
    ]

    print("=== DEMO SUY LUẬN PHÁT HIỆN GIAN LẬN ===\n")

    for i, transaction in enumerate(sample_transactions, 1):
        print(f"Giao dịch {i}:")
        print(json.dumps(transaction, indent=2))

        result = model.predict_with_explanation(transaction)
        print("Kết quả dự đoán:")
        print(json.dumps(result, indent=2, ensure_ascii=False))
        print("-" * 50)

if __name__ == "__main__":
    demo_inference()