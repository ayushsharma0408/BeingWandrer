# Best in Flights Booking — Requirement Understanding

| Field | Value |
|---|---|
| Project | `Best in Flights Booking` |
| Slug | `best-in-flights-booking` |
| Version | v1.0 |
| Scale | MEDIUM |
| Last updated | 2026-09-03 |
| Author | Engineering Team |
| Status | **Approved** |
| Related docs | `docs/02-architecture/*`, `docs/03-database/*`, `docs/04-api/*` |

---

## 1. Product overview

| Field | Value |
|---|---|
| One-line description | A flight booking portal that shows realtime prices and lets users search and book flights, the same way other flight booking portals do. |
| Business domain | Online travel / B2C flight booking |
| Primary users | Travelers booking flights; platform admins who operate the portal |

### Problem

Travelers need a single place to compare live flight prices and complete a booking. Without a shared auth and API foundation, search, booking, and payments cannot be added safely.

### v1 goal

Ship a secure authenticated platform foundation (register, login, session refresh, profile) so flight search, booking, and payment modules can be added on a stable stack.

---

## 2. User roles

| Role | Who | Capabilities |
|---|---|---|
| `USER` | Registered traveler | Register, login; in v2 search flights, book, and view own bookings |
| `ADMIN` | Platform operator | Login; manage users; full access to all future modules |

**Default role on public register:** `USER`  
**Elevated roles:** seeded (`ADMIN` only).

### Future roles (v2 — documented placeholders)

| Role | Who | Capabilities |
|---|---|---|
| `AGENT` | Travel agent (optional) | Book on behalf of travelers; view assigned bookings |

`ADMIN` is treated as having all module permissions.

### Module permissions (v2)

| Permission | Typical UI / module |
|---|---|
| `FLIGHTS` | Realtime search and fare display |
| `BOOKINGS` | Create and manage bookings |
| `PASSENGERS` | Traveler profiles on a booking |
| `PAYMENTS` | Checkout and payment status |
| `USERS` | Admin user management |

---

## 3. Core modules

### Phase 1 — Foundation (v1)

| Module | Priority | Description |
|---|---|---|
| `auth` | P0 | Register, login, refresh, me, logout |

### Phase 2 — Domain (v2 — documented placeholders)

| Module | Priority | Description |
|---|---|---|
| `flights` | P0 | Realtime flight search and fare quotes (external GDS / aggregator later) |
| `bookings` | P0 | Create, view, and cancel flight bookings |
| `passengers` | P0 | Passenger details attached to a booking |
| `payments` | P1 | Checkout, payment status, and receipts |

### Phase 3 — Extensions (v3)

| Module | Priority | Description |
|---|---|---|
| `notifications` | P2 | Booking confirmation and status emails |
| `ancillaries` | P2 | Seats, baggage, meals |
| `admin-dashboard` | P2 | Ops overview of searches, bookings, and payments |

---

## 4. Key workflows (v1)

### Register → Session

1. Visitor submits **email + password** (optional display name).
2. Account is created as `USER` only. Client-supplied `role` is ignored.
3. Server returns access token + httpOnly refresh cookie; client routes by role.
4. Client keeps access token in memory; user in Redux.
5. Protected calls send `Authorization: Bearer`.
6. On `401 TOKEN_EXPIRED`, client refreshes via cookie and retries once.
7. Logout clears cookie, memory token, and Redux user.

**Account creation by role:**
- `USER` — public register only
- `ADMIN` — seeded by the platform

### Login

- Identifier is **email** + password.
- Role comes from the account (no role picker on the form).

### Future: Search → Book (v2)

1. Traveler (guest or logged-in `USER`) searches origin, destination, dates, and passenger count.
2. System returns realtime fares from the flights module.
3. Traveler selects an offer, enters passenger details, and pays.
4. System creates a `CONFIRMED` or `PENDING` booking owned by the logged-in user.
5. Traveler views own bookings; `ADMIN` sees all.

---

## 5. Functional requirements

| ID | Requirement | Priority | v1 |
|---|---|---|---|
| FR-01 | Users can register with email and password | Must | Yes |
| FR-02 | Users can log in and receive JWT + refresh cookie | Must | Yes |
| FR-03 | Users can refresh access token via httpOnly cookie | Must | Yes |
| FR-04 | Users can fetch current profile (`/auth/me`) | Must | Yes |
| FR-05 | Users can log out (revoke refresh session) | Must | Yes |
| FR-06 | Role-based access (`USER`, `ADMIN`) | Must | Yes |
| FR-07 | Realtime flight search and fare display | Must | No (v2) |
| FR-08 | Users can book a selected flight | Must | No (v2) |
| FR-09 | Users can view own bookings | Must | No (v2) |
| FR-10 | Passenger details captured on booking | Must | No (v2) |
| FR-11 | Payment checkout for a booking | Should | No (v2) |

---

## 6. Non-functional requirements

| ID | Requirement |
|---|---|
| NFR-01 | Access tokens never stored in localStorage/sessionStorage |
| NFR-02 | Passwords hashed with bcrypt (12 rounds); never returned in API |
| NFR-03 | All list endpoints paginated |
| NFR-04 | Standard API success/error envelope |
| NFR-05 | Structured logging (Pino); no PII/tokens in logs |
| NFR-06 | Bookings (v2) are scoped to the authenticated user unless `ADMIN` |
| NFR-07 | Flight prices (v2) must not be treated as durable without a quote/offer id |

---

## 7. Out of scope (v1)

- Flight search, fare display, and booking
- Passenger forms and PNR management
- Payments and refunds
- Email / SMS notifications
- Mobile apps
- Multi-airline GDS integration (Amadeus, Sabre, etc.)

---

## 8. Assumptions

- Single Best in Flights Booking organisation for v1–v2 (not a multi-tenant white-label marketplace).
- English UI copy for scaffold.
- MongoDB Atlas or local MongoDB for development.
- Realtime prices in v2 will come from an external flight API; v1 does not call that API.
- Default stack: React + Vite + FSD frontend; Express modular monolith; MongoDB; JWT access (memory) + httpOnly refresh cookie.

---

## Fill checklist

- [x] Product name and description captured
- [x] Roles defined
- [x] v1 vs future modules separated
- [x] Workflows sketched

---

## Changelog

| Version | Date | Author | Changes |
|---|---|---|---|
| v1.0 | 2026-09-03 | Engineering Team | Initial fill from product brief + stack defaults |
