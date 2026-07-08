import { api, getStoredToken } from "@/lib/api";
import { UserProfile } from "@/services/types";
import { useQuery } from "@tanstack/react-query";

// Query keys for consistent cache management.
// `session` and `userProfile` are deliberately aliased to the same array value
// as `me` (React Query compares keys by value, not identity) — both used to
// point at independent cache entries that both fetched the identical /auth/me
// payload, causing a duplicate network request on every mount. Keeping them
// as aliases means every existing invalidateQueries/setQueryData call site
// (login, logout, profile updates, etc.) keeps working against the single
// shared `me` cache entry without needing to touch each call site.
export const authQueryKeys = {
  me: ["auth", "me"] as const,
  session: ["auth", "me"] as const,
  userProfile: (_userId: string) => ["auth", "me"] as const,
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

function useMeQuery() {
  return useQuery({
    queryKey: authQueryKeys.me,
    // Token presence is checked inside queryFn (no request fires without one)
    // rather than via `enabled` — `enabled` is captured at render time, so a
    // token stored after render (login/OAuth redeem) would leave the query
    // disabled and invalidateQueries would never refetch it.
    queryFn: async (): Promise<UserProfile | null> => {
      if (!getStoredToken()) return null;
      try {
        return await api.get<UserProfile>("/auth/me");
      } catch {
        return null;
      }
    },
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}

/**
 * Hook to get the current authentication session.
 * Reads access token from localStorage; calls /api/auth/me to hydrate user data.
 */
export function useSession() {
  const { data: profile, isLoading, error } = useMeQuery();
  const user = profile as unknown as Record<string, unknown> | null;
  const session: StoredSession | null = user
    ? {
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
      }
    : null;

  return {
    session,
    user: session?.user ?? null,
    isLoading,
    error,
    isAuthenticated: !!session?.user,
  };
}

/**
 * Hook to get user profile data. `userId` is accepted for API-compatibility
 * with existing callers, but every caller passes the current session's own
 * id — this always resolves to the same /auth/me payload as useSession, so
 * it shares that query instead of firing an independent request.
 */
export function useUserProfile(_userId?: string) {
  return useMeQuery();
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
