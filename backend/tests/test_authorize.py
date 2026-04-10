"""Unit tests cho endpoint POST /api/v1/transactions/authorize.

Kiểm tra các trường hợp:
  - BLOCK: xác suất gian lận cao (>= auto_block_threshold)
  - ALLOW: xác suất gian lận thấp (< decision_threshold)
  - MANUAL_REVIEW: xác suất trung bình (>= manual_review_threshold nhưng < auto_block_threshold)
  - Rule-based trigger: chặn do zero-amount transfer

Cách chạy (từ thư mục gốc dự án, môi trường venv đã active):
    pytest backend/tests/test_authorize.py -v
"""

import json
import sys
from pathlib import Path
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi.testclient import TestClient

# ── Thêm backend/app vào sys.path để import được các module nội bộ ──────────
_BACKEND_APP = str(Path(__file__).resolve().parents[1] / "app")
if _BACKEND_APP not in sys.path:
    sys.path.insert(0, _BACKEND_APP)


# ── Stub các service nặng trước khi import app ───────────────────────────────
# Tránh load model ML thật trong unit test

def _make_detector_mock(fraud_probability: float) -> MagicMock:
    """Tạo mock cho RealtimeFraudDetector.predict() với xác suất cho trước."""
    mock = MagicMock()
    mock.predict.return_value = {
        "is_fraud": fraud_probability >= 0.35,
        "fraud_probability": fraud_probability,
        "risk_score": fraud_probability,
        "risk_level": "HIGH" if fraud_probability >= 0.75 else (
            "MEDIUM" if fraud_probability >= 0.35 else "LOW"
        ),
        "decision_threshold": 0.35,
        "reasons": ["Mocked test reason"],
    }
    return mock


# Payload hợp lệ dùng chung cho các test
_BASE_PAYLOAD = {
    "step": 1,
    "type": "TRANSFER",
    "amount": 450000.0,
    "oldbalanceOrg": 500000.0,
    "newbalanceOrig": 50000.0,
    "oldbalanceDest": 10000.0,
    "newbalanceDest": 460000.0,
    "nameOrig": "C123456789",
    "nameDest": "C987654321",
}


# ──────────────────────────────────────────────────────────────────────────────
# Fixtures
# ──────────────────────────────────────────────────────────────────────────────

@pytest.fixture()
def client_high_risk():
    """Client với detector mock trả về fraud_probability = 0.87 (BLOCK)."""
    with patch(
        "services.realtime_check_service.RealtimeCheckService.__init__",
        return_value=None,
    ):
        from fastapi import FastAPI
        from api.transactions import router

        app = FastAPI()
        app.include_router(router, prefix="/api/v1")

        # Gắn detector mock vào realtime_service sau khi router đã load
        import api.transactions as tx_module
        tx_module.realtime_service = MagicMock()
        tx_module.realtime_service.detector = _make_detector_mock(0.87)

        with TestClient(app, raise_server_exceptions=True) as c:
            yield c


@pytest.fixture()
def client_low_risk():
    """Client với detector mock trả về fraud_probability = 0.10 (ALLOW)."""
    with patch(
        "services.realtime_check_service.RealtimeCheckService.__init__",
        return_value=None,
    ):
        from fastapi import FastAPI
        from api.transactions import router

        app = FastAPI()
        app.include_router(router, prefix="/api/v1")

        import api.transactions as tx_module
        tx_module.realtime_service = MagicMock()
        tx_module.realtime_service.detector = _make_detector_mock(0.10)

        with TestClient(app, raise_server_exceptions=True) as c:
            yield c


@pytest.fixture()
def client_medium_risk():
    """Client với detector mock trả về fraud_probability = 0.61 (MANUAL_REVIEW)."""
    with patch(
        "services.realtime_check_service.RealtimeCheckService.__init__",
        return_value=None,
    ):
        from fastapi import FastAPI
        from api.transactions import router

        app = FastAPI()
        app.include_router(router, prefix="/api/v1")

        import api.transactions as tx_module
        tx_module.realtime_service = MagicMock()
        tx_module.realtime_service.detector = _make_detector_mock(0.61)

        with TestClient(app, raise_server_exceptions=True) as c:
            yield c


# ──────────────────────────────────────────────────────────────────────────────
# Tests
# ──────────────────────────────────────────────────────────────────────────────

