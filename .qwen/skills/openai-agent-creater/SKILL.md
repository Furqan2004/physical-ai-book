---
name: openai-agents-create
description: >
  Use this skill whenever the user wants to create, configure, or orchestrate AI agents using
  the OpenAI Agents SDK (the `agents` library). Trigger this skill when the user says things
  like "make an agent", "create an AI agent", "build a multi-agent system", "set up an agent
  with handoffs", "use a custom model for my agent", "add guardrails to my agent", or anything
  involving agent construction, agent pipelines, or agent orchestration. Also trigger when the
  user wants to connect agents to voice pipelines, configure STT/TTS models, or use non-OpenAI
  providers (Gemini, Groq, OpenRouter, local LLMs) with the agents SDK.
---

# OpenAI Agents SDK — Agent Creation Skill

This skill teaches you how to create, configure, and orchestrate agents using the `agents`
Python library (OpenAI's open-source agent SDK). It covers single agents, multi-agent handoffs,
custom model providers, guardrails, and voice pipelines.

---

## 1. Installation & Setup

```bash
pip install openai-agents python-dotenv
# For voice support:
pip install openai-agents[voice] sounddevice numpy
```

```python
# .env
OPENAI_API_KEY=sk-...
OPENROUTER_API_KEY=...
GEMINI_API_KEY=...
GROQ_API_KEY=...
```

```python
from dotenv import load_dotenv
import os

load_dotenv()
os.environ["OPENAI_API_KEY"] = os.getenv("OPENAI_API_KEY", "")
```

---

## 2. Core Concepts

| Concept | Purpose |
|---|---|
| `Agent` | The AI entity with instructions, a model, tools, and optional handoffs |
| `Runner` | Executes an agent on a given input (sync or async) |
| `function_tool` | Decorator that exposes a Python function as a tool to the agent |
| `handoffs` | List of agents this agent can delegate tasks to |
| `InputGuardrail` | Pre-flight check that can block or modify user input |
| `VoicePipeline` | Wraps an agent workflow with STT → Agent → TTS |

---

## 3. Creating a Basic Agent

```python
from agents import Agent, Runner

agent = Agent(
    name="Assistant",
    instructions="You are a helpful assistant. Be polite and concise.",
    model="gpt-4o-mini",   # Default OpenAI model
)

# --- Synchronous run ---
result = Runner.run_sync(agent, "What is the capital of France?")
print(result.final_output)

# --- Async run ---
import asyncio

async def main():
    result = await Runner.run(agent, "Tell me a joke.")
    print(result.final_output)

asyncio.run(main())
```

**Key `Agent` parameters:**

| Parameter | Type | Description |
|---|---|---|
| `name` | `str` | Human-readable agent name |
| `instructions` | `str` | System prompt / persona |
| `model` | `str` or model object | LLM to use |
| `tools` | `list` | Functions or tool objects available to agent |
| `handoffs` | `list[Agent]` | Agents this one can delegate to |
| `handoff_description` | `str` | Description shown to parent agent (for routing) |
| `input_guardrails` | `list` | Guardrails run before agent processes input |
| `output_guardrails` | `list` | Guardrails run after agent produces output |

---

## 4. Using a Custom Model Provider

Use any OpenAI-compatible API (OpenRouter, Gemini, Groq, local Ollama/llama.cpp) by pointing
`AsyncOpenAI` at the provider's base URL.

```python
from openai import AsyncOpenAI
from agents import OpenAIChatCompletionsModel

# --- OpenRouter (access 200+ models) ---
openrouter_client = AsyncOpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=os.getenv("OPENROUTER_API_KEY"),
)
model = OpenAIChatCompletionsModel(
    model="nvidia/nemotron-3-nano-30b-a3b:free",
    openai_client=openrouter_client,
)

# --- Google Gemini ---
gemini_client = AsyncOpenAI(
    base_url="https://generativelanguage.googleapis.com/v1beta/openai/",
    api_key=os.getenv("GEMINI_API_KEY"),
)
gemini_model = OpenAIChatCompletionsModel(
    model="gemini-2.5-flash",
    openai_client=gemini_client,
)

# --- Local model (llama.cpp / Ollama) ---
local_client = AsyncOpenAI(
    base_url="http://127.0.0.1:8080/v1",
    api_key="llama",  # dummy key required by SDK
)
local_model = OpenAIChatCompletionsModel(
    model="llama3",
    openai_client=local_client,
)

# Plug any model into an agent
agent = Agent(
    name="Assistant",
    instructions="You are a helpful assistant.",
    model=model,  # <-- pass model object here
)
```

---

## 5. Multi-Agent Handoffs

Handoffs let a "triage" agent route conversations to specialist agents.

```python
from agents.extensions.handoff_prompt import prompt_with_handoff_instructions

# --- Specialist agents ---
spanish_agent = Agent(
    name="Spanish",
    handoff_description="Handles conversations in Spanish.",   # shown to parent
    instructions=prompt_with_handoff_instructions(
        "You speak only in Spanish. Be polite and concise."
    ),
    model=model,
)

billing_agent = Agent(
    name="Billing",
    handoff_description="Handles billing, payments, and subscription questions.",
    instructions=prompt_with_handoff_instructions(
        "You are a billing specialist. Answer billing questions accurately."
    ),
    model=model,
)

# --- Triage / orchestrator agent ---
triage_agent = Agent(
    name="Triage",
    instructions=prompt_with_handoff_instructions(
        "Route the user to the right agent. "
        "If they speak Spanish, hand off to Spanish agent. "
        "If they ask about billing, hand off to Billing agent."
    ),
    model=model,
    handoffs=[spanish_agent, billing_agent],   # agents available for handoff
)

# Run the triage agent — it will hand off automatically
async def main():
    result = await Runner.run(triage_agent, "Hola, ¿cómo estás?")
    print(result.final_output)
```

> **Important:** Always wrap agent instructions with `prompt_with_handoff_instructions()`
> when using handoffs. This injects the required handoff tool descriptions into the system prompt.

---

## 6. Input Guardrails

Guardrails run *before* the agent processes the user message. Use them to block off-topic
requests, enforce policies, or classify intent.

```python
from pydantic import BaseModel
from agents import Agent, Runner, InputGuardrail, GuardrailFunctionOutput
from agents.exceptions import InputGuardrailTripwireTriggered

# Step 1: Define an output schema for the guardrail check
class TopicCheckOutput(BaseModel):
    is_off_topic: bool
    reason: str

# Step 2: Create a lightweight guardrail agent
guardrail_agent = Agent(
    name="TopicGuardrail",
    instructions=(
        "Check if the user's message is related to cooking. "
        "Return JSON with is_off_topic (bool) and reason (str)."
    ),
    output_type=TopicCheckOutput,
    model=model,
)

# Step 3: Define the guardrail function
async def topic_guardrail(ctx, agent, input_data):
    result = await Runner.run(guardrail_agent, input_data, context=ctx.context)
    output: TopicCheckOutput = result.final_output
    return GuardrailFunctionOutput(
        output_info=output,
        tripwire_triggered=output.is_off_topic,
    )

# Step 4: Attach to your main agent
cooking_agent = Agent(
    name="CookingAssistant",
    instructions="You are a cooking expert. Answer culinary questions only.",
    model=model,
    input_guardrails=[InputGuardrail(guardrail_function=topic_guardrail)],
)

# Step 5: Handle guardrail trips in your app
async def main():
    try:
        result = await Runner.run(cooking_agent, "What's the best pasta recipe?")
        print(result.final_output)
    except InputGuardrailTripwireTriggered as e:
        print(f"Blocked: {e}")
```

---

## 7. Voice Pipeline Agent

Connect an agent to a full Speech-to-Text → Agent → Text-to-Speech pipeline.

```python
import numpy as np
import sounddevice as sd
from agents.voice import AudioInput, SingleAgentVoiceWorkflow, VoicePipeline

# STT client (e.g. Groq Whisper)
stt_client = AsyncOpenAI(
    base_url="https://api.groq.com/openai/v1",
    api_key=os.getenv("GROQ_API_KEY"),
)

# TTS client (e.g. local or ngrok-exposed TTS server)
tts_client = AsyncOpenAI(
    base_url="https://your-tts-server/v1/",
    api_key="llama",
    default_headers={"ngrok-skip-browser-warning": "true"},
)

agent = Agent(
    name="VoiceAssistant",
    instructions=prompt_with_handoff_instructions(
        "You're speaking to a human. Be very concise — this is a voice interface."
    ),
    model=model,
)

async def run_voice():
    pipeline = VoicePipeline(
        workflow=SingleAgentVoiceWorkflow(agent),
        stt_model=stt_client,
        tts_model=tts_client,
    )

    # Record or load audio — here we use a silent 3-second buffer as placeholder
    buffer = np.zeros(24000 * 3, dtype=np.int16)
    audio_input = AudioInput(buffer=buffer)

    result = await pipeline.run(audio_input)

    # Stream audio output to speakers
    player = sd.OutputStream(samplerate=24000, channels=1, dtype=np.int16)
    player.start()
    async for event in result.stream():
        if event.type == "voice_stream_event_audio":
            player.write(event.data)

asyncio.run(run_voice())
```

---

## 8. Structured Output Agents

Force an agent to always return a Pydantic model instead of free text.

```python
from pydantic import BaseModel
from agents import Agent, Runner

class WeatherReport(BaseModel):
    city: str
    temperature_celsius: float
    condition: str
    advice: str

weather_agent = Agent(
    name="WeatherReporter",
    instructions="You produce structured weather reports.",
    model=model,
    output_type=WeatherReport,   # enforces JSON output matching the schema
)

async def main():
    result = await Runner.run(weather_agent, "Weather in Tokyo?")
    report: WeatherReport = result.final_output
    print(report.city, report.condition)
```

---

## 9. Common Patterns & Best Practices

| Pattern | Recommendation |
|---|---|
| **Always use `prompt_with_handoff_instructions`** | Required when `handoffs` is set — without it the agent won't know how to hand off |
| **Keep specialist agents focused** | One job per agent; let the triage agent route |
| **Set `handoff_description` on every specialist** | The triage agent uses this to decide who to call |
| **Use lightweight models for guardrails** | Guardrail agents run on every message — keep them fast and cheap |
| **Use `output_type` for structured data** | Eliminates JSON parsing bugs; model is forced to conform |
| **Async everywhere** | The SDK is async-first; use `asyncio.run(main())` as your entry point |
| **Never hardcode API keys** | Always use `.env` + `python-dotenv` |

---

## 10. Minimal Complete Example

```python
import asyncio, os, random
from dotenv import load_dotenv
from openai import AsyncOpenAI
from agents import Agent, Runner, function_tool, OpenAIChatCompletionsModel
from agents.extensions.handoff_prompt import prompt_with_handoff_instructions

load_dotenv()

client = AsyncOpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=os.getenv("OPENROUTER_API_KEY"),
)
model = OpenAIChatCompletionsModel(
    model="nvidia/nemotron-3-nano-30b-a3b:free",
    openai_client=client,
)

@function_tool
def flip_coin() -> str:
    """Flip a coin and return heads or tails."""
    return random.choice(["heads", "tails"])

assistant = Agent(
    name="Assistant",
    instructions=prompt_with_handoff_instructions(
        "You are a helpful assistant with access to a coin-flip tool."
    ),
    model=model,
    tools=[flip_coin],
)

async def main():
    result = await Runner.run(assistant, "Flip a coin for me!")
    print(result.final_output)

asyncio.run(main())
```
