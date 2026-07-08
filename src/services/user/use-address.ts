import { api } from "@/lib/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

/** Saved delivery address — mirrors the order shippingAddress shape. */
export interface UserAddress {
  id: string;
  user_id: string;
  type: "shipping" | "billing";
  is_default: boolean;
  label: string | null;
  name: string;
  phone: string;
  address: string;
  district: string;
  upazila: string;
  created_at?: string;
  updated_at?: string;
}

export interface AddressInput {
  label?: string;
  name: string;
  phone: string;
  address: string;
  district: string;
  upazila: string;
  isDefault?: boolean;
}

export const addressQueryKeys = {
  all: ["addresses"] as const,
};

export function useAddresses(enabled = true) {
  return useQuery({
    queryKey: addressQueryKeys.all,
    queryFn: () => api.get<UserAddress[]>("/auth/addresses"),
    enabled,
    staleTime: 60 * 1000,
  });
}

export function useCreateAddress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: AddressInput) => api.post<UserAddress>("/auth/addresses", input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: addressQueryKeys.all }),
  });
}

export function useUpdateAddress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<AddressInput> }) =>
      api.patch<UserAddress>(`/auth/addresses/${id}`, updates),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: addressQueryKeys.all }),
  });
}

export function useDeleteAddress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/auth/addresses/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: addressQueryKeys.all }),
  });
}
