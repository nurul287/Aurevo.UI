import { http, HttpResponse } from "msw";
import { waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { renderHookWithQueryClient } from "@/test/test-utils";
import { server } from "@/test/msw/server";
import { createMockSupabaseClient } from "@/test/mocks/supabase";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

vi.mock("@/lib/supabase", () => ({
  supabase: createMockSupabaseClient(null),
}));

import { useAdminDashboard } from "../use-admin-dashboard-query";

describe("useAdminDashboard", () => {
  it("fetches the admin dashboard summary", async () => {
    server.use(
      http.get(`${API_URL}/admin/dashboard`, () =>
        HttpResponse.json({
          success: true,
          data: {
            total_orders: 42,
            total_revenue: 123456,
            total_products: 10,
            total_customers: 8,
            recent_orders: [{ id: "o1", order_number: "ORD-1" }],
            inventory: {
              low_stock_count: 2,
              out_of_stock_count: 1,
              tracked_variants: 30,
            },
          },
        }),
      ),
    );

    const { result } = renderHookWithQueryClient(() => useAdminDashboard());
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.total_orders).toBe(42);
    expect(result.current.data?.recent_orders).toHaveLength(1);
    expect(result.current.data?.inventory.low_stock_count).toBe(2);
  });

  it("surfaces an error when the request fails", async () => {
    server.use(
      http.get(`${API_URL}/admin/dashboard`, () =>
        HttpResponse.json(
          { success: false, error: { message: "Forbidden" } },
          { status: 403 },
        ),
      ),
    );

    const { result } = renderHookWithQueryClient(() => useAdminDashboard());
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect((result.current.error as Error).message).toBe("Forbidden");
  });
});
