import { useToast } from "@/hooks/use-toast";
import { api, apiFetchForm } from "@/lib/api";
import { Brand } from "@/services/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { productQueryKeys } from "../product/use-product-query";

export interface CreateBrandParams {
  name: string;
  slug: string;
  description?: string;
  website_url?: string;
  is_active?: boolean;
  logoFile?: File;
}

export interface UpdateBrandParams {
  id: string;
  name?: string;
  slug?: string;
  description?: string;
  website_url?: string;
  is_active?: boolean;
  logoFile?: File;
}

function buildBrandFormData(params: Omit<CreateBrandParams, "id">): FormData {
  const fd = new FormData();
  if (params.name) fd.append("name", params.name);
  if (params.slug) fd.append("slug", params.slug);
  if (params.description) fd.append("description", params.description);
  if (params.website_url) fd.append("websiteUrl", params.website_url);
  if (params.is_active !== undefined) fd.append("isActive", String(params.is_active));
  if (params.logoFile) fd.append("logo", params.logoFile);
  return fd;
}

export function useCreateBrand() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: ({ logoFile, ...params }: CreateBrandParams) =>
      apiFetchForm<Brand>("/brands", {
        method: "POST",
        formData: buildBrandFormData({ ...params, logoFile }),
      }),
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
    mutationFn: ({ id, logoFile, ...params }: UpdateBrandParams) =>
      apiFetchForm<Brand>(`/brands/${id}`, {
        method: "PATCH",
        formData: buildBrandFormData({ ...params, logoFile } as Omit<CreateBrandParams, "id">),
      }),
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
