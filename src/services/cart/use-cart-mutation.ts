import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import type { CartItem } from "@/services/types";
import { getCartLineUnitPrice } from "./cart-totals";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { cartQueryKeys, type CartData } from "./use-cart-query";

export function useAddToCart() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: async ({
      userId,
      sessionId,
      productId,
      variantId,
      quantity = 1,
      suppressToast: _suppressToast = false,
    }: {
      userId?: string;
      sessionId?: string;
      productId: string;
      variantId: string;
      quantity?: number;
      suppressToast?: boolean;
    }) => {
      return api.post<CartItem>(
        "/cart/items",
        { productId, variantId, quantity },
        { guestSessionId: sessionId, skipAuth: !userId }
      );
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: cartQueryKeys.all(variables.userId || "", variables.sessionId),
      });

      if (!variables.suppressToast) {
        const productName =
          (data as { product?: { name?: string } })?.product?.name || "Product";
        showSuccess("Added to cart!", `${productName} has been added to your cart`);
      }
    },
    onError: (error: Error) => {
      showError(
        "Failed to add to cart",
        error.message || "Something went wrong. Please try again."
      );
    },
  });
}

export function useUpdateCartItemQuantity() {
  const queryClient = useQueryClient();
  const { showError, showSuccess } = useToast();

  return useMutation({
    mutationFn: async ({
      itemId,
      quantity,
      userId,
      sessionId,
    }: {
      itemId: string;
      quantity: number;
      userId?: string;
      sessionId?: string;
    }) => {
      if (quantity <= 0) {
        await api.delete(
          `/cart/items/${itemId}`,
          { guestSessionId: sessionId, skipAuth: !userId }
        );
        return null;
      }

      return api.patch<CartItem>(
        `/cart/items/${itemId}`,
        { quantity },
        { guestSessionId: sessionId, skipAuth: !userId }
      );
    },
    onMutate: async ({ itemId, quantity, userId, sessionId }) => {
      await queryClient.cancelQueries({
        queryKey: cartQueryKeys.all(userId || "", sessionId),
      });

      const previousCartData = queryClient.getQueryData<CartData>(
        cartQueryKeys.all(userId || "", sessionId)
      );

      queryClient.setQueryData(
        cartQueryKeys.all(userId || "", sessionId),
        (old: CartData | undefined) => {
          if (!old) return old;

          const updatedItems = old.items.map((item) =>
            item.id === itemId ? { ...item, quantity } : item
          );

          const total = updatedItems.reduce(
            (sum, item: CartItem) =>
              sum + getCartLineUnitPrice(item) * item.quantity,
            0
          );

          return { ...old, items: updatedItems, total, itemCount: updatedItems.length };
        }
      );

      return { previousCartData };
    },
    onSuccess: (data) => {
      if (data) {
        const productName =
          (data as { product?: { name?: string } })?.product?.name || "Item";
        showSuccess("Quantity updated", `${productName} quantity has been updated`);
      }
    },
    onError: (err: Error, variables, context) => {
      if (context?.previousCartData) {
        queryClient.setQueryData(
          cartQueryKeys.all(variables.userId || "", variables.sessionId),
          context.previousCartData
        );
      }
      showError(
        "Failed to update quantity",
        err.message || "Something went wrong. Please try again."
      );
    },
    onSettled: (_, __, variables) => {
      queryClient.invalidateQueries({
        queryKey: cartQueryKeys.all(variables.userId || "", variables.sessionId),
      });
    },
  });
}

export function useRemoveFromCart() {
  const queryClient = useQueryClient();
  const { showError } = useToast();

  return useMutation({
    mutationFn: async ({
      itemId,
      userId,
      sessionId,
    }: {
      itemId: string;
      userId?: string;
      sessionId?: string;
    }) => {
      await api.delete(
        `/cart/items/${itemId}`,
        { guestSessionId: sessionId, skipAuth: !userId }
      );
    },
    onMutate: async ({ itemId, userId, sessionId }) => {
      await queryClient.cancelQueries({
        queryKey: cartQueryKeys.all(userId || "", sessionId),
      });

      const previousCartData = queryClient.getQueryData(
        cartQueryKeys.all(userId || "", sessionId)
      );

      queryClient.setQueryData(
        cartQueryKeys.all(userId || "", sessionId),
        (old: CartData | undefined) => {
          if (!old) return old;

          const updatedItems = old.items.filter((item) => item.id !== itemId);
          const total = updatedItems.reduce((sum, item: CartItem) => {
            const variantPrice = (item.variant as { price?: number })?.price;
            const productPrice = (item.product as { base_price?: number })?.base_price;
            const price = variantPrice || productPrice || item.price || 0;
            return sum + price * item.quantity;
          }, 0);

          return { ...old, items: updatedItems, total, itemCount: updatedItems.length };
        }
      );

      return { previousCartData };
    },
    onError: (err: Error, variables, context) => {
      if (context?.previousCartData) {
        queryClient.setQueryData(
          cartQueryKeys.all(variables.userId || "", variables.sessionId),
          context.previousCartData
        );
      }
      showError(
        "Failed to remove item",
        err.message || "Something went wrong. Please try again."
      );
    },
    onSettled: (_, __, variables) => {
      queryClient.invalidateQueries({
        queryKey: cartQueryKeys.all(variables.userId || "", variables.sessionId),
      });
    },
  });
}

export function useClearCart() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: async ({
      userId,
      sessionId,
    }: {
      userId?: string;
      sessionId?: string;
    }) => {
      await api.delete("/cart", { guestSessionId: sessionId, skipAuth: !userId });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: cartQueryKeys.all(variables.userId || "", variables.sessionId),
      });
      showSuccess("Cart cleared!", "All items have been removed from your cart");
    },
    onError: (error: Error) => {
      showError(
        "Failed to clear cart",
        error.message || "Something went wrong. Please try again."
      );
    },
  });
}

export function useMigrateGuestCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      sessionId,
      userId: _userId,
    }: {
      sessionId: string;
      userId: string;
    }) => {
      await api.post("/cart/migrate", { sessionId });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: cartQueryKeys.all("", variables.sessionId),
      });
      queryClient.invalidateQueries({
        queryKey: cartQueryKeys.all(variables.userId),
      });
    },
    onError: (error: Error) => {
      console.error("Migrate guest cart error:", error);
    },
  });
}

export function useCartMutations() {
  const addToCart = useAddToCart();
  const updateQuantity = useUpdateCartItemQuantity();
  const removeFromCart = useRemoveFromCart();
  const clearCart = useClearCart();
  const migrateGuestCart = useMigrateGuestCart();

  return { addToCart, updateQuantity, removeFromCart, clearCart, migrateGuestCart };
}
