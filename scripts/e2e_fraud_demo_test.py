"""
E2E Fraud Detection Demo Test
==============================
Gửi nhiều loại giao dịch đến API, kiểm tra Redis keys, Alerts, Inference History.

Cách chạy:
    cd D:\\FraudDetect
    venv\\Scripts\\activate
    python scripts/e2e_fraud_demo_test.py

Yêu cầu:
    - Backend đang chạy tại http://localhost:8000
    - Redis đang chạy (docker-redis-1 hoặc local)
    - pip install requests redis
    - Có tài khoản ADMIN (mặc định: admin@frauddetect.com / Admin@123456)
    - Có tài khoản USER  (mặc định: user@frauddetect.com / User@123456)
"""

from __future__ import annotations

import json
import os
import sys
import time
from datetime import datetime, timezone
from typing import Any

# ── Optional: redis-py để kiểm tra keys trực tiếp ────────────────────────────
try:
    import redis as _redis_lib
    REDIS_AVAILABLE = True
except ImportError:
    REDIS_AVAILABLE = False

try:
    import requests
except ImportError:
    print("❌ Thiếu thư viện 'requests'. Chạy: pip install requests")
    sys.exit(1)

# ═══════════════════════════════════════════════════════════════════════════════
# CONFIG
# ═══════════════════════════════════════════════════════════════════════════════
BASE_URL   = os.getenv("DEMO_API_URL",   "http://localhost:8000")
REDIS_URL  = os.getenv("DEMO_REDIS_URL", "redis://localhost:6379/0")

# Tài khoản admin (có thể gọi /authorize)
ADMIN_EMAIL    = os.getenv("DEMO_ADMIN_EMAIL",    "admin@frauddetect.com")
ADMIN_PASSWORD = os.getenv("DEMO_ADMIN_PASSWORD", "Admin@123456")

# Tài khoản user thường (gọi /check và /detect-fraud)
USER_EMAIL    = os.getenv("DEMO_USER_EMAIL",    "user@frauddetect.com")
USER_PASSWORD = os.getenv("DEMO_USER_PASSWORD", "User@123456")

PAUSE_BETWEEN_REQUESTS = 0.3   # giây — tránh spam quá nhanh


# ═══════════════════════════════════════════════════════════════════════════════
# HELPERS
# ═══════════════════════════════════════════════════════════════════════════════

class Color:
    RESET  = "\033[0m"
    BOLD   = "\033[1m"
    RED    = "\033[91m"
    GREEN  = "\033[92m"
    YELLOW = "\033[93m"
    CYAN   = "\033[96m"
    GRAY   = "\033[90m"
    MAGENTA = "\033[95m"


def _c(text: str, color: str) -> str:
    return f"{color}{text}{Color.RESET}"


def _print_section(title: str) -> None:
    print(f"\n{Color.BOLD}{'═'*60}{Color.RESET}")
    print(f"{Color.BOLD}{Color.CYAN}  {title}{Color.RESET}")
    print(f"{Color.BOLD}{'═'*60}{Color.RESET}")


def _print_request(method: str, url: str, payload: dict | None) -> None:
    print(f"\n{_c('→ REQUEST', Color.GRAY)}  {_c(method, Color.BOLD)} {url}")
    if payload:
        body_str = json.dumps(payload, ensure_ascii=False, separators=(",", ":"))
        if len(body_str) > 200:
            body_str = body_str[:200] + "…"
        print(f"  {_c('payload:', Color.GRAY)} {body_str}")


def _print_response(resp: requests.Response, label: str = "") -> dict:
    try:
        data = resp.json()
    except Exception:
        data = {"raw": resp.text}

    status_color = Color.GREEN if resp.status_code < 400 else (
        Color.YELLOW if resp.status_code == 429 else Color.RED
    )
    print(f"  {_c('← RESPONSE', Color.GRAY)}  HTTP {_c(str(resp.status_code), status_color)}"
          + (f"  {_c(label, Color.MAGENTA)}" if label else ""))

    # Log các trường quan trọng
    fields = ["is_fraud", "risk_score", "risk_level", "decision",
              "should_block", "block_reason", "fraud_probability",
              "authorized", "explanation_text", "reasons"]
    printed: list[str] = []
    for f in fields:
        if f in data:
            val = data[f]
            if f in ("is_fraud", "should_block", "authorized") and val is True:
                printed.append(f"  {_c(f, Color.BOLD)} = {_c(str(val), Color.RED)}")
            elif f in ("risk_level",) and val in ("HIGH",):
                printed.append(f"  {_c(f, Color.BOLD)} = {_c(str(val), Color.RED)}")
            else:
                printed.append(f"  {_c(f, Color.BOLD)} = {str(val)}")
    if printed:
        print("\n".join(printed))

    explanation = data.get("explanation") or {}
    if isinstance(explanation, dict):
        reasons = explanation.get("key_factors") or data.get("reasons") or []
        if reasons:
            print(f"  {_c('reasons:', Color.GRAY)} {reasons[:3]}")

    return data


