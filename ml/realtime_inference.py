"""Backward-compatibility shim — canonical code lives in ml.inference.realtime_inference."""

import os, sys
_PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if _PROJECT_ROOT not in sys.path:
    sys.path.insert(0, _PROJECT_ROOT)

from ml.inference.realtime_inference import RealtimeFraudDetector  # noqa: F401

__all__ = ["RealtimeFraudDetector"]

if __name__ == "__main__":
    import os

    MODEL_DIR = os.path.join(_PROJECT_ROOT, "models")
    print(f"[TEST] Khởi tạo RealtimeFraudDetector từ: {MODEL_DIR}")

    try:
        detector = RealtimeFraudDetector(model_dir=MODEL_DIR)
        print("[OK] Detector khởi tạo thành công")
    except FileNotFoundError as e:
        print(f"[SKIP] Chưa có model artifacts: {e}")
        print("       Chạy 'python ml/train.py' để huấn luyện model trước.")
        raise SystemExit(0)

    # ── Seed behavioral history cho các user test ─────────────────────────────
    # Fraud scenarios cần lịch sử để OnlineFeatureState tính được z-score,
    # frequency change, time_since_last — những features quan trọng nhất của model.

    # User C123456789: lịch sử giao dịch nhỏ → đột ngột TRANSFER cực lớn
    detector.seed_user_history(
        "C123456789",
        past_amounts=[4000.0, 5500.0, 3200.0, 6000.0, 4800.0],
        past_steps=[-5.0, -4.0, -3.0, -2.0, -1.0],
        past_counterparties=["M100", "M200", "M300", "M400", "M500"],
    )
    # User C999888777: lịch sử giao dịch nhỏ → đột ngột TRANSFER 2 triệu
    detector.seed_user_history(
        "C999888777",
        past_amounts=[10000.0, 8000.0, 12000.0, 9000.0, 11000.0],
        past_steps=[-5.0, -4.0, -3.0, -2.0, -1.0],
        past_counterparties=["M101", "M201", "M301", "M401", "M501"],
    )
    # User C777888999: nhiều CASH_OUT nhỏ liên tiếp trong thời gian ngắn
    detector.seed_user_history(
        "C777888999",
        past_amounts=[1800.0, 2200.0, 1900.0, 2100.0, 2000.0],
        past_steps=[28.5, 28.6, 28.7, 28.8, 28.9],
        past_counterparties=["C_A", "C_B", "C_C", "C_D", "C_E"],
    )
    # User C555666777: lịch sử bình thường → CASH_OUT lớn + nhiều giao dịch gần nhau
    detector.seed_user_history(
        "C555666777",
        past_amounts=[50000.0, 45000.0, 60000.0, 55000.0, 48000.0],
        past_steps=[43.5, 43.6, 43.7, 43.8, 43.9],
        past_counterparties=["C_X", "C_Y", "C_X", "C_Y", "C_Z"],
    )
    # User C333444555: lịch sử PAYMENT nhỏ → đột ngột PAYMENT lớn bất thường
    detector.seed_user_history(
        "C333444555",
        past_amounts=[500.0, 800.0, 600.0, 700.0, 550.0],
        past_steps=[23.0, 23.5, 24.0, 24.5, 24.9],
        past_counterparties=["M_A", "M_B", "M_C", "M_D", "M_E"],
    )

    # Các giao dịch test (không cần file CSV)
    test_transactions = [
    # 1. TRANSFER lớn đến tài khoản rỗng — khả năng gian lận cao
    #    Lịch sử: giao dịch ~5K → đột ngột 450K (amount_zscore rất cao)
        {
            "label": "TRANSFER lớn đến tài khoản rỗng — khả năng gian lận cao",
            "tx": {
                "step": 1, "type": "TRANSFER", "amount": 450000.0,
                "nameOrig": "C123456789", "oldbalanceOrg": 450000.0,
                "nameDest": "C987654321", "oldbalanceDest": 0.0,
            },
        },
        # 2. PAYMENT nhỏ thông thường — an toàn
        #    Không có lịch sử đặc biệt, giao dịch bình thường
        {
            "label": "PAYMENT nhỏ thông thường — an toàn",
            "tx": {
                "step": 5, "type": "PAYMENT", "amount": 120.0,
                "nameOrig": "C111222333", "oldbalanceOrg": 5000.0,
                "nameDest": "M123456789", "oldbalanceDest": 50000.0,
            },
        },
        # 3. CASH_OUT trung bình — rủi ro vừa (user khác để tránh conflict với case 10)
        {
            "label": "CASH_OUT trung bình — rủi ro vừa",
            "tx": {
                "step": 10, "type": "CASH_OUT", "amount": 75000.0,
                "nameOrig": "C555000777", "oldbalanceOrg": 80000.0,
                "nameDest": "C444333222", "oldbalanceDest": 0.0,
            },
        },
        # 4. TRANSFER cực lớn — khả năng gian lận rất cao
        #    Lịch sử: giao dịch ~10K → đột ngột 2 triệu (amount_zscore cực cao)
        {
            "label": "TRANSFER cực lớn — khả năng gian lận rất cao",
            "tx": {
                "step": 15, "type": "TRANSFER", "amount": 2000000.0,
                "nameOrig": "C999888777", "oldbalanceOrg": 2000000.0,
                "nameDest": "C111222333", "oldbalanceDest": 0.0,
            },
        },
        # 5. CASH_IN nhỏ từ ngân hàng — an toàn
        {
            "label": "CASH_IN nhỏ từ ngân hàng — an toàn",
            "tx": {
                "step": 20, "type": "CASH_IN", "amount": 500.0,
                "nameOrig": "M555666777", "oldbalanceOrg": 1000.0,
                "nameDest": "C222333444", "oldbalanceDest": 5000.0,
            },
        },
        # 6. PAYMENT lớn bất thường — rủi ro vừa
        #    Lịch sử: PAYMENT nhỏ ~600 → đột ngột 120K (amount_zscore cao)
        {
            "label": "PAYMENT lớn bất thường — rủi ro vừa",
            "tx": {
                "step": 25, "type": "PAYMENT", "amount": 120000.0,
                "nameOrig": "C333444555", "oldbalanceOrg": 150000.0,
                "nameDest": "M666777888", "oldbalanceDest": 50000.0,
            },
        },
        # 7. CASH_OUT nhỏ nhưng liên tục — khả năng gian lận trung bình
        #    Lịch sử: 5 CASH_OUT trong 0.5 step (frequency_change rất cao)
        {
            "label": "CASH_OUT nhỏ liên tục — khả năng gian lận trung bình",
            "tx": {
                "step": 30, "type": "CASH_OUT", "amount": 2000.0,
                "nameOrig": "C777888999", "oldbalanceOrg": 5000.0,
                "nameDest": "C111000222", "oldbalanceDest": 0.0,
            },
        },
        # 8. TRANSFER từ người mới — rủi ro cao
        #    Không có lịch sử, chuyển toàn bộ số dư
        {
            "label": "TRANSFER từ người mới — rủi ro cao",
            "tx": {
                "step": 35, "type": "TRANSFER", "amount": 80000.0,
                "nameOrig": "C000111222", "oldbalanceOrg": 80000.0,
                "nameDest": "C333444555", "oldbalanceDest": 1000.0,
            },
        },
        # 9. PAYMENT nhỏ thường xuyên — an toàn
        #    User C111222333 đã xuất hiện ở case 2 (PAYMENT 120) → có lịch sử
        {
            "label": "PAYMENT nhỏ thường xuyên — an toàn",
            "tx": {
                "step": 40, "type": "PAYMENT", "amount": 50.0,
                "nameOrig": "C111222333", "oldbalanceOrg": 1000.0,
                "nameDest": "M444555666", "oldbalanceDest": 2000.0,
            },
        },
        # 10. CASH_OUT lớn, nhiều giao dịch gần nhau — nguy cơ cao
        #     Lịch sử: 5 giao dịch trong 0.5 step (frequency_change cực cao)
        {
            "label": "CASH_OUT lớn, nhiều giao dịch gần nhau — nguy cơ cao",
            "tx": {
                "step": 45, "type": "CASH_OUT", "amount": 300000.0,
                "nameOrig": "C555666777", "oldbalanceOrg": 350000.0,
                "nameDest": "C888999000", "oldbalanceDest": 0.0,
            },
        },
    ]

    print()
    for case in test_transactions:
        print(f"--- {case['label']} ---")
        result = detector.predict(case["tx"])
        print(f"  is_fraud    : {result.get('is_fraud')}")
        print(f"  risk_score  : {result.get('risk_score', 0):.4f}")
        print(f"  risk_level  : {result.get('risk_level')}")
        print(f"  probability : {result.get('fraud_probability', 0):.4f}")
        reasons = result.get('reasons') or result.get('explanation', [])
        for r in reasons:
            print(f"  * {r}")
        print()

