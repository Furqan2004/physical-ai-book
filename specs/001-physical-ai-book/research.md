# Research & Discovery: Physical AI Book Website

**Created**: 2026-03-04
**Branch**: `001-physical-ai-book`
**Purpose**: Resolve all NEEDS CLARIFICATION items and document technical decisions

---

## Decision 1: Docusaurus Version & Setup

**What was chosen**: Docusaurus v3.9.x with classic preset, TypeScript configuration

**Why chosen**: 
- Constitution mandates Docusaurus v3.9.x
- TypeScript provides better IDE support and type safety
- Classic preset includes docs, blog, and pages out of the box
- Active maintenance and strong community support

**Alternatives considered**:
- Docusaurus v4 alpha: Not stable enough for production
- Next.js + MDX: More complex, requires custom docs infrastructure
- VitePress: Vue-based, less suitable for technical documentation at this scale
- GitBook: Proprietary, less customization control

---

## Decision 2: MDX Content Format

**What was chosen**: MDX (Markdown + JSX) with Docusaurus admonitions

**Why chosen**:
- Constitution mandates MDX for RAG-ready architecture
- JSX components enable interactive elements (future chatbot integration)
- Docusaurus admonitions (`:::tip`, `:::warning`) provide consistent styling
- Code block syntax supports line highlighting and language tabs
- Frontmatter enables metadata for SEO and navigation

**Alternatives considered**:
- Pure Markdown: Insufficient for RAG chatbot component embedding
- reStructuredText: Not supported by Docusaurus
- AsciiDoc: Not supported by Docusaurus

---

## Decision 3: GitHub Pages Deployment

**What was chosen**: GitHub Actions with `peaceiris/actions-gh-pages@v3`

**Why chosen**:
- Free hosting for open-source projects
- Automated deployment on push to main branch
- No server maintenance required
- Built-in HTTPS and CDN
- Constitution mandates GitHub Pages deployment

**Alternatives considered**:
- Vercel: Free tier sufficient, but GitHub Pages simpler for static sites
- Netlify: Similar features, but GitHub integration less seamless
- AWS S3 + CloudFront: More complex, unnecessary for this scale
- Self-hosted VPS: Requires maintenance, violates "free textbook" goal

---

## Decision 4: Purple Theme Implementation

**What was chosen**: CSS variables in `src/css/custom.css` following Docusaurus theming system

**Light Mode Colors**:
- `--ifm-color-primary: #6B21A8` (deep purple)
- `--ifm-color-primary-dark: #581C87`
- `--ifm-color-primary-darker: #4C1D95`
- `--ifm-color-primary-darkest: #3B0764`
- `--ifm-color-primary-light: #7C3AED`
- `--ifm-color-primary-lighter: #9333EA`
- `--ifm-color-primary-lightest: #A855F7`

**Dark Mode Colors**:
- `--ifm-color-primary: #A855F7` (bright purple)
- `--ifm-color-primary-dark: #9333EA`
- `--ifm-color-primary-darker: #7C3AED`
- `--ifm-color-primary-darkest: #6D28D9`
- `--ifm-color-primary-light: #C084FC`
- `--ifm-color-primary-lighter: #D8B4FE`
- `--ifm-color-primary-lightest: #EDE9FE`
- `--ifm-background-color: #0F0A1A` (dark background)

**Why chosen**:
- Constitution mandates purple theme with AI/robotics aesthetics
- CSS variables enable seamless light/dark mode switching
- Docusaurus theming system designed for this approach
- Accessibility: Purple shades maintain WCAG AA contrast ratios

**Alternatives considered**:
- Blue theme: Common, less distinctive for AI/robotics branding
- Green theme: Associated with sustainability, not AI
- Custom theme package: Violates RULE 9 (branding only in approved locations)

---

## Decision 5: Folder Structure & Naming

**What was chosen**: Docusaurus convention with `docs/` folder, kebab-case filenames, `_category_.json` configuration

**Structure**:
```
docs/
├── intro.md
├── part-1-foundations/
│   ├── _category_.json
│   ├── week-01-intro-physical-ai.md
│   └── week-02-sensors-physical-laws.md
├── part-2-ros2/
│   └── ...
```

**Why chosen**:
- Constitution mandates Docusaurus official conventions (RULE 3)
- Constitution mandates kebab-case filenames (RULE 4)
- `_category_.json` provides sidebar labels and ordering
- Part-based organization matches 13-week syllabus structure
- Logical chapter boundaries support RAG indexing (RULE 7)

**Alternatives considered**:
- Flat structure: Would lose logical grouping, harder to navigate
- Date-based folders: Not suitable for evergreen educational content
- Module-based naming: Less intuitive than "Part/Week" structure

---

## Decision 6: Build Validation & Quality Gates

**What was chosen**: `npm run build` after each major step, broken link detection, zero-error tolerance

**Why chosen**:
- Constitution mandates build always pass (RULE 8)
- Docusaurus build validates MDX syntax, links, and configuration
- Broken link detection prevents dead references
- Zero-error tolerance ensures production readiness

**Alternatives considered**:
- CI-only builds: Violates RULE 8 (build must pass before next task)
- Lenient build (warnings allowed): Could accumulate technical debt
- Manual testing only: Not scalable, error-prone

---

## Decision 7: Responsive Design Strategy

**What was chosen**: Docusaurus built-in responsive design with mobile-first CSS

**Breakpoints**:
- Mobile: < 997px (hamburger menu, single column)
- Tablet: 997px - 1200px (collapsible sidebar, optimized width)
- Desktop: > 1200px (full sidebar, multi-column where applicable)

**Why chosen**:
- Constitution mandates responsive design (User Story 3)
- Docusaurus handles responsive breakpoints automatically
- Mobile navigation collapses to hamburger menu
- Code blocks scroll horizontally on small screens
- Touch targets sized appropriately for mobile

**Alternatives considered**:
- Desktop-only: Violates accessibility requirements
- Separate mobile site: Unnecessary complexity with modern CSS
- Progressive Web App: Overkill for documentation site

---

## Decision 8: Source Verification Workflow

**What was chosen**: source-verified-researcher agent called before each chapter section

**Workflow**:
1. Identify chapter section topic
2. Call source-verified-researcher with specific query
3. Receive verified content + source URLs
4. Format content in MDX template
5. Add References section with 3+ sources
6. Build validation checks for broken links

**Why chosen**:
- Constitution mandates source verification (RULE 1, RULE 2)
- Ensures content authenticity and traceability
- Prevents agent hallucination of technical facts
- Provides further reading for learners

**Alternatives considered**:
- Manual research by developer: Time-consuming, inconsistent quality
- AI-generated content without verification: Violates RULE 1
- Crowd-sourced content: Quality control challenges

---

## Summary of Resolved Clarifications

All technical decisions documented above resolve potential NEEDS CLARIFICATION items:

| Decision Area | Resolution |
|---------------|------------|
| Framework | Docusaurus v3.9.x with TypeScript |
| Content Format | MDX with frontmatter and admonitions |
| Deployment | GitHub Actions + GitHub Pages |
| Theme | Purple CSS variables in custom.css |
| Structure | Docusaurus conventions with kebab-case |
| Quality | `npm run build` zero-error gate |
| Responsive | Docusaurus built-in breakpoints |
| Content Source | source-verified-researcher mandatory |

**No NEEDS CLARIFICATION markers remain** — all technical choices documented and justified.