# ═══════════════════════════════════════════════════════════════════════════════
# AUTH HELPER
# ═══════════════════════════════════════════════════════════════════════════════

class ApiClient:
    """Thin wrapper quanh requests.Session, tự thêm Authorization header."""

    def __init__(self, base_url: str) -> None:
        self.base_url = base_url.rstrip("/")
        self._session = requests.Session()
        self._session.headers.update({"Content-Type": "application/json"})
        self.token: str | None = None
        self.role: str = "unknown"

    def set_token(self, token: str, role: str = "unknown") -> None:
        self.token = token
        self.role = role
        self._session.headers["Authorization"] = f"Bearer {token}"

    def clear_token(self) -> None:
        self.token = None
        self._session.headers.pop("Authorization", None)

    def login(self, email: str, password: str) -> bool:
        url = f"{self.base_url}/api/v1/auth/login"
        _print_request("POST", url, {"email": email, "password": "***"})
        try:
            resp = self._session.post(url, json={"email": email, "password": password}, timeout=10)
            if resp.status_code == 200:
                data = resp.json()
                self.set_token(data["access_token"], data["user"]["role"])
                print(f"  {_c('✅ Login OK', Color.GREEN)} — role={self.role}  email={email}")
                return True
            else:
                print(f"  {_c('❌ Login FAILED', Color.RED)} HTTP {resp.status_code}: {resp.text[:200]}")
                return False
        except requests.RequestException as exc:
            print(f"  {_c('❌ Connection error', Color.RED)}: {exc}")
            return False

    def get(self, path: str, **kwargs) -> requests.Response:
        return self._session.get(f"{self.base_url}{path}", timeout=10, **kwargs)

    def post(self, path: str, json_data: dict | list, **kwargs) -> requests.Response:
        return self._session.post(f"{self.base_url}{path}", json=json_data, timeout=10, **kwargs)


# ═══════════════════════════════════════════════════════════════════════════════
# REDIS INSPECTOR
# ═══════════════════════════════════════════════════════════════════════════════

class RedisInspector:
    def __init__(self, url: str) -> None:
        self._client = None
        if REDIS_AVAILABLE:
            try:
                self._client = _redis_lib.Redis.from_url(url, decode_responses=True, socket_timeout=1)
                self._client.ping()
            except Exception as exc:
                print(f"  {_c('[Redis]', Color.YELLOW)} không kết nối được: {exc}")
                self._client = None

    def keys(self, pattern: str) -> list[str]:
        if not self._client:
            return []
        try:
            return list(self._client.keys(pattern))  # type: ignore[return-value]
        except Exception:
            return []

    def get(self, key: str) -> str | None:
        if not self._client:
            return None
        try:
            return self._client.get(key)
        except Exception:
            return None

    def print_rate_keys(self, user_id: str) -> None:
        pattern = f"ratelimit:{user_id}:*"
        keys = self.keys(pattern)
        if keys:
            for k in keys:
                val = self.get(k)
                print(f"  {_c('[Redis]', Color.CYAN)} {k} = {_c(str(val), Color.YELLOW)}")
        else:
            print(f"  {_c('[Redis]', Color.GRAY)} Không tìm thấy key: {pattern}"
                  + ("  (Redis unavailable)" if not self._client else "  ← in-memory fallback?"))

    def print_decision_cache(self) -> None:
        keys = self.keys("decision:*")
        print(f"  {_c('[Redis]', Color.CYAN)} decision cache keys: {len(keys)}")
        for k in keys[:3]:
            print(f"    {k[:60]}…")

    def print_behavioral_keys(self, user_id: str) -> None:
        keys = self.keys(f"user_events:{user_id}*") + self.keys(f"txn_events:{user_id}*")
        if keys:
            for k in keys[:3]:
                print(f"  {_c('[Redis]', Color.CYAN)} {k}")
        else:
            print(f"  {_c('[Redis]', Color.GRAY)} Không có behavioral key cho user={user_id}")


