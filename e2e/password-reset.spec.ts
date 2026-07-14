import { expect, test } from "@playwright/test";
import { extractAuthActionLink, loginAs, registerTestUser, waitForEmail } from "./fixtures";

test.describe("Password reset", () => {
  test("request → email link → set new password → log in with it", async ({ page, request }) => {
    const user = await registerTestUser(request);
    const newPassword = "NewTestPassword456!";

    // 1. Request the reset email through the real form.
    await page.goto("/forgot-password");
    await page.getByLabel("Email").fill(user.email);
    await page.getByRole("button", { name: "Submit" }).click();
    await expect(page.getByText("Check your email")).toBeVisible({ timeout: 10_000 });

    // 2. Fetch the actual email from the local Supabase mail catcher (Inbucket)
    // and pull out the real action link — this is what makes the test cover
    // the full flow instead of stopping at the "email sent" UI state.
    const emailBody = await waitForEmail(request, user.email, "password");
    const actionLink = extractAuthActionLink(emailBody);

    // 3. Following the link redirects to /reset-password#access_token=...
    // (Supabase's GoTrue verify endpoint appends the recovery session as a
    // hash fragment) — the page under test must turn that into a stored
    // session before the "set new password" call can succeed.
    await page.goto(actionLink);
    await expect(page).toHaveURL(/\/reset-password/, { timeout: 10_000 });
    await expect(page.getByText(/invalid or has expired/i)).not.toBeVisible();

    // 4. Set the new password.
    await page.getByLabel("Create a new password").fill(newPassword);
    await page.getByLabel("Re-type Password").fill(newPassword);
    await page.getByRole("button", { name: "Set Password" }).click();
    await expect(page.getByText("Password Updated!")).toBeVisible({ timeout: 10_000 });
    await expect(page).toHaveURL(/\/login/, { timeout: 5_000 });

    // 5. Prove it actually took effect — log in with the new password.
    await loginAs(page, user.email, newPassword);
  });

  test("shows an invalid-link state when the recovery tokens are missing", async ({ page }) => {
    await page.goto("/reset-password");
    await expect(page.getByText(/invalid or has expired/i)).toBeVisible({ timeout: 10_000 });
  });
});
