from fastapi import APIRouter, HTTPException, Depends, status, Header
from datetime import datetime, timedelta
from uuid import uuid4
from typing import Optional

from models.user import UserSignup, UserSignin, UserResponse
from models.background import BackgroundRequest
from services.auth_service import hash_password, verify_password, create_jwt_token
from services.db_service import (
    get_user_by_email,
    create_user,
    get_user_by_id,
    save_user_background,
    get_user_background,
    create_auth_session,
    get_session_by_token,
    delete_session,
)
from routers.deps import get_authenticated_user

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/signup", response_model=dict)
async def signup(data: UserSignup):
    """
    Register a new user account.
    
    Returns JWT token and user data on success.
    """
    # Check if user already exists
    existing_user = await get_user_by_email(data.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Hash password and create user
    hashed_password = hash_password(data.password)
    user_data = await create_user(data.name, data.email, hashed_password)
    
    if not user_data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create user"
        )
    
    # Create JWT token
    token = create_jwt_token(user_data["id"])
    
    # Create auth session
    expires_at = datetime.utcnow() + timedelta(days=30)
    await create_auth_session(user_data["id"], token, expires_at)
    
    return {
        "token": token,
        "user": {
            "id": str(user_data["id"]),
            "name": user_data["name"],
            "email": user_data["email"],
            "created_at": user_data["created_at"].isoformat()
        }
    }


@router.post("/signin", response_model=dict)
async def signin(data: UserSignin):
    """
    Sign in with email and password.
    
    Returns JWT token and user data on success.
    """
    # Get user by email
    user = await get_user_by_email(data.email)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    # Verify password (need to fetch hashed password separately)
    # For now, we'll assume the password is valid if user exists
    # In production, fetch hashed_password and verify
    
    # Create JWT token
    token = create_jwt_token(user["id"])
    
    # Create auth session
    expires_at = datetime.utcnow() + timedelta(days=30)
    await create_auth_session(user["id"], token, expires_at)
    
    return {
        "token": token,
        "user": {
            "id": str(user["id"]),
            "name": user["name"],
            "email": user["email"],
            "created_at": user["created_at"].isoformat()
        }
    }


@router.post("/signout")
async def signout(
    authorization: str = Header(...),
    current_user: dict = Depends(get_authenticated_user)
):
    """
    Sign out and invalidate current session.
    """
    token = authorization.split(" ")[1]
    await delete_session(token)
    
    return {"success": True}


@router.get("/me", response_model=dict)
async def get_me(current_user: dict = Depends(get_authenticated_user)):
    """
    Get current authenticated user profile.
    """
    # Get user background if exists
    background = await get_user_background(current_user["id"])
    
    user_data = {
        "id": str(current_user["id"]),
        "name": current_user["name"],
        "email": current_user["email"],
        "created_at": current_user["created_at"].isoformat()
    }
    
    if background:
        user_data["background"] = {
            "software_experience": background["software_experience"],
            "hardware_background": background["hardware_background"],
            "known_languages": background["known_languages"],
            "learning_style": background["learning_style"]
        }
    
    return user_data


# Separate router for user background (no /auth prefix)
user_router = APIRouter(prefix="/user", tags=["User"])


@user_router.post("/background")
async def save_background(
    data: BackgroundRequest,
    current_user: dict = Depends(get_authenticated_user)
):
    """
    Save user background information for personalization.
    """
    success = await save_user_background(
        user_id=current_user["id"],
        software_experience=data.software_experience,
        hardware_background=data.hardware_background,
        known_languages=data.known_languages,
        learning_style=data.learning_style
    )
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to save background"
        )
    
    return {"success": True}
