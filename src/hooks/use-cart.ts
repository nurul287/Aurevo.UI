import { useAuth } from "@/contexts/auth-context";
import { useGuestCart } from "@/contexts/guest-cart-context";
import {
  useAddToCart,
  useCartData,
  useClearCart,
  useRemoveFromCart,
  useUpdateCartItemQuantity,
} from "@/services";
import { useMemo } from "react";

/**
 * Custom hook that provides a unified cart interface using TanStack Query
 */
export function useCart() {
  const { user } = useAuth();
  const { sessionId } = useGuestCart();

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
    quantity: number = 1
  ) => {
    return addToCartMutation.mutateAsync({
      userId: user?.id,
      sessionId: user?.id ? undefined : sessionId,
      productId,
      variantId,
      quantity,
    });
  };

  const updateItemQuantity = async (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      return removeItem(itemId);
    }

    return updateQuantityMutation.mutateAsync({
      userId: user?.id,
      sessionId: user?.id ? undefined : sessionId,
      itemId,
      quantity,
    });
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
