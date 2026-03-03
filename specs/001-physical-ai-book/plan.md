# Implementation Plan: Physical AI Book Website

**Branch**: `001-physical-ai-book` | **Date**: 2026-03-04 | **Spec**: [specs/001-physical-ai-book/spec.md](./spec.md)
**Input**: Complete 13-week Physical AI & Humanoid Robotics Crash Course website using Docusaurus v3.9.x with source-verified content, purple branding, and GitHub Pages deployment

**Note**: This template is filled in by the `/sp.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Build a professional online textbook website for "Physical AI & Humanoid Robotics Crash Course" using Docusaurus v3.9.x with 13 weekly chapters organized into 6 parts, purple theme (light/dark modes), source-verified content workflow, and automated GitHub Pages deployment. The website will serve students and developers learning Physical AI, ROS 2, simulation, NVIDIA Isaac, humanoid robots, and VLA systems.

---

## Technical Context

**Language/Version**: TypeScript 5.x (Docusaurus v3.9.x requires TypeScript), Node.js 20.x LTS
**Primary Dependencies**: @docusaurus/core v3.9.x, @docusaurus/preset-classic v3.9.x, prism-react-renderer
**Storage**: Static MDX files in docs/ folder (no database — content is static markdown/MDX)
**Testing**: Build validation via `npm run build`, link checking via Docusaurus built-in validation
**Target Platform**: Web (static site hosted on GitHub Pages), responsive design for desktop/tablet/mobile
**Project Type**: Single documentation website (Docusaurus docs-focused structure)
**Performance Goals**: Page load <2s desktop, <3s mobile 3G; Lighthouse score >90; zero broken links
**Constraints**: No third-party themes; content must be source-verified; kebab-case filenames only; purple theme via CSS variables
**Scale/Scope**: 13 chapters + 3 appendix pages + homepage + intro; 6 parts total; ~50-70 MDX sections

---

## Constitution Check

**GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.**

| Constitution Principle | Compliance Status | Evidence |
|------------------------|-------------------|----------|
| **RULE 1: Apni Taraf Se Kuch Nahi** | ✅ PASS | Plan mandates source-verified-researcher for all content; no agent-generated content allowed |
| **RULE 2: Source-Verified-Researcher Mandatory** | ✅ PASS | Every chapter requires researcher call before content writing; references section mandatory |
| **RULE 3: Docusaurus Template Pehle Padhna** | ✅ PASS | Phase 1 includes reading default Docusaurus templates before custom file creation |
| **RULE 4: Code Bilkul Structured** | ✅ PASS | Folder structure follows Docusaurus conventions; kebab-case filenames enforced |
| **RULE 5: Ek Kaam Ek Waqt Mein** | ✅ PASS | Tasks will be chunked by chapter/part; sequential completion required |
| **RULE 6: Koi Undocumented Decision** | ✅ PASS | All technical decisions documented in this plan; no unauthorized npm packages |
| **RULE 7: RAG-Ready Architecture** | ✅ PASS | MDX files structured with consistent frontmatter; logical chapter boundaries |
| **RULE 8: Build Hamesha Pass Hona** | ✅ PASS | `npm run build` required after each major step; build gate enforced |
| **RULE 9: Branding Sirf Approved Jagahon** | ✅ PASS | Purple theme only in `src/css/custom.css`; config only in `docusaurus.config.ts` |
| **RULE 10: Book Content Sirf Course Outline** | ✅ PASS | Content limited to 13-week syllabus + 3 appendix pages; no extra topics |

**GATE RESULT**: ✅ ALL PRINCIPLES PASS — Proceed to Phase 0 research

---

## Project Structure

### Documentation (this feature)

```text
specs/001-physical-ai-book/
├── plan.md              # This file (/sp.plan command output)
├── research.md          # Phase 0 output (/sp.plan command)
├── data-model.md        # Phase 1 output (content model & frontmatter schema)
├── quickstart.md        # Phase 1 output (local development setup guide)
├── contracts/           # Phase 1 output (MDX template contract, category JSON schema)
│   ├── mdx-template.mdx
│   └── category-schema.json
└── tasks.md             # Phase 2 output (/sp.tasks command - NOT created by /sp.plan)
```

### Source Code (repository root)

```text
physical-ai-book/
├── .github/
│   └── workflows/
│       └── deploy.yml           # GitHub Actions CI/CD
├── docs/
│   ├── intro.md                 # Book welcome page
│   ├── part-1-foundations/
│   │   ├── _category_.json      # label: "Part 1: Foundations", position: 1
│   │   ├── week-01-intro-physical-ai.md
│   │   └── week-02-sensors-physical-laws.md
│   ├── part-2-ros2/
│   │   ├── _category_.json      # label: "Part 2: ROS 2", position: 2
│   │   ├── week-03-ros2-fundamentals.md
│   │   ├── week-04-ros2-packages.md
│   │   └── week-05-ros2-ai-bridge.md
│   ├── part-3-simulation/
│   │   ├── _category_.json      # label: "Part 3: Simulation", position: 3
│   │   ├── week-06-gazebo-setup.md
│   │   └── week-07-advanced-simulation.md
│   ├── part-4-nvidia-isaac/
│   │   ├── _category_.json      # label: "Part 4: NVIDIA Isaac", position: 4
│   │   ├── week-08-isaac-introduction.md
│   │   ├── week-09-isaac-perception.md
│   │   └── week-10-sim-to-real.md
│   ├── part-5-humanoid-development/
│   │   ├── _category_.json      # label: "Part 5: Humanoid Development", position: 5
│   │   ├── week-11-kinematics-locomotion.md
│   │   └── week-12-manipulation-hri.md
│   ├── part-6-vla-capstone/
│   │   ├── _category_.json      # label: "Part 6: VLA & Capstone", position: 6
│   │   └── week-13-vla-capstone.md
│   └── appendix/
│       ├── _category_.json      # label: "Appendix", position: 7
│       ├── hardware-requirements.md
│       ├── cloud-lab-setup.md
│       └── jetson-student-kit.md
├── src/
│   ├── css/
│   │   └── custom.css           # Purple theme CSS variables
│   └── pages/
│       └── index.tsx            # Custom homepage
├── static/
│   └── img/
│       ├── logo.svg             # Book logo
│       └── favicon.ico
├── .gitignore
├── docusaurus.config.ts         # Site configuration
├── sidebars.ts                  # Sidebar navigation
├── package.json
└── tsconfig.json
```

**Structure Decision**: Single Docusaurus project structure (Option 1 from template adapted for docs). No backend/frontend split needed — this is a static documentation site. All content in `docs/` folder with MDX format.

---

## Phase 0: Research & Discovery

### Research Tasks

**Task 0.1**: Docusaurus v3.9.x Default Template Analysis
- Read `docs/tutorial-basics/` folder structure
- Read `docs/tutorial-extras/` folder structure
- Analyze `docusaurus.config.ts` default fields
- Analyze `sidebars.ts` auto-generation vs manual configuration
- Study `src/pages/index.tsx` homepage structure
- Study `src/css/custom.css` CSS variable system
- Document MDX frontmatter requirements

**Task 0.2**: Docusaurus MDX Features & Admonitions
- Research MDX syntax in Docusaurus v3.9.x
- Document admonition usage (`:::tip`, `:::warning`, `:::note`, `:::info`, `:::danger`)
- Research code block syntax with line highlighting
- Research JSX component embedding in MDX

**Task 0.3**: GitHub Pages Deployment Best Practices
- Research GitHub Actions workflow for Docusaurus
- Document `peaceiris/actions-gh-pages@v3` configuration
- Research custom domain vs github.io subdomain setup
- Document build optimization for static sites

**Task 0.4**: Purple Theme Implementation
- Research Docusaurus theming system via CSS variables
- Document light/dark mode color variable mapping
- Research accessibility contrast ratios for purple shades
- Document code block highlighting theme customization

**Task 0.5**: Responsive Design for Documentation Sites
- Research Docusaurus responsive breakpoints
- Document mobile navigation patterns (hamburger menu)
- Research table and code block scrolling on mobile
- Document touch target sizing for mobile UX

---

## Phase 1: Design & Contracts

### Content Model (data-model.md)

#### Chapter Entity

```typescript
interface Chapter {
  // Frontmatter (YAML)
  sidebar_position: number;      // Integer for ordering
  title: string;                 // "Week X: Chapter Title"
  description: string;           // SEO meta description
  tags: string[];                // ["physical-ai", "ros2", "robotics"]
  
