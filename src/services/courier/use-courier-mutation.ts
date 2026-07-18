import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Order } from "../types";
import { orderQueryKeys } from "../order/use-order-query";

export function useShipOrderWithCourier() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: (orderId: string) => api.post<Order>(`/courier/orders/${orderId}/ship`),
    onSuccess: (data, orderId) => {
      showSuccess(
        "Consignment Booked",
        `Order ${data.order_number} was booked with Steadfast (tracking: ${data.tracking_number})`,
      );
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: orderQueryKeys.order(orderId) });
    },
    onError: (error: Error) => {
      showError("Failed to Book Courier", error.message);
    },
  });
}

export function useRefreshCourierStatus() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: (orderId: string) => api.post<Order>(`/courier/orders/${orderId}/refresh`),
    onSuccess: (data, orderId) => {
      showSuccess(
        "Status Refreshed",
        `Order ${data.order_number} courier status: ${data.courier_status ?? "unknown"}`,
      );
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: orderQueryKeys.order(orderId) });
    },
    onError: (error: Error) => {
      showError("Failed to Refresh Status", error.message);
    },
  });
}
