# Cart Mutation Analysis

## Issues Found

### 🔴 **Critical Issue**: `useClearCart()` references deleted query keys

**Location**: Lines 377-388

**Problem**:

```typescript
onSuccess: (_, userId) => {
  // ❌ These query keys don't exist anymore!
  queryClient.invalidateQueries({
    queryKey: cartQueryKeys.items(userId),
  });
  queryClient.invalidateQueries({
    queryKey: cartQueryKeys.total(userId),
  });
  queryClient.invalidateQueries({
    queryKey: cartQueryKeys.itemCount(userId),
  });
},
```

**Why this is broken**:

- We removed `cartQueryKeys.items()`, `cartQueryKeys.total()`, and `cartQueryKeys.itemCount()`
- Only `cartQueryKeys.all()` exists now
- This will cause TypeScript errors and runtime issues

---

### ⚠️ **Issue**: `useClearCart()` doesn't support guest users

**Problem**:

```typescript
export function useClearCart() {
  return useMutation({
    mutationFn: async (userId: string) => {  // ❌ Only accepts userId
      const { error } = await supabase
        .from("cart_items")
        .delete()
        .eq("user_id", userId);  // ❌ Can't clear guest carts!
```

**Impact**:

- Guest users can't clear their cart
- Only works for authenticated users
- Inconsistent with other cart mutations that support both

---

## All Cart Mutations Review

### ✅ **Working Correctly**:

1. **`useAddToCart()`** - Lines 8-160

   - ✅ Supports both `userId` and `sessionId`
   - ✅ Uses correct `cartQueryKeys.all()`
   - ✅ Proper error handling
   - ✅ Checks for existing items before insert

2. **`useUpdateCartItemQuantity()`** - Lines 165-271

   - ✅ Supports both `userId` and `sessionId`
   - ✅ Uses correct `cartQueryKeys.all()`
   - ✅ Optimistic updates implemented
   - ✅ Proper rollback on error

3. **`useRemoveFromCart()`** - Lines 276-360

   - ✅ Supports both `userId` and `sessionId`
   - ✅ Uses correct `cartQueryKeys.all()`
   - ✅ Optimistic updates implemented
   - ✅ Proper rollback on error

4. **`useMigrateGuestCart()`** - Lines 398-507
   - ✅ Properly migrates guest cart to user cart
   - ✅ Uses correct `cartQueryKeys.all()`
   - ✅ Handles duplicate items correctly
   - ✅ Cleans up guest cart after migration

### ❌ **Needs Fixing**:

5. **`useClearCart()`** - Lines 365-393
   - ❌ Uses deleted query keys
   - ❌ Doesn't support guest users
   - ❌ Only accepts `userId` parameter

---

## Fixes Required

### Fix 1: Update `useClearCart()` to use correct query keys

**Before**:

```typescript
onSuccess: (_, userId) => {
  queryClient.invalidateQueries({
    queryKey: cartQueryKeys.items(userId),
  });
  queryClient.invalidateQueries({
    queryKey: cartQueryKeys.total(userId),
  });
  queryClient.invalidateQueries({
    queryKey: cartQueryKeys.itemCount(userId),
  });
},
```

**After**:

```typescript
onSuccess: (_, variables) => {
  queryClient.invalidateQueries({
    queryKey: cartQueryKeys.all(variables.userId || "", variables.sessionId),
  });
},
```

### Fix 2: Add guest user support to `useClearCart()`

**Before**:

```typescript
export function useClearCart() {
  return useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from("cart_items")
        .delete()
        .eq("user_id", userId);
```

**After**:

```typescript
export function useClearCart() {
  return useMutation({
    mutationFn: async ({
      userId,
      sessionId,
    }: {
      userId?: string;
      sessionId?: string;
    }) => {
      let query = supabase.from("cart_items").delete();

      if (userId) {
        query = query.eq("user_id", userId);
      } else if (sessionId) {
        query = query.eq("session_id", sessionId);
      } else {
        throw new Error("Either userId or sessionId must be provided");
      }

      const { error } = await query;
```

---

## Updated `useClearCart()` Function

```typescript
/**
 * Hook for clearing entire cart
 * Supports both authenticated users and guests
 */
export function useClearCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      sessionId,
    }: {
      userId?: string;
      sessionId?: string;
    }) => {
      console.log("🗑️ Clearing cart:", { userId, sessionId });

      let query = supabase.from("cart_items").delete();

      if (userId) {
        query = query.eq("user_id", userId);
      } else if (sessionId) {
        query = query.eq("session_id", sessionId);
      } else {
        throw new Error("Either userId or sessionId must be provided");
      }

      const { error } = await query;

      if (error) throw error;

      console.log("✅ Cart cleared successfully");
    },
    onSuccess: (_, variables) => {
      // Invalidate the combined cart query
      queryClient.invalidateQueries({
        queryKey: cartQueryKeys.all(
          variables.userId || "",
          variables.sessionId
        ),
      });
    },
    onError: (error) => {
      console.error("Clear cart error:", error);
    },
  });
}
```

---

## Impact on `use-cart.ts`

The `clearCart` function in `use-cart.ts` will need to be updated:

**Before**:

```typescript
const clearCart = async () => {
  if (!user?.id) return;
  return clearCartMutation.mutateAsync(user.id);
};
```

**After**:

```typescript
const clearCart = async () => {
  return clearCartMutation.mutateAsync({
    userId: user?.id,
    sessionId: user?.id ? undefined : sessionId,
  });
};
```

---

## Summary

### Changes Required:

1. ✅ Fix `useClearCart()` to use `cartQueryKeys.all()` instead of deleted keys
2. ✅ Add guest user support to `useClearCart()` with `sessionId` parameter
3. ✅ Update `use-cart.ts` to pass object instead of just userId

### Benefits:

- 🔧 **Fixes broken code** - No more references to deleted query keys
- 🔐 **Guest support** - Guests can now clear their cart
- 🎯 **Consistency** - All cart mutations follow the same pattern
- 📦 **Better UX** - Cart clearing works for all user types

### Files to Update:

1. `src/services/cart/use-cart-mutation.ts` - Update `useClearCart()`
2. `src/hooks/use-cart.ts` - Update `clearCart()` function