class TestRuleBasedPrecheck:
    """Kiểm tra hàm _rule_based_precheck() trực tiếp — không cần HTTP."""

    def test_zero_amount_transfer_blocks(self):
        """Giao dịch TRANSFER với amount=0 phải bị chặn ngay."""
        from api.transactions import _rule_based_precheck

        result = _rule_based_precheck({
            "type": "TRANSFER",
            "amount": 0.0,
            "oldbalanceOrg": 100.0,
            "newbalanceOrig": 100.0,
            "oldbalanceDest": 50.0,
            "nameDest": "C999",
        })
        assert result is not None
        assert result["block"] is True
        assert result["triggered_by"] == "RULE_ZERO_AMOUNT"

    def test_drain_origin_rule(self):
        """Tài khoản nguồn về 0 sau TRANSFER → flag HIGH, không chặn ngay."""
        from api.transactions import _rule_based_precheck

        result = _rule_based_precheck({
            "type": "TRANSFER",
            "amount": 500000.0,
            "oldbalanceOrg": 500000.0,
            "newbalanceOrig": 0.0,
            "oldbalanceDest": 10.0,
            "nameDest": "M123",
        })
        assert result is not None
        assert result["block"] is False
        assert result["triggered_by"] == "RULE_DRAIN_ORIGIN"
        assert result["risk_level"] == "HIGH"

    def test_new_dest_large_amount_rule(self):
        """Chuyển khoản lớn tới tài khoản đích C... có số dư 0 → flag HIGH."""
        from api.transactions import _rule_based_precheck

        result = _rule_based_precheck({
            "type": "TRANSFER",
            "amount": 200000.0,
            "oldbalanceOrg": 300000.0,
            "newbalanceOrig": 100000.0,
            "oldbalanceDest": 0.0,
            "nameDest": "C111222333",
        })
        assert result is not None
        assert result["triggered_by"] == "RULE_NEW_DEST_LARGE"

    def test_normal_transaction_returns_none(self):
        """Giao dịch bình thường không match rule nào → None."""
        from api.transactions import _rule_based_precheck

        result = _rule_based_precheck({
            "type": "PAYMENT",
            "amount": 5000.0,
            "oldbalanceOrg": 20000.0,
            "newbalanceOrig": 15000.0,
            "oldbalanceDest": 3000.0,
            "nameDest": "M555",
        })
        assert result is None

    def test_zero_amount_non_transfer_not_blocked(self):
        """PAYMENT với amount=0 không phải TRANSFER → không block bởi rule 1."""
        from api.transactions import _rule_based_precheck

        result = _rule_based_precheck({
            "type": "PAYMENT",
            "amount": 0.0,
            "oldbalanceOrg": 100.0,
            "newbalanceOrig": 100.0,
            "oldbalanceDest": 50.0,
            "nameDest": "M999",
        })
        # Không match rule zero-amount TRANSFER
        assert result is None or result["triggered_by"] != "RULE_ZERO_AMOUNT"


class TestAuthorizeEndpointBlock:
    """Kiểm tra trường hợp BLOCK (HTTP 403)."""

    def test_block_returns_403(self, client_high_risk):
        resp = client_high_risk.post("/api/v1/transactions/authorize", json=_BASE_PAYLOAD)
        assert resp.status_code == 403

    def test_block_response_shape(self, client_high_risk):
        resp = client_high_risk.post("/api/v1/transactions/authorize", json=_BASE_PAYLOAD)
        body = resp.json()
        assert body["authorized"] is False
        assert "transaction_id" in body
        assert "block_reason" in body
        assert "risk_level" in body
        assert body["risk_level"] == "HIGH"
        assert "fraud_probability" in body
        assert body["fraud_probability"] >= 0.75
        assert "recommendations" in body
        assert len(body["recommendations"]) > 0
        assert "reference_id" in body


class TestAuthorizeEndpointAllow:
    """Kiểm tra trường hợp ALLOW (HTTP 200)."""

    def test_allow_returns_200(self, client_low_risk):
        resp = client_low_risk.post("/api/v1/transactions/authorize", json=_BASE_PAYLOAD)
        assert resp.status_code == 200

    def test_allow_response_shape(self, client_low_risk):
        resp = client_low_risk.post("/api/v1/transactions/authorize", json=_BASE_PAYLOAD)
        body = resp.json()
        assert body["authorized"] is True
        assert "transaction_id" in body
        assert body["risk_level"] == "LOW"
        assert body["fraud_probability"] < 0.35
        # Không được có block_reason khi ALLOW
        assert body.get("block_reason") is None
        # Không cần review khi LOW risk
        assert body.get("flagged_for_review") is None


class TestAuthorizeEndpointManualReview:
    """Kiểm tra trường hợp ALLOW + flagged_for_review (HTTP 200)."""

    def test_manual_review_returns_200(self, client_medium_risk):
        resp = client_medium_risk.post("/api/v1/transactions/authorize", json=_BASE_PAYLOAD)
        assert resp.status_code == 200

    def test_manual_review_response_shape(self, client_medium_risk):
        resp = client_medium_risk.post("/api/v1/transactions/authorize", json=_BASE_PAYLOAD)
        body = resp.json()
        assert body["authorized"] is True
        assert body.get("flagged_for_review") is True
        assert "review_reason" in body
        assert body["risk_level"] == "MEDIUM"


class TestAuthorizeRuleBasedViaHTTP:
    """Kiểm tra rule-based trigger qua HTTP (zero-amount transfer)."""

    def test_zero_amount_transfer_blocked_via_http(self, client_low_risk):
        """Ngay cả khi detector mock trả LOW risk,
        zero-amount TRANSFER phải bị chặn bởi rule → 403.
        """
        payload = {**_BASE_PAYLOAD, "amount": 0.0}
        resp = client_low_risk.post("/api/v1/transactions/authorize", json=payload)
        assert resp.status_code == 403
        body = resp.json()
        assert body["authorized"] is False
        assert "Zero-amount" in body.get("block_reason", "")


