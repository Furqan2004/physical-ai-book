---
id: 0002
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

### Agent Ko Ye Karna Hai Resetting signup button, forgot password page, chatbot scoping, agent tool registration etc.

## Response snapshot

Created the implementation plan `plan.md` for feature 004. Generated supporting artifacts: `research.md` (auth, chatbot scoping, frontend onboarding), `data-model.md` (Neon PostgreSQL/Qdrant Cloud), `quickstart.md`, and an OpenAPI contract for auth. Updated agent-specific context files. Defined Phase 1 (Frontend) and Phase 2 (Backend) with a strict approval gate in between.

## Outcome

- ✅ Impact: High. Sets a clear, gated strategy for system repair.
- 🧪 Tests: Constitution Check (Rules 1, 2, 3, 5, 8).
- 📁 Files: specs/004-fix-system-and-auth/{plan.md, research.md, data-model.md, quickstart.md, contracts/auth.openapi.yaml}
- 🔁 Next prompts: /sp.tasks
- 🧠 Reflection: The user's Roman Urdu instructions provided a very clear roadmap which was easily mapped to the plan structure.

## Evaluation notes (flywheel)

- Failure modes observed: none
- Graders run and results (PASS/FAIL): PASS
- Prompt variant (if applicable): none
- Next experiment (smallest change to try): none
