#!/usr/bin/env python3
"""Setup database tables for Better Auth and the System Overhaul"""

import asyncio
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).parent.parent))

from services.db_service import get_connection


async def create_tables():
    pool = await get_connection()
    async with pool.acquire() as conn:
        # Enable UUID extension
        await conn.execute('CREATE EXTENSION IF NOT EXISTS "pgcrypto";')
        
        tables = [
            ("user", """
                CREATE TABLE IF NOT EXISTS "user" (
                    id TEXT PRIMARY KEY,
                    name TEXT NOT NULL,
                    email TEXT UNIQUE NOT NULL,
                    password TEXT,
                    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
                    image TEXT,
                    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
                    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
                )
            """),
            ("session", """
                CREATE TABLE IF NOT EXISTS "session" (
                    id TEXT PRIMARY KEY,
                    "userId" TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
                    token TEXT UNIQUE NOT NULL,
                    "expiresAt" TIMESTAMP NOT NULL,
                    "ipAddress" TEXT,
                    "userAgent" TEXT,
                    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
                    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
                )
            """),
            ("account", """
                CREATE TABLE IF NOT EXISTS "account" (
                    id TEXT PRIMARY KEY,
                    "userId" TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
                    "accountId" TEXT NOT NULL,
                    "providerId" TEXT NOT NULL,
                    "accessToken" TEXT,
                    "refreshToken" TEXT,
                    "idToken" TEXT,
                    "expiresAt" TIMESTAMP,
                    "password" TEXT,
                    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
                    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
                )
            """),
            ("verification", """
                CREATE TABLE IF NOT EXISTS "verification" (
                    id TEXT PRIMARY KEY,
                    identifier TEXT NOT NULL,
                    value TEXT NOT NULL,
                    "expiresAt" TIMESTAMP NOT NULL,
                    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
                    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
                )
            """),
            ("user_background", """
                CREATE TABLE IF NOT EXISTS user_background (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    user_id TEXT REFERENCES "user"(id) ON DELETE CASCADE,
                    software_experience VARCHAR(20) CHECK (software_experience IN ('beginner','intermediate','advanced')),
                    hardware_background TEXT,
                    known_languages TEXT[],
                    learning_style VARCHAR(20) CHECK (learning_style IN ('visual','reading','hands-on')),
                    created_at TIMESTAMP DEFAULT NOW(),
                    UNIQUE(user_id)
                )
            """),
            ("chat_sessions", """
                CREATE TABLE IF NOT EXISTS chat_sessions (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    user_id TEXT REFERENCES "user"(id) ON DELETE SET NULL,
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
        
        # Create indexes
        indexes = [
            'CREATE INDEX IF NOT EXISTS "idx_user_email" ON "user"(email);',
            'CREATE INDEX IF NOT EXISTS "idx_session_token" ON "session"(token);',
            'CREATE INDEX IF NOT EXISTS "idx_session_user_id" ON "session"("userId");',
            'CREATE INDEX IF NOT EXISTS "idx_chat_sessions_token" ON chat_sessions(session_token);',
            'CREATE INDEX IF NOT EXISTS "idx_chat_sessions_user_id" ON chat_sessions(user_id);',
            'CREATE INDEX IF NOT EXISTS "idx_chat_messages_session_id" ON chat_messages(session_id);',
            'CREATE INDEX IF NOT EXISTS "idx_chat_messages_created_at" ON chat_messages(created_at);',
            'CREATE INDEX IF NOT EXISTS "idx_user_background_user_id" ON user_background(user_id);',
            'CREATE INDEX IF NOT EXISTS "idx_book_chunks_qdrant_id" ON book_chunks(qdrant_id);'
        ]
        
        for idx_sql in indexes:
            await conn.execute(idx_sql)
        
        print("\n✅ All database tables and indexes ready!")


if __name__ == "__main__":
    asyncio.run(create_tables())
