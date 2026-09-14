# Best in Flights Booking — Database Design Review

| Field | Value |
|---|---|
| Project | `Best in Flights Booking` |
| Version | v1.0 |
| DB Engine | MongoDB |
| Last updated | 2026-09-03 |
| Author | Engineering Team |
| Status | **Approved** |
| Related docs | `docs/01-requirements/*`, `docs/04-api/api-planning.md` |

> All field names in this document are **canonical** across database, API responses, TypeScript types, and validation schemas.

---

## 1. Database selection

| Option considered | Verdict | Reason |
|---|---|---|
| MongoDB | **Selected** | Flexible schema for users, fare snapshots, bookings, and passengers; stack default |
| PostgreSQL | Rejected (v1) | Relational constraints not yet needed; can migrate later if required |

### Why MongoDB fits this project

- Document model suits nested passenger lists and fare offer snapshots on a booking.
- Fast iteration on schema during early product phases.
- Mongoose provides validation, indexes, and TypeScript integration.

---

## 2. Schema overview

### Collection inventory

| Domain | Collections |
|---|---|
| Identity | `users`, `refreshTokens` |
| Domain (v2) | `flightOffers`, `bookings`, `passengers`, `payments`, `pricealerts` |

**v1 implements:** `users`, `refreshTokens`.

---

## 3. Entity definitions

### Entity: `User`

**Collection:** `users`

**Purpose:** Platform user account with role-based access.

#### Fields

| Field name | Type | Required | Default | Notes / Constraints |
|---|---|---|---|---|
| `_id` | ObjectId | auto | auto | Primary key |
| `email` | String | Yes | — | Unique, lowercase, trimmed |
| `passwordHash` | String | Yes | — | bcrypt hash; `select: false` |
| `fullName` | String | No | — | Display name |
| `role` | String | Yes | `USER` | Enum: `USER`, `ADMIN` (v2 may add `AGENT`) |
| `isActive` | Boolean | No | true | Soft delete |
| `createdAt` | Date | auto | now | — |
| `updatedAt` | Date | auto | now | — |

#### Indexes

| Index on field(s) | Type | Reason |
|---|---|---|
| `email` | Unique | Login lookup; duplicate prevention |
| `role` + `isActive` | Compound | Admin user lists |

---

### Entity: `RefreshToken`

**Collection:** `refreshTokens`

**Purpose:** Stores hashed refresh tokens for session rotation and revocation.

#### Fields

| Field name | Type | Required | Default | Notes / Constraints |
|---|---|---|---|---|
| `_id` | ObjectId | auto | auto | Primary key |
| `userId` | ObjectId | Yes | — | Ref → `User` |
| `tokenHash` | String | Yes | — | SHA-256 hash of refresh token |
| `expiresAt` | Date | Yes | — | TTL index target |
| `createdAt` | Date | auto | now | — |

#### Indexes

| Index on field(s) | Type | Reason |
|---|---|---|
| `tokenHash` | Unique | Lookup on refresh |
| `userId` | Single | Revoke all sessions for user |
| `expiresAt` | TTL | Auto-cleanup expired tokens |

---

### Entity: `FlightOffer` (v2 — documented, not implemented)

**Collection:** `flightOffers`

**Purpose:** Short-lived snapshot of a realtime fare quote used to create a booking.

#### Fields

| Field name | Type | Required | Default | Notes / Constraints |
|---|---|---|---|---|
| `_id` | ObjectId | auto | auto | Primary key |
| `offerId` | String | Yes | — | Provider / aggregator offer id |
| `origin` | String | Yes | — | IATA code |
| `destination` | String | Yes | — | IATA code |
| `departureAt` | Date | Yes | — | — |
| `returnAt` | Date \| null | No | `null` | Round-trip only |
| `airlineCode` | String | Yes | — | IATA airline code |
| `cabinClass` | String | Yes | `ECONOMY` | `ECONOMY` \| `PREMIUM_ECONOMY` \| `BUSINESS` \| `FIRST` |
| `totalAmount` | Number | Yes | — | Minor-unit or decimal; currency in `currency` |
| `currency` | String | Yes | `INR` | ISO 4217 |
| `expiresAt` | Date | Yes | — | Quote validity |
| `createdAt` | Date | auto | now | — |

