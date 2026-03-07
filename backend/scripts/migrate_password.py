import asyncio
import os
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).parent.parent))
from services.db_service import get_connection

async def migrate():
    print("🚀 Adding password column to 'user' table...")
    pool = await get_connection()
    async with pool.acquire() as conn:
        try:
            await conn.execute('ALTER TABLE "user" ADD COLUMN IF NOT EXISTS password TEXT;')
            print("✅ Password column added successfully!")
        except Exception as e:
            print(f"❌ Migration failed: {e}")

if __name__ == "__main__":
    asyncio.run(migrate())
