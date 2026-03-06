from agents import Agent, OpenAIChatCompletionsModel
RECOMMENDED_PROMPT_PREFIX = ""
from tools.personalize_tool import personalize_content
from tools.translate_tool import translate_to_urdu
from tools.db_tool import save_message
from . import LLM_MODEL, openrouter_client

model = OpenAIChatCompletionsModel(
    model=LLM_MODEL,
    openai_client=openrouter_client,
)

INSTRUCTIONS = f"""
{RECOMMENDED_PROMPT_PREFIX}
You are a content transformation specialist for personalization and translation.

Your Role:
- Personalize chapter content based on user's background (experience level, known languages, learning style)
- Translate chapter content to Urdu while preserving code blocks and technical terms

Guidelines:
- For personalization requests: call personalize_content with chapter_content and user_id
- For translation requests: call translate_to_urdu with chapter_content
- Return the COMPLETE transformed content, never summarize
- Preserve all markdown formatting
- Keep code blocks exactly as they are
- Save your responses with save_message
"""

orchestrator_agent = Agent(
    name="OrchestratorAgent",
    instructions=INSTRUCTIONS,
    model=model,
    tools=[personalize_content, translate_to_urdu, save_message],
)
