import { useToast } from "@/hooks/use-toast";
import { api, apiFetch } from "@/lib/api";
import { supabase } from "@/lib/supabase";
import { ProductGender } from "@/services/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { productQueryKeys } from "./use-product-query";

// ── Types ──────────────────────────────────────────────────────────────────

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
  dimensions?: { length?: number; width?: number; height?: number };
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
  dimensions?: { length?: number; width?: number; height?: number };
  base_price?: number;
  compare_at_price?: number | null;
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
  product_id?: string;
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
  product_id?: string;
  url?: string;
  alt_text?: string;
  sort_order?: number;
  is_primary?: boolean;
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

export interface BulkUploadImageItem {
  clientId: string;
  file: File;
  alt_text?: string;
  is_primary?: boolean;
  sort_order?: number;
}

export interface BulkUploadProductImagesParams {
  product_id: string;
  variant_ids?: string[];
  items: BulkUploadImageItem[];
  onProgress?: (
    clientId: string,
    update: {
      status: "uploading" | "saving" | "done" | "error" | "cancelled";
      progress: number;
      error?: string;
    }
  ) => void;
  signal?: AbortSignal;
}

// ── Product CRUD ──────────────────────────────────────────────────────────

export function useCreateProduct() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: (params: CreateProductParams) =>
      api.post("/products", {
        name: params.name,
        slug: params.slug,
        description: params.description,
        shortDescription: params.short_description,
        sku: params.sku || undefined,
        categoryId: params.category_id,
        brandId: params.brand_id,
        gender: params.gender,
        material: params.material,
        careInstructions: params.care_instructions,
        weight: params.weight,
        dimensions: params.dimensions,
        basePrice: params.base_price,
        compareAtPrice: params.compare_at_price,
        isFeatured: params.is_featured,
        requiresShipping: params.requires_shipping,
        trackInventory: params.track_inventory,
        allowBackorder: params.allow_backorder,
        minOrderQuantity: params.min_order_quantity,
        maxOrderQuantity: params.max_order_quantity,
        metaTitle: params.meta_title,
        metaDescription: params.meta_description,
        tags: params.tags,
      }),
    onSuccess: () => {
      showSuccess("Product Created", "Product has been successfully created");
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (error: Error) => {
      showError("Failed to Create Product", error.message);
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: ({ id, ...params }: UpdateProductParams) =>
      api.patch<{ id: string }>(`/products/${id}`, {
        name: params.name,
        slug: params.slug,
        description: params.description,
        shortDescription: params.short_description,
        sku: params.sku,
        categoryId: params.category_id,
        brandId: params.brand_id,
        gender: params.gender,
        material: params.material,
        careInstructions: params.care_instructions,
        weight: params.weight,
        dimensions: params.dimensions,
        basePrice: params.base_price,
        compareAtPrice: params.compare_at_price,
        isActive: params.is_active,
        isFeatured: params.is_featured,
        requiresShipping: params.requires_shipping,
        trackInventory: params.track_inventory,
        allowBackorder: params.allow_backorder,
        minOrderQuantity: params.min_order_quantity,
        maxOrderQuantity: params.max_order_quantity,
        metaTitle: params.meta_title,
        metaDescription: params.meta_description,
        tags: params.tags,
      }),
    onSuccess: (data: { id: string }) => {
      showSuccess("Product Updated", "Product has been successfully updated");
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: productQueryKeys.product(data.id) });
    },
    onError: (error: Error) => {
      showError("Failed to Update Product", error.message);
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: (productId: string) => api.delete(`/products/${productId}`),
    onSuccess: (_data, productId) => {
      showSuccess("Product Deleted", "Product has been successfully deleted");
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.removeQueries({ queryKey: productQueryKeys.product(productId) });
    },
    onError: (error: Error) => {
      showError("Failed to Delete Product", error.message);
    },
  });
}

// ── Variant CRUD ──────────────────────────────────────────────────────────

export function useCreateProductVariant() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: (params: CreateProductVariantParams) =>
      api.post(`/products/${params.product_id}/variants`, {
        sku: params.sku || undefined,
        name: params.name,
        size: params.size,
        color: params.color,
        colorCode: params.color_code,
        material: params.material,
        weight: params.weight,
        price: params.price,
        compareAtPrice: params.compare_at_price,
        barcode: params.barcode,
        isActive: params.is_active,
        sortOrder: params.sort_order,
      }),
    onSuccess: (_data, params) => {
      showSuccess("Variant Created", "Product variant has been successfully created");
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({
        queryKey: productQueryKeys.productVariants(params.product_id),
      });
    },
    onError: (error: Error) => {
      showError("Failed to Create Variant", error.message);
    },
  });
}

