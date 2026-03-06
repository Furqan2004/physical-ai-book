# Phase 0 Research: Technical Decisions & Rationale

**Created**: 2026-03-05
**Feature**: 001-rag-chatbot-auth
**Status**: Complete

---

## Decision 1: LLM and Embeddings Provider

**Decision**: Use OpenRouter for both LLM and embeddings

**Rationale**:
- Single API key for both services
- Free tier models available (`nvidia/nemotron-3-nano-30b-a3b:free` for LLM, `nvidia/llama-nemotron-embed-vl-1b-v2:free` for embeddings)
- Compatible with OpenAI SDK format
- No credit card required for free tier

**Alternatives Considered**:
| Option | Pros | Cons | Why Rejected |
|--------|------|------|--------------|
| OpenAI direct | Industry standard, reliable | Paid only, requires credit card | Budget constraint (free tier required) |
| Groq | Fast inference | Limited model selection | Not needed for this use case |
| Hugging Face Inference API | Free tier available | Rate limits, slower | OpenRouter provides better free models |

**Constitution Alignment**: RULE 6 (no undocumented decisions) — technology choice documented and justified.

---

## Decision 2: Vector Database

**Decision**: Qdrant Cloud Free Tier

**Rationale**:
- Free tier: 1GB storage, sufficient for book content (~50 chapters)
- Native Python client with async support
- Cosine similarity for semantic search
- Payload support for metadata (chapter name, heading, source file)

**Alternatives Considered**:
| Option | Pros | Cons | Why Rejected |
|--------|------|------|--------------|
| Pinecone | Managed service, easy setup | Free tier limited to 1 index | Qdrant offers more flexibility |
| ChromaDB | Simple, local-first | No managed free tier | Deployment complexity |
| Weaviate | Feature-rich | Steeper learning curve | Qdrant simpler for this use case |

**Constitution Alignment**: RULE 7 (RAG-ready architecture) — Qdrant supports chunked indexing with metadata.

---

## Decision 3: Relational Database

**Decision**: Neon Serverless Postgres

**Rationale**:
- Free tier: 0.5 GB storage, serverless scaling
- Full PostgreSQL compatibility
- Built-in connection pooling
- Works seamlessly with asyncpg (async Python driver)

**Alternatives Considered**:
| Option | Pros | Cons | Why Rejected |
|--------|------|------|--------------|
| Supabase | Backend-as-a-service | More opinionated structure | Need raw SQL control |
| PlanetScale | MySQL-compatible | No free tier anymore | Cost constraint |
| Railway Postgres | Easy deployment | Paid after $5 credit | Neon has better free tier |

**Constitution Alignment**: RULE 4 (structured code) — Neon integrates with standard PostgreSQL patterns.

---

## Decision 4: Authentication Library

**Decision**: Better Auth (custom implementation with JWT)

**Rationale**:
- Lightweight, no external dependencies beyond python-jose
- Full control over session management
- Compatible with localStorage token storage on frontend
- 30-day token expiry matches user expectations

**Alternatives Considered**:
| Option | Pros | Cons | Why Rejected |
|--------|------|------|--------------|
| Auth0 | Enterprise features | Overkill, paid for production | Complexity and cost |
| Firebase Auth | Easy integration | Vendor lock-in | Prefer self-hosted |
| NextAuth.js | Great for Next.js | Not compatible with Docusaurus | Wrong framework |

**Constitution Alignment**: RULE 6 (no undocumented decisions) — auth approach documented.

---

## Decision 5: Backend Framework

**Decision**: FastAPI

**Rationale**:
- Native async/await support
- Automatic OpenAPI documentation
- Pydantic for request/response validation
- Excellent for streaming responses (SSE)

**Alternatives Considered**:
| Option | Pros | Cons | Why Rejected |
|--------|------|------|--------------|
| Flask | Simple, mature | No async support | Need streaming for chat |
| Django REST Framework | Full-featured | Heavy, opinionated | Overkill for this API |
| Express.js | Popular | JavaScript, not Python | Team prefers Python |

**Constitution Alignment**: RULE 4 (structured code) — FastAPI enforces type hints and validation.

---

## Decision 6: Agent Architecture

**Decision**: OpenAI Agents SDK with 3-agent system (Triage, Chat, Orchestrator)

**Rationale**:
- Clean separation of concerns
- Triage agent routes requests appropriately
- Chat agent handles RAG queries with tools
- Orchestrator agent handles content transformation
- Tools pattern allows modular functionality

