# Service Roadmap Builder

A tool for solution architects to create, maintain, and visualise technology service roadmaps.

## Quick Start

```bash
npm install
npm run dev
```

Opens at `http://localhost:3000`

## Build for Production

```bash
npm run build
npm run preview   # test the production build locally
```

The `dist/` folder is ready for deployment to Azure Static Web Apps or any static host.

## Data Storage

Currently uses `localStorage` — data persists in the browser. For team sharing, export/import JSON via the UI buttons.

## Azure Deployment (Future)

Replace `localStorage` calls in `src/App.jsx` with API calls to your backend:
- Azure Static Web App + managed Functions API
- Entra ID for auth
- SharePoint List via Graph API or Cosmos DB for persistence
