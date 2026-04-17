"""Test that behavioral state survives server restart via Redis persistence."""
import requests
import time
import json
import redis
import sys

BASE = "http://localhost:8000/api/v1"
S = requests.Session()

# Unique user for this test
USER_ID = "restart_persist_test"

# Connect to Redis directly
rc = redis.Redis(host="localhost", port=6379, db=0, decode_responses=True)
rc.ping()

# Clean up any prior state for this user
rc.delete(f"user_state:{USER_ID}")
print(f"Cleared user_state:{USER_ID} from Redis")

# Auth
r = S.post(f"{BASE}/auth/login", json={"email": "test@test.com", "password": "Test1234!"})
if r.status_code != 200:
    print(f"Login failed: {r.status_code} {r.text}")
    sys.exit(1)
token = r.json()["access_token"]
H = {"Authorization": f"Bearer {token}"}

# Step 1: Send 3 transactions (pre-restart)
print("\n--- BEFORE RESTART ---")
tx = {"user_id": USER_ID, "amount": 50000, "type": "TRANSFER", "receiver_account": "C999",
      "oldbalanceOrg": 100000, "oldbalanceDest": 5000, "timestamp": "2026-04-16T10:00:00Z"}

for i in range(1, 4):
    r = S.post(f"{BASE}/transactions/check", json=tx, headers=H)
    d = r.json()
    print(f"  TX{i}: risk={d.get('risk_score', 'N/A'):.6f}")

# Check Redis state
state = rc.hgetall(f"user_state:{USER_ID}")
events_before = len(json.loads(state.get("amounts", "[]")))
print(f"\n  Redis user_state:{USER_ID} — {events_before} events stored")

if events_before == 0:
    print("  FAIL: No events persisted to Redis!")
    sys.exit(1)

print(f"\n  >>> Now restart the server (kill and re-run uvicorn)")
print(f"  >>> Then run this script again with --after-restart flag")
print(f"  >>> Expected: TX4 should NOT be cold_start, risk should differ from TX1")

if "--after-restart" in sys.argv:
    print("\n--- AFTER RESTART (verifying persistence) ---")
    # Check Redis still has the data
    state = rc.hgetall(f"user_state:{USER_ID}")
    events_after = len(json.loads(state.get("amounts", "[]")))
    print(f"  Redis user_state:{USER_ID} — {events_after} events (should be {events_before})")

    # Send TX4 — should NOT be cold start
    r4 = S.post(f"{BASE}/transactions/check", json=tx, headers=H)
    d4 = r4.json()
    print(f"  TX4 (post-restart): risk={d4.get('risk_score', 'N/A'):.6f}")

    # Compare TX4 risk with what TX1 would give for a cold start user
    fresh_user = "fresh_cold_start_user"
    rc.delete(f"user_state:{fresh_user}")
    r_fresh = S.post(f"{BASE}/transactions/check", json={
        **tx, "user_id": fresh_user
    }, headers=H)
    d_fresh = r_fresh.json()
    print(f"  Fresh user (cold start): risk={d_fresh.get('risk_score', 'N/A'):.6f}")

    risk_4 = d4.get("risk_score", 0)
    risk_fresh = d_fresh.get("risk_score", 0)
    if risk_4 != risk_fresh:
        print(f"\n  PASS: Post-restart risk ({risk_4:.6f}) differs from cold-start ({risk_fresh:.6f})")
        print(f"  State was successfully restored from Redis!")
    else:
        print(f"\n  FAIL: Post-restart risk = cold-start risk — state was NOT restored")
