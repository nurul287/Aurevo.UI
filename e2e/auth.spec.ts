import { expect, test } from "@playwright/test";
import { loginAs, registerTestUser } from "./fixtures";

test.describe("Login and logout", () => {
  test("logs in with valid credentials and reaches the dashboard", async ({ page, request }) => {
    const user = await registerTestUser(request);

    await loginAs(page, user.email, user.password);

    await expect(page).toHaveURL(/\/dashboard/);
  });

  test("shows an error and stays on the page with invalid credentials", async ({ page, request }) => {
    const user = await registerTestUser(request);

    await page.goto("/login");
    await page.getByLabel("Email").fill(user.email);
    await page.getByLabel("Password").fill("WrongPassword999!");
    await page.getByRole("button", { name: "Log in" }).click();

    await expect(page.getByText(/invalid email or password/i).first()).toBeVisible({ timeout: 10_000 });
    await expect(page).toHaveURL(/\/login/);
  });

  test("logs out and can no longer reach an authenticated page", async ({ page, request }) => {
    const user = await registerTestUser(request);
    await loginAs(page, user.email, user.password);

    // The sign-out control lives inside the header's user dropdown.
    await page.locator('button[aria-haspopup="true"]').click();
    await page.getByRole("button", { name: "Sign Out" }).click();

    // Signed-out state: the header shows a sign-in affordance again and the
    // access token is gone, so a protected route bounces to login.
    await expect(page.getByText("Sign in")).toBeVisible({ timeout: 10_000 });
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login/, { timeout: 10_000 });
  });
});
