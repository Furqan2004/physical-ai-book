from fastapi import APIRouter, HTTPException, Depends, status, Header
from datetime import datetime, timedelta
from typing import Optional, List
from pydantic import BaseModel, EmailStr
import uuid

from models.background import BackgroundRequest
from services.auth_service import hash_password, verify_password, create_jwt_token
from services.db_service import (
    get_user_by_email,
    get_user_by_id,
    save_user_background,
    get_user_background,
    get_connection
)
from routers.deps import get_authenticated_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

class UserSignup(BaseModel):
    name: str
    email: EmailStr
    password: str

class UserSignin(BaseModel):
    email: EmailStr
    password: str

async def create_fastapi_user(name: str, email: str, hashed_password: str):
    """Create user in the 'user' table (shared with Better Auth schema)"""
    pool = await get_connection()
    user_id = str(uuid.uuid4())
    now = datetime.utcnow()
    async with pool.acquire() as conn:
        await conn.execute(
            'INSERT INTO "user" (id, name, email, password, "emailVerified", "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, $7)',
            user_id, name, email, hashed_password, False, now, now
        )
        return {"id": user_id, "name": name, "email": email, "createdAt": now}

async def get_user_with_password(email: str):
    """Fetch user including password for verification"""
    pool = await get_connection()
    async with pool.acquire() as conn:
        return await conn.fetchrow('SELECT * FROM "user" WHERE email = $1', email)

@router.post("/signup")
async def signup(data: UserSignup):
    # Check exists
    existing = await get_user_by_email(data.email)
    if existing:
        raise HTTPException(status_code=400, detail="Email already exists")
    
    hashed = hash_password(data.password)
    user = await create_fastapi_user(data.name, data.email, hashed)
    
    token = create_jwt_token(user["id"])
    return {"token": token, "user": user}

@router.post("/signin")
async def signin(data: UserSignin):
    user = await get_user_with_password(data.email)
    if not user or not verify_password(data.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    token = create_jwt_token(user["id"])
    return {
        "token": token, 
        "user": {
            "id": user["id"],
            "name": user["name"],
            "email": user["email"]
        }
    }

@router.get("/me")
async def get_me(current_user: dict = Depends(get_authenticated_user)):
    background = await get_user_background(current_user["id"])
    user_data = {
        "id": current_user["id"],
        "name": current_user["name"],
        "email": current_user["email"],
    }
    if background:
        user_data["background"] = background
    return user_data

# Onboarding Router
user_router = APIRouter(prefix="/user", tags=["User"])

@user_router.post("/background")
async def save_background(
    data: BackgroundRequest,
    current_user: dict = Depends(get_authenticated_user)
):
    success = await save_user_background(
        user_id=current_user["id"],
        software_experience=data.software_experience,
        hardware_background=data.hardware_background,
        known_languages=data.known_languages,
        learning_style=data.learning_style
    )
    if not success:
        raise HTTPException(status_code=500, detail="Failed to save background")
    return {"success": True}
