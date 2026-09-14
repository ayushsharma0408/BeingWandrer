# Best in Flights Booking — API Planning Document

| Field | Value |
|---|---|
| Project | `Best in Flights Booking` |
| Version | v1.0 |
| Base URL | `/api/v1` |
| Auth method | Bearer JWT (access) + httpOnly refresh cookie |
| Content-Type | `application/json` |
| Last updated | 2026-09-03 |
| Author | Engineering Team |
| Status | **Approved** |
| Related docs | `docs/03-database/*`, `docs/02-architecture/*` |

---

## 1. API architecture

| Decision | Choice | Reason |
|---|---|---|
| API style | REST | Standard CRUD; org envelope; tooling support |
| Versioning | URL prefix `/api/v1` | Explicit, cache-friendly |
| Content type | `application/json` | Standard |

### URL naming conventions

- Resources: **plural nouns** — `/api/v1/users`
- Sub-resources: `/api/v1/bookings/:id/passengers`
- Actions (non-CRUD): `/api/v1/auth/login`
- Lowercase, **kebab-case** for multi-word segments

### HTTP methods

| Operation | Method | URL pattern |
|---|---|---|
| List | GET | `/api/v1/{resource}` |
| Get one | GET | `/api/v1/{resource}/:id` |
| Create | POST | `/api/v1/{resource}` |
| Full update | PUT | `/api/v1/{resource}/:id` |
| Partial update | PATCH | `/api/v1/{resource}/:id` |
| Delete | DELETE | `/api/v1/{resource}/:id` |

---

## 2. Request and response format

### Standard success response

```json
{
  "success": true,
  "message": "",
  "data": {}
}
```

- `data` — single object or array.
- `message` — human-readable summary (recommended on mutations).
- `meta` — **paginated lists only**:

```json
{
  "success": true,
  "message": "",
  "data": [],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 0,
    "totalPages": 0
  }
}
```

### Standard error response

```json
{
  "success": false,
  "message": "Human readable summary",
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable detail",
    "field": "fieldName"
  }
}
```

`field` is present on validation errors only.

### Pagination

Query: `?page=1&limit=20&sort=createdAt&order=desc`

| Param | Default | Max |
|---|---|---|
| `page` | 1 | — |
| `limit` | 20 | 100 |
| `sort` | `createdAt` | — |
| `order` | `desc` | `asc` \| `desc` |

### Filtering

- Field filters: `?[field]=[value]`
- Date range: `?from=[ISO]&to=[ISO]`
- Search: `?q=[term]` (where supported)

---

## 3. Authentication flow

### JWT access + httpOnly refresh cookie

```http
POST /api/v1/auth/login
Content-Type: application/json

{ "email": "user@example.com", "password": "********" }
```

**Response 200:**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { "id": "", "email": "", "fullName": "", "role": "USER" },
    "token": ""
  }
}
```

**Set-Cookie:** `refreshToken` — httpOnly, SameSite=Lax, path `/api/v1/auth`

**Client behaviour:**
- Store `data.token` in memory only (`shared/auth/token-store`)
- Dispatch `setUser(data.user)` to Redux (`entities/user` slice)
- Send `Authorization: Bearer <token>` on protected requests
- Include `credentials: 'include'` for cookie-based refresh

### Token refresh

```http
POST /api/v1/auth/refresh
Cookie: refreshToken=<httpOnly-cookie>
```

**Response 200:**

```json
{
  "success": true,
  "message": "Token refreshed",
  "data": {
    "token": ""
  }
}
```

`apiClient` retries the original request once after a successful refresh on `401 TOKEN_EXPIRED`.

### Register

```http
POST /api/v1/auth/register
Content-Type: application/json

