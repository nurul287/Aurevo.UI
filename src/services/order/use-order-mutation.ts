import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface CreateGuestOrderData {
  // Guest information
  email: string;
  phone: string;
  firstName: string;
  lastName?: string;

  // Shipping information
  district: string;
  thana: string;
  address: string;
  orderNote?: string;

  // Cart information
  sessionId: string;

  // Payment information
  paymentMethod: string;

  // Optional user ID (if guest creates account)
  userId?: string;
}

interface CreateGuestOrderResponse {
  order: any;
  guest_token?: string;
}

interface OrderItem {
  product_id: string;
  variant_id: string;
  quantity: number;
  unit_price: number;
}

/**
 * Hook for creating a guest order using the edge function
 */
export function useCreateGuestOrder() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: async (
      data: CreateGuestOrderData
    ): Promise<CreateGuestOrderResponse> => {
      console.log("🛒 Creating guest order via edge function:", data);

      // Get auth session to determine if user is logged in
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const userId = session?.user?.id;

      console.log("🔐 User session:", { userId, sessionId: data.sessionId });

      // Get cart items - prioritize user_id if logged in, otherwise use session_id
      let cartQuery = supabase.from("cart_items").select(
        `
          *,
          product:products!product_id(*),
          variant:product_variants!variant_id(*)
        `
      );

      // If user is logged in, query by user_id, otherwise by session_id
      if (userId) {
        cartQuery = cartQuery.eq("user_id", userId);
      } else if (data.sessionId) {
        cartQuery = cartQuery.eq("session_id", data.sessionId);
      } else {
        throw new Error("No user ID or session ID available");
      }

      const { data: cartItems, error: cartError } = await cartQuery;

      console.log("cartItems", cartItems);

      if (cartError) {
        console.error("❌ Error fetching cart items:", cartError);
        throw new Error("Failed to fetch cart items");
      }

      if (!cartItems || cartItems.length === 0) {
        throw new Error("Cart is empty");
      }

      // Prepare order items for the edge function
      const items: OrderItem[] = cartItems.map((cartItem) => {
        const variantPrice = (cartItem.variant as any)?.price;
        const productPrice = (cartItem.product as any)?.base_price;
        const price = variantPrice || productPrice || cartItem.price || 0;

        return {
          product_id: cartItem.product_id,
          variant_id: cartItem.variant_id,
          quantity: cartItem.quantity,
          unit_price: price,
        };
      });

      // Prepare billing and shipping addresses
      const billingAddress = {
        first_name: data.firstName,
        last_name: data.lastName,
        email: data.email,
        phone: data.phone,
        district: data.district,
        thana: data.thana,
        address: data.address,
      };

      const shippingAddress = {
        first_name: data.firstName,
        last_name: data.lastName,
        email: data.email,
        phone: data.phone,
        district: data.district,
        thana: data.thana,
        address: data.address,
      };

      // Use the session we already fetched earlier
      const authToken = session?.access_token;
      console.log("authToken", session, authToken);

      // Call the edge function
      const edgeFunctionUrl = `${
        import.meta.env.VITE_SUPABASE_URL
      }/functions/v1/create-order`;

      const response = await fetch(edgeFunctionUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${
            authToken || import.meta.env.VITE_SUPABASE_ANON_KEY
          }`,
        },
        body: JSON.stringify({
          user_id: userId || data.userId || null,
          email: data.email,
          phone: data.phone,
          items: items,
          billing_address: billingAddress,
          shipping_address: shippingAddress,
          notes: data.orderNote || null,
          session_id: data.sessionId,
          payment_method: data.paymentMethod || "cash",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("❌ Edge function error:", errorData);
        throw new Error(errorData.error || "Failed to create order");
      }

      const result = await response.json();
      console.log("✅ Order created via edge function:", result);

      if (userId) {
        queryClient.invalidateQueries({
          queryKey: ["cart", "items", userId],
        });
        queryClient.invalidateQueries({
          queryKey: ["cart", "all", userId],
        });
      } else {
        queryClient.invalidateQueries({
          queryKey: ["cart", "", data.sessionId],
        });
        queryClient.invalidateQueries({
          queryKey: ["cart", "all", "", data.sessionId],
        });
      }

      return {
        order: result.order,
        guest_token: result.guest_token,
      };
    },
    onSuccess: (data) => {
      showSuccess(
        "Order created successfully!",
        `Order #${data.order.order_number} has been placed`
      );
    },
    onError: (error) => {
      console.error("Create guest order error:", error);
      showError(
        "Failed to create order",
        error.message || "Something went wrong. Please try again."
      );
    },
  });
}

/**
 * Hook for creating a user account after order completion
 */
export function useCreateUserAfterOrder() {
  const { showError } = useToast();

  return useMutation({
    mutationFn: async ({
      email,
      password,
      orderId,
    }: {
      email: string;
      password: string;
      orderId: string;
    }) => {
      console.log("👤 Creating user account after order:", { email, orderId });

      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) {
        console.error("❌ Error creating auth user:", authError);
        throw new Error(`Failed to create account: ${authError.message}`);
      }

      if (!authData.user) {
        throw new Error("Failed to create user");
      }

      // Update the order to link it to the new user
      const { error: updateOrderError } = await supabase
        .from("orders")
        .update({ user_id: authData.user.id })
        .eq("id", orderId);

      if (updateOrderError) {
        console.warn("⚠️ Could not link order to user:", updateOrderError);
        // Don't fail the user creation for this
      }

      console.log("✅ User account created and linked to order:", {
        userId: authData.user.id,
        orderId,
      });

      return {
        user: authData.user,
        orderId,
      };
    },
    onError: (error) => {
      console.error("Create user after order error:", error);
      showError(
        "Failed to create account",
        error.message || "Something went wrong. Please try again."
      );
    },
  });
}

/**
 * Hook for fetching order details with guest token support
 */
export function useFetchOrderWithGuestToken(
  orderId: string,
  guestToken?: string
) {
  const { showError } = useToast();

  return useMutation({
    mutationFn: async () => {
      console.log("🔍 Fetching order with guest token:", {
        orderId,
        guestToken,
      });

      if (guestToken) {
        // For guest orders, we need to verify the token first
        const { data: order, error } = await supabase.rpc(
          "verify_guest_token",
          {
            p_order_id: orderId,
            p_token: guestToken,
          }
        );

        if (error) {
          console.error("❌ Error verifying guest token:", error);
          throw new Error("Invalid guest token");
        }

        if (!order) {
          throw new Error("Order not found or invalid token");
        }

        // Fetch order details
        const { data: orderDetails, error: orderError } = await supabase
          .from("orders")
          .select(
            `
            *,
            order_items (
              *,
              product:products (*),
              variant:product_variants (*)
            )
          `
          )
          .eq("id", orderId)
          .single();

        if (orderError) {
          console.error("❌ Error fetching order details:", orderError);
          throw new Error("Failed to fetch order details");
        }

        return orderDetails;
      } else {
        // For authenticated users, use normal RLS
        const { data: orderDetails, error: orderError } = await supabase
          .from("orders")
          .select(
            `
            *,
            order_items (
              *,
              product:products (*),
              variant:product_variants (*)
            )
          `
          )
          .eq("id", orderId)
          .single();

        if (orderError) {
          console.error("❌ Error fetching order details:", orderError);
          throw new Error("Failed to fetch order details");
        }

        return orderDetails;
      }
    },
    onError: (error) => {
      console.error("Fetch order error:", error);
      showError(
        "Failed to fetch order",
        error.message || "Something went wrong. Please try again."
      );
    },
  });
}
