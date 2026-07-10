import { expect, test } from "@playwright/test";
import { seedProductAndVariant } from "./fixtures";

test.describe("Guest checkout", () => {
  test("browse a product, add to cart, and complete checkout as a guest", async ({
    page,
    request,
  }) => {
    const { product } = await seedProductAndVariant(request);

    await page.goto(`/products/${product.id}`);
    await expect(page.getByText(product.name).first()).toBeVisible();

    await page.getByRole("button", { name: "Add Cart" }).click();
    // Adding an item auto-opens the cart side panel (see useCart.addItem).
    await expect(page.getByText("Shopping Cart")).toBeVisible({ timeout: 10_000 });
    await page.getByRole("button", { name: "CHECK OUT" }).click();

    await expect(page).toHaveURL(/\/checkout/);

    await page.getByLabel("Name").fill("Guest Buyer");
    await page.getByLabel("Phone Number").fill("01712345678");
    await page.getByLabel("Address").fill("House 1, Road 2, Uttara");

    await page.getByRole("button", { name: "Select District" }).click();
    await page.getByRole("option", { name: "Dhaka", exact: true }).click();

    // Radix renders a hidden native <select> alongside the visible trigger button,
    // so matching by accessible role/name is ambiguous — click the visible label text.
    await page.getByText("Select Upazila", { exact: true }).click();
    await page.getByRole("option").first().click();

    // Shipping zone derives automatically from district === "Dhaka" (see
    // shippingZoneForDistrict in checkout-page.tsx) — no explicit selection needed.
    await expect(page.locator("#ship-inside-dhaka")).toBeChecked();

    await page.getByRole("button", { name: "Order Now" }).click();

    await expect(page).toHaveURL(/\/order-confirmation/, { timeout: 15_000 });
    await expect(page.getByRole("heading", { name: "Order confirmed" })).toBeVisible();
  });
});