export function useUpdateProductVariant() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: (params: UpdateProductVariantParams) => {
      const productId = params.product_id ?? "unknown";
      return api.patch<{ product_id: string }>(`/products/${productId}/variants/${params.id}`, {
        sku: params.sku,
        name: params.name,
        size: params.size,
        color: params.color,
        colorCode: params.color_code,
        material: params.material,
        weight: params.weight,
        price: params.price,
        compareAtPrice: params.compare_at_price,
        barcode: params.barcode,
        isActive: params.is_active,
        sortOrder: params.sort_order,
      });
    },
    onSuccess: (data: { product_id: string }) => {
      showSuccess("Variant Updated", "Product variant has been successfully updated");
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({
        queryKey: productQueryKeys.productVariants(data.product_id),
      });
    },
    onError: (error: Error) => {
      showError("Failed to Update Variant", error.message);
    },
  });
}

export function useDeleteProductVariant() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: async (variantId: string) => {
      // Fetch variant first to get product_id for cache invalidation
      const data = await apiFetch<{ id: string; product_id: string }>(
        `/products/unknown/variants/${variantId}`,
        { skipAuth: false }
      ).catch(() => ({ id: variantId, product_id: "" }));
      await api.delete(`/products/${data.product_id}/variants/${variantId}`);
      return { variantId, productId: data.product_id };
    },
    onSuccess: ({ variantId, productId }) => {
      showSuccess("Variant Deleted", "Product variant has been successfully deleted");
      queryClient.invalidateQueries({ queryKey: ["products"] });
      if (productId) {
        queryClient.invalidateQueries({
          queryKey: productQueryKeys.productVariants(productId),
        });
      }
      queryClient.removeQueries({ queryKey: productQueryKeys.productVariant(variantId) });
    },
    onError: (error: Error) => {
      showError("Failed to Delete Variant", error.message);
    },
  });
}

export function useBulkCreateVariants() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: ({ product_id, variants }: BulkCreateVariantsParams) =>
      api.post<unknown[]>(`/products/${product_id}/variants/bulk`, { variants }),
    onSuccess: (createdVariants, { product_id }) => {
      showSuccess(
        "Variants Generated",
        `${(createdVariants as unknown[]).length} variants were created successfully`
      );
      queryClient.invalidateQueries({ queryKey: ["variants", "all"] });
      queryClient.invalidateQueries({
        queryKey: productQueryKeys.productVariants(product_id),
      });
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
    },
    onError: (error: Error) => {
      showError("Failed to Generate Variants", error.message);
    },
  });
}

export function useBulkUpdateVariantStatus() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: ({ variantIds, isActive }: { variantIds: string[]; isActive: boolean }) =>
      Promise.all(
        variantIds.map((id) => api.patch(`/products/unknown/variants/${id}`, { isActive }))
      ),
    onSuccess: (_, { variantIds, isActive }) => {
      const status = isActive ? "activated" : "deactivated";
      showSuccess("Variants Updated", `${variantIds.length} variants have been ${status}`);
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (error: Error) => {
      showError("Failed to Update Variants", error.message);
    },
  });
}

export function useBulkDeleteVariants() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: (variantIds: string[]) =>
      Promise.all(
        variantIds.map((id) => api.delete(`/products/unknown/variants/${id}`))
      ),
    onSuccess: (_, variantIds) => {
      showSuccess("Variants Deleted", `${variantIds.length} variants have been successfully deleted`);
      queryClient.invalidateQueries({ queryKey: ["products"] });
      variantIds.forEach((id) => {
        queryClient.removeQueries({ queryKey: productQueryKeys.productVariant(id) });
      });
    },
    onError: (error: Error) => {
      showError("Failed to Delete Variants", error.message);
    },
  });
}

// ── Bulk product ops ──────────────────────────────────────────────────────

export function useBulkUpdateProductStatus() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: ({ productIds, isActive }: { productIds: string[]; isActive: boolean }) =>
      Promise.all(productIds.map((id) => api.patch(`/products/${id}`, { isActive }))),
    onSuccess: (_, { productIds, isActive }) => {
      const status = isActive ? "activated" : "deactivated";
      showSuccess("Products Updated", `${productIds.length} products have been ${status}`);
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (error: Error) => {
      showError("Failed to Update Products", error.message);
    },
  });
}

