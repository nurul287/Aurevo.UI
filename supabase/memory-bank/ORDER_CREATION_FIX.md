# Order Creation Fix - Cart Items for Logged-in Users

## Problem

When a logged-in user tried to create an order, the system was showing "Cart is empty" error even though they had items in their cart. This was because:

1. **Cart items for logged-in users** are stored with `user_id` in the database
2. **Order creation logic** was only querying by `session_id`
3. This mismatch caused the cart items to not be found

## Root Cause

In `src/services/order/use-order-mutation.ts`, the `useCreateGuestOrder` function was fetching cart items like this:

```typescript
// ❌ WRONG: Only queries by session_id
const { data: cartItems } = await supabase
  .from("cart_items")
  .select("...")
  .eq("session_id", data.sessionId);
```

This approach only works for guest users. For logged-in users, cart items are associated with their `user_id`, not `session_id`.

## Solution

Updated the cart fetching logic to **prioritize `user_id` for logged-in users**:

```typescript
// ✅ CORRECT: Check if user is logged in first
const {
  data: { session },
} = await supabase.auth.getSession();
const userId = session?.user?.id;

let cartQuery = supabase.from("cart_items").select("...");

// If user is logged in, query by user_id, otherwise by session_id
if (userId) {
  cartQuery = cartQuery.eq("user_id", userId);
} else if (data.sessionId) {
  cartQuery = cartQuery.eq("session_id", data.sessionId);
}
```

## Changes Made

### 1. **Updated Cart Query Logic** (`use-order-mutation.ts`)

- Fetch session at the beginning of the mutation
- Extract `userId` from the session
- Query cart items by `user_id` if logged in, otherwise by `session_id`

### 2. **Pass User ID to Edge Function**

- Updated the payload to include the actual `userId` from session
- Changed from: `user_id: data.userId || null`
- Changed to: `user_id: userId || data.userId || null`

### 3. **Fixed Cache Invalidation**

- Invalidate the correct query keys based on whether user is logged in
- For logged-in users: `["cart", "items", userId]` and `["cart", "all", userId]`
- For guests: `["cart", "", sessionId]` and `["cart", "all", "", sessionId]`

### 4. **Removed Duplicate Code**

- Removed duplicate `getSession()` call that was happening later in the function
- Reused the session fetched at the beginning

## Testing

To verify the fix works:

1. **As a logged-in user:**

   - Add items to cart
   - Go to checkout
   - Fill in order details
   - Submit order
   - ✅ Should create order successfully with all cart items

2. **As a guest user:**
   - Add items to cart
   - Go to checkout
   - Fill in order details
   - Submit order
   - ✅ Should create order successfully with all cart items

## Related Files

- `src/services/order/use-order-mutation.ts` - Main fix
- `src/hooks/use-cart.ts` - Already had correct logic (no changes needed)
- `src/services/cart/use-cart-query.ts` - Already had correct logic (no changes needed)

## Notes

The `use-cart.ts` hook was already implementing the correct pattern:

```typescript
const queryParams = useMemo(
  () => ({
    userId: user?.id,
    sessionId: user?.id ? undefined : sessionId, // Only use sessionId if no userId
  }),
  [user?.id, sessionId]
);
```

The order creation just needed to follow the same pattern.
