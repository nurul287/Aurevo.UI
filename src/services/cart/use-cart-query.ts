import { supabase } from "@/lib/supabase";
import { CartItem } from "@/services/types";
import { useQuery } from "@tanstack/react-query";
import { computeCartTotals } from "./cart-totals";

// Query keys for consistent cache management
export const cartQueryKeys = {
  all: (userId: string, sessionId?: string) =>
    ["cart", "all", userId, sessionId] as const,
} as const;

export type CartData = {
  items: CartItem[];
  total: number;
  itemCount: number;
};

/** Fetch cart from Supabase (shared by React Query and Meta Pixel tracking). */
export async function fetchCartData(
  userId?: string,
  sessionId?: string,
): Promise<CartData> {
  if (!userId && !sessionId) {
    return { items: [], total: 0, itemCount: 0 };
  }

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
        `,
    )
    .order("created_at", { ascending: false });

  if (userId) {
    query = query.eq("user_id", userId);
  } else if (sessionId) {
    query = query.eq("session_id", sessionId);
  }

  const { data: cartItems, error } = await query;

  if (error) {
    console.error("❌ Error fetching cart data:", error);
    throw error;
  }

  const items = (cartItems || []) as CartItem[];
  const { value: total } = computeCartTotals(items);

  return {
    items,
    total,
    itemCount: items.length,
  };
}

/**
 * Combined hook to get all cart data in a single query
 * This reduces API calls from 3 separate queries to 1
 * Supports both authenticated users (userId) and guests (sessionId)
 */
export function useCartData(userId?: string, sessionId?: string) {
  const isEnabled = !!(userId || sessionId);

  return useQuery({
    queryKey: cartQueryKeys.all(userId || "", sessionId),
    queryFn: () => fetchCartData(userId, sessionId),
    enabled: isEnabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });
}
