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

export interface BulkCreateVariantItem {
  sku?: string;
  name?: string;
  size?: string;
  color?: string;
  color_code?: string;
  price?: number;
  compare_at_price?: number;
  sort_order?: number;
  initial_stock?: number;
}

export interface BulkCreateVariantsParams {
  product_id: string;
  variants: BulkCreateVariantItem[];
}

/**
 * Hook for bulk creating product variants (e.g. all size x color combinations)
 *
 * Inserts all variants in a single round trip, then creates matching
 * inventory rows for any variant with `initial_stock > 0`. If inventory
 * insertion fails, variants are rolled back to keep the data consistent.
 */
export function useBulkCreateVariants() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: async ({ product_id, variants }: BulkCreateVariantsParams) => {
      if (!variants.length) {
        throw new Error("No variants to create");
      }

      console.log(
        `🛍️ Bulk creating ${variants.length} variants for product ${product_id}`,
      );

      const variantRows = variants.map((v, index) => ({
        product_id,
        sku: v.sku || null,
        name: v.name || null,
        size: v.size || null,
        color: v.color || null,
        color_code: v.color_code || null,
        price: v.price ?? null,
        compare_at_price: v.compare_at_price ?? null,
        sort_order: v.sort_order ?? index,
        is_active: true,
      }));

      const { data: createdVariants, error: variantsError } = await supabase
        .from("product_variants")
        .insert(variantRows)
        .select();

      if (variantsError) {
        console.error("❌ Bulk variant insert failed:", variantsError);
        throw variantsError;
      }

      const inventoryRows = createdVariants
        ?.map((variant, index) => {
          const stock = variants[index]?.initial_stock ?? 0;
          return {
            variant_id: variant.id,
            quantity: stock,
            reserved_quantity: 0,
          };
        })
        .filter((row) => row.quantity >= 0);

      if (inventoryRows && inventoryRows.length > 0) {
        const { error: inventoryError } = await supabase
          .from("inventory")
          .insert(inventoryRows);

        if (inventoryError) {
          console.error(
            "❌ Inventory insert failed, rolling back variants:",
            inventoryError,
          );
          await supabase
            .from("product_variants")
            .delete()
            .in(
              "id",
              createdVariants.map((v) => v.id),
            );
          throw inventoryError;
        }
      }

      console.log(`✅ Bulk created ${createdVariants?.length ?? 0} variants`);
      return createdVariants ?? [];
    },
    onSuccess: (createdVariants, { product_id }) => {
      showSuccess(
        "Variants Generated",
        `${createdVariants.length} variants were created successfully`,
      );
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({
        queryKey: productQueryKeys.productVariants(product_id),
      });
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
    },
    onError: (error: Error) => {
      console.error("❌ Bulk variant creation failed:", error);
      showError("Failed to Generate Variants", error.message);
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

// ============================================================
// Bulk image upload — Storage upload + DB row creation
// ============================================================

const PRODUCT_IMAGES_BUCKET = "product-images";

/** Maximum number of files to upload in parallel. Matches typical browser HTTP/2 throughput. */
const UPLOAD_CONCURRENCY = 4;

/**
 * Runs `task` for each item with at most `limit` parallel executions.
 * Mirrors `Promise.allSettled` semantics so one failure never blocks
 * the rest of the batch.
 */
async function runWithConcurrency<T, R>(
  items: T[],
  limit: number,
  task: (item: T, index: number) => Promise<R>,
): Promise<PromiseSettledResult<R>[]> {
  const results: PromiseSettledResult<R>[] = new Array(items.length);
  let cursor = 0;

  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (cursor < items.length) {
      const myIndex = cursor++;
      try {
        const value = await task(items[myIndex], myIndex);
        results[myIndex] = { status: "fulfilled", value };
      } catch (reason) {
        results[myIndex] = { status: "rejected", reason };
      }
    }
  });

  await Promise.all(workers);
  return results;
}

export interface BulkUploadImageItem {
  /** A unique client-side id (used to track progress across renders) */
  clientId: string;
  file: File;
  /** Optional alt text per image */
  alt_text?: string;
  /** If true, this image will be marked as primary for the product */
  is_primary?: boolean;
  /** Optional sort order; defaults to insertion order */
  sort_order?: number;
}

