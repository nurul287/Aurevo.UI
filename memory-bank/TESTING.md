# Frontend Testing — Aurevo.UI

## Overview

- **Framework:** Vitest 4 + Testing Library (React + Hooks) + jsdom
- **API mocking:** Mock Service Worker (MSW) v2 — intercepts real `fetch` calls at the network layer
- **Supabase mocking:** `src/test/mocks/supabase.ts` factory, injected via `vi.mock("@/lib/supabase", ...)`
- **Total test files:** 98 across components, hooks, services, and lib utilities

---

## Running Tests

```bash
pnpm test             # single run (CI mode)
pnpm test:watch       # watch mode
pnpm coverage         # run + generate coverage report (v8 provider, HTML output)
```

---

## Test Infrastructure (`src/test/`)

### `setup.ts`
Global setup file wired via `vite.config.ts → test.setupFiles`. Runs before every test file:
- Imports `@testing-library/jest-dom/vitest` matchers (`toBeInTheDocument`, `toHaveTextContent`, etc.)
- Stubs jsdom APIs that Radix UI components need but jsdom doesn't implement:
  - `window.matchMedia`
  - `IntersectionObserver`
  - `ResizeObserver`
  - `Element.prototype.scrollIntoView`
  - `Element.prototype.hasPointerCapture / setPointerCapture / releasePointerCapture`
- Starts the MSW server before all tests, resets handlers after each test, closes after all tests

### `msw/server.ts`
MSW node server exported as `server`. Used in `setup.ts` lifecycle hooks.

### `msw/handlers.ts`
Base "happy path" handlers for the most common endpoints:
- `GET /products` → `{ success, data: [], meta: { pagination: ... } }`
- `GET /categories` → same shape
- `GET /brands` → same shape

Individual test files override specific routes with `server.use(http.get(...))` — overrides are reset after each test by `server.resetHandlers()`.

### `test-utils.tsx`
Re-exports all `@testing-library/react` utilities plus two custom wrappers:

```ts
// Renders a React component with QueryClientProvider + MemoryRouter
renderWithProviders(ui, { queryClient?, routerProps? })

// Renders a TanStack Query hook with QueryClientProvider
// Returns { result, queryClient } — queryClient lets tests seed/inspect cache
renderHookWithQueryClient(callback, { queryClient? })
```

`createTestQueryClient()` creates a fresh `QueryClient` with `retry: false` so failed queries don't spin on retries during tests.

### `mocks/supabase.ts`
Factory: `createMockSupabaseClient(user)` — returns a mock Supabase client with `vi.fn()` stubs for `auth.getUser`, `auth.signInWithPassword`, `storage.from`, etc. Injected per-test via `vi.mock("@/lib/supabase", () => ({ supabase: createMockSupabaseClient(null) }))`.

---

## Test Organisation

```
src/
├── components/
│   ├── __tests__/                  # Shared components (cart panel, layout, header search, etc.)
│   ├── ui/__tests__/               # Shadcn/ui primitives (button, card, dialog, select, …)
│   ├── guards/__tests__/           # Route guards (auth-guard, admin-guard, guest-guard)
│   ├── home/__tests__/             # Home page section components
│   └── admin/__tests__/            # Admin-only components (generate-variants-dialog, etc.)
├── lib/
│   └── __tests__/                  # Pure utility functions (currency, order-display, api, …)
└── services/
    ├── auth/__tests__/             # useAuth queries + mutations
    ├── cart/__tests__/             # cart-totals (pure), use-cart-query, use-cart-mutation
    ├── product/__tests__/          # use-product-query, use-product-mutation
    ├── order/__tests__/            # use-order-query, use-order-mutation
    ├── inventory/__tests__/        # use-inventory-query, use-variant-availability
    ├── category/__tests__/
    ├── brand/__tests__/
    ├── user/__tests__/
    └── admin/__tests__/
```

---

