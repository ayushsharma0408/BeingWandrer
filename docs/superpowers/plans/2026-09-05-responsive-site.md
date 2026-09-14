# Full-site responsive Implementation Plan

> **For agentic workers:** Implement task-by-task. Steps use checkbox syntax.

**Goal:** Make Best in Flights Booking usable on phone, tablet, and desktop without horizontal overflow.

**Architecture:** Extend existing `global.css` media queries; add a mobile filter toggle on FlightsPage.

**Tech Stack:** React + Vite, CSS design system in `global.css`

## Global Constraints

- Prefer CSS over new dependencies
- Import from slice `index.ts` only
- Preserve existing class names and brand look
- npm with `--legacy-peer-deps` if installing (none expected)

## Files

- `frontend/src/app/styles/global.css` — responsive rules
- `frontend/src/pages/flights/FlightsPage.tsx` — filter open state + toggle
- `frontend/src/features/search-flights/ui/FlightFilters/FilterSidebar.tsx` — optional close callback / class hooks

---

### Task 1: Mobile filter sheet structure

- [x] Add `filtersOpen` state and Filters button on FlightsPage (≤960 via CSS)
- [x] Backdrop + close on FilterSidebar when open on mobile
- [x] CSS: hide sidebar by default on small screens; show as sheet when `.is-open`

### Task 2: Consolidate responsive CSS

- [x] Extend media blocks for wrap padding, hero type, search, offers, checkout, auth, modals, tickets, bookings, footer
- [x] Ensure ≤480px: full-width primary actions, modal safe width, no overflow

### Task 3: Verify

- [x] Typecheck passes (`tsc --noEmit`)
