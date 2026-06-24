import { useToast } from "@/hooks/use-toast";
import { api, apiFetchList } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { InventoryRecord } from "./use-inventory-query";

export interface AddProductParams {
  name: string;
  slug: string;
  description?: string;
  short_description?: string;
  sku?: string;
  category_id?: string;
  brand_id?: string;
  gender?: "men" | "women" | "unisex";
  material?: string;
  care_instructions?: string;
  weight?: number;
  dimensions?: Record<string, unknown>;
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
  low_stock_threshold?: number;
  variants: Array<{
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
  }>;
  initial_stock?: number;
}

export interface InventoryUpdateProductParams {
  product_id: string;
  name?: string;
  slug?: string;
  description?: string;
  short_description?: string;
  sku?: string;
  category_id?: string;
  brand_id?: string;
  gender?: "men" | "women" | "unisex";
  material?: string;
  care_instructions?: string;
  weight?: number;
  dimensions?: Record<string, unknown>;
  base_price?: number;
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
  low_stock_threshold?: number;
}

export interface RestockParams {
  variant_id: string;
  quantity: number;
  cost_per_unit?: number;
  reference_number?: string;
  notes?: string;
}

export interface DecreaseStockParams {
  variant_id: string;
  quantity: number;
  order_id?: string;
  order_item_id?: string;
  notes?: string;
}

export interface ReserveStockParams {
  variant_id: string;
  quantity: number;
  order_id?: string;
  order_item_id?: string;
}

export interface UnreserveStockParams {
  variant_id: string;
  quantity: number;
  order_id?: string;
}

export interface CancelOrderInventoryParams {
  order_id: string;
  reason?: string;
}

export interface ReturnItemParams {
  order_id: string;
  order_item_id: string;
  quantity: number;
  reason?: string;
  is_resellable?: boolean;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function invalidateInventory(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ["inventory-levels"] });
  queryClient.invalidateQueries({ queryKey: ["inventory-movements"] });
  queryClient.invalidateQueries({ queryKey: ["inventory-summary"] });
  queryClient.invalidateQueries({ queryKey: ["inventory-stats"] });
  queryClient.invalidateQueries({ queryKey: ["low-stock-items"] });
}

/** Resolve inventory record ID from a variantId (for adjust endpoint). */
async function resolveInventoryId(variantId: string): Promise<string | null> {
  const { data } = await apiFetchList<InventoryRecord>(
    `/inventory?variantId=${variantId}&limit=1`
  );
  return data[0]?.id ?? null;
}

// ── Add Product (inventory flow) ──────────────────────────────────────────────
// Routes through the regular products + variants + inventory BE endpoints.

export function useAddProduct() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: async (params: AddProductParams) => {
      // Step 1: Create product
      const product = await api.post<{ id: string }>("/products", {
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
      });

      // Step 2: Create variants in bulk
      if (params.variants.length > 0) {
        await api.post(`/products/${product.id}/variants/bulk`, {
          variants: params.variants.map((v) => ({
            sku: v.sku,
            name: v.name,
            size: v.size,
            color: v.color,
            colorCode: v.color_code,
            material: v.material,
            weight: v.weight,
            price: v.price,
            compareAtPrice: v.compare_at_price,
            barcode: v.barcode,
            sortOrder: v.sort_order,
            initialStock: params.initial_stock,
          })),
        });
      }

      return { success: true, message: `Product "${params.name}" created`, product };
    },
    onSuccess: (data) => {
      showSuccess("Product Added", data.message);
      queryClient.invalidateQueries({ queryKey: ["products"] });
      invalidateInventory(queryClient);
    },
    onError: (error: Error) => {
      showError("Failed to Add Product", error.message);
    },
  });
}

export function useInventoryUpdateProduct() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: async (params: InventoryUpdateProductParams) => {
      const updated = await api.patch<{ id: string; name: string }>(
        `/products/${params.product_id}`,
        {
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
          isFeatured: params.is_featured,
          requiresShipping: params.requires_shipping,
          trackInventory: params.track_inventory,
          allowBackorder: params.allow_backorder,
          minOrderQuantity: params.min_order_quantity,
          maxOrderQuantity: params.max_order_quantity,
          metaTitle: params.meta_title,
          metaDescription: params.meta_description,
          tags: params.tags,
        }
      );
      return { success: true, message: `Product updated`, product_id: updated.id };
    },
    onSuccess: (data) => {
      showSuccess("Product Updated", data.message);
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["product", data.product_id] });
    },
    onError: (error: Error) => {
      showError("Failed to Update Product", error.message);
    },
  });
}