  // Body Content (MDX)
  learning_objectives: string[]; // 3-5 bullet points
  introduction: string;          // Opening paragraph
  sections: Section[];           // 2-5 main sections
  practical_exercise: Exercise;  // Hands-on activity
  summary: string;               // Key takeaways
  references: Reference[];       // 3+ verified sources
}

interface Section {
  heading: string;               // H2 or H3
  content: string;               // Markdown content
  code_examples?: CodeBlock[];   // Optional code snippets
  admonitions?: Admonition[];    // Tips, warnings
}

interface Reference {
  title: string;                 // Source title
  url: string;                   // Verified source URL
  type: 'official-docs' | 'research-paper' | 'manufacturer-docs' | 'tutorial';
}
```

#### Part Entity

```typescript
interface Part {
  folder_name: string;           // kebab-case, e.g., "part-1-foundations"
  category_json: {
    label: string;               // Display name in sidebar
    position: number;            // 1-7 for ordering
    collapsible?: boolean;       // true (default)
    className?: string;          // Optional custom CSS
  };
  chapters: Chapter[];           // 2-4 chapters per part
}
```

### API Contracts (contracts/)

#### Contract 1: MDX Template (contracts/mdx-template.mdx)

```mdx
---
sidebar_position: 1
title: "Week X: Chapter Title"
description: "Short SEO-friendly description"
tags: [physical-ai, ros2, robotics]
---

