# Cursor Setup Prompt — Copy & Paste for New Projects

Use this in any new repo after copying `docs/`, `.cursorrules`, and `.env.example`.

---

## Quick start (recommended)

Copy the block below into Cursor chat. Replace nothing — Cursor will ask you questions.

```text
@docs/README.md @docs/01-requirements/requirement-understanding.md @docs/02-architecture/architecture-decisions.md @docs/02-architecture/module-dependency-map.md @docs/03-database/database-design-review.md @docs/04-api/api-planning.md @docs/05-project-structure/folder-structure-plan.md @.cursorrules

You are bootstrapping a new project using my global architecture templates.

## Your job
Scaffold the full monorepo architecture exactly as documented — do NOT invent a different stack or folder layout.

## Step 1 — Ask me (use a form, one message)
Ask ONLY these questions before writing any code:

1. **Project name** (e.g. Acme CRM)
2. **One-line description** — what does the product do?
3. **Business domain** (e.g. B2B sales, healthcare, e-commerce)
4. **User roles** for v1 (default: ADMIN, USER — confirm or change)
5. **Core modules** for v1 besides auth (e.g. orders, products — or "auth only for now")
6. **Database** — MongoDB or PostgreSQL? (default: MongoDB)
7. **Project scale** — SMALL / MEDIUM / LARGE (default: MEDIUM)

If I say "use defaults", apply:
- Roles: ADMIN, USER
- Database: MongoDB
- Scale: MEDIUM
- Modules: auth only (expand docs with placeholders for future modules)

## Step 2 — Fill docs (no code yet)
Using my answers, replace ALL placeholders in every file under `docs/` and update `.cursorrules` header with project name.

Present a short **Architecture Summary** table covering:
- Stack (frontend, backend, DB, auth, state, styling)
- Folder structure overview
- v1 modules list
- Auth flow (JWT memory + httpOnly refresh cookie)

Wait for my explicit **"approved"** before Step 3.

## Step 3 — Scaffold monorepo (after approval only)
Create the full project per `docs/05-project-structure/folder-structure-plan.md` and `.cursorrules`:

### Root
- `package.json` — npm workspaces: `backend`, `frontend`, `shared-core`
- Scripts: `dev`, `build`, `typecheck`
- `.env.example` filled for this project

### shared-core/
- Shared TypeScript types: API envelope, auth types, pagination

### backend/ (Express + TypeScript modular monolith)
- Flow: `routes → authenticate → roleGuard → validate → controller → service → model`
- `modules/auth/` — register, login, refresh, me, logout
- `shared/middleware/` — authenticate, roleGuard, validate, errorHandler
- `shared/cookies/` — httpOnly refresh token cookie
- `shared/logger/` — Pino
- `config/env.ts` — Zod env validation; load root `.env`
- Standard API envelope on every response

### frontend/ (React + Vite + TypeScript + FSD)
- Layers: `app → pages → widgets → features → entities → shared`
- **Redux Toolkit** — client/UI state (entity slices in `entities/*/model/*-slice.ts`)
- **TanStack Query** — server/API state
- **React Hook Form + Zod** — forms
- **Tailwind CSS v4** + **`app/styles/global.css`** — single design system file (tokens + `.btn`, `.card`, `.field` classes)
- `shared/api/apiClient` — all HTTP; auto-refresh on 401
- `shared/auth/token-store` — access token in memory only (never localStorage)
- `shared/store/` — `useAppDispatch`, `useAppSelector`
- `app/store/` — configureStore
- Auth feature: login page + form
- App layout widget + home page

### Rules (must follow)
- Import from slice `index.ts` barrels only
- No feature-to-feature imports; use eventBus for cross-feature events
- Never put server state in Redux or form state in Redux
- Never store access tokens in localStorage/sessionStorage
- All design changes via `app/styles/global.css`
- Module logger on backend — no console.log in committed code
- At least one happy-path test per auth endpoint

## Step 4 — Verify
Run `npm install`, `npm run typecheck`, and `npm run build`. Fix any errors.

## Step 5 — Handoff
Give me:
- Tree of what was created
- How to run (`cp .env.example .env`, `npm run dev`)
- What to configure (DATABASE_URL, JWT_SECRET)
- What to build next (domain modules from my answers)
```

---

## Even faster (project name only)

If you only want to give a name and use all defaults:

```text
@docs @.cursorrules

Bootstrap my project architecture per the docs.

Ask me ONLY for:
1. Project name
2. One-line description

Use all stack defaults from the docs (FSD frontend, Express modular monolith backend, MongoDB, Redux + TanStack Query + RHF, Tailwind + global.css, JWT + httpOnly refresh cookie).

Fill all docs → show architecture summary → wait for my "approved" → scaffold everything → verify build.
```

---

## After scaffold — build a new module

```text
@docs/03-database @docs/04-api @docs/05-project-structure @.cursorrules

Build the [MODULE_NAME] module following the documented architecture.

Update docs first, then implement backend module + frontend FSD slice. Match api-planning.md exactly.
```

---

## Checklist before pasting prompt

- [ ] Copied `docs/` folder to new project root
- [ ] Copied `.cursorrules` to new project root
- [ ] Copied `.env.example` to new project root
- [ ] Opened project in Cursor
- [ ] Pasted prompt above
- [ ] Answered questions
- [ ] Said **"approved"** after reviewing architecture summary

---

## What you get every time

```text
your-project/
├── docs/                    # filled for your project
├── .cursorrules
├── .env.example
├── package.json             # workspaces root
├── shared-core/             # shared types
├── backend/                 # Express modular monolith
│   └── src/modules/auth/
└── frontend/                # FSD + Redux + global.css
    └── src/
        ├── app/store/
        ├── app/styles/global.css
        ├── entities/user/
        ├── features/login/
        └── shared/
```

---

## Changelog

| Version | Date | Changes |
|---|---|---|
| v1.0 | 2026-07-07 | Initial reusable setup prompt |
