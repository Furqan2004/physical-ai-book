from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from agents import Runner
from ai.orchestrator_agent import orchestrator_agent
from routers.deps import get_authenticated_user

router = APIRouter(prefix="/api", tags=["Translation"])


class TranslateRequest(BaseModel):
    chapter_content: str
    chapter_id: str


class TranslateResponse(BaseModel):
    translated_content: str
    chapter_id: str


@router.post("/translate", response_model=TranslateResponse)
async def translate(
    request: TranslateRequest,
    current_user: dict = Depends(get_authenticated_user)
):
    """
    Translate chapter content to Urdu.
    Returns complete response (non-streaming).
    """
    input_text = f"Translate this chapter to Urdu: {request.chapter_content[:8000]}"

    # Run OrchestratorAgent - NON-STREAMING (use await in async context)
    result = await Runner.run(
        orchestrator_agent,
        input=input_text,
    )

    # Get complete response
    full_response = result.final_output

    # Return complete response as JSON
    return {
        "translated_content": full_response,
        "chapter_id": request.chapter_id
    }
