import { http, HttpResponse } from "msw";
import { waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderHookWithQueryClient } from "@/test/test-utils";
import { server } from "@/test/msw/server";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

import {
  computeInventoryStats,
  useInventoryLevels,
  useLowStockItems,
  type InventoryRecord,
} from "../use-inventory-query";

function makeRecord(overrides: Partial<InventoryRecord> = {}): InventoryRecord {
  return {
    id: "inv-1",
    variant_id: "v1",
    location: "main",
    quantity: 10,
    reserved_quantity: 2,
    available_quantity: 8,
    reorder_point: 5,
    reorder_quantity: 20,
    product_variants: {
      id: "v1",
      name: "Air Runner - 42",
      sku: "AR-42",
      price: 100,
      products: { id: "p1", name: "Air Runner", low_stock_threshold: 5 },
    },
    ...overrides,
  } as InventoryRecord;
}

describe("useInventoryLevels", () => {
  it("fetches paginated inventory levels", async () => {
    server.use(
      http.get(`${API_URL}/inventory`, () =>
        HttpResponse.json({
          success: true,
          data: [makeRecord()],
          meta: { pagination: { page: 1, limit: 20, total: 1, totalPages: 1 } },
        }),
      ),
    );

    const { result } = renderHookWithQueryClient(() => useInventoryLevels());
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.data).toHaveLength(1);
  });
});

describe("useLowStockItems", () => {
  it("fetches the low-stock item list", async () => {
    server.use(
      http.get(`${API_URL}/inventory/low-stock`, () =>
        HttpResponse.json({
          success: true,
          data: [makeRecord({ quantity: 2 })],
          meta: { pagination: { page: 1, limit: 20, total: 1, totalPages: 1 } },
        }),
      ),
    );

    const { result } = renderHookWithQueryClient(() => useLowStockItems());
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.data[0]?.quantity).toBe(2);
  });
});

describe("computeInventoryStats", () => {
  it("sums stock value using variant price when available", () => {
    const records = [
      makeRecord({
        quantity: 3,
        product_variants: { ...makeRecord().product_variants, price: 100 },
      }),
    ];
    const stats = computeInventoryStats(records, 2);
    expect(stats.totalStockValue).toBe(300);
    expect(stats.lowStockCount).toBe(2);
    expect(stats.totalVariants).toBe(1);
    expect(stats.totalStockQuantity).toBe(3);
  });

  it("falls back to the product base_price when the variant has no price", () => {
    const record = makeRecord({
      quantity: 2,
      product_variants: {
        id: "v1",
        name: "Air Runner - 42",
        sku: "AR-42",
        price: undefined,
        products: {
          id: "p1",
          name: "Air Runner",
          base_price: 50,
          low_stock_threshold: 5,
        },
      } as never,
    });
    const stats = computeInventoryStats([record], 0);
    expect(stats.totalStockValue).toBe(100);
  });

  it("returns zeroed stats for an empty record list", () => {
    const stats = computeInventoryStats([], 0);
    expect(stats).toEqual({
      totalStockValue: 0,
      lowStockCount: 0,
      totalVariants: 0,
      totalStockQuantity: 0,
    });
  });
});
