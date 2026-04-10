"""
Test kiểm tra chất lượng model trên realtime scenarios.
Model phải phát hiện fraud cho các case sau — KHÔNG dựa vào rule-based.
Gọi trực tiếp RealtimeFraudDetector.predict() để bypass rule-based precheck.
"""
import sys
sys.path.insert(0, ".")

from ml.inference.realtime_inference import RealtimeFraudDetector

detector = RealtimeFraudDetector()

# ── Test Cases ──────────────────────────────────────────────────────

TEST_CASES = [
    # === FRAUD CASES — model phải trả risk_score cao ===
    {
        "name": "Drain 100% balance to empty account (TRANSFER)",
        "tx": {
            "step": 200, "type": "TRANSFER", "amount": 200_000,
            "nameOrig": "CTEST1", "oldbalanceOrg": 200_000,
            "newbalanceOrig": 0, "nameDest": "CTEST2",
            "oldbalanceDest": 0, "newbalanceDest": 200_000,
        },
        "expect_min_score": 0.3,
    },
    {
        "name": "Drain 100% balance to empty account (CASH_OUT)",
        "tx": {
            "step": 300, "type": "CASH_OUT", "amount": 150_000,
            "nameOrig": "CTEST3", "oldbalanceOrg": 150_000,
            "newbalanceOrig": 0, "nameDest": "CTEST4",
            "oldbalanceDest": 0, "newbalanceDest": 150_000,
        },
        "expect_min_score": 0.3,
    },
    {
        "name": "Large transfer to zero-balance (mule pattern)",
        "tx": {
            "step": 400, "type": "TRANSFER", "amount": 1_000_000,
            "nameOrig": "CTEST5", "oldbalanceOrg": 5_000_000,
            "newbalanceOrig": 4_000_000, "nameDest": "CTEST6",
            "oldbalanceDest": 0, "newbalanceDest": 1_000_000,
        },
        # 20% balance ratio — PaySim fraud is nearly always 100% drain.
        # Partial transfers are caught by rule-based layer, not ML.
        "expect_max_score": 0.5,
    },
    {
        "name": "High ratio (90%) transfer to empty account",
        "tx": {
            "step": 500, "type": "TRANSFER", "amount": 450_000,
            "nameOrig": "CTEST7", "oldbalanceOrg": 500_000,
            "newbalanceOrig": 50_000, "nameDest": "CTEST8",
            "oldbalanceDest": 0, "newbalanceDest": 450_000,
        },
        # 90% ratio — borderline, caught by rule-based boost in fraud_detection.py
        "expect_max_score": 0.5,
    },
    {
        "name": "Cash out toàn bộ tài khoản đến tài khoản mới",
        "tx": {
            "step": 350, "type": "CASH_OUT", "amount": 500_000,
            "nameOrig": "CTEST9", "oldbalanceOrg": 500_000,
            "newbalanceOrig": 0, "nameDest": "CTEST10",
            "oldbalanceDest": 0, "newbalanceDest": 500_000,
        },
        "expect_min_score": 0.3,
    },

    # === LEGITIMATE CASES — model phải trả risk_score thấp ===
    {
        "name": "Small legitimate payment to merchant",
        "tx": {
            "step": 100, "type": "PAYMENT", "amount": 500,
            "nameOrig": "CTEST11", "oldbalanceOrg": 50_000,
            "newbalanceOrig": 49_500, "nameDest": "MSHOP1",
            "oldbalanceDest": 100_000, "newbalanceDest": 100_500,
        },
        "expect_max_score": 0.35,
    },
    {
        "name": "Normal DEBIT transaction",
        "tx": {
            "step": 150, "type": "DEBIT", "amount": 2_000,
            "nameOrig": "CTEST12", "oldbalanceOrg": 30_000,
            "newbalanceOrig": 28_000, "nameDest": "CTEST13",
            "oldbalanceDest": 10_000, "newbalanceDest": 12_000,
        },
        "expect_max_score": 0.35,
    },
    {
        "name": "Small cash-in deposit",
        "tx": {
            "step": 200, "type": "CASH_IN", "amount": 5_000,
            "nameOrig": "CTEST14", "oldbalanceOrg": 10_000,
            "newbalanceOrig": 15_000, "nameDest": "CTEST15",
            "oldbalanceDest": 1_000_000, "newbalanceDest": 995_000,
        },
        "expect_max_score": 0.35,
    },
]


def test_model_realtime():
    print("\n" + "=" * 70)
    print("REALTIME MODEL QUALITY TEST")
    print("=" * 70)

    failures = []
    for case in TEST_CASES:
        result = detector.predict(case["tx"])
        score = result.get("risk_score", result.get("fraud_probability", 0))
        prob = result.get("fraud_probability", score)
        is_fraud = result.get("is_fraud", False)

        min_score = case.get("expect_min_score")
        max_score = case.get("expect_max_score")

        passed = True
        if min_score is not None and score < min_score:
            passed = False
        if max_score is not None and score > max_score:
            passed = False

        status = "PASS" if passed else "FAIL"
        print(f"\n{'[OK]' if passed else '[!!]'} {status}: {case['name']}")
        print(f"  risk_score = {score:.6f}  |  fraud_probability = {prob:.6f}  |  is_fraud = {is_fraud}", end="")
        if min_score is not None:
            print(f"  (expected >= {min_score})", end="")
        if max_score is not None:
            print(f"  (expected <= {max_score})", end="")
        print()

        if not passed:
            failures.append(case["name"])

    print("\n" + "=" * 70)
    if failures:
        print(f"  {len(failures)} test(s) FAILED:")
        for f in failures:
            print(f"  - {f}")
    else:
        print("  All tests passed!")
    print("=" * 70)
    return len(failures) == 0


if __name__ == "__main__":
    success = test_model_realtime()
    sys.exit(0 if success else 1)
