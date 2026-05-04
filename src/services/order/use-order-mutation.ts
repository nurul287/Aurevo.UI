import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FulfillmentStatus, OrderStatus, PaymentStatus } from "../types";
import { orderQueryKeys } from "./use-order-query";

// Mutation parameter interfaces
export interface UpdateOrderStatusParams {
  orderId: string;
  status: OrderStatus;
  internalNotes?: string;
}

export interface UpdatePaymentStatusParams {
  orderId: string;
  paymentStatus: PaymentStatus;
  internalNotes?: string;
}

export interface UpdateFulfillmentStatusParams {
  orderId: string;
  fulfillmentStatus: FulfillmentStatus;
  trackingNumber?: string;
  estimatedDeliveryDate?: string;
  internalNotes?: string;
}

export interface UpdateOrderNotesParams {
  orderId: string;
  notes?: string;
  internalNotes?: string;
}

export interface BulkUpdateOrderStatusParams {
  orderIds: string[];
  status: OrderStatus;
  internalNotes?: string;
}

export interface CreateGuestOrderParams {
  /** When set, order is linked to this account (dashboard / history). */
  user_id?: string | null;
  email?: string | null;
  phone?: string;
  firstName?: string;
  lastName?: string;
  billingAddress: any;
  shippingAddress: any;
  items: Array<{
    product_id: string;
    variant_id?: string;
    quantity: number;
    unit_price: number;
  }>;
  subtotal: number;
  tax_amount?: number;
  shipping_amount?: number;
  discount_amount?: number;
  total_amount: number;
  payment_method: string;
  notes?: string;
  session_id?: string;
}

/**
 * Hook for updating order status
 */
export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: async (params: UpdateOrderStatusParams) => {
      console.log("📦 Updating order status:", params);

      const { data, error } = await supabase
        .from("orders")
        .update({
          status: params.status,
          internal_notes: params.internalNotes,
          updated_at: new Date().toISOString(),
        })
        .eq("id", params.orderId)
        .select()
        .single();

      if (error) {
        console.error("❌ Error updating order status:", error);
        throw error;
      }

      console.log("✅ Order status updated:", data);
      return data;
    },
    onSuccess: (data, variables) => {
      const statusLabels = {
        pending: "Pending",
        confirmed: "Confirmed",
        processing: "Processing",
        shipped: "Shipped",
        delivered: "Delivered",
        cancelled: "Cancelled",
        refunded: "Refunded",
      };

      showSuccess(
        "Order Status Updated",
        `Order ${data.order_number} status updated to ${
          statusLabels[variables.status]
        }`
      );

      // Invalidate and refetch order queries
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({
        queryKey: orderQueryKeys.order(variables.orderId),
      });
      queryClient.invalidateQueries({ queryKey: ["orders", "stats"] });
    },
    onError: (error) => {
      console.error("❌ Error updating order status:", error);
      showError("Failed to Update Order Status", error.message);
    },
  });
}

/** `payments.status` uses gateway-style values; align with `orders.payment_status`. */
function orderPaymentStatusToPaymentRowStatus(
  ps: PaymentStatus,
): "pending" | "succeeded" | "failed" | "cancelled" | "refunded" {
  switch (ps) {
    case "paid":
      return "succeeded";
    case "failed":
      return "failed";
    case "refunded":
    case "partially_refunded":
      return "refunded";
    case "pending":
    default:
      return "pending";
  }
}

/**
 * Hook for updating payment status
 */
