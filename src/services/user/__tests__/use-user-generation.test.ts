import { http, HttpResponse } from "msw";
import { waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { renderHookWithQueryClient } from "@/test/test-utils";
import { server } from "@/test/msw/server";
import { createMockSupabaseClient } from "@/test/mocks/supabase";
import { supabase } from "@/lib/supabase";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

vi.mock("@/lib/supabase", () => ({
  supabase: createMockSupabaseClient(null),
}));

import {
  useCreateUserFromCheckout,
  useMigrateGuestCartToNewUser,
} from "../use-user-generation";

describe("useCreateUserFromCheckout", () => {
  // The mutation has a real 1.5s delay (waits for the auth session to
  // establish before calling the BE) — use real timers and a longer
  // per-test timeout instead of fake timers, which deadlock `waitFor`.
  it("signs up the user and creates a BE profile", async () => {
    vi.mocked(supabase.auth.signUp).mockResolvedValue({
      data: { user: { id: "user-1" }, session: null },
      error: null,
    } as never);

    server.use(
      http.post(`${API_URL}/auth/profile`, () =>
        HttpResponse.json({ success: true, data: { id: "user-1" } }),
      ),
    );

    const { result } = renderHookWithQueryClient(() =>
      useCreateUserFromCheckout(),
    );
    result.current.mutate({
      email: "jane@example.com",
      phone: "01700000000",
      firstName: "Jane",
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true), {
      timeout: 4000,
    });
    expect(result.current.data?.user).toEqual({ id: "user-1" });
  }, 8000);

  it("surfaces a friendly error when the email is already registered", async () => {
    vi.mocked(supabase.auth.signUp).mockResolvedValue({
      data: { user: null, session: null },
      error: { message: "User already registered" },
    } as never);

    const { result } = renderHookWithQueryClient(() =>
      useCreateUserFromCheckout(),
    );
    result.current.mutate({
      email: "jane@example.com",
      phone: "01700000000",
      firstName: "Jane",
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect((result.current.error as Error).message).toContain("already exists");
  });
});

describe("useMigrateGuestCartToNewUser", () => {
  it("posts the guest session id to /cart/migrate", async () => {
    let receivedBody: unknown;
    server.use(
      http.post(`${API_URL}/cart/migrate`, async ({ request }) => {
        receivedBody = await request.json();
        return HttpResponse.json({ success: true, data: { success: true } });
      }),
    );

    const { result } = renderHookWithQueryClient(() =>
      useMigrateGuestCartToNewUser(),
    );
    result.current.mutate({ sessionId: "guest-1", userId: "user-1" });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(receivedBody).toEqual({ sessionId: "guest-1", userId: "user-1" });
  });
});