#### Indexes

| Index on field(s) | Type | Reason |
|---|---|---|
| `offerId` | Unique | Lookup at book time |
| `expiresAt` | TTL | Drop stale quotes |

---

### Entity: `Booking` (v2 — documented, not implemented)

**Collection:** `bookings`

**Purpose:** A traveler’s flight booking against a selected offer.

#### Fields

| Field name | Type | Required | Default | Notes / Constraints |
|---|---|---|---|---|
| `_id` | ObjectId | auto | auto | Primary key |
| `userId` | ObjectId | Yes | — | Ref → `User` (owner) |
| `offerId` | String | Yes | — | Snapshot of selected offer |
| `pnr` | String \| null | No | `null` | Airline / aggregator PNR |
| `status` | String | Yes | `PENDING` | `PENDING` \| `CONFIRMED` \| `CANCELLED` |
| `totalAmount` | Number | Yes | — | Locked at book time |
| `currency` | String | Yes | `INR` | ISO 4217 |
| `isActive` | Boolean | No | true | Soft delete |
| `createdAt` | Date | auto | now | — |
| `updatedAt` | Date | auto | now | — |

#### Indexes

| Index on field(s) | Type | Reason |
|---|---|---|
| `userId` + `createdAt` | Compound | My bookings list |
| `pnr` | Unique sparse | Lookup by ticket/PNR |
| `status` + `createdAt` | Compound | Admin inbox |

---

### Entity: `PriceAlert`

**Collection:** `pricealerts`

**Purpose:** Watch a search so we can email the traveller if the fare drops below the price they saw.

#### Fields

| Field name | Type | Required | Default | Notes / Constraints |
|---|---|---|---|---|
| `_id` | ObjectId | auto | auto | Primary key |
| `userId` | ObjectId | No | — | Set when signed in; guests omit this |
| `email` | String | Yes | — | Lowercase; never returned in API responses |
| `origin` | String | Yes | — | IATA |
| `destination` | String | Yes | — | IATA |
| `departureDate` | String | Yes | — | `YYYY-MM-DD` |
| `returnDate` | String | No | `""` | Empty for one-way |
| `flightMode` | String | Yes | — | `OneWay` \| `Return` |
| `currency` | String | Yes | `INR` | ISO 4217 |
| `currentPrice` | Number | Yes | — | Lowest fare when the alert was set |
| `isActive` | Boolean | No | true | Soft delete |
| `createdAt` | Date | auto | now | — |
| `updatedAt` | Date | auto | now | — |

#### Indexes

| Index on field(s) | Type | Reason |
|---|---|---|
| `email` + `origin` + `destination` + `departureDate` + `returnDate` + `flightMode` | Unique | One watch per traveller per search |

---

### Entity: `Passenger` (v2 — documented, not implemented)

**Collection:** `passengers`

**Purpose:** Traveler on a booking.

#### Fields

| Field name | Type | Required | Default | Notes / Constraints |
|---|---|---|---|---|
| `_id` | ObjectId | auto | auto | Primary key |
| `bookingId` | ObjectId | Yes | — | Ref → `Booking` |
| `fullName` | String | Yes | — | — |
| `dateOfBirth` | Date | Yes | — | — |
| `gender` | String | No | — | `MALE` \| `FEMALE` \| `OTHER` |
| `passengerType` | String | Yes | `ADULT` | `ADULT` \| `CHILD` \| `INFANT` |
| `createdAt` | Date | auto | now | — |
| `updatedAt` | Date | auto | now | — |

#### Indexes

| Index on field(s) | Type | Reason |
|---|---|---|
| `bookingId` | Single | Load passengers for a booking |

---

## 4. Enums and constants

### `UserRole`

Used by: `User.role`

| Value | Label (UI) | Description |
|---|---|---|
| `USER` | User | Default registered traveler |
| `ADMIN` | Admin | Platform operator; full access |

