import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { productQueryKeys } from "../product/use-product-query";

// Types for category mutations
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
  /** Pass `null` or empty string to clear the image in the database. */
  image_url?: string | null;
  sort_order?: number;
  is_active?: boolean;
}

/**
 * Hook for creating a new category
 */
export function useCreateCategory() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: async (params: CreateCategoryParams) => {
      console.log("📁 Creating category:", params);

      const row: Record<string, unknown> = {
        name: params.name,
        slug: params.slug,
        sort_order: params.sort_order ?? 0,
        is_active: params.is_active ?? true,
      };
      if (params.description !== undefined) {
        row.description = params.description;
      }
      if (params.parent_id !== undefined) {
        row.parent_id = params.parent_id;
      }
      if (params.image_url !== undefined && params.image_url !== "") {
        row.image_url = params.image_url;
      }

      const { data, error } = await supabase
        .from("categories")
        .insert(row)
        .select()
        .single();

      if (error) {
        console.error("❌ Error creating category:", error);
        throw error;
      }

      console.log("✅ Category created:", data);
      return data;
    },
    onSuccess: () => {
      showSuccess("Category Created", "Category has been successfully created");
      // Invalidate and refetch category queries
      queryClient.invalidateQueries({ queryKey: productQueryKeys.categories });
    },
    onError: (error) => {
      console.error("❌ Error creating category:", error);
      showError("Failed to Create Category", error.message);
    },
  });
}

/**
 * Hook for updating a category
 */
export function useUpdateCategory() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: async (params: UpdateCategoryParams) => {
      console.log("📁 Updating category:", params);

      const patch: Record<string, unknown> = {};
      if (params.name !== undefined) patch.name = params.name;
      if (params.slug !== undefined) patch.slug = params.slug;
      if (params.description !== undefined) {
        patch.description = params.description;
      }
      if (params.parent_id !== undefined) {
        patch.parent_id = params.parent_id;
      }
      if (params.image_url !== undefined) {
        patch.image_url =
          params.image_url === "" || params.image_url === null
            ? null
            : params.image_url;
      }
      if (params.sort_order !== undefined) patch.sort_order = params.sort_order;
      if (params.is_active !== undefined) patch.is_active = params.is_active;

      if (Object.keys(patch).length === 0) {
        throw new Error("Nothing to update");
      }

      const { data, error } = await supabase
        .from("categories")
        .update(patch)
        .eq("id", params.id)
        .select()
        .single();

      if (error) {
        console.error("❌ Error updating category:", error);
        throw error;
      }

      console.log("✅ Category updated:", data);
      return data;
    },
    onSuccess: () => {
      showSuccess("Category Updated", "Category has been successfully updated");
      // Invalidate and refetch category queries
      queryClient.invalidateQueries({ queryKey: productQueryKeys.categories });
    },
    onError: (error) => {
      console.error("❌ Error updating category:", error);
      showError("Failed to Update Category", error.message);
    },
  });
}

/**
 * Hook for deleting a category
 */
export function useDeleteCategory() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: async (categoryId: string) => {
      console.log("🗑️ Deleting category:", categoryId);

      // Check if category has products
      const { data: products, error: productsError } = await supabase
        .from("products")
        .select("id")
        .eq("category_id", categoryId)
        .limit(1);

      if (productsError) {
        console.error("❌ Error checking products:", productsError);
        throw productsError;
      }

      if (products && products.length > 0) {
        throw new Error("Cannot delete category with existing products");
      }

      // Check if category has subcategories
      const { data: subcategories, error: subcategoriesError } = await supabase
        .from("categories")
        .select("id")
        .eq("parent_id", categoryId)
        .limit(1);

      if (subcategoriesError) {
        console.error("❌ Error checking subcategories:", subcategoriesError);
        throw subcategoriesError;
      }

      if (subcategories && subcategories.length > 0) {
        throw new Error("Cannot delete category with existing subcategories");
      }

      // Delete the category
      const { error } = await supabase
        .from("categories")
        .delete()
        .eq("id", categoryId);

      if (error) {
        console.error("❌ Error deleting category:", error);
        throw error;
      }

      console.log("✅ Category deleted");
      return categoryId;
    },
    onSuccess: () => {
      showSuccess("Category Deleted", "Category has been successfully deleted");
      // Invalidate and refetch category queries
      queryClient.invalidateQueries({ queryKey: productQueryKeys.categories });
    },
    onError: (error) => {
      console.error("❌ Error deleting category:", error);
      showError("Failed to Delete Category", error.message);
    },
  });
}

/**
 * Hook for bulk updating category status
 */
export function useBulkUpdateCategoryStatus() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: async ({
      categoryIds,
      isActive,
    }: {
      categoryIds: string[];
      isActive: boolean;
    }) => {
      console.log("📁 Bulk updating category status:", {
        categoryIds,
        isActive,
      });

      const { error } = await supabase
        .from("categories")
        .update({ is_active: isActive })
        .in("id", categoryIds);

      if (error) {
        console.error("❌ Error bulk updating category status:", error);
        throw error;
      }

      console.log("✅ Category status bulk updated");
      return categoryIds;
    },
    onSuccess: (categoryIds, { isActive }) => {
      const status = isActive ? "activated" : "deactivated";
      showSuccess(
        "Categories Updated",
        `${categoryIds.length} categories have been ${status}`
      );
      // Invalidate and refetch category queries
      queryClient.invalidateQueries({ queryKey: productQueryKeys.categories });
    },
    onError: (error) => {
      console.error("❌ Error bulk updating category status:", error);
      showError("Failed to Update Categories", error.message);
    },
  });
}
