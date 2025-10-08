import { supabase } from "@/lib/supabase";
import { useMutation } from "@tanstack/react-query";

interface CreateUserFromCheckoutData {
  email: string;
  phone: string;
  firstName: string;
  lastName?: string;
  password?: string; // Optional, will generate if not provided
}

interface CreateUserFromCheckoutResponse {
  user: any;
  profile: any;
}

/**
 * Hook for creating a user account during checkout
 */
export function useCreateUserFromCheckout() {
  return useMutation({
    mutationFn: async (
      data: CreateUserFromCheckoutData
    ): Promise<CreateUserFromCheckoutResponse> => {
      console.log("👤 Creating user from checkout data:", data);

      // Generate a random password if not provided
      const password =
        data.password || Math.random().toString(36).slice(-12) + "A1!";

      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: password,
        options: {
          data: {
            first_name: data.firstName,
            last_name: data.lastName,
            phone: data.phone,
          },
        },
      });

      if (authError) {
        console.error("❌ Error creating auth user:", authError);

        // Provide more specific error messages
        if (authError.message?.includes("already registered")) {
          throw new Error(
            "An account with this email already exists. Please use a different email or try logging in."
          );
        } else if (authError.message?.includes("Invalid email")) {
          throw new Error("Please enter a valid email address.");
        } else {
          throw new Error(`Failed to create account: ${authError.message}`);
        }
      }

      if (!authData.user) {
        throw new Error("Failed to create user");
      }

      // Wait for the user session to be established
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Create profile - try multiple times if needed
      let profileData = null;
      let profileError = null;

      for (let attempt = 1; attempt <= 3; attempt++) {
        console.log(
          `🔄 Attempting to create profile (attempt ${attempt}/3)...`
        );

        const { data: profileResponse, error } = await supabase
          .from("profiles")
          .insert({
            id: authData.user.id,
            first_name: data.firstName,
            last_name: data.lastName,
            phone: data.phone,
          })
          .select()
          .single();

        if (error) {
          console.warn(
            `⚠️ Profile creation attempt ${attempt} failed:`,
            error.message
          );
          profileError = error;

          if (attempt < 3) {
            // Wait before retrying
            await new Promise((resolve) => setTimeout(resolve, 1000));
          }
        } else {
          profileData = profileResponse;
          console.log("✅ Profile created successfully");
          break;
        }
      }

      if (profileError && !profileData) {
        console.warn(
          "⚠️ Could not create profile after 3 attempts, but user account was created successfully"
        );
        // Don't throw error - user account creation is the priority
      }

      console.log("✅ Successfully created user from checkout:", {
        userId: authData.user.id,
        email: data.email,
      });

      return {
        user: authData.user,
        profile: profileData,
      };
    },
    onError: (error) => {
      console.error("Create user from checkout error:", error);
    },
  });
}

/**
 * Hook for migrating guest cart to newly created user
 */
export function useMigrateGuestCartToNewUser() {
  return useMutation({
    mutationFn: async ({
      sessionId,
      userId,
    }: {
      sessionId: string;
      userId: string;
    }) => {
      console.log("🔄 Migrating guest cart to new user:", {
        sessionId,
        userId,
      });

      // Get all guest cart items
      const { data: guestCartItems, error: fetchError } = await supabase
        .from("cart_items")
        .select("*")
        .eq("session_id", sessionId);

      if (fetchError) {
        console.error("❌ Error fetching guest cart items:", fetchError);
        throw fetchError;
      }

      if (!guestCartItems || guestCartItems.length === 0) {
        console.log("📭 No guest cart items to migrate");
        return;
      }

      // Transfer all guest cart items to the new user
      for (const guestItem of guestCartItems) {
        const { error: insertError } = await supabase
          .from("cart_items")
          .insert({
            user_id: userId,
            product_id: guestItem.product_id,
            variant_id: guestItem.variant_id,
            quantity: guestItem.quantity,
            price: guestItem.price,
          });

        if (insertError) {
          console.error("❌ Error inserting user cart item:", insertError);
          continue;
        }
      }

      // Delete guest cart items
      const { error: deleteError } = await supabase
        .from("cart_items")
        .delete()
        .eq("session_id", sessionId);

      if (deleteError) {
        console.error("❌ Error deleting guest cart items:", deleteError);
        throw deleteError;
      }

      console.log("✅ Successfully migrated guest cart to new user");
    },
    onError: (error) => {
      console.error("Migrate guest cart to new user error:", error);
    },
  });
}
