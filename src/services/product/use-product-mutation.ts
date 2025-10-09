import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { ProductGender } from "@/services/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { productQueryKeys } from "./use-product-query";

// Types for product mutations
export interface CreateProductParams {
  name: string;
  slug: string;
  description?: string;
  short_description?: string;
  sku?: string;
  category_id?: string;
  brand_id?: string;
  gender?: ProductGender;
  material?: string;
  care_instructions?: string;
  weight?: number;
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
  };
  base_price: number;
  compare_at_price?: number;
  cost_price?: number;
  is_featured?: boolean;
  requires_shipping?: boolean;
  track_inventory?: boolean;
  allow_backorder?: boolean;
  min_order_quantity?: number;
  max_order_quantity?: number;
  meta_title?: string;
  meta_description?: string;
  tags?: string[];
  variants?: CreateProductVariantParams[];
  images?: CreateProductImageParams[];
}

export interface CreateProductVariantParams {
  sku?: string;
  name?: string;
  size?: string;
  color?: string;
  color_code?: string;
  material?: string;
  weight?: number;
  price?: number;
  compare_at_price?: number;
  cost_price?: number;
  barcode?: string;
  sort_order?: number;
  initial_stock?: number;
}

export interface CreateProductImageParams {
  url: string;
  alt_text?: string;
  sort_order?: number;
  is_primary?: boolean;
}

export interface UpdateProductParams {
  id: string;
  name?: string;
  slug?: string;
  description?: string;
  short_description?: string;
  sku?: string;
  category_id?: string;
  brand_id?: string;
  gender?: ProductGender;
  material?: string;
  care_instructions?: string;
  weight?: number;
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
  };
  base_price?: number;
  compare_at_price?: number;
  cost_price?: number;
  is_active?: boolean;
  is_featured?: boolean;
  requires_shipping?: boolean;
  track_inventory?: boolean;
  allow_backorder?: boolean;
  min_order_quantity?: number;
  max_order_quantity?: number;
  meta_title?: string;
  meta_description?: string;
  tags?: string[];
}

export interface CreateProductVariantParams {
  product_id: string;
  sku?: string;
  name?: string;
  size?: string;
  color?: string;
  color_code?: string;
  material?: string;
  weight?: number;
  price?: number;
  compare_at_price?: number;
  cost_price?: number;
  barcode?: string;
  is_active?: boolean;
  sort_order?: number;
}

export interface UpdateProductVariantParams {
  id: string;
  sku?: string;
  name?: string;
  size?: string;
  color?: string;
  color_code?: string;
  material?: string;
  weight?: number;
  price?: number;
  compare_at_price?: number;
  cost_price?: number;
  barcode?: string;
  is_active?: boolean;
  sort_order?: number;
}

export interface CreateProductImageParams {
  product_id: string;
  variant_id?: string;
  url: string;
  alt_text?: string;
  sort_order?: number;
  is_primary?: boolean;
}

export interface UpdateProductImageParams {
  id: string;
  url?: string;
  alt_text?: string;
  sort_order?: number;
  is_primary?: boolean;
}

/**
 * Hook for creating a new product
 */
