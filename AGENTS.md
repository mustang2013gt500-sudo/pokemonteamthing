# Agent Development Guide

This file is for Codex, Copilot, and other AI-assisted development tools working in this repository.

## Project Summary

This is a full-stack Pokemon VGC team builder.

- Frontend: React 18 + Vite in `frontend/`
- Backend: Express + Node.js in `backend/`
- Local orchestration: Docker Compose in `docker-compose.yml`
- Data source: PokeAPI
- Persistence: browser `localStorage` only

## Preferred Local Runtime

Use Docker Compose as the default development environment:

```bash
docker compose up --build
```

Frontend:

```text
http://localhost:3000
```

Backend health check:

```text
http://localhost:5050/api/health
```

If Docker is unavailable, use:

```bash
npm run install:all
npm run dev:backend
npm run dev:frontend
```

The backend and frontend are separate npm projects. Run package commands with `--prefix backend` or `--prefix frontend`, or use the root helper scripts.

## Collaboration Rules

- Do not make feature changes directly on `main`.
- Create focused branches for work.
- Keep pull requests small enough to review.
- Do not overwrite another contributor's uncommitted changes.
- Do not commit `node_modules/`, `frontend/dist/`, `.env`, logs, or OS-specific files.
- Keep `backend/package-lock.json` and `frontend/package-lock.json` committed.
- If dependencies change, update the relevant lockfile and mention it in the change summary.

## Cross-Platform Rules

This repo is shared between macOS and Windows.

- Use LF line endings for source files. `.gitattributes` is configured for this.
- Avoid shell scripts that only work in Bash unless a Windows-friendly alternative is documented.
- Prefer npm scripts and Docker Compose commands.
- Avoid hardcoded absolute paths.

## Code Style

- Preserve the existing React component and CSS organization.
- Keep API calls relative to `/api` from the frontend unless the deployment model changes.
- Keep backend routes under `/api`.
- Keep comments short and useful.
- Prefer small, targeted changes over broad refactors.

## Verification

For frontend or backend behavior changes, verify at least:

```bash
npm run build --prefix frontend
```

For Docker or dependency changes, verify:

```bash
docker compose up --build
```

Then check:

```text
http://localhost:3000
http://localhost:5050/api/health
```

If a command cannot be run in the current environment, report that clearly in the final summary.

## Hosting Direction

The current app can be hosted as separate frontend/backend services, but the simplest future production path is likely:

1. Build the frontend with Vite.
2. Serve the static frontend from the Express backend.
3. Deploy one Node service.

Do not implement hosting changes unless requested.
