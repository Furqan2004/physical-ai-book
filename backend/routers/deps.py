from fastapi import Header, HTTPException, Depends
from typing import Optional
from services.auth_service import get_current_user


async def get_authenticated_user(
    authorization: str = Header(..., description="Bearer token")
) -> dict:
    """
    Dependency to get authenticated user from JWT token.

    Args:
        authorization: Authorization header with Bearer token

    Returns:
        User dict from database

    Raises:
        HTTPException: 401 if token is invalid or missing
    """
    if not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=401,
            detail="Invalid authorization header. Expected 'Bearer <token>'"
        )

    token = authorization.split(" ")[1]
    user = await get_current_user(token)

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token"
        )

    return user


async def get_optional_user(
    authorization: Optional[str] = Header(None, description="Bearer token (optional)")
) -> Optional[dict]:
    """
    Dependency to optionally get authenticated user from JWT token.
    Returns None if no token or invalid token (does NOT raise 401).
    
    This enables guest user access to endpoints while still supporting
    authenticated users.

    Args:
        authorization: Optional Authorization header with Bearer token

    Returns:
        User dict from database, or None if not authenticated
    """
    if not authorization or not authorization.startswith("Bearer "):
        return None

    token = authorization.split(" ")[1]
    try:
        user = await get_current_user(token)
        return user
    except Exception:
        # Invalid or expired token - treat as guest
        return None
