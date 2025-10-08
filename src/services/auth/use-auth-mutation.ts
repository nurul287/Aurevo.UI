import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { SignInData, SignUpData, UserProfile } from "@/services/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authQueryKeys } from "./use-auth-query";

/**
 * Hook for sign in mutation
 */
export function useSignIn() {
  const queryClient = useQueryClient();
  const { showError } = useToast();

  return useMutation({
    mutationFn: async ({ email, password }: SignInData) => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      // Update session cache
      queryClient.setQueryData(authQueryKeys.session, data.session);

      // Invalidate user profile to refetch
      if (data.user?.id) {
        queryClient.invalidateQueries({
          queryKey: authQueryKeys.userProfile(data.user.id),
        });
      }
    },
    onError: (error) => {
      console.error("Sign in error:", error);
      showError(
        "Sign in failed",
        error.message || "Invalid email or password. Please try again."
      );
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
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData,
        },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      // Update session cache if user is immediately signed in
      if (data.session) {
        queryClient.setQueryData(authQueryKeys.session, data.session);
      }

      showSuccess(
        "Account created!",
        "Please check your email to confirm your account"
      );
    },
    onError: (error) => {
      console.error("Sign up error:", error);
      showError(
        "Sign up failed",
        error.message || "Something went wrong. Please try again."
      );
    },
  });
}

/**
 * Hook for sign out mutation
 */
export function useSignOut() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    },
    onSuccess: () => {
      // Clear all auth-related cache
      queryClient.setQueryData(authQueryKeys.session, null);
      queryClient.removeQueries({ queryKey: ["auth", "profile"] });

      showSuccess(
        "Signed out successfully",
        "You have been logged out of your account"
      );
    },
    onError: (error) => {
      console.error("Sign out error:", error);
      showError(
        "Sign out failed",
        error.message || "Something went wrong. Please try again."
      );
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
      userId,
      updates,
    }: {
      userId: string;
      updates: Partial<UserProfile>;
    }) => {
      const { data, error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data, variables) => {
      // Update profile cache
      queryClient.setQueryData(
        authQueryKeys.userProfile(variables.userId),
        data
      );
    },
    onError: (error) => {
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
      const { data, error } = await supabase.auth.resend({
        type: "signup",
        email,
      });
      if (error) throw error;
      return data;
    },
    onError: (error) => {
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
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      return data;
    },
    onError: (error) => {
      console.error("Password reset error:", error);
    },
  });
}

/**
 * Hook for updating password
 */
export function useUpdatePassword() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ password }: { password: string }) => {
      const { data, error } = await supabase.auth.updateUser({
        password,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      // Update session cache
      queryClient.setQueryData(authQueryKeys.session, data.user);
    },
    onError: (error) => {
      console.error("Update password error:", error);
    },
  });
}

/**
 * Combined hook for all auth mutations
 */
export function useAuthMutations() {
  const signIn = useSignIn();
  const signUp = useSignUp();
  const signOut = useSignOut();
  const updateProfile = useUpdateProfile();
  const resendConfirmation = useResendConfirmation();
  const passwordReset = usePasswordReset();
  const updatePassword = useUpdatePassword();

  return {
    signIn,
    signUp,
    signOut,
    updateProfile,
    resendConfirmation,
    passwordReset,
    updatePassword,
  };
}
