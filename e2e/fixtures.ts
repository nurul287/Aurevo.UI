import { APIRequestContext } from "@playwright/test";

export const API_URL = process.env.E2E_API_URL ?? "http://localhost:5000/api";

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
