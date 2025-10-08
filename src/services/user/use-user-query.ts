import { supabase } from "@/lib/supabase";
import { Order } from "@/services/types";
import { useQuery } from "@tanstack/react-query";

// Query keys for consistent cache management
export const userQueryKeys = {
  orders: (userId: string) => ["user", "orders", userId] as const,
  order: (userId: string, orderId: string) =>
    ["user", "order", userId, orderId] as const,
} as const;

// Note: useUserProfile is available from auth service
// Use: import { useUserProfile } from "@/services/auth"

/**
 * Hook to get user orders
 */
export function useUserOrders(userId: string) {
  return useQuery({
    queryKey: userQueryKeys.orders(userId),
    queryFn: async (): Promise<Order[]> => {
      const { data, error } = await supabase
        .from("orders")
        .select(
          `
          *,
          order_items(
            *,
            product:products(*),
            variant:product_variants(*)
          )
        `
        )
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to get a specific user order
 */
export function useUserOrder(userId: string, orderId: string) {
  return useQuery({
    queryKey: userQueryKeys.order(userId, orderId),
    queryFn: async (): Promise<Order | null> => {
      const { data, error } = await supabase
        .from("orders")
        .select(
          `
          *,
          order_items(
            *,
            product:products(*),
            variant:product_variants(*)
          )
        `
        )
        .eq("id", orderId)
        .eq("user_id", userId)
        .single();

      if (error) {
        if (error.code === "PGRST116") return null; // Order doesn't exist
        throw error;
      }

      return data;
    },
    enabled: !!userId && !!orderId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
