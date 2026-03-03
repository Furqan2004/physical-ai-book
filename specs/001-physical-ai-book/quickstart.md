# Quick Start: Physical AI Book Development

**Branch**: `001-physical-ai-book`
**Created**: 2026-03-04
**Purpose**: Get developers started with local development quickly

---

## Prerequisites

Before you begin, ensure you have the following installed:

| Tool | Version | How to Check |
|------|---------|--------------|
| Node.js | 20.x or higher | `node --version` |
| npm | 10.x or higher | `npm --version` |
| Git | Latest | `git --version` |

### Installing Prerequisites

**macOS/Linux**:
```bash
# Using nvm (recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 20
nvm use 20
```

**Windows**:
```powershell
# Download and install from https://nodejs.org/
# Or use winget
winget install OpenJS.NodeJS.LTS
```

---

## Installation

### Step 1: Clone the Repository

```bash
git clone https://github.com/Furqan-2004/physical-ai-book.git
cd physical-ai-book
```

### Step 2: Install Dependencies

```bash
npm install
```

This installs:
- Docusaurus core v3.9.x
- Docusaurus preset-classic v3.9.x
- TypeScript and type definitions
- prism-react-renderer for code highlighting
- All required dev dependencies

### Step 3: Start Local Development Server

```bash
npm run start
```

This command:
- Starts webpack dev server
- Enables hot reloading
- Opens browser automatically

**Expected Output**:
```
[SUCCESS] Docusaurus website is running at http://localhost:3000
[INFO] Hot reloading enabled - changes will reflect instantly
```

Open http://localhost:3000 in your browser.

---

## Local Development Workflow

### Editing Content

1. Open `docs/` folder in your code editor
2. Edit any `.md` or `.mdx` file
3. Save the file
4. Browser automatically reloads with changes

### Creating a New Chapter

**Step 1**: Create Part Folder (if it doesn't exist)

```bash
mkdir -p docs/part-X-slug
```

**Step 2**: Create `_category_.json`

```json
{
  "label": "Part X: Part Title",
  "position": 1
}
```

**Step 3**: Create Chapter File

```bash
touch docs/part-X-slug/week-YY-chapter-title.md
```

**Step 4**: Add Frontmatter

```markdown
---
sidebar_position: 1
title: "Week YY: Chapter Title"
description: "SEO-friendly description (150-160 characters)"
tags: [physical-ai, ros2, robotics]
---
```

**Step 5**: Write Content Using Template

```markdown
# Week YY: Chapter Title

## 🎯 Learning Objectives

- Objective 1
- Objective 2
- Objective 3

## Introduction

[Content from source-verified-researcher]

## Section 1: Topic

[Content from source-verified-researcher]

## 🔧 Practical Exercise

[Steps from source-verified-researcher]

## 📝 Summary

[Key takeaways]

## 📚 References

- [Source 1](https://...)
- [Source 2](https://...)
- [Source 3](https://...)
```

**Step 6**: Validate Build

```bash
npm run build
```

---

## Quality Checks

### Before Committing

Run these checks before committing any changes:

**1. Build Validation**
```bash
npm run build
```
**Must pass with zero errors.**

**2. Check for Broken Links**
```bash
npm run build 2>&1 | grep -i "broken\|error"
```
**Should return no results.**

**3. Mobile Responsiveness**
```bash
# Open Chrome DevTools (F12)
# Click device toolbar (Ctrl+Shift+M)
# Test on:
# - iPhone SE (375x667)
# - iPad Air (820x1180)
# - Desktop (1920x1080)
```

**4. Light/Dark Mode**
```bash
# Click theme toggle in navbar
# Verify both modes are readable
# Check code blocks, admonitions, sidebar
```

### Constitution Compliance

Before committing, verify:

- [ ] Content is from source-verified-researcher (RULE 1, RULE 2)
- [ ] Filename is kebab-case (RULE 4)
- [ ] No extra npm packages installed without permission (RULE 6)
- [ ] Build passes with zero errors (RULE 8)
- [ ] CSS only in `src/css/custom.css` (RULE 9)
- [ ] Content matches syllabus (RULE 10)

---

## Deployment

### Manual Deployment (One-Time)

```bash
# Set your GitHub username
export GIT_USER=Furqan-2004

# Deploy to GitHub Pages
npm run deploy
```

**Expected Output**:
```
[SUCCESS] Website deployed to https://Furqan-2004.github.io/physical-ai-book/
```

### Automated Deployment (CI/CD)

GitHub Actions workflow (`.github/workflows/deploy.yml`) automatically deploys on push to `main` branch:

```yaml
name: Deploy to GitHub Pages
on:
  push:
    branches: [main]
```

**Workflow**:
1. Push changes to `main`
2. GitHub Actions triggers
3. `npm install` runs
4. `npm run build` runs
5. Deploy to `gh-pages` branch
6. GitHub Pages updates automatically

---

## Troubleshooting

### Issue: `npm run start` fails with "Port 3000 already in use"

**Solution**:
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use a different port
PORT=3001 npm run start
```

### Issue: `npm run build` fails with "Module not found"

**Solution**:
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Issue: Changes don't reflect in browser

**Solution**:
```bash
# Stop dev server (Ctrl+C)
# Clear Docusaurus cache
rm -rf .docusaurus
# Restart
npm run start
```

### Issue: Broken links in build

**Solution**:
```bash
# Find broken links
npm run build 2>&1 | grep -i "broken"

# Fix the links in the reported files
# Re-run build
npm run build
```

---

## Next Steps

After completing this quickstart:

1. Read `data-model.md` for content schema details
2. Read `contracts/mdx-template.mdx` for chapter template
3. Review `research.md` for technical decisions
4. Start implementing tasks from `tasks.md` (when created)

---

## Getting Help

- **Docusaurus Docs**: https://docusaurus.io/docs
- **Docusaurus Discord**: https://discord.gg/docusaurus
- **Project Issues**: https://github.com/Furqan-2004/physical-ai-book/issues

---

## Command Reference

| Command | Description |
|---------|-------------|
| `npm run start` | Start local development server |
| `npm run build` | Build production bundle |
| `npm run serve` | Serve production build locally |
| `npm run deploy` | Deploy to GitHub Pages |
| `npm run clear` | Clear Docusaurus cache |
| `npm run swizzle [component]` | Customize Docusaurus components |

---

## File Structure Reference

```
physical-ai-book/
├── docs/                    # All book content
│   ├── intro.md            # Welcome page
│   ├── part-1-*/          # Part folders
│   └── appendix/          # Appendix pages
├── src/
│   ├── css/
│   │   └── custom.css     # Purple theme
│   └── pages/
│       └── index.tsx      # Homepage
├── static/
│   └── img/               # Images and favicon
├── .github/workflows/
│   └── deploy.yml         # CI/CD pipeline
├── docusaurus.config.ts   # Site config
├── sidebars.ts            # Navigation
├── package.json           # Dependencies
└── tsconfig.json          # TypeScript config
```
