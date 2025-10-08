import { useAuthMutations, useAuth as useAuthQuery } from "@/services/auth";
import { useMigrateGuestCart } from "@/services/cart/use-cart-mutation";
import { UserProfile } from "@/services/types";
import { User } from "@supabase/supabase-js";
import { createContext, ReactNode, useContext, useEffect, useRef } from "react";

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<any>;
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
  // Use TanStack Query hooks for auth state
  const { user, profile, isLoading, isAuthenticated, isAdmin } = useAuthQuery();

  // Use TanStack Query mutations
  const {
    signIn: signInMutation,
    signUp: signUpMutation,
    signOut: signOutMutation,
    updateProfile: updateProfileMutation,
    resendConfirmation: resendConfirmationMutation,
  } = useAuthMutations();

  // Cart migration mutation
  const migrateGuestCartMutation = useMigrateGuestCart();
  const migrationAttempted = useRef<string | null>(null);

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
