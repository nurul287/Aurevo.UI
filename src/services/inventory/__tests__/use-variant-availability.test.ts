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

import {
  useVariantAvailableQuantity,
  useVariantsAvailableQuantities,
} from "../use-variant-availability";

describe("useVariantAvailableQuantity", () => {
  it("fetches the available quantity for a variant", async () => {
    server.use(
      http.get(`${API_URL}/inventory/availability`, () =>
        HttpResponse.json({
          success: true,
          data: [{ variant_id: "v1", quantity: 10, reserved_quantity: 3 }],
        }),
      ),
    );

    const { result } = renderHookWithQueryClient(() =>
      useVariantAvailableQuantity("v1"),
    );
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBe(7);
  });

  it("is disabled when there is no variantId", () => {
    const { result } = renderHookWithQueryClient(() =>
      useVariantAvailableQuantity(undefined),
    );
    expect(result.current.fetchStatus).toBe("idle");
  });

  it("is disabled when trackInventory is false", () => {
    const { result } = renderHookWithQueryClient(() =>
      useVariantAvailableQuantity("v1", { trackInventory: false }),
    );
    expect(result.current.fetchStatus).toBe("idle");
  });
});

describe("useVariantsAvailableQuantities", () => {
  it("fetches quantities for multiple variants", async () => {
    server.use(
      http.get(`${API_URL}/inventory/availability`, () =>
        HttpResponse.json({
          success: true,
          data: [
            { variant_id: "v1", quantity: 10, reserved_quantity: 0 },
            { variant_id: "v2", quantity: 4, reserved_quantity: 1 },
          ],
        }),
      ),
    );

    const { result } = renderHookWithQueryClient(() =>
      useVariantsAvailableQuantities(["v1", "v2"]),
    );
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual({ v1: 10, v2: 3 });
  });

  it("is disabled when the variant id list is empty", () => {
    const { result } = renderHookWithQueryClient(() =>
      useVariantsAvailableQuantities([]),
    );
    expect(result.current.fetchStatus).toBe("idle");
  });
});
