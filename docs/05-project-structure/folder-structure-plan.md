# Best in Flights Booking — Project Folder Structure Plan

| Field | Value |
|---|---|
| Project | `Best in Flights Booking` |
| Version | v1.0 |
| Last updated | 2026-09-03 |
| Status | **Approved** |

---

## 1. Root structure

```text
best-in-flights-booking/
├── docs/
├── backend/
├── frontend/
├── shared-core/          # shared TypeScript types (API envelope, auth)
├── .cursorrules
├── .env.example
├── .env                  # local only (gitignored)
├── package.json          # npm workspaces root
└── README.md
```

---

## 2. Backend (modular monolith)

```text
backend/src/
├── server.ts
├── app.ts
├── config/
│   ├── env.ts            # Zod-validated env
│   ├── database.ts
│   └── load-env.ts       # loads root .env
├── modules/
│   └── auth/
│       ├── auth.model.ts
│       ├── auth.service.ts
│       ├── auth.controller.ts
│       ├── auth.routes.ts
│       └── auth.validation.ts
└── shared/
    ├── middleware/       # authenticate, roleGuard, validate, errorHandler
    ├── cookies/          # refresh token cookie helpers
    ├── logger/
    ├── errors/
    └── constants/
```

Flow: `routes → authenticate → roleGuard → validate → controller → service → model`

v2 adds `modules/flights`, `modules/bookings`, `modules/passengers`, `modules/payments`.

---

## 3. Frontend (FSD + Redux)

```text
frontend/src/
├── app/
│   ├── main.tsx
│   ├── App.tsx           # Redux Provider + QueryClient + Router
│   ├── store/            # configureStore (combines entity reducers)
│   ├── providers/        # router
│   └── styles/
│       ├── index.css     # Tailwind entry + @theme mapping
│       └── global.css    # ★ design tokens + component classes
├── pages/
│   ├── home/
│   └── login/
├── widgets/
│   └── app-layout/
├── features/
│   ├── auth/             # session restore, role guards, logout
│   ├── login/
│   └── register/
├── entities/
│   └── user/
└── shared/
    ├── api/              # apiClient (all HTTP)
    ├── auth/             # in-memory access token store
    ├── store/            # useAppDispatch, useAppSelector, RootState
    ├── kernel/           # eventBus
    ├── lib/              # cn() utility
    └── ui/               # Button, Input (use global.css classes)
```

Import order: `app → pages → widgets → features → entities → shared`

v2 pages: search, results, booking, my-bookings. v2 entities: booking, flight-offer.

---

## 4. Naming

| Item | Convention |
|---|---|
| Folders | kebab-case |
| Components | PascalCase.tsx |
| Redux slices | `[entity]-slice.ts` |
| Hooks | useCamelCase.ts |
| Constants | SCREAMING_SNAKE |
| CSS tokens | `--app-[category]-[name]` |

---

## 5. Dependency rules

### Backend
- Modules call other modules via **service layer only**
- Controllers never access DB directly

### Frontend
- No feature-to-feature imports
- Import from slice `index.ts` barrels only
- Redux slices live in `entities/`; store wiring in `app/store/`
- All visual design changes go through `app/styles/global.css`
- Server state → TanStack Query; client state → Redux; forms → React Hook Form

---

## Changelog

| Version | Date | Changes |
|---|---|---|
| v1.0 | 2026-09-03 | Initial fill for Best in Flights Booking |
