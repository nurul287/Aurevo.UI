import { http, HttpResponse } from "msw";
import { describe, expect, it, vi } from "vitest";
import { server } from "@/test/msw/server";
import { createMockSupabaseClient } from "@/test/mocks/supabase";

const API_URL = "http://localhost:3001/api";

vi.mock("@/lib/supabase", () => ({
  supabase: createMockSupabaseClient(null),
}));

import {
  computeAvailableUnits,
  fetchVariantAvailableQuantity,
  fetchVariantsAvailableQuantities,
} from "./variant-availability";

describe("computeAvailableUnits", () => {
  it("subtracts reserved from total quantity", () => {
    expect(computeAvailableUnits(10, 3)).toBe(7);
  });

  it("never returns a negative number", () => {
    expect(computeAvailableUnits(2, 5)).toBe(0);
  });

  it("treats null/undefined as 0", () => {
    expect(computeAvailableUnits(null, undefined)).toBe(0);
    expect(computeAvailableUnits(5, null)).toBe(5);
  });
});

describe("fetchVariantAvailableQuantity", () => {
  it("returns the available quantity for a variant", async () => {
    server.use(
      http.get(`${API_URL}/inventory/availability`, () =>
        HttpResponse.json({
          success: true,
          data: [{ variant_id: "v1", quantity: 10, reserved_quantity: 4 }],
        }),
      ),
    );

    expect(await fetchVariantAvailableQuantity("v1")).toBe(6);
  });

  it("returns null when the variant has no inventory row", async () => {
    server.use(
      http.get(`${API_URL}/inventory/availability`, () =>
        HttpResponse.json({ success: true, data: [] }),
      ),
    );

    expect(await fetchVariantAvailableQuantity("v1")).toBeNull();
  });

  it("returns 0 when the request fails", async () => {
    server.use(
      http.get(`${API_URL}/inventory/availability`, () =>
        HttpResponse.json(
          { success: false, error: { message: "boom" } },
          { status: 500 },
        ),
      ),
    );

    expect(await fetchVariantAvailableQuantity("v1")).toBe(0);
  });
});

describe("fetchVariantsAvailableQuantities", () => {
  it("returns an empty map for an empty input", async () => {
    expect(await fetchVariantsAvailableQuantities([])).toEqual({});
  });

  it("de-duplicates variant ids and maps each to its available quantity", async () => {
    server.use(
      http.get(`${API_URL}/inventory/availability`, () =>
        HttpResponse.json({
          success: true,
          data: [
            { variant_id: "v1", quantity: 10, reserved_quantity: 2 },
            { variant_id: "v2", quantity: 5, reserved_quantity: 5 },
          ],
        }),
      ),
    );

    const result = await fetchVariantsAvailableQuantities(["v1", "v1", "v2"]);
    expect(result).toEqual({ v1: 8, v2: 0 });
  });

  it("defaults every requested id to 0 when the request fails", async () => {
    server.use(
      http.get(`${API_URL}/inventory/availability`, () =>
        HttpResponse.json(
          { success: false, error: { message: "boom" } },
          { status: 500 },
        ),
      ),
    );

    const result = await fetchVariantsAvailableQuantities(["v1", "v2"]);
    expect(result).toEqual({ v1: 0, v2: 0 });
  });
});
