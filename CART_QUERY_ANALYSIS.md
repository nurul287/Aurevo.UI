# Cart Query Analysis

## Summary

The `use-cart-query.ts` file contains **4 query hooks**, but only **1 is actively used** in the application. The other 3 are **unused legacy methods** that can be safely removed.

---

## Current Usage

### ✅ **Used Methods**

1. **`useCartData(userId?, sessionId?)`** - **ACTIVELY USED**
   - **Location**: `src/hooks/use-cart.ts` (line 33)
   - **Purpose**: Combined query that fetches cart items, calculates total, and counts items in a single API call
   - **Benefits**:
     - Reduces 3 separate API calls to 1
     - More efficient
     - Better performance
     - Supports both authenticated users (user_id) and guests (session_id)

---

## ❌ **Unused Methods** (Can be removed)

1. **`useCartItems(userId: string)`** - **NOT USED**

   - Fetches only cart items for a user
   - Replaced by `useCartData` which does this plus more

2. **`useCartTotal(userId: string)`** - **NOT USED**

   - Calculates cart total
   - Replaced by `useCartData` which includes total calculation

3. **`useCartItemCount(userId: string)`** - **NOT USED**
   - Counts cart items
   - Replaced by `useCartData` which includes item count

---

## Issues Found

### 🔴 **Critical Issue**: Unused methods don't support guest users

All three unused methods (`useCartItems`, `useCartTotal`, `useCartItemCount`) only accept `userId` and query by `user_id`. They **don't support `session_id`** for guest users.

```typescript
// ❌ Only works for authenticated users
export function useCartItems(userId: string) {
  return useQuery({
    queryKey: cartQueryKeys.items(userId),
    queryFn: async (): Promise<CartItem[]> => {
      // ...
      .eq("user_id", userId)  // No session_id support!
```

**vs**

```typescript
// ✅ Works for both authenticated and guest users
export function useCartData(userId?: string, sessionId?: string) {
  // ...
  if (userId) {
    query = query.eq("user_id", userId);
  } else if (sessionId) {
    query = query.eq("session_id", sessionId);  // Guest support!
  }
```

---

## Recommendations

### Option 1: **Clean Up (Recommended)** ✅

Remove the unused methods to:

- Reduce code complexity
- Remove maintenance burden
- Prevent accidental usage of guest-incompatible methods
- Make codebase cleaner

**Files to update:**

```typescript
// src/services/cart/use-cart-query.ts
// Remove:
- useCartItems()
- useCartTotal()
- useCartItemCount()

// Keep:
- useCartData()
- cartQueryKeys (update to remove unused keys)
```

### Option 2: **Update for Guest Support** (Not recommended)

Update all three unused methods to support `session_id`, but this is unnecessary since `useCartData` already provides everything needed.

---

## Proposed Updated Code

Here's the cleaned-up version:

```typescript
import { supabase } from "@/lib/supabase";
import { CartItem } from "@/services/types";
import { useQuery } from "@tanstack/react-query";

// Query keys for consistent cache management
export const cartQueryKeys = {
  all: (userId: string, sessionId?: string) =>
    ["cart", "all", userId, sessionId] as const,
} as const;

/**
 * Combined hook to get all cart data in a single query
 * This reduces API calls from 3 separate queries to 1
 * Supports both authenticated users (userId) and guests (sessionId)
 */
export function useCartData(userId?: string, sessionId?: string) {
  const isEnabled = !!(userId || sessionId);

  return useQuery({
    queryKey: cartQueryKeys.all(userId || "", sessionId),
    queryFn: async (): Promise<{
      items: CartItem[];
      total: number;
      itemCount: number;
    }> => {
      // Build the query based on whether we have a user ID or session ID
      let query = supabase
        .from("cart_items")
        .select(
          `
          *,
          product:products!product_id(
            *,
            images:product_images(*)
          ),
          variant:product_variants!variant_id(*)
        `
        )
        .order("created_at", { ascending: false });

      // If we have a user ID, query by user_id, otherwise query by session_id
      if (userId) {
        query = query.eq("user_id", userId);
      } else if (sessionId) {
        query = query.eq("session_id", sessionId);
      } else {
        // No user ID or session ID, return empty cart
        return { items: [], total: 0, itemCount: 0 };
      }

      const { data: cartItems, error } = await query;

      if (error) {
        console.error("❌ Error fetching cart data:", error);
        throw error;
      }

      const items = cartItems || [];

      // Calculate total and item count from the same data
      const total = items.reduce((sum, item) => {
        const variantPrice = (item.variant as any)?.price;
        const productPrice = (item.product as any)?.base_price;
        const price = variantPrice || productPrice || item.price || 0;
        return sum + price * item.quantity;
      }, 0);

      // Count unique products instead of total quantity
      const itemCount = items.length;

      return {
        items,
        total,
        itemCount,
      };
    },
    enabled: isEnabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });
}
```

---

## Benefits of Cleanup

1. ✅ **Simpler codebase** - One method instead of four
2. ✅ **No dead code** - All code is actively used
3. ✅ **Consistent pattern** - Single source of truth for cart data
4. ✅ **Guest support** - Works for both authenticated and guest users
5. ✅ **Better performance** - Single API call instead of three
6. ✅ **Easier maintenance** - Less code to maintain and update

---

## Migration Impact

**Zero impact** - The unused methods are not imported or used anywhere in the codebase, so removing them is completely safe.

### Files that import from cart query:

- ✅ `src/hooks/use-cart.ts` - Only uses `useCartData`
- ✅ `src/services/cart/index.ts` - Re-exports all (can be updated)
- ✅ `src/services/index.ts` - Re-exports from cart (no change needed)

---

## Conclusion

**Recommendation**: Remove `useCartItems`, `useCartTotal`, and `useCartItemCount` from `use-cart-query.ts` to clean up the codebase. Keep only `useCartData` which is the modern, efficient, and guest-compatible approach.
