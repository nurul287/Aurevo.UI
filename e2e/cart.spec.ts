import { expect, test } from "@playwright/test";
import { seedProductAndVariant } from "./fixtures";

test.describe("Cart", () => {
  test("adding and updating quantity keeps the subtotal correct", async ({
    page,
    request,
  }) => {
    const { product, variant } = await seedProductAndVariant(request);
    const unitPrice = Number(variant.price ?? product.base_price ?? product.basePrice);

    await page.goto(`/products/${product.id}`);
    await page.getByRole("button", { name: "Add Cart" }).click();
    // Adding an item auto-opens the cart side panel (see useCart.addItem).
    const panel = page.getByRole("dialog");
    await expect(panel.getByText("Shopping Cart")).toBeVisible({ timeout: 10_000 });
    await expect(panel.getByText(product.name)).toBeVisible();

    // Matches formatPrice()'s en-US, 2-decimal formatting (see src/lib/currency.ts).
    const subtotalFor = (qty: number) =>
      new RegExp(
        (unitPrice * qty).toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }),
      );

    const subtotalRow = panel.getByText("Subtotal:").locator("..");
    await expect(subtotalRow.getByText(subtotalFor(1))).toBeVisible();

    // Bump quantity to 2 via the stepper's increment button and re-check the subtotal.
    await panel.getByRole("button", { name: "Increase quantity" }).click();
    await expect(subtotalRow.getByText(subtotalFor(2))).toBeVisible({ timeout: 10_000 });

    // Remove the item — cart returns to its empty state.
    await panel.getByRole("button", { name: "Remove item" }).click();
    await expect(panel.getByText("Your cart is empty")).toBeVisible({ timeout: 10_000 });
  });
});
