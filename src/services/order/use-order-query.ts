import { api, apiFetchList } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { Order, OrderItem, PaginatedResponse, Payment } from "../types";

export interface AdminOrdersParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  paymentStatus?: string;
}

export const orderQueryKeys = {
  orders: (params: AdminOrdersParams) => ["orders", "list", params] as const,
  order: (id: string) => ["orders", "detail", id] as const,
  orderItems: (orderId: string) => ["orders", "items", orderId] as const,
  orderPayments: (orderId: string) => ["orders", "payments", orderId] as const,
} as const;

export function useOrders(params: AdminOrdersParams = {}) {
  const { page = 1, limit = 20, search, status, paymentStatus } = params;
  const qs = new URLSearchParams();
  qs.set("page", String(page));
  qs.set("limit", String(limit));
  if (search) qs.set("search", search);
  if (status && status !== "all") qs.set("status", status);
  if (paymentStatus && paymentStatus !== "all") qs.set("paymentStatus", paymentStatus);

  return useQuery({
    queryKey: orderQueryKeys.orders(params),
    queryFn: async (): Promise<PaginatedResponse<Order>> => {
      const { data, pagination } = await apiFetchList<Order>(`/orders?${qs.toString()}`);
      return {
        data,
        count: pagination.total,
        page: pagination.page,
        limit: pagination.limit,
        totalPages: pagination.totalPages,
      };
    },
    staleTime: 30 * 1000,
  });
}

type OrderUser = { id?: string; first_name?: string; last_name?: string; phone?: string; name?: string } | null;

export function useOrder(orderId: string) {
  return useQuery({
    queryKey: orderQueryKeys.order(orderId),
    queryFn: (): Promise<Order & { user?: OrderUser }> =>
      api.get<Order & { user?: OrderUser }>(`/orders/${orderId}`),
    enabled: !!orderId,
    staleTime: 5 * 60 * 1000,
  });
}

type OrderItemProduct = { id?: string; name?: string; slug?: string } | null;
type OrderItemVariant = { id?: string; name?: string; size?: string; color?: string } | null;

export function useOrderItems(orderId: string) {
  return useQuery({
    queryKey: orderQueryKeys.orderItems(orderId),
    queryFn: async (): Promise<(OrderItem & { product?: OrderItemProduct; variant?: OrderItemVariant })[]> => {
      const { data } = await apiFetchList<OrderItem & { product?: OrderItemProduct; variant?: OrderItemVariant }>(
        `/orders/${orderId}/items`
      );
      return data;
    },
    enabled: !!orderId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useOrderPayments(orderId: string) {
  return useQuery({
    queryKey: orderQueryKeys.orderPayments(orderId),
    queryFn: async (): Promise<Payment[]> => {
      const { data } = await apiFetchList<Payment>(`/orders/${orderId}/payments`);
      return data;
    },
    enabled: !!orderId,
    staleTime: 5 * 60 * 1000,
  });
}


export function useFetchOrderWithGuestToken(orderId: string, guestToken?: string) {
  return useQuery({
    queryKey: ["orders", "guest", orderId, guestToken],
    queryFn: (): Promise<Order & { user?: OrderUser; items?: unknown[] }> => {
      const url = guestToken
        ? `/orders/${orderId}?guestToken=${encodeURIComponent(guestToken)}`
        : `/orders/${orderId}`;
      return api.get<Order & { user?: OrderUser; items?: unknown[] }>(url);
    },
    enabled: !!orderId,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}

export interface OrderStats {
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  confirmedOrders: number;
  processingOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  refundedOrders: number;
}

export function useOrderStats() {
  return useQuery({
    queryKey: ["orders", "stats"],
    queryFn: () => api.get<OrderStats>("/orders/stats"),
    staleTime: 2 * 60 * 1000,
  });
}
