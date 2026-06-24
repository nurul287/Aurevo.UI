import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { Brand } from "@/services/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { productQueryKeys } from "../product/use-product-query";

export interface CreateBrandParams {
  name: string;
  slug: string;
  description?: string;
  logo_url?: string;
  website_url?: string;
  is_active?: boolean;
}

export interface UpdateBrandParams {
  id: string;
  name?: string;
  slug?: string;
  description?: string;
  logo_url?: string;
  website_url?: string;
  is_active?: boolean;
}

export function useCreateBrand() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: (params: CreateBrandParams) =>
      api.post<Brand>("/brands", params),
    onSuccess: () => {
      showSuccess("Brand Created", "Brand has been successfully created");
      queryClient.invalidateQueries({ queryKey: productQueryKeys.brands });
    },
    onError: (error: Error) => {
      showError("Failed to Create Brand", error.message);
    },
  });
}

export function useUpdateBrand() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: ({ id, ...patch }: UpdateBrandParams) =>
      api.patch<Brand>(`/brands/${id}`, patch),
    onSuccess: () => {
      showSuccess("Brand Updated", "Brand has been successfully updated");
      queryClient.invalidateQueries({ queryKey: productQueryKeys.brands });
    },
    onError: (error: Error) => {
      showError("Failed to Update Brand", error.message);
    },
  });
}

export function useDeleteBrand() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: (brandId: string) => api.delete(`/brands/${brandId}`),
    onSuccess: () => {
      showSuccess("Brand Deleted", "Brand has been successfully deleted");
      queryClient.invalidateQueries({ queryKey: productQueryKeys.brands });
    },
    onError: (error: Error) => {
      showError("Failed to Delete Brand", error.message);
    },
  });
}

export function useBulkUpdateBrandStatus() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: ({
      brandIds,
      isActive,
    }: {
      brandIds: string[];
      isActive: boolean;
    }) =>
      Promise.all(
        brandIds.map((id) => api.patch(`/brands/${id}`, { isActive }))
      ),
    onSuccess: (_, { brandIds, isActive }) => {
      const status = isActive ? "activated" : "deactivated";
      showSuccess(
        "Brands Updated",
        `${brandIds.length} brands have been ${status}`
      );
      queryClient.invalidateQueries({ queryKey: productQueryKeys.brands });
    },
    onError: (error: Error) => {
      showError("Failed to Update Brands", error.message);
    },
  });
}
