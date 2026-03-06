from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from uuid import UUID


class ChatRequest(BaseModel):
    """Request model for chat messages"""
    message: str
    session_id: str
    selected_text: Optional[str] = None


class ChatMessage(BaseModel):
    """Model for individual chat messages"""
    role: str  # 'user' or 'assistant'
    content: str
    timestamp: datetime


class ChatHistoryResponse(BaseModel):
    """Response model for chat history"""
    messages: List[ChatMessage]
