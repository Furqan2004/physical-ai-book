---
name: openai-agents-tools
description: >
  Use this skill whenever the user wants to create, register, or configure tools for AI agents
  built with the OpenAI Agents SDK (`agents` library). Trigger this skill when the user says
  things like "add a tool to my agent", "create a function tool", "give my agent the ability
  to search the web / call an API / read a file", "how do I make a tool", "write a tool that
  does X", "make my agent use a tool", or any request to extend an agent's capabilities with
  callable Python functions. Also trigger when the user wants typed tool parameters, tool
  error handling, async tools, or chaining multiple tools together.
---

# OpenAI Agents SDK — Tool Creation Skill

This skill covers everything about creating tools for agents: simple function tools, async
tools, typed parameters, error handling, web search tools, and advanced tool patterns.

---

## 1. What Is a Tool?

A **tool** is a Python function that an agent can call during its reasoning loop. The agent
decides *when* to call it and *what arguments* to pass, based on the function's name, docstring,
and type annotations.

The SDK exposes tools to the LLM automatically — you just decorate your function.

---

## 2. The `@function_tool` Decorator

### Minimal tool

```python
from agents import function_tool

@function_tool
def get_current_time() -> str:
    """Return the current UTC time."""
    from datetime import datetime, timezone
    return datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")
```

### Attach to an agent

```python
from agents import Agent

agent = Agent(
    name="Assistant",
    instructions="You are a helpful assistant.",
    model=model,
    tools=[get_current_time],   # pass the decorated function directly
)
```

That's it. The agent will call `get_current_time()` whenever it needs the time.

---

## 3. Tools With Parameters

The agent fills parameters using the **docstring** (description) and **type annotations**
(schema). Always annotate every parameter.

```python
@function_tool
def get_weather(city: str, unit: str = "celsius") -> str:
    """
    Get the current weather for a city.

    Args:
        city: The name of the city to get weather for.
        unit: Temperature unit, either 'celsius' or 'fahrenheit'. Defaults to celsius.
    """
    import random
    temp = random.randint(15, 35)
    if unit == "fahrenheit":
        temp = temp * 9 // 5 + 32
    conditions = ["sunny", "cloudy", "rainy", "windy"]
    return f"{city}: {temp}°{'F' if unit == 'fahrenheit' else 'C'}, {random.choice(conditions)}"
```

### Supported parameter types

| Python type | What the LLM sees |
|---|---|
| `str` | string |
| `int` | integer |
| `float` | number |
| `bool` | boolean |
| `list[str]` | array of strings |
| `dict` | object |
| Pydantic `BaseModel` | structured JSON object |

---

## 4. Tools With Pydantic Input Models

For complex structured inputs, define a Pydantic model as the parameter type.

```python
from pydantic import BaseModel
from agents import function_tool

class SearchQuery(BaseModel):
    query: str
    max_results: int = 5
    language: str = "en"

@function_tool
def web_search(params: SearchQuery) -> str:
    """
    Search the web for information.

    Args:
        params: Search parameters including query string, result count, and language.
    """
    # Replace with real search API call
    return f"Top {params.max_results} results for '{params.query}' in {params.language}: ..."
```

---

## 5. Async Tools

If your tool makes network requests or I/O calls, make it `async` to avoid blocking.

```python
import httpx
from agents import function_tool

@function_tool
async def fetch_crypto_price(symbol: str) -> str:
    """
    Fetch the current price of a cryptocurrency.

    Args:
        symbol: The ticker symbol, e.g. BTC, ETH, SOL.
    """
    url = f"https://api.coinbase.com/v2/prices/{symbol}-USD/spot"
    async with httpx.AsyncClient() as client:
        response = await client.get(url)
        if response.status_code == 200:
            data = response.json()
            price = data["data"]["amount"]
            return f"{symbol}: ${price} USD"
        return f"Could not fetch price for {symbol}."
```

---

## 6. Error Handling Inside Tools

Tools should **never crash the agent**. Catch exceptions and return a descriptive error string
so the agent can reason about what went wrong.

```python
@function_tool
async def read_file(filepath: str) -> str:
    """
    Read the contents of a text file.

    Args:
        filepath: Absolute or relative path to the file.
    """
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read()
        if not content.strip():
            return f"File '{filepath}' exists but is empty."
        return content
    except FileNotFoundError:
        return f"Error: File '{filepath}' not found."
    except PermissionError:
        return f"Error: No permission to read '{filepath}'."
    except Exception as e:
        return f"Error reading file: {str(e)}"
```

---

## 7. Tool That Returns Structured Data

Return a dict or Pydantic model — the SDK serializes it to JSON for the agent.

```python
from pydantic import BaseModel
from agents import function_tool

class UserProfile(BaseModel):
    name: str
    email: str
    plan: str
    joined_days_ago: int

@function_tool
def get_user_profile(user_id: str) -> UserProfile:
    """
    Retrieve the profile of a user by their ID.

    Args:
        user_id: The unique identifier of the user.
    """
    # Simulate a database lookup
    fake_db = {
        "u001": UserProfile(name="Alice", email="alice@example.com", plan="pro", joined_days_ago=120),
        "u002": UserProfile(name="Bob",   email="bob@example.com",   plan="free", joined_days_ago=30),
    }
    return fake_db.get(user_id, UserProfile(name="Unknown", email="", plan="none", joined_days_ago=0))
```

---

## 8. Multiple Tools on One Agent