# ═══════════════════════════════════════════════════════════════════════════════
# TEST CASES
# ═══════════════════════════════════════════════════════════════════════════════

# ── Giao dịch bình thường ────────────────────────────────────────────────────
NORMAL_CHECK = {
    "user_id": "C111111111",
    "amount": 5000.0,
    "type": "PAYMENT",
    "oldbalanceOrg": 50000.0,
    "oldbalanceDest": 10000.0,
    "timestamp": datetime.now(timezone.utc).isoformat(),
    "receiver_account": "M987654321",
}

NORMAL_DETECT = {
    "step": 1,
    "type": "PAYMENT",
    "amount": 8000.0,
    "nameOrig": "C111111111",
    "nameDest": "M987654321",
    "oldbalanceOrg": 50000.0,
    "newbalanceOrig": 42000.0,
    "oldbalanceDest": 10000.0,
    "newbalanceDest": 18000.0,
}

# ── Giao dịch nghi ngờ (drain origin) ────────────────────────────────────────
SUSPICIOUS_CHECK = {
    "user_id": "C222222222",
    "amount": 450000.0,
    "type": "TRANSFER",
    "oldbalanceOrg": 450000.0,
    "oldbalanceDest": 0.0,
    "timestamp": datetime.now(timezone.utc).isoformat(),
    "receiver_account": "C000000001",
}

SUSPICIOUS_AUTHORIZE = {
    "step": 1,
    "type": "TRANSFER",
    "amount": 450000.0,
    "nameOrig": "C222222222",
    "nameDest": "C000000001",
    "oldbalanceOrg": 450000.0,
    "newbalanceOrig": 0.0,
    "oldbalanceDest": 0.0,
    "newbalanceDest": 450000.0,
}

# ── Zero-amount probe attack ──────────────────────────────────────────────────
ZERO_AMOUNT_AUTHORIZE = {
    "step": 2,
    "type": "TRANSFER",
    "amount": 0.0,
    "nameOrig": "C333333333",
    "nameDest": "C000000002",
    "oldbalanceOrg": 100000.0,
    "newbalanceOrig": 100000.0,
    "oldbalanceDest": 0.0,
    "newbalanceDest": 0.0,
}

# ── Vượt số dư (insufficient balance) ───────────────────────────────────────
INSUFFICIENT_AUTHORIZE = {
    "step": 3,
    "type": "CASH_OUT",
    "amount": 999999.0,
    "nameOrig": "C444444444",
    "nameDest": "C000000003",
    "oldbalanceOrg": 1000.0,
    "newbalanceOrig": 0.0,
    "oldbalanceDest": 0.0,
    "newbalanceDest": 999999.0,
}

# ── Cold start user (lần đầu giao dịch) ──────────────────────────────────────
COLD_START_CHECK = {
    "user_id": f"C_COLD_{int(time.time())}",
    "amount": 12000.0,
    "type": "TRANSFER",
    "oldbalanceOrg": 50000.0,
    "oldbalanceDest": 0.0,
    "timestamp": datetime.now(timezone.utc).isoformat(),
    "receiver_account": "C999999999",
}

# ── Batch giao dịch (mix normal + fraud) ─────────────────────────────────────
BATCH_TRANSACTIONS: list[dict] = [
    {   # bình thường
        "step": 1, "type": "PAYMENT", "amount": 3000.0,
        "nameOrig": "C555001", "nameDest": "M000001",
        "oldbalanceOrg": 30000.0, "newbalanceOrig": 27000.0,
        "oldbalanceDest": 5000.0, "newbalanceDest": 8000.0,
    },
    {   # nghi ngờ cao
        "step": 1, "type": "TRANSFER", "amount": 200000.0,
        "nameOrig": "C555002", "nameDest": "C000002",
        "oldbalanceOrg": 200000.0, "newbalanceOrig": 0.0,
        "oldbalanceDest": 0.0, "newbalanceDest": 200000.0,
    },
    {   # bình thường
        "step": 2, "type": "CASH_IN", "amount": 50000.0,
        "nameOrig": "C555003", "nameDest": "M000002",
        "oldbalanceOrg": 100000.0, "newbalanceOrig": 150000.0,
        "oldbalanceDest": 0.0, "newbalanceDest": 50000.0,
    },
]


