# Pokemon VGC Team Builder

A full-stack web application for building and analyzing Pokemon VGC (Video Game Championships) competitive teams.

## Features

- Search and pick Pokemon from the National Dex
- Build teams of up to 6 Pokemon with abilities, natures, items, and moves
- Analyze offensive and defensive type coverage
- Validate teams against configurable VGC rules
- Save and load teams locally in the browser
- Export teams as text for sharing

## Project Structure

```text
pokemonteamthing/
├── backend/             # Node.js + Express API server
│   ├── src/
│   ├── Dockerfile
│   ├── package.json
│   └── package-lock.json
├── frontend/            # React + Vite web app
│   ├── src/
│   ├── Dockerfile
│   ├── package.json
│   └── package-lock.json
├── docker-compose.yml   # Cross-platform local dev environment
├── package.json         # Root helper scripts
├── AGENTS.md            # Guidance for Codex, Copilot, and other AI agents
└── README.md
```

## Recommended Local Setup

The easiest way for Mac and Windows contributors to run the same environment is Docker Compose. Docker keeps the Node.js version and dependency install behavior consistent across machines.

### Mac Setup

1. Install Docker Desktop for Mac:
   - https://www.docker.com/products/docker-desktop/
2. Start Docker Desktop.
3. Clone the repository:

```bash
git clone https://github.com/mustang2013gt500-sudo/pokemonteamthing.git
cd pokemonteamthing
```

4. Start the app:

```bash
docker compose up --build
```

5. Open the frontend:

```text
http://localhost:3000
```

The backend API runs at:

```text
http://localhost:5050/api/health
```

### Windows Setup

1. Install Docker Desktop for Windows:
   - https://www.docker.com/products/docker-desktop/
2. During installation, enable WSL 2 if Docker asks for it.
3. Start Docker Desktop.
4. Clone the repository using Git Bash, PowerShell, Windows Terminal, or VS Code:

```bash
git clone https://github.com/mustang2013gt500-sudo/pokemonteamthing.git
cd pokemonteamthing
```

5. Start the app:

```bash
docker compose up --build
```

6. Open the frontend:

```text
http://localhost:3000
```

The backend API runs at:

```text
http://localhost:5050/api/health
```

### Daily Docker Commands

Start the app:

```bash
docker compose up
```

Rebuild containers after dependency or Dockerfile changes:

```bash
docker compose up --build
```

Stop the app:

```bash
docker compose down
```

Run with npm helper scripts:

```bash
npm run dev:docker
npm run dev:docker:build
npm run dev:docker:down
```

## Non-Docker Setup

Use this only if you specifically want to run Node directly on your machine.

### Prerequisites

- Node.js 20 LTS recommended
- npm

Install dependencies:

```bash
npm run install:all
```

Start the backend in one terminal:

```bash
npm run dev:backend
```

Start the frontend in another terminal:

```bash
npm run dev:frontend
```

Open:

```text
http://localhost:3000
```

## Development Workflow

Do not work directly on `main` for feature work. Use branches so two people can work without overwriting each other.

Update your local `main`:

```bash
git checkout main
git pull origin main
```

Create a branch:

```bash
git checkout -b your-name/short-feature-name
```

Commit your work:

```bash
git status
git add .
git commit -m "Describe the change"
```

Push your branch:

```bash
git push -u origin your-name/short-feature-name
```

Then open a pull request on GitHub and review it before merging into `main`.

## Dependency Rules

- Commit `backend/package-lock.json` and `frontend/package-lock.json`.
- Do not commit `node_modules/`.
- If dependencies change, rebuild Docker:

```bash
docker compose up --build
```

- If Docker dependency state gets weird, reset containers and volumes:

```bash
docker compose down --volumes
docker compose up --build
```

## Environment Variables

Backend defaults:

```text
PORT=5050
POKEAPI_BASE_URL=https://pokeapi.co/api/v2
```

Example files:

- `backend/.env.example`
- `frontend/.env.example`

The current frontend calls `/api`, and Vite proxies that path to the backend during development.

## API Endpoints

### Pokemon

- `GET /api/pokemon?q=pikachu` - Search Pokemon
- `GET /api/pokemon/:idOrName` - Get Pokemon details

### Moves

- `GET /api/moves/:idOrName` - Get move details

### Teams

- `POST /api/teams/validate` - Validate team against VGC rules
- `POST /api/teams/analyze` - Analyze team type coverage

## Tech Stack

### Backend

- Node.js
- Express
- Axios
- node-cache
- CORS

### Frontend

- React 18
- Vite
- React Router
- CSS

### Data Source

- PokeAPI v2: https://pokeapi.co

## Hosting Notes

The current app can be hosted in two common ways:

1. Keep frontend and backend separate:
   - Host frontend on Vercel, Netlify, or Cloudflare Pages.
   - Host backend on Render, Railway, Fly.io, or a similar Node host.
2. Build the frontend and serve it from the Express backend:
   - This creates one deployable Node service.
   - This is usually the simplest next hosting step for this app.

The app does not currently need a database. Saved teams are stored in each browser's `localStorage`, so they do not sync between computers yet.

## Troubleshooting

### Port Already In Use

If `3000` or `5050` is already in use, stop the other app or change the ports in `docker-compose.yml` and `frontend/vite.config.js`.

### Frontend Cannot Reach Backend

Check that the backend is healthy:

```text
http://localhost:5050/api/health
```

Then restart Docker:

```bash
docker compose down
docker compose up --build
```

### PokeAPI Is Slow

PokeAPI can be slow or rate-limited. The backend caches PokeAPI responses in memory for 24 hours while the backend container is running.

## AI-Assisted Development

This project includes `AGENTS.md` for Codex, Copilot, and other AI coding assistants. Agents should read that file before making changes.

In short:

- Work on a branch, not directly on `main`.
- Prefer Docker Compose for local verification.
- Keep dependency lockfiles committed.
- Avoid committing generated folders such as `node_modules/` and `frontend/dist/`.
- Update this README when setup steps change.
