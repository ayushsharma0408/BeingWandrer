# Best in Flights Booking

A flight booking portal that shows realtime prices and lets users search and book flights.

v1 is the authenticated platform foundation (register, login, session refresh, profile). Flight search and booking land in v2.

## Stack

- Frontend: React + Vite + TypeScript + Feature-Sliced Design
- Backend: Node + Express + TypeScript modular monolith
- Database: MongoDB
- Auth: JWT access (memory) + httpOnly refresh cookie

## Setup

```bash
cp .env.example .env
# set DATABASE_URL and JWT_SECRET
npm install --legacy-peer-deps
npm run dev
```

- Web: http://localhost:5173
- API: http://localhost:4000/api/v1

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | shared-core watch + API + Vite |
| `npm run typecheck` | TypeScript across workspaces |
| `npm run build` | Production build |
| `npm test` | Backend auth endpoint tests |

## Configure

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | MongoDB connection string |
| `JWT_SECRET` | Access-token signing key (min 16 chars) |
| `FRONTEND_URL` | CORS origin (credentials enabled) |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Seeded `ADMIN` on first boot |

## What to build next

Domain modules from `docs/02-architecture/module-dependency-map.md` next: Travinus ticketing (when published) and `payments`.

Travinus credentials (`TRAVINUS_PARTNER_ID`, `TRAVINUS_CLIENT_ID`, `TRAVINUS_CLIENT_SECRET`) are server-only. Keep `TRAVINUS_USE_MOCK=true` in development so searches are not billed.