**Agents**:
1. **TriageAgent**: Routes requests to appropriate specialist agent
2. **ChatAgent**: Handles book questions using RAG (qdrant_search, db_tool)
3. **OrchestratorAgent**: Handles personalization and translation (personalize_tool, translate_tool)

**Tools**:
1. `qdrant_search_tool`: Search book content
2. `db_tool`: Save/load chat history
3. `personalize_tool`: Rewrite content based on user background
4. `translate_tool`: Translate content to Urdu

**Alternatives Considered**:
| Option | Pros | Cons | Why Rejected |
|--------|------|------|--------------|
| Single agent with all tools | Simpler architecture | Tool selection confusion | Multiple agents provide better routing |
| LangChain | More features | Heavier dependency | Agents SDK is lighter |
| Custom agent loop | Full control | Reinventing the wheel | Agents SDK is production-ready |

**Constitution Alignment**: RULE 5 (ek kaam ek waqt) — agent separation enables phased implementation.

---

## Decision 7: Frontend State Management

**Decision**: React Context API for auth state

**Rationale**:
- No additional dependencies
- Sufficient for auth state (user, token)
- Works with Docusaurus TypeScript setup
- Easy to test and debug

**Alternatives Considered**:
| Option | Pros | Cons | Why Rejected |
|--------|------|------|--------------|
| Redux | Powerful, devtools | Overkill for simple auth | Added complexity |
| Zustand | Lightweight | Extra dependency | Context API sufficient |
| Jotai | Atomic state | Extra dependency | Not needed |

**Constitution Alignment**: RULE 6 (no extra packages without approval).

---

## Decision 8: Deployment Platform

**Decision**: Railway for backend, GitHub Pages for frontend

**Rationale**:
- Railway: Free tier ($5 credit), automatic deployments from GitHub
- GitHub Pages: Already configured for Docusaurus
- CORS configuration straightforward
- No Docker knowledge required for user

**Alternatives Considered**:
| Option | Pros | Cons | Why Rejected |
|--------|------|------|--------------|
| Vercel | Great for frontend | Backend functions limited | Need persistent backend |
| Render | Free tier available | Slower cold starts | Railway faster |
| Heroku | Easy deployment | No free tier | Cost constraint |

**Constitution Alignment**: RULE 8 (build pass) — both platforms have automatic build verification.

---

## Decision 9: Chunking Strategy

**Decision**: 400 words per chunk, 50 word overlap

**Rationale**:
- 400 words ≈ 500 tokens (fits LLM context efficiently)
- 50 word overlap ensures context continuity
- Matches embedding model optimal input size
- Proven pattern in RAG implementations

**Alternatives Considered**:
| Option | Pros | Cons | Why Rejected |
|--------|------|------|--------------|
| Fixed token count (512) | Precise control | Complex tokenization | Word-based simpler |
| Paragraph-based | Natural boundaries | Inconsistent sizes | Harder to batch |
| Chapter-based | Simple | Too large for embeddings | Loses granularity |

**Constitution Alignment**: RULE 7 (RAG-ready) — chunking strategy optimized for retrieval.

---

## Decision 10: Streaming Response Format

**Decision**: Server-Sent Events (SSE)

**Rationale**:
- Native browser support
- Simpler than WebSocket
- Unidirectional (server to client) perfect for streaming text
- FastAPI has built-in `StreamingResponse`

**Alternatives Considered**:
| Option | Pros | Cons | Why Rejected |
|--------|------|------|--------------|
| WebSocket | Bidirectional | More complex | Only need server->client |
| Polling | Simple | Inefficient, latency | SSE better for streaming |
| GraphQL Subscriptions | Powerful | Overkill | SSE sufficient |

**Constitution Alignment**: RULE 4 (structured code) — SSE is standard pattern.

---

## Summary of Technology Choices

| Component | Technology | Model/Version |
|-----------|-----------|---------------|
| LLM | OpenRouter | `nvidia/nemotron-3-nano-30b-a3b:free` |
| Embeddings | OpenRouter | `nvidia/llama-nemotron-embed-vl-1b-v2:free` |
| Vector DB | Qdrant Cloud | Free Tier |
| Relational DB | Neon | Serverless Postgres |
| Backend | FastAPI | 0.115.0 |
| Frontend | Docusaurus | v3.9.x |
| Auth | Better Auth + JWT | Custom implementation |
| Agents | OpenAI Agents SDK | 0.0.15 |
| Deployment | Railway + GitHub Pages | Free tiers |

---

## Unresolved Questions (None)

All technical decisions have been made and documented. No NEEDS CLARIFICATION markers remain.
