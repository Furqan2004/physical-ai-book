---
id: 0003
title: Technical Plan for System Overhaul
stage: plan
date: 2026-03-06
surface: agent
model: Gemini 2.0 Flash
feature: 004-fix-system-and-auth
branch: 004-fix-system-and-auth
user: furqan
command: sp.plan
labels: ["auth", "system", "frontend", "backend", "plan"]
links:
  spec: "specs/004-fix-system-and-auth/spec.md"
  ticket: null
  adr: null
  pr: null
files:
  - specs/004-fix-system-and-auth/plan.md
  - specs/004-fix-system-and-auth/research.md
  - specs/004-fix-system-and-auth/data-model.md
  - specs/004-fix-system-and-auth/quickstart.md
  - specs/004-fix-system-and-auth/contracts/auth.openapi.yaml
  - specs/004-fix-system-and-auth/contracts/agents.openapi.yaml
tests:
  - Constitution Check (passed)
---

## Prompt

/sp.plan # 🛠️ Project Fix Plan — Roman Urdu
> **Target:** AI Agent / Cursor  
> **Rule:** Pehle Frontend poora fix karo → User approve kare → Phir Backend

---

## ⚠️ IMPORTANT WORKING RULE

```
FRONTEND PEHLE → USER APPROVAL → BACKEND BAAD MEIN
```

- Jab tak user frontend approve na kare, **backend ko haath mat lagao**
- Har phase ke baad **ruko** aur user se confirmation lo
- Ek ek masla solve karo, sab ek saath nahi

---

---

# 🖥️ PHASE 1 — FRONTEND (Pehle Ye Poora Karo)

---

## ✅ Task 1 — Signup Button Ka Redirect Fix Karo

**Masla:**
Sign in page par signup button galat URL par bhej raha hai.

**Abhi:**
```
http://localhost:3000/signup
```

**Hona Chahiye:**
```
http://localhost:3000/physical-ai-book/signup
```

**Kya Karna Hai:**
- Sign in page dhundo
- Signup button ka `href` ya `router.push` dhundo
- Path change karo `/signup` se `/physical-ai-book/signup` par

---

## ✅ Task 2 — Forgot Password Page Banao

**Masla:**
Login page par "Forgot Password" button click karne par ye URL kholta hai:
```
http://localhost:3000/forgot-password
```
Lekin ye page **exist nahi karta** — 404 aata hai.

**Kya Karna Hai:**
1. Naya page banao is path par:
   ```
   /physical-ai-book/forgot-password
   ```
2. Is page mein email input form hona chahiye
3. Login page ka "Forgot Password" button ka redirect bhi update karo:
   ```
   /physical-ai-book/forgot-password
   ```

---

## ✅ Task 3 — Login & Signup System — Better Auth Se Implement Karo

**Masla:**
Login aur signup abhi broken hain — kal tak kaam kar rahe the, ab nahi karte.

**Kya Karna Hai:**
- Poora login/signup system **Better Auth** se implement karo
- Documentation: https://better-auth.com/docs/integrations/next
- Next.js ke saath properly integrate karo
- **Neon PostgreSQL backend mein rehne do** — Better Auth bhi usi se connect kare
- Session management, token handling sab Better Auth handle kare

**Routes jo working honi chahiye:**
```
/physical-ai-book/signup   → Signup page
/physical-ai-book/login    → Login page  
/physical-ai-book/forgot-password → Forgot password page
```

---

## ✅ Task 4 — Signup Ke Baad Wale Questions — Frontend Mein Shift Karo

**Masla:**
Signup complete hone ke baad user se kuch sawaal pooche jaate hain. Ye logic abhi backend mein hai.

**Kya Karna Hai:**
- Signup flow mein, jab user successfully register ho jaye
- Uske baad **frontend par hi** ek multi-step form dikhao
- Ye sawaal frontend component ke through handle hon
- Backend ko sirf final answers submit karo (API call)
- Backend se ye logic **hatao ya deactivate karo** — frontend handle karega

---

## ✅ Task 5 — Chatbot Fix Karo Aur Sirf Book Page Par Lagao

