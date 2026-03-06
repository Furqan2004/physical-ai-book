import asyncpg
from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta
from uuid import UUID, uuid4
import os
from dotenv import load_dotenv

load_dotenv()

# Database connection pool
_db_pool: Optional[asyncpg.Pool] = None


async def get_connection() -> asyncpg.Pool:
    """Get database connection pool"""
    global _db_pool
    if _db_pool is None:
        # Create pool with proper settings for Neon
        _db_pool = await asyncpg.create_pool(
            os.getenv("NEON_DATABASE_URL"),
            min_size=2,
            max_size=10,
            command_timeout=60
        )
    return _db_pool


async def create_user(name: str, email: str, hashed_password: str) -> Optional[Dict[str, Any]]:
    """Create a new user"""
    pool = await get_connection()
    try:
        async with pool.acquire() as conn:
            row = await conn.fetchrow(
                "INSERT INTO users (name, email, hashed_password) VALUES ($1, $2, $3) RETURNING id, name, email, created_at",
                name, email, hashed_password
            )
            if row:
                return dict(row)
            return None
    except Exception as e:
        print(f"Error creating user: {e}")
        return None


async def get_user_by_email(email: str) -> Optional[Dict[str, Any]]:
    """Get user by email"""
    pool = await get_connection()
    try:
        async with pool.acquire() as conn:
            row = await conn.fetchrow(
                "SELECT id, name, email, created_at, updated_at FROM users WHERE email = $1",
                email
            )
            if row:
                return dict(row)
            return None
    except Exception as e:
        print(f"Error getting user by email: {e}")
        return None


async def get_user_by_id(user_id: UUID) -> Optional[Dict[str, Any]]:
    """Get user by ID"""
    pool = await get_connection()
    try:
        async with pool.acquire() as conn:
            row = await conn.fetchrow(
                "SELECT id, name, email, created_at, updated_at FROM users WHERE id = $1",
                user_id
            )
            if row:
                return dict(row)
            return None
    except Exception as e:
        print(f"Error getting user by ID: {e}")
        return None


async def save_user_background(
    user_id: UUID,
    software_experience: str,
    hardware_background: str,
    known_languages: List[str],
    learning_style: str
) -> bool:
    """Save user background information"""
    pool = await get_connection()
    try:
        async with pool.acquire() as conn:
            await conn.execute(
                """
                INSERT INTO user_background 
                (user_id, software_experience, hardware_background, known_languages, learning_style)
                VALUES ($1, $2, $3, $4, $5)
                ON CONFLICT (user_id) DO UPDATE SET
                    software_experience = EXCLUDED.software_experience,
                    hardware_background = EXCLUDED.hardware_background,
                    known_languages = EXCLUDED.known_languages,
                    learning_style = EXCLUDED.learning_style
                """,
                user_id, software_experience, hardware_background, known_languages, learning_style
            )
            return True
    except Exception as e:
        print(f"Error saving user background: {e}")
        return False


async def get_user_background(user_id: UUID) -> Optional[Dict[str, Any]]:
    """Get user background information"""
    pool = await get_connection()
    try:
        async with pool.acquire() as conn:
            row = await conn.fetchrow(
                "SELECT * FROM user_background WHERE user_id = $1",
                user_id
            )
            if row:
                return dict(row)
            return None
    except Exception as e:
        print(f"Error getting user background: {e}")
        return None


async def create_auth_session(user_id: UUID, token: str, expires_at: datetime) -> bool:
    """Create authentication session"""
    pool = await get_connection()
    try:
        async with pool.acquire() as conn:
            await conn.execute(
                "INSERT INTO sessions (user_id, token, expires_at) VALUES ($1, $2, $3)",
                user_id, token, expires_at
            )
            return True
    except Exception as e:
        print(f"Error creating auth session: {e}")
        return False


async def get_session_by_token(token: str) -> Optional[Dict[str, Any]]:
    """Get session by token"""
    pool = await get_connection()
    try:
        async with pool.acquire() as conn:
            row = await conn.fetchrow(
                "SELECT * FROM sessions WHERE token = $1 AND expires_at > NOW()",
                token
            )
            if row:
                return dict(row)
            return None
    except Exception as e:
        print(f"Error getting session by token: {e}")
        return None


async def delete_session(token: str) -> bool:
    """Delete session"""
    pool = await get_connection()
    try:
        async with pool.acquire() as conn:
            await conn.execute("DELETE FROM sessions WHERE token = $1", token)
            return True
    except Exception as e:
        print(f"Error deleting session: {e}")
        return False


async def create_chat_session(session_token: str, user_id: Optional[UUID] = None) -> str:
    """Create chat session"""
    pool = await get_connection()
    try:
        async with pool.acquire() as conn:
            await conn.execute(
                "INSERT INTO chat_sessions (session_token, user_id) VALUES ($1, $2)",
                session_token, user_id
            )
            return session_token
    except Exception as e:
        print(f"Error creating chat session: {e}")
        return ""


async def save_chat_message(session_id: str, role: str, content: str) -> bool:
    """Save chat message"""
    pool = await get_connection()
    try:
        async with pool.acquire() as conn:
            await conn.execute(
                "INSERT INTO chat_messages (session_id, role, content) VALUES ($1, $2, $3)",
                session_id, role, content
            )
            return True
    except Exception as e:
        print(f"Error saving chat message: {e}")
        return False


async def get_chat_history(session_id: str) -> List[Dict[str, Any]]:
    """Get chat history for a session"""
    pool = await get_connection()
    try:
        async with pool.acquire() as conn:
            rows = await conn.fetch(
                "SELECT role, content, created_at FROM chat_messages WHERE session_id = $1 ORDER BY created_at ASC",
                session_id
            )
            return [dict(row) for row in rows]
    except Exception as e:
        print(f"Error getting chat history: {e}")
        return []


async def save_chunk_metadata(
    qdrant_id: str,
    chapter_name: str,
    heading: str,
    source_file: str,
    chunk_index: int,
    content_preview: str
) -> bool:
    """Save book chunk metadata"""
    pool = await get_connection()
    try:
        async with pool.acquire() as conn:
            await conn.execute(
                """
                INSERT INTO book_chunks 
                (qdrant_id, chapter_name, heading, source_file, chunk_index, content_preview)
                VALUES ($1, $2, $3, $4, $5, $6)
                """,
                qdrant_id, chapter_name, heading, source_file, chunk_index, content_preview
            )
            return True
    except Exception as e:
        print(f"Error saving chunk metadata: {e}")
        return False
