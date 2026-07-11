# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

See [`../Aurevo.BE/CLAUDE.md`](../Aurevo.BE/CLAUDE.md) for the Aurevo-wide overview (workspace-wide decisions, architecture, docs) and [`README.md`](README.md) for setup detail.

## Development workflow (always apply)

1. **Build** — `pnpm build`; fix all type/lint errors (`pnpm exec tsc --noEmit`, `pnpm lint`). `pnpm build` runs Vite only — it does **not** typecheck, so always run `tsc --noEmit` separately before pushing.
2. **Verify in mobile** — check every UI change at a mobile viewport, not just desktop. Use the Browser pane's `resize_window` with the `mobile` preset.
3. **Micro-commit** — small, one-concern commits with conventional messages. Never bundle unrelated changes.
4. **Never deploy until told** — push only when asked. CI + Vercel deploy automatically on merge to `main`.

## Commands

```bash
pnpm dev            # localhost:5173 — needs Aurevo.BE + local Supabase running too
pnpm build          # Vite build only — NOT a typecheck
pnpm exec tsc --noEmit
pnpm lint
pnpm test           # vitest, MSW-mocked — no real network calls
pnpm test:e2e       # Playwright — local only, see e2e/README.md
pnpm test:e2e:ui    # Playwright's interactive debugger
```

## Architecture

**No Supabase SDK.** `@supabase/supabase-js` is not a dependency — every auth flow (email/password, Google/Facebook OAuth, logout) goes through Aurevo.BE's `/api/auth/*` endpoints, and tokens live in `localStorage` (`aurevo_access_token` / `aurevo_refresh_token`), not a Supabase session. `VITE_SUPABASE_URL` is optional and only used to build storage image-transform URLs (`src/lib/product-hero-image-url.ts`) — it does nothing else.

**OAuth redirect flow** — `useSignInWithOAuth` calls `GET /auth/oauth/url` and does a full-page redirect (`window.location.href`), it does not call any SDK. After the provider round-trip, the BE redirects back to `/?oauth_code=...`; `OAuthSuccessLandingRedirect` catches that param, redeems it via `GET /auth/oauth/session`, stores the tokens, and navigates to the dashboard.

**Auth state reactivity** — `useMeQuery`'s `queryFn` checks for a token itself and returns `null` if absent; it does **not** use TanStack Query's `enabled: !!token`. `enabled` is captured once at render time, so a token stored after render (login, OAuth redeem) would leave the query permanently disabled until something else forced a remount — `invalidateQueries` alone wouldn't refetch it.

**i18n** (`src/i18n/`) — i18next, English/বাংলা. `detectLanguage()` in `src/i18n/index.ts` checks **only** a saved `localStorage` choice; there is no timezone/browser-locale auto-detection (an earlier version defaulted Asia/Dhaka timezones to Bangla — removed deliberately so every visitor starts in English). The header's EN/বাং toggle calls `setLanguage()`, which persists the choice. Tests force English in `src/test/setup.ts` regardless of the host machine's timezone — don't remove that or CI becomes timezone-dependent.

**Saved addresses & checkout autofill** — `src/services/user/use-address.ts` hits `/auth/addresses`. On the checkout page, an untouched form auto-fills from the user's default address; picking a different saved-address card overwrites the form and highlights that card. Radix `Select` fires an empty-string `onValueChange` on mount when its value is set programmatically (not via user interaction) — both the checkout upazila picker and the dashboard address-edit dialog guard against this (`if (!value) return;`) to avoid the autofilled value being silently wiped, and both render the current value as a plain `<span>` rather than `SelectValue`, which otherwise shows the placeholder in the same situation.

**Delete confirmation** — uses the project's `AlertDialog` (`src/components/ui/alert-dialog.tsx`), not `window.confirm()`. Any new destructive action should follow this pattern, not the native browser dialog.

**Error boundary** — `src/components/error-boundary.tsx` wraps the whole app in `App.tsx`; reports caught errors to Sentry (if configured) with the component stack.

**Sentry** — `src/lib/sentry.ts` initializes `@sentry/react` only if `VITE_SENTRY_DSN` is set (no-op locally without it). Session replay: 10% of normal sessions, 100% of sessions that error.

## E2E tests (Playwright, local only — not in CI)

`e2e/` covers only the money-critical flows: guest checkout, logged-in checkout with a saved address, cart add/update/remove math. Needs local Supabase + BE + FE all running — see `e2e/README.md`.

- `e2e/global-setup.ts` tops up every product variant's stock to 1000 before each run, because the specs place **real orders** that permanently decrement real catalog stock — an earlier run exhausted a real product's stock and caused silent, confusing "Add to Cart" failures. It refuses to run against any `DATABASE_URL` that isn't obviously local.
- `POST /cart/items` shares infrastructure with the login rate limiter's neighbor `cartLimiter` (BE-side) — running the suite many times in quick succession can still exhaust *some* limiter; if "Add to Cart" silently does nothing locally, restart the BE dev server before assuming the test or the feature is broken.

## Key gotchas

- `pnpm build` does not typecheck — a change that passes `pnpm build` can still fail CI's `tsc --noEmit` step. Always run both locally.
- The saved-addresses "Set as default" control is always rendered (hidden with `invisible`, not conditionally unmounted) specifically so toggling default doesn't change a card's height and jump the grid — don't reintroduce a conditional `{!addr.is_default && ...}` there.
