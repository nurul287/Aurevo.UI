import { http, HttpResponse } from "msw";
import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "@/test/test-utils";
import { server } from "@/test/msw/server";
import OrderConfirmationPage from "../order-confirmation-page";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Meta Pixel is a no-op without config, but mock it so the purchase effect can't
// touch a real fbq during the test.
vi.mock("@/lib/meta-pixel", () => ({ trackMetaPixelPurchase: vi.fn() }));

function mockOrder(id: string) {
  return {
    success: true,
    data: {
      id,
      order_number: "ORD-123",
      status: "pending",
      subtotal: 990,
      shipping_amount: 60,
      total_amount: 1050,
      items: [
        {
          id: "item-1",
          product_name: "Test Product",
          variant_name: "Navy — XL",
          quantity: 1,
          total_price: 990,
        },
      ],
    },
  };
}

describe("OrderConfirmationPage invoice download link", () => {
  it("renders a download link pointing at the invoice endpoint with the guest token", async () => {
    server.use(http.get(`${API_URL}/orders/o1`, () => HttpResponse.json(mockOrder("o1"))));

    renderWithProviders(<OrderConfirmationPage />, {
      routerProps: {
        initialEntries: ["/order-confirmation?orderId=o1&orderNumber=ORD-123&guestToken=abc"],
      },
    });

    const link = await screen.findByRole("link", { name: /download invoice/i });
    expect(link).toHaveAttribute(
      "href",
      `${API_URL}/orders/by-number/ORD-123/invoice?guestToken=abc`,
    );
  });

  it("omits the guestToken query string when there is no guest token", async () => {
    server.use(http.get(`${API_URL}/orders/o2`, () => HttpResponse.json(mockOrder("o2"))));

    renderWithProviders(<OrderConfirmationPage />, {
      routerProps: {
        initialEntries: ["/order-confirmation?orderId=o2&orderNumber=ORD-123"],
      },
    });

    const link = await screen.findByRole("link", { name: /download invoice/i });
    expect(link).toHaveAttribute("href", `${API_URL}/orders/by-number/ORD-123/invoice`);
  });
});
