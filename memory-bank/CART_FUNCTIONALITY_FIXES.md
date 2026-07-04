# Cart Functionality Fixes

This file tracks all cart-related bugs that were diagnosed and fixed across Aurevo.UI + Aurevo.BE.

---

## Fix 1 — Cart showing "Product" / ৳0 (blank name and price)

**Root cause:** `GET /cart` in the BE did a simple `SELECT * FROM cart_items` with no joins. The frontend expected joined `product` and `variant` objects on each cart item.

**BE fix (`cart.service.ts`):**
- `getCart` now LEFT JOINs `productVariants` and `products`
- Primary image fetched separately and merged by product ID
- `addItem` and `updateItem` return joined details via `getCartItemWithDetails()`

**Price resolution:** `effectivePrice(variant, product)` = `variant.price ?? product.basePrice ?? "0"`. Variants with `null` price inherit from `product.basePrice`.

---

## Fix 2 — Cart migration always failing

**Root cause:** Two stacked bugs:
1. BE `migrateCartSchema` required `guestSessionId` to match `.uuid()`, but the FE generates `guest_<timestamp>_<random>` format (not a UUID)
2. FE posted `{ sessionId }` but the BE schema expected `{ guestSessionId }`

**BE fix (`cart.schema.ts`):** Relaxed `guestSessionId` from `.uuid()` to `.min(1)`.

**FE fix (`use-cart-mutation.ts`):** Changed POST body from `{ sessionId }` to `{ guestSessionId: sessionId }`.

---

## Fix 3 — `guest_session_id` never cleared after migration (infinite re-sends)

**Root cause:** `useMigrateGuestCart.onSuccess` did not remove the session ID from localStorage, so every subsequent login triggered a new migration attempt.

**FE fix (`use-cart-mutation.ts`):**
```ts
onSuccess: (_, variables) => {
  queryClient.removeQueries({ queryKey: cartQueryKeys.all("", variables.sessionId) });
  queryClient.invalidateQueries({ queryKey: cartQueryKeys.all(variables.userId) });
  localStorage.removeItem("guest_session_id");   // ← added
},
```

---

## Fix 4 — Cart availability API firing on every page load

**Root cause:** `useVariantsAvailableQuantities` had no `enabled` guard, so it fired even when the cart side panel was closed.

**FE fix (`cart-side-panel.tsx`):**
```ts
const { data: availability } = useVariantsAvailableQuantities(variantIds, {
  enabled: isCartPanelOpen,   // ← added
});
```

---

## Fix 5 — Products page showing "Out of Stock" incorrectly

**Root cause:** `variantAvailableUnits()` in `admin-products-page.tsx` was reading `variant.inventory` (a field that `GET /products` does not return) and falling through to 0.

**FE fix (`admin-products-page.tsx`):**
```ts
// Before
const qty = variant.inventory?.quantity ?? 0;

// After — reads the fields that GET /products actually returns
const qty = (variant.stock ?? 0) - (variant.reserved_stock ?? 0);
```

**Types fix (`services/types.ts`):** Added `stock?: number` and `reserved_stock?: number` to `ProductVariant` interface.

---

## Fix 6 — Inventory showing stock but products still "Out of Stock"

**Root cause:** `product_variants.stock` was `0` while `inventory.quantity` was `7`. `upsertInventory` only updated the `inventory` table but not `product_variants.stock`.

**BE fix (`inventory.service.ts`):** `upsertInventory` now wraps both updates in a transaction:
```ts
await db.transaction(async (tx) => {
  await tx.insert(inventory).values(...).onConflictDoUpdate(...);
  await tx.update(productVariants).set({ stock: input.quantity })
    .where(eq(productVariants.id, input.variantId));
});
```

---

## Fix 7 — New variants not appearing in Inventory admin page

**Root cause:** `createVariant` and `bulkCreateVariants` inserted into `product_variants` but never created a matching `inventory` row, so those variants were invisible in the Inventory page.

**BE fix (`variants.service.ts`):** Both functions now run inside a transaction that inserts the inventory row:
```ts
return db.transaction(async (tx) => {
  const [variant] = await tx.insert(productVariants).values(variantData).returning();
  await tx.insert(inventory).values({
    variantId: variant!.id,
    location: "main",
    quantity: input.stock ?? 0,
  });
  return variant!;
});
```

---

## Fix 8 — Inventory queries not refreshing after variant operations

**Root cause:** `invalidateQueries({ queryKey: ["inventory"] })` did not match the actual query keys `["inventory-levels"]`, `["low-stock-items"]`, `["inventory-movements"]`.

**FE fix (`use-product-mutation.ts`):** Centralised helper with all three correct keys:
```ts
function invalidateInventoryQueries(queryClient: QueryClient) {
  queryClient.invalidateQueries({ queryKey: ["inventory-levels"] });
  queryClient.invalidateQueries({ queryKey: ["low-stock-items"] });
  queryClient.invalidateQueries({ queryKey: ["inventory-movements"] });
}
```
Called on variant create, update, and delete.

---

## Fix 9 — colorCode validation rejecting empty string

**Root cause:** `z.string().regex(...).optional()` — Zod's `.optional()` only skips validation for `undefined`, not `""`. When the color picker is cleared it sends `""`, which failed the hex regex.

**BE fix (`variants.schema.ts`):**
```ts
const optionalHexColor = z.preprocess(
  (val) => (val === "" ? undefined : val),
  z.string().regex(/^#[0-9a-fA-F]{3,8}$/, "Must be a valid hex color").optional()
);
```

---

## Fix 10 — Order confirmation page not showing product names

**Root cause:** The page was reading `item.product_name`, `item.variant_name`, `item.total_price` (snake_case) but the API returns `item.productName`, `item.variantName`, `item.totalPrice` (camelCase).

**FE fix (`order-confirmation-page.tsx`):** Added normalised aliases with fallback for both casings:
```ts
const productName = item.productName || item.product_name;
const variantName = item.variantName || item.variant_name;
const totalPrice  = item.totalPrice  || item.total_price;
const imageUrl    = item.imageUrl    || item.image_url || null;
```

---

## Two-Ledger Mental Model

There are **two separate stock ledgers**:

| Ledger | Column | Who reads it |
|--------|--------|-------------|
| Variant ledger | `product_variants.stock` / `reserved_stock` | Cart, checkout, add-to-cart, availability API |
| Inventory ledger | `inventory.quantity` | Inventory admin page, low-stock alerts, export |

Every operation that modifies one must also sync the other. Inventory adjust and upsert both run transactions that update both tables. Variant create always inserts an `inventory` row.
