---
id: 001
title: create-project-constitution
stage: constitution
date: 2026-03-04T00:00:00Z
surface: agent
model: qwen-coder
feature: none
branch: main
user: furqan
command: /sp.constitution
labels: ["constitution", "governance", "project-setup"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - .specify/memory/constitution.md
tests:
  - N/A (constitution document creation)
---

## Prompt

/sp.constitution # sp.constitution — Physical AI & Humanoid Robotics Book Project
# Version: 1.0 | Language: Roman Urdu

---

## PROJECT KA MAQSAD

Hum ek professional online book website bana rahe hain:
**"Physical AI & Humanoid Robotics Crash Course"**

- Tool: Docusaurus v3.9.x
- Deploy: GitHub Pages
- AI Dev Agent: Claude Code (main orchestrator)
- Spec Workflow: Spec-Kit Plus (sp commands)
- Sub-Agent: source-verified-researcher (research karta hai)
- Future Task: RAG Chatbot embed hoga (Task 2 — abhi nahi)

---

## 🔴 ZAROORI QAWAID — YEH KABHI NAHI TODENGE

### RULE 1: Apni Taraf Se Kuch Nahi
- Claude Code ya koi bhi agent apni taraf se koi bhi content,
  chapter, section, fact, ya explanation ADD NAHI KAREGA.
- Jo content source-verified-researcher return kare,
  SIRF WOHI use hoga — ek word bhi zyada nahi.
- Agar researcher ne kuch nahi diya, woh section BLANK ya
  placeholder rehega — Claude khud fill NAHI karega.

### RULE 2: Source-Verified-Researcher Sub-Agent Mandatory Hai
- Book ka har chapter, har section likhne se PEHLE
  source-verified-researcher ko call kiya jayega.
- Researcher do cheezein return karega:
    (a) Verified content/information
    (b) Source links (URLs) har point ke saath
- Jab tak researcher response nahi deta,
  Claude Code content nahi likhega.
- Content likhne ke baad sources markdown mein
  "References" section mein add kiye jayenge.

### RULE 3: Docusaurus Template Pehle Padhna ZAROORI Hai
- Kaam shuru karne se PEHLE Claude Code Docusaurus ka
  default generated project khud dekhega:
    - `docs/tutorial-basics/` folder
    - `docs/tutorial-extras/` folder
    - `docusaurus.config.js` default structure
    - `sidebars.js` default structure
    - `src/pages/index.tsx` default structure
- Yeh templates padhe bina koi bhi file create NAHI hogi.
- Template ka structure samjhne ke baad hi custom files banegi.

### RULE 4: Code Bilkul Structured Hoga
- Har file apni sahi jagah par hogi — koi random placement nahi.
- Folder structure Docusaurus official convention follow karega.
- Koi "quick hack" ya shortcut nahi chalega.
- File names: sirf `kebab-case` (e.g., `week-01-intro.md`) — 
  koi spaces, koi CamelCase, koi underscores.

### RULE 5: Ek Kaam Ek Waqt Mein — Chunks Mein Chalein
- Tasks sirf chunk-by-chunk complete honge.
- Ek task complete + verify hone ke BAAD hi agla shuru hoga.
- Koi "main sab ek saath kar leta hoon" approach nahi chalegi.

### RULE 6: Koi Undocumented Decision Nahi
- Agar koi aisi technical choice aaye jo plan mein nahi thi,
  pehle poochha jayega — agent khud decide NAHI karega.
- Extra npm packages: permission ke bina INSTALL NAHI honge.

### RULE 7: RAG-Ready Architecture Abhi Se
- Har MDX file is tarah structured hogi ke baad mein
  Task 2 mein RAG indexing ke liye directly use ho sake.
- Chapter boundaries logical hongi — random torna nahi.
- Consistent file naming aur frontmatter mandatory hai.

### RULE 8: Build Hamesha Pass Hona Chahiye
- `npm run build` har major step ke baad run karna zaroori hai.
- Broken links, missing files, invalid MDX — acceptable NAHI.
- Agar build fail ho, agla task NAHI shuru hoga jab tak fix na ho.

### RULE 9: Branding Sirf Approved Jagahon Par
- Colors sirf `src/css/custom.css` mein jayenge.
- Config sirf `docusaurus.config.js` mein.
- Koi inline styles, koi random CSS files nahi banenge.

### RULE 10: Book Content Sirf Course Outline Ke Andar
- Sirf provided syllabus ke topics cover honge.
- Agent apni taraf se extra topics, chapters, sections
  ADD NAHI KAREGA — chahe woh relevant bhi lagein.

---

## ✅ APPROVED TECH STACK — CHANGE NAHI HOGI

| Layer              | Technology                          |
|--------------------|--------------------------------------|
| Book Framework     | Docusaurus v3.9.x (classic preset)  |
| Content Format     | MDX (Markdown + JSX)                |
| Deployment         | GitHub Pages                        |
| CI/CD              | GitHub Actions                      |
| Main AI Agent      | Claude Code                         |
| Research Sub-Agent | source-verified-researcher          |
| Spec Workflow      | Spec-Kit Plus (sp commands)         |
| Chatbot (Task 2)   | OpenAI Agents SDK + FastAPI +       |
|                    | Neon Serverless Postgres + Qdrant   |

---

## ✅ JO KAAM ALLOWED HAI

- Docusaurus project initialize karna
- Templates padhna aur samajhna
- source-verified-researcher se content maangna
- Researcher ka diya content MDX mein format karna
- Sidebar aur navigation configure karna
- Purple color theme lagana
- GitHub Pages par deploy karna
- Task 2 ke liye folder structure ready rakhna

## ❌ JO KAAM ALLOWED NAHI

- Researcher ke bina khud content likhna
- Book outline se bahar kuch add karna
- Bina permission ke npm packages install karna
- Sirf ek baar mein poora kaam karne ki koshish
- Task 2 ka koi bhi code Task 1 mein dalna
- Koi third-party Docusaurus theme use karna
- Template dekhe bina files banana
- Sources ke bina content publish karna

## Response snapshot

Created project constitution at `.specify/memory/constitution.md` with version 1.0.0. The constitution includes:

- **Project purpose**: "Physical AI & Humanoid Robotics Crash Course" book using Docusaurus v3.9.x
- **10 core principles (ZAROORI QAWAID)**: Content authenticity, mandatory research verification, template-first approach, structured code, chunked execution, documented decisions, RAG-ready architecture, build validation, branding consistency, scope adherence
- **Approved tech stack**: Docusaurus, MDX, GitHub Pages, Claude Code, source-verified-researcher
- **Allowed/not allowed work**: Clear boundaries for agent behavior
- **Governance section**: Compliance, amendment process, versioning policy (MAJOR/MINOR/PATCH)

All template placeholders replaced. No bracketed tokens remaining. Sync impact report added as HTML comment at top.

## Outcome

- ✅ Impact: Initial constitution created with 10 principles, governance rules, and tech stack for Physical AI & Humanoid Robotics book project
- 🧪 Tests: N/A (constitution document - no tests applicable)
- 📁 Files: `.specify/memory/constitution.md` (created/overwritten)
- 🔁 Next prompts: Consider running `/sp.specify` to define first feature, or `/sp.plan` to plan book structure
- 🧠 Reflection: Constitution in Roman Urdu preserves user's intended language and cultural context while maintaining professional governance structure

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): N/A
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): N/A
