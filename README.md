# Pokémon VGC Team Builder

A full-stack web application for building and analyzing Pokémon VGC (Video Game Championships) competitive teams.

## Features

- 🔍 **Search & Pick Pokémon** - Find any Pokémon from the National Dex
- ⚔️ **Team Building** - Construct a team of 6 Pokémon with abilities, natures, items, and moves
- 📊 **Type Coverage Analysis** - View offensive and defensive type coverage for your team
- ✅ **VGC Rule Validation** - Automatic validation against current VGC rules (restricted species, banned Pokémon, etc.)
- 💾 **Team Persistence** - Save and load multiple teams locally
- 📤 **Export Teams** - Export teams as text format for sharing

## Project Structure

```
pokemonteamthing/
├── backend/           # Node.js + Express API server
│   ├── src/
│   │   ├── index.js  # Main server entry
│   │   ├── routes/   # API routes
│   │   ├── services/ # Business logic
│   │   └── config/   # Configuration
│   └── package.json
├── frontend/          # React + Vite web app
│   ├── src/
│   │   ├── pages/    # Page components
│   │   ├── components/ # UI components
│   │   ├── hooks/    # Custom React hooks
│   │   ├── services/ # API client
│   │   └── utils/    # Utilities
│   └── package.json
└── README.md
```

## Quick Start

### Prerequisites
- Node.js 16+ 
- npm or yarn

### 1. Install Backend Dependencies
```bash
cd backend
npm install
```

### 2. Start Backend Server
```bash
npm run dev
```
Backend will run on `http://localhost:5000`

### 3. Install Frontend Dependencies (in a new terminal)
```bash
cd frontend
npm install
```

### 4. Start Frontend Dev Server
```bash
npm run dev
```
Frontend will run on `http://localhost:3000`

### 5. Open in Browser
Navigate to `http://localhost:3000`

## API Endpoints

### Pokémon
- `GET /api/pokemon?q=pikachu` - Search Pokémon
- `GET /api/pokemon/:idOrName` - Get Pokémon details

### Moves
- `GET /api/moves/:idOrName` - Get move details

### Teams
- `POST /api/teams/validate` - Validate team against VGC rules
- `POST /api/teams/analyze` - Analyze team type coverage

## Tech Stack

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **Axios** - HTTP client for PokéAPI
- **node-cache** - In-memory caching
- **CORS** - Cross-origin resource sharing

### Frontend
- **React 18** - UI library
- **Vite** - Build tool & dev server
- **React Router** - Client-side routing
- **CSS3** - Styling

### Data Source
- **PokéAPI v2** - Free Pokémon data API (https://pokeapi.co)

## Features Breakdown

### Core Features (MVP)
1. ✅ Search and select 6 Pokémon
2. ✅ Assign 4 moves per Pokémon
3. ✅ Choose abilities, natures, held items
4. ✅ Calculate offensive type coverage
5. ✅ Calculate defensive weaknesses & resistances
6. ✅ VGC rule validation
7. ✅ Save/load teams locally
8. ✅ Export teams as text

### Future Enhancements
- Damage calculator with stat simulation
- Cloud storage & account sync
- Team sharing & public repository
- Battle simulator
- Rental code generation
- Import from Pokémon Showdown format
- EV/IV calculator

## VGC Rules Implemented

- **Team Size**: Max 6 Pokémon
- **Restricted Species Limit**: Max 2 per team
- **Species Duplication**: Each species max 1 per team
- **Move Legality**: Each Pokémon can only use moves it can learn
- **Item Uniqueness**: Each held item can only be used once
- **Banned Species**: Mythical Pokémon and event-exclusives are blocked

Rules are configurable in `backend/src/config/vgc-rules.json`

## Type Coverage Explanation

### Offensive Coverage
Shows what types your team's moves are super-effective against. If you hit many different types, your team has good offensive coverage.

### Defensive Coverage  
Shows what types hit your team hard (weaknesses) and what types your team resists. Good defensive synergy means team members cover each other's weaknesses.

## Performance Notes

- PokéAPI data is cached for 24 hours to minimize API calls
- Type effectiveness uses a hard-coded lookup table (no API calls)
- Teams are stored in browser localStorage (no backend database required for MVP)

## Troubleshooting

**Backend won't start?**
- Make sure port 5000 is not in use
- Check Node.js version: `node --version` (should be 16+)

**Frontend won't connect to backend?**
- Ensure backend is running on port 5000
- Check browser console for CORS errors
- Vite proxy is configured in `vite.config.js`

**PokéAPI is slow?**
- PokéAPI can have rate limiting - be patient or try again later
- Cache should help on subsequent requests

## License

MIT

## Contributing

Contributions welcome! Please fork and submit a pull request.

---

Built with ⚡ for competitive Pokémon players