**Masla:**
- Chatbot implement hai lekin kaam nahi karta
- Chatbot har jagah dikh raha hai ya galat page par hai

**Kya Karna Hai:**
1. Chatbot **sirf is route par** available hona chahiye:
   ```
   /physical-ai-book/docs/*
   ```
   Matlab docs ke andar **har page par** chatbot dikhna chahiye
2. Baaki **kisi bhi page par chatbot nahi** dikhna chahiye
3. Chatbot ka **actual functionality fix karo** — messages send/receive properly kaam karein
4. Chatbot component mein route check lagao — conditional rendering use karo

---

## ✅ Task 6 — Personalization Agent Fix Karo

**Masla:**
Personalization agent properly kaam nahi kar raha.

**Kya Karna Hai:**
- Agent ka code check karo
- Dekho kahan se call ho raha hai aur kahan fail ho raha hai
- Input/output properly handle ho
- Agent **user ke data ke basis par personalized response** de
- Koi bhi error ya silent failure nahi honi chahiye

---

## ✅ Task 7 — Translation Agent Fix Karo

**Masla:**
Translation agent properly kaam nahi kar raha.

**Kya Karna Hai:**
- Agent ka code check karo
- Translation input sahi se agent tak pohonche
- Translated output correctly wapas aaye
- Language selection properly kaam kare
- Koi bhi bug nahi aana chahiye

---

## ✅ Task 8 — Agents Ko Saare Tools Ka Access Do (Frontend Side)

**Masla:**
Agents ke paas saare available tools ka access nahi hai.

**Kya Karna Hai:**
- Jo bhi tools frontend/agent layer mein available hain, **sab register karo**
- Agent ko tool calling properly execute karni chahiye
- Tools ka response agent sahi se process kare
- Clear aur helpful answers generate hon
- **Koi bhi tool execution mein bug nahi aana chahiye**

---

---

# 🔴 PHASE 1 COMPLETE HONE KE BAAD — RUKNA HAI

```
⛔ BACKEND KO HAATH MAT LAGAO JAB TAK YE NA HO:
```

### Agent Ko Ye Karna Hai Jab Sab Tasks Done Hon:

1. **Khud check karo** — har ek task manually verify karo:
   - [ ] Signup button sahi redirect kar raha hai?
   - [ ] Forgot password page exist karta hai aur kaam karta hai?
   - [ ] Login/Signup Better Auth se properly kaam kar raha hai?
   - [ ] Signup ke baad questions frontend par dikh rahe hain?
   - [ ] Chatbot sirf `/physical-ai-book/docs/*` par hai aur kaam karta hai?
   - [ ] Personalization agent theek kaam kar raha hai?
   - [ ] Translation agent theek kaam kar raha hai?
   - [ ] Agents ko saare tools ka access hai?

2. **User ko clearly batao** — ye likho:

---

```
✅ FRONTEND KE SAARE MASAIL FIX HO GAYE HAIN.

Ab aap apni taraf se check karein:

1. Signup button → /physical-ai-book/signup par ja raha hai?
2. Forgot Password page → /physical-ai-book/forgot-password kaam kar rahi hai?
3. Login aur Signup Better Auth ke saath properly kaam kar rahe hain?
4. Signup ke baad questions frontend par show ho rahe hain?
5. Chatbot sirf /physical-ai-book/docs/ mein dikh raha hai aur kaam kar raha hai?
6. Personalization agent sahi jawab de raha hai?
7. Translation agent sahi se translate kar raha hai?
8. Agents tools ko properly use kar rahe hain?

Jab aap sab check kar lein aur approve karein,
tab main backend ki taraf move karunga. ✅
```

---

3. **User ke approval ka intezaar karo** — jab tak user "approved" ya "theek hai" na kahe, **backend shuru mat karo**

---

---

# ⚙️ PHASE 2 — BACKEND (Sirf User Approval Ke Baad)

> ⛔ Ye section tab open hoga jab user Phase 1 approve kare

---

## ✅ Task 9 — Neon PostgreSQL Verify Aur Fix Karo

**Kya Karna Hai:**
- Neon PostgreSQL connection verify karo
- User history aur user data tables properly exist karein
- Better Auth bhi Neon se connected ho
- Har query sahi se execute ho — koi connection error nahi