export function useBulkDeleteProducts() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: (productIds: string[]) =>
      Promise.all(productIds.map((id) => api.delete(`/products/${id}`))),
    onSuccess: (_, productIds) => {
      showSuccess("Products Deleted", `${productIds.length} products have been successfully deleted`);
      queryClient.invalidateQueries({ queryKey: ["products"] });
      productIds.forEach((id) => {
        queryClient.removeQueries({ queryKey: productQueryKeys.product(id) });
      });
    },
    onError: (error: Error) => {
      showError("Failed to Delete Products", error.message);
    },
  });
}

// ── Image CRUD ────────────────────────────────────────────────────────────

export function useCreateProductImage() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: (params: CreateProductImageParams) =>
      api.post(`/products/${params.product_id}/images`, {
        variantId: params.variant_id,
        url: params.url,
        altText: params.alt_text,
        sortOrder: params.sort_order,
        isPrimary: params.is_primary,
      }),
    onSuccess: (_data, params) => {
      showSuccess("Image Created", "Product image has been successfully created");
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({
        queryKey: productQueryKeys.productImages(params.product_id),
      });
    },
    onError: (error: Error) => {
      showError("Failed to Create Image", error.message);
    },
  });
}

export function useUpdateProductImage() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: (params: UpdateProductImageParams) => {
      const productId = params.product_id ?? "unknown";
      return api.patch<{ product_id: string }>(`/products/${productId}/images/${params.id}`, {
        url: params.url,
        altText: params.alt_text,
        sortOrder: params.sort_order,
        isPrimary: params.is_primary,
      });
    },
    onSuccess: (data: { product_id: string }) => {
      showSuccess("Image Updated", "Product image has been successfully updated");
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({
        queryKey: productQueryKeys.productImages(data.product_id),
      });
    },
    onError: (error: Error) => {
      showError("Failed to Update Image", error.message);
    },
  });
}

export function useDeleteProductImage() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: async (imageId: string) => {
      await api.delete(`/products/unknown/images/${imageId}`);
      return imageId;
    },
    onSuccess: (imageId) => {
      showSuccess("Image Deleted", "Product image has been successfully deleted");
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.removeQueries({ queryKey: productQueryKeys.productImage(imageId) });
    },
    onError: (error: Error) => {
      showError("Failed to Delete Image", error.message);
    },
  });
}

export function useBulkDeleteImages() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: (imageIds: string[]) =>
      Promise.all(imageIds.map((id) => api.delete(`/products/unknown/images/${id}`))),
    onSuccess: (_, imageIds) => {
      showSuccess("Images Deleted", `${imageIds.length} images have been successfully deleted`);
      queryClient.invalidateQueries({ queryKey: ["products"] });
      imageIds.forEach((id) => {
        queryClient.removeQueries({ queryKey: productQueryKeys.productImage(id) });
      });
    },
    onError: (error: Error) => {
      showError("Failed to Delete Images", error.message);
    },
  });
}

// ── Bulk image upload (Storage direct → keep on Supabase) ─────────────────
// File upload to Supabase Storage stays on the client SDK — the BE doesn't
// expose a file upload endpoint. Only the DB record creation moves to BE.

const PRODUCT_IMAGES_BUCKET = "product-images";
const UPLOAD_CONCURRENCY = 4;

async function runWithConcurrency<T, R>(
  items: T[],
  limit: number,
  task: (item: T, index: number) => Promise<R>
): Promise<PromiseSettledResult<R>[]> {
  const results: PromiseSettledResult<R>[] = new Array(items.length);
  let cursor = 0;
  const workers = Array.from(
    { length: Math.min(limit, items.length) },
    async () => {
      while (cursor < items.length) {
        const myIndex = cursor++;
        try {
          results[myIndex] = {
            status: "fulfilled",
            value: await task(items[myIndex], myIndex),
          };
        } catch (reason) {
          results[myIndex] = { status: "rejected", reason };
        }
      }
    }
  );
  await Promise.all(workers);
  return results;
}

const slugifyForStorage = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9.\-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

