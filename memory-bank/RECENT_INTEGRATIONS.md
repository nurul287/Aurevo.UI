# Recent Integrations — Aurevo.UI

Summary of major features and architecture changes integrated into the frontend. For day-to-day bug fixes, see [RECENT_FIXES.md](RECENT_FIXES.md).

---

## Backend-only auth (Supabase SDK removed)

**What changed:** `@supabase/supabase-js` was removed from the frontend. Email/password and OAuth all go through Aurevo.BE.

| Flow             | Endpoints                                                       |
| ---------------- | --------------------------------------------------------------- |
| Login / register | `POST /auth/login`, `POST /auth/register`                       |
| Session          | `GET /auth/me`                                                  |
| Refresh          | `POST /auth/refresh` (auto on 401 in `src/lib/api.ts`)          |
| Logout           | `POST /auth/logout` + clear local tokens                        |
| OAuth start      | `GET /auth/oauth/url?provider=google\|facebook`                 |
| OAuth redeem     | `GET /auth/oauth/session?code=…` after `/?oauth_code=…` landing |

**Key files:** `src/lib/api.ts`, `src/contexts/auth-context.tsx`, `src/services/auth/`, `src/components/oauth-success-landing-redirect.tsx`

**Optional:** `VITE_SUPABASE_URL` + `VITE_USE_SUPABASE_IMAGE_TRANSFORM` still exist only for storage image-transform URL rewriting — not for auth.

---

## i18n — English + Bangla

**What changed:** Full UI string localization with i18next.

- Locales: `src/i18n/locales/en.json`, `bn.json`
- Default: **English** (persisted override via `localStorage` key `aurevo_language`)
- Switcher in the header: `src/components/language-switcher.tsx`
- Coverage includes nav, home, footer, cart, account dashboard, and common UI

---

## Saved addresses + checkout autofill

**What changed:** Customers can manage delivery addresses in the dashboard; checkout can pick a saved address to fill the form.

| Piece           | Location                                               |
| --------------- | ------------------------------------------------------ |
| Route           | `/dashboard/addresses`                                 |
| Page            | `src/pages/dashboard-addresses-page.tsx`               |
| API hooks       | `src/services/user/use-address.ts` → `/auth/addresses` |
| Checkout picker | `src/pages/checkout-page.tsx`                          |
| Location type   | Home / Office / Pick Up                                |
| Geo helpers     | Bangladesh district / upazila lists                    |

---

## Observability — Sentry + Error Boundary

**What changed:** Production-ready error reporting and a user-facing recovery screen.

| Piece          | Location                                                       |
| -------------- | -------------------------------------------------------------- |
| Sentry init    | `src/lib/sentry.ts` (no-op unless `VITE_SENTRY_DSN` is set)    |
| Session Replay | 10% of sessions, 100% of error sessions                        |
| Error Boundary | `src/components/error-boundary.tsx` wraps the app in `App.tsx` |

---

## CI / merge workflow

| Workflow                           | Role                                                                              |
| ---------------------------------- | --------------------------------------------------------------------------------- |
| `.github/workflows/ci.yml`         | Lint → typecheck → unit tests → build on PRs to `main`/`dev` and pushes to `main` |
| `.github/workflows/merge-back.yml` | After every merge to `main`, auto-merge `main` back into `dev`                    |

---

## Footer (mobile layout)

- Category and About Shop render **side by side** on mobile (`grid-cols-2` + `sm:contents`)
- Fast Delivery link removed from About Shop
- File: `src/components/layout.tsx`

---

## What was intentionally dropped from older docs

These appeared in earlier README drafts but are **not** in the current codebase:

- Wishlist / saved-items product feature
- AI shopping assistant (SSE / Claude)
- Dedicated `/cart` page (cart is the side panel only)
- Direct Supabase client auth / OAuth in the browser
