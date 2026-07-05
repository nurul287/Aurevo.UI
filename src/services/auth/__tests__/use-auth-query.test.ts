import { http, HttpResponse } from "msw";
import { waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { renderHookWithQueryClient } from "@/test/test-utils";
import { server } from "@/test/msw/server";
import { createMockSupabaseClient } from "@/test/mocks/supabase";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

vi.mock("@/lib/supabase", () => ({
  supabase: createMockSupabaseClient(null),
}));

import { useAuth, useSession, useUserProfile } from "../use-auth-query";

// useSession / useUserProfile / useAuth all derive state from /auth/me, which
// is only fetched when a token exists in localStorage (enabled: !!token).
// Tests that need an authenticated state must write a token to localStorage
// and register an MSW handler for GET /auth/me.

afterEach(() => {
  localStorage.removeItem("aurevo_access_token");
});

describe("useSession", () => {
  it("returns isAuthenticated: false when there is no token", async () => {
    const { result } = renderHookWithQueryClient(() => useSession());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
  });

  it("returns the session's user when authenticated", async () => {
    localStorage.setItem("aurevo_access_token", "tok-123");

    server.use(
      http.get(`${API_URL}/auth/me`, () =>
        HttpResponse.json({
          success: true,
          data: { id: "user-1", email: "jane@example.com" },
        }),
      ),
    );

    const { result } = renderHookWithQueryClient(() => useSession());
    await waitFor(() => expect(result.current.isAuthenticated).toBe(true));
    expect(result.current.user?.id).toBe("user-1");
  });
});

describe("useUserProfile", () => {
  it("does not fetch when there is no token", () => {
    const { result } = renderHookWithQueryClient(() => useUserProfile());
    expect(result.current.fetchStatus).toBe("idle");
  });

  it("fetches the profile once a token is available", async () => {
    localStorage.setItem("aurevo_access_token", "tok-123");

    server.use(
      http.get(`${API_URL}/auth/me`, () =>
        HttpResponse.json({
          success: true,
          data: { id: "user-1", first_name: "Jane" },
        }),
      ),
    );

    const { result } = renderHookWithQueryClient(() => useUserProfile());
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.first_name).toBe("Jane");
  });

  it("returns null when /auth/me returns an error (e.g. 404)", async () => {
    localStorage.setItem("aurevo_access_token", "tok-123");

    server.use(
      http.get(`${API_URL}/auth/me`, () =>
        HttpResponse.json(
          { success: false, error: { code: "NOT_FOUND", message: "Not found" } },
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
    localStorage.setItem("aurevo_access_token", "tok-123");

    server.use(
      http.get(`${API_URL}/auth/me`, () =>
        HttpResponse.json({
          success: true,
          data: { id: "user-1", preferences: { role: "customer" } },
        }),
      ),
    );

    const { result } = renderHookWithQueryClient(() => useAuth());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.isAdmin).toBe(false);
  });

  it("is admin when the profile role is 'admin' or 'super_admin'", async () => {
    localStorage.setItem("aurevo_access_token", "tok-123");

    server.use(
      http.get(`${API_URL}/auth/me`, () =>
        HttpResponse.json({
          success: true,
          data: { id: "user-1", preferences: { role: "super_admin" } },
        }),
      ),
    );

    const { result } = renderHookWithQueryClient(() => useAuth());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.isAdmin).toBe(true);
  });
});
