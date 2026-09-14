# Full-site responsive design

**Approach:** CSS-first in `frontend/src/app/styles/global.css`, with minimal TSX for patterns CSS cannot express (mobile filter sheet).

**Breakpoints:** 1100 / 960 / 720 / 640 / 480 px (max-width).

**Goals:**
- No horizontal scroll on phone/tablet
- Header drawer + prefs already at ≤960; keep working
- Flights: filters as collapsible sheet ≤960; offer/sort/search stack cleanly
- Checkout, auth, bookings, tickets, home, footer: single-column and readable type/spacing
- Preserve existing Traveluro-style visual language and class names

**Out of scope:** Tailwind rewrite, new layout primitive library, visual redesign.
