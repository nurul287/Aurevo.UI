import { supabase } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";

// Types
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
  reason:
    | "purchase_order"
    | "customer_order"
    | "checkout_reserve"
    | "payment_failed"
    | "order_cancelled"
    | "customer_return"
    | "damaged_goods"
    | "inventory_count"
    | "theft_loss"
    | "location_transfer"
    | "manual_adjustment";
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
    products: {
      id: string;
      name: string;
    };
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

// Get inventory movements for a variant
export function useInventoryMovements(variantId: string, limit = 50) {
  return useQuery({
    queryKey: ["inventory-movements", variantId, limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("inventory_movements")
        .select(
          `
          *,
          product_variants!inner(
            id,
            name,
            sku,
            size,
            color,
            products!inner(
              id,
              name
            )
          )
        `
        )
        .eq("variant_id", variantId)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data as InventoryMovement[];
    },
    enabled: !!variantId,
  });
}

// Get all inventory movements with filters
export function useAllInventoryMovements(filters?: {
  movement_type?: string;
  reason?: string;
  date_from?: string;
  date_to?: string;
  limit?: number;
}) {
  return useQuery({
    queryKey: ["inventory-movements", filters],
    queryFn: async () => {
      let query = supabase
        .from("inventory_movements")
        .select(
          `
          *,
          product_variants!inner(
            id,
            name,
            sku,
            size,
            color,
            products!inner(
              id,
              name
            )
          )
        `
        )
        .order("created_at", { ascending: false });

      if (filters?.movement_type) {
        query = query.eq("movement_type", filters.movement_type);
      }
      if (filters?.reason) {
        query = query.eq("reason", filters.reason);
      }
      if (filters?.date_from) {
        query = query.gte("created_at", filters.date_from);
      }
      if (filters?.date_to) {
        query = query.lte("created_at", filters.date_to);
      }
      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as InventoryMovement[];
    },
  });
}

// Get low stock items
export function useLowStockItems() {
  return useQuery({
    queryKey: ["low-stock-items"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("check_low_stock");
      if (error) throw error;
      return data as LowStockItem[];
    },
  });
}

// Get inventory summary for a product
export function useInventorySummary(productId: string) {
  return useQuery({
    queryKey: ["inventory-summary", productId],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_inventory_summary", {
        p_product_id: productId,
      });
      if (error) throw error;
      return data as InventorySummary;
    },
    enabled: !!productId,
  });
}

// Get inventory levels for all variants
export function useInventoryLevels() {
  return useQuery({
    queryKey: ["inventory-levels"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("inventory")
        .select(
          `
          *,
          product_variants!inner(
            id,
            name,
            sku,
            size,
            color,
            is_active,
            products!inner(
              id,
              name,
              is_active,
              low_stock_threshold
            )
          )
        `
        )
        .eq("product_variants.is_active", true)
        .eq("product_variants.products.is_active", true);

      if (error) throw error;

      // Sort by product name on the client side since we can't order by nested fields in Supabase
      return data?.sort((a, b) => {
        const nameA = a.product_variants?.products?.name || "";
        const nameB = b.product_variants?.products?.name || "";
        return nameA.localeCompare(nameB);
      });
    },
  });
}

// Get inventory movements by order
export function useOrderInventoryMovements(orderId: string) {
  return useQuery({
    queryKey: ["order-inventory-movements", orderId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("inventory_movements")
        .select(
          `
          *,
          product_variants!inner(
            id,
            name,
            sku,
            size,
            color,
            products!inner(
              id,
              name
            )
          )
        `
        )
        .eq("order_id", orderId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as InventoryMovement[];
    },
    enabled: !!orderId,
  });
}

// Get inventory statistics
export function useInventoryStats() {
  return useQuery({
    queryKey: ["inventory-stats"],
    queryFn: async () => {
      // Get total stock value
      const { data: stockValue, error: stockError } = await supabase.from(
        "inventory"
      ).select(`
          quantity,
          product_variants!inner(
            cost_price,
            products!inner(
              cost_price
            )
          )
        `);

      if (stockError) throw stockError;

      // Get low stock count
      const { data: lowStock, error: lowStockError } = await supabase.rpc(
        "check_low_stock"
      );
      if (lowStockError) throw lowStockError;

      // Get total variants
      const { count: totalVariants, error: variantsError } = await supabase
        .from("product_variants")
        .select("*", { count: "exact", head: true })
        .eq("is_active", true);

      if (variantsError) throw variantsError;

      // Calculate total stock value
      const totalValue =
        stockValue?.reduce((sum, item) => {
          const variant = Array.isArray(item.product_variants)
            ? item.product_variants[0]
            : item.product_variants;
          const costPrice =
            (variant as any)?.cost_price ||
            (variant as any)?.products?.cost_price ||
            0;
          return sum + item.quantity * costPrice;
        }, 0) || 0;

      return {
        totalStockValue: totalValue,
        lowStockCount: lowStock?.length || 0,
        totalVariants: totalVariants || 0,
        totalStockQuantity:
          stockValue?.reduce((sum, item) => sum + item.quantity, 0) || 0,
      };
    },
  });
}
