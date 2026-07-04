import { useToast } from "@/hooks/use-toast";
import { apiFetchForm } from "@/lib/api";
import { Category } from "@/services/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { productQueryKeys } from "../product/use-product-query";
import { api } from "@/lib/api";

export interface CreateCategoryParams {
  name: string;
  slug: string;
  description?: string;
  parent_id?: string;
  image_url?: string;
  sort_order?: number;
  is_active?: boolean;
  imageFile?: File;
}

export interface UpdateCategoryParams {
  id: string;
  name?: string;
  slug?: string;
  description?: string | null;
  parent_id?: string | null;
  image_url?: string | null;
  sort_order?: number;
  is_active?: boolean;
  imageFile?: File;
}

function buildCategoryFormData(params: Omit<CreateCategoryParams, "id">): FormData {
  const fd = new FormData();
  if (params.name) fd.append("name", params.name);
  if (params.slug) fd.append("slug", params.slug);
  if (params.description) fd.append("description", params.description);
  if (params.parent_id) fd.append("parentId", params.parent_id);
  if (params.sort_order !== undefined) fd.append("sortOrder", String(params.sort_order));
  if (params.is_active !== undefined) fd.append("isActive", String(params.is_active));
  if (params.image_url) fd.append("imageUrl", params.image_url);
  if (params.imageFile) fd.append("image", params.imageFile);
  return fd;
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: ({ imageFile, ...params }: CreateCategoryParams) =>
      apiFetchForm<Category>("/categories", {
        method: "POST",
        formData: buildCategoryFormData({ ...params, imageFile }),
      }),
    onSuccess: () => {
      showSuccess("Category Created", "Category has been successfully created");
      queryClient.invalidateQueries({ queryKey: productQueryKeys.categories });
    },
    onError: (error: Error) => {
      showError("Failed to Create Category", error.message);
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: ({ id, imageFile, ...params }: UpdateCategoryParams) =>
      apiFetchForm<Category>(`/categories/${id}`, {
        method: "PATCH",
        formData: buildCategoryFormData(params as Omit<CreateCategoryParams, "id">),
      }),
    onSuccess: () => {
      showSuccess("Category Updated", "Category has been successfully updated");
      queryClient.invalidateQueries({ queryKey: productQueryKeys.categories });
    },
    onError: (error: Error) => {
      showError("Failed to Update Category", error.message);
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: (categoryId: string) =>
      api.delete(`/categories/${categoryId}`),
    onSuccess: () => {
      showSuccess("Category Deleted", "Category has been successfully deleted");
      queryClient.invalidateQueries({ queryKey: productQueryKeys.categories });
    },
    onError: (error: Error) => {
      showError("Failed to Delete Category", error.message);
    },
  });
}

export function useBulkUpdateCategoryStatus() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: ({
      categoryIds,
      isActive,
    }: {
      categoryIds: string[];
      isActive: boolean;
    }) =>
      Promise.all(
        categoryIds.map((id) => api.patch(`/categories/${id}`, { isActive }))
      ),
    onSuccess: (_, { categoryIds, isActive }) => {
      const status = isActive ? "activated" : "deactivated";
      showSuccess(
        "Categories Updated",
        `${categoryIds.length} categories have been ${status}`
      );
      queryClient.invalidateQueries({ queryKey: productQueryKeys.categories });
    },
    onError: (error: Error) => {
      showError("Failed to Update Categories", error.message);
    },
  });
}
