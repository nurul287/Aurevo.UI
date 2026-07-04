import { api, getStoredToken, storeTokens } from "@/lib/api";
import { supabase } from "@/lib/supabase";
import { UserProfile } from "@/services/types";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

// Query keys for consistent cache management
export const authQueryKeys = {
  session: ["auth", "session"] as const,
  userProfile: (userId: string) => ["auth", "profile", userId] as const,
} as const;

export interface StoredSession {
  user: {
    id: string;
    email: string;
    phone?: string;
    created_at?: string;
    user_metadata?: Record<string, unknown>;
    app_metadata?: Record<string, unknown>;
  };
}

/**
 * Hook to get the current authentication session.
 * Reads access token from localStorage; calls /api/auth/me to hydrate user data.
 */
export function useSession() {
  const queryClient = useQueryClient();

  const {
    data: session,
    isLoading,
    error,
  } = useQuery({
    queryKey: authQueryKeys.session,
    queryFn: async (): Promise<StoredSession | null> => {
      const token = getStoredToken();
      if (!token) return null;
      try {
        const profile = await api.get<UserProfile>("/auth/me");
        const user = profile as unknown as Record<string, unknown>;
        return {
          user: {
            id: String(user.id ?? ""),
            email: String(user.email ?? ""),
            phone: user.phone ? String(user.phone) : undefined,
            created_at: user.created_at ? String(user.created_at) : undefined,
            user_metadata: {
              first_name: user.first_name,
              last_name: user.last_name,
              avatar_url: user.avatar_url,
            },
          },
        };
      } catch {
        return null;
      }
    },
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  // Subscribe to Supabase auth events only for the OAuth callback flow.
  // After an OAuth redirect, Supabase sets a session in the URL hash;
  // we extract the token and copy it to localStorage so all subsequent
  // API calls use the same BE-compatible JWT.
  useEffect(() => {
    const { data: subscription } = supabase.auth.onAuthStateChange(
      async (event, oauthSession) => {
        if (
          (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") &&
          oauthSession?.access_token
        ) {
          // Copy OAuth token into localStorage so api.ts picks it up
          storeTokens({
            accessToken: oauthSession.access_token,
            refreshToken: oauthSession.refresh_token ?? "",
            expiresAt: oauthSession.expires_at,
          });
          queryClient.invalidateQueries({ queryKey: authQueryKeys.session });
        }
      }
    );

    return () => subscription.subscription.unsubscribe();
  }, [queryClient]);

  return {
    session,
    user: session?.user ?? null,
    isLoading,
    error,
    isAuthenticated: !!session?.user,
  };
}

/**
 * Hook to get user profile data
 */
export function useUserProfile(userId?: string) {
  const { user } = useSession();
  const targetUserId = userId || user?.id;

  return useQuery({
    queryKey: authQueryKeys.userProfile(targetUserId!),
    queryFn: async (): Promise<UserProfile | null> => {
      if (!targetUserId) return null;
      try {
        return await api.get<UserProfile>("/auth/me");
      } catch (err: unknown) {
        if ((err as { status?: number }).status === 404) return null;
        throw err;
      }
    },
    enabled: !!targetUserId,
    staleTime: 10 * 60 * 1000,
  });
}

/**
 * Combined hook for session and user profile
 */
export function useAuth() {
  const sessionQuery = useSession();
  const profileQuery = useUserProfile();

  return {
    session: sessionQuery.session,
    user: sessionQuery.user,
    profile: profileQuery.data,
    isLoading: sessionQuery.isLoading || profileQuery.isLoading,
    error: sessionQuery.error || profileQuery.error,
    isAuthenticated: sessionQuery.isAuthenticated,
    isAdmin:
      profileQuery.data?.preferences?.role === "admin" ||
      profileQuery.data?.preferences?.role === "super_admin",
  };
}
