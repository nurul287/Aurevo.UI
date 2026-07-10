import { expect, test } from "@playwright/test";
import { addSavedAddress, registerTestUser, seedProductAndVariant, TEST_ADDRESS } from "./fixtures";

test.describe("Checkout with a saved address", () => {
  test("logged-in user's saved address autofills the checkout form", async ({
    page,
    request,
  }) => {
    const { product, variant } = await seedProductAndVariant(request);
    const user = await registerTestUser(request);
    await addSavedAddress(request, user.accessToken);

    // Log in through the real form so the app's own token storage is exercised.
    await page.goto("/login");
    await page.getByLabel("Email").fill(user.email);
    await page.getByLabel("Password").fill(user.password);
    await page.getByRole("button", { name: "Log in" }).click();
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10_000 });

    // Direct checkout (skips cart) — the same query-param flow product-detail-page uses.
    await page.goto(
      `/checkout?productId=${product.id}&variantId=${variant.id}&quantity=1`,
    );

    const savedCard = page.getByRole("button", { name: new RegExp(TEST_ADDRESS.name) });
    await expect(savedCard).toBeVisible({ timeout: 10_000 });
    await savedCard.click();

    await expect(page.getByLabel("Name")).toHaveValue(TEST_ADDRESS.name);
    await expect(page.getByLabel("Phone Number")).toHaveValue(TEST_ADDRESS.phone);
    await expect(page.getByLabel("Address")).toHaveValue(TEST_ADDRESS.address);
    await expect(page.getByRole("button", { name: "Select District" })).toHaveText(
      TEST_ADDRESS.district,
    );
    // Radix renders a hidden native <select> alongside the visible trigger button —
    // scope to the combobox role to avoid matching the hidden <option> too.
    await expect(page.getByRole("combobox").getByText(TEST_ADDRESS.upazila)).toBeVisible();

    await page.getByRole("button", { name: "Order Now" }).click();
    await expect(page).toHaveURL(/\/order-confirmation/, { timeout: 15_000 });
  });
});