# ──────────────────────────────────────────────────────────────────────────────
# Tests — POST /alerts/{alert_id}/acknowledge
# ──────────────────────────────────────────────────────────────────────────────

def _make_alerts_app():
    """Tạo FastAPI app chỉ mount alerts router, với DB disabled."""
    from fastapi import FastAPI
    from api.alerts import router as alerts_router

    app = FastAPI()
    app.include_router(alerts_router, prefix="/api/v1")
    return app


class TestAcknowledgeAlert:
    """Kiểm tra POST /api/v1/alerts/{alert_id}/acknowledge với action body."""

    def _client(self):
        return TestClient(_make_alerts_app(), raise_server_exceptions=True)

    def test_invalid_action_returns_400(self):
        """action không hợp lệ → 400 Bad Request."""
        client = self._client()
        resp = client.post(
            "/api/v1/alerts/ALERT-001/acknowledge",
            json={"action": "delete"},
        )
        assert resp.status_code == 400
        assert "Invalid action" in resp.json().get("detail", "")

    def test_missing_action_field_returns_422(self):
        """Thiếu field action trong body → Pydantic trả 422 Unprocessable Entity."""
        client = self._client()
        resp = client.post(
            "/api/v1/alerts/ALERT-001/acknowledge",
            json={},
        )
        assert resp.status_code == 422

    def test_ignore_action_maps_to_false_positive(self):
        """action='ignore' → DB phải được update thành 'false_positive'.

        DB disabled trong test → 503 Service Unavailable (expected).
        Quan trọng: không được 400 (action validation phải pass).
        """
        client = self._client()
        resp = client.post(
            "/api/v1/alerts/ALERT-001/acknowledge",
            json={"action": "ignore"},
        )
        # DB disabled → 503, nhưng action validation đã pass (không phải 400)
        assert resp.status_code == 503
        assert resp.status_code != 400

    def test_resolve_action_maps_to_resolved(self):
        """action='resolve' → DB phải được update thành 'resolved'.

        DB disabled trong test → 503. Action validation phải pass.
        """
        client = self._client()
        resp = client.post(
            "/api/v1/alerts/ALERT-001/acknowledge",
            json={"action": "resolve"},
        )
        assert resp.status_code == 503
        assert resp.status_code != 400

    def test_acknowledge_with_db_mock(self):
        """action='resolve' với DB mock → response trả status='resolved'."""
        import api.alerts as alerts_module
        from unittest.mock import AsyncMock, patch

        mock_conn = AsyncMock()
        mock_conn.execute.return_value = "UPDATE 1"  # 1 row updated

        with patch.object(alerts_module, "acquire_connection", return_value=mock_conn), \
             patch.object(alerts_module, "release_connection", new_callable=AsyncMock), \
             patch.object(alerts_module, "is_db_enabled", return_value=True):
            client = self._client()
            resp = client.post(
                "/api/v1/alerts/ALERT-TEST-001/acknowledge",
                json={"action": "resolve"},
            )

        assert resp.status_code == 200
        body = resp.json()
        assert body["alert_id"] == "ALERT-TEST-001"
        assert body["status"] == "resolved"
        assert "acknowledged_at" in body

    def test_ignore_action_with_db_mock_sets_false_positive(self):
        """action='ignore' với DB mock → response trả status='false_positive'."""
        import api.alerts as alerts_module
        from unittest.mock import AsyncMock, patch

        mock_conn = AsyncMock()
        mock_conn.execute.return_value = "UPDATE 1"

        with patch.object(alerts_module, "acquire_connection", return_value=mock_conn), \
             patch.object(alerts_module, "release_connection", new_callable=AsyncMock), \
             patch.object(alerts_module, "is_db_enabled", return_value=True):
            client = self._client()
            resp = client.post(
                "/api/v1/alerts/ALERT-TEST-002/acknowledge",
                json={"action": "ignore"},
            )

        assert resp.status_code == 200
        body = resp.json()
        assert body["alert_id"] == "ALERT-TEST-002"
        assert body["status"] == "false_positive"

    def test_acknowledge_not_found_returns_404(self):
        """alert_id không tồn tại trong DB → 404 Not Found."""
        import api.alerts as alerts_module
        from unittest.mock import AsyncMock, patch

        mock_conn = AsyncMock()
        mock_conn.execute.return_value = "UPDATE 0"  # 0 rows updated

        with patch.object(alerts_module, "acquire_connection", return_value=mock_conn), \
             patch.object(alerts_module, "release_connection", new_callable=AsyncMock), \
             patch.object(alerts_module, "is_db_enabled", return_value=True):
            client = self._client()
            resp = client.post(
                "/api/v1/alerts/NONEXISTENT/acknowledge",
                json={"action": "resolve"},
            )

        assert resp.status_code == 404