---

## ✅ Task 10 — Vector Embeddings Creation Fix Karo

**Kya Karna Hai:**
- Backend mein vector embedding creation ka code check karo
- Embeddings properly generate hon
- Koi bhi embedding creation error nahi aani chahiye

---

## ✅ Task 11 — Qdrant Cloud Mein Embeddings Store Karo

**Kya Karna Hai:**
- Qdrant Cloud connection verify karo
- Help chahiye toh: https://qdrant.tech/documentation/cloud-quickstart/
- Generated embeddings Qdrant mein **perfectly store** hon
- Store hone ke baad verify karo ke data Qdrant mein aa raha hai

---

## ✅ Task 12 — Qdrant Ke Baad Calling Aur Retrieval Fix Karo

**Kya Karna Hai:**
- Embeddings store hone ke baad jo retrieval/search calls hain wo sahi kaam karein
- Query se relevant results wapas aayein
- Koi भी retrieval mein bug nahi hona chahiye

---

## ✅ Task 13 — Qdrant Ke Saare Tools Verify Karo

**Kya Karna Hai:**
- Qdrant ke har tool ko test karo
- Har tool properly execute ho
- Koi bhi tool broken ya incomplete nahi hona chahiye

---

## ✅ Task 14 — Agents Ko Backend Se Saare Tools Ka Access Do

**Kya Karna Hai:**
- Backend side par agents ke paas **saare tools registered** hon
- Tool execution mein koi bhi error nahi aaye
- Agents clear, wazeh, aur helpful jawab generate karein
- End-to-end flow test karo: User query → Agent → Tool → Response

---

---

# 📋 Master Checklist

## Phase 1 — Frontend
| # | Task | Status |
|---|------|--------|
| 1 | Signup button redirect fix | ⬜ Pending |
| 2 | Forgot Password page banao | ⬜ Pending |
| 3 | Login/Signup Better Auth se implement karo | ⬜ Pending |
| 4 | Signup questions frontend mein shift karo | ⬜ Pending |
| 5 | Chatbot fix karo + sirf docs page par lagao | ⬜ Pending |
| 6 | Personalization agent fix karo | ⬜ Pending |
| 7 | Translation agent fix karo | ⬜ Pending |
| 8 | Agents ko saare tools ka access do | ⬜ Pending |

## 🔴 User Approval Checkpoint
| Checkpoint | Status |
|-----------|--------|
| Agent ne sab check kiya | ⬜ Pending |
| User ko report di | ⬜ Pending |
| User ने approve kiya | ⬜ Pending |

## Phase 2 — Backend
| # | Task | Status |
|---|------|--------|
| 9 | Neon PostgreSQL verify & fix | ⬜ Locked 🔒 |
| 10 | Vector embeddings creation fix | ⬜ Locked 🔒 |
| 11 | Qdrant Cloud mein embeddings store | ⬜ Locked 🔒 |
| 12 | Qdrant retrieval/calling fix | ⬜ Locked 🔒 |
| 13 | Qdrant ke saare tools verify | ⬜ Locked 🔒 |
| 14 | Agents ko backend tools ka access | ⬜ Locked 🔒 |

---

> **Note:** Phase 2 ke saare tasks 🔒 LOCKED hain jab tak user Phase 1 approve na kare.

## Response snapshot

Created the implementation plan `plan.md` for feature 004 based on the detailed Roman Urdu prompt. Generated supporting artifacts: `research.md`, `data-model.md`, `quickstart.md`, and OpenAPI contracts for auth and agents. Updated agent-specific context files. Defined Phase 1 (Frontend) and Phase 2 (Backend) with a strict approval gate in between.

## Outcome

- ✅ Impact: High. Sets a clear, gated strategy for system repair.
- 📁 Files: specs/004-fix-system-and-auth/{plan.md, research.md, data-model.md, quickstart.md, contracts/auth.openapi.yaml, contracts/agents.openapi.yaml}
- 🔁 Next prompts: /sp.tasks
- 🧠 Reflection: The user's Roman Urdu instructions provided a very clear roadmap which was easily mapped to the plan structure.
