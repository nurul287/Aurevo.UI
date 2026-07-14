import { APIRequestContext, Page } from "@playwright/test";
import { expect } from "@playwright/test";

export const API_URL = process.env.E2E_API_URL ?? "http://localhost:5000/api";
export const INBUCKET_URL = process.env.E2E_INBUCKET_URL ?? "http://127.0.0.1:54324";

export const TEST_ADDRESS = {
  label: "Home",
  name: "Nurul Alam",
  phone: "01887375148",
  address: "House 12, Road 5, Mirpur-11.5",
  district: "Dhaka",
  upazila: "Dhamrai",
};

/** A product+variant that is in stock. Picks the first active product from the live BE. */
export async function seedProductAndVariant(request: APIRequestContext) {
  const res = await request.get(`${API_URL}/products?page=1&limit=1&isActive=true`);
  const body = await res.json();
  const product = body.data?.[0];
  if (!product) {
    throw new Error(
      "No active product found via the API — seed the local Supabase catalog before running e2e tests.",
    );
  }
  const detail = await request.get(`${API_URL}/products/${product.id}`);
  const detailBody = await detail.json();
  const variant = detailBody.data?.variants?.[0];
  if (!variant) {
    throw new Error(`Product ${product.id} has no variants — seed one before running e2e tests.`);
  }
  return { product: detailBody.data, variant };
}

/** Registers a fresh user via the API (faster and more reliable than driving the signup form) and returns credentials. */
export async function registerTestUser(request: APIRequestContext) {
  const email = `e2e-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.com`;
  const password = "TestPassword123!";
  const res = await request.post(`${API_URL}/auth/register`, {
    data: { email, password, firstName: "E2E", lastName: "Tester" },
  });
  const body = await res.json();
  if (!body.success) {
    throw new Error(`Failed to register test user: ${JSON.stringify(body.error)}`);
  }
  return { email, password, accessToken: body.data.accessToken as string };
}

export async function addSavedAddress(request: APIRequestContext, accessToken: string) {
  const res = await request.post(`${API_URL}/auth/addresses`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    data: { ...TEST_ADDRESS, isDefault: true },
  });
  const body = await res.json();
  if (!body.success) {
    throw new Error(`Failed to create saved address: ${JSON.stringify(body.error)}`);
  }
  return body.data;
}

/** Logs in through the real form so the app's own token storage is exercised. */
export async function loginAs(page: Page, email: string, password: string) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Log in" }).click();
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 10_000 });
}

/**
 * Polls the local Supabase mail catcher for an email to `email`, up to
 * `timeoutMs`. Despite the `[inbucket]` section name in
 * `Aurevo.BE/supabase/config.toml`, the actual local container is Mailpit
 * (`supabase/mailpit` image) — its REST API is `/api/v1/search` +
 * `/api/v1/message/{id}`, not classic Inbucket's per-mailbox path. Never
 * available against a real/production SMTP provider.
 */
export async function waitForEmail(
  request: APIRequestContext,
  email: string,
  subjectContains: string,
  timeoutMs = 15_000,
): Promise<string> {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    const searchRes = await request.get(
      `${INBUCKET_URL}/api/v1/search?query=${encodeURIComponent(`to:${email}`)}`,
    );
    if (searchRes.ok()) {
      const { messages } = (await searchRes.json()) as {
        messages: Array<{ ID: string; Subject: string }>;
      };
      const match = messages.find((m) =>
        m.Subject.toLowerCase().includes(subjectContains.toLowerCase()),
      );
      if (match) {
        const msgRes = await request.get(`${INBUCKET_URL}/api/v1/message/${match.ID}`);
        const msg = (await msgRes.json()) as { HTML?: string; Text?: string };
        return msg.HTML ?? msg.Text ?? "";
      }
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(
    `No email with subject containing "${subjectContains}" arrived for ${email} within ${timeoutMs}ms`,
  );
}

/**
 * Extracts the Supabase auth action link (password reset, magic link, etc.)
 * from an email body. Deliberately narrower than "first URL in the body" —
 * our custom templates include a logo `<img src="...">` above the CTA link,
 * which a naive first-URL match would grab instead of the real action link.
 * Looks for `href="..."` attributes first (HTML emails) and prefers one
 * pointing at Supabase's own `/auth/v1/verify` endpoint; falls back to any
 * href, then to a bare URL in plain-text emails.
 */
export function extractAuthActionLink(emailBody: string): string {
  const hrefs = [...emailBody.matchAll(/href="([^"]+)"/g)].map((m) => m[1]!);
  const verifyLink = hrefs.find((h) => h.includes("/auth/v1/verify"));
  const candidate = verifyLink ?? hrefs[0];
  if (candidate) return candidate.replace(/&amp;/g, "&");

  const bareMatch = emailBody.match(/https?:\/\/[^\s"'<>]+/);
  if (!bareMatch) throw new Error("No link found in email body");
  return bareMatch[0].replace(/&amp;/g, "&");
}
