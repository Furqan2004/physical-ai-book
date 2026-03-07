from fastapi import APIRouter, HTTPException, Depends, Header
from pydantic import BaseModel
from typing import Optional
from agents import Runner
from ai.chat_agent import chat_agent
from routers.deps import get_optional_user, get_authenticated_user
from services.db_service import create_chat_session, save_chat_message, get_chat_history
from services.openrouter_service import get_embedding
from services.qdrant_service import search_similar
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

@router.post("/chat", response_model=ChatResponse)
async def chat(
    request: ChatRequest,
    current_user: Optional[dict] = Depends(get_optional_user)
):
    is_guest = current_user is None
    user_id = current_user["id"] if not is_guest else None

    # 1. EXECUTE SEARCH MANUALLY (No agent tool)
    try:
        query_vector = await get_embedding(request.message)
        search_results = search_similar(query_vector, top_k=5)
        
        context_blocks = []
        for res in search_results:
            context_blocks.append(f"Chapter: {res['chapter_name']}\nContent: {res['content']}")
        
        search_context = "\n\n---\n\n".join(context_blocks)
    except Exception as e:
        logger.error(f"Manual search failed: {e}")
        search_context = "Search is currently unavailable."

    # 2. GET HISTORY MANUALLY
    history = await get_chat_history(request.session_id)
    history_context = ""
    if history:
        history_context = "\nRECENT CONVERSATION:\n" + "\n".join([f"{m['role']}: {m['content']}" for m in history[-5:]])

    # 3. BUILD POWERFUL PROMPT
    final_input = f"""
USER QUESTION: {request.message}

BOOK CONTENT (CONTEXT):
{search_context}
{history_context}

SELECTED TEXT FROM PAGE:
{request.selected_text if request.selected_text else "None"}

INSTRUCTIONS:
You are an elite AI Book Assistant. 
Use the provided BOOK CONTENT to answer the USER QUESTION.
If the answer is not in the content, say you don't know based on the book.
Maintain the persona of an expert technical mentor.
Be concise, professional, and cite the chapter name.
"""

    if not is_guest:
        await create_chat_session(request.session_id, user_id)
        await save_chat_message(request.session_id, "user", request.message)

    # 4. RUN AGENT
    result = await Runner.run(chat_agent, input=final_input)
    full_response = result.final_output

    if not is_guest:
        await save_chat_message(request.session_id, "assistant", full_response)

    return {"response": full_response, "session_id": request.session_id}

@router.get("/chat/sessions")
async def fetch_sessions(current_user: dict = Depends(get_authenticated_user)):
    """List all chat sessions for the user"""
    from services.db_service import get_connection
    pool = await get_connection()
    async with pool.acquire() as conn:
        rows = await conn.fetch(
            "SELECT session_token, created_at FROM chat_sessions WHERE user_id = $1 ORDER BY created_at DESC",
            current_user["id"]
        )
        return {"sessions": [dict(r) for r in rows]}

@router.get("/chat/history")
async def fetch_history(session_id: str):
    history = await get_chat_history(session_id)
    return {"messages": history}
