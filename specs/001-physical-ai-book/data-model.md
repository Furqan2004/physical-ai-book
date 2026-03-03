# Content Data Model: Physical AI Book Website

**Created**: 2026-03-04
**Branch**: `001-physical-ai-book`
**Purpose**: Define content entities, frontmatter schema, and validation rules

---

## Entity 1: Chapter

### Frontmatter Schema (YAML)

```yaml
sidebar_position: <integer>     # Required: 1-999, determines order in sidebar
title: <string>                 # Required: "Week X: Chapter Title" format
description: <string>           # Required: 150-160 characters for SEO
tags: <string[]>                # Required: 3-5 tags from approved list
```

### Approved Tags List

```
physical-ai, ros2, robotics, humanoid, simulation, gazebo, nvidia-isaac, 
omniverse, slaac, perception, manipulation, control-systems, kinematics, 
locomotion, hri, vla, llm, voice-control, autonomous, capstone, 
sensors, lidar, camera, imu, urdf, sdf, tf2, nav2, jetson, embedded
```

### Body Content Structure

```markdown
# Week X: Chapter Title

## 🎯 Learning Objectives
- 3-5 bullet points (required)
- Each objective starts with action verb
- Objectives are measurable and testable

## Introduction
- 1-2 paragraphs (required)
- Sets context for chapter
- Links to prerequisites if applicable

## Section N: Section Title
- 2-5 main sections per chapter (required)
- Each section has H2 heading
- Sections contain:
  - Explanatory text (researcher-verified)
  - Code blocks (if applicable, researcher-verified)
  - Admonitions (tips, warnings as needed)

## 🔧 Practical Exercise
- Step-by-step instructions (required)
- Clear success criteria
- Expected output described

## 📝 Summary
- 3-5 bullet points (required)
- Key takeaways only
- Links to next chapter if applicable

## 📚 References
- 3+ verified sources (required)
- Format: `- [Title](URL)`
- Sources must be authoritative:
  - Official documentation
  - Peer-reviewed research papers
  - Manufacturer documentation
  - Reputable tutorials (official blogs, GitHub repos)
```

### Validation Rules

| Field | Rule | Error Message |
|-------|------|---------------|
| `sidebar_position` | Must be integer ≥ 1 | "sidebar_position must be a positive integer" |
| `title` | Must match pattern `^Week \d+: .+$` | "title must start with 'Week X: '" |
| `description` | Length 50-160 characters | "description must be 50-160 characters" |
| `tags` | Array of 3-5 approved tags | "tags must be 3-5 items from approved list" |
| Learning Objectives | 3-5 bullet points | "Must have 3-5 learning objectives" |
| Sections | 2-5 H2 sections | "Must have 2-5 main sections" |
| References | 3+ links | "Must have at least 3 references" |

---

## Entity 2: Part

### Folder Structure

```
docs/
└── part-X-slug/
    ├── _category_.json
    ├── week-YY-chapter-title.md
    └── week-ZZ-another-chapter.md
```

### `_category_.json` Schema

```json
{
  "label": "<string>",        // Required: Display name in sidebar
  "position": <integer>,      // Required: 1-7, determines part order
  "collapsible": true,        // Optional: default true
  "className": "<string>"     // Optional: custom CSS class
}
```

### Part Definitions

| Part | Folder | Label | Position | Chapters |
|------|--------|-------|----------|----------|
| Part 1 | `part-1-foundations` | "Part 1: Foundations of Physical AI" | 1 | Week 01, Week 02 |
| Part 2 | `part-2-ros2` | "Part 2: ROS 2 — Robotic Nervous System" | 2 | Week 03, Week 04, Week 05 |
| Part 3 | `part-3-simulation` | "Part 3: Digital Twin — Simulation" | 3 | Week 06, Week 07 |
| Part 4 | `part-4-nvidia-isaac` | "Part 4: NVIDIA Isaac Platform" | 4 | Week 08, Week 09, Week 10 |
| Part 5 | `part-5-humanoid-development` | "Part 5: Humanoid Robot Development" | 5 | Week 11, Week 12 |
| Part 6 | `part-6-vla-capstone` | "Part 6: VLA & Capstone" | 6 | Week 13 |
| Appendix | `appendix` | "Appendix: Hardware & Setup" | 7 | Hardware, Cloud Lab, Jetson Kit |

### Validation Rules

| Field | Rule | Error Message |
|-------|------|---------------|
| `label` | Non-empty string | "label must not be empty" |
| `position` | Integer 1-7 | "position must be between 1 and 7" |
| Folder name | Kebab-case pattern | "Folder name must be kebab-case" |
| Chapter count | 2-4 chapters per part | "Part must have 2-4 chapters" |

---

## Entity 3: Reference

### Structure

```markdown
- [Source Title](https://example.com/path)
```

