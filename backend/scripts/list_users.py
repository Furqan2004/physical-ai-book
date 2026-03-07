import asyncio
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).parent.parent))
from services.db_service import get_connection

async def test():
    pool = await get_connection()
    async with pool.acquire() as conn:
        users = await conn.fetch('SELECT id, name FROM "user" LIMIT 5')
        print(users)

if __name__ == "__main__":
    asyncio.run(test())