const humanizeStorageError = (message: string): string => {
  const lower = message.toLowerCase();
  if (lower.includes("payload too large") || lower.includes("exceeded"))
    return "File is larger than the 5 MB limit";
  if (lower.includes("mime type") || lower.includes("not allowed"))
    return "File type not allowed (use JPG, PNG, WebP, GIF, or AVIF)";
  if (lower.includes("duplicate") || lower.includes("already exists"))
    return "A file with this name was uploaded a moment ago";
  if (lower.includes("bucket not found"))
    return "Storage bucket is missing — contact support";
  if (lower.includes("jwt") || lower.includes("unauthorized"))
    return "You need to sign in again to upload";
  if (
    lower.includes("failed to fetch") ||
    lower.includes("network") ||
    lower.includes("err_internet_disconnected")
  )
    return "Network problem — check your internet connection and try again";
  if (lower.includes("timeout") || lower.includes("timed out"))
    return "Upload timed out — try again on a faster connection";
  return message;
};

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
      if (!items.length) throw new Error("No files selected");
      if (!product_id) throw new Error("Product is required");

      const singleVariantId = variant_ids.length === 1 ? variant_ids[0] : null;

      const results = await runWithConcurrency(
        items,
        UPLOAD_CONCURRENCY,
        async (item, index) => {
          const { clientId, file, alt_text, is_primary, sort_order } = item;

          if (signal?.aborted) {
            onProgress?.(clientId, { status: "cancelled", progress: 0, error: "Upload cancelled" });
            throw new DOMException("Upload cancelled", "AbortError");
          }

          try {
            onProgress?.(clientId, { status: "uploading", progress: 0.1 });

            const ext = file.name.includes(".")
              ? file.name.slice(file.name.lastIndexOf(".") + 1).toLowerCase()
              : "jpg";
            const baseName = slugifyForStorage(
              file.name.replace(/\.[^.]+$/, "") || "image"
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

            if (signal?.aborted) {
              await supabase.storage.from(PRODUCT_IMAGES_BUCKET).remove([path]).catch(() => {});
              onProgress?.(clientId, { status: "cancelled", progress: 0, error: "Upload cancelled" });
              throw new DOMException("Upload cancelled", "AbortError");
            }

            onProgress?.(clientId, { status: "saving", progress: 0.7 });

            const { data: publicUrlData } = supabase.storage
              .from(PRODUCT_IMAGES_BUCKET)
              .getPublicUrl(path);

            // Create DB record via BE
            await api.post(`/products/${product_id}/images`, {
              variantId: singleVariantId,
              url: publicUrlData.publicUrl,
              altText: alt_text || null,
              sortOrder: sort_order ?? index,
              isPrimary: is_primary || false,
            });

            onProgress?.(clientId, { status: "done", progress: 1 });
            return publicUrlData.publicUrl;
          } catch (error) {
            const message = error instanceof Error ? error.message : "Upload failed";
            if (!(error instanceof DOMException && error.name === "AbortError")) {
              onProgress?.(clientId, {
                status: "error",
                progress: 0,
                error: humanizeStorageError(message),
              });
            }
            throw error;
          }
        }
      );

      const succeeded = results.filter((r) => r.status === "fulfilled").length;
      const cancelled = results.filter(
        (r) =>
          r.status === "rejected" &&
          r.reason instanceof DOMException &&
          r.reason.name === "AbortError"
      ).length;
      const failed = results.length - succeeded - cancelled;
      return { succeeded, failed, cancelled, total: results.length };
    },
    onSuccess: ({ succeeded, failed, cancelled, total }, { product_id }) => {
      if (succeeded > 0) {
        queryClient.invalidateQueries({ queryKey: ["products"] });
        queryClient.invalidateQueries({
          queryKey: productQueryKeys.productImages(product_id),
        });
      }
      if (failed === 0 && cancelled === 0) {
        showSuccess(
          "Images Uploaded",
          `${succeeded} image${succeeded === 1 ? "" : "s"} uploaded successfully`
        );
      } else if (cancelled > 0 && failed === 0) {
        showSuccess("Upload Cancelled", `${succeeded} of ${total} uploaded before cancelling`);
      } else {
        showError(
          "Some Uploads Failed",
          `${succeeded} succeeded · ${failed} failed${cancelled > 0 ? ` · ${cancelled} cancelled` : ""}`
        );
      }
    },
    onError: (error: Error) => {
      showError("Failed to Upload Images", error.message);
    },
  });
}
