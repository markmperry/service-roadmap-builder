# Service Roadmap Builder

A tool for solution architects to create, maintain, and visualise technology service roadmaps.

> *A technology roadmap is a simple, shareable view of where a service is today, where it's going, and what needs to happen to get there.*

## Quick Start

```bash
npm install
npm run dev
```

This starts two processes:
- **Vite dev server** on `http://localhost:3000` (the UI)
- **Express API server** on `http://localhost:3001` (reads/writes JSON files)

## What It Does

Each roadmap captures six sections for a service:

| Section | Purpose |
|---------|---------|
| **Service Identity** | Name, owner, purpose, consumers, and whether the service currently exists |
| **Current State** | Technology stack, health rating, constraints and dependencies |
| **Lifecycle & Risk** | EOL dates, known vulnerabilities, compliance gaps |
| **Target State** | Future architecture and the drivers behind the change |
| **Strategic Posture** | Service-level Disposition (Retain/Upgrade/Replace/Retire) and TIME assessment (Tolerate/Invest/Migrate/Eliminate) |
| **Roadmap Actions** | Sequenced actions with start/end dates, effort, and status |

Three views are available:
- **Edit** — form-based entry for architects
- **Summary** — stakeholder-friendly read-only view with current vs target state
- **Timeline** — visual timeline plotting actions by month with start/end spans

## How Data Storage Works

Each roadmap is saved as an individual `.json` file in the `/data` folder:

```
data/
  bulk-mail-gateway.json
  x86-private-cloud.json
  network-security-microsegmentation-dc.json
```

- **Auto-save** — changes save automatically ~1 second after you stop editing
- **Git-synced** — commit the `/data` folder to share roadmaps with the team
- **Pull to refresh** — when a teammate pushes updated roadmaps, pull and refresh the browser
- **No database** — the filesystem is the database

## Team Workflow

1. Clone the repo
2. `npm install && npm run dev`
3. Create/edit roadmaps in the browser
4. Files auto-save to `/data`
5. Commit and push via VS Code Source Control (or `git add data/ && git commit && git push`)
6. Teammates pull and refresh

## Project Structure

```
├── index.html          # Entry point with fonts and theme
├── src/
│   ├── main.jsx        # React bootstrap
│   └── App.jsx         # Full roadmap builder component
├── server.js           # Express API for file read/write
├── data/               # Roadmap JSON files (Git-tracked)
├── vite.config.js      # Vite configuration
└── package.json        # Dependencies and scripts
```

## Development Environment

This project is developed in **WSL Ubuntu** with **VS Code** (WSL extension). All commands run inside WSL.

| Tool | Purpose |
|------|---------|
| VS Code + WSL extension | Editor and integrated terminal |
| Node.js / npm (in WSL) | Runtime and package management |
| Vite | Dev server with hot reload |
| Express | Lightweight API for file persistence |
| Git / GitHub | Version control and team sharing |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start both UI (port 3000) and API (port 3001) concurrently |
| `npm run dev:ui` | Start Vite dev server only |
| `npm run dev:api` | Start Express API only |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview production build locally |

## Future: Azure Deployment

To move beyond local/Git-based storage:
- **Azure Static Web App** to host the React build
- **Entra ID** for authentication
- **SharePoint List via Graph API** or **Cosmos DB** for persistent multi-user storage