export function useUpdatePaymentStatus() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: async (params: UpdatePaymentStatusParams) => {
      console.log("💳 Updating payment status:", params);

      const { data, error } = await supabase
        .from("orders")
        .update({
          payment_status: params.paymentStatus,
          internal_notes: params.internalNotes,
          updated_at: new Date().toISOString(),
        })
        .eq("id", params.orderId)
        .select()
        .single();

      if (error) {
        console.error("❌ Error updating payment status:", error);
        throw error;
      }

      const rowStatus = orderPaymentStatusToPaymentRowStatus(
        params.paymentStatus,
      );
      const { error: paymentsError } = await supabase
        .from("payments")
        .update({
          status: rowStatus,
          processed_at:
            rowStatus === "succeeded" ? new Date().toISOString() : null,
        })
        .eq("order_id", params.orderId);

      if (paymentsError) {
        console.error("❌ Error syncing payment rows:", paymentsError);
        throw paymentsError;
      }

      console.log("✅ Payment status updated:", data);
      return data;
    },
    onSuccess: (data, variables) => {
      const statusLabels = {
        pending: "Pending",
        paid: "Paid",
        failed: "Failed",
        refunded: "Refunded",
        partially_refunded: "Partially Refunded",
      };

      showSuccess(
        "Payment Status Updated",
        `Order ${data.order_number} payment status updated to ${
          statusLabels[variables.paymentStatus]
        }`
      );

      // Invalidate and refetch order queries
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({
        queryKey: orderQueryKeys.order(variables.orderId),
      });
      queryClient.invalidateQueries({
        queryKey: orderQueryKeys.orderPayments(variables.orderId),
      });
      queryClient.invalidateQueries({ queryKey: ["orders", "stats"] });
    },
    onError: (error) => {
      console.error("❌ Error updating payment status:", error);
      showError("Failed to Update Payment Status", error.message);
    },
  });
}

/**
 * Hook for updating fulfillment status
 */
export function useUpdateFulfillmentStatus() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: async (params: UpdateFulfillmentStatusParams) => {
      console.log("🚚 Updating fulfillment status:", params);

      const updateData: any = {
        fulfillment_status: params.fulfillmentStatus,
        internal_notes: params.internalNotes,
        updated_at: new Date().toISOString(),
      };

      if (params.trackingNumber) {
        updateData.tracking_number = params.trackingNumber;
      }

      if (params.estimatedDeliveryDate) {
        updateData.estimated_delivery_date = params.estimatedDeliveryDate;
      }

      const { data, error } = await supabase
        .from("orders")
        .update(updateData)
        .eq("id", params.orderId)
        .select()
        .single();

      if (error) {
        console.error("❌ Error updating fulfillment status:", error);
        throw error;
      }

      console.log("✅ Fulfillment status updated:", data);
      return data;
    },
    onSuccess: (data, variables) => {
      const statusLabels = {
        unfulfilled: "Unfulfilled",
        partial: "Partially Fulfilled",
        fulfilled: "Fulfilled",
      };

      showSuccess(
        "Fulfillment Status Updated",
        `Order ${data.order_number} fulfillment status updated to ${
          statusLabels[variables.fulfillmentStatus]
        }`
      );

      // Invalidate and refetch order queries
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({
        queryKey: orderQueryKeys.order(variables.orderId),
      });
      queryClient.invalidateQueries({ queryKey: ["orders", "stats"] });
    },
    onError: (error) => {
      console.error("❌ Error updating fulfillment status:", error);
      showError("Failed to Update Fulfillment Status", error.message);
    },
  });
}

/**
 * Hook for updating order notes
 */
export function useUpdateOrderNotes() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: async (params: UpdateOrderNotesParams) => {
      console.log("📝 Updating order notes:", params);

      const { data, error } = await supabase
        .from("orders")
        .update({
          notes: params.notes,
          internal_notes: params.internalNotes,
          updated_at: new Date().toISOString(),
        })
        .eq("id", params.orderId)
        .select()
        .single();

      if (error) {
        console.error("❌ Error updating order notes:", error);
        throw error;
      }

      console.log("✅ Order notes updated:", data);
      return data;
    },
    onSuccess: (data) => {
      showSuccess(
        "Order Notes Updated",
        `Notes updated for order ${data.order_number}`
      );

      // Invalidate and refetch order queries
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({
        queryKey: orderQueryKeys.order(data.id),
      });
    },
    onError: (error) => {
      console.error("❌ Error updating order notes:", error);
      showError("Failed to Update Order Notes", error.message);
    },
  });
}

/**
 * Hook for bulk updating order status
 */
