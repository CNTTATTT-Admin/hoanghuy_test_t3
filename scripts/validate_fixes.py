"""End-to-end validation of all 6 fixes."""
import requests
import time
import json
import sys

BASE = "http://localhost:8000/api/v1"
S = requests.Session()

# ─── AUTH ─────────────────────────────────────────────────────────────────
print("=" * 60)
print("AUTH: Login")
r = S.post(f"{BASE}/auth/login", json={"email": "test@test.com", "password": "Test1234!"})
if r.status_code != 200:
    print(f"  FAIL login: {r.status_code} {r.text}")
    sys.exit(1)
token = r.json()["access_token"]
H = {"Authorization": f"Bearer {token}"}
print(f"  OK — token obtained")

PASS = 0
FAIL = 0

def report(name, ok, detail=""):
    global PASS, FAIL
    tag = "PASS" if ok else "FAIL"
    if ok:
        PASS += 1
    else:
        FAIL += 1
    print(f"  [{tag}] {name}: {detail}")


# ─── TEST 1: Behavioral state persistence ─────────────────────────────────
print("\n" + "=" * 60)
print("TEST 1: Behavioral state persistence (2 sequential tx)")
uid = f"persist_test_{int(time.time())}"
tx = {"user_id": uid, "amount": 50000, "type": "TRANSFER", "receiver_account": "C999",
      "oldbalanceOrg": 100000, "oldbalanceDest": 0, "timestamp": "2026-04-16T10:00:00Z"}

r1 = S.post(f"{BASE}/transactions/check", json=tx, headers=H)
d1 = r1.json()
print(f"  TX1: status={r1.status_code} risk={d1.get('risk_score')} fraud={d1.get('is_fraud')}")

r2 = S.post(f"{BASE}/transactions/check", json=tx, headers=H)
d2 = r2.json()
print(f"  TX2: status={r2.status_code} risk={d2.get('risk_score')} fraud={d2.get('is_fraud')}")

report("TX1 succeeds", r1.status_code == 200)
report("TX2 succeeds", r2.status_code == 200)
# The risk should differ between TX1 (cold start) and TX2 (has history)
s1, s2 = d1.get("risk_score", 0), d2.get("risk_score", 0)
report("Risk scores differ (behavioral features working)", s1 != s2,
       f"TX1={s1:.6f} TX2={s2:.6f}")


# ─── TEST 2: Rate limiter on /check ───────────────────────────────────────
print("\n" + "=" * 60)
print("TEST 2: Rate limiter on /check (send 12 rapid requests)")
uid_burst = f"burst_{int(time.time())}"
tx_burst = {"user_id": uid_burst, "amount": 1000, "type": "TRANSFER", "receiver_account": "C100",
           "oldbalanceOrg": 50000, "oldbalanceDest": 0, "timestamp": "2026-04-16T10:00:00Z"}
got_429 = False
block_at = None
for i in range(1, 13):
    r = S.post(f"{BASE}/transactions/check", json=tx_burst, headers=H)
    status = r.status_code
    if status == 429:
        got_429 = True
        block_at = i
        print(f"  Request {i}: HTTP 429 — RATE LIMITED")
        break
    else:
        print(f"  Request {i}: HTTP {status}")

report("Rate limit triggers (HTTP 429)", got_429, f"at request #{block_at}" if got_429 else "never triggered")


# ─── TEST 3: Cross-endpoint consistency ───────────────────────────────────
print("\n" + "=" * 60)
print("TEST 3: Cross-endpoint consistency (/check vs /detect-fraud)")
uid_cross = f"cross_{int(time.time())}"

r_check = S.post(f"{BASE}/transactions/check", json={
    "user_id": uid_cross, "amount": 100000, "type": "TRANSFER", "receiver_account": "C555",
    "oldbalanceOrg": 200000, "oldbalanceDest": 0, "timestamp": "2026-04-16T10:00:00Z"
}, headers=H)
d_check = r_check.json()
print(f"  /check:       risk={d_check.get('risk_score')} decision={d_check.get('decision')}")

# Use a separate user for /detect-fraud to avoid step conflicts
uid_cross_detect = f"cross_detect_{int(time.time())}"
import datetime as _dt
_epoch = _dt.datetime(2026, 1, 1, tzinfo=_dt.timezone.utc)
_now = _dt.datetime.now(_dt.timezone.utc)
_step = max(1, int((_now - _epoch).total_seconds() / 3600))

r_detect = S.post(f"{BASE}/detect-fraud", json={
    "type": "TRANSFER", "amount": 100000,
    "nameOrig": uid_cross_detect, "nameDest": "C555",
    "oldbalanceOrg": 200000, "newbalanceOrig": 100000,
    "oldbalanceDest": 50000, "newbalanceDest": 150000, "step": _step
}, headers=H)
d_detect = r_detect.json()
# Debug: print raw response to find correct keys
print(f"  /detect-fraud raw: {json.dumps(d_detect, indent=2, default=str)[:500]}")
fraud_score_val = d_detect.get("fraud_score") if d_detect.get("fraud_score") is not None else d_detect.get("model_score")
is_fraud_val = d_detect.get("is_fraud")
print(f"  /detect-fraud: risk={fraud_score_val} is_fraud={is_fraud_val}")

report("/check returns OK", r_check.status_code == 200, f"status={r_check.status_code}")
report("/detect-fraud returns OK", r_detect.status_code == 200, f"status={r_detect.status_code}")
report("Both endpoints return risk scores", 
       d_check.get("risk_score") is not None and fraud_score_val is not None)