export function useCreateProduct() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: async (params: CreateProductParams) => {
      console.log("🛍️ Creating product:", params);

      // Start a transaction-like approach using Supabase
      const { data: product, error: productError } = await supabase
        .from("products")
        .insert({
          name: params.name,
          slug: params.slug,
          description: params.description,
          short_description: params.short_description,
          sku: params.sku,
          category_id: params.category_id,
          brand_id: params.brand_id,
          gender: params.gender,
          material: params.material,
          care_instructions: params.care_instructions,
          weight: params.weight,
          dimensions: params.dimensions,
          base_price: params.base_price,
          compare_at_price: params.compare_at_price,
          cost_price: params.cost_price,
          is_featured: params.is_featured || false,
          requires_shipping: params.requires_shipping ?? true,
          track_inventory: params.track_inventory ?? true,
          allow_backorder: params.allow_backorder || false,
          min_order_quantity: params.min_order_quantity || 1,
          max_order_quantity: params.max_order_quantity,
          meta_title: params.meta_title,
          meta_description: params.meta_description,
          tags: params.tags,
        })
        .select()
        .single();

      if (productError) {
        console.error("❌ Error creating product:", productError);
        throw productError;
      }

      console.log("✅ Product created:", product);

      // Create variants if provided
      if (params.variants && params.variants.length > 0) {
        const variants = params.variants.map((variant) => ({
          product_id: product.id,
          sku: variant.sku,
          name: variant.name,
          size: variant.size,
          color: variant.color,
          color_code: variant.color_code,
          material: variant.material,
          weight: variant.weight,
          price: variant.price || params.base_price,
          compare_at_price: variant.compare_at_price,
          cost_price: variant.cost_price,
          barcode: variant.barcode,
          sort_order: variant.sort_order || 0,
        }));

        const { data: createdVariants, error: variantsError } = await supabase
          .from("product_variants")
          .insert(variants)
          .select();

        if (variantsError) {
          console.error("❌ Error creating variants:", variantsError);
          // Clean up the product if variants fail
          await supabase.from("products").delete().eq("id", product.id);
          throw variantsError;
        }

        console.log("✅ Variants created:", createdVariants);

        // Create inventory entries for variants if initial stock is provided
        if (
          params.variants.some((v) => v.initial_stock && v.initial_stock > 0)
        ) {
          const inventoryEntries = createdVariants
            ?.map((variant, index) => {
              const initialStock = params.variants?.[index]?.initial_stock;
              if (initialStock && initialStock > 0) {
                return {
                  variant_id: variant.id,
                  quantity: initialStock,
                  reserved_quantity: 0,
                };
              }
              return null;
            })
            .filter(Boolean);

          if (inventoryEntries && inventoryEntries.length > 0) {
            const { error: inventoryError } = await supabase
              .from("inventory")
              .insert(inventoryEntries);

            if (inventoryError) {
              console.error("❌ Error creating inventory:", inventoryError);
              // Don't throw here as the product and variants are already created
            } else {
              console.log("✅ Inventory created for variants");
            }
          }
        }
      }

      // Create images if provided
      if (params.images && params.images.length > 0) {
        const images = params.images.map((image) => ({
          product_id: product.id,
          url: image.url,
          alt_text: image.alt_text,
          sort_order: image.sort_order || 0,
          is_primary: image.is_primary || false,
        }));

        const { error: imagesError } = await supabase
          .from("product_images")
          .insert(images);

        if (imagesError) {
          console.error("❌ Error creating images:", imagesError);
          // Don't throw here as the product is already created
        } else {
          console.log("✅ Images created for product");
        }
      }

      return product;
    },
    onSuccess: () => {
      showSuccess("Product Created", "Product has been successfully created");
      // Invalidate and refetch product queries
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (error) => {
      console.error("❌ Error creating product:", error);
      showError("Failed to Create Product", error.message);
    },
  });
}

/**
 * Hook for updating a product
 */
export function useUpdateProduct() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: async (params: UpdateProductParams) => {
      console.log("🛍️ Updating product:", params);

      const { data, error } = await supabase
        .from("products")
        .update({
          name: params.name,
          slug: params.slug,
          description: params.description,
          short_description: params.short_description,
          sku: params.sku,
          category_id: params.category_id,
          brand_id: params.brand_id,
          gender: params.gender,
          material: params.material,
          care_instructions: params.care_instructions,
          weight: params.weight,
          dimensions: params.dimensions,
          base_price: params.base_price,
          compare_at_price: params.compare_at_price,
          cost_price: params.cost_price,
          is_active: params.is_active,
          is_featured: params.is_featured,
          requires_shipping: params.requires_shipping,
          track_inventory: params.track_inventory,
          allow_backorder: params.allow_backorder,
          min_order_quantity: params.min_order_quantity,
          max_order_quantity: params.max_order_quantity,
          meta_title: params.meta_title,
          meta_description: params.meta_description,
          tags: params.tags,
        })
        .eq("id", params.id)
        .select()
        .single();

      if (error) {
        console.error("❌ Error updating product:", error);
        throw error;
      }

      console.log("✅ Product updated:", data);
      return data;
    },
    onSuccess: (data) => {
      showSuccess("Product Updated", "Product has been successfully updated");
      // Invalidate and refetch product queries
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({
        queryKey: productQueryKeys.product(data.id),
      });
    },
    onError: (error) => {
      console.error("❌ Error updating product:", error);
      showError("Failed to Update Product", error.message);
    },
  });
}

