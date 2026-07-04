# Aurevo Fashion — Frontend (Aurevo.UI)

React 19 storefront + admin panel for the Aurevo Fashion e-commerce platform. Talks exclusively to **Aurevo.BE** (Express REST API) for all data, auth, and file uploads. Supabase SDK is kept only for Google/Facebook OAuth redirects.

---

## Tech Stack

| Layer | Library / Version |
|-------|-------------------|
| Framework | React 19.1.1 |
| Build | Vite 7.1.7 |
| Language | TypeScript 5.9.2 |
| Routing | React Router 7.9.3 |
| Server state | TanStack Query v5 |
| UI primitives | Radix UI + Shadcn/ui |
| Styling | Tailwind CSS v4 |
| Icons | Lucide React |
| Package manager | pnpm |

---

## Screenshots

### Storefront
![Aurevo Fashion – Storefront](public/aurevo-fashion-ui.png)

### Admin Dashboard
![Aurevo Fashion – Admin Dashboard](public/aurevo-fahion-dashboard.png)

### Admin – Products Management
![Aurevo Fashion – Products Management](public/aurevo-fashion-admin.png)

### Admin – Categories Management
![Aurevo Fashion – Categories Management](public/aurevo-fashion-admin-categories.png)

---

## Features

### Storefront
- Product catalog with category, brand, gender, price filters + search
- Product detail with variant picker (size/color/SKU), stock availability
- Guest + authenticated shopping cart (cart side panel)
- Wishlist / saved items
- Checkout with guest order support (no account required)
- Order confirmation page with itemised receipt and guest token access
- AI shopping assistant (SSE-streamed, Claude-powered)

### Admin Panel (`/admin`)
- Dashboard with order stats and revenue summary
- Products management — create/edit/delete, bulk status toggle, variant management, image uploads
- Variants — create single or bulk CSV upload, color picker, inventory sync
- Categories and Brands management with "Clear filters" controls
- Orders management — server-side pagination, search, status/payment/tracking/fulfillment updates
- Inventory levels — per-variant stock tracking, low-stock view, movement audit log, .xlsx export

### Authentication
- Email/password auth proxied through Aurevo.BE (`POST /auth/login`, `POST /auth/register`)
- Google/Facebook OAuth via Supabase SDK (redirect flow); token is extracted and stored to localStorage after callback
- JWT stored in localStorage (`aurevo_access_token`), sent as Bearer token to Aurevo.BE
- Auto-refresh on 401 via `POST /auth/refresh`
- Guest cart auto-migrates to user account on sign-in
- Guest order claim on login (matches by session ID, email, phone)

---

## Project Structure

```
src/
├── components/           # Shared UI components
│   ├── ui/               # Shadcn/ui primitives (button, card, dialog, …)
│   ├── cart-side-panel   # Slide-in cart drawer
│   └── ...
├── constants/            # App paths, static config
├── contexts/             # React contexts (auth, guest cart)
├── hooks/                # Custom hooks (use-toast, use-cart, …)
├── lib/
│   ├── api.ts            # Typed fetch wrapper (api.get / api.post / apiDownloadFile)
│   ├── currency.ts       # formatPrice (BDT)
│   └── meta-pixel.ts     # FB Pixel event helpers
├── pages/
│   ├── home-page.tsx
│   ├── products-page.tsx
│   ├── product-detail-page.tsx
│   ├── cart-page.tsx
│   ├── checkout-page.tsx
│   ├── order-confirmation-page.tsx
│   └── admin/            # All admin pages
├── routes/               # Route definitions (public / protected / admin)
└── services/
    ├── auth/             # Auth queries & mutations
    ├── cart/             # Cart queries, mutations, totals helpers
    ├── order/            # Order queries
    ├── product/          # Product, variant, category, brand, image mutations
    ├── inventory/        # Inventory levels, movements, low-stock, export
    └── types.ts          # Shared TypeScript interfaces
```

