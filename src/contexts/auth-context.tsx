import { buildProfileFieldsFromUserMetadata } from "@/lib/profile-from-auth-metadata";
import { useAuthMutations, useAuth as useAuthQuery } from "@/services/auth";
import { authQueryKeys } from "@/services/auth/use-auth-query";
import { useMigrateGuestCart } from "@/services/cart/use-cart-mutation";
import { useCreateUserProfile } from "@/services/user";
import { UserProfile } from "@/services/types";
import type { Provider, User } from "@supabase/supabase-js";
import { useQueryClient } from "@tanstack/react-query";
import { createContext, ReactNode, useContext, useEffect, useRef } from "react";

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<any>;
  signInWithOAuth: (provider: Provider) => Promise<any>;
  signUp: (email: string, password: string, userData?: any) => Promise<any>;
  signOut: () => Promise<void>;
  updateProfile: (updates: any) => Promise<any>;
  resendConfirmation: (email: string) => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const queryClient = useQueryClient();
  // Use TanStack Query hooks for auth state
  const { user, profile, isLoading, isAuthenticated, isAdmin } = useAuthQuery();
  const createUserProfile = useCreateUserProfile();

  // Use TanStack Query mutations
  const {
    signIn: signInMutation,
    signInWithOAuth: signInWithOAuthMutation,
    signUp: signUpMutation,
    signOut: signOutMutation,
    updateProfile: updateProfileMutation,
    resendConfirmation: resendConfirmationMutation,
  } = useAuthMutations();

  // Cart migration mutation
  const migrateGuestCartMutation = useMigrateGuestCart();
  const migrationAttempted = useRef<string | null>(null);
  const profileBootstrapForUserId = useRef<string | null>(null);

  /**
   * OAuth (and some email) users exist in `auth.users` but this app reads
   * `public.profiles`. There is no DB trigger in repo migrations — create a
   * profile row once when the user is signed in and has no profile.
   */
  useEffect(() => {
    if (!user?.id) {
      profileBootstrapForUserId.current = null;
      return;
    }
    if (isLoading || profile) return;

    if (profileBootstrapForUserId.current === user.id) return;
    profileBootstrapForUserId.current = user.id;

    const meta = (user.user_metadata || {}) as Record<string, unknown>;
    const fields = buildProfileFieldsFromUserMetadata(meta);

    createUserProfile.mutate(
      { userId: user.id, profileData: fields },
      {
        onError: (error: unknown) => {
          const err = error as { code?: string; message?: string };
          const msg = String(err?.message ?? "");
          if (
            err?.code === "23505" ||
            msg.includes("duplicate") ||
            msg.includes("unique")
          ) {
            void queryClient.invalidateQueries({
              queryKey: authQueryKeys.userProfile(user.id),
            });
            return;
          }
          profileBootstrapForUserId.current = null;
        },
      },
    );
  }, [
    user?.id,
    user?.user_metadata,
    isLoading,
    profile,
    createUserProfile,
    queryClient,
  ]);

  // Migrate guest cart to user cart when user logs in
  useEffect(() => {
    if (user?.id && migrationAttempted.current !== user.id) {
      const guestSessionId = localStorage.getItem("guest_session_id");
      if (guestSessionId) {
        console.log("🔄 User logged in, migrating guest cart...");
        migrationAttempted.current = user.id;
        migrateGuestCartMutation.mutate({
          sessionId: guestSessionId,
          userId: user.id,
        });
      }
    }
  }, [user?.id, migrateGuestCartMutation]);

  // Wrapper functions to maintain the same API as before
  const signIn = async (email: string, password: string) => {
    try {
      const result = await signInMutation.mutateAsync({ email, password });
      return { success: true, data: result, error: null };
    } catch (error) {
      return { success: false, data: null, error };
    }
  };

  const signInWithOAuth = async (provider: Provider) => {
    try {
      await signInWithOAuthMutation.mutateAsync(provider);
      return { success: true, error: null };
    } catch (error) {
      return { success: false, error };
    }
  };

  const signUp = async (email: string, password: string, userData?: any) => {
    try {
      const result = await signUpMutation.mutateAsync({
        email,
        password,
        userData,
      });
      return { success: true, data: result, error: null };
    } catch (error) {
      return { success: false, data: null, error };
    }
  };

  const signOut = async () => {
    try {
      await signOutMutation.mutateAsync();
      // Reset migration flag when user logs out
      migrationAttempted.current = null;
    } catch (error) {
      console.error("Sign out error:", error);
      throw error;
    }
  };

  const updateProfile = async (updates: any) => {
    try {
      if (!user) throw new Error("No user logged in");

      const result = await updateProfileMutation.mutateAsync({
        userId: user.id,
        updates,
      });

      return { success: true, data: result, error: null };
    } catch (error) {
      console.error("Update profile error:", error);
      return { success: false, data: null, error };
    }
  };

  const resendConfirmation = async (email: string) => {
    try {
      const result = await resendConfirmationMutation.mutateAsync(email);
      return { success: true, data: result, error: null };
    } catch (error) {
      console.error("Resend confirmation error:", error);
      return { success: false, data: null, error };
    }
  };

  const value: AuthContextType = {
    user,
    profile: profile ?? null,
    loading: isLoading,
    isAdmin,
    isAuthenticated,
    signIn,
    signInWithOAuth,
    signUp,
    signOut,
    updateProfile,
    resendConfirmation,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
