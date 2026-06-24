import { api, apiFetchList } from "@/lib/api";
import { Order } from "@/services/types";
import { useQuery } from "@tanstack/react-query";

export const userQueryKeys = {
  orders: (userId: string) => ["user", "orders", userId] as const,
  order: (userId: string, orderId: string) =>
    ["user", "order", userId, orderId] as const,
  profile: (userId: string) => ["user", "profile", userId] as const,
} as const;

export function useUserOrders(userId: string) {
  return useQuery({
    queryKey: userQueryKeys.orders(userId),
    queryFn: async (): Promise<Order[]> => {
      const { data } = await apiFetchList<Order>("/orders?limit=100");
      return data;
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useUserOrder(userId: string, orderId: string) {
  return useQuery({
    queryKey: userQueryKeys.order(userId, orderId),
    queryFn: async (): Promise<Order | null> => {
      try {
        return await api.get<Order>(`/orders/${orderId}`);
      } catch (err: unknown) {
        if ((err as { status?: number }).status === 404) return null;
        throw err;
      }
    },
    enabled: !!userId && !!orderId,
    staleTime: 5 * 60 * 1000,
  });
}