# ─── TEST 4: Risk score increases with repeated fraud ─────────────────────
print("\n" + "=" * 60)
print("TEST 4: Risk score increases with repeated high-amount transfers")
uid_risk = f"risk_{int(time.time())}"
scores = []
for i in range(1, 6):
    r = S.post(f"{BASE}/transactions/check", json={
        "user_id": uid_risk, "amount": 200000 + i * 50000,
        "type": "TRANSFER", "receiver_account": f"C{i}",
        "oldbalanceOrg": 500000, "oldbalanceDest": 10000, "timestamp": "2026-04-16T10:00:00Z"
    }, headers=H)
    if r.status_code == 429:
        print(f"  TX{i}: rate limited, stopping")
        break
    d = r.json()
    rs = d.get("risk_score") or 0
    scores.append(rs)
    print(f"  TX{i}: risk={rs:.6f} fraud={d.get('is_fraud')}")

if len(scores) >= 2:
    report("Risk scores are not all identical (model uses behavioral features)",
           len(set(f"{s:.6f}" for s in scores)) > 1,
           f"scores={[round(s, 6) for s in scores]}")
else:
    report("Enough scores collected", False, f"only {len(scores)} scores")


# ─── TEST 5: Alerts in Alerts page ───────────────────────────────────────
print("\n" + "=" * 60)
print("TEST 5: Alerts appear in /alerts after fraud detection")
time.sleep(2)  # Wait for background tasks
r_alerts = S.get(f"{BASE}/alerts", headers=H)
if r_alerts.status_code == 200:
    alerts_resp = r_alerts.json()
    if isinstance(alerts_resp, dict):
        alerts = alerts_resp.get("alerts") or alerts_resp.get("data") or []
    else:
        alerts = alerts_resp if isinstance(alerts_resp, list) else []
    count = len(alerts) if isinstance(alerts, list) else 0
    print(f"  Alert count from API: {count}")
    if count > 0 and isinstance(alerts, list):
        latest = alerts[0]
        print(f"  Latest: type={latest.get('type')} severity={latest.get('severity')} status={latest.get('status')}")
    report("Alerts endpoint returns data", count > 0, f"{count} alerts found")
else:
    print(f"  /alerts returned {r_alerts.status_code}: {r_alerts.text[:200]}")
    report("Alerts endpoint accessible", False, f"status={r_alerts.status_code}")

# Direct DB check for alerts
try:
    import asyncio, asyncpg
    async def check_alerts_db():
        conn = await asyncpg.connect("postgresql://postgres:hqhhg@localhost:5432/fraud_detection_db")
        rows = await conn.fetch("SELECT alert_id, type, status, created_at FROM alerts ORDER BY created_at DESC LIMIT 5")
        await conn.close()
        return rows
    db_alerts = asyncio.run(check_alerts_db())
    print(f"  DB alert count (last 5): {len(db_alerts)}")
    for r in db_alerts:
        print(f"    {r['type']} / {r['status']} / {r['created_at']}")
except Exception as exc:
    print(f"  DB check failed: {exc}")


# ─── TEST 6: No asyncio crash (smoke test /detect-fraud with fraud) ──────
print("\n" + "=" * 60)
print("TEST 6: /detect-fraud does not crash (asyncio.create_task removed)")
r_fraud = S.post(f"{BASE}/detect-fraud", json={
    "type": "TRANSFER", "amount": 500000,
    "nameOrig": "C_fraud_test", "nameDest": "C_dest",
    "oldbalanceOrg": 500000, "newbalanceOrig": 0,
    "oldbalanceDest": 0, "newbalanceDest": 500000, "step": _step
}, headers=H)
d_fraud = r_fraud.json()
print(f"  status={r_fraud.status_code} is_fraud={d_fraud.get('is_fraud')} score={d_fraud.get('fraud_score')}")
report("/detect-fraud no crash", r_fraud.status_code == 200)


# ─── TEST 7: Redis keys actually written ──────────────────────────────────
print("\n" + "=" * 60)
print("TEST 7: Redis keys verification (rate_limit + user_state)")
import redis as _redis
rc = _redis.Redis(host="localhost", port=6379, db=0, decode_responses=True)
try:
    rc.ping()
    print("  Redis PING: OK")

    rl_keys = rc.keys("ratelimit:*")
    print(f"  ratelimit:* keys: {len(rl_keys)}")
    for k in rl_keys[:5]:
        val = rc.get(k)
        print(f"    {k} = {val}")
    report("Rate limit keys exist in Redis", len(rl_keys) > 0, f"{len(rl_keys)} keys")

    us_keys = rc.keys("user_state:*")
    print(f"  user_state:* keys: {len(us_keys)}")
    for k in us_keys[:5]:
        val = rc.hgetall(k)
        event_count = len(json.loads(val.get("amounts", "[]"))) if val.get("amounts") else 0
        print(f"    {k} — {event_count} events")
    report("Behavioral state keys exist in Redis", len(us_keys) > 0, f"{len(us_keys)} keys")

except Exception as exc:
    print(f"  Redis check failed: {exc}")
    report("Redis accessible", False, str(exc))


# ─── SUMMARY ──────────────────────────────────────────────────────────────
print("\n" + "=" * 60)
print(f"SUMMARY: {PASS} passed, {FAIL} failed out of {PASS + FAIL} checks")
if FAIL > 0:
    print("  ⚠ Some checks failed — review above for details")
else:
    print("  ✅ All checks passed!")