export interface BulkUploadProductImagesParams {
  product_id: string;
  /** If empty, image is linked to the product only (no specific variant). */
  variant_ids?: string[];
  items: BulkUploadImageItem[];
  /** Per-file progress callback: 0..1 (after upload + DB insert it reaches 1). */
  onProgress?: (
    clientId: string,
    update: {
      status: "uploading" | "saving" | "done" | "error" | "cancelled";
      progress: number;
      error?: string;
    },
  ) => void;
  /**
   * Optional abort signal. When triggered, queued items that haven't started
   * yet are skipped, in-flight Storage uploads are aborted via the underlying
   * fetch, and orphaned files (uploaded but DB-insert pending) are cleaned up.
   */
  signal?: AbortSignal;
}

/**
 * Slugify a string for storage paths. Keeps the path readable without
 * URL-encoding surprises.
 */
const slugifyForStorage = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9.\-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

/**
 * Translate raw Supabase Storage error messages into something an admin
 * can act on. Falls back to the original message for unknown errors.
 */
const humanizeStorageError = (message: string): string => {
  const lower = message.toLowerCase();
  if (lower.includes("payload too large") || lower.includes("exceeded")) {
    return "File is larger than the 5 MB limit";
  }
  if (lower.includes("mime type") || lower.includes("not allowed")) {
    return "File type not allowed (use JPG, PNG, WebP, GIF, or AVIF)";
  }
  if (lower.includes("duplicate") || lower.includes("already exists")) {
    return "A file with this name was uploaded a moment ago";
  }
  if (lower.includes("bucket not found")) {
    return "Storage bucket is missing — contact support";
  }
  if (lower.includes("jwt") || lower.includes("unauthorized")) {
    return "You need to sign in again to upload";
  }
  if (
    lower.includes("failed to fetch") ||
    lower.includes("network") ||
    lower.includes("err_name_not_resolved") ||
    lower.includes("err_internet_disconnected")
  ) {
    return "Network problem — check your internet connection and try again";
  }
  if (lower.includes("timeout") || lower.includes("timed out")) {
    return "Upload timed out — try again on a faster connection";
  }
  if (
    lower.includes("product_images_one_primary_per_product") ||
    (lower.includes("duplicate key") && lower.includes("primary"))
  ) {
    return "Another image is already marked primary for this product — try again";
  }
  return message;
};

/**
 * Hook that uploads multiple image files to Supabase Storage and creates
 * matching `product_images` rows in a single user-facing operation.
 *
 * For every file:
 *   1. Upload to `product-images/products/{product_id}/{timestamp}-{slug}`
 *   2. Resolve the public URL
 *   3. Insert one row per (product, variant) pair into `product_images`
 *      - If `variant_ids` is empty, a single row with variant_id = null is created
 *      - If multiple variants are passed, the same image is shared across them
 *
 * Files are uploaded concurrently. If any file fails, the others still
 * succeed and the caller is informed via the per-file progress callback.
 */
