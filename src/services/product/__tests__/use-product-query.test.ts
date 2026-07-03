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

import {
  useBrands,
  useCategories,
  useProduct,
  useProducts,
} from "../use-product-query";

describe("useProducts", () => {
  it("returns the product list with pagination metadata", async () => {
    server.use(
      http.get(`${API_URL}/products`, () =>
        HttpResponse.json({
          success: true,
          data: [{ id: "p1", name: "Air Runner", variants: [] }],
          meta: { pagination: { page: 1, limit: 10, total: 1, totalPages: 1 } },
        }),
      ),
    );

    const { result } = renderHookWithQueryClient(() => useProducts());

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.data).toHaveLength(1);
    expect(result.current.data?.data[0].name).toBe("Air Runner");
    expect(result.current.data?.count).toBe(1);
  });

  it("sorts variants on each returned product", async () => {
    server.use(
      http.get(`${API_URL}/products`, () =>
        HttpResponse.json({
          success: true,
          data: [
            {
              id: "p1",
              name: "Air Runner",
              variants: [{ size: "42" }, { size: "40" }],
            },
          ],
          meta: { pagination: { page: 1, limit: 10, total: 1, totalPages: 1 } },
        }),
      ),
    );

    const { result } = renderHookWithQueryClient(() => useProducts());
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.data[0]?.variants?.map((v) => v.size)).toEqual([
      "40",
      "42",
    ]);
  });

  it("surfaces errors from the API", async () => {
    server.use(
      http.get(`${API_URL}/products`, () =>
        HttpResponse.json(
          { success: false, error: { message: "Server error" } },
          { status: 500 },
        ),
      ),
    );

    const { result } = renderHookWithQueryClient(() => useProducts());
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect((result.current.error as Error).message).toBe("Server error");
  });
});

describe("useProduct", () => {
  it("returns the product for a valid id", async () => {
    server.use(
      http.get(`${API_URL}/products/p1`, () =>
        HttpResponse.json({
          success: true,
          data: { id: "p1", name: "Air Runner" },
        }),
      ),
    );

    const { result } = renderHookWithQueryClient(() => useProduct("p1"));
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.name).toBe("Air Runner");
  });

  it("returns null when the product is not found (404)", async () => {
    server.use(
      http.get(`${API_URL}/products/missing`, () =>
        HttpResponse.json(
          {
            success: false,
            error: { code: "NOT_FOUND", message: "Not found" },
          },
          { status: 404 },
        ),
      ),
    );

    const { result } = renderHookWithQueryClient(() => useProduct("missing"));
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBeNull();
  });

  it("does not fetch when id is empty", () => {
    const { result } = renderHookWithQueryClient(() => useProduct(""));
    expect(result.current.fetchStatus).toBe("idle");
  });
});

describe("useCategories", () => {
  it("returns the category list", async () => {
    server.use(
      http.get(`${API_URL}/categories`, () =>
        HttpResponse.json({
          success: true,
          data: [{ id: "c1", name: "Shoes" }],
          meta: {
            pagination: { page: 1, limit: 100, total: 1, totalPages: 1 },
          },
        }),
      ),
    );

    const { result } = renderHookWithQueryClient(() => useCategories());
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([{ id: "c1", name: "Shoes" }]);
  });
});

describe("useBrands", () => {
  it("returns the brand list", async () => {
    server.use(
      http.get(`${API_URL}/brands`, () =>
        HttpResponse.json({
          success: true,
          data: [{ id: "b1", name: "Nike" }],
          meta: {
            pagination: { page: 1, limit: 100, total: 1, totalPages: 1 },
          },
        }),
      ),
    );

    const { result } = renderHookWithQueryClient(() => useBrands());
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([{ id: "b1", name: "Nike" }]);
  });
});
