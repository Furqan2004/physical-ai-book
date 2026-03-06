from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from agents import Runner
from ai.orchestrator_agent import orchestrator_agent
from routers.deps import get_authenticated_user

router = APIRouter(prefix="/api", tags=["Personalization"])


class PersonalizeRequest(BaseModel):
    chapter_content: str
    chapter_id: str


class PersonalizeResponse(BaseModel):
    personalized_content: str
    chapter_id: str


@router.post("/personalize", response_model=PersonalizeResponse)
async def personalize(
    request: PersonalizeRequest,
    current_user: dict = Depends(get_authenticated_user)
):
    """
    Personalize chapter content based on user background.
    Returns complete response (non-streaming).
    """
    input_text = f"Personalize this chapter for user {current_user['id']}: {request.chapter_content[:8000]}"

    # Run OrchestratorAgent - NON-STREAMING (use await in async context)
    result = await Runner.run(
        orchestrator_agent,
        input=input_text,
    )

    # Get complete response
    full_response = result.final_output

    # Return complete response as JSON
    return {
        "personalized_content": full_response,
        "chapter_id": request.chapter_id
    }