---

## Local Development

### Prerequisites
- Node.js 20+, pnpm 9+
- Aurevo.BE running on `http://localhost:5000`

### Setup

```bash
cd Aurevo.UI
pnpm install
cp .env.example .env.local
pnpm dev          # http://localhost:5173
pnpm build        # production build
```

### Environment Variables (`.env.local`)

```env
# Supabase (OAuth only — Google/Facebook sign-in redirects)
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_ANON_KEY=<local-anon-key>

# Backend REST API
VITE_API_URL=http://localhost:5000/api

# Optional — production only
VITE_FACEBOOK_PAGE_ID=your_facebook_page_id
VITE_META_PIXEL_ID=your_meta_pixel_id
```

---

## Key Patterns

### API Layer (`src/lib/api.ts`)

All REST calls go through the typed `api` wrapper which:
- Reads `VITE_API_URL`
- Reads `aurevo_access_token` from localStorage and attaches `Authorization: Bearer <token>`
- Auto-refreshes on 401: calls `POST /auth/refresh` with `aurevo_refresh_token`, stores new tokens, retries once
- Attaches `X-Guest-Session: <id>` for guest cart/order calls
- Returns typed JSON or throws on non-2xx

```ts
const data = await api.get<Product[]>("/products");
const order = await api.post<Order>("/orders", payload);
await apiDownloadFile("/inventory/export");   // triggers browser download
```

### TanStack Query Cache Keys

Query keys follow a consistent shape so invalidations are precise:

```ts
// Products
["admin", "products", filters]
["admin", "images", productId]

// Inventory
["inventory-levels", filters]
["low-stock-items", filters]
["inventory-movements", filters]

// Cart
["cart", userId, sessionId]
```

After any variant create/update/delete, all three inventory key groups are invalidated together via `invalidateInventoryQueries(queryClient)`.

### Cart — Two Stock Sources

- **`product_variants.stock / reserved_stock`** — what cart, availability checks, and checkout read
- **`inventory.quantity`** — what the Inventory admin page reads (kept in sync by BE on every adjustment)

These are different ledgers. `upsertInventory` syncs both atomically.

### Guest Cart Flow

1. `localStorage` stores `guest_session_id` (format: `guest_<ts>_<rand>`)
2. Sent as `X-Guest-Session` header on all cart requests
3. On login → `POST /cart/migrate` with `{ guestSessionId }` → BE merges guest rows into user cart
4. On success → `localStorage.removeItem("guest_session_id")` prevents re-migration

### Order Confirmation Page

The page reads `?orderId=&orderNumber=&guestToken=` from the URL. The API returns camelCase item fields (`productName`, `variantName`, `unitPrice`, `totalPrice`); the component normalises both casings for backwards compat.

---

## Testing

98 test files across components, hooks, services, and lib utilities.

| Tool | Role |
|------|------|
| Vitest 4 | Test runner + coverage (v8) |
| Testing Library (React + Hooks) | Component / hook rendering |
| MSW v2 | Network-layer API mocking (intercepts `fetch`) |
| jsdom | Browser environment simulation |

```bash
pnpm test             # single run (CI)
pnpm test:watch       # watch mode
pnpm coverage         # HTML coverage report
```

See [memory-bank/TESTING.md](memory-bank/TESTING.md) for full details: test infrastructure, patterns, and what each layer covers.

---

## Available Scripts

```bash
pnpm dev              # dev server (port 5173)
pnpm build            # production build
pnpm lint             # ESLint
pnpm test             # unit tests (single run)
pnpm test:watch       # unit tests (watch)
pnpm coverage         # test coverage report
```

> DB scripts (`db:start`, `db:reset`, `db:migrate:*`, etc.) have moved to `Aurevo.BE` — run them from there.

---

## Browser Support

Chrome 90+, Firefox 88+, Safari 14+, Edge 90+, modern mobile browsers.
