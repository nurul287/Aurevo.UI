import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { productQueryKeys } from "../product/use-product-query";

// Types for brand mutations
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

/**
 * Hook for creating a new brand
 */
export function useCreateBrand() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: async (params: CreateBrandParams) => {
      console.log("🏷️ Creating brand:", params);

      const { data, error } = await supabase
        .from("brands")
        .insert({
          name: params.name,
          slug: params.slug,
          description: params.description,
          logo_url: params.logo_url,
          website_url: params.website_url,
          is_active: params.is_active ?? true,
        })
        .select()
        .single();

      if (error) {
        console.error("❌ Error creating brand:", error);
        throw error;
      }

      console.log("✅ Brand created:", data);
      return data;
    },
    onSuccess: () => {
      showSuccess("Brand Created", "Brand has been successfully created");
      // Invalidate and refetch brand queries
      queryClient.invalidateQueries({ queryKey: productQueryKeys.brands });
    },
    onError: (error) => {
      console.error("❌ Error creating brand:", error);
      showError("Failed to Create Brand", error.message);
    },
  });
}

/**
 * Hook for updating a brand
 */
export function useUpdateBrand() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: async (params: UpdateBrandParams) => {
      console.log("🏷️ Updating brand:", params);

      const { data, error } = await supabase
        .from("brands")
        .update({
          name: params.name,
          slug: params.slug,
          description: params.description,
          logo_url: params.logo_url,
          website_url: params.website_url,
          is_active: params.is_active,
        })
        .eq("id", params.id)
        .select()
        .single();

      if (error) {
        console.error("❌ Error updating brand:", error);
        throw error;
      }

      console.log("✅ Brand updated:", data);
      return data;
    },
    onSuccess: () => {
      showSuccess("Brand Updated", "Brand has been successfully updated");
      // Invalidate and refetch brand queries
      queryClient.invalidateQueries({ queryKey: productQueryKeys.brands });
    },
    onError: (error) => {
      console.error("❌ Error updating brand:", error);
      showError("Failed to Update Brand", error.message);
    },
  });
}

/**
 * Hook for deleting a brand
 */
export function useDeleteBrand() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: async (brandId: string) => {
      console.log("🗑️ Deleting brand:", brandId);

      // Check if brand has products
      const { data: products, error: productsError } = await supabase
        .from("products")
        .select("id")
        .eq("brand_id", brandId)
        .limit(1);

      if (productsError) {
        console.error("❌ Error checking products:", productsError);
        throw productsError;
      }

      if (products && products.length > 0) {
        throw new Error("Cannot delete brand with existing products");
      }

      // Delete the brand
      const { error } = await supabase
        .from("brands")
        .delete()
        .eq("id", brandId);

      if (error) {
        console.error("❌ Error deleting brand:", error);
        throw error;
      }

      console.log("✅ Brand deleted");
      return brandId;
    },
    onSuccess: () => {
      showSuccess("Brand Deleted", "Brand has been successfully deleted");
      // Invalidate and refetch brand queries
      queryClient.invalidateQueries({ queryKey: productQueryKeys.brands });
    },
    onError: (error) => {
      console.error("❌ Error deleting brand:", error);
      showError("Failed to Delete Brand", error.message);
    },
  });
}

/**
 * Hook for bulk updating brand status
 */
export function useBulkUpdateBrandStatus() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: async ({
      brandIds,
      isActive,
    }: {
      brandIds: string[];
      isActive: boolean;
    }) => {
      console.log("🏷️ Bulk updating brand status:", { brandIds, isActive });

      const { error } = await supabase
        .from("brands")
        .update({ is_active: isActive })
        .in("id", brandIds);

      if (error) {
        console.error("❌ Error bulk updating brand status:", error);
        throw error;
      }

      console.log("✅ Brand status bulk updated");
      return brandIds;
    },
    onSuccess: (brandIds, { isActive }) => {
      const status = isActive ? "activated" : "deactivated";
      showSuccess(
        "Brands Updated",
        `${brandIds.length} brands have been ${status}`
      );
      // Invalidate and refetch brand queries
      queryClient.invalidateQueries({ queryKey: productQueryKeys.brands });
    },
    onError: (error) => {
      console.error("❌ Error bulk updating brand status:", error);
      showError("Failed to Update Brands", error.message);
    },
  });
}
