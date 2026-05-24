import { supabase } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";
import {
  Order,
  OrderItem,
  PaginatedResponse,
  PaginationParams,
  Payment,
} from "../types";

// Query keys for consistent cache management
export const orderQueryKeys = {
  orders: (params: PaginationParams) => ["orders", "list", params] as const,
  order: (id: string) => ["orders", "detail", id] as const,
  orderItems: (orderId: string) => ["orders", "items", orderId] as const,
  orderPayments: (orderId: string) => ["orders", "payments", orderId] as const,
  ordersByStatus: (status: string, params: PaginationParams) =>
    ["orders", "status", status, params] as const,
  ordersByUser: (userId: string, params: PaginationParams) =>
    ["orders", "user", userId, params] as const,
  searchOrders: (query: string, params: PaginationParams) =>
    ["orders", "search", query, params] as const,
} as const;

/**
 * Hook to get all orders with pagination
 */
export function useOrders(params: PaginationParams = {}) {
  return useQuery({
    queryKey: orderQueryKeys.orders(params),
    queryFn: async (): Promise<PaginatedResponse<Order>> => {
      const { page = 1, limit = 20 } = params;
      const offset = (page - 1) * limit;

      console.log("🔍 Fetching orders with pagination:", {
        page,
        limit,
        offset,
      });

      // Get total count
      const { count, error: countError } = await supabase
        .from("orders")
        .select("*", { count: "exact", head: true });

      if (countError) {
        console.error("❌ Error fetching orders count:", countError);
        throw countError;
      }

      // Get orders with user information
      const { data, error } = await supabase
        .from("orders")
        .select(
          `
          *,
          user:profiles(id, first_name, last_name),
          order_items(
            id,
            sku,
            product_name,
            variant_name,
            quantity,
            unit_price,
            total_price,
            variant:product_variants(sku)
          )
        `
        )
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error("❌ Error fetching orders:", error);
        throw error;
      }

      const totalPages = Math.ceil((count || 0) / limit);

      console.log("✅ Orders fetched:", {
        items: data?.length || 0,
        total: count || 0,
        page,
        totalPages,
      });

      return {
        data: data || [],
        count: count || 0,
        page,
        limit,
        totalPages,
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to get a single order by ID
 */
export function useOrder(orderId: string) {
  return useQuery({
    queryKey: orderQueryKeys.order(orderId),
    queryFn: async (): Promise<Order & { user?: any }> => {
      console.log("🔍 Fetching order:", orderId);

      const { data, error } = await supabase
        .from("orders")
        .select(
          `
          *,
          user:profiles(id, first_name, last_name, phone)
        `
        )
        .eq("id", orderId)
        .single();

      if (error) {
        console.error("❌ Error fetching order:", error);
        throw error;
      }

      console.log("✅ Order fetched:", data);
      return data;
    },
    enabled: !!orderId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to get order items
 */
export function useOrderItems(orderId: string) {
  return useQuery({
    queryKey: orderQueryKeys.orderItems(orderId),
    queryFn: async (): Promise<
      (OrderItem & { product?: any; variant?: any })[]
    > => {
      console.log("🔍 Fetching order items for order:", orderId);

      const { data, error } = await supabase
        .from("order_items")
        .select(
          `
          *,
          product:products(id, name, slug),
          variant:product_variants(id, name, size, color)
        `
        )
        .eq("order_id", orderId)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("❌ Error fetching order items:", error);
        throw error;
      }

      console.log("✅ Order items fetched:", data);
      return data || [];
    },
    enabled: !!orderId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to get order payments
 */
export function useOrderPayments(orderId: string) {
  return useQuery({
    queryKey: orderQueryKeys.orderPayments(orderId),
    queryFn: async (): Promise<Payment[]> => {
      console.log("🔍 Fetching payments for order:", orderId);

      const { data, error } = await supabase
        .from("payments")
        .select("*")
        .eq("order_id", orderId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("❌ Error fetching payments:", error);
        throw error;
      }

      console.log("✅ Payments fetched:", data);
      return data || [];
    },
    enabled: !!orderId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to get orders by status
 */
export function useOrdersByStatus(
  status: string,
  params: PaginationParams = {}
) {
  return useQuery({
    queryKey: orderQueryKeys.ordersByStatus(status, params),
    queryFn: async (): Promise<PaginatedResponse<Order>> => {
      const { page = 1, limit = 20 } = params;
      const offset = (page - 1) * limit;

      console.log("🔍 Fetching orders by status:", { status, page, limit });

      // Get total count
      const { count, error: countError } = await supabase
        .from("orders")
        .select("*", { count: "exact", head: true })
        .eq("status", status);

      if (countError) {
        console.error("❌ Error fetching orders count:", countError);
        throw countError;
      }

      // Get orders
      const { data, error } = await supabase
        .from("orders")
        .select(
          `
          *,
          user:profiles(id, first_name, last_name)
        `
        )
        .eq("status", status)
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error("❌ Error fetching orders by status:", error);
        throw error;
      }

      const totalPages = Math.ceil((count || 0) / limit);

      return {
        data: data || [],
        count: count || 0,
        page,
        limit,
        totalPages,
      };
    },
    enabled: !!status,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to search orders
 */
export function useSearchOrders(query: string, params: PaginationParams = {}) {
  return useQuery({
    queryKey: orderQueryKeys.searchOrders(query, params),
    queryFn: async (): Promise<PaginatedResponse<Order>> => {
      const { page = 1, limit = 20 } = params;
      const offset = (page - 1) * limit;

      console.log("🔍 Searching orders:", { query, page, limit });

      // Search by order number, email, or customer name
      const { data, error } = await supabase
        .from("orders")
        .select(
          `
          *,
          user:profiles(id, first_name, last_name),
          order_items(
            id,
            sku,
            product_name,
            variant_name,
            quantity,
            unit_price,
            total_price,
            variant:product_variants(sku)
          )
        `
        )
        .or(
          `order_number.ilike.%${query}%,email.ilike.%${query}%,user.first_name.ilike.%${query}%,user.last_name.ilike.%${query}%`
        )
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error("❌ Error searching orders:", error);
        throw error;
      }

      // Get count for pagination
      const { count } = await supabase
        .from("orders")
        .select("*", { count: "exact", head: true })
        .or(
          `order_number.ilike.%${query}%,email.ilike.%${query}%,user.first_name.ilike.%${query}%,user.last_name.ilike.%${query}%`
        );

      const totalPages = Math.ceil((count || 0) / limit);

      return {
        data: data || [],
        count: count || 0,
        page,
        limit,
        totalPages,
      };
    },
    enabled: !!query && query.length > 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to fetch order with guest token
 */
export function useFetchOrderWithGuestToken(
  orderId: string,
  guestToken?: string
) {
  return useQuery({
    queryKey: ["orders", "guest", orderId, guestToken],
    queryFn: async (): Promise<Order & { user?: any; items?: any[] }> => {
      console.log("🔍 Fetching order with guest token:", {
        orderId,
        guestToken,
      });

      if (guestToken) {
        const { data, error } = await supabase.rpc("get_guest_order", {
          p_order_id: orderId,
          p_guest_token: guestToken,
        });

        if (error) {
          console.error("❌ Error fetching guest order:", error);
          throw error;
        }

        if (!data) {
          throw new Error("Order not found or guest link has expired");
        }

        console.log("✅ Guest order fetched:", data);
        return data as Order & { order_items?: any[] };
      }

      const { data, error } = await supabase
        .from("orders")
        .select(
          `
          *,
          user:profiles(id, first_name, last_name, phone),
          order_items:order_items(
            *,
            product:products(
              id,
              name,
              slug,
              images:product_images(id, url, alt_text, is_primary, sort_order)
            ),
            variant:product_variants(id, name, size, color)
          )
        `
        )
        .eq("id", orderId)
        .single();

      if (error) {
        console.error("❌ Error fetching order:", error);
        throw error;
      }

      console.log("✅ Order fetched:", data);
      return data;
    },
    enabled: !!orderId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
  });
}

/**
 * Hook to get order statistics
 */
export function useOrderStats() {
  return useQuery({
    queryKey: ["orders", "stats"],
    queryFn: async () => {
      console.log("🔍 Fetching order statistics");

      // Get total orders count
      const { count: totalOrders } = await supabase
        .from("orders")
        .select("*", { count: "exact", head: true });

      // Get orders by status
      const { count: pendingOrders } = await supabase
        .from("orders")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending");

      const { count: processingOrders } = await supabase
        .from("orders")
        .select("*", { count: "exact", head: true })
        .eq("status", "processing");

      const { count: shippedOrders } = await supabase
        .from("orders")
        .select("*", { count: "exact", head: true })
        .eq("status", "shipped");

      const { count: deliveredOrders } = await supabase
        .from("orders")
        .select("*", { count: "exact", head: true })
        .eq("status", "delivered");

      // Get total revenue
      const { data: revenueData } = await supabase
        .from("orders")
        .select("total_amount")
        .eq("payment_status", "paid");

      const totalRevenue =
        revenueData?.reduce(
          (sum, order) => sum + (order.total_amount || 0),
          0
        ) || 0;

      const stats = {
        totalOrders: totalOrders || 0,
        pendingOrders: pendingOrders || 0,
        processingOrders: processingOrders || 0,
        shippedOrders: shippedOrders || 0,
        deliveredOrders: deliveredOrders || 0,
        totalRevenue,
      };

      console.log("✅ Order stats fetched:", stats);
      return stats;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}
