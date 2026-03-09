import asyncio
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).parent))
from services.db_service import get_connection

async def verify_chapters():
    print("🔍 Verifying chapters in PostgreSQL...")
    pool = await get_connection()
    async with pool.acquire() as conn:
        count = await conn.fetchval("SELECT count(*) FROM chapters")
        print(f"Total chapters found: {count}")
        
        if count > 0:
            rows = await conn.fetch("SELECT slug, title FROM chapters LIMIT 5")
            for row in rows:
                print(f" - {row['slug']}: {row['title']}")
        else:
            print("❌ No chapters found in database!")

if __name__ == "__main__":
    asyncio.run(verify_chapters())
