import { describe, expect, it } from "vitest";
import { getOrderCustomerName } from "./order-display";
import type { Order } from "@/services/types";

type OrderWithUser = Order & {
  user?: { first_name?: string; last_name?: string } | null;
};

function makeOrder(overrides: Partial<OrderWithUser>): OrderWithUser {
  return {
    id: "order-1",
    ...overrides,
  } as OrderWithUser;
}

describe("getOrderCustomerName", () => {
  it("prefers the registered user's name", () => {
    const order = makeOrder({ user: { first_name: "Jane", last_name: "Doe" } });
    expect(getOrderCustomerName(order)).toBe("Jane Doe");
  });

  it("falls back to the billing address name", () => {
    const order = makeOrder({
      billing_address: { firstName: "Alice", lastName: "Smith" } as never,
    });
    expect(getOrderCustomerName(order)).toBe("Alice Smith");
  });

  it("falls back to the shipping address name when billing has none", () => {
    const order = makeOrder({
      shipping_address: { first_name: "Bob", last_name: "Lee" } as never,
    });
    expect(getOrderCustomerName(order)).toBe("Bob Lee");
  });

  it("falls back to phone when no names are available", () => {
    const order = makeOrder({ phone: "01700000000" });
    expect(getOrderCustomerName(order)).toBe("01700000000");
  });

  it("falls back to email when no phone is available", () => {
    const order = makeOrder({ email: "guest@example.com" });
    expect(getOrderCustomerName(order)).toBe("guest@example.com");
  });

  it("falls back to 'Guest' when there is no identifying information", () => {
    const order = makeOrder({});
    expect(getOrderCustomerName(order)).toBe("Guest");
  });
});