/**
 * Hook for deleting a product
 */
export function useDeleteProduct() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: async (productId: string) => {
      console.log("🗑️ Deleting product:", productId);

      // Delete the product (cascade will handle variants, images, inventory)
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", productId);

      if (error) {
        console.error("❌ Error deleting product:", error);
        throw error;
      }

      console.log("✅ Product deleted");
      return productId;
    },
    onSuccess: (productId) => {
      showSuccess("Product Deleted", "Product has been successfully deleted");
      // Invalidate and refetch product queries
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.removeQueries({
        queryKey: productQueryKeys.product(productId),
      });
    },
    onError: (error) => {
      console.error("❌ Error deleting product:", error);
      showError("Failed to Delete Product", error.message);
    },
  });
}

/**
 * Hook for updating a product variant
 */
export function useUpdateProductVariant() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: async (params: UpdateProductVariantParams) => {
      console.log("🛍️ Updating product variant:", params);

      const { data, error } = await supabase
        .from("product_variants")
        .update({
          sku: params.sku,
          name: params.name,
          size: params.size,
          color: params.color,
          color_code: params.color_code,
          material: params.material,
          weight: params.weight,
          price: params.price,
          compare_at_price: params.compare_at_price,
          cost_price: params.cost_price,
          barcode: params.barcode,
          is_active: params.is_active,
          sort_order: params.sort_order,
        })
        .eq("id", params.id)
        .select()
        .single();

      if (error) {
        console.error("❌ Error updating product variant:", error);
        throw error;
      }

      console.log("✅ Product variant updated:", data);
      return data;
    },
    onSuccess: (data) => {
      showSuccess(
        "Variant Updated",
        "Product variant has been successfully updated"
      );
      // Invalidate and refetch product queries
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({
        queryKey: productQueryKeys.productVariants(data.product_id),
      });
    },
    onError: (error) => {
      console.error("❌ Error updating product variant:", error);
      showError("Failed to Update Variant", error.message);
    },
  });
}

/**
 * Hook for creating a new product variant
 */
export function useCreateProductVariant() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: async (params: CreateProductVariantParams) => {
      console.log("🛍️ Creating product variant:", params);

      const { data, error } = await supabase
        .from("product_variants")
        .insert({
          product_id: params.product_id,
          sku: params.sku,
          name: params.name,
          size: params.size,
          color: params.color,
          color_code: params.color_code,
          material: params.material,
          weight: params.weight,
          price: params.price,
          compare_at_price: params.compare_at_price,
          cost_price: params.cost_price,
          barcode: params.barcode,
          is_active: params.is_active ?? true,
          sort_order: params.sort_order || 0,
        })
        .select()
        .single();

      if (error) {
        console.error("❌ Error creating product variant:", error);
        throw error;
      }

      console.log("✅ Product variant created:", data);
      return data;
    },
    onSuccess: (data) => {
      showSuccess(
        "Variant Created",
        "Product variant has been successfully created"
      );
      // Invalidate and refetch product queries
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({
        queryKey: productQueryKeys.productVariants(data.product_id),
      });
    },
    onError: (error) => {
      console.error("❌ Error creating product variant:", error);
      showError("Failed to Create Variant", error.message);
    },
  });
}

/**
 * Hook for deleting a product variant
 */
export function useDeleteProductVariant() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: async (variantId: string) => {
      console.log("🗑️ Deleting product variant:", variantId);

      // First get the product_id for cache invalidation
      const { data: variant, error: fetchError } = await supabase
        .from("product_variants")
        .select("product_id")
        .eq("id", variantId)
        .single();

      if (fetchError) {
        console.error("❌ Error fetching variant:", fetchError);
        throw fetchError;
      }

      // Delete the variant
      const { error } = await supabase
        .from("product_variants")
        .delete()
        .eq("id", variantId);

      if (error) {
        console.error("❌ Error deleting product variant:", error);
        throw error;
      }

      console.log("✅ Product variant deleted");
      return { variantId, productId: variant.product_id };
    },
    onSuccess: ({ variantId, productId }) => {
      showSuccess(
        "Variant Deleted",
        "Product variant has been successfully deleted"
      );
      // Invalidate and refetch product queries
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({
        queryKey: productQueryKeys.productVariants(productId),
      });
      queryClient.removeQueries({
        queryKey: productQueryKeys.productVariant(variantId),
      });
    },
    onError: (error) => {
      console.error("❌ Error deleting product variant:", error);
      showError("Failed to Delete Variant", error.message);
    },
  });
}

