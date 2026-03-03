# Tasks: Physical AI Book Website

**Input**: Design documents from `/specs/001-physical-ai-book/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are OPTIONAL for this project. Quality is ensured through `npm run build` validation and manual browser testing per checkpoint workflow.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story. However, due to the nature of documentation websites, tasks are organized by content parts (Part 1-6 + Appendix) with each part being independently testable.

---

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization, Docusaurus installation, and basic structure

**User Stories**: US1 (navigation), US2 (theme), US3 (deployment foundation)

- [X] T001 [P] Verify Node.js 20.x and npm 10.x installed (`node --version`, `npm --version`)
- [X] T002 [P] Install Docusaurus dependencies: `npm install @docusaurus/core@3.9.x @docusaurus/preset-classic@3.9.x prism-react-renderer`
- [X] T003 [P] Verify project structure: `docs/`, `src/`, `static/`, `package.json`, `docusaurus.config.ts`, `sidebars.ts`
- [X] T004 Read Docusaurus default templates: `docs/tutorial-basics/`, `docs/tutorial-extras/` (RULE 3 compliance)
- [X] T005 [P] Delete default tutorial files from `docs/` folder (keep folder structure only)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY content creation

**⚠️ CRITICAL**: No chapter content work can begin until this phase is complete

**User Stories**: US1 (structure), US2 (theme), US3 (deployment)

- [X] T006 [P] [US2] Create `src/css/custom.css` with purple theme CSS variables (light + dark mode per plan.md)
- [X] T007 [P] [US1] Create `docusaurus.config.ts` with site metadata, title "Physical AI & Humanoid Robotics Crash Course", tagline
- [X] T008 [P] [US1] Create `sidebars.ts` with auto-generated sidebar configuration for all 6 parts + appendix
- [X] T009 [P] [US2] Create `src/pages/index.tsx` custom homepage with hero section and 6 topic cards
- [X] T010 [P] [US2] Create `src/pages/index.module.css` for homepage styling
- [X] T011 [P] [US4] Call source-verified-researcher for homepage content: "Physical AI course 6 topics brief overview with sources"
- [X] T012 [US2] Format and add homepage content from researcher response with References section
- [X] T013 [P] [US1] Create all part folders in `docs/`: `part-1-foundations/`, `part-2-ros2/`, `part-3-simulation/`, `part-4-nvidia-isaac/`, `part-5-humanoid-development/`, `part-6-vla-capstone/`, `appendix/`
- [X] T014 [P] [US1] Create `_category_.json` for each part folder with label and position (per contracts/category-schema.json)
- [X] T015 [P] [US3] Create `.github/workflows/deploy.yml` GitHub Actions workflow for GitHub Pages deployment
- [X] T016 [US3] Run `npm run build` — must pass with zero errors (RULE 8 compliance)
- [X] T017 [US3] Run `npm run start` — verify site loads at http://localhost:3000

**Checkpoint**: Foundation ready — purple theme applied, homepage visible, sidebar shows 7 empty parts, build passes

---

## Phase 3: User Story 1 — Access and Navigate Course Content (Priority: P1) 🎯 MVP

**Goal**: Create intro page and Part 1 (Foundations) with 2 chapters — users can navigate and read content

**Independent Test**: User can open homepage, navigate to Part 1, read Week 1 and Week 2 chapters with proper formatting and references

### Content Creation Workflow (per Constitution RULE 1, RULE 2)

> **NOTE**: All content MUST come from source-verified-researcher. No agent-generated content allowed.

### Research Phase

- [X] T018 [P] [US1] [US4] Call source-verified-researcher for intro.md: "Physical AI course prerequisites programming math AI basics overview"
- [X] T019 [P] [US1] [US4] Call source-verified-researcher for Week 1: "Physical AI definition embodied intelligence academic sources 2024"
- [X] T020 [P] [US1] [US4] Call source-verified-researcher for Week 1: "Digital AI vs physical AI robots key differences technical"
- [X] T021 [P] [US1] [US4] Call source-verified-researcher for Week 1: "Humanoid robotics landscape 2024 Boston Dynamics Tesla Optimus Unitree Figure AI"
- [X] T022 [P] [US1] [US4] Call source-verified-researcher for Week 1: "Perceive think act control loop robotics explanation sources"
- [X] T023 [P] [US1] [US4] Call source-verified-researcher for Week 2: "LiDAR sensor robotics point cloud data how it works sources"
- [X] T024 [P] [US1] [US4] Call source-verified-researcher for Week 2: "Intel RealSense RGB-D depth camera robotics SLAM sources"
- [X] T025 [P] [US1] [US4] Call source-verified-researcher for Week 2: "IMU inertial measurement unit accelerometer gyroscope robotics sources"
- [X] T026 [P] [US1] [US4] Call source-verified-researcher for Week 2: "Force torque sensors robotic manipulation sources"
- [X] T027 [P] [US1] [US4] Call source-verified-researcher for Week 2: "How robots model gravity friction collision detection algorithms sources"
- [X] T028 [P] [US1] [US4] Call source-verified-researcher for Week 2: "Sensor fusion pipeline robotics data processing sources"

### Implementation for User Story 1

- [X] T029 [P] [US1] Create `docs/intro.md` with frontmatter (sidebar_position: 1, title: "Introduction")
- [X] T030 [US1] Format intro.md content from researcher: What is This Book | What Will You Learn | Prerequisites | Technologies Covered | References
- [X] T031 [P] [US1] Create `docs/part-1-foundations/week-01-intro-physical-ai.md` with frontmatter (sidebar_position: 1)
- [X] T032 [US1] Format Week 1 content from researcher: What is Physical AI | Digital vs Physical AI | Humanoid Landscape | The Core Loop | Practical Exercise | Summary | References
- [X] T033 [P] [US1] Create `docs/part-1-foundations/week-02-sensors-physical-laws.md` with frontmatter (sidebar_position: 2)
- [X] T034 [US1] Format Week 2 content from researcher: LiDAR | RGB-D Cameras | IMUs | Force/Torque Sensors | Physical Laws | Sensor Fusion | Practical Exercise | Summary | References
- [X] T035 [US1] [US4] Verify all references have 3+ working source links per chapter
- [X] T036 [US1] Run `npm run build` — verify zero errors, no broken links
- [X] T037 [US1] Run `npm run start` — test navigation: homepage → Part 1 → Week 1 → Week 2 → back

**Checkpoint**: Part 1 complete — 2 chapters with references, navigation working, build passing

---

## Phase 4: User Story 2 — View Content with Proper Branding and Theme (Priority: P2)

**Goal**: Apply and verify purple theme across all content with light/dark mode support

**Independent Test**: Theme toggle works, purple colors consistent in both modes, code blocks and admonitions readable

### Theme Verification Tasks

- [ ] T038 [P] [US2] Test light mode: Verify primary purple #6B21A8, backgrounds white/light
- [ ] T039 [P] [US2] Test dark mode: Verify primary purple #A855F7, background #0F0A1A
- [ ] T040 [US2] Verify code block syntax highlighting readable in both modes
- [ ] T041 [US2] Verify admonitions (tip/warning) colors accessible in both modes
- [ ] T042 [US2] Verify navbar, sidebar, footer consistent purple theme
- [ ] T043 [US2] Take screenshots of light/dark mode for documentation

**Checkpoint**: Theme verified — professional purple appearance in both modes

---

## Phase 5: User Story 3 Part A — ROS 2 Content (Priority: P3)

**Goal**: Create Part 2 (ROS 2) with 3 chapters — users can learn ROS 2 fundamentals

**Independent Test**: User can navigate to Part 2, read all 3 chapters, view code examples, access references

### Research Phase

- [X] T044 [P] [US1] [US4] Call source-verified-researcher for Week 3: "ROS 2 Robot Operating System architecture overview technical 2024 sources"
- [X] T045 [P] [US1] [US4] Call source-verified-researcher for Week 3: "ROS 2 nodes topics services actions explained with code examples sources"
- [X] T046 [P] [US1] [US4] Call source-verified-researcher for Week 3: "DDS Data Distribution Service ROS 2 middleware how it works sources"
- [X] T047 [P] [US1] [US4] Call source-verified-researcher for Week 3: "ROS 2 Humble installation Ubuntu 22.04 step by step sources"
- [X] T048 [P] [US1] [US4] Call source-verified-researcher for Week 4: "Creating ROS 2 Python package rclpy step by step tutorial sources"
- [X] T049 [P] [US1] [US4] Call source-verified-researcher for Week 4: "ROS 2 publisher subscriber pattern Python code example sources"
- [X] T050 [P] [US1] [US4] Call source-verified-researcher for Week 4: "ROS 2 launch files Python XML configuration tutorial sources"
- [X] T051 [P] [US1] [US4] Call source-verified-researcher for Week 4: "ROS 2 parameter management YAML node config sources"
- [X] T052 [P] [US1] [US4] Call source-verified-researcher for Week 4: "ROS 2 teleoperation node Python keyboard control example sources"
- [X] T053 [P] [US1] [US4] Call source-verified-researcher for Week 5: "URDF Unified Robot Description Format humanoid XML structure tutorial sources"
- [X] T054 [P] [US1] [US4] Call source-verified-researcher for Week 5: "Connecting Python AI agents to ROS 2 controllers rclpy sources"
- [X] T055 [P] [US1] [US4] Call source-verified-researcher for Week 5: "TF2 transform system ROS 2 coordinate frames explanation sources"
- [X] T056 [P] [US1] [US4] Call source-verified-researcher for Week 5: "URDF humanoid arm joints links inertial example sources"

### Implementation for Part 2

- [X] T057 [P] [US1] Create `docs/part-2-ros2/week-03-ros2-fundamentals.md` with frontmatter (sidebar_position: 1)
- [X] T058 [US1] Format Week 3 content: What is ROS 2 | Nodes | Topics | Services | Actions | DDS | Installation | Practical | Summary | References
- [X] T059 [P] [US1] Create `docs/part-2-ros2/week-04-ros2-packages.md` with frontmatter (sidebar_position: 2)
- [X] T060 [US1] Format Week 4 content: Package Structure | Creating Package | Publisher/Subscriber | Launch Files | Parameters | Practical: Teleoperation | Summary | References
- [X] T061 [P] [US1] Create `docs/part-2-ros2/week-05-ros2-ai-bridge.md` with frontmatter (sidebar_position: 3)
- [X] T062 [US1] Format Week 5 content: Why Bridge AI to ROS 2 | URDF Format | TF2 Transform | AI Agent to ROS Controller | Practical: URDF Arm | Summary | References
- [X] T063 [US1] [US4] Verify all references have 3+ working source links per chapter
- [X] T064 [US1] Run `npm run build` — verify zero errors, no broken links
- [X] T065 [US1] Run `npm run start` — test navigation to all 3 Part 2 chapters

**Checkpoint**: Part 2 complete — 3 ROS 2 chapters with code examples and references

---

## Phase 6: User Story 3 Part B — Simulation Content (Priority: P3)

**Goal**: Create Part 3 (Simulation) with 2 chapters — users can learn Gazebo and Unity simulation

**Independent Test**: User can navigate to Part 3, read both chapters, understand simulation concepts

### Research Phase

- [X] T066 [P] [US1] [US4] Call source-verified-researcher for Week 6: "Gazebo simulator installation Ubuntu 22.04 ROS 2 integration 2024 sources"
- [X] T067 [P] [US1] [US4] Call source-verified-researcher for Week 6: "URDF vs SDF robot description format difference Gazebo sources"
- [X] T068 [P] [US1] [US4] Call source-verified-researcher for Week 6: "Gazebo physics rigid body dynamics gravity collisions configuration sources"
- [X] T069 [P] [US1] [US4] Call source-verified-researcher for Week 6: "Spawning URDF robot in Gazebo ROS 2 launch file example sources"
- [X] T070 [P] [US1] [US4] Call source-verified-researcher for Week 7: "Gazebo sensor simulation LiDAR depth camera IMU plugins ROS 2 sources"
- [X] T071 [P] [US1] [US4] Call source-verified-researcher for Week 7: "Unity robotics ROS Unity bridge setup tutorial 2024 sources"
- [X] T072 [P] [US1] [US4] Call source-verified-researcher for Week 7: "Unity vs Gazebo robot simulation comparison sources"
- [X] T073 [P] [US1] [US4] Call source-verified-researcher for Week 7: "Human robot interaction simulation environment design principles sources"

### Implementation for Part 3

- [X] T074 [P] [US1] Create `docs/part-3-simulation/week-06-gazebo-setup.md` with frontmatter (sidebar_position: 1)
- [X] T075 [US1] Format Week 6 content: What is Gazebo | Installation | URDF vs SDF | Physics Configuration | Spawning Robot | Practical | Summary | References
- [X] T076 [P] [US1] Create `docs/part-3-simulation/week-07-advanced-simulation.md` with frontmatter (sidebar_position: 2)
- [X] T077 [US1] Format Week 7 content: Sensor Simulation | Unity for Robots | ROS-Unity Bridge | HRI Simulation | Practical | Summary | References
- [X] T078 [US1] [US4] Verify all references have 3+ working source links per chapter
- [X] T079 [US1] Run `npm run build` — verify zero errors, no broken links
- [X] T080 [US1] Run `npm run start` — test navigation to both Part 3 chapters

**Checkpoint**: Part 3 complete — 2 simulation chapters with references

---

## Phase 7: User Story 3 Part C — NVIDIA Isaac Content (Priority: P3)

**Goal**: Create Part 4 (NVIDIA Isaac) with 3 chapters — users can learn Isaac Sim and perception

**Independent Test**: User can navigate to Part 4, read all 3 chapters, understand Isaac ecosystem

### Research Phase

- [X] T081 [P] [US1] [US4] Call source-verified-researcher for Week 8: "NVIDIA Isaac Sim Omniverse features photorealistic simulation 2024 sources"
- [X] T082 [P] [US1] [US4] Call source-verified-researcher for Week 8: "USD Universal Scene Description robotics assets Omniverse sources"
- [X] T083 [P] [US1] [US4] Call source-verified-researcher for Week 8: "NVIDIA Isaac Sim hardware requirements RTX GPU VRAM minimum sources"
- [X] T084 [P] [US1] [US4] Call source-verified-researcher for Week 8: "NVIDIA Isaac ecosystem Isaac Sim Isaac ROS Isaac Lab overview sources"
- [X] T085 [P] [US1] [US4] Call source-verified-researcher for Week 9: "Visual SLAM VSLAM Isaac ROS hardware accelerated tutorial sources"
- [X] T086 [P] [US1] [US4] Call source-verified-researcher for Week 9: "NVIDIA Isaac Perceptor object detection 3D scene understanding sources"
- [X] T087 [P] [US1] [US4] Call source-verified-researcher for Week 9: "Nav2 navigation stack path planning bipedal robot movement ROS 2 sources"
- [X] T088 [P] [US1] [US4] Call source-verified-researcher for Week 9: "Synthetic data generation Isaac Sim domain randomization sources"
- [X] T089 [P] [US1] [US4] Call source-verified-researcher for Week 10: "Sim to real transfer reinforcement learning robotics techniques sources"
- [X] T090 [P] [US1] [US4] Call source-verified-researcher for Week 10: "Domain randomization robot training simulation variance methods sources"
- [X] T091 [P] [US1] [US4] Call source-verified-researcher for Week 10: "NVIDIA Jetson Orin edge AI deployment ROS 2 inference optimization sources"
- [X] T092 [P] [US1] [US4] Call source-verified-researcher for Week 10: "Isaac Sim to physical robot deployment full workflow sources"

### Implementation for Part 4

- [X] T093 [P] [US1] Create `docs/part-4-nvidia-isaac/week-08-isaac-introduction.md` with frontmatter (sidebar_position: 1)
- [X] T094 [US1] Format Week 8 content: NVIDIA Isaac Ecosystem | Isaac Sim & Omniverse | USD Assets | Hardware Requirements | Isaac vs Gazebo | Practical | Summary | References
- [X] T095 [P] [US1] Create `docs/part-4-nvidia-isaac/week-09-isaac-perception.md` with frontmatter (sidebar_position: 2)
- [X] T096 [US1] Format Week 9 content: Visual SLAM | Isaac Perceptor | Nav2 Path Planning | Synthetic Data | Practical | Summary | References
- [X] T097 [P] [US1] Create `docs/part-4-nvidia-isaac/week-10-sim-to-real.md` with frontmatter (sidebar_position: 3)
- [X] T098 [US1] Format Week 10 content: Sim-to-Real Gap | RL for Robots | Domain Randomization | Deploying to Jetson | Full Pipeline | Practical | Summary | References
- [X] T099 [US1] [US4] Verify all references have 3+ working source links per chapter
- [X] T100 [US1] Run `npm run build` — verify zero errors, no broken links
- [X] T101 [US1] Run `npm run start` — test navigation to all 3 Part 4 chapters

**Checkpoint**: Part 4 complete — 3 NVIDIA Isaac chapters with references

---

## Phase 8: User Story 3 Part D — Humanoid Development Content (Priority: P3)

**Goal**: Create Part 5 (Humanoid Development) with 2 chapters — users can learn kinematics and HRI

**Independent Test**: User can navigate to Part 5, read both chapters, understand humanoid concepts

### Research Phase

- [X] T102 [P] [US1] [US4] Call source-verified-researcher for Week 11: "Humanoid robot kinematics forward inverse kinematics Denavit-Hartenberg sources"
- [X] T103 [P] [US1] [US4] Call source-verified-researcher for Week 11: "Bipedal locomotion balance control ZMP zero moment point algorithm sources"
- [X] T104 [P] [US1] [US4] Call source-verified-researcher for Week 11: "Whole body control framework humanoid robot dynamics sources"
- [X] T105 [P] [US1] [US4] Call source-verified-researcher for Week 11: "Unitree G1 H1 humanoid robot SDK specifications 2024 sources"
- [X] T106 [P] [US1] [US4] Call source-verified-researcher for Week 12: "Dexterous robotic grasping manipulation planning algorithms sources"
- [X] T107 [P] [US1] [US4] Call source-verified-researcher for Week 12: "Human robot interaction HRI design principles safety 2024 sources"
- [X] T108 [P] [US1] [US4] Call source-verified-researcher for Week 12: "Gesture recognition collaborative robotics vision based hand tracking sources"
- [X] T109 [P] [US1] [US4] Call source-verified-researcher for Week 12: "Pick and place robot pipeline ROS 2 planning execution sources"

### Implementation for Part 5

- [X] T110 [P] [US1] Create `docs/part-5-humanoid-development/week-11-kinematics-locomotion.md` with frontmatter (sidebar_position: 1)
- [X] T111 [US1] Format Week 11 content: Robot Kinematics | Forward vs Inverse | Bipedal Locomotion | Balance and ZMP | Whole-Body Control | Unitree G1/H1 | Practical | Summary | References
- [X] T112 [P] [US1] Create `docs/part-5-humanoid-development/week-12-manipulation-hri.md` with frontmatter (sidebar_position: 2)
- [X] T113 [US1] Format Week 12 content: Grasping and Manipulation | Dexterous Hand Control | HRI Design Principles | Gesture Recognition | Practical: Pick and Place | Summary | References
- [X] T114 [US1] [US4] Verify all references have 3+ working source links per chapter
- [X] T115 [US1] Run `npm run build` — verify zero errors, no broken links
- [X] T116 [US1] Run `npm run start` — test navigation to both Part 5 chapters

**Checkpoint**: Part 5 complete — 2 humanoid development chapters with references

---

## Phase 9: User Story 3 Part E — VLA & Capstone Content (Priority: P3)

**Goal**: Create Part 6 (VLA & Capstone) with 1 chapter — users can understand VLA and complete capstone

**Independent Test**: User can navigate to Part 6, read capstone chapter, understand VLA pipeline

### Research Phase

- [X] T117 [P] [US1] [US4] Call source-verified-researcher for Week 13: "Vision Language Action VLA models robotics 2024 RT-2 OpenVLA PaLM-E sources"
- [X] T118 [P] [US1] [US4] Call source-verified-researcher for Week 13: "OpenAI Whisper speech recognition robotics voice commands integration sources"
- [X] T119 [P] [US1] [US4] Call source-verified-researcher for Week 13: "LLM task planning natural language to robot actions ROS 2 pipeline sources"
- [X] T120 [P] [US1] [US4] Call source-verified-researcher for Week 13: "Autonomous humanoid robot voice command to manipulation architecture sources"

### Implementation for Part 6

- [X] T121 [P] [US1] Create `docs/part-6-vla-capstone/week-13-vla-capstone.md` with frontmatter (sidebar_position: 1)
- [X] T122 [US1] Format Week 13 content: What is VLA | Voice Commands with Whisper | LLM Cognitive Planning | Natural Language to ROS 2 | Capstone Architecture | Full Pipeline | Evaluation | Summary | References
- [X] T123 [US1] [US4] Verify references have 3+ working source links
- [X] T124 [US1] Run `npm run build` — verify zero errors, no broken links
- [X] T125 [US1] Run `npm run start` — test navigation to Part 6 chapter

**Checkpoint**: Part 6 complete — capstone chapter with references

---

## Phase 10: User Story 3 Part F — Appendix Content (Priority: P3)

**Goal**: Create Appendix with 3 reference pages — users can check hardware and setup requirements

**Independent Test**: User can navigate to Appendix, read all 3 pages with practical information

### Research Phase

- [ ] T126 [P] [US1] [US4] Call source-verified-researcher for Appendix: "Physical AI lab hardware workstation GPU RTX requirements Isaac Sim Gazebo 2024 sources"
- [ ] T127 [P] [US1] [US4] Call source-verified-researcher for Appendix: "AWS RoboMaker NVIDIA Omniverse cloud robotics lab setup cost 2024 sources"
- [ ] T128 [P] [US1] [US4] Call source-verified-researcher for Appendix: "NVIDIA Jetson Orin Nano student kit assembly ROS 2 RealSense camera setup sources"

### Implementation for Appendix

- [ ] T129 [P] [US1] Create `docs/appendix/hardware-requirements.md` with frontmatter (sidebar_position: 1)
- [ ] T130 [US1] Format content: Workstation Requirements | GPU Recommendations | RAM and Storage | OS Requirements | Jetson Edge Kit | References
- [ ] T131 [P] [US1] Create `docs/appendix/cloud-lab-setup.md` with frontmatter (sidebar_position: 2)
- [ ] T132 [US1] Format content: Cloud vs On-Premise | AWS Setup | Azure/GCP Options | Cost Estimation | Limitations | References
- [ ] T133 [P] [US1] Create `docs/appendix/jetson-student-kit.md` with frontmatter (sidebar_position: 3)
- [ ] T134 [US1] Format content: Kit Components | Assembly Steps | ROS 2 on Jetson | Connecting RealSense | Testing Setup | References
- [ ] T135 [US1] [US4] Verify all references have 3+ working source links per appendix page
- [ ] T136 [US1] Run `npm run build` — verify zero errors, no broken links
- [ ] T137 [US1] Run `npm run start` — test navigation to all 3 appendix pages

**Checkpoint**: Appendix complete — 3 reference pages with practical information

---

## Phase 11: User Story 3 — Deployment & Polish (Priority: P3) 🚀

**Goal**: Deploy book to GitHub Pages and make it publicly accessible

**Independent Test**: Website live at https://Furqan-2004.github.io/physical-ai-book/, accessible from any device

### Pre-Deployment Validation

- [ ] T138 [US3] Run final `npm run build` — must pass with zero errors
- [ ] T139 [US3] Verify all 13 chapters + intro + 3 appendix pages exist
- [ ] T140 [US3] [US2] Test theme toggle on desktop, tablet, mobile viewports (Chrome DevTools)
- [ ] T141 [US3] [US1] Test all sidebar navigation links work correctly
- [ ] T142 [US3] [US4] Spot-check 10 random reference links — all must resolve to valid sources

### Deployment

- [ ] T143 [US3] Create GitHub repository: `physical-ai-book` (public, no README/.gitignore/license)
- [ ] T144 [US3] Initialize git: `git init`, `git add .`, `git commit -m "Initial release — Physical AI & Humanoid Robotics Crash Course"`
- [ ] T145 [US3] Set main branch: `git branch -M main`
- [ ] T146 [US3] Add remote: `git remote add origin https://github.com/Furqan-2004/physical-ai-book.git`
- [ ] T147 [US3] Push to GitHub: `git push -u origin main`
- [ ] T148 [US3] Configure GitHub Pages: Settings → Pages → Deploy from branch → gh-pages → Save
- [ ] T149 [US3] Monitor GitHub Actions workflow — wait for green checkmark
- [ ] T150 [US3] Verify live site: https://Furqan-2004.github.io/physical-ai-book/

