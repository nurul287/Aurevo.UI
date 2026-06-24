import { api, apiFetchList } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

export interface InventoryRecord {
  id: string;
  variant_id: string;
  location: string;
  quantity: number;
  reserved_quantity: number;
  available_quantity: number;
  reorder_point: number;
  reorder_quantity: number;
  low_stock_threshold?: number;
  product_variants: {
    id: string;
    name: string;
    sku: string;
    size?: string;
    color?: string;
    price?: number;
    is_active?: boolean;
    products: { id: string; name: string; base_price?: number; is_active?: boolean; low_stock_threshold: number };
  };
}

export interface InventoryMovement {
  id: string;
  variant_id: string;
  movement_type:
    | "restock"
    | "sale"
    | "reserve"
    | "unreserve"
    | "cancel"
    | "return"
    | "adjustment"
    | "damage"
    | "theft"
    | "transfer";
  reason: string;
  quantity: number;
  previous_quantity: number;
  new_quantity: number;
  reserved_quantity: number;
  location: string;
  order_id?: string;
  order_item_id?: string;
  user_id?: string;
  reference_number?: string;
  notes?: string;
  cost_per_unit?: number;
  total_cost?: number;
  created_at: string;
  product_variants?: {
    id: string;
    name: string;
    sku: string;
    size?: string;
    color?: string;
    products?: { id: string; name: string };
  };
}

export interface LowStockItem {
  product_id: string;
  product_name: string;
  variant_id: string;
  variant_name: string;
  current_stock: number;
  low_stock_threshold: number;
  reorder_point: number;
  reorder_quantity: number;
}

export interface InventorySummary {
  product_id: string;
  total_stock: number;
  total_reserved: number;
  total_available: number;
  low_stock_variants: number;
  total_variants: number;
  variants: Array<{
    variant_id: string;
    variant_name: string;
    sku: string;
    size?: string;
    color?: string;
    stock_quantity: number;
    reserved_quantity: number;
    available_quantity: number;
    reorder_point: number;
    reorder_quantity: number;
    low_stock_threshold: number;
    is_low_stock: boolean;
  }>;
}

export function useInventoryMovements(variantId: string, limit = 50) {
  return useQuery({
    queryKey: ["inventory-movements", variantId, limit],
    queryFn: async (): Promise<InventoryMovement[]> => {
      const { data } = await apiFetchList<InventoryMovement>(
        `/inventory/movements?variantId=${variantId}&limit=${limit}`
      );
      return data;
    },
    enabled: !!variantId,
  });
}

export function useAllInventoryMovements(filters?: {
  movement_type?: string;
  reason?: string;
  date_from?: string;
  date_to?: string;
  limit?: number;
}) {
  return useQuery({
    queryKey: ["inventory-movements", filters],
    queryFn: async (): Promise<InventoryMovement[]> => {
      const q = new URLSearchParams();
      if (filters?.movement_type) q.set("movementType", filters.movement_type);
      if (filters?.limit) q.set("limit", String(filters.limit));
      const { data } = await apiFetchList<InventoryMovement>(
        `/inventory/movements${q.toString() ? `?${q}` : ""}`
      );
      return data;
    },
  });
}

export function useLowStockItems() {
  return useQuery({
    queryKey: ["low-stock-items"],
    queryFn: async (): Promise<LowStockItem[]> => {
      const { data } = await apiFetchList<LowStockItem>("/inventory/low-stock");
      return data;
    },
  });
}

