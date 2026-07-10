import { http, HttpResponse } from "msw";
import { waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { renderHookWithQueryClient } from "@/test/test-utils";
import { server } from "@/test/msw/server";
import { useToast } from "@/hooks/use-toast";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

vi.mock("@/hooks/use-toast", () => ({
  useToast: vi.fn(),
}));

const mockUseToast = vi.mocked(useToast);

import { useSignIn, useSignInWithOAuth, useSignOut, useSignUp } from "../use-auth-mutation";
import { authQueryKeys } from "../use-auth-query";

// Auth mutations call the custom backend (not Supabase SDK directly).
// Supabase SDK is only used for signInWithOAuth redirect flow.

describe("auth mutations", () => {
  const showSuccess = vi.fn();
  const showError = vi.fn();

  beforeEach(() => {
    showSuccess.mockClear();
    showError.mockClear();
    mockUseToast.mockReturnValue({ showSuccess, showError } as unknown as ReturnType<typeof useToast>);
  });

  afterEach(() => {
    localStorage.removeItem("aurevo_access_token");
    localStorage.removeItem("aurevo_refresh_token");
  });

  it("useSignIn stores tokens in localStorage on success", async () => {
    server.use(
      http.post(`${API_URL}/auth/login`, () =>
        HttpResponse.json({
          success: true,
          data: {
            accessToken: "tok-access",
            refreshToken: "tok-refresh",
            expiresAt: 9999999999,
            user: { id: "user-1", email: "jane@example.com" },
          },
        }),
      ),
    );

    const { result } = renderHookWithQueryClient(() => useSignIn());
    result.current.mutate({ email: "jane@example.com", password: "hunter2" });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(localStorage.getItem("aurevo_access_token")).toBe("tok-access");
  });

  it("useSignIn shows an error toast on invalid credentials", async () => {
    server.use(
      http.post(`${API_URL}/auth/login`, () =>
        HttpResponse.json(
          { success: false, error: { code: "INVALID_CREDENTIALS", message: "Invalid email or password" } },
          { status: 401 },
        ),
      ),
    );

    const { result } = renderHookWithQueryClient(() => useSignIn());
    result.current.mutate({ email: "jane@example.com", password: "wrong" });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(showError).toHaveBeenCalledWith("Sign in failed", expect.stringContaining("Invalid email or password"));
  });

  it("useSignUp shows a confirmation success toast", async () => {
    server.use(
      http.post(`${API_URL}/auth/register`, () =>
        HttpResponse.json({
          success: true,
          data: { user: { id: "user-1" }, requiresConfirmation: true },
        }),
      ),
    );

    const { result } = renderHookWithQueryClient(() => useSignUp());
    result.current.mutate({ email: "jane@example.com", password: "hunter2" });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(showSuccess).toHaveBeenCalledWith(
      "Account created!",
      "Please check your email to confirm your account",
    );
  });

  it("useSignOut clears tokens and session cache, shows a success toast", async () => {
    server.use(
      http.post(`${API_URL}/auth/logout`, () => HttpResponse.json({ success: true })),
    );
    localStorage.setItem("aurevo_access_token", "tok-123");

    const { result, queryClient } = renderHookWithQueryClient(() => useSignOut());
    queryClient.setQueryData(authQueryKeys.session, { user: { id: "user-1" } });

    result.current.mutate();

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(queryClient.getQueryData(authQueryKeys.session)).toBeNull();
    expect(localStorage.getItem("aurevo_access_token")).toBeNull();
    expect(showSuccess).toHaveBeenCalledWith(
      "Signed out successfully",
      "You have been logged out of your account",
    );
  });

  it("useSignInWithOAuth calls the BE for the provider URL and sets window.location.href", async () => {
    server.use(
      http.get(`${API_URL}/auth/oauth/url`, () =>
        HttpResponse.json({ success: true, data: { url: "https://provider.example.com/oauth" } }),
      ),
    );

    const hrefSetter = vi.fn();
    const originalDescriptor = Object.getOwnPropertyDescriptor(window, "location");
    Object.defineProperty(window, "location", {
      value: { ...window.location, set href(v: string) { hrefSetter(v); } },
      writable: true,
    });

    const { result } = renderHookWithQueryClient(() => useSignInWithOAuth());
    result.current.mutate("facebook");

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(sessionStorage.getItem("aurevo_oauth_login_pending")).toBe("1");
    expect(hrefSetter).toHaveBeenCalledWith("https://provider.example.com/oauth");

    if (originalDescriptor) Object.defineProperty(window, "location", originalDescriptor);
    sessionStorage.clear();
  });
});