### Reference Types

| Type | Description | Examples |
|------|-------------|----------|
| `official-docs` | Official project documentation | ROS 2 Docs, NVIDIA Docs, Gazebo Docs |
| `research-paper` | Peer-reviewed academic papers | IEEE, ACM, arXiv papers |
| `manufacturer-docs` | Hardware manufacturer documentation | Boston Dynamics, Unitree, Tesla |
| `tutorial` | Official tutorials and guides | Docusaurus tutorials, NVIDIA tutorials |

### Validation Rules

| Rule | Error Message |
|------|---------------|
| URL must be valid HTTP/HTTPS | "Reference URL must start with http:// or https://" |
| URL must not be placeholder | "Reference URL must be a real link, not example.com" |
| Title must be descriptive | "Reference title must describe the source" |
| Minimum 3 references per chapter | "Each chapter must have at least 3 references" |

---

## Entity 4: Research Query

### Structure

```json
{
  "query": "<string>",         // Required: Specific question to researcher
  "chapter": "<string>",       // Required: Chapter this query belongs to
  "section": "<string>",       // Optional: Specific section if applicable
  "expected_output": {         // Required: What we expect back
    "content_type": "<string>", // "technical-explanation", "code-example", "definition"
    "min_sources": <integer>    // Minimum number of sources required
  }
}
```

### Example Queries

```json
{
  "query": "Physical AI definition and embodied intelligence concept with academic references",
  "chapter": "Week 01: Introduction to Physical AI",
  "section": "What is Physical AI?",
  "expected_output": {
    "content_type": "technical-explanation",
    "min_sources": 3
  }
}
```

---

## Entity 5: Admonition

### Types (Docusaurus v3.9.x)

```markdown
:::note
General information
:::

:::tip
Helpful tips and best practices
:::

:::info
Additional context or background
:::

:::caution
Warnings about potential issues
:::

:::warning
Critical warnings requiring attention
:::

:::danger
Severe warnings (safety, data loss)
:::
```

### Usage Rules

| Rule | Guidance |
|------|----------|
| Max per chapter | 3-5 admonitions total |
| Tip usage | Best practices, pro tips, shortcuts |
| Warning/Caution | Common pitfalls, gotchas, errors to avoid |
| Danger | Safety-critical information (robotics hazards) |
| Content | Must be researcher-verified, not agent-generated |

---

## Entity 6: Code Block

### Syntax

````markdown
```language
# Code content here
```
````

### Supported Languages

```
python, cpp, c, javascript, typescript, bash, shell, yaml, json, 
xml, html, css, markdown, mdx, urdf, sdf, launch
```

### Line Highlighting

````markdown
```python showLineNumbers {2-4,6}
def example():
    # This line highlighted
    # This line highlighted
    # This line highlighted
    pass
    # This line also highlighted
```
````

### Validation Rules

| Rule | Error Message |
|------|---------------|
| Language must be specified | "Code block must have a language identifier" |
| Language must be supported | "Language must be from supported list" |
| Code must be researcher-verified | "Code examples must come from verified sources" |
| Max lines per block | "Code blocks should be under 50 lines for readability" |

---

## Relationships

```
Part (1) ──→ (N) Chapter
Chapter (1) ──→ (N) Section
Chapter (1) ──→ (N) Reference
Chapter (1) ──→ (N) Admonition
Chapter (1) ──→ (N) Code Block
Chapter (1) ──→ (1) Research Query (before writing)
```

---

## State Transitions

### Chapter Lifecycle

```
[DRAFT] → [RESEARCH IN PROGRESS] → [CONTENT WRITING] → [BUILD VALIDATION] → [PUBLISHED]
   ↑              ↑                        ↑                    ↑
   │              │                        │                    │
   └──────────────┴────────────────────────┴────────────────────┘
              (Iterate if validation fails)
```

### State Definitions

| State | Description | Allowed Actions |
|-------|-------------|-----------------|
| DRAFT | Chapter file created, no content | Assign research queries |
| RESEARCH IN PROGRESS | Waiting for researcher response | Format content when received |
| CONTENT WRITING | MDX content being written | Run build validation |
| BUILD VALIDATION | `npm run build` running | Fix errors or publish |
| PUBLISHED | Chapter live on website | Update/maintain only |

---

## RAG-Ready Considerations

For future Task 2 (RAG Chatbot) compatibility:

1. **Consistent Frontmatter**: All chapters have structured metadata
2. **Logical Boundaries**: Each chapter covers one coherent topic
3. **Clear Headings**: H1 for title, H2 for sections, H3 for subsections
4. **Semantic Structure**: Learning objectives → content → exercises → summary
5. **No Inline JSX Complexity**: Keep JSX minimal for easy text extraction
6. **Reference Links**: External sources provide additional context vectors
