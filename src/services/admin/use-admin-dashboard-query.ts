import { supabase } from "@/lib/supabase";
import type { Order } from "@/services/types";
import { useQuery } from "@tanstack/react-query";

export type AdminDashboardData = {
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
  totalCustomers: number;
  recentOrders: Order[];
  inventory: {
    lowStockCount: number;
    outOfStockCount: number;
    trackedVariants: number;
  };
};

function unwrapRelation<T>(rel: T | T[] | null | undefined): T | undefined {
  if (rel == null) return undefined;
  return Array.isArray(rel) ? rel[0] : rel;
}

export function useAdminDashboard() {
  return useQuery({
    queryKey: ["admin", "dashboard"],
    queryFn: async (): Promise<AdminDashboardData> => {
      const [
        ordersCountRes,
        productsCountRes,
        customersCountRes,
        recentOrdersRes,
        revenueOrdersRes,
        inventoryRes,
      ] = await Promise.all([
        supabase.from("orders").select("*", { count: "exact", head: true }),
        supabase
          .from("products")
          .select("*", { count: "exact", head: true })
          .eq("is_active", true),
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase
          .from("orders")
          .select(
            `
            *,
            user:profiles(id, first_name, last_name)
          `,
          )
          .order("created_at", { ascending: false })
          .limit(5),
        supabase
          .from("orders")
          .select("total_amount, status")
          .not("status", "eq", "cancelled")
          .not("status", "eq", "refunded"),
        supabase
          .from("inventory")
          .select(
            `
            quantity,
            reserved_quantity,
            reorder_point,
            product_variants!inner(
              is_active,
              products!inner(is_active, low_stock_threshold)
            )
          `,
          )
          .eq("product_variants.is_active", true)
          .eq("product_variants.products.is_active", true),
      ]);

      if (ordersCountRes.error) throw ordersCountRes.error;
      if (productsCountRes.error) throw productsCountRes.error;
      if (customersCountRes.error) throw customersCountRes.error;
      if (recentOrdersRes.error) throw recentOrdersRes.error;
      if (revenueOrdersRes.error) throw revenueOrdersRes.error;
      if (inventoryRes.error) throw inventoryRes.error;

      const totalRevenue =
        revenueOrdersRes.data?.reduce(
          (sum, row) => sum + Number(row.total_amount ?? 0),
          0,
        ) ?? 0;

      let lowStockCount = 0;
      let outOfStockCount = 0;

      type InventoryRow = {
        quantity: number | null;
        reserved_quantity: number | null;
        reorder_point: number | null;
        product_variants?: {
          products?: { low_stock_threshold?: number | null } | null;
        } | Array<{
          products?: { low_stock_threshold?: number | null } | null;
        }>;
      };

      for (const row of (inventoryRes.data ?? []) as InventoryRow[]) {
        const available =
          (row.quantity ?? 0) - (row.reserved_quantity ?? 0);
        const variant = unwrapRelation(row.product_variants);
        const product = unwrapRelation(variant?.products);
        const threshold =
          row.reorder_point ??
          product?.low_stock_threshold ??
          5;

        if (available <= 0) {
          outOfStockCount++;
        } else if (available <= threshold) {
          lowStockCount++;
        }
      }

      return {
        totalOrders: ordersCountRes.count ?? 0,
        totalRevenue,
        totalProducts: productsCountRes.count ?? 0,
        totalCustomers: customersCountRes.count ?? 0,
        recentOrders: (recentOrdersRes.data ?? []) as Order[],
        inventory: {
          lowStockCount,
          outOfStockCount,
          trackedVariants: inventoryRes.data?.length ?? 0,
        },
      };
    },
    staleTime: 60 * 1000,
  });
}
