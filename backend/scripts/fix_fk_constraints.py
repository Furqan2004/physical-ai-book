import asyncio
import os
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).parent.parent))
from services.db_service import get_connection

async def fix_constraints():
    print("🚀 Fixing database foreign key constraints (with cleanup)...")
    pool = await get_connection()
    async with pool.acquire() as conn:
        try:
            # 1. Fix user_background
            print("Cleaning and fixing 'user_background'...")
            
            # Drop old constraint
            await conn.execute('ALTER TABLE user_background DROP CONSTRAINT IF EXISTS user_background_user_id_fkey;')
            
            # Check type and convert if needed
            col_info = await conn.fetchrow("""
                SELECT data_type FROM information_schema.columns 
                WHERE table_name = 'user_background' AND column_name = 'user_id';
            """)
            if col_info and col_info[0] == 'uuid':
                print("Changing column type to TEXT...")
                await conn.execute('ALTER TABLE user_background ALTER COLUMN user_id TYPE TEXT;')
            
            # DELETE orphaned records that would violate the new FK
            print("Removing orphaned background records...")
            deleted = await conn.execute('DELETE FROM user_background WHERE user_id NOT IN (SELECT id FROM "user");')
            print(f"Result: {deleted}")
            
            # Add new constraint
            await conn.execute("""
                ALTER TABLE user_background 
                ADD CONSTRAINT user_background_user_id_fkey 
                FOREIGN KEY (user_id) REFERENCES "user"(id) ON DELETE CASCADE;
            """)
            print("✅ 'user_background' fixed.")

            # 2. Fix chat_sessions
            print("Cleaning and fixing 'chat_sessions'...")
            
            # Drop old constraint
            await conn.execute('ALTER TABLE chat_sessions DROP CONSTRAINT IF EXISTS chat_sessions_user_id_fkey;')
            
            # Check type and convert if needed
            col_info = await conn.fetchrow("""
                SELECT data_type FROM information_schema.columns 
                WHERE table_name = 'chat_sessions' AND column_name = 'user_id';
            """)
            if col_info and col_info[0] == 'uuid':
                print("Changing column type to TEXT...")
                await conn.execute('ALTER TABLE chat_sessions ALTER COLUMN user_id TYPE TEXT;')

            # SET user_id to NULL for orphaned chat sessions
            print("Nullifying user_id for orphaned chat sessions...")
            updated = await conn.execute('UPDATE chat_sessions SET user_id = NULL WHERE user_id NOT IN (SELECT id FROM "user");')
            print(f"Result: {updated}")

            # Add new constraint
            await conn.execute("""
                ALTER TABLE chat_sessions 
                ADD CONSTRAINT chat_sessions_user_id_fkey 
                FOREIGN KEY (user_id) REFERENCES "user"(id) ON DELETE SET NULL;
            """)
            print("✅ 'chat_sessions' fixed.")

            # 3. Handle 'users' (plural) table
            try:
                await conn.execute('ALTER TABLE IF EXISTS users RENAME TO users_old;')
                print("Renamed 'users' to 'users_old'.")
            except Exception:
                pass
            
            print("\n🎉 Database constraints are now consistent with the 'user' table!")
            
        except Exception as e:
            print(f"❌ Error during migration: {e}")

if __name__ == "__main__":
    asyncio.run(fix_constraints())