# ═══════════════════════════════════════════════════════════════════════════════
# STATS TRACKING
# ═══════════════════════════════════════════════════════════════════════════════

class Stats:
    def __init__(self) -> None:
        self.total = 0
        self.fraud = 0
        self.blocked_403 = 0
        self.rate_limited_429 = 0
        self.errors_5xx = 0
        self.redis_keys_found: set[str] = set()
        self.alerts_before = 0
        self.alerts_after  = 0

    def record(self, resp: requests.Response, result: dict) -> None:
        self.total += 1
        if resp.status_code == 429:
            self.rate_limited_429 += 1
        elif resp.status_code == 403:
            self.blocked_403 += 1
        elif resp.status_code >= 500:
            self.errors_5xx += 1
        if result.get("is_fraud") is True:
            self.fraud += 1
        if result.get("authorized") is False and result.get("fraud_probability", 0) >= 0.9:
            self.fraud += 1

    def print_summary(self) -> None:
        _print_section("DEMO SUMMARY")
        print(f"  Total requests  : {_c(str(self.total), Color.BOLD)}")
        print(f"  Fraud detected  : {_c(str(self.fraud), Color.RED)}")
        print(f"  Blocked (403)   : {_c(str(self.blocked_403), Color.RED)}")
        print(f"  Rate-limited(429): {_c(str(self.rate_limited_429), Color.YELLOW)}")
        print(f"  Server errors   : {_c(str(self.errors_5xx), Color.RED)}")
        if self.redis_keys_found:
            print(f"  Redis keys seen : {_c(str(len(self.redis_keys_found)), Color.GREEN)}")
            for k in sorted(self.redis_keys_found)[:10]:
                print(f"    {_c(k, Color.GRAY)}")
        delta_alerts = self.alerts_after - self.alerts_before
        print(f"  Alerts created  : {_c(str(delta_alerts), Color.YELLOW)}"
              f"  (before={self.alerts_before}, after={self.alerts_after})")
        print()


stats = Stats()


# ═══════════════════════════════════════════════════════════════════════════════
# SCENARIO RUNNERS
# ═══════════════════════════════════════════════════════════════════════════════

def _check_redis_after(redis: RedisInspector, user_id: str, s: Stats) -> None:
    keys = redis.keys(f"ratelimit:{user_id}:*")
    if keys:
        s.redis_keys_found.update(keys)
    redis.print_rate_keys(user_id)


def scenario_01_normal_transaction(client: ApiClient, redis: RedisInspector, s: Stats) -> None:
    _print_section("SCENARIO 01 — Giao dịch bình thường (/transactions/check)")
    url = "/api/v1/transactions/check"
    _print_request("POST", f"{client.base_url}{url}", NORMAL_CHECK)
    resp = client.post(url, NORMAL_CHECK)
    result = _print_response(resp, "Normal PAYMENT")
    s.record(resp, result)
    time.sleep(PAUSE_BETWEEN_REQUESTS)
    _check_redis_after(redis, NORMAL_CHECK["user_id"], s)

    print(f"\n  {_c('UI Effect:', Color.MAGENTA)}")
    print("    → CheckTransaction page: hiển thị is_fraud=False, risk_score thấp, badge xanh")
    print("    → Dashboard: total_requests +1, fraud_detected không tăng")
    print("    → Alerts: KHÔNG thêm record mới")


def scenario_02_suspicious_check(client: ApiClient, redis: RedisInspector, s: Stats) -> None:
    _print_section("SCENARIO 02 — Giao dịch nghi ngờ (/transactions/check)")
    url = "/api/v1/transactions/check"
    _print_request("POST", f"{client.base_url}{url}", SUSPICIOUS_CHECK)
    resp = client.post(url, SUSPICIOUS_CHECK)
    result = _print_response(resp, "Suspicious TRANSFER (drain)")
    s.record(resp, result)
    time.sleep(PAUSE_BETWEEN_REQUESTS)
    _check_redis_after(redis, SUSPICIOUS_CHECK["user_id"], s)

    print(f"\n  {_c('UI Effect:', Color.MAGENTA)}")
    print("    → CheckTransaction page: is_fraud=True (nếu ML phát hiện), risk badge ĐỎ")
    print("    → Dashboard: fraud_detected +1")
    print("    → Alerts: THÊM record FRAUD_DETECTED (bell icon cập nhật)")


