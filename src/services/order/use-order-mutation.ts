import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FulfillmentStatus, OrderStatus, PaymentStatus } from "../types";
import { orderQueryKeys } from "./use-order-query";

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
  user_id?: string | null;
  email?: string | null;
  phone?: string;
  firstName?: string;
  lastName?: string;
  billingAddress: unknown;
  shippingAddress: unknown;
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

const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
  refunded: "Refunded",
};

const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  pending: "Pending",
  paid: "Paid",
  failed: "Failed",
  refunded: "Refunded",
  partially_refunded: "Partially Refunded",
};

const FULFILLMENT_STATUS_LABELS: Record<FulfillmentStatus, string> = {
  unfulfilled: "Unfulfilled",
  partial: "Partially Fulfilled",
  fulfilled: "Fulfilled",
};

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: (params: UpdateOrderStatusParams) =>
      api.patch<{ id: string; order_number: string }>(`/orders/${params.orderId}/status`, {
        status: params.status,
        internalNotes: params.internalNotes,
      }),
    onSuccess: (data, variables) => {
      showSuccess(
        "Order Status Updated",
        `Order ${data.order_number} status updated to ${ORDER_STATUS_LABELS[variables.status]}`
      );
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: orderQueryKeys.order(variables.orderId) });
      queryClient.invalidateQueries({ queryKey: ["orders", "stats"] });
    },
    onError: (error: Error) => {
      showError("Failed to Update Order Status", error.message);
    },
  });
}

export function useUpdatePaymentStatus() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: (params: UpdatePaymentStatusParams) =>
      api.patch<{ id: string; order_number: string }>(`/orders/${params.orderId}/payment-status`, {
        paymentStatus: params.paymentStatus,
        internalNotes: params.internalNotes,
      }),
    onSuccess: (data, variables) => {
      showSuccess(
        "Payment Status Updated",
        `Order ${data.order_number} payment status updated to ${PAYMENT_STATUS_LABELS[variables.paymentStatus]}`
      );
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: orderQueryKeys.order(variables.orderId) });
      queryClient.invalidateQueries({ queryKey: orderQueryKeys.orderPayments(variables.orderId) });
      queryClient.invalidateQueries({ queryKey: ["orders", "stats"] });
    },
    onError: (error: Error) => {
      showError("Failed to Update Payment Status", error.message);
    },
  });
}

export function useUpdateFulfillmentStatus() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: (params: UpdateFulfillmentStatusParams) =>
      api.patch<{ id: string; order_number: string }>(`/orders/${params.orderId}/fulfillment-status`, {
        fulfillmentStatus: params.fulfillmentStatus,
        trackingNumber: params.trackingNumber,
        estimatedDeliveryDate: params.estimatedDeliveryDate,
        internalNotes: params.internalNotes,
      }),
    onSuccess: (data, variables) => {
      showSuccess(
        "Fulfillment Status Updated",
        `Order ${data.order_number} fulfillment status updated to ${FULFILLMENT_STATUS_LABELS[variables.fulfillmentStatus]}`
      );
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: orderQueryKeys.order(variables.orderId) });
      queryClient.invalidateQueries({ queryKey: ["orders", "stats"] });
    },
    onError: (error: Error) => {
      showError("Failed to Update Fulfillment Status", error.message);
    },
  });
}

export function useUpdateOrderNotes() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: (params: UpdateOrderNotesParams) =>
      api.patch<{ id: string; order_number: string }>(`/orders/${params.orderId}`, {
        notes: params.notes,
        internalNotes: params.internalNotes,
      }),
    onSuccess: (data) => {
      showSuccess("Order Notes Updated", `Notes updated for order ${data.order_number}`);
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: orderQueryKeys.order(data.id) });
    },
    onError: (error: Error) => {
      showError("Failed to Update Order Notes", error.message);
    },
  });
}

export function useBulkUpdateOrderStatus() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: (params: BulkUpdateOrderStatusParams) =>
      Promise.all(
        params.orderIds.map((id) =>
          api.patch(`/orders/${id}/status`, {
            status: params.status,
            internalNotes: params.internalNotes,
          })
        )
      ),
    onSuccess: (_, variables) => {
      showSuccess(
        "Orders Updated",
        `${variables.orderIds.length} orders updated to ${ORDER_STATUS_LABELS[variables.status]}`
      );
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["orders", "stats"] });
    },
    onError: (error: Error) => {
      showError("Failed to Update Orders", error.message);
    },
  });
}

export function useCancelOrder() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: (orderId: string) =>
      api.patch<{ id: string; order_number: string }>(`/orders/${orderId}/cancel`),
    onSuccess: (data) => {
      showSuccess("Order Cancelled", `Order ${data.order_number} has been cancelled`);
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: orderQueryKeys.order(data.id) });
      queryClient.invalidateQueries({ queryKey: ["orders", "stats"] });
    },
    onError: (error: Error) => {
      showError("Failed to Cancel Order", error.message);
    },
  });
}

export function useCreateGuestOrder() {
  const queryClient = useQueryClient();
  const { showSuccess } = useToast();

  return useMutation({
    mutationFn: (params: CreateGuestOrderParams) =>
      api.post<{ order: { id: string; order_number: string }; guest_token: string | null }>(
        "/orders",
        {
          userId: params.user_id ?? null,
          email: params.email,
          phone: params.phone ?? null,
          firstName: params.firstName,
          lastName: params.lastName,
          billingAddress: params.billingAddress,
          shippingAddress: params.shippingAddress,
          items: params.items,
          subtotal: params.subtotal,
          taxAmount: params.tax_amount ?? 0,
          shippingAmount: params.shipping_amount ?? 0,
          discountAmount: params.discount_amount ?? 0,
          totalAmount: params.total_amount,
          paymentMethod: params.payment_method,
          notes: params.notes ?? "",
          sessionId: params.session_id ?? null,
        },
        // Allow optionalAuth — guests send no token; logged-in users get their JWT
        { skipAuth: !params.user_id }
      ),
    onSuccess: (data) => {
      showSuccess(
        "Order Created",
        `Your order ${data.order.order_number} has been created successfully`
      );
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["orders", "stats"] });
      queryClient.invalidateQueries({ queryKey: ["user", "orders"] });
    },
    onError: (error: Error) => {
      console.error("Error creating order:", error);
    },
  });
}
