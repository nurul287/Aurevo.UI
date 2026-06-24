import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { Category } from "@/services/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { productQueryKeys } from "../product/use-product-query";

export interface CreateCategoryParams {
  name: string;
  slug: string;
  description?: string;
  parent_id?: string;
  image_url?: string;
  sort_order?: number;
  is_active?: boolean;
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
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: (params: CreateCategoryParams) =>
      api.post<Category>("/categories", params),
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
    mutationFn: ({ id, ...patch }: UpdateCategoryParams) =>
      api.patch<Category>(`/categories/${id}`, patch),
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
