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

import { useUserOrder, useUserOrders } from "../use-user-query";

describe("useUserOrders", () => {
  it("returns the user's orders", async () => {
    server.use(
      http.get(`${API_URL}/orders`, () =>
        HttpResponse.json({
          success: true,
          data: [{ id: "o1", order_number: "ORD-1" }],
          meta: {
            pagination: { page: 1, limit: 100, total: 1, totalPages: 1 },
          },
        }),
      ),
    );

    const { result } = renderHookWithQueryClient(() => useUserOrders("user-1"));
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(1);
  });

  it("does not fetch when userId is empty", () => {
    const { result } = renderHookWithQueryClient(() => useUserOrders(""));
    expect(result.current.fetchStatus).toBe("idle");
  });
});

describe("useUserOrder", () => {
  it("returns a single order for the user", async () => {
    server.use(
      http.get(`${API_URL}/orders/o1`, () =>
        HttpResponse.json({
          success: true,
          data: { id: "o1", order_number: "ORD-1" },
        }),
      ),
    );

    const { result } = renderHookWithQueryClient(() =>
      useUserOrder("user-1", "o1"),
    );
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.order_number).toBe("ORD-1");
  });

  it("returns null when the order is not found", async () => {
    server.use(
      http.get(`${API_URL}/orders/missing`, () =>
        HttpResponse.json(
          {
            success: false,
            error: { code: "NOT_FOUND", message: "Not found" },
          },
          { status: 404 },
        ),
      ),
    );

    const { result } = renderHookWithQueryClient(() =>
      useUserOrder("user-1", "missing"),
    );
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBeNull();
  });
});
