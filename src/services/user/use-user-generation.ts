import { api } from "@/lib/api";
import { supabase } from "@/lib/supabase";
import { useMutation } from "@tanstack/react-query";

interface CreateUserFromCheckoutData {
  email: string;
  phone: string;
  firstName: string;
  lastName?: string;
  password?: string;
}

interface CreateUserFromCheckoutResponse {
  user: any;
  profile: any;
}

export function useCreateUserFromCheckout() {
  return useMutation({
    mutationFn: async (
      data: CreateUserFromCheckoutData
    ): Promise<CreateUserFromCheckoutResponse> => {
      const password =
        data.password || Math.random().toString(36).slice(-12) + "A1!";

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password,
        options: {
          data: {
            first_name: data.firstName,
            last_name: data.lastName,
            phone: data.phone,
          },
        },
      });

      if (authError) {
        if (authError.message?.includes("already registered")) {
          throw new Error(
            "An account with this email already exists. Please use a different email or try logging in."
          );
        }
        throw new Error(`Failed to create account: ${authError.message}`);
      }

      if (!authData.user) throw new Error("Failed to create user");

      // Wait briefly for auth session to establish before calling protected BE endpoint
      await new Promise((resolve) => setTimeout(resolve, 1500));

      let profile = null;
      try {
        profile = await api.post("/auth/profile", {
          userId: authData.user.id,
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone,
        });
      } catch {
        // Profile creation failure is non-fatal — user account was created
      }

      return { user: authData.user, profile };
    },
    onError: (error) => {
      console.error("Create user from checkout error:", error);
    },
  });
}

export function useMigrateGuestCartToNewUser() {
  return useMutation({
    mutationFn: async ({
      sessionId,
      userId,
    }: {
      sessionId: string;
      userId: string;
    }) => {
      await api.post("/cart/migrate", { guestSessionId: sessionId, userId });
    },
    onError: (error) => {
      console.error("Migrate guest cart to new user error:", error);
    },
  });
}