export function useBulkUpdateOrderStatus() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: async (params: BulkUpdateOrderStatusParams) => {
      console.log("📦 Bulk updating order status:", params);

      const { data, error } = await supabase
        .from("orders")
        .update({
          status: params.status,
          internal_notes: params.internalNotes,
          updated_at: new Date().toISOString(),
        })
        .in("id", params.orderIds)
        .select();

      if (error) {
        console.error("❌ Error bulk updating order status:", error);
        throw error;
      }

      console.log("✅ Order status bulk updated:", data);
      return data;
    },
    onSuccess: (_, variables) => {
      const statusLabels = {
        pending: "Pending",
        confirmed: "Confirmed",
        processing: "Processing",
        shipped: "Shipped",
        delivered: "Delivered",
        cancelled: "Cancelled",
        refunded: "Refunded",
      };

      showSuccess(
        "Orders Updated",
        `${variables.orderIds.length} orders updated to ${
          statusLabels[variables.status]
        }`
      );

      // Invalidate and refetch order queries
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["orders", "stats"] });
    },
    onError: (error) => {
      console.error("❌ Error bulk updating order status:", error);
      showError("Failed to Update Orders", error.message);
    },
  });
}

/**
 * Hook for deleting an order (soft delete by setting status to cancelled)
 */
export function useCancelOrder() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: async (orderId: string) => {
      console.log("❌ Cancelling order:", orderId);

      const { data, error } = await supabase
        .from("orders")
        .update({
          status: "cancelled",
          updated_at: new Date().toISOString(),
        })
        .eq("id", orderId)
        .select()
        .single();

      if (error) {
        console.error("❌ Error cancelling order:", error);
        throw error;
      }

      console.log("✅ Order cancelled:", data);
      return data;
    },
    onSuccess: (data) => {
      showSuccess(
        "Order Cancelled",
        `Order ${data.order_number} has been cancelled`
      );

      // Invalidate and refetch order queries
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({
        queryKey: orderQueryKeys.order(data.id),
      });
      queryClient.invalidateQueries({ queryKey: ["orders", "stats"] });
    },
    onError: (error) => {
      console.error("❌ Error cancelling order:", error);
      showError("Failed to Cancel Order", error.message);
    },
  });
}

/**
 * Hook for creating a guest order
 */
export function useCreateGuestOrder() {
  const queryClient = useQueryClient();
  const { showSuccess } = useToast();

  return useMutation({
    mutationFn: async (params: CreateGuestOrderParams) => {
      console.log("🛒 Creating guest order:", params);

      // Generate guest token in frontend
      const rpcUserId = params.user_id ?? null;

      const generateGuestToken = () => {
        const arr = new Uint8Array(16);
        crypto.getRandomValues(arr);
        return Array.from(arr)
          .map((b) => b.toString(16).padStart(2, "0"))
          .join("");
      };

      const guest_token = rpcUserId ? null : generateGuestToken();

      // Use the stored procedure to create the order
      const { data: order, error: orderError } = await supabase.rpc(
        "create_order",
        {
          user_id: rpcUserId,
          email: params.email,
          phone: params.phone ?? null,
          items: params.items.map((item) => ({
            product_id: item.product_id,
            variant_id: item.variant_id,
            quantity: item.quantity,
            unit_price: item.unit_price,
          })),
          billing_address: params.billingAddress,
          shipping_address: params.shippingAddress,
          notes: params.notes ?? "",
          session_id: params.session_id ?? null,
          payment_method: params.payment_method,
          guest_token,
          p_tax_amount: params.tax_amount ?? 0,
          p_shipping_amount: params.shipping_amount ?? 0,
          p_discount_amount: params.discount_amount ?? 0,
        }
      );

      if (orderError) {
        console.error("❌ Error creating order:", orderError);
        throw orderError;
      }

      console.log("✅ Order created:", order);
      return { order, guest_token };
    },
    onSuccess: (data) => {
      showSuccess(
        "Order Created",
        `Your order ${data.order.order_number} has been created successfully`
      );

      // Invalidate and refetch order queries
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["orders", "stats"] });
      queryClient.invalidateQueries({ queryKey: ["user", "orders"] });
    },
    onError: (error) => {
      console.error("❌ Error creating guest order:", error);
    },
  });
}