### Post-Deployment Validation

- [ ] T151 [US3] [US1] Test homepage loads on live site
- [ ] T152 [US3] [US1] Test navigation to 3 random chapters on live site
- [ ] T153 [US3] [US2] Test theme toggle on live site
- [ ] T154 [US3] [US1] Test mobile responsiveness on live site (actual mobile device)
- [ ] T155 [US3] Share live site URL for final review

**Checkpoint**: Book live on GitHub Pages — publicly accessible at https://Furqan-2004.github.io/physical-ai-book/

---

## Phase 12: Polish & Cross-Cutting Concerns

**Purpose**: Final improvements and documentation

- [ ] T156 [P] Update README.md with project description and live site link
- [ ] T157 [P] Add `.gitignore` for node_modules, .docusaurus, build artifacts
- [ ] T158 [US4] Create content maintenance guide: how to update references, add new chapters
- [ ] T159 [US3] Document deployment process for team handoff
- [ ] T160 [US2] Create style guide: color codes, typography, component usage
- [ ] T161 [US1] [US4] Run final comprehensive link check on all 100+ references
- [ ] T162 [US3] Setup Google Analytics or Plausible (optional, user approval required)
- [ ] T163 [US3] Configure custom domain (optional, user approval required)

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1 (Setup) → Phase 2 (Foundational) → Phases 3-10 (Content by Part) → Phase 11 (Deploy) → Phase 12 (Polish)
```

### User Story Mapping

| Phase | User Story | Priority | Chapters |
|-------|-----------|----------|----------|
| Phase 3 | US1 + US4 | P1 | Intro + Part 1 (2 chapters) |
| Phase 4 | US2 | P2 | Theme verification (all content) |
| Phase 5 | US1 + US3 + US4 | P3 | Part 2 (3 chapters) |
| Phase 6 | US1 + US3 + US4 | P3 | Part 3 (2 chapters) |
| Phase 7 | US1 + US3 + US4 | P3 | Part 4 (3 chapters) |
| Phase 8 | US1 + US3 + US4 | P3 | Part 5 (2 chapters) |
| Phase 9 | US1 + US3 + US4 | P3 | Part 6 (1 chapter) |
| Phase 10 | US1 + US3 + US4 | P3 | Appendix (3 pages) |
| Phase 11 | US3 | P3 | Deployment |

### MVP Scope (User Story 1 Only)

**Minimum Viable Product**: Phases 1-3 complete
- Setup + Foundational infrastructure
- Homepage with purple theme
- Intro page + Part 1 (Week 1 & Week 2)
- Navigation working
- Build passing

**Deploy MVP**: After T037 checkpoint, can deploy partial book for early feedback

### Parallel Opportunities

**Within Phases** (tasks marked [P]):
- All researcher calls within a phase can run in parallel
- All file creations within a phase can run in parallel
- Build verification can run while waiting for researcher responses

**Between Phases** (NOT recommended per RULE 5):
- Sequential phase completion required (checkpoint approval needed)
- Exception: Theme verification (Phase 4) can run parallel to content phases once foundational complete

### Sequential Checkpoints (RULE 5 Compliance)

```
T017 → Checkpoint 0 → User Approval → T018
T037 → Checkpoint 1 → User Approval → T044
T065 → Checkpoint 2 → User Approval → T066
T080 → Checkpoint 3 → User Approval → T081
T101 → Checkpoint 4 → User Approval → T102
T116 → Checkpoint 5 → User Approval → T117
T125 → Checkpoint 6 → User Approval → T126
T137 → Checkpoint 7 → User Approval → T138
T155 → Checkpoint 8 → COMPLETE
```

---

## Implementation Strategy

### Chunk-by-Chunk Execution (RULE 5)

1. **Complete Phase 1-2** → Foundation ready
2. **Complete Phase 3** → Part 1 ready → **STOP for user approval**
3. **Complete Phase 5** → Part 2 ready → **STOP for user approval**
4. **Complete Phase 6** → Part 3 ready → **STOP for user approval**
5. **Complete Phase 7** → Part 4 ready → **STOP for user approval**
6. **Complete Phase 8** → Part 5 ready → **STOP for user approval**
7. **Complete Phase 9** → Part 6 ready → **STOP for user approval**
8. **Complete Phase 10** → Appendix ready → **STOP for user approval**
9. **Complete Phase 11** → Deployed → **FINAL CHECKPOINT**

### Quality Gates

- **After each phase**: `npm run build` must pass
- **After each phase**: `npm run start` — manual browser testing
- **After each chapter**: 3+ verified references required
- **Before deployment**: All 163 tasks complete, zero broken links

### Constitution Compliance

- **RULE 1**: No agent-generated content — all from researcher
- **RULE 2**: Researcher called before each chapter
- **RULE 3**: Templates read in T004
- **RULE 4**: Kebab-case filenames throughout
- **RULE 5**: Checkpoint approvals between phases
- **RULE 6**: No extra npm packages without permission
- **RULE 7**: RAG-ready MDX structure
- **RULE 8**: Build passes after each phase
- **RULE 9**: CSS only in custom.css, config only in docusaurus.config.ts
- **RULE 10**: Only 13-week syllabus + appendix content

---

## Notes

- **Total Tasks**: 163
- **User Story 1 (P1)**: Tasks T006-T017, T018-T037, T044-T163 (navigation + content)
- **User Story 2 (P2)**: Tasks T006, T009-T012, T038-T043 (theme)
- **User Story 3 (P3)**: Tasks T015-T017, T044-T155, T156-T163 (deployment + all content)
- **User Story 4 (P1)**: Tasks T011-T012, T018-T163 (source verification — cross-cutting)
- **Parallel Tasks**: 60+ tasks marked [P]
- **Sequential Checkpoints**: 9 approval gates (RULE 5)
- **MVP Scope**: Phases 1-3 (T001-T037)
- **Full Delivery**: All 163 tasks across 12 phases