export function useInventorySummary(productId: string) {
  return useQuery({
    queryKey: ["inventory-summary", productId],
    queryFn: async (): Promise<InventorySummary | null> => {
      // No dedicated summary endpoint — derive from inventory list filtered by product
      // This returns InventoryRecord[] per-variant; components that need InventorySummary
      // shape may need to adapt or a future BE endpoint can be added
      const { data } = await apiFetchList<InventoryRecord>(`/inventory?limit=1000`);
      const variants = data.filter(
        (r) => (r.product_variants as { products?: { id?: string } })?.products?.id === productId
      );
      if (!variants.length) return null;
      return {
        product_id: productId,
        total_stock: variants.reduce((s, v) => s + v.quantity, 0),
        total_reserved: variants.reduce((s, v) => s + (v.reserved_quantity ?? 0), 0),
        total_available: variants.reduce((s, v) => s + (v.available_quantity ?? v.quantity), 0),
        low_stock_variants: variants.filter(
          (v) => v.available_quantity <= (v.reorder_point ?? 0)
        ).length,
        total_variants: variants.length,
        variants: variants.map((v) => ({
          variant_id: v.variant_id,
          variant_name: v.product_variants?.name ?? "",
          sku: v.product_variants?.sku ?? "",
          size: v.product_variants?.size,
          color: v.product_variants?.color,
          stock_quantity: v.quantity,
          reserved_quantity: v.reserved_quantity ?? 0,
          available_quantity: v.available_quantity ?? v.quantity,
          reorder_point: v.reorder_point ?? 0,
          reorder_quantity: v.reorder_quantity ?? 0,
          low_stock_threshold: v.low_stock_threshold ?? 0,
          is_low_stock: (v.available_quantity ?? v.quantity) <= (v.reorder_point ?? 0),
        })),
      };
    },
    enabled: !!productId,
  });
}

export function useInventoryLevels() {
  return useQuery({
    queryKey: ["inventory-levels"],
    queryFn: async (): Promise<InventoryRecord[]> => {
      const { data } = await apiFetchList<InventoryRecord>("/inventory?limit=1000");
      return data.sort((a, b) => {
        const nameA = (a.product_variants as { products?: { name?: string } })?.products?.name ?? "";
        const nameB = (b.product_variants as { products?: { name?: string } })?.products?.name ?? "";
        return nameA.localeCompare(nameB);
      });
    },
  });
}

export function useOrderInventoryMovements(orderId: string) {
  return useQuery({
    queryKey: ["order-inventory-movements", orderId],
    queryFn: async (): Promise<InventoryMovement[]> => {
      const { data } = await apiFetchList<InventoryMovement>(
        `/inventory/movements?orderId=${orderId}`
      );
      return data;
    },
    enabled: !!orderId,
  });
}

export function useInventoryStats() {
  return useQuery({
    queryKey: ["inventory-stats"],
    queryFn: async () => {
      const [inventoryResult, lowStockResult] = await Promise.all([
        apiFetchList<InventoryRecord>("/inventory?limit=5000"),
        apiFetchList<LowStockItem>("/inventory/low-stock"),
      ]);

      const stockRecords = inventoryResult.data;
      const lowStockItems = lowStockResult.data;

      const totalValue = stockRecords.reduce((sum, item) => {
        const qty = Number(item.quantity) || 0;
        const variantPrice = Number(item.product_variants?.price) || 0;
        const basePrice = Number(
          (item.product_variants as { products?: { base_price?: number } })?.products?.base_price
        ) || 0;
        const unit = variantPrice > 0 ? variantPrice : basePrice;
        return sum + qty * unit;
      }, 0);

      return {
        totalStockValue: totalValue,
        lowStockCount: lowStockItems.length,
        totalVariants: stockRecords.length,
        totalStockQuantity: stockRecords.reduce((s, r) => s + (Number(r.quantity) || 0), 0),
      };
    },
  });
}

/** Fetch inventory record for a specific variant (needed for adjust mutations). */
export async function fetchInventoryByVariantId(
  variantId: string
): Promise<InventoryRecord | null> {
  const data = await api.get<{ items: InventoryRecord[] }>(
    `/inventory?variantId=${variantId}&limit=1`
  );
  return (data as unknown as { items: InventoryRecord[] })?.items?.[0] ?? null;
}
