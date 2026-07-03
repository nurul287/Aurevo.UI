import { useAuth } from "@/contexts/auth-context";
import { useGuestCart } from "@/contexts/guest-cart-context";
import { useToast } from "@/hooks/use-toast";
import { trackMetaPixelAddToCartAfterChange } from "@/lib/meta-pixel";
import {
  cartQueryKeys,
  fetchVariantsAvailableQuantities,
  useAddToCart,
  useCartData,
  useClearCart,
  useRemoveFromCart,
  useUpdateCartItemQuantity,
  type CartData,
} from "@/services";
import { useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";

/**
 * Pre-add/update stock checks used to hit `/inventory/availability` via a
 * raw fetch, bypassing React Query's cache. That's a real duplicate
 * network call whenever CartSidePanel's batch availability query (same
 * endpoint, keyed `["inventory","available","batch",...]`) fires right
 * after — e.g. addItem() opens the panel immediately on success. Using
 * the same key shape here lets a single-item cart share that cache
 * entry instead of fetching it twice.
 */
async function fetchAvailableUnitsCached(
  queryClient: ReturnType<typeof useQueryClient>,
  variantId: string,
): Promise<number | null> {
  const map = await queryClient.fetchQuery({
    queryKey: ["inventory", "available", "batch", variantId],
    queryFn: () => fetchVariantsAvailableQuantities([variantId]),
    staleTime: 30 * 1000,
  });
  return map[variantId] ?? null;
}

/**
 * Custom hook that provides a unified cart interface using TanStack Query
 */
export function useCart() {
  const { user } = useAuth();
  const { sessionId, openCartPanel } = useGuestCart();
  const queryClient = useQueryClient();
  const { showError } = useToast();

  // Memoize query parameters to prevent unnecessary re-renders
  const queryParams = useMemo(
    () => ({
      userId: user?.id,
      sessionId: user?.id ? undefined : sessionId,
    }),
    [user?.id, sessionId]
  );

  // Use the optimized combined query instead of 3 separate queries
  const {
    data: cartData,
    isLoading: cartLoading,
    error: cartError,
  } = useCartData(queryParams.userId, queryParams.sessionId);

  // Extract data from the combined query
  const cartItems = cartData?.items || [];
  const cartTotal = cartData?.total || 0;
  const itemCount = cartData?.itemCount || 0;

  // Mutations
  const addToCartMutation = useAddToCart();
  const updateQuantityMutation = useUpdateCartItemQuantity();
  const removeItemMutation = useRemoveFromCart();
  const clearCartMutation = useClearCart();

  const addItem = async (
    productId: string,
    variantId: string,
    quantity: number = 1,
    options: { suppressToast?: boolean; trackPixel?: boolean } = {},
  ) => {
    const { suppressToast = false, trackPixel = true } = options;

    const prevCart = queryClient.getQueryData<CartData>(
      cartQueryKeys.all(queryParams.userId || "", queryParams.sessionId),
    );
    const existingQty =
      prevCart?.items.find((item) => item.variant_id === variantId)
        ?.quantity ?? 0;

    const available = await fetchAvailableUnitsCached(queryClient, variantId);
    if (available !== null && existingQty + quantity > available) {
      const remaining = Math.max(0, available - existingQty);
      showError(
        "Not enough stock",
        remaining > 0
          ? `Only ${remaining} more can be added (${available} in stock).`
          : `Only ${available} in stock for this size.`,
      );
      throw new Error("Insufficient inventory");
    }

    const result = await addToCartMutation.mutateAsync({
      userId: user?.id,
      sessionId: user?.id ? undefined : sessionId,
      productId,
      variantId,
      quantity,
      suppressToast,
    });

    if (trackPixel) {
      await trackMetaPixelAddToCartAfterChange(
        queryParams.userId,
        queryParams.sessionId,
      );
    }

    openCartPanel();
    return result;
  };

  const updateItemQuantity = async (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      return removeItem(itemId);
    }

    const prevCart = queryClient.getQueryData<CartData>(
      cartQueryKeys.all(queryParams.userId || "", queryParams.sessionId),
    );
    const prevQty =
      prevCart?.items.find((item) => item.id === itemId)?.quantity ?? 0;

    if (quantity > prevQty) {
      const line = prevCart?.items.find((item) => item.id === itemId);
      if (line?.variant_id) {
        const available = await fetchAvailableUnitsCached(queryClient, line.variant_id);
        if (available !== null && quantity > available) {
          showError(
            "Not enough stock",
            `Only ${available} available for this item.`,
          );
          throw new Error("Insufficient inventory");
        }
      }
    }

    const result = await updateQuantityMutation.mutateAsync({
      userId: user?.id,
      sessionId: user?.id ? undefined : sessionId,
      itemId,
      quantity,
    });

    if (quantity > prevQty) {
      await trackMetaPixelAddToCartAfterChange(
        queryParams.userId,
        queryParams.sessionId,
      );
    }

    return result;
  };

  const removeItem = async (itemId: string) => {
    return removeItemMutation.mutateAsync({
      userId: user?.id,
      sessionId: user?.id ? undefined : sessionId,
      itemId,
    });
  };

  const clearCart = async () => {
    return clearCartMutation.mutateAsync({
      userId: user?.id,
      sessionId: user?.id ? undefined : sessionId,
    });
  };

  return {
    // State
    cartItems,
    cartTotal,
    itemCount,
    loading: cartLoading,
    error: cartError,

    // Actions
    addItem,
    updateItemQuantity,
    removeItem,
    clearCart,

    // Mutation states
    isAddingToCart: addToCartMutation.isPending,
    isUpdatingQuantity: updateQuantityMutation.isPending,
    isRemovingItem: removeItemMutation.isPending,
    isClearingCart: clearCartMutation.isPending,
  };
}