/**
 * Hook for bulk updating variant status
 */
export function useBulkUpdateVariantStatus() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: async ({
      variantIds,
      isActive,
    }: {
      variantIds: string[];
      isActive: boolean;
    }) => {
      console.log("🛍️ Bulk updating variant status:", { variantIds, isActive });

      const { error } = await supabase
        .from("product_variants")
        .update({ is_active: isActive })
        .in("id", variantIds);

      if (error) {
        console.error("❌ Error bulk updating variant status:", error);
        throw error;
      }

      console.log("✅ Variant status bulk updated");
      return variantIds;
    },
    onSuccess: (variantIds, { isActive }) => {
      const status = isActive ? "activated" : "deactivated";
      showSuccess(
        "Variants Updated",
        `${variantIds.length} variants have been ${status}`
      );
      // Invalidate and refetch product queries
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (error) => {
      console.error("❌ Error bulk updating variant status:", error);
      showError("Failed to Update Variants", error.message);
    },
  });
}

/**
 * Hook for bulk deleting variants
 */
export function useBulkDeleteVariants() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: async (variantIds: string[]) => {
      console.log("🗑️ Bulk deleting variants:", variantIds);

      const { error } = await supabase
        .from("product_variants")
        .delete()
        .in("id", variantIds);

      if (error) {
        console.error("❌ Error bulk deleting variants:", error);
        throw error;
      }

      console.log("✅ Variants bulk deleted");
      return variantIds;
    },
    onSuccess: (variantIds) => {
      showSuccess(
        "Variants Deleted",
        `${variantIds.length} variants have been successfully deleted`
      );
      // Invalidate and refetch product queries
      queryClient.invalidateQueries({ queryKey: ["products"] });
      // Remove individual variant queries
      variantIds.forEach((id) => {
        queryClient.removeQueries({
          queryKey: productQueryKeys.productVariant(id),
        });
      });
    },
    onError: (error) => {
      console.error("❌ Error bulk deleting variants:", error);
      showError("Failed to Delete Variants", error.message);
    },
  });
}

/**
 * Hook for bulk updating product status
 */
export function useBulkUpdateProductStatus() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: async ({
      productIds,
      isActive,
    }: {
      productIds: string[];
      isActive: boolean;
    }) => {
      console.log("🛍️ Bulk updating product status:", { productIds, isActive });

      const { error } = await supabase
        .from("products")
        .update({ is_active: isActive })
        .in("id", productIds);

      if (error) {
        console.error("❌ Error bulk updating product status:", error);
        throw error;
      }

      console.log("✅ Product status bulk updated");
      return productIds;
    },
    onSuccess: (productIds, { isActive }) => {
      const status = isActive ? "activated" : "deactivated";
      showSuccess(
        "Products Updated",
        `${productIds.length} products have been ${status}`
      );
      // Invalidate and refetch product queries
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (error) => {
      console.error("❌ Error bulk updating product status:", error);
      showError("Failed to Update Products", error.message);
    },
  });
}

/**
 * Hook for bulk deleting products
 */
export function useBulkDeleteProducts() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: async (productIds: string[]) => {
      console.log("🗑️ Bulk deleting products:", productIds);

      const { error } = await supabase
        .from("products")
        .delete()
        .in("id", productIds);

      if (error) {
        console.error("❌ Error bulk deleting products:", error);
        throw error;
      }

      console.log("✅ Products bulk deleted");
      return productIds;
    },
    onSuccess: (productIds) => {
      showSuccess(
        "Products Deleted",
        `${productIds.length} products have been successfully deleted`
      );
      // Invalidate and refetch product queries
      queryClient.invalidateQueries({ queryKey: ["products"] });
      // Remove individual product queries
      productIds.forEach((id) => {
        queryClient.removeQueries({
          queryKey: productQueryKeys.product(id),
        });
      });
    },
    onError: (error) => {
      console.error("❌ Error bulk deleting products:", error);
      showError("Failed to Delete Products", error.message);
    },
  });
}

