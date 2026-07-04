import { http, HttpResponse } from "msw";
import { waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderHookWithQueryClient } from "@/test/test-utils";
import { server } from "@/test/msw/server";
import { createMockSupabaseClient } from "@/test/mocks/supabase";
import { useToast } from "@/hooks/use-toast";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

vi.mock("@/lib/supabase", () => ({
  supabase: createMockSupabaseClient(null),
}));

vi.mock("@/hooks/use-toast", () => ({
  useToast: vi.fn(),
}));

const mockUseToast = vi.mocked(useToast);

import { useCreateProduct, useDeleteProduct } from "../use-product-mutation";

describe("useCreateProduct", () => {
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

  it("creates a product and shows a success toast", async () => {
    server.use(
      http.post(`${API_URL}/products`, () =>
        HttpResponse.json({
          success: true,
          data: { id: "p1", name: "Air Runner" },
        }),
      ),
    );

    const { result } = renderHookWithQueryClient(() => useCreateProduct());

    result.current.mutate({
      name: "Air Runner",
      slug: "air-runner",
      base_price: 1000,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(showSuccess).toHaveBeenCalledWith(
      "Product Created",
      "Product has been successfully created",
    );
  });

  it("shows an error toast when creation fails", async () => {
    server.use(
      http.post(`${API_URL}/products`, () =>
        HttpResponse.json(
          { success: false, error: { message: "Slug already exists" } },
          { status: 422 },
        ),
      ),
    );

    const { result } = renderHookWithQueryClient(() => useCreateProduct());

    result.current.mutate({
      name: "Air Runner",
      slug: "air-runner",
      base_price: 1000,
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(showError).toHaveBeenCalledWith(
      "Failed to Create Product",
      "Slug already exists",
    );
  });
});

describe("useDeleteProduct", () => {
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

  it("deletes a product and shows a success toast", async () => {
    server.use(
      http.delete(
        `${API_URL}/products/p1`,
        () => new HttpResponse(null, { status: 204 }),
      ),
    );

    const { result } = renderHookWithQueryClient(() => useDeleteProduct());
    result.current.mutate("p1");

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(showSuccess).toHaveBeenCalledWith(
      "Product Deleted",
      "Product has been successfully deleted",
    );
  });

  it("removes the deleted product from the cache", async () => {
    server.use(
      http.delete(
        `${API_URL}/products/p1`,
        () => new HttpResponse(null, { status: 204 }),
      ),
    );

    const { result, queryClient } = renderHookWithQueryClient(() =>
      useDeleteProduct(),
    );
    const removeSpy = vi.spyOn(queryClient, "removeQueries");

    result.current.mutate("p1");
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(removeSpy).toHaveBeenCalledWith({
      queryKey: ["products", "detail", "p1"],
    });
  });
});
