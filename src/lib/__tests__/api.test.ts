import { http, HttpResponse } from "msw";
import { afterEach, describe, expect, it } from "vitest";
import { server } from "@/test/msw/server";
// Note: api.ts reads tokens from localStorage (not Supabase SDK session).
// Tests that exercise auth headers must write to localStorage directly.

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

import { api, apiFetch, apiFetchForm, apiFetchList } from "../api";

describe("apiFetch", () => {
  afterEach(() => {
    localStorage.removeItem("aurevo_access_token");
  });

  it("converts camelCase response keys to snake_case", async () => {
    server.use(
      http.get(`${API_URL}/products/1`, () =>
        HttpResponse.json({
          success: true,
          data: { id: "1", isActive: true, basePrice: 100 },
        }),
      ),
    );

    const result = await apiFetch<{
      id: string;
      is_active: boolean;
      base_price: number;
    }>("/products/1");

    expect(result).toEqual({ id: "1", is_active: true, base_price: 100 });
  });

  it("attaches a bearer token from localStorage when not skipping auth", async () => {
    localStorage.setItem("aurevo_access_token", "test-token");

    let receivedAuthHeader: string | null = null;
    server.use(
      http.get(`${API_URL}/auth/me`, ({ request }) => {
        receivedAuthHeader = request.headers.get("Authorization");
        return HttpResponse.json({ success: true, data: { id: "1" } });
      }),
    );

    await apiFetch("/auth/me");

    expect(receivedAuthHeader).toBe("Bearer test-token");
  });

  it("does not attach a token when skipAuth is true", async () => {
    let receivedAuthHeader: string | null | undefined;
    server.use(
      http.get(`${API_URL}/products`, ({ request }) => {
        receivedAuthHeader = request.headers.get("Authorization");
        return HttpResponse.json({ success: true, data: [] });
      }),
    );

    await apiFetch("/products", { skipAuth: true });

    expect(receivedAuthHeader).toBeNull();
  });

  it("throws an ApiError with status and code when the response is unsuccessful", async () => {
    server.use(
      http.get(`${API_URL}/products/missing`, () =>
        HttpResponse.json(
          {
            success: false,
            error: { code: "NOT_FOUND", message: "Product not found" },
          },
          { status: 404 },
        ),
      ),
    );

    await expect(
      apiFetch("/products/missing", { skipAuth: true }),
    ).rejects.toMatchObject({
      message: "Product not found",
      code: "NOT_FOUND",
      status: 404,
    });
  });

  it("sends a JSON body for mutation requests", async () => {
    let receivedBody: unknown;
    server.use(
      http.post(`${API_URL}/cart`, async ({ request }) => {
        receivedBody = await request.json();
        return HttpResponse.json({
          success: true,
          data: { id: "cart-item-1" },
        });
      }),
    );

    await apiFetch("/cart", {
      method: "POST",
      body: { productId: "p1", quantity: 2 },
      skipAuth: true,
    });

    expect(receivedBody).toEqual({ productId: "p1", quantity: 2 });
  });

  it("attaches the guest session header when provided", async () => {
    let receivedHeader: string | null = null;
    server.use(
      http.get(`${API_URL}/cart`, ({ request }) => {
        receivedHeader = request.headers.get("X-Guest-Session");
        return HttpResponse.json({ success: true, data: { items: [] } });
      }),
    );

    await apiFetch("/cart", { skipAuth: true, guestSessionId: "guest-123" });

    expect(receivedHeader).toBe("guest-123");
  });
});

describe("apiFetchList", () => {
  it("returns data and pagination metadata from the response envelope", async () => {
    server.use(
      http.get(`${API_URL}/products`, () =>
        HttpResponse.json({
          success: true,
          data: [{ id: "1" }],
          meta: {
            pagination: { page: 2, limit: 10, total: 30, totalPages: 3 },
          },
        }),
      ),
    );

    const result = await apiFetchList("/products", { skipAuth: true });

    expect(result.data).toEqual([{ id: "1" }]);
    expect(result.pagination).toEqual({
      page: 2,
      limit: 10,
      total: 30,
      totalPages: 3,
    });
  });

  it("falls back to derived pagination metadata when the response has none", async () => {
    server.use(
      http.get(`${API_URL}/brands`, () =>
        HttpResponse.json({ success: true, data: [{ id: "1" }, { id: "2" }] }),
      ),
    );

    const result = await apiFetchList("/brands", { skipAuth: true });

    expect(result.pagination).toEqual({
      page: 1,
      limit: 2,
      total: 2,
      totalPages: 1,
    });
  });

  it("throws when the response envelope reports failure", async () => {
    server.use(
      http.get(`${API_URL}/categories`, () =>
        HttpResponse.json(
          { success: false, error: { message: "Server exploded" } },
          { status: 500 },
        ),
      ),
    );

    await expect(
      apiFetchList("/categories", { skipAuth: true }),
    ).rejects.toMatchObject({
      message: "Server exploded",
      status: 500,
    });
  });
});

describe("apiFetchForm", () => {
  it("sends a FormData body without a Content-Type header", async () => {
    let receivedContentType: string | null | undefined;
    server.use(
      http.post(`${API_URL}/admin/images`, async ({ request }) => {
        receivedContentType = request.headers.get("Content-Type");
        return HttpResponse.json({ success: true, data: { id: "img-1" } });
      }),
    );

    const formData = new FormData();
    formData.append(
      "file",
      new Blob(["fake"], { type: "image/png" }),
      "photo.png",
    );

    await apiFetchForm("/admin/images", { formData });

    expect(receivedContentType).toMatch(/multipart\/form-data/);
  });

  it("returns undefined on a 204 No Content response", async () => {
    server.use(
      http.delete(
        `${API_URL}/admin/images/1`,
        () => new HttpResponse(null, { status: 204 }),
      ),
    );

    const result = await apiFetchForm("/admin/images/1", {
      method: "DELETE",
      formData: new FormData(),
    });

    expect(result).toBeUndefined();
  });
});

describe("api convenience wrappers", () => {
  it("api.get performs a GET request", async () => {
    server.use(
      http.get(`${API_URL}/products/1`, () =>
        HttpResponse.json({ success: true, data: { id: "1" } }),
      ),
    );
    await expect(api.get("/products/1", { skipAuth: true })).resolves.toEqual({
      id: "1",
    });
  });

  it("api.post sends the given body", async () => {
    let receivedBody: unknown;
    server.use(
      http.post(`${API_URL}/cart`, async ({ request }) => {
        receivedBody = await request.json();
        return HttpResponse.json({ success: true, data: { id: "1" } });
      }),
    );

    await api.post("/cart", { quantity: 3 }, { skipAuth: true });
    expect(receivedBody).toEqual({ quantity: 3 });
  });

  it("api.delete performs a DELETE request", async () => {
    server.use(
      http.delete(
        `${API_URL}/cart/1`,
        () => new HttpResponse(null, { status: 204 }),
      ),
    );
    await expect(
      api.delete("/cart/1", { skipAuth: true }),
    ).resolves.toBeUndefined();
  });
});
