import { APP_PATHS } from "@/constants/app-paths";
import { markOAuthLoginPending } from "@/lib/oauth-login-flag";
import { useToast } from "@/hooks/use-toast";
import { api, clearStoredTokens, storeTokens } from "@/lib/api";
import { supabase } from "@/lib/supabase";
import { SignInData, SignUpData, UserProfile } from "@/services/types";
import type { Provider } from "@supabase/supabase-js";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authQueryKeys } from "./use-auth-query";

interface AuthTokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresAt?: number | null;
  user: { id: string; email?: string; phone?: string; user_metadata?: Record<string, unknown> };
  requiresConfirmation?: boolean;
}

function saveAuthTokens(data: AuthTokenResponse) {
  storeTokens({
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
    expiresAt: data.expiresAt,
  });
}

/**
 * Hook for sign in mutation
 */
export function useSignIn() {
  const queryClient = useQueryClient();
  const { showError } = useToast();

  return useMutation({
    mutationFn: async ({ email, password }: SignInData) => {
      const data = await api.post<AuthTokenResponse>("/auth/login", { email, password }, { skipAuth: true, raw: true });
      return data;
    },
    onSuccess: (data) => {
      saveAuthTokens(data as unknown as AuthTokenResponse);
      queryClient.invalidateQueries({ queryKey: authQueryKeys.session });
    },
    onError: (error: Error) => {
      showError("Sign in failed", error.message || "Invalid email or password. Please try again.");
    },
  });
}

/**
 * OAuth sign-in (Facebook, Google, etc.). Redirects the browser away from the app.
 * The Supabase SDK is kept only for this OAuth redirect flow.
 */
export function useSignInWithOAuth() {
  const { showError } = useToast();

  return useMutation({
    mutationFn: async (provider: Provider) => {
      markOAuthLoginPending();
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          // Must redirect to a non-guarded page (home) so the Supabase SDK can
          // exchange the PKCE `?code=` before any auth guard navigates away and
          // strips the code from the URL. OAuthSuccessLandingRedirect on "/" then
          // waits for the session and forwards the user to /dashboard.
          redirectTo: `${window.location.origin}/`,
        },
      });
      if (error) throw error;
    },
    onError: (error: Error) => {
      showError("Sign in failed", error.message || "Could not start social sign-in. Please try again.");
    },
  });
}

/**
 * Hook for sign up mutation
 */
export function useSignUp() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: async ({ email, password, userData }: SignUpData) => {
      const data = await api.post<AuthTokenResponse>("/auth/register", {
        email,
        password,
        firstName: userData?.first_name,
        lastName: userData?.last_name,
      }, { skipAuth: true, raw: true });
      return data;
    },
    onSuccess: (data) => {
      const result = data as unknown as AuthTokenResponse;
      if (!result.requiresConfirmation) {
        saveAuthTokens(result);
        queryClient.invalidateQueries({ queryKey: authQueryKeys.session });
      }
      showSuccess("Account created!", "Please check your email to confirm your account");
    },
    onError: (error: Error) => {
      showError("Sign up failed", error.message || "Something went wrong. Please try again.");
    },
  });
}

/**
 * Hook for sign out mutation
 */
export function useSignOut() {
  const queryClient = useQueryClient();
  const { showSuccess } = useToast();

  return useMutation({
    mutationFn: async () => {
      clearStoredTokens();
      queryClient.setQueryData(authQueryKeys.session, null);
      queryClient.removeQueries({ queryKey: ["auth", "profile"] });
    },
    onSuccess: () => {
      showSuccess("Signed out successfully", "You have been logged out of your account");
    },
  });
}

/**
 * Hook for updating user profile
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      updates,
    }: {
      userId: string;
      updates: Partial<UserProfile>;
    }) => {
      return await api.patch<UserProfile>("/auth/profile", updates);
    },
    onSuccess: (data, variables) => {
      queryClient.setQueryData(authQueryKeys.userProfile(variables.userId), data);
    },
    onError: (error: Error) => {
      console.error("Update profile error:", error);
    },
  });
}

/**
 * Hook for resending confirmation email
 */
export function useResendConfirmation() {
  return useMutation({
    mutationFn: async (email: string) => {
      return api.post("/auth/resend-confirmation", { email, type: "signup" }, { skipAuth: true });
    },
    onError: (error: Error) => {
      console.error("Resend confirmation error:", error);
    },
  });
}

/**
 * Hook for password reset
 */
export function usePasswordReset() {
  return useMutation({
    mutationFn: async (email: string) => {
      return api.post("/auth/forgot-password", {
        email,
        redirectTo: `${window.location.origin}/reset-password`,
      }, { skipAuth: true });
    },
    onError: (error: Error) => {
      console.error("Password reset error:", error);
    },
  });
}

/**
 * Hook for updating password
 */
export function useUpdatePassword() {
  return useMutation({
    mutationFn: async ({ password }: { password: string }) => {
      return api.post("/auth/update-password", { password });
    },
    onError: (error: Error) => {
      console.error("Update password error:", error);
    },
  });
}

/**
 * Combined hook for all auth mutations
 */
export function useAuthMutations() {
  const signIn = useSignIn();
  const signInWithOAuth = useSignInWithOAuth();
  const signUp = useSignUp();
  const signOut = useSignOut();
  const updateProfile = useUpdateProfile();
  const resendConfirmation = useResendConfirmation();
  const passwordReset = usePasswordReset();
  const updatePassword = useUpdatePassword();

  return {
    signIn,
    signInWithOAuth,
    signUp,
    signOut,
    updateProfile,
    resendConfirmation,
    passwordReset,
    updatePassword,
  };
}
