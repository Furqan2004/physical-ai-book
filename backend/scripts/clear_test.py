import asyncio
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).parent.parent))
from services.db_service import get_connection

async def clear_test_data():
    pool = await get_connection()
    async with pool.acquire() as conn:
        # Clear the specific test entries created during validation
        # We delete by chapter_id 'intro' which was used in tests
        await conn.execute("DELETE FROM user_personalization WHERE chapter_id = 'intro'")
        await conn.execute("DELETE FROM translations WHERE chapter_id = 'intro'")
        print("✅ Test data cleared from database.")

if __name__ == "__main__":
    asyncio.run(clear_test_data())
