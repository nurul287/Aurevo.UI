import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { cartQueryKeys } from "./use-cart-query";

/**
 * Hook for adding item to cart
 */
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
      console.log("🛒 Adding to cart:", {
        userId,
        sessionId,
        productId,
        variantId,
        quantity,
      });

      // Debug: Check if variant exists
      const { data: variantCheck, error: variantCheckError } = await supabase
        .from("product_variants")
        .select("*")
        .eq("id", variantId)
        .single();

      console.log("🔍 Variant check:", variantCheck);
      console.log("❌ Variant check error:", variantCheckError);

      if (variantCheckError) {
        console.error("❌ Variant not found:", variantCheckError);
        throw new Error(`Variant with id ${variantId} not found`);
      }

      // Get variant price for cart
      const { data: variantData, error: variantError } = await supabase
        .from("product_variants")
        .select("price")
        .eq("id", variantId)
        .single();

      if (variantError) {
        console.error("❌ Error fetching variant price:", variantError);
        throw variantError;
      }

      // First, try to get existing item
      let query = supabase
        .from("cart_items")
        .select("*")
        .eq("variant_id", variantId);

      if (userId) {
        query = query.eq("user_id", userId);
      } else if (sessionId) {
        query = query.eq("session_id", sessionId);
      } else {
        throw new Error("Either userId or sessionId must be provided");
      }

      const { data: existingItems, error: checkError } = await query;

      if (checkError) {
        console.error("❌ Error checking existing cart items:", checkError);
        throw checkError;
      }

      const existingItem = existingItems?.[0];

      if (existingItem) {
        // Update existing item quantity
        const { data, error } = await supabase
          .from("cart_items")
          .update({
            quantity: existingItem.quantity + quantity,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingItem.id)
          .select(
            `
            *,
            product:products!product_id(*),
            variant:product_variants!variant_id(*)
          `
          )
          .single();

        if (error) {
          console.error("❌ Error updating existing cart item:", error);
          throw error;
        }
        console.log("✅ Updated existing cart item:", data);
        return data;
      } else {
        // Insert new item
        const insertData: any = {
          product_id: productId,
          variant_id: variantId,
          quantity,
          price: variantData.price || 0,
        };

        if (userId) {
          insertData.user_id = userId;
        } else if (sessionId) {
          insertData.session_id = sessionId;
        }

        console.log("📝 Inserting cart item with data:", insertData);

        const { data, error } = await supabase
          .from("cart_items")
          .insert(insertData)
          .select(
            `
            *,
            product:products!product_id(*),
            variant:product_variants!variant_id(*)
          `
          )
          .single();

        console.log("📝 Insert result data:", data);
        console.log("❌ Insert result error:", error);

        if (error) {
          console.error("❌ Error inserting new cart item:", error);
          throw error;
        }
        console.log("✅ Inserted new cart item:", data);
        return data;
      }
    },
    onSuccess: (data, variables) => {
      // Invalidate only the combined cart query instead of 3 separate queries
      queryClient.invalidateQueries({
        queryKey: cartQueryKeys.all(
          variables.userId || "",
          variables.sessionId
        ),
      });

      // Show success toast only if not suppressed
      if (!variables.suppressToast) {
      const productName = data?.product?.name || "Product";
      showSuccess(
        "Added to cart!",
        `${productName} has been added to your cart`
      );
      }
    },
    onError: (error) => {
      console.error("Add to cart error:", error);
      showError(
        "Failed to add to cart",
        error.message || "Something went wrong. Please try again."
      );
    },
  });
}

/**
 * Hook for updating cart item quantity
 */
