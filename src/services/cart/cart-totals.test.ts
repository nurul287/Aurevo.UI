import { describe, expect, it } from "vitest";
import type { CartItem } from "@/services/types";
import { computeCartTotals, getCartLineUnitPrice } from "./cart-totals";

function makeItem(overrides: Partial<CartItem> = {}): CartItem {
  return {
    id: "item-1",
    product_id: "p1",
    variant_id: "v1",
    quantity: 1,
    price: 0,
    ...overrides,
  } as CartItem;
}

describe("getCartLineUnitPrice", () => {
  it("prefers the variant price over product and line price", () => {
    const item = makeItem({
      variant: { price: 500 } as never,
      product: { base_price: 400 } as never,
      price: 300,
    });
    expect(getCartLineUnitPrice(item)).toBe(500);
  });

  it("falls back to the product base_price when there is no variant price", () => {
    const item = makeItem({ product: { base_price: 400 } as never, price: 300 });
    expect(getCartLineUnitPrice(item)).toBe(400);
  });

  it("falls back to the line price when there is no variant or product price", () => {
    const item = makeItem({ price: 300 });
    expect(getCartLineUnitPrice(item)).toBe(300);
  });

  it("returns 0 when there is no price information at all", () => {
    const item = makeItem({ price: 0 });
    expect(getCartLineUnitPrice(item)).toBe(0);
  });
});

describe("computeCartTotals", () => {
  it("returns zeroed totals for an empty cart", () => {
    expect(computeCartTotals([])).toEqual({
      value: 0,
      num_items: 0,
      contents: [],
      content_ids: [],
    });
  });

  it("sums value and quantity across multiple lines", () => {
    const items = [
      makeItem({ variant_id: "v1", quantity: 2, price: 100 }),
      makeItem({ variant_id: "v2", quantity: 3, price: 50 }),
    ];

    const totals = computeCartTotals(items);
    expect(totals.value).toBe(350);
    expect(totals.num_items).toBe(5);
    expect(totals.content_ids).toEqual(["v1", "v2"]);
  });

  it("uses the product_id as content id when there is no variant_id", () => {
    const items = [
      makeItem({ variant_id: undefined as unknown as string, product_id: "p9", quantity: 1 }),
    ];
    const totals = computeCartTotals(items);
    expect(totals.content_ids).toEqual(["p9"]);
  });
});
