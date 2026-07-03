import { http, HttpResponse } from "msw";
import { waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { renderHookWithQueryClient } from "@/test/test-utils";
import { server } from "@/test/msw/server";
import { createMockSupabaseClient } from "@/test/mocks/supabase";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

vi.mock("@/lib/supabase", () => ({
  supabase: createMockSupabaseClient(null),
}));

import { useOrder, useOrderStats, useOrders } from "../use-order-query";

describe("useOrders", () => {
  it("returns a paginated order list", async () => {
    server.use(
      http.get(`${API_URL}/orders`, ({ request }) => {
        const url = new URL(request.url);
        expect(url.searchParams.get("page")).toBe("1");
        expect(url.searchParams.get("limit")).toBe("20");
        return HttpResponse.json({
          success: true,
          data: [{ id: "o1", order_number: "ORD-1" }],
          meta: { pagination: { page: 1, limit: 20, total: 1, totalPages: 1 } },
        });
      }),
    );

    const { result } = renderHookWithQueryClient(() => useOrders());
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.data).toHaveLength(1);
    expect(result.current.data?.count).toBe(1);
  });

  it("omits the status filter when set to 'all'", async () => {
    let receivedStatus: string | null = "unset";
    server.use(
      http.get(`${API_URL}/orders`, ({ request }) => {
        receivedStatus = new URL(request.url).searchParams.get("status");
        return HttpResponse.json({
          success: true,
          data: [],
          meta: { pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } },
        });
      }),
    );

    const { result } = renderHookWithQueryClient(() =>
      useOrders({ status: "all" }),
    );
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(receivedStatus).toBeNull();
  });
});

describe("useOrder", () => {
  it("fetches a single order by id", async () => {
    server.use(
      http.get(`${API_URL}/orders/o1`, () =>
        HttpResponse.json({
          success: true,
          data: { id: "o1", order_number: "ORD-1" },
        }),
      ),
    );

    const { result } = renderHookWithQueryClient(() => useOrder("o1"));
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.order_number).toBe("ORD-1");
  });

  it("does not fetch when orderId is empty", () => {
    const { result } = renderHookWithQueryClient(() => useOrder(""));
    expect(result.current.fetchStatus).toBe("idle");
  });
});

describe("useOrderStats", () => {
  it("fetches order statistics", async () => {
    server.use(
      http.get(`${API_URL}/orders/stats`, () =>
        HttpResponse.json({
          success: true,
          data: {
            totalOrders: 10,
            totalRevenue: 5000,
            pendingOrders: 2,
            confirmedOrders: 3,
            processingOrders: 1,
            shippedOrders: 1,
            deliveredOrders: 2,
            cancelledOrders: 1,
            refundedOrders: 0,
          },
        }),
      ),
    );

    const { result } = renderHookWithQueryClient(() => useOrderStats());
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    // The BE returns camelCase; apiFetch converts every response key to
    // snake_case (see src/lib/api.ts), so OrderStats is declared in
    // snake_case to match what's actually available at runtime.
    expect(result.current.data?.total_orders).toBe(10);
    expect(result.current.data?.pending_orders).toBe(2);
  });
});
