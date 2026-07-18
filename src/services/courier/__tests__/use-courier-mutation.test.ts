import { http, HttpResponse } from "msw";
import { waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderHookWithQueryClient } from "@/test/test-utils";
import { server } from "@/test/msw/server";
import { useToast } from "@/hooks/use-toast";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

vi.mock("@/hooks/use-toast", () => ({
  useToast: vi.fn(),
}));

const mockUseToast = vi.mocked(useToast);

import { useShipOrderWithCourier, useRefreshCourierStatus } from "../use-courier-mutation";

describe("courier mutations", () => {
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

  it("useShipOrderWithCourier books a consignment and shows a success toast with the tracking code", async () => {
    server.use(
      http.post(`${API_URL}/courier/orders/o1/ship`, () =>
        HttpResponse.json({
          success: true,
          data: { id: "o1", order_number: "ORD-1", tracking_number: "TRK-ABC" },
        }),
      ),
    );

    const { result } = renderHookWithQueryClient(() => useShipOrderWithCourier());
    result.current.mutate("o1");

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(showSuccess).toHaveBeenCalledWith(
      "Consignment Booked",
      "Order ORD-1 was booked with Steadfast (tracking: TRK-ABC)",
    );
  });

  it("useShipOrderWithCourier shows an error toast when the order is already booked", async () => {
    server.use(
      http.post(`${API_URL}/courier/orders/o1/ship`, () =>
        HttpResponse.json(
          { success: false, error: { message: "Order already has a courier consignment booked" } },
          { status: 422 },
        ),
      ),
    );

    const { result } = renderHookWithQueryClient(() => useShipOrderWithCourier());
    result.current.mutate("o1");

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(showError).toHaveBeenCalledWith(
      "Failed to Book Courier",
      "Order already has a courier consignment booked",
    );
  });

  it("useShipOrderWithCourier invalidates order queries on success", async () => {
    server.use(
      http.post(`${API_URL}/courier/orders/o1/ship`, () =>
        HttpResponse.json({
          success: true,
          data: { id: "o1", order_number: "ORD-1", tracking_number: "TRK-ABC" },
        }),
      ),
    );

    const { result, queryClient } = renderHookWithQueryClient(() => useShipOrderWithCourier());
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    result.current.mutate("o1");

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["orders"] });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["orders", "detail", "o1"] });
  });

  it("useRefreshCourierStatus refreshes and shows the current courier status", async () => {
    server.use(
      http.post(`${API_URL}/courier/orders/o1/refresh`, () =>
        HttpResponse.json({
          success: true,
          data: { id: "o1", order_number: "ORD-1", courier_status: "in_review" },
        }),
      ),
    );

    const { result } = renderHookWithQueryClient(() => useRefreshCourierStatus());
    result.current.mutate("o1");

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(showSuccess).toHaveBeenCalledWith(
      "Status Refreshed",
      "Order ORD-1 courier status: in_review",
    );
  });

  it("useRefreshCourierStatus shows an error toast on failure", async () => {
    server.use(
      http.post(`${API_URL}/courier/orders/o1/refresh`, () =>
        HttpResponse.json(
          { success: false, error: { message: "Order has no courier consignment to refresh" } },
          { status: 422 },
        ),
      ),
    );

    const { result } = renderHookWithQueryClient(() => useRefreshCourierStatus());
    result.current.mutate("o1");

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(showError).toHaveBeenCalledWith(
      "Failed to Refresh Status",
      "Order has no courier consignment to refresh",
    );
  });
});
