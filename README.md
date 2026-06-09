# Startup OS

Startup OS is a desktop-first operating system for founders. It transforms your startup ideas into actionable plans, comprehensive strategy reports, and living roadmaps using a central Planner Agent and specialized AI advisors.

## Core Philosophy

- **Not a Chatbot:** Startup OS is an execution engine, not just a chat interface.
- **Desktop First:** Direct local filesystem interaction. No cloud dependency required.
- **Founder Workflow:** Guided experience from Idea → Planning → Strategy → Roadmap → Execution.
- **Single Key Architecture:** Powers everything with a single NVIDIA API Key.

## Features

### Phase 1: First Impression
- **Premium Experience:** Calm, light-themed interface inspired by Linear and Arc.
- **Secure Authentication:** Built-in validation and session persistence.
- **Workspace Setup:** Select any local folder to serve as your project's source of truth.

### Phase 2: Project Creation & Planning
- **Focused Creation:** Deep project description with auto-growing UI and attachment support.
- **Intelligent Initialization:** Planner Agent analyzes your intent before diving in.
- **Clarification Phase:** Smart question cards to eliminate ambiguity.

### Phase 3: Specialist Agents
- **Strategy Team:** Select advisors like Product Strategist, Market Analyst, Technical Architect, and more.
- **Local Memory:** Facts, competitors, and decisions are stored in `memory.json`.
- **Project Assets:** Strategy reports are saved directly to your workspace as Markdown files.

### Phase 4: Execution Engine
- **Dynamic Roadmaps:** Generated uniquely for your project, not from templates.
- **Contextual AI:** Click "Ask AI" on any roadmap block to get task-specific advice.
- **Founder Dashboard:** "Today View" highlights priorities and tracks progress.
- **Command Palette:** Quick actions via `Cmd+K` or `Ctrl+K`.

## Tech Stack

- **Framework:** Electron
- **Frontend:** React, TypeScript, Vite
- **Styling:** TailwindCSS, Framer Motion
- **State:** Zustand, Zod, React Hook Form
- **AI:** NVIDIA NIM (Llama 3.1 405B)

## Getting Started

### Prerequisites

- Node.js (v18+)
- NVIDIA API Key (starts with `nvapi-`)

### Installation

1. Clone the repository:
   ```bash
   git clone <repo-url>
   cd startup-os
   ```

2. Install dependencies:
   ```bash
   npm install --legacy-peer-deps
   ```

3. Run the application in development mode:
   ```bash
   npm run dev
   ```

### Usage

1. **Auth:** Log in (any email/password works for this version).
2. **Workspace:** Select a folder where your projects will live.
3. **Project:** Name your startup and provide a detailed description.
4. **AI Key:** Enter your NVIDIA API Key when prompted during Agent Selection.
5. **Execute:** Follow the generated roadmap and use the Contextual AI for guidance.

## Project Structure

Your workspace will contain:
```
Workspace/
└── Your_Project/
    ├── project.json
    ├── Reports/      (Markdown strategy reports)
    ├── Roadmaps/     (Roadmap data)
    ├── Memory/       (memory.json)
    ├── Assets/
    ├── Attachments/
    └── Exports/
```

## License

ISC License.
