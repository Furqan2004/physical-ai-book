# 2-Agent Architecture Implementation

**Date**: 2026-03-06  
**Decision**: Simplified from 3-agent (triage-based) to 2-agent (direct) architecture

---

## 🎯 Architecture Overview

### Before (3-Agent with Triage)
```
User Request → TriageAgent → [ChatAgent OR OrchestratorAgent] → Response
                      ↓
            (Routes to specialist)
```

### After (2-Agent Direct)
```
User Request → ChatAgent → Response         (for RAG queries)
User Request → OrchestratorAgent → Response (for personalization/translation)
```

---

## 📋 Agent Responsibilities

### 1. ChatAgent 📚

**Purpose**: RAG (Retrieval-Augmented Generation) queries and book content questions

**Used By**: 
- `POST /api/chat` - Chat endpoint

**Tools**:
- `qdrant_search` - Search book content
- `save_message` - Save chat responses
- `load_chat_history` - Load conversation context

**Example Queries**:
- "What is RAG?"
- "Explain machine learning"
- "How does ROS2 work?"
- "Teach me about the course intro"

**Agent Configuration**:
```python
chat_agent = Agent(
    name="ChatAgent",
    instructions="""
    You are a helpful book assistant for RAG queries.
    - Answer book content questions
    - Search the book using qdrant_search
    - Provide accurate, cited answers
    """,
    tools=[qdrant_search, save_message, load_chat_history],
)
```

---

### 2. OrchestratorAgent ⚙️

**Purpose**: Content transformation (personalization and translation)

**Used By**:
- `POST /api/personalize` - Personalization endpoint
- `POST /api/translate` - Translation endpoint

**Tools**:
- `personalize_content` - Adapt content to user level
- `translate_to_urdu` - Translate to Urdu
- `save_message` - Save responses

**Example Requests**:
- "Personalize this chapter for beginner"
- "Translate to Urdu"
- "Adapt for my experience level"

**Agent Configuration**:
```python
orchestrator_agent = Agent(
    name="OrchestratorAgent",
    instructions="""
    You are a content transformation specialist.
    - Personalize content based on user background
    - Translate content to Urdu
    - Preserve markdown and code blocks
    """,
    tools=[personalize_content, translate_to_urdu, save_message],
)
```

---

## 🗑️ Removed Components

### TriageAgent (DELETED)

**Why Removed**:
- Unnecessary complexity
- Added latency (extra routing step)
- Direct agent calls are simpler and faster
- Each endpoint knows which agent to use

**File Deleted**: `backend/ai/triage_agent.py`

---

## 📁 Files Modified

### Backend Routers

| File | Change | Agent Used |
|------|--------|------------|
| `routers/chat.py` | Changed from `triage_agent` to `chat_agent` | ChatAgent |
| `routers/personalize.py` | Changed from `triage_agent` to `orchestrator_agent` | OrchestratorAgent |
| `routers/translate.py` | Changed from `triage_agent` to `orchestrator_agent` | OrchestratorAgent |

### AI Agents

| File | Change |
|------|--------|
| `ai/chat_agent.py` | Removed `handoff_description` (no longer needed) |
| `ai/orchestrator_agent.py` | Removed `handoff_description` (no longer needed) |
| `ai/triage_agent.py` | **DELETED** |

---

## 🔄 Request Flow

### Chat/RAG Query Flow

```
User → Frontend → POST /api/chat → Backend
                                        ↓
                              [ChatAgent]
                                        ↓
                              qdrant_search (find content)
                                        ↓
                              Generate answer with citations
                                        ↓
                              Streaming Response → User
```

**Example**:
```javascript
// Frontend call
const response = await fetch(`${API_URL}/api/chat`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: "What is RAG?",
    session_id: "session-123"
  })
});
```

---

### Personalization Flow

```
User → Frontend → POST /api/personalize → Backend
                                              ↓
                                    [OrchestratorAgent]
                                              ↓
                                    personalize_content (transform)
                                              ↓
                                    Streaming Response → User
```

**Example**:
```javascript
// Frontend call
const response = await fetch(`${API_URL}/api/personalize`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    chapter_content: "...",
    chapter_id: "chapter-1"
  })
});
```

---

### Translation Flow

```
User → Frontend → POST /api/translate → Backend
                                          ↓
                                    [OrchestratorAgent]
                                          ↓
                                    translate_to_urdu
                                          ↓
                                    Streaming Response → User
```

**Example**:
```javascript
// Frontend call
const response = await fetch(`${API_URL}/api/translate`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    chapter_content: "...",
    chapter_id: "chapter-1"
  })
});
```

---

## ✅ Benefits of 2-Agent Architecture

| Benefit | Description |
|---------|-------------|
| **Simpler** | No routing logic, direct agent calls |
| **Faster** | One less hop (no triage step) |
| **Clearer** | Each endpoint explicitly uses its agent |
| **Easier Debugging** | Direct trace from endpoint to agent |
| **Less Code** | Removed triage agent and handoff logic |

---

## 🧪 Testing

### Test ChatAgent
```bash
cd backend
./venv/bin/python -c "
from ai.chat_agent import chat_agent
print(f'ChatAgent: {chat_agent.name}')
print(f'Tools: {[t.name for t in chat_agent.tools]}')
"
```

**Expected Output**:
```
ChatAgent: ChatAgent
Tools: ['qdrant_search', 'save_message', 'load_chat_history']
```

---

### Test OrchestratorAgent
```bash
cd backend
./venv/bin/python -c "
from ai.orchestrator_agent import orchestrator_agent
print(f'OrchestratorAgent: {orchestrator_agent.name}')
print(f'Tools: {[t.name for t in orchestrator_agent.tools]}')
"
```

**Expected Output**:
```
OrchestratorAgent: OrchestratorAgent
Tools: ['personalize_content', 'translate_to_urdu', 'save_message']
```

---

### Test Router Imports
```bash
cd backend
./venv/bin/python -c "
from routers import chat, personalize, translate
print('✅ All routers import successfully')
"
```

**Expected Output**:
```
✅ All routers import successfully
```

---

## 📊 Agent Comparison

| Feature | ChatAgent | OrchestratorAgent |
|---------|-----------|-------------------|
| **Purpose** | RAG queries | Content transformation |
| **Endpoint** | `/api/chat` | `/api/personalize`, `/api/translate` |
| **Primary Tool** | `qdrant_search` | `personalize_content`, `translate_to_urdu` |
| **Auth Required** | Optional (guest mode) | Required (logged-in only) |
| **Response Type** | Answer with citations | Transformed content |
| **Saves History** | Yes (logged-in users) | Yes |

---

## 🎯 Summary

**Architecture**: 2 specialized agents (no triage)
- **ChatAgent** → RAG queries, book content questions
- **OrchestratorAgent** → Personalization, translation

**Removed**: TriageAgent (unnecessary complexity)

**Result**: Simpler, faster, easier to maintain

---

## 📝 Next Steps

1. ✅ Backend updated to use 2 agents directly
2. ✅ TriageAgent removed
3. ✅ Router imports verified
4. ⏳ Test with actual API calls
5. ⏳ Monitor agent performance
