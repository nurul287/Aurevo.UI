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

type CheckoutAddress = {
  firstName?: string;
  lastName?: string;
  name?: string;
  phone?: string;
  address?: string;
  district?: string;
  upazila?: string;
};

export interface CreateGuestOrderParams {
  user_id?: string | null;
  email?: string | null;
  phone?: string;
  firstName?: string;
  lastName?: string;
  billingAddress: CheckoutAddress;
  shippingAddress: CheckoutAddress;
  items: Array<{
    product_id?: string;
    variant_id?: string;
    quantity: number;
    unit_price?: number;
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

function normalizeAddress(addr: CheckoutAddress): {
  name: string;
  phone: string;
  address: string;
  district: string;
  upazila: string;
} {
  return {
    name: addr.name ?? `${addr.firstName ?? ""} ${addr.lastName ?? ""}`.trim(),
    phone: addr.phone ?? "",
    address: addr.address ?? "",
    district: addr.district ?? "",
    upazila: addr.upazila ?? "",
  };
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
          email: params.email ?? undefined,
          phone: params.phone ?? undefined,
          paymentMethod: params.payment_method,
          shippingAddress: normalizeAddress(params.shippingAddress),
          billingAddress: params.billingAddress
            ? normalizeAddress(params.billingAddress)
            : undefined,
          notes: params.notes ?? "",
          // BE only needs variantId + quantity — price is resolved server-side
          items: params.items
            .filter((i) => !!i.variant_id)
            .map((i) => ({ variantId: i.variant_id!, quantity: i.quantity })),
        },
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