export function useRestockInventory() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: async (params: RestockParams) => {
      const inventoryId = await resolveInventoryId(params.variant_id);

      if (inventoryId) {
        // Adjust existing record
        return api.patch<{ id: string }>(`/inventory/${inventoryId}/adjust`, {
          adjustment: params.quantity,
          movementType: "restock",
          reason: "purchase_order",
          notes: params.notes,
        });
      } else {
        // Create new inventory record via upsert
        return api.put<{ id: string }>("/inventory", {
          variantId: params.variant_id,
          quantity: params.quantity,
        });
      }
    },
    onSuccess: () => {
      showSuccess("Stock Updated", `Stock has been restocked successfully`);
      invalidateInventory(queryClient);
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (error: Error) => {
      showError("Failed to Restock", error.message);
    },
  });
}

export function useDecreaseStock() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: async (params: DecreaseStockParams) => {
      const inventoryId = await resolveInventoryId(params.variant_id);
      if (!inventoryId) throw new Error("Inventory record not found for variant");

      return api.patch<{ id: string }>(`/inventory/${inventoryId}/adjust`, {
        adjustment: -params.quantity,
        movementType: "adjustment",
        reason: "manual_adjustment",
        notes: params.notes ?? null,
      });
    },
    onSuccess: () => {
      showSuccess("Stock Decreased", `Stock has been decreased successfully`);
      invalidateInventory(queryClient);
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (error: Error) => {
      showError("Failed to Decrease Stock", error.message);
    },
  });
}

// Reserve/Unreserve — no dedicated BE endpoint; use adjust with reserve movement type
export function useReserveStock() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: async (params: ReserveStockParams) => {
      const inventoryId = await resolveInventoryId(params.variant_id);
      if (!inventoryId) throw new Error("Inventory record not found for variant");

      return api.patch<{ id: string }>(`/inventory/${inventoryId}/adjust`, {
        adjustment: -params.quantity,
        movementType: "reserve",
        reason: "checkout_reserve",
      });
    },
    onSuccess: () => {
      showSuccess("Stock Reserved", "Stock has been reserved");
      invalidateInventory(queryClient);
    },
    onError: (error: Error) => {
      showError("Failed to Reserve Stock", error.message);
    },
  });
}

export function useUnreserveStock() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: async (params: UnreserveStockParams) => {
      const inventoryId = await resolveInventoryId(params.variant_id);
      if (!inventoryId) throw new Error("Inventory record not found for variant");

      return api.patch<{ id: string }>(`/inventory/${inventoryId}/adjust`, {
        adjustment: params.quantity,
        movementType: "unreserve",
        reason: "payment_failed",
      });
    },
    onSuccess: () => {
      showSuccess("Stock Unreserved", "Stock has been unreserved");
      invalidateInventory(queryClient);
    },
    onError: (error: Error) => {
      showError("Failed to Unreserve Stock", error.message);
    },
  });
}

export function useCancelOrder() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: (params: CancelOrderInventoryParams) =>
      api.patch<{ id: string; order_number: string }>(
        `/orders/${params.order_id}/cancel`
      ),
    onSuccess: () => {
      showSuccess("Order Cancelled", "Order has been cancelled");
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      invalidateInventory(queryClient);
    },
    onError: (error: Error) => {
      showError("Failed to Cancel Order", error.message);
    },
  });
}

export function useReturnItem() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: async (params: ReturnItemParams) =>
      api.post<{ id: string }>(`/orders/${params.order_id}/return`, {
        orderItemId: params.order_item_id,
        quantity: params.quantity,
        reason: params.reason,
        isResellable: params.is_resellable,
      }),
    onSuccess: () => {
      showSuccess("Item Returned", "Item has been returned successfully");
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      invalidateInventory(queryClient);
    },
    onError: (error: Error) => {
      showError("Failed to Return Item", error.message);
    },
  });
}
