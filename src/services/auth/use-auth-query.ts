import { supabase } from "@/lib/supabase";
import { UserProfile } from "@/services/types";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

// Query keys for consistent cache management
export const authQueryKeys = {
  session: ["auth", "session"] as const,
  userProfile: (userId: string) => ["auth", "profile", userId] as const,
} as const;

/**
 * Hook to get the current authentication session
 */
export function useSession() {
  const queryClient = useQueryClient();

  const {
    data: session,
    isLoading,
    error,
  } = useQuery({
    queryKey: authQueryKeys.session,
    queryFn: async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      return data.session;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });

  // Subscribe to auth state changes
  useEffect(() => {
    const { data: subscription } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        queryClient.setQueryData(authQueryKeys.session, session);

        // Invalidate user profile when auth state changes
        if (session?.user?.id) {
          queryClient.invalidateQueries({
            queryKey: authQueryKeys.userProfile(session.user.id),
          });
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

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", targetUserId)
        .single();

      if (error) {
        // If profile doesn't exist, return null instead of throwing
        if (error.code === "PGRST116") return null;
        throw error;
      }

      return data;
    },
    enabled: !!targetUserId,
    staleTime: 10 * 60 * 1000, // 10 minutes
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
