import { http, HttpResponse } from "msw";
import { waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderHookWithQueryClient } from "@/test/test-utils";
import { server } from "@/test/msw/server";
import { createMockSupabaseClient } from "@/test/mocks/supabase";
import { useToast } from "@/hooks/use-toast";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

vi.mock("@/lib/supabase", () => ({
  supabase: createMockSupabaseClient(null),
}));

vi.mock("@/hooks/use-toast", () => ({
  useToast: vi.fn(),
}));

const mockUseToast = vi.mocked(useToast);

import {
  useCancelOrder,
  useCreateGuestOrder,
  useUpdateOrderStatus,
} from "../use-order-mutation";

describe("order mutations", () => {
  const showSuccess = vi.fn();
  const showError = vi.fn();

  beforeEach(() => {
    showSuccess.mockClear();
    showError.mockClear();
    mockUseToast.mockReturnValue({
      showSuccess,
      showError,
    } as unknown as ReturnType<typeof useToast>);
  });

  it("useUpdateOrderStatus updates status and shows a labeled success toast", async () => {
    server.use(
      http.patch(`${API_URL}/orders/o1/status`, () =>
        HttpResponse.json({
          success: true,
          data: { id: "o1", order_number: "ORD-1" },
        }),
      ),
    );

    const { result } = renderHookWithQueryClient(() => useUpdateOrderStatus());
    result.current.mutate({ orderId: "o1", status: "shipped" });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(showSuccess).toHaveBeenCalledWith(
      "Order Status Updated",
      "Order ORD-1 status updated to Shipped",
    );
  });

  it("useUpdateOrderStatus shows an error toast on failure", async () => {
    server.use(
      http.patch(`${API_URL}/orders/o1/status`, () =>
        HttpResponse.json(
          { success: false, error: { message: "Invalid transition" } },
          { status: 409 },
        ),
      ),
    );

    const { result } = renderHookWithQueryClient(() => useUpdateOrderStatus());
    result.current.mutate({ orderId: "o1", status: "delivered" });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(showError).toHaveBeenCalledWith(
      "Failed to Update Order Status",
      "Invalid transition",
    );
  });

  it("useCancelOrder cancels the order and shows a success toast", async () => {
    server.use(
      http.patch(`${API_URL}/orders/o1/cancel`, () =>
        HttpResponse.json({
          success: true,
          data: { id: "o1", order_number: "ORD-1" },
        }),
      ),
    );

    const { result } = renderHookWithQueryClient(() => useCancelOrder());
    result.current.mutate("o1");

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(showSuccess).toHaveBeenCalledWith(
      "Order Cancelled",
      "Order ORD-1 has been cancelled",
    );
  });

  it("useCancelOrder shows an error toast when the order is already cancelled", async () => {
    server.use(
      http.patch(`${API_URL}/orders/o1/cancel`, () =>
        HttpResponse.json(
          { success: false, error: { message: "Order already cancelled" } },
          { status: 409 },
        ),
      ),
    );

    const { result } = renderHookWithQueryClient(() => useCancelOrder());
    result.current.mutate("o1");

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(showError).toHaveBeenCalledWith(
      "Failed to Cancel Order",
      "Order already cancelled",
    );
  });

  it("useCreateGuestOrder creates an order and shows a success toast", async () => {
    server.use(
      http.post(`${API_URL}/orders`, () =>
        HttpResponse.json({
          success: true,
          data: { id: "o1", order_number: "ORD-1", guest_token: "tok-1" },
        }),
      ),
    );

    const { result } = renderHookWithQueryClient(() => useCreateGuestOrder());
    result.current.mutate({
      billingAddress: { firstName: "Jane", lastName: "Doe" },
      shippingAddress: { firstName: "Jane", lastName: "Doe" },
      items: [{ variant_id: "v1", quantity: 1 }],
      subtotal: 1000,
      total_amount: 1000,
      payment_method: "cash_on_delivery",
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(showSuccess).toHaveBeenCalledWith(
      "Order Created",
      "Your order ORD-1 has been created successfully",
    );
  });

  it("useCreateGuestOrder filters out items with no variant_id", async () => {
    let receivedItems: unknown;
    server.use(
      http.post(`${API_URL}/orders`, async ({ request }) => {
        const body = (await request.json()) as { items: unknown };
        receivedItems = body.items;
        return HttpResponse.json({
          success: true,
          data: { id: "o1", order_number: "ORD-1", guest_token: null },
        });
      }),
    );

    const { result } = renderHookWithQueryClient(() => useCreateGuestOrder());
    result.current.mutate({
      billingAddress: {},
      shippingAddress: {},
      items: [{ variant_id: "v1", quantity: 1 }, { quantity: 2 }],
      subtotal: 1000,
      total_amount: 1000,
      payment_method: "cash_on_delivery",
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(receivedItems).toEqual([{ variantId: "v1", quantity: 1 }]);
  });
});