**v2 (documented):** `AGENT`

**Default:** `USER`

### `BookingStatus` (v2)

Used by: `Booking.status`

| Value | Label (UI) | Description |
|---|---|---|
| `PENDING` | Pending | Created, awaiting payment / confirmation |
| `CONFIRMED` | Confirmed | Ticketed |
| `CANCELLED` | Cancelled | Voided or refunded |

**Default:** `PENDING`

### Constants

| Constant | Value | Used by |
|---|---|---|
| `BCRYPT_ROUNDS` | `12` | auth service |
| `ACCESS_TOKEN_EXPIRY` | `15m` | JWT config |
| `REFRESH_TOKEN_EXPIRY` | `7d` | refresh cookie |

---

## 5. Relationships

```text
User ──── has many ────> RefreshTokens   (one-to-many)
User ──── has many ────> Bookings        (one-to-many, v2)
Booking ─ has many ────> Passengers      (one-to-many, v2)
Booking ─ has one  ────> Payment         (one-to-one, v2)
Booking ─ snapshots ───> FlightOffer     (offerId, v2)
```

### Population rules (API)

| Endpoint pattern | Field | Populated? | Depth |
|---|---|---|---|
| `GET /api/v1/auth/me` | — | No | — |
| `GET /api/v1/bookings/:id` (v2) | `passengers` | Yes | 1 |

### Cascade rules

| When this happens | Do this |
|---|---|
| User deactivated | Block login; retain bookings |
| Booking cancelled (v2) | Keep record; block passenger edits |
| Refresh token expired | TTL index removes document |
| Flight offer expired (v2) | TTL index removes quote; booking already stores snapshot |

---

## 6. Indexing strategy

| Collection | Fields | Type | Unique | Reason |
|---|---|---|---|---|
| `users` | `email` | Single | Yes | Login + uniqueness |
| `refreshTokens` | `tokenHash` | Single | Yes | Refresh lookup |
| `refreshTokens` | `expiresAt` | TTL | No | Auto-expire |
| `bookings` (v2) | `userId`, `createdAt` | Compound | No | My bookings |
| `flightOffers` (v2) | `expiresAt` | TTL | No | Drop stale quotes |

### Query performance notes

- Query: login by email → index on `users.email` → target `< 50ms`
- Query: refresh by token hash → index on `refreshTokens.tokenHash` → target `< 50ms`

---

## 7. Data validation rules

| # | Constraint | Enforced at | Error code |
|---|---|---|---|
| 1 | Email must be valid format | Zod (API) | `VALIDATION_ERROR` |
| 2 | Password min 8 characters | Zod (API) | `VALIDATION_ERROR` |
| 3 | Email unique | Service + DB index | `DUPLICATE_ENTRY` |
| 4 | Role must be `USER` or `ADMIN` (v1) | Zod + Mongoose enum | `VALIDATION_ERROR` |
| 5 | `passwordHash` never in API response | Mongoose `select: false` | — |

---

## 8. Optimization plan

| Area | Strategy | Timeline |
|---|---|---|
| User list (v2) | Compound index on `role`, `createdAt` | v2 |
| My bookings (v2) | Compound index on `userId`, `createdAt` | v2 |
| Fare quotes (v2) | Redis + TTL collection | v2 |

---

## 9. Migration strategy

### Org standard rules

- Migrations are **non-destructive** — add first, remove later.
- Scripts must be **idempotent**.
- Track schema version in `migrations` collection.
- Document rollback for every migration.

### Schema version history

| Version | Date | Changes | Script |
|---|---|---|---|
| v1.0 | 2026-09-03 | Initial schema: users, refreshTokens | — |

---

## Fill checklist

- [x] Every entity from requirements has a definition block
- [x] All enums centralized in this doc
- [x] Indexes cover hot query paths
- [x] Business constraints mapped to validation

---

## Changelog

| Version | Date | Author | Changes |
|---|---|---|---|
| v1.0 | 2026-09-03 | Engineering Team | Schema fill (v1 auth + v2 flight booking placeholders) |