def scenario_03_authorize_normal(client: ApiClient, redis: RedisInspector, s: Stats) -> None:
    _print_section("SCENARIO 03 — Authorize giao dịch bình thường")
    url = "/api/v1/transactions/authorize"
    tx: dict[str, Any] = {
        "step": 1, "type": "PAYMENT", "amount": 10000.0,
        "nameOrig": "C777777777", "nameDest": "M000099",
        "oldbalanceOrg": 200000.0, "newbalanceOrig": 190000.0,
        "oldbalanceDest": 5000.0, "newbalanceDest": 15000.0,
    }
    _print_request("POST", f"{client.base_url}{url}", tx)
    resp = client.post(url, tx)
    result = _print_response(resp, "Authorize PAYMENT — expect ALLOW")
    s.record(resp, result)
    time.sleep(PAUSE_BETWEEN_REQUESTS)
    _check_redis_after(redis, tx["nameOrig"], s)
    redis.print_decision_cache()

    print(f"\n  {_c('UI Effect:', Color.MAGENTA)}")
    print("    → Authorize page: badge XANH — APPROVED")
    print("    → Redis decision cache: key 'decision:{sha256}' lưu kết quả 60s")
    print("    → Alerts: không tạo alert mới")


def scenario_04_authorize_rule_block(client: ApiClient, redis: RedisInspector, s: Stats) -> None:
    _print_section("SCENARIO 04 — Authorize BỊ CHẶN bởi Rule (zero-amount probe)")
    url = "/api/v1/transactions/authorize"
    _print_request("POST", f"{client.base_url}{url}", ZERO_AMOUNT_AUTHORIZE)
    resp = client.post(url, ZERO_AMOUNT_AUTHORIZE)
    result = _print_response(resp, "RULE_ZERO_AMOUNT → BLOCK (403)")
    s.record(resp, result)
    time.sleep(PAUSE_BETWEEN_REQUESTS)

    print(f"\n  {_c('UI Effect:', Color.MAGENTA)}")
    print("    → Authorize page: badge ĐỎ — BLOCKED")
    print("    → block_reason: 'Zero-amount transfer'")
    print("    → Alerts: THÊM FRAUD_BLOCKED (nếu is_fraud được set)")
    print("    → logs/fraud_audit.log: ghi JSON-line với event=AUTHORIZE decision=BLOCK")


def scenario_05_authorize_insufficient(client: ApiClient, redis: RedisInspector, s: Stats) -> None:
    _print_section("SCENARIO 05 — Authorize BỊ CHẶN bởi Rule (vượt số dư)")
    url = "/api/v1/transactions/authorize"
    _print_request("POST", f"{client.base_url}{url}", INSUFFICIENT_AUTHORIZE)
    resp = client.post(url, INSUFFICIENT_AUTHORIZE)
    result = _print_response(resp, "RULE_INSUFFICIENT_BALANCE → BLOCK (403)")
    s.record(resp, result)
    time.sleep(PAUSE_BETWEEN_REQUESTS)

    print(f"\n  {_c('UI Effect:', Color.MAGENTA)}")
    print("    → HTTP 403, authorized=False")
    print("    → block_reason: 'Số tiền vượt quá số dư tài khoản nguồn'")
    print("    → triggered_by: RULE_INSUFFICIENT_BALANCE")


def scenario_06_authorize_ml_block(client: ApiClient, redis: RedisInspector, s: Stats) -> None:
    _print_section("SCENARIO 06 — Authorize giao dịch nghi ngờ (drain → ML block)")
    url = "/api/v1/transactions/authorize"
    _print_request("POST", f"{client.base_url}{url}", SUSPICIOUS_AUTHORIZE)
    resp = client.post(url, SUSPICIOUS_AUTHORIZE)
    result = _print_response(resp, "Suspicious TRANSFER → ML/Rule BLOCK")
    s.record(resp, result)
    time.sleep(PAUSE_BETWEEN_REQUESTS)
    _check_redis_after(redis, SUSPICIOUS_AUTHORIZE["nameOrig"], s)
    redis.print_decision_cache()

    print(f"\n  {_c('UI Effect:', Color.MAGENTA)}")
    print("    → HTTP 403, authorized=False")
    print("    → Alerts: THÊM FRAUD_BLOCKED, bell icon header nhấp nháy")
    print("    → Dashboard: blocked_transactions_total tăng (Prometheus)")
    print("    → Redis cache: lưu kết quả BLOCK 60s (retry cùng tx → hit cache)")