{ "email": "user@example.com", "password": "********", "fullName": "Jane Doe" }
```

**Response 201:** Same shape as login (`user` + `token` + refresh cookie). Role is always `USER`. Client-supplied `role` is ignored.

### Current user

```http
GET /api/v1/auth/me
Authorization: Bearer <access-token>
```

**Response 200:**

```json
{
  "success": true,
  "message": "",
  "data": {
    "user": {
      "id": "",
      "email": "",
      "fullName": "",
      "role": "USER"
    }
  }
}
```

### Logout

```http
POST /api/v1/auth/logout
Authorization: Bearer <access-token>
```

Clears refresh cookie. Client clears memory token and Redux user state.

---

## 4. Authorization rules

### Middleware chain

```text
authenticate → roleGuard([roles]) → validate → controller
```

### Permission matrix

| Endpoint group | Public | `USER` | `ADMIN` |
|---|---|---|---|
| Auth (register, login, refresh) | ✓ | ✓ | ✓ |
| Auth (me, logout) | — | ✓ | ✓ |
| Flights search (v2) | ✓ | ✓ | ✓ |
| Bookings create / own list (v2) | — | Own | All |
| Bookings cancel (v2) | — | Own | All |
| Payments (v2) | — | Own | All |

### Scoping rules

- `USER` manages own profile; in v2 sees own bookings only.
- `ADMIN` has platform-wide access.
- Never trust client-provided `role` or `userId` — use verified JWT.

---

## 5. Endpoint planning

### Module: `Health` — `/health` (outside `/api/v1`)

Liveness check for local/prod probes. No auth.

| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `/health` | No | `{ status: "ok", uptimeSec, mongo }` — `mongo` is whether MongoDB is connected |

---

### Module: `Auth` — `/api/v1/auth` (v1)

| Method | Path | Auth | Notes |
|---|---|---|---|
| POST | `/register` | No | `{ email, password, fullName? }` — creates `USER` only; client `role` ignored |
| POST | `/login` | No | `{ email, password }` |
| POST | `/refresh` | Cookie | Rotates access token |
| GET | `/me` | Bearer | Current profile |
| POST | `/logout` | Bearer | Clears refresh cookie |

---

### Module: `Flights` — `/api/v1/flights`

Proxy to Travinus Partner Flight Search API v2. Credentials stay server-side (`ClientId` / `ClientSecret` headers, `PartnerId` query). Dates are accepted as `YYYY-MM-DD` and converted to Travinus `ddMMyy`.

| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `/flights/search` | No | Query: `origin`, `destination`, `departureDate`, `returnDate?`, `adults`, `children`, `infants`, `travelClass`, `flightMode`, `currency`, `page`, `limit` |
| GET | `/flights/offers/:offerId` | No | Cached quote from the last search (TTL ~20 min) |

### Module: `Bookings` — `/api/v1/bookings`

Creates a `PENDING` booking from a cached Travinus offer. Travinus has not published a partner book endpoint on [developer.travinus.com](https://developer.travinus.com/); ticketing will attach when that API is issued.

| Method | Path | Auth | Notes |
|---|---|---|---|
| POST | `/bookings` | Optional | Guest or signed-in. Body: `{ offerId, passengers[], contact, extras?, card }`. `card` is `{ brand, holderName, number, expDate, cvv }`. Creates a `PENDING` hold with a local PNR. The API stores only `{ method, brand, last4, holderName, expMonth, expYear }` — never PAN or CVV. |
| GET | `/bookings` | Bearer (`USER` own, `ADMIN` all) | Paginated. Guest holds are not listed until the traveller signs in with the same account used at checkout. |
| GET | `/bookings/:id` | Bearer | Own or ADMIN |
| PATCH | `/bookings/:id` | Bearer | Cancel own or ADMIN |

### Module: `Price alerts` — `/api/v1/price-alerts`

Stores a watch on a search so the traveller can be emailed if the fare drops below the price they saw.

| Method | Path | Auth | Notes |
|---|---|---|---|
| POST | `/price-alerts` | Optional | Guest or signed-in. Body: `{ email, origin, destination, departureDate, returnDate?, flightMode, currency, currentPrice }`. Upserts the same route + email. Does not echo the email address. |

---

### Module: `Payments` — `/api/v1/payments` (v2 — documented, not implemented)

| Method | Path | Auth | Notes |
|---|---|---|---|
| POST | `/payments` | Bearer | Initiate checkout for a booking |
| GET | `/payments/:id` | Bearer | Own or ADMIN |

---

## 6. Error handling strategy

### Standard error codes

| HTTP | Code | When |
|---|---|---|
| 400 | `BAD_REQUEST` | Malformed JSON |
| 401 | `UNAUTHORIZED` | Missing auth |
| 401 | `INVALID_CREDENTIALS` | Wrong login |
| 401 | `INVALID_TOKEN` | Bad JWT |
| 401 | `TOKEN_EXPIRED` | Expired JWT |
| 403 | `FORBIDDEN` | Insufficient role |
| 404 | `RESOURCE_NOT_FOUND` | ID not found |
| 409 | `DUPLICATE_ENTRY` | Unique violation |
| 422 | `VALIDATION_ERROR` | Schema failed |
| 429 | `RATE_LIMIT_EXCEEDED` | Too many requests |
| 500 | `INTERNAL_SERVER_ERROR` | Unhandled error |

### Global handler behaviour

1. Map domain errors to standard envelope.
2. Never expose stack traces in production.
3. Log with module + userId — never log PII/tokens.

---

## 7. Webhooks (if applicable)

Not applicable for v1.

v2: payment provider webhooks for confirmation / failure.

---

## Fill checklist

- [x] Every v1 module has endpoint blocks
- [x] Permission matrix matches requirements roles
- [x] Response envelope matches org standard
- [x] Custom error codes listed

---

## Changelog

| Version | Date | Author | Changes |
|---|---|---|---|
| v1.0 | 2026-09-03 | Engineering Team | API fill (v1 auth + v2 flight booking placeholders) |
