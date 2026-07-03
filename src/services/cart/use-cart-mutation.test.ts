import { http, HttpResponse } from "msw";
import { waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderHookWithQueryClient } from "@/test/test-utils";
import { server } from "@/test/msw/server";
import { createMockSupabaseClient } from "@/test/mocks/supabase";
import { useToast } from "@/hooks/use-toast";

const API_URL = "http://localhost:3001/api";

vi.mock("@/lib/supabase", () => ({
  supabase: createMockSupabaseClient(null),
}));

vi.mock("@/hooks/use-toast", () => ({
  useToast: vi.fn(),
}));

const mockUseToast = vi.mocked(useToast);

import { useAddToCart, useClearCart, useRemoveFromCart } from "./use-cart-mutation";

describe("cart mutations", () => {
  const showSuccess = vi.fn();
  const showError = vi.fn();

  beforeEach(() => {
    showSuccess.mockClear();
    showError.mockClear();
    mockUseToast.mockReturnValue({ showSuccess, showError } as unknown as ReturnType<
      typeof useToast
    >);
  });

  it("useAddToCart adds an item and shows a success toast with the product name", async () => {
    server.use(
      http.post(`${API_URL}/cart/items`, () =>
        HttpResponse.json({
          success: true,
          data: { id: "item-1", product: { name: "Air Runner" } },
        })
      )
    );

    const { result } = renderHookWithQueryClient(() => useAddToCart());
    result.current.mutate({
      sessionId: "guest-1",
      productId: "p1",
      variantId: "v1",
      quantity: 1,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(showSuccess).toHaveBeenCalledWith(
      "Added to cart!",
      "Air Runner has been added to your cart"
    );
  });

  it("useAddToCart suppresses the toast when suppressToast is true", async () => {
    server.use(
      http.post(`${API_URL}/cart/items`, () =>
        HttpResponse.json({ success: true, data: { id: "item-1" } })
      )
    );

    const { result } = renderHookWithQueryClient(() => useAddToCart());
    result.current.mutate({
      sessionId: "guest-1",
      productId: "p1",
      variantId: "v1",
      suppressToast: true,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(showSuccess).not.toHaveBeenCalled();
  });

  it("useAddToCart shows an error toast on insufficient stock", async () => {
    server.use(
      http.post(`${API_URL}/cart/items`, () =>
        HttpResponse.json(
          { success: false, error: { message: "Insufficient stock" } },
          { status: 422 }
        )
      )
    );

    const { result } = renderHookWithQueryClient(() => useAddToCart());
    result.current.mutate({ sessionId: "guest-1", productId: "p1", variantId: "v1" });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(showError).toHaveBeenCalledWith("Failed to add to cart", "Insufficient stock");
  });

  it("useRemoveFromCart removes an item without error", async () => {
    server.use(
      http.delete(`${API_URL}/cart/items/item-1`, () => new HttpResponse(null, { status: 204 }))
    );

    const { result } = renderHookWithQueryClient(() => useRemoveFromCart());
    result.current.mutate({ itemId: "item-1", sessionId: "guest-1" });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it("useClearCart clears the cart and shows a success toast", async () => {
    server.use(http.delete(`${API_URL}/cart`, () => new HttpResponse(null, { status: 204 })));

    const { result } = renderHookWithQueryClient(() => useClearCart());
    result.current.mutate({ sessionId: "guest-1" });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(showSuccess).toHaveBeenCalledWith(
      "Cart cleared!",
      "All items have been removed from your cart"
    );
  });
});
