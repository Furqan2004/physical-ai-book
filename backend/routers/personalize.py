from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from agents import Runner
from ai.orchestrator_agent import orchestrator_agent
from routers.deps import get_authenticated_user
from services.doc_service import get_doc_content
from services.db_service import get_user_background, get_user_personalization, save_user_personalization

router = APIRouter(prefix="/api", tags=["Personalization"])

class PersonalizeRequest(BaseModel):
    chapter_content: str
    chapter_id: str
    mode: str = "existing" # "existing" or "fresh"

@router.post("/personalize")
async def personalize(
    request: PersonalizeRequest,
    current_user: dict = Depends(get_authenticated_user)
):
    # 1. Check DB Cache First (Only if mode is "existing")
    if request.mode == "existing":
        cached_content = await get_user_personalization(current_user["id"], request.chapter_id)
        if cached_content:
            return {
                "personalized_content": cached_content,
                "chapter_id": request.chapter_id,
                "cached": True
            }

    # 2. Get Source Content (Either mode is fresh or cache missed)
    try:
        content = request.chapter_content
        if content.startswith('@site/docs') or content.endswith('.md'):
            content = await get_doc_content(content)
        
        if content.startswith("Error:"):
            raise HTTPException(status_code=404, detail=content)

        background = await get_user_background(current_user["id"])
        bg_info = f"""
        - Software Level: {background['software_experience']}
        - Hardware Background: {background['hardware_background']}
        - Languages: {', '.join(background['known_languages'])}
        - Style: {background['learning_style']}
        """ if background else "Standard Profile"

        # POWERFUL PROMPT - ROMAN URDU
        input_text = f"""
# ROLE
You are an EXPERT TECHNICAL MENTOR and TEACHER specializing in Physical AI and Robotics. Your goal is to rewrite technical content in professional ROMAN URDU to make it accessible yet deep.

# TASK
Rewrite the following book chapter in 'ROMAN URDU' (Urdu written in English alphabets) tailored for the user's specific background.

# USER PROFILE
{bg_info}

# CHAPTER CONTENT
{content}

# CRITICAL RULES
1. LANGUAGE: Use professional and clear ROMAN URDU (e.g., "Yeh chapter aapko ROS2 ke basic concepts samjhne mein madad karega").
2. TECHNICAL TERMS: DO NOT translate technical terms (e.g., ROS2, Nodes, Topics, Pub/Sub, Kinematics, Python, Sensors). Keep them in English.
3. CODE BLOCKS: Preserve all code blocks exactly as they are in the source. Do not modify the code.
4. MARKDOWN: Maintain all markdown structure (Headings, Tables, Lists, Bold, Italic) perfectly.
5. PERSPECTIVE: Adapt the explanation complexity to the user's software/hardware background and learning style.
6. COMPLETENESS: Return the ENTIRE transformed chapter. Do not summarize, skip, or omit any sections.
7. FORMAT: Return ONLY the raw markdown content.
"""

        result = await Runner.run(orchestrator_agent, input=input_text)

        # 3. Save to DB before returning
        personalized_content = result.final_output
        if not personalized_content:
            raise Exception("AI Agent returned empty content")
            
        await save_user_personalization(current_user["id"], request.chapter_id, personalized_content)

        return {
            "personalized_content": personalized_content,
            "chapter_id": request.chapter_id,
            "cached": False
        }
    except Exception as e:
        print(f"ERROR in personalization: {e}")
        raise HTTPException(
            status_code=500, 
            detail="Personalization failed. Please try again."
        )

