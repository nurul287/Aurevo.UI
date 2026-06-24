import { api } from "@/lib/api";
import { CartItem } from "@/services/types";
import { useQuery } from "@tanstack/react-query";
import { computeCartTotals } from "./cart-totals";

export const cartQueryKeys = {
  all: (userId: string, sessionId?: string) =>
    ["cart", "all", userId, sessionId] as const,
} as const;

export type CartData = {
  items: CartItem[];
  total: number;
  itemCount: number;
};

type BeCartItem = {
  id: string;
  quantity: number;
  price: string | number;
  product_id: string;
  variant_id: string;
  product?: Record<string, unknown>;
  variant?: Record<string, unknown>;
};

/** Fetch cart from BE API (shared by React Query and Meta Pixel tracking). */
export async function fetchCartData(
  userId?: string,
  sessionId?: string
): Promise<CartData> {
  if (!userId && !sessionId) {
    return { items: [], total: 0, itemCount: 0 };
  }

  const data = await api.get<{ items: BeCartItem[] }>("/cart", {
    guestSessionId: sessionId,
    skipAuth: !userId,
  });

  const items = (data?.items ?? []) as CartItem[];
  const { value: total } = computeCartTotals(items);

  return {
    items,
    total,
    itemCount: items.length,
  };
}

export function useCartData(userId?: string, sessionId?: string) {
  const isEnabled = !!(userId || sessionId);

  return useQuery({
    queryKey: cartQueryKeys.all(userId || "", sessionId),
    queryFn: () => fetchCartData(userId, sessionId),
    enabled: isEnabled,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });
}
