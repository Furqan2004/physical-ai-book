from fastapi import APIRouter, HTTPException, Depends, Header
from pydantic import BaseModel
from typing import Optional
from agents import Runner
from ai.chat_agent import chat_agent
from routers.deps import get_optional_user, get_authenticated_user
from services.db_service import create_chat_session, save_chat_message
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["Chat"])


class ChatRequest(BaseModel):
    message: str
    session_id: str
    selected_text: Optional[str] = None


class ChatResponse(BaseModel):
    response: str
    session_id: str


class ChatMessage(BaseModel):
    role: str
    content: str
    timestamp: str


class ChatHistoryResponse(BaseModel):
    messages: list[ChatMessage]


@router.post("/chat", response_model=ChatResponse)
async def chat(
    request: ChatRequest,
    current_user: Optional[dict] = Depends(get_optional_user)
):
    """
    Send a message to the RAG chatbot.
    Authorization is OPTIONAL - guest users can chat without login.
    Returns complete response (non-streaming).

    For logged-in users: Saves chat history, applies personalization.
    For guest users: Returns AI response without saving history.
    """
    # Detect if user is guest or logged-in
    is_guest = current_user is None
    user_id = current_user["id"] if not is_guest else None

    # Log user type for monitoring
    if is_guest:
        logger.info(f"Guest user chat request - session: {request.session_id}")
    else:
        logger.info(f"Logged-in user chat request - user_id: {user_id}, session: {request.session_id}")

    # Build input text
    input_text = request.message
    if request.selected_text and not is_guest:
        # Selected text only for logged-in users
        logger.debug(f"User {user_id} included selected text: {len(request.selected_text)} chars")
        input_text += f"\n\nContext from selected text: {request.selected_text}"

    # Ensure chat session exists (only for logged-in users)
    if not is_guest:
        await create_chat_session(request.session_id, user_id)
        logger.debug(f"Chat session created/verified for user {user_id}")
    else:
        logger.debug(f"Guest session - no history saved (session: {request.session_id})")

    # Run ChatAgent - NON-STREAMING (use await in async context)
    result = await Runner.run(
        chat_agent,
        input=input_text,
    )

    # Get complete response
    full_response = result.final_output

    # Save the complete response (only for logged-in users)
    if not is_guest:
        await save_chat_message(request.session_id, "assistant", full_response)
        logger.info(f"Chat message saved for user {user_id} - response length: {len(full_response)}")
    else:
        logger.info(f"Guest chat response sent (not saved) - length: {len(full_response)}")

    # Return complete response as JSON
    return {
        "response": full_response,
        "session_id": request.session_id
    }


@router.get("/chat/history", response_model=ChatHistoryResponse)
async def get_chat_history(
    session_id: str,
    current_user: dict = Depends(get_authenticated_user)
):
    """
    Get chat history for a session.
    """
    from services.db_service import get_chat_history
    
    messages = await get_chat_history(session_id)
    
    return {
        "messages": [
            {
                "role": msg["role"],
                "content": msg["content"],
                "timestamp": msg["created_at"].isoformat()
            }
            for msg in messages
        ]
    }
