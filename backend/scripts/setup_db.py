#!/usr/bin/env python3
"""Setup database tables"""

import asyncio
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).parent.parent))

from services.db_service import get_connection


async def create_tables():
    pool = await get_connection()
    async with pool.acquire() as conn:
        tables = [
            ("users", """
                CREATE TABLE IF NOT EXISTS users (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    email VARCHAR(255) UNIQUE NOT NULL,
                    name VARCHAR(255),
                    hashed_password TEXT NOT NULL,
                    created_at TIMESTAMP DEFAULT NOW(),
                    updated_at TIMESTAMP DEFAULT NOW()
                )
            """),
            ("user_background", """
                CREATE TABLE IF NOT EXISTS user_background (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
                    software_experience VARCHAR(20) CHECK (software_experience IN ('beginner','intermediate','advanced')),
                    hardware_background TEXT,
                    known_languages TEXT[],
                    learning_style VARCHAR(20) CHECK (learning_style IN ('visual','reading','hands-on')),
                    created_at TIMESTAMP DEFAULT NOW(),
                    UNIQUE(user_id)
                )
            """),
            ("sessions", """
                CREATE TABLE IF NOT EXISTS sessions (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
                    token TEXT UNIQUE NOT NULL,
                    expires_at TIMESTAMP NOT NULL,
                    created_at TIMESTAMP DEFAULT NOW()
                )
            """),
            ("chat_sessions", """
                CREATE TABLE IF NOT EXISTS chat_sessions (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
                    session_token VARCHAR(255) UNIQUE NOT NULL,
                    created_at TIMESTAMP DEFAULT NOW()
                )
            """),
            ("chat_messages", """
                CREATE TABLE IF NOT EXISTS chat_messages (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE,
                    role VARCHAR(10) CHECK (role IN ('user', 'assistant')),
                    content TEXT NOT NULL,
                    created_at TIMESTAMP DEFAULT NOW()
                )
            """),
            ("book_chunks", """
                CREATE TABLE IF NOT EXISTS book_chunks (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    qdrant_id VARCHAR(255) UNIQUE NOT NULL,
                    chapter_name VARCHAR(255),
                    heading TEXT,
                    source_file VARCHAR(255),
                    chunk_index INTEGER,
                    content_preview TEXT,
                    created_at TIMESTAMP DEFAULT NOW()
                )
            """),
        ]
        
        for table_name, sql in tables:
            await conn.execute(sql)
            print(f"✓ {table_name} table created/verified")
        
        print("\n✅ All database tables ready!")


if __name__ == "__main__":
    asyncio.run(create_tables())
