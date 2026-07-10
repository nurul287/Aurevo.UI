import { http, HttpResponse } from "msw";
import { waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderHookWithQueryClient } from "@/test/test-utils";
import { server } from "@/test/msw/server";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

import { fetchCartData, useCartData } from "../use-cart-query";

describe("fetchCartData", () => {
  it("returns an empty cart when there is no user or session id", async () => {
    const result = await fetchCartData(undefined, undefined);
    expect(result).toEqual({ items: [], total: 0, itemCount: 0 });
  });

  it("fetches the cart and computes the total for a guest session", async () => {
    server.use(
      http.get(`${API_URL}/cart`, () =>
        HttpResponse.json({
          success: true,
          data: {
            items: [
              {
                id: "i1",
                quantity: 2,
                price: 100,
                product_id: "p1",
                variant_id: "v1",
              },
            ],
          },
        }),
      ),
    );

    const result = await fetchCartData(undefined, "guest-session-1");
    expect(result.itemCount).toBe(1);
    expect(result.total).toBe(200);
  });
});

describe("useCartData", () => {
  it("is disabled when there is neither a userId nor a sessionId", () => {
    const { result } = renderHookWithQueryClient(() =>
      useCartData(undefined, undefined),
    );
    expect(result.current.fetchStatus).toBe("idle");
  });

  it("fetches cart data for an authenticated user", async () => {
    server.use(
      http.get(`${API_URL}/cart`, () =>
        HttpResponse.json({
          success: true,
          data: {
            items: [
              {
                id: "i1",
                quantity: 1,
                price: 250,
                product_id: "p1",
                variant_id: "v1",
              },
            ],
          },
        }),
      ),
    );

    const { result } = renderHookWithQueryClient(() =>
      useCartData("user-1", undefined),
    );
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.itemCount).toBe(1);
    expect(result.current.data?.total).toBe(250);
  });
});