export function useUpdateCartItemQuantity() {
  const queryClient = useQueryClient();
  const { showError, showSuccess } = useToast();

  return useMutation({
    mutationFn: async ({
      itemId,
      quantity,
      userId: _userId,
      sessionId: _sessionId,
    }: {
      itemId: string;
      quantity: number;
      userId?: string;
      sessionId?: string;
    }) => {
      if (quantity <= 0) {
        // Remove item if quantity is 0 or negative
        const { error } = await supabase
          .from("cart_items")
          .delete()
          .eq("id", itemId);

        if (error) throw error;
        return null;
      }

      const { data, error } = await supabase
        .from("cart_items")
        .update({ quantity })
        .eq("id", itemId)
        .select(
          `
          *,
          product:products!product_id(*),
          variant:product_variants!variant_id(*)
        `
        )
        .single();

      if (error) throw error;
      return data;
    },
    onMutate: async ({ itemId, quantity, userId, sessionId }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: cartQueryKeys.all(userId || "", sessionId),
      });

      // Snapshot the previous value
      const previousCartData = queryClient.getQueryData(
        cartQueryKeys.all(userId || "", sessionId)
      );

      // Optimistically update the cart data
      queryClient.setQueryData(
        cartQueryKeys.all(userId || "", sessionId),
        (old: any) => {
          if (!old) return old;

          const updatedItems = old.items.map((item: any) =>
            item.id === itemId ? { ...item, quantity } : item
          );

          // Recalculate totals
          const total = updatedItems.reduce((sum: number, item: any) => {
            const variantPrice = item.variant?.price;
            const productPrice = item.product?.base_price;
            const price = variantPrice || productPrice || item.price || 0;
            return sum + price * item.quantity;
          }, 0);

          // Count unique products instead of total quantity
          const itemCount = updatedItems.length;

          return {
            ...old,
            items: updatedItems,
            total,
            itemCount,
          };
        }
      );

      // Return a context object with the snapshotted value
      return { previousCartData };
    },
    onSuccess: (data, _variables) => {
      // Show success toast for quantity update
      if (data) {
        const productName = data?.product?.name || "Item";
        showSuccess(
          "Quantity updated",
          `${productName} quantity has been updated`
        );
      }
    },
    onError: (err, variables, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousCartData) {
        queryClient.setQueryData(
          cartQueryKeys.all(variables.userId || "", variables.sessionId),
          context.previousCartData
        );
      }
      console.error("Update cart item quantity error:", err);
      showError(
        "Failed to update quantity",
        err.message || "Something went wrong. Please try again."
      );
    },
    onSettled: (_, __, variables) => {
      // Always refetch after error or success to ensure server state
      queryClient.invalidateQueries({
        queryKey: cartQueryKeys.all(
          variables.userId || "",
          variables.sessionId
        ),
      });
    },
  });
}

/**
 * Hook for removing item from cart
 */
export function useRemoveFromCart() {
  const queryClient = useQueryClient();
  const { showError } = useToast();

  return useMutation({
    mutationFn: async ({
      itemId,
      userId: _userId,
      sessionId: _sessionId,
    }: {
      itemId: string;
      userId?: string;
      sessionId?: string;
    }) => {
      const { error } = await supabase
        .from("cart_items")
        .delete()
        .eq("id", itemId);

      if (error) throw error;
    },
    onMutate: async ({ itemId, userId, sessionId }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: cartQueryKeys.all(userId || "", sessionId),
      });

      // Snapshot the previous value
      const previousCartData = queryClient.getQueryData(
        cartQueryKeys.all(userId || "", sessionId)
      );

      // Optimistically update the cart data
      queryClient.setQueryData(
        cartQueryKeys.all(userId || "", sessionId),
        (old: any) => {
          if (!old) return old;

          const updatedItems = old.items.filter(
            (item: any) => item.id !== itemId
          );

          // Recalculate totals
          const total = updatedItems.reduce((sum: number, item: any) => {
            const variantPrice = item.variant?.price;
            const productPrice = item.product?.base_price;
            const price = variantPrice || productPrice || item.price || 0;
            return sum + price * item.quantity;
          }, 0);

          // Count unique products instead of total quantity
          const itemCount = updatedItems.length;

          return {
            ...old,
            items: updatedItems,
            total,
            itemCount,
          };
        }
      );

      // Return a context object with the snapshotted value
      return { previousCartData };
    },
    onError: (err, variables, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousCartData) {
        queryClient.setQueryData(
          cartQueryKeys.all(variables.userId || "", variables.sessionId),
          context.previousCartData
        );
      }
      console.error("Remove from cart error:", err);
      showError(
        "Failed to remove item",
        err.message || "Something went wrong. Please try again."
      );
    },
    onSettled: (_, __, variables) => {
      // Always refetch after error or success to ensure server state
      queryClient.invalidateQueries({
        queryKey: cartQueryKeys.all(
          variables.userId || "",
          variables.sessionId
        ),
      });
    },
  });
}

