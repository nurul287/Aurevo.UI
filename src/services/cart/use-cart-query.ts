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
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });
}
