import { waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderHookWithQueryClient } from "@/test/test-utils";
import { createMockSession, createMockSupabaseClient } from "@/test/mocks/supabase";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

vi.mock("@/lib/supabase", () => ({
  supabase: createMockSupabaseClient(null),
}));

vi.mock("@/hooks/use-toast", () => ({
  useToast: vi.fn(),
}));

const mockUseToast = vi.mocked(useToast);

import { useSignIn, useSignInWithOAuth, useSignOut, useSignUp } from "./use-auth-mutation";
import { authQueryKeys } from "./use-auth-query";

describe("auth mutations", () => {
  const showSuccess = vi.fn();
  const showError = vi.fn();

  beforeEach(() => {
    showSuccess.mockClear();
    showError.mockClear();
    mockUseToast.mockReturnValue({ showSuccess, showError } as unknown as ReturnType<
      typeof useToast
    >);
  });

  it("useSignIn signs in and caches the new session", async () => {
    const session = createMockSession();
    vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
      data: { session, user: session.user },
      error: null,
    } as never);

    const { result, queryClient } = renderHookWithQueryClient(() => useSignIn());
    result.current.mutate({ email: "jane@example.com", password: "hunter2" });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(queryClient.getQueryData(authQueryKeys.session)).toEqual(session);
  });

  it("useSignIn shows an error toast on invalid credentials", async () => {
    vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
      data: { session: null, user: null },
      error: { message: "Invalid login credentials" },
    } as never);

    const { result } = renderHookWithQueryClient(() => useSignIn());
    result.current.mutate({ email: "jane@example.com", password: "wrong" });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(showError).toHaveBeenCalledWith("Sign in failed", "Invalid login credentials");
  });

  it("useSignUp shows a confirmation success toast", async () => {
    vi.mocked(supabase.auth.signUp).mockResolvedValue({
      data: { session: null, user: { id: "user-1" } },
      error: null,
    } as never);

    const { result } = renderHookWithQueryClient(() => useSignUp());
    result.current.mutate({ email: "jane@example.com", password: "hunter2" });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(showSuccess).toHaveBeenCalledWith(
      "Account created!",
      "Please check your email to confirm your account"
    );
  });

  it("useSignOut clears the session cache and shows a success toast", async () => {
    vi.mocked(supabase.auth.signOut).mockResolvedValue({ error: null } as never);

    const { result, queryClient } = renderHookWithQueryClient(() => useSignOut());
    queryClient.setQueryData(authQueryKeys.session, createMockSession());

    result.current.mutate();

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(queryClient.getQueryData(authQueryKeys.session)).toBeNull();
    expect(showSuccess).toHaveBeenCalledWith(
      "Signed out successfully",
      "You have been logged out of your account"
    );
  });

  it("useSignInWithOAuth marks the OAuth login as pending before redirecting", async () => {
    vi.mocked(supabase.auth.signInWithOAuth).mockResolvedValue({ error: null } as never);

    const { result } = renderHookWithQueryClient(() => useSignInWithOAuth());
    result.current.mutate("facebook" as never);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(sessionStorage.getItem("aurevo_oauth_login_pending")).toBe("1");
    sessionStorage.clear();
  });
});