```python
import random
from agents import Agent, function_tool

@function_tool
def get_weather(city: str) -> str:
    """Get the weather for a city."""
    return f"{city}: {random.choice(['sunny', 'rainy', 'cloudy'])}"

@function_tool
def get_time(timezone: str = "UTC") -> str:
    """Get the current time in a given timezone."""
    from datetime import datetime
    return f"Current time in {timezone}: {datetime.utcnow().strftime('%H:%M')} (approx)"

@function_tool
def calculate(expression: str) -> str:
    """
    Evaluate a safe mathematical expression.

    Args:
        expression: A math expression like '2 + 2' or '100 / 4'.
    """
    try:
        result = eval(expression, {"__builtins__": {}})
        return f"{expression} = {result}"
    except Exception as e:
        return f"Could not evaluate '{expression}': {e}"

agent = Agent(
    name="MultiToolAssistant",
    instructions="You are a helpful assistant with access to weather, time, and calculator tools.",
    model=model,
    tools=[get_weather, get_time, calculate],
)
```

---

## 9. Tool Naming & Docstring Best Practices

The agent reads the function name and docstring to decide *when* and *how* to use a tool.
Write them like you're explaining the tool to a smart intern.

| ✅ Good | ❌ Bad |
|---|---|
| `def get_user_orders(user_id: str)` | `def tool1(x)` |
| Docstring: "Fetch all orders placed by a user." | Docstring: "does stuff" |
| Parameter doc: "The unique user identifier." | No parameter docs |
| Returns descriptive string on failure | Raises an exception |
| `async` for any I/O | Blocking `requests.get(...)` inside sync tool |

---

## 10. Web Search Tool (Built-in)

The SDK ships a ready-made web search tool you can drop directly into any agent.

```python
from agents import Agent
from agents.tools import WebSearchTool

agent = Agent(
    name="ResearchAssistant",
    instructions="You help users research topics using web search.",
    model=model,
    tools=[WebSearchTool()],
)
```

---

## 11. Tool That Calls Another Agent (Agent-as-Tool)

You can wrap an entire agent as a tool, enabling nested agent calls without full handoff.

```python
from agents import Agent, Runner, function_tool

summarizer_agent = Agent(
    name="Summarizer",
    instructions="Summarize the given text in 2-3 sentences.",
    model=model,
)

@function_tool
async def summarize_text(text: str) -> str:
    """
    Summarize a long piece of text into 2-3 sentences.

    Args:
        text: The text to summarize.
    """
    result = await Runner.run(summarizer_agent, text)
    return result.final_output

main_agent = Agent(
    name="ResearchAgent",
    instructions="You are a research assistant. Use the summarize_text tool to condense articles.",
    model=model,
    tools=[summarize_text],
)
```

---

## 12. Complete Working Example

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

# --- Define tools ---

@function_tool
def get_weather(city: str) -> str:
    """Get the current weather in a given city."""
    return f"{city}: {random.choice(['sunny ☀️', 'rainy 🌧️', 'cloudy ☁️', 'snowy ❄️'])}"

@function_tool
def convert_currency(amount: float, from_currency: str, to_currency: str) -> str:
    """
    Convert an amount between two currencies using a fixed rate (demo only).

    Args:
        amount: The numeric amount to convert.
        from_currency: Source currency code, e.g. USD.
        to_currency: Target currency code, e.g. EUR.
    """
    rates = {"USD": 1.0, "EUR": 0.92, "GBP": 0.79, "JPY": 149.5, "PKR": 278.0}
    if from_currency not in rates or to_currency not in rates:
        return f"Unsupported currency. Available: {', '.join(rates.keys())}"
    converted = amount / rates[from_currency] * rates[to_currency]
    return f"{amount} {from_currency} = {converted:.2f} {to_currency}"

@function_tool
def tell_joke(topic: str = "general") -> str:
    """
    Tell a short joke on a given topic.

    Args:
        topic: The topic for the joke (e.g. programming, food, animals).
    """
    jokes = {
        "programming": "Why do programmers prefer dark mode? Because light attracts bugs!",
        "food": "Why did the tomato turn red? Because it saw the salad dressing!",
        "general": "I told my wife she was drawing her eyebrows too high. She looked surprised.",
    }
    return jokes.get(topic, jokes["general"])

# --- Build agent with all tools ---

agent = Agent(
    name="ToolDemoAssistant",
    instructions=prompt_with_handoff_instructions(
        "You are a helpful assistant. Use your tools to answer questions about weather, "
        "currency conversion, and jokes. Always pick the most relevant tool."
    ),
    model=model,
    tools=[get_weather, convert_currency, tell_joke],
)

async def main():
    queries = [
        "What's the weather like in Karachi?",
        "Convert 500 USD to PKR.",
        "Tell me a programming joke.",
    ]
    for query in queries:
        print(f"\n🧑 {query}")
        result = await Runner.run(agent, query)
        print(f"🤖 {result.final_output}")

asyncio.run(main())
```

---

## 13. Quick Reference

```python
# Minimal tool
@function_tool
def my_tool(param: str) -> str:
    """One-line description of what this tool does."""
    return "result"

# Async tool (for I/O)
@function_tool
async def my_async_tool(param: str) -> str:
    """Description."""
    result = await some_async_call(param)
    return result

# Tool with Pydantic input
class MyInput(BaseModel):
    field_a: str
    field_b: int = 10

@function_tool
def structured_tool(data: MyInput) -> str:
    """Description. Args: data: Structured input."""
    return f"{data.field_a} × {data.field_b}"

# Register tools on agent
agent = Agent(name="X", instructions="...", model=model,
              tools=[my_tool, my_async_tool, structured_tool])
```