/**
 * Hook for creating a new product image
 */
export function useCreateProductImage() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: async (params: CreateProductImageParams) => {
      console.log("🖼️ Creating product image:", params);

      const { data, error } = await supabase
        .from("product_images")
        .insert({
          product_id: params.product_id,
          variant_id: params.variant_id,
          url: params.url,
          alt_text: params.alt_text,
          sort_order: params.sort_order || 0,
          is_primary: params.is_primary || false,
        })
        .select()
        .single();

      if (error) {
        console.error("❌ Error creating product image:", error);
        throw error;
      }

      console.log("✅ Product image created:", data);
      return data;
    },
    onSuccess: (data) => {
      showSuccess(
        "Image Created",
        "Product image has been successfully created"
      );
      // Invalidate and refetch product queries
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({
        queryKey: productQueryKeys.productImages(data.product_id),
      });
    },
    onError: (error) => {
      console.error("❌ Error creating product image:", error);
      showError("Failed to Create Image", error.message);
    },
  });
}

/**
 * Hook for updating a product image
 */
export function useUpdateProductImage() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: async (params: UpdateProductImageParams) => {
      console.log("🖼️ Updating product image:", params);

      const { data, error } = await supabase
        .from("product_images")
        .update({
          url: params.url,
          alt_text: params.alt_text,
          sort_order: params.sort_order,
          is_primary: params.is_primary,
        })
        .eq("id", params.id)
        .select()
        .single();

      if (error) {
        console.error("❌ Error updating product image:", error);
        throw error;
      }

      console.log("✅ Product image updated:", data);
      return data;
    },
    onSuccess: (data) => {
      showSuccess(
        "Image Updated",
        "Product image has been successfully updated"
      );
      // Invalidate and refetch product queries
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({
        queryKey: productQueryKeys.productImages(data.product_id),
      });
    },
    onError: (error) => {
      console.error("❌ Error updating product image:", error);
      showError("Failed to Update Image", error.message);
    },
  });
}

/**
 * Hook for deleting a product image
 */
export function useDeleteProductImage() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: async (imageId: string) => {
      console.log("🗑️ Deleting product image:", imageId);

      // First get the product_id for cache invalidation
      const { data: image, error: fetchError } = await supabase
        .from("product_images")
        .select("product_id")
        .eq("id", imageId)
        .single();

      if (fetchError) {
        console.error("❌ Error fetching image:", fetchError);
        throw fetchError;
      }

      // Delete the image
      const { error } = await supabase
        .from("product_images")
        .delete()
        .eq("id", imageId);

      if (error) {
        console.error("❌ Error deleting product image:", error);
        throw error;
      }

      console.log("✅ Product image deleted");
      return { imageId, productId: image.product_id };
    },
    onSuccess: ({ imageId, productId }) => {
      showSuccess(
        "Image Deleted",
        "Product image has been successfully deleted"
      );
      // Invalidate and refetch product queries
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({
        queryKey: productQueryKeys.productImages(productId),
      });
      queryClient.removeQueries({
        queryKey: productQueryKeys.productImage(imageId),
      });
    },
    onError: (error) => {
      console.error("❌ Error deleting product image:", error);
      showError("Failed to Delete Image", error.message);
    },
  });
}

/**
 * Hook for bulk deleting images
 */
export function useBulkDeleteImages() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: async (imageIds: string[]) => {
      console.log("🗑️ Bulk deleting images:", imageIds);

      const { error } = await supabase
        .from("product_images")
        .delete()
        .in("id", imageIds);

      if (error) {
        console.error("❌ Error bulk deleting images:", error);
        throw error;
      }

      console.log("✅ Images bulk deleted");
      return imageIds;
    },
    onSuccess: (imageIds) => {
      showSuccess(
        "Images Deleted",
        `${imageIds.length} images have been successfully deleted`
      );
      // Invalidate and refetch product queries
      queryClient.invalidateQueries({ queryKey: ["products"] });
      // Remove individual image queries
      imageIds.forEach((id) => {
        queryClient.removeQueries({
          queryKey: productQueryKeys.productImage(id),
        });
      });
    },
    onError: (error) => {
      console.error("❌ Error bulk deleting images:", error);
      showError("Failed to Delete Images", error.message);
    },
  });
}