def scenario_07_cold_start(client: ApiClient, redis: RedisInspector, s: Stats) -> None:
    _print_section("SCENARIO 07 — Cold-start user (lần đầu giao dịch)")
    url = "/api/v1/transactions/check"
    _print_request("POST", f"{client.base_url}{url}", COLD_START_CHECK)
    resp = client.post(url, COLD_START_CHECK)
    result = _print_response(resp, "Cold-start user")
    s.record(resp, result)
    time.sleep(PAUSE_BETWEEN_REQUESTS)
    user_id = COLD_START_CHECK["user_id"]
    redis.print_behavioral_keys(user_id)
    _check_redis_after(redis, user_id, s)

    print(f"\n  {_c('UI Effect:', Color.MAGENTA)}")
    print("    → Check page: risk score có thể cao hơn (cold-start penalty)")
    print("    → reasons có thể chứa 'Cold start — no behavioral history'")
    print("    → Redis: user_events:{user_id} được tạo sau lần đầu (nếu Redis bật)")


def scenario_08_burst_attack(client: ApiClient, redis: RedisInspector, s: Stats) -> None:
    _print_section("SCENARIO 08 — Burst Attack (>10 requests/phút từ cùng user)")
    url = "/api/v1/transactions/check"
    attacker_id = "C_ATTACK_USER"
    base_tx = {
        "user_id": attacker_id,
        "amount": 1000.0,
        "type": "TRANSFER",
        "oldbalanceOrg": 100000.0,
        "oldbalanceDest": 0.0,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "receiver_account": "C000000099",
    }

    print(f"  Gửi 14 requests từ user={_c(attacker_id, Color.YELLOW)}…")
    for i in range(1, 15):
        tx = {**base_tx, "timestamp": datetime.now(timezone.utc).isoformat()}
        resp = client.post(url, tx)
        try:
            data = resp.json()
        except Exception:
            data = {}
        status_color = Color.GREEN if resp.status_code == 200 else (
            Color.YELLOW if resp.status_code == 429 else Color.RED
        )
        verdict = "OK" if resp.status_code == 200 else ("RATE_LIMITED" if resp.status_code == 429 else "ERROR")
        print(f"    #{i:02d} HTTP {_c(str(resp.status_code), status_color)} — {_c(verdict, status_color)}"
              + (f"  risk={data.get('risk_score', '-')}" if resp.status_code == 200 else ""))
        s.record(resp, data)
        time.sleep(0.1)

    print(f"\n  {_c('[Redis keys sau burst]', Color.CYAN)}")
    _check_redis_after(redis, attacker_id, s)

    print(f"\n  {_c('UI Effect:', Color.MAGENTA)}")
    print("    → Từ request thứ 11+: HTTP 429 VELOCITY_ABUSE")
    print("    → Redis: key ratelimit:{user}:{minute} tăng dần")
    print("    → Alerts: không tạo (rate limit không phải fraud)")
    print("    → Logs: [RATE_LIMIT] redis user=C_ATTACK_USER BLOCKED count=11")


def scenario_09_cross_user(client: ApiClient, redis: RedisInspector, s: Stats) -> None:
    _print_section("SCENARIO 09 — Cross-user attack (cùng nameDest, nhiều nameOrig)")
    url = "/api/v1/transactions/authorize"
    target_dest = "C_TARGET_DEST"
    results = []

    for i in range(1, 4):
        tx = {
            "step": i, "type": "TRANSFER", "amount": 150000.0,
            "nameOrig": f"C_ATTACKER_{i:03d}",
            "nameDest": target_dest,
            "oldbalanceOrg": 150000.0, "newbalanceOrig": 0.0,
            "oldbalanceDest": 0.0, "newbalanceDest": 150000.0,
        }
        _print_request("POST", f"{client.base_url}{url}", tx)
        resp = client.post(url, tx)
        result = _print_response(resp, f"Attacker #{i}")
        results.append((resp.status_code, result))
        s.record(resp, result)
        time.sleep(PAUSE_BETWEEN_REQUESTS)

    print(f"\n  {_c('UI Effect:', Color.MAGENTA)}")
    print("    → Mỗi giao dịch đến cùng nameDest=C_TARGET_DEST")
    print("    → ML nhận diện pattern: RULE_NEW_DEST_LARGE hoặc ML score cao")
    print("    → Alerts: nhiều FRAUD_BLOCKED (bell icon tăng lên)")


