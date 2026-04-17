"""Verify test user in the database for testing."""
import asyncio
import asyncpg

DB_URL = "postgresql://postgres:hqhhg@localhost:5432/fraud_detection_db"

async def main():
    conn = await asyncpg.connect(DB_URL)
    
    # Show users table columns
    cols = await conn.fetch(
        "SELECT column_name FROM information_schema.columns WHERE table_name = 'users'"
    )
    print("Users columns:", [c["column_name"] for c in cols])
    
    # Show existing users
    rows = await conn.fetch("SELECT * FROM users LIMIT 5")
    for r in rows:
        print(dict(r))
    
    # Verify and activate test user
    result = await conn.execute(
        "UPDATE users SET is_email_verified = TRUE, is_active = TRUE, role = 'ADMIN' WHERE email = 'test@test.com'"
    )
    print(f"Update result: {result}")
    
    # Confirm
    row = await conn.fetch("SELECT email, is_active, is_email_verified, role FROM users WHERE email = 'test@test.com'")
    print("After update:", [dict(r) for r in row])
    
    await conn.close()

asyncio.run(main())
