from openai import AsyncOpenAI
import os
from dotenv import load_dotenv

load_dotenv()

# Initialize OpenRouter client for OpenAI Agents SDK
openrouter_client = AsyncOpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=os.getenv("OPENROUTER_API_KEY"),
    default_headers={
        "HTTP-Referer": os.getenv("SITE_URL", "http://localhost:3000"),
        "X-OpenRouter-Title": os.getenv("SITE_NAME", "AI Book"),
    }
)

# Default LLM model
LLM_MODEL = "nvidia/nemotron-3-nano-30b-a3b:free"

# Configure Agents SDK to use OpenRouter
# Import from the installed 'agents' package (openai-agents library)
from agents import (
    set_default_openai_client,
    set_tracing_disabled,
    Runner,
    Agent,
    handoff,
    function_tool,
)

set_default_openai_client(openrouter_client)
set_tracing_disabled(True)

# Re-export for convenience
__all__ = ["Runner", "Agent", "handoff", "function_tool", "LLM_MODEL"]
