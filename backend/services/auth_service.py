from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
from typing import Optional
import os
from dotenv import load_dotenv

from .db_service import get_user_by_id

load_dotenv()

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT settings
# Better Auth uses its own token system, but if we need to validate
# tokens in the backend, we need the secret.
SECRET_KEY = os.getenv("BETTER_AUTH_SECRET", "your-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_DAYS = 30


def hash_password(password: str) -> str:
    """Hash a password"""
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against a hash"""
    return pwd_context.verify(plain_password, hashed_password)


def create_jwt_token(user_id: str) -> str:
    """Create JWT token for user"""
    expire = datetime.utcnow() + timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS)
    to_encode = {"sub": user_id, "exp": expire}
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def decode_jwt_token(token: str) -> Optional[str]:
    """Decode JWT token and return user_id"""
    try:
        # Note: Better Auth tokens are not necessarily standard JWTs if they are opaque
        # However, for our custom backend logic, we might use them or session IDs.
        # If Better Auth is configured with JWT, this works.
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM], options={"verify_aud": False})
        user_id = payload.get("sub")
        if user_id is None:
            return None
        return user_id
    except JWTError:
        return None


async def get_current_user(token: str) -> Optional[dict]:
    """Get current user from JWT token"""
    user_id = decode_jwt_token(token)
    if user_id is None:
        # Try finding session in DB if token is an opaque session token
        from .db_service import get_connection
        pool = await get_connection()
        async with pool.acquire() as conn:
            row = await conn.fetchrow(
                'SELECT "userId" FROM "session" WHERE token = $1 AND "expiresAt" > NOW()',
                token
            )
            if row:
                user_id = row["userId"]
            else:
                return None
    
    user = await get_user_by_id(user_id)
    return user