def scenario_10_batch_detect(client: ApiClient, redis: RedisInspector, s: Stats) -> None:
    _print_section("SCENARIO 10 — Batch Detection (3 transactions)")
    url = "/api/v1/batch-detect-fraud"
    _print_request("POST", f"{client.base_url}{url}", BATCH_TRANSACTIONS)
    resp = client.post(url, BATCH_TRANSACTIONS)

    try:
        data = resp.json()
    except Exception:
        data = {}

    status_color = Color.GREEN if resp.status_code == 200 else Color.RED
    print(f"  {_c('← RESPONSE', Color.GRAY)} HTTP {_c(str(resp.status_code), status_color)}")

    if "results" in data:
        for idx, r in enumerate(data["results"], 1):
            is_fraud = r.get("is_fraud", False)
            fraud_color = Color.RED if is_fraud else Color.GREEN
            print(f"    [{idx}] is_fraud={_c(str(is_fraud), fraud_color)}"
                  f"  risk_score={r.get('risk_score', r.get('fraud_score', '-')):.3f}"
                  f"  decision={r.get('decision', '-')}")
            s.total += 1
            if is_fraud:
                s.fraud += 1

    print(f"\n  {_c('UI Effect:', Color.MAGENTA)}")
    print("    → Batch CSV page: hiển thị bảng kết quả với từng dòng có màu")
    print("    → Alerts: tất cả giao dịch fraud được persist ĐỒNG BỘ trước response")
    print("    → Bell icon header cập nhật ngay khi frontend poll (1.5s)")
    print("    → Inference history: ghi 3 records vào DB (background)")


def scenario_11_detect_fraud(client: ApiClient, redis: RedisInspector, s: Stats) -> None:
    _print_section("SCENARIO 11 — Detect Fraud (/detect-fraud)")
    url = "/api/v1/detect-fraud"
    _print_request("POST", f"{client.base_url}{url}", NORMAL_DETECT)
    resp = client.post(url, NORMAL_DETECT)
    result = _print_response(resp, "detect-fraud endpoint")
    s.record(resp, result)
    time.sleep(PAUSE_BETWEEN_REQUESTS)

    print(f"\n  {_c('UI Effect:', Color.MAGENTA)}")
    print("    → Response chứa explanation dict với key_factors, SHAP values")
    print("    → Dashboard: inference_history +1")
    print("    → Nếu fraud: Alerts +1 (FRAUD_DETECTED)")


# ═══════════════════════════════════════════════════════════════════════════════
# VERIFY ALERTS + INFERENCE HISTORY
# ═══════════════════════════════════════════════════════════════════════════════

def check_alerts(client: ApiClient, label: str) -> int:
    """Lấy số lượng alerts hiện tại."""
    resp = client.get("/api/v1/alerts?limit=1&offset=0")
    if resp.status_code == 200:
        data = resp.json()
        total = data.get("total", 0)
        print(f"  {_c('[Alerts]', Color.CYAN)} {label}: total={_c(str(total), Color.YELLOW)}")
        return total
    else:
        print(f"  {_c('[Alerts]', Color.GRAY)} Không lấy được ({resp.status_code})")
        return 0


def check_inference_history(client: ApiClient) -> int:
    """Lấy số lượng inference history records."""
    resp = client.get("/api/v1/inference-history?limit=1&offset=0")
    if resp.status_code == 200:
        data = resp.json()
        total = data.get("total", 0)
        print(f"  {_c('[Inference History]', Color.CYAN)} total={_c(str(total), Color.YELLOW)}")
        return total
    else:
        print(f"  {_c('[Inference History]', Color.GRAY)} Không lấy được ({resp.status_code})")
        return 0


def check_stats(client: ApiClient) -> None:
    """In stats từ /stats endpoint."""
    resp = client.get("/api/v1/stats")
    if resp.status_code == 200:
        data = resp.json()
        print(f"  {_c('[Stats]', Color.CYAN)}"
              f"  today_requests={data.get('today_requests', 0)}"
              f"  today_fraud={data.get('today_fraud', 0)}"
              f"  avg_risk={data.get('avg_risk_score', 0):.3f}")
    else:
        print(f"  {_c('[Stats]', Color.GRAY)} /stats trả về {resp.status_code}")