## What Each Layer Tests

### `lib/__tests__/` — Pure functions (no mocking needed)
Unit tests with no mocking. Inputs → expected outputs.

| File | What it covers |
|------|----------------|
| `currency.test.ts` | `formatPrice` BDT formatting |
| `utils.test.ts` | `cn` class merge utility |
| `api.test.ts` | `api.get/post/patch/delete` wrapper — attaches auth headers, parses JSON, throws on error |
| `order-display.test.ts` | Order status labels, color helpers |
| `cart-totals.test.ts` | `getCartLineUnitPrice`, `computeCartTotals` — price priority (variant → product → line price) |
| `variant-size-sort.test.ts` | Size ordering logic |
| `format-order-address.test.ts` | Address formatting helper |
| `bangladesh-locations.test.ts` | District/upazila lookup |
| `supabase-error.test.ts` | Supabase error normalisation |
| `oauth-error-url.test.ts` | OAuth error URL parsing |
| `profile-completion.test.ts` | Profile completeness check |

### `services/__tests__/` — TanStack Query hooks (MSW + `renderHookWithQueryClient`)

Pattern:
1. Use `server.use(...)` to define the response shape for the specific endpoint
2. Call `renderHookWithQueryClient(() => useMyHook(args))`
3. `await waitFor(() => expect(result.current.isSuccess).toBe(true))`
4. Assert on `result.current.data` or `showSuccess`/`showError` mock calls

Mutation tests also verify side effects: cache invalidations, `localStorage` changes, toast messages.

### `components/__tests__/` — React components (Testing Library + MSW)

Pattern:
1. `renderWithProviders(<MyComponent />)`
2. Query DOM with `screen.getByRole`, `screen.getByText`, etc.
3. Simulate interactions with `userEvent.click`, `userEvent.type`
4. Assert on DOM state after interaction

Component tests do **not** test implementation details — they test what users see and do.

### `components/guards/__tests__/` — Route guards

Each guard is tested with three scenarios: unauthenticated, authenticated-non-admin, and authenticated-admin. Supabase client is mocked via `createMockSupabaseClient`.

---

## Key Patterns

### Overriding MSW handlers per test

```ts
it("shows an error toast when the API returns 500", async () => {
  server.use(
    http.post(`${API_URL}/cart/items`, () =>
      HttpResponse.json({ success: false }, { status: 500 })
    )
  );
  // ... test body
});
// handler is reset after this test — does not affect other tests
```

### Seeding / inspecting TanStack Query cache

```ts
const { result, queryClient } = renderHookWithQueryClient(() => useMyMutation());

// seed
queryClient.setQueryData(["cart", userId], { items: [...] });

// inspect after mutation
expect(queryClient.getQueryState(["cart", userId])?.isInvalidated).toBe(true);
```

### Mocking Supabase auth state

```ts
vi.mock("@/lib/supabase", () => ({
  supabase: createMockSupabaseClient({ id: "user-1", email: "test@example.com" }),
}));
```

Pass `null` to simulate a logged-out user.

---

## Vitest Configuration (`vite.config.ts`)

```ts
test: {
  environment: "jsdom",
  globals: true,           // no need to import describe/it/expect
  css: true,               // Tailwind CSS classes are processed
  setupFiles: ["./src/test/setup.ts"],
  exclude: ["node_modules", "dist", "e2e/**"],
  coverage: {
    provider: "v8",
    reporter: ["text", "html"],
  },
}
```

`globals: true` means `describe`, `it`, `expect`, `vi`, `beforeEach`, etc. are available without imports (though explicit imports are used in most test files for IDE support).

---

## What Is NOT Unit-Tested Here

- Page-level components — these require full app context (auth, router state, query providers). Integration/E2E tests would cover these.
- BE API correctness — that lives in `Aurevo.BE` Vitest + Supertest integration tests.
- Supabase RLS policies — tested via Supabase local CLI.