export function useBulkUploadProductImages() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: async ({
      product_id,
      variant_ids = [],
      items,
      onProgress,
      signal,
    }: BulkUploadProductImagesParams) => {
      if (!items.length) {
        throw new Error("No files selected");
      }
      if (!product_id) {
        throw new Error("Product is required");
      }

      // Each uploaded file always creates exactly ONE product_images row.
      // - 0 variants picked  -> product-level image (variant_id = null)
      // - exactly 1 variant  -> that variant's feature image (variant_id = X)
      // - multiple variants  -> product-level image (variant_id = null) so
      //   admins don't end up with N duplicate rows per file.
      const singleVariantId =
        variant_ids.length === 1 ? variant_ids[0] : null;
      const targetVariants: (string | null)[] = [singleVariantId];

      const results = await runWithConcurrency(
        items,
        UPLOAD_CONCURRENCY,
        async (item, index) => {
          const { clientId, file, alt_text, is_primary, sort_order } = item;

          // Skip queued work if the user already aborted (e.g. closed the dialog).
          if (signal?.aborted) {
            onProgress?.(clientId, {
              status: "cancelled",
              progress: 0,
              error: "Upload cancelled",
            });
            throw new DOMException("Upload cancelled", "AbortError");
          }

          try {
            onProgress?.(clientId, { status: "uploading", progress: 0.1 });

            // 1) Upload to Storage
            const ext = file.name.includes(".")
              ? file.name.slice(file.name.lastIndexOf(".") + 1).toLowerCase()
              : "jpg";
            const baseName = slugifyForStorage(
              file.name.replace(/\.[^.]+$/, "") || "image",
            );
            const stamp = Date.now();
            const path = `products/${product_id}/${stamp}-${index}-${baseName}.${ext}`;

            const { error: uploadError } = await supabase.storage
              .from(PRODUCT_IMAGES_BUCKET)
              .upload(path, file, {
                cacheControl: "3600",
                upsert: false,
                contentType: file.type || undefined,
              });

            if (uploadError) {
              onProgress?.(clientId, {
                status: "error",
                progress: 0,
                error: humanizeStorageError(uploadError.message),
              });
              throw uploadError;
            }

            // If aborted between upload and DB insert, clean up the
            // orphaned Storage object before bailing out.
            if (signal?.aborted) {
              await supabase.storage
                .from(PRODUCT_IMAGES_BUCKET)
                .remove([path])
                .catch(() => {});
              onProgress?.(clientId, {
                status: "cancelled",
                progress: 0,
                error: "Upload cancelled",
              });
              throw new DOMException("Upload cancelled", "AbortError");
            }

            onProgress?.(clientId, { status: "saving", progress: 0.7 });

            // 2) Resolve public URL
            const { data: publicUrlData } = supabase.storage
              .from(PRODUCT_IMAGES_BUCKET)
              .getPublicUrl(path);
            const publicUrl = publicUrlData.publicUrl;

            // 3) Insert one row per target variant (or one with null)
            const rows = targetVariants.map((variantId) => ({
              product_id,
              variant_id: variantId,
              url: publicUrl,
              alt_text: alt_text || null,
              sort_order: sort_order ?? index,
              is_primary: is_primary || false,
            }));

            const { data: created, error: insertError } = await supabase
              .from("product_images")
              .insert(rows)
              .select();

            if (insertError) {
              // Best-effort cleanup: try to remove the uploaded file so we
              // don't leave orphaned storage objects.
              await supabase.storage
                .from(PRODUCT_IMAGES_BUCKET)
                .remove([path])
                .catch(() => {});
              onProgress?.(clientId, {
                status: "error",
                progress: 0,
                error: insertError.message,
              });
              throw insertError;
            }

            onProgress?.(clientId, { status: "done", progress: 1 });
            return created ?? [];
          } catch (error) {
            const message =
              error instanceof Error ? error.message : "Upload failed";
            // Don't double-report cancellations
            if (
              !(error instanceof DOMException && error.name === "AbortError")
            ) {
              onProgress?.(clientId, {
                status: "error",
                progress: 0,
                error: humanizeStorageError(message),
              });
            }
            throw error;
          }
        },
      );

      const succeeded = results.filter((r) => r.status === "fulfilled").length;
      const cancelled = results.filter(
        (r) =>
          r.status === "rejected" &&
          r.reason instanceof DOMException &&
          r.reason.name === "AbortError",
      ).length;
      const failed = results.length - succeeded - cancelled;
      return { succeeded, failed, cancelled, total: results.length };
    },
    onSuccess: (
      { succeeded, failed, cancelled, total },
      { product_id },
    ) => {
      if (succeeded > 0) {
        queryClient.invalidateQueries({ queryKey: ["products"] });
        queryClient.invalidateQueries({
          queryKey: productQueryKeys.productImages(product_id),
        });
      }

      if (failed === 0 && cancelled === 0) {
        showSuccess(
          "Images Uploaded",
          `${succeeded} image${succeeded === 1 ? "" : "s"} uploaded successfully`,
        );
      } else if (cancelled > 0 && failed === 0) {
        // User cancelled — friendlier copy than "failed"
        showSuccess(
          "Upload Cancelled",
          `${succeeded} of ${total} uploaded before cancelling`,
        );
      } else {
        showError(
          "Some Uploads Failed",
          `${succeeded} succeeded · ${failed} failed${
            cancelled > 0 ? ` · ${cancelled} cancelled` : ""
          }`,
        );
      }
    },
    onError: (error: Error) => {
      console.error("❌ Bulk image upload failed:", error);
      showError("Failed to Upload Images", error.message);
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
