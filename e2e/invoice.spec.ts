import { expect, test } from "@playwright/test";
import { API_URL, seedProductAndVariant } from "./fixtures";

/**
 * Exercises the invoice PDF end-to-end: guest checkout -> confirmation page
 * shows a "Download invoice" link -> the URL it points at actually returns a
 * real PDF from the BE, as an attachment.
 */
test.describe("Order invoice", () => {
  test("confirmation page shows a download link, backed by a real PDF", async ({
    page,
    request,
  }) => {
    const { product } = await seedProductAndVariant(request);

    await page.goto(`/products/${product.id}`);
    await expect(page.getByText(product.name).first()).toBeVisible();

    await page.getByRole("button", { name: "Add Cart" }).click();
    await expect(page.getByText("Shopping Cart")).toBeVisible({ timeout: 10_000 });
    await page.getByRole("button", { name: "CHECK OUT" }).click();

    await expect(page).toHaveURL(/\/checkout/);

    await page.getByLabel("Name").fill("Invoice E2E Buyer");
    await page.getByLabel("Phone Number").fill("01712345678");
    await page.getByLabel("Address").fill("House 1, Road 2, Uttara");

    await page.getByRole("button", { name: "Select District" }).click();
    await page.getByRole("option", { name: "Dhaka", exact: true }).click();
    await page.getByText("Select Upazila", { exact: true }).click();
    await page.getByRole("option").first().click();

    await page.getByRole("button", { name: "Order Now" }).click();

    await expect(page).toHaveURL(/\/order-confirmation/, { timeout: 15_000 });
    await expect(page.getByRole("heading", { name: "Order confirmed" })).toBeVisible();

    const url = new URL(page.url());
    const orderNumber = url.searchParams.get("orderNumber");
    const guestToken = url.searchParams.get("guestToken");
    expect(orderNumber).toBeTruthy();
    // Sequential order numbers (migration 042): ORD- + 12-digit zero-padded number.
    expect(orderNumber).toMatch(/^ORD-\d{12}$/);

    // "Download invoice" link renders and points at the right endpoint.
    const downloadLink = page.getByRole("link", { name: "Download invoice" });
    await expect(downloadLink).toBeVisible({ timeout: 10_000 });
    const hrefFromPage = await downloadLink.getAttribute("href");
    expect(hrefFromPage).toContain(`/orders/by-number/${orderNumber}/invoice`);
    if (guestToken) expect(hrefFromPage).toContain(`guestToken=${guestToken}`);

    // The link's endpoint returns a real, valid PDF as an attachment.
    const invoiceUrl = guestToken
      ? `${API_URL}/orders/by-number/${orderNumber}/invoice?guestToken=${guestToken}`
      : `${API_URL}/orders/by-number/${orderNumber}/invoice`;
    const invoiceRes = await request.get(invoiceUrl);
    expect(invoiceRes.status()).toBe(200);
    expect(invoiceRes.headers()["content-type"]).toContain("application/pdf");
    expect(invoiceRes.headers()["content-disposition"]).toContain("attachment");
    const body = await invoiceRes.body();
    expect(body.length).toBeGreaterThan(0);
    expect(body.subarray(0, 5).toString()).toBe("%PDF-");
  });
});
