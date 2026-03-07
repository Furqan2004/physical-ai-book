import asyncio
import os
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).parent.parent))
from services.db_service import get_connection

async def inspect_constraints():
    print("🔍 Inspecting database constraints...")
    pool = await get_connection()
    async with pool.acquire() as conn:
        # Check constraints for user_background
        print("\n--- Constraints for 'user_background' ---")
        try:
            rows = await conn.fetch("""
                SELECT conname, pg_get_constraintdef(oid) 
                FROM pg_constraint 
                WHERE conrelid = 'user_background'::regclass;
            """)
            for row in rows:
                print(f"Constraint: {row[0]} -> {row[1]}")
        except Exception as e:
            print(f"Error inspecting user_background: {e}")

        # Check constraints for chat_sessions
        print("\n--- Constraints for 'chat_sessions' ---")
        try:
            rows = await conn.fetch("""
                SELECT conname, pg_get_constraintdef(oid) 
                FROM pg_constraint 
                WHERE conrelid = 'chat_sessions'::regclass;
            """)
            for row in rows:
                print(f"Constraint: {row[0]} -> {row[1]}")
        except Exception as e:
            print(f"Error inspecting chat_sessions: {e}")
            
        # Check if 'users' (plural) table exists
        print("\n--- Checking for 'users' vs 'user' tables ---")
        tables = await conn.fetch("""
            SELECT table_name FROM information_schema.tables 
            WHERE table_schema = 'public' AND table_name IN ('users', 'user');
        """)
        print(f"Tables found: {[t[0] for t in tables]}")

if __name__ == "__main__":
    asyncio.run(inspect_constraints())
