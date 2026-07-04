import { api } from "@/lib/api";
import type { Order } from "@/services/types";
import { useQuery } from "@tanstack/react-query";

export type AdminDashboardData = {
  total_orders: number;
  total_revenue: number;
  total_products: number;
  total_customers: number;
  recent_orders: Order[];
  inventory: {
    low_stock_count: number;
    out_of_stock_count: number;
    tracked_variants: number;
  };
};

export function useAdminDashboard() {
  return useQuery({
    queryKey: ["admin", "dashboard"],
    queryFn: () => api.get<AdminDashboardData>("/admin/dashboard"),
    staleTime: 60 * 1000,
  });
}