/**
 * Hook for clearing entire cart
 * Supports both authenticated users and guests
 */
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

      showSuccess(
        "Cart cleared!",
        "All items have been removed from your cart"
      );
    },
    onError: (error) => {
      console.error("Clear cart error:", error);
      showError(
        "Failed to clear cart",
        error.message || "Something went wrong. Please try again."
      );
    },
  });
}

/**
 * Hook for migrating guest cart to user cart
 */
export function useMigrateGuestCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      sessionId,
      userId,
    }: {
      sessionId: string;
      userId: string;
    }) => {
      console.log("🔄 Migrating guest cart to user cart:", {
        sessionId,
        userId,
      });

      // Get all guest cart items
      const { data: guestCartItems, error: fetchError } = await supabase
        .from("cart_items")
        .select("*")
        .eq("session_id", sessionId);

      if (fetchError) {
        console.error("❌ Error fetching guest cart items:", fetchError);
        throw fetchError;
      }

      if (!guestCartItems || guestCartItems.length === 0) {
        console.log("📭 No guest cart items to migrate");
        return;
      }

      // Check for existing user cart items and merge quantities
      for (const guestItem of guestCartItems) {
        const { data: existingUserItem, error: checkError } = await supabase
          .from("cart_items")
          .select("*")
          .eq("user_id", userId)
          .eq("variant_id", guestItem.variant_id)
          .single();

        if (checkError && checkError.code !== "PGRST116") {
          // PGRST116 is "not found" error, which is expected
          console.error(
            "❌ Error checking existing user cart item:",
            checkError
          );
          continue;
        }

        if (existingUserItem) {
          // Update existing user cart item quantity
          const { error: updateError } = await supabase
            .from("cart_items")
            .update({
              quantity: existingUserItem.quantity + guestItem.quantity,
              updated_at: new Date().toISOString(),
            })
            .eq("id", existingUserItem.id);

          if (updateError) {
            console.error("❌ Error updating user cart item:", updateError);
            continue;
          }
        } else {
          // Create new user cart item
          const { error: insertError } = await supabase
            .from("cart_items")
            .insert({
              user_id: userId,
              product_id: guestItem.product_id,
              variant_id: guestItem.variant_id,
              quantity: guestItem.quantity,
              price: guestItem.price,
            });

          if (insertError) {
            console.error("❌ Error inserting user cart item:", insertError);
            continue;
          }
        }
      }

      // Delete guest cart items
      const { error: deleteError } = await supabase
        .from("cart_items")
        .delete()
        .eq("session_id", sessionId);

      if (deleteError) {
        console.error("❌ Error deleting guest cart items:", deleteError);
        throw deleteError;
      }

      console.log("✅ Successfully migrated guest cart to user cart");
    },
    onSuccess: (_, variables) => {
      // Invalidate both guest and user cart queries
      queryClient.invalidateQueries({
        queryKey: cartQueryKeys.all("", variables.sessionId),
      });
      queryClient.invalidateQueries({
        queryKey: cartQueryKeys.all(variables.userId),
      });
    },
    onError: (error) => {
      console.error("Migrate guest cart error:", error);
    },
  });
}

/**
 * Combined hook for all cart mutations
 */
export function useCartMutations() {
  const addToCart = useAddToCart();
  const updateQuantity = useUpdateCartItemQuantity();
  const removeFromCart = useRemoveFromCart();
  const clearCart = useClearCart();
  const migrateGuestCart = useMigrateGuestCart();

  return {
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    migrateGuestCart,
  };
}
