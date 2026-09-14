# Best in Flights Booking — Engineering Documentation

| Field | Value |
|---|---|
| Project | `Best in Flights Booking` |
| Slug | `best-in-flights-booking` |
| Template version | v1.0 |
| Last updated | 2026-09-03 |
| Standards reference | `Org_Engineering_Document_Standards.pdf` v1.0 |
| Template type | **Project-filled** |

---

## What this is

This `docs/` folder is the **source of truth** for Best in Flights Booking. Update the matching doc when code changes.

---

## Placeholder convention

Throughout these templates, replace placeholders when starting a real project:

| Placeholder | Replace with | Example |
|---|---|---|
| `[PROJECT_NAME]` | Product / repo name | Best in Flights Booking |
| `[PROJECT_SLUG]` | kebab-case slug | best-in-flights-booking |
| `[DOMAIN]` | Business domain | Online flight booking |
| `[AUTHOR]` | Team or person | Engineering Team |
| `[DATE]` | ISO date | 2026-09-03 |
| `[DB_ENGINE]` | Database choice | MongoDB |
| `[API_STYLE]` | API type | REST |
| `[ROLE_N]` | User roles | ADMIN, USER |
| `[MODULE_N]` | Feature modules | auth, flights, bookings |
| `[ENTITY_N]` | Data entities | User, Booking |

**Do not ship templates with placeholders still in code.** Fill docs first, then scaffold.

---

## Document dependency chain

```text
01-requirements/requirement-understanding.md
        ↓
03-database/database-design-review.md  +  04-api/api-planning.md
        ↓
02-architecture/architecture-decisions.md  +  module-dependency-map.md
        ↓
05-project-structure/folder-structure-plan.md
        ↓
.cursorrules  →  project scaffold  →  feature development
```

---

## Documentation index

| # | Document | Path | Purpose |
|---|---|---|---|
| 1 | Requirement Understanding | [01-requirements/requirement-understanding.md](./01-requirements/requirement-understanding.md) | Product scope, roles, workflows, requirements |
| 2 | Architecture Decisions | [02-architecture/architecture-decisions.md](./02-architecture/architecture-decisions.md) | Stack, patterns, security, scalability |
| 3 | Module Dependency Map | [02-architecture/module-dependency-map.md](./02-architecture/module-dependency-map.md) | Module order, relationships, data flow |
| 4 | Database Design Review | [03-database/database-design-review.md](./03-database/database-design-review.md) | Schema, indexes, validation, migrations |
| 5 | API Planning | [04-api/api-planning.md](./04-api/api-planning.md) | Endpoints, auth, errors, response envelope |
| 6 | Folder Structure Plan | [05-project-structure/folder-structure-plan.md](./05-project-structure/folder-structure-plan.md) | Repo layout, naming, dependency rules |
| 7 | **Cursor Setup Prompt** | [SETUP-PROMPT.md](./SETUP-PROMPT.md) | **Copy-paste prompt to scaffold new projects** |

---

## How to use with Cursor (new project)

### Step 1 — Copy templates

Copy into your new project root:

```text
docs/                  # entire folder
.cursorrules           # AI enforcement template
Org_Engineering_Document_Standards.pdf   # optional org reference
```

### Step 2 — Prompt Cursor

Open [docs/SETUP-PROMPT.md](./SETUP-PROMPT.md) and copy the **Quick start** prompt into Cursor chat.

Or use this short version:

```text
@docs @.cursorrules

Bootstrap my project architecture per the docs.

Ask me ONLY for:
1. Project name
2. One-line description

Use all stack defaults from the docs (FSD frontend, Express modular monolith backend, MongoDB, Redux + TanStack Query + RHF, Tailwind + global.css, JWT + httpOnly refresh cookie).

Fill all docs → show architecture summary → wait for my "approved" → scaffold everything → verify build.
```

### Step 3 — Approve, then build

After you confirm architecture, Cursor scaffolds using filled docs + `.cursorrules`.

---

## Scale guide (what to fill)

| Project size | Fill depth | Skip |
|---|---|---|
| **SMALL** — bug fix, 1–3 days | Header, affected entities, key endpoints | Indexes, webhooks, migration history |
| **MEDIUM** — feature, 1–4 weeks | All core sections in every doc | Advanced scalability, versioning |
| **LARGE** — full product, 1+ month | Every section, complete and versioned | Nothing |

This project is filled at **MEDIUM** depth.

---

## Organisation standard mapping

| Org template (PDF) | This template path |
|---|---|
| PRD.md | `01-requirements/requirement-understanding.md` |
| SCHEMA.md | `03-database/database-design-review.md` |
| API_CONTRACTS.md | `04-api/api-planning.md` |
| ARCHITECTURE.md | `02-architecture/*` + `05-project-structure/*` |
| .cursorrules | Project root |

---

## Document update rule

When code changes in a real project, update the matching doc **before or with** the code:

| Code change | Update |
|---|---|
| New endpoint | `04-api/api-planning.md` |
| Schema field | `03-database/database-design-review.md` |
| New module | `module-dependency-map.md` + `folder-structure-plan.md` |
| New feature scope | `01-requirements/requirement-understanding.md` |

Documentation and implementation must never mismatch.

---

## Changelog

| Version | Date | Changes |
|---|---|---|
| v1.0 | 2026-07-07 | Initial global template kit |
| v1.1 | 2026-09-03 | Filled for Best in Flights Booking |
