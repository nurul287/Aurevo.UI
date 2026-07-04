import { http, HttpResponse } from "msw";
import { waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { renderHookWithQueryClient } from "@/test/test-utils";
import { server } from "@/test/msw/server";
import {
  createMockSupabaseClient,
  createMockSession,
} from "@/test/mocks/supabase";
import { supabase } from "@/lib/supabase";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

vi.mock("@/lib/supabase", () => ({
  supabase: createMockSupabaseClient(null),
}));

import { useAuth, useSession, useUserProfile } from "../use-auth-query";

describe("useSession", () => {
  it("returns isAuthenticated: false when there is no session", async () => {
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: null },
      error: null,
    } as never);

    const { result } = renderHookWithQueryClient(() => useSession());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
  });

  it("returns the session's user when authenticated", async () => {
    const session = createMockSession();
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session },
      error: null,
    } as never);

    const { result } = renderHookWithQueryClient(() => useSession());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user?.id).toBe(session.user.id);
  });
});

describe("useUserProfile", () => {
  it("does not fetch when there is no session", () => {
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: null },
      error: null,
    } as never);

    const { result } = renderHookWithQueryClient(() => useUserProfile());
    expect(result.current.fetchStatus).toBe("idle");
  });

  it("fetches the profile once a session is available", async () => {
    const session = createMockSession();
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session },
      error: null,
    } as never);

    server.use(
      http.get(`${API_URL}/auth/me`, () =>
        HttpResponse.json({
          success: true,
          data: { id: session.user.id, first_name: "Jane" },
        }),
      ),
    );

    const { result } = renderHookWithQueryClient(() => useUserProfile());
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.first_name).toBe("Jane");
  });

  it("returns null when the profile does not exist yet (404)", async () => {
    const session = createMockSession();
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session },
      error: null,
    } as never);

    server.use(
      http.get(`${API_URL}/auth/me`, () =>
        HttpResponse.json(
          {
            success: false,
            error: { code: "NOT_FOUND", message: "Not found" },
          },
          { status: 404 },
        ),
      ),
    );

    const { result } = renderHookWithQueryClient(() => useUserProfile());
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBeNull();
  });
});

describe("useAuth", () => {
  it("is not admin when the profile has no admin role", async () => {
    const session = createMockSession();
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session },
      error: null,
    } as never);

    server.use(
      http.get(`${API_URL}/auth/me`, () =>
        HttpResponse.json({
          success: true,
          data: { id: session.user.id, preferences: { role: "customer" } },
        }),
      ),
    );

    const { result } = renderHookWithQueryClient(() => useAuth());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.isAdmin).toBe(false);
  });

  it("is admin when the profile role is 'admin' or 'super_admin'", async () => {
    const session = createMockSession();
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session },
      error: null,
    } as never);

    server.use(
      http.get(`${API_URL}/auth/me`, () =>
        HttpResponse.json({
          success: true,
          data: { id: session.user.id, preferences: { role: "super_admin" } },
        }),
      ),
    );

    const { result } = renderHookWithQueryClient(() => useAuth());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.isAdmin).toBe(true);
  });
});