# Week X: Chapter Title

## 🎯 Learning Objectives

- Objective 1 (from researcher)
- Objective 2 (from researcher)
- Objective 3 (from researcher)

## Introduction

[Researcher-verified opening content]

## Section 1: Topic Name

[Researcher-verified content]

```python
# Code example (from researcher)
code here
```

:::tip Pro Tip
[Researcher-verified tip]
:::

:::warning Important Note
[Researcher-verified warning]
:::

## Section 2: Topic Name

[Researcher-verified content]

## 🔧 Practical Exercise

[Researcher-verified step-by-step instructions]

## 📝 Summary

[Researcher-verified key takeaways]

## 📚 References

- [Source Title 1](researcher-returned-url-1)
- [Source Title 2](researcher-returned-url-2)
- [Source Title 3](researcher-returned-url-3)
```

#### Contract 2: Category JSON Schema (contracts/category-schema.json)

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Docusaurus Category Configuration",
  "type": "object",
  "required": ["label", "position"],
  "properties": {
    "label": {
      "type": "string",
      "description": "Display name in sidebar",
      "minLength": 1
    },
    "position": {
      "type": "integer",
      "description": "Order in sidebar (lower = higher)",
      "minimum": 1
    },
    "collapsible": {
      "type": "boolean",
      "description": "Whether category can be collapsed",
      "default": true
    },
    "className": {
      "type": "string",
      "description": "Optional custom CSS class"
    }
  }
}
```

### Quick Start Guide (quickstart.md)

```markdown
# Quick Start: Physical AI Book Development

## Prerequisites

- Node.js 20.x or higher
- npm 10.x or higher
- Git

## Installation

```bash
# Clone the repository
git clone https://github.com/Furqan-2004/physical-ai-book.git
cd physical-ai-book

# Install dependencies
npm install

# Start local development server
npm run start
```

## Local Development

Open http://localhost:3000 to view the book locally.

## Creating a New Chapter

1. Create folder in `docs/part-X-.../`
2. Create `_category_.json` if part doesn't exist
3. Create MDX file with kebab-case name
4. Add frontmatter with sidebar_position
5. Write content using MDX template
6. Add References section with 3+ sources
7. Run `npm run build` to validate

## Deployment

```bash
# Build for production
npm run build

# Deploy to GitHub Pages (requires write access)
GIT_USER=<your-username> npm run deploy
```

## Quality Checks

- `npm run build` — Must pass with zero errors
- Check for broken links in build output
- Verify mobile responsiveness in browser DevTools
- Test light/dark mode toggle
```

---

## Constitution Check (Post-Design)

**Re-evaluation after Phase 1 design completion**

| Principle | Status | Notes |
|-----------|--------|-------|
| RULE 1-10 | ✅ PASS | All principles remain satisfied post-design |
| Tech Stack | ✅ PASS | Only Docusaurus v3.9.x and approved dependencies |
| File Naming | ✅ PASS | All paths use kebab-case |
| CSS/Config Separation | ✅ PASS | Theme in custom.css, config in docusaurus.config.ts |

**FINAL GATE RESULT**: ✅ ALL PRINCIPLES PASS — Ready for task creation

---

## Complexity Tracking

No violations detected. All constitution principles satisfied with straightforward Docusaurus documentation structure.

---

## Next Steps

1. Run `/sp.tasks` to break this plan into implementation tasks
2. Tasks will be organized by user story priority (P1 → P2 → P3)
3. Each chapter will be a separate task chunk (RULE 5 compliance)
4. source-verified-researcher calls will be explicit tasks before content writing
