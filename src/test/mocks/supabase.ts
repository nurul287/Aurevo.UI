import { vi } from "vitest";
import type { Session } from "@supabase/supabase-js";

/**
 * Builds a fake Supabase session for tests. `api.ts` and the auth query
 * hooks read `supabase.auth.getSession()` directly, so tests that exercise
 * that path should `vi.mock("@/lib/supabase", ...)` with this shape.
 */
export function createMockSession(overrides: Partial<Session> = {}): Session {
  return {
    access_token: "test-access-token",
    refresh_token: "test-refresh-token",
    expires_in: 3600,
    token_type: "bearer",
    user: {
      id: "00000000-0000-0000-0000-000000000002",
      app_metadata: {},
      user_metadata: {},
      aud: "authenticated",
      created_at: new Date().toISOString(),
    },
    ...overrides,
  } as Session;
}

/**
 * Creates a mock of the `@/lib/supabase` module's `supabase` export.
 * Usage: `vi.mock("@/lib/supabase", () => ({ supabase: createMockSupabaseClient() }))`
 */
export function createMockSupabaseClient(session: Session | null = null) {
  return {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session }, error: null }),
      onAuthStateChange: vi.fn().mockReturnValue({
        data: { subscription: { unsubscribe: vi.fn() } },
      }),
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      signInWithOAuth: vi.fn(),
      resend: vi.fn(),
    },
  };
}
