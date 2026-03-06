from pydantic import BaseModel, EmailStr
from uuid import UUID
from datetime import datetime


class UserSignup(BaseModel):
    """Request model for user registration"""
    name: str
    email: EmailStr
    password: str


class UserSignin(BaseModel):
    """Request model for user login"""
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    """Response model for user data"""
    id: UUID
    name: str
    email: str
    created_at: datetime

    class Config:
        from_attributes = True