def check_health(client: ApiClient) -> None:
    """Kiểm tra /health endpoint."""
    resp = client.get("/api/v1/health")
    if resp.status_code == 200:
        data = resp.json()
        s = data.get("status", "unknown")
        color = Color.GREEN if s == "healthy" else Color.YELLOW
        print(f"  {_c('[Health]', Color.CYAN)} status={_c(s, color)}")
    else:
        print(f"  {_c('[Health]', Color.RED)} /health trả về {resp.status_code}")


# ═══════════════════════════════════════════════════════════════════════════════
# MAIN
# ═══════════════════════════════════════════════════════════════════════════════

def main() -> None:
    print(f"\n{Color.BOLD}{'='*60}")
    print("  🕵️  FRAUD DETECTION — E2E DEMO TEST")
    print(f"{'='*60}{Color.RESET}")
    print(f"  API: {_c(BASE_URL, Color.CYAN)}")
    print(f"  Redis: {_c(REDIS_URL, Color.CYAN)}")
    print(f"  Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

    # ── Khởi tạo client + redis inspector ─────────────────────────────────
    client = ApiClient(BASE_URL)
    redis  = RedisInspector(REDIS_URL)

    # ── Health check trước tiên ─────────────────────────────────────────────
    _print_section("PRE-CHECK — Kiểm tra hệ thống")
    check_health(client)
    if not REDIS_AVAILABLE:
        print(f"  {_c('[Redis]', Color.YELLOW)} redis-py không cài — bỏ qua kiểm tra Redis keys")
        print(f"    Cài bằng: pip install redis")

    # ── Đăng nhập ADMIN ────────────────────────────────────────────────────
    _print_section("AUTH — Đăng nhập")
    admin_ok = client.login(ADMIN_EMAIL, ADMIN_PASSWORD)
    if not admin_ok:
        print(f"\n  {_c('⚠️  Không đăng nhập được với ADMIN. Thử tiếp với token rỗng.', Color.YELLOW)}")
        print(f"     Kiểm tra: DEMO_ADMIN_EMAIL={ADMIN_EMAIL}  DEMO_ADMIN_PASSWORD={ADMIN_PASSWORD}")
        print(f"     Hoặc tạo user trực tiếp trong DB / qua /api/v1/auth/register")

    # ── Snapshot alerts trước khi chạy ─────────────────────────────────────
    stats.alerts_before = check_alerts(client, "BEFORE demo")
    ih_before = check_inference_history(client)

    # ── Chạy các scenario ─────────────────────────────────────────────────
    scenario_01_normal_transaction(client, redis, stats)
    scenario_02_suspicious_check(client, redis, stats)
    scenario_03_authorize_normal(client, redis, stats)
    scenario_04_authorize_rule_block(client, redis, stats)
    scenario_05_authorize_insufficient(client, redis, stats)
    scenario_06_authorize_ml_block(client, redis, stats)
    scenario_07_cold_start(client, redis, stats)
    scenario_08_burst_attack(client, redis, stats)
    scenario_09_cross_user(client, redis, stats)
    scenario_10_batch_detect(client, redis, stats)
    scenario_11_detect_fraud(client, redis, stats)

    # ── Snapshot sau demo ─────────────────────────────────────────────────
    _print_section("POST-CHECK — Trạng thái sau demo")
    stats.alerts_after = check_alerts(client, "AFTER demo")
    ih_after = check_inference_history(client)
    check_stats(client)

    print(f"\n  {_c('[Inference History]', Color.CYAN)}"
          f" BEFORE={ih_before}  AFTER={ih_after}"
          f"  delta=+{ih_after - ih_before}")

    # ── Print summary ─────────────────────────────────────────────────────
    stats.print_summary()

    print(f"{Color.BOLD}Xem chi tiết tại:{Color.RESET}")
    print(f"  📊 Dashboard:        http://localhost:5173/dashboard")
    print(f"  🔔 Alerts:           http://localhost:5173/alerts")
    print(f"  🔍 Inference Hist:   http://localhost:5173/dashboard (card click)")
    print(f"  📋 API Docs:         {BASE_URL}/docs")
    print(f"  📈 Metrics:          {BASE_URL}/metrics")
    print()


if __name__ == "__main__":
    main()
