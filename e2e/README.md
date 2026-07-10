# E2E tests (Playwright) — local only

These are **not run in CI**. They exercise the real FE + BE + local Supabase
together, which is slower and needs more running infrastructure than a CI job
should depend on for every PR. Run them locally before a release, or whenever
you touch checkout, cart, or auth.

## Prerequisites

Three things must be running first:

1. Local Supabase Docker: `cd Aurevo.BE && pnpm db:start`
2. Backend: `cd Aurevo.BE && pnpm dev` (port 5000)
3. Frontend: `cd Aurevo.UI && pnpm dev` (port 5173)

## Running

```bash
cd Aurevo.UI
pnpm test:e2e            # headless
pnpm test:e2e:ui         # Playwright's interactive UI mode — best for debugging
pnpm test:e2e:headed     # watch the real browser
```

## What's covered

- `guest-checkout.spec.ts` — browse → add to cart → guest checkout → order confirmation (the money path, no login required)
- `checkout-saved-address.spec.ts` — login → saved address autofills the checkout form → shipping zone derives correctly
- `cart.spec.ts` — add/update/remove quantities → cart totals reconcile

These specs were picked because they're the flows a UI regression would
directly cost an order or a user's data — not because every page needs E2E
coverage. Business logic (validation, stock math, auth rules) is already
covered by the BE integration tests and FE unit/MSW tests; these specs only
check that the real browser, real API, and real DB agree with each other.

## Known local friction

- **Rate limiting**: `POST /cart/items` is guarded by the BE's `authLimiter`
  (20 requests / 15 min per IP — see `Aurevo.BE/src/app/middlewares/rateLimiter.ts`).
  Running the suite many times in quick succession can exhaust it; the
  symptom is "Add Cart" silently not opening the cart panel (the error toast
  auto-dismisses before you notice). Restart the BE dev server to reset the
  in-memory counter, or wait out the window. This limiter is arguably too
  strict for a routine cart action — worth revisiting separately from e2e work.
- **Stock**: `global-setup.ts` tops up every variant's stock to 1000 before
  each run, since the specs place real orders that permanently decrement
  real catalog stock. If you ever see "Insufficient stock" locally outside
  of a test run, that's the e2e suite's doing — it's a local-only side effect
  (the setup refuses to run against a non-local `DATABASE_URL`).

## Adding a new spec

Reuse `e2e/fixtures.ts` for the seeded test user/product helpers. Prefer
`getByRole`/`getByLabel` locators over CSS selectors — they survive markup
changes and match how a user actually finds the element.
