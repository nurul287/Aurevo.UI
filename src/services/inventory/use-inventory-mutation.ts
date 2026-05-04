import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { useMutation, useQueryClient } from "@tanstack/react-query";

// Types
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
  dimensions?: Record<string, any>;
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
  dimensions?: Record<string, any>;
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
  /** Stored on the movement row as notes (e.g. admin reason). */
  notes?: string;
}

/** Maps Supabase/Postgres RPC failures to short, user-readable text. */
function inventoryRpcErrorMessage(error: unknown): string {
  const raw =
    error &&
    typeof error === "object" &&
    "message" in error &&
    typeof (error as { message: unknown }).message === "string"
      ? (error as { message: string }).message
      : String(error);

  if (raw.includes("Could not choose the best candidate function")) {
    return "Stock could not be updated due to a server procedure conflict. Please refresh and try again, or contact support.";
  }

  if (
    raw.includes("public.") &&
    (raw.includes("function") || raw.includes("candidate"))
  ) {
    return "Could not update stock. Please try again or contact support if this continues.";
  }

  if (raw.length > 220) {
    return "Something went wrong. Please try again.";
  }

  return raw;
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

export interface CancelOrderParams {
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

// Add Product Mutation
export function useAddProduct() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: async (params: AddProductParams) => {
      const { data, error } = await supabase.rpc("add_product", {
        p_name: params.name,
        p_slug: params.slug,
        p_base_price: params.base_price,
        p_description: params.description,
        p_short_description: params.short_description,
        p_sku: params.sku,
        p_category_id: params.category_id,
        p_brand_id: params.brand_id,
        p_gender: params.gender,
        p_material: params.material,
        p_care_instructions: params.care_instructions,
        p_weight: params.weight,
        p_dimensions: params.dimensions,
        p_compare_at_price: params.compare_at_price,
        p_is_featured: params.is_featured,
        p_requires_shipping: params.requires_shipping,
        p_track_inventory: params.track_inventory,
        p_allow_backorder: params.allow_backorder,
        p_min_order_quantity: params.min_order_quantity,
        p_max_order_quantity: params.max_order_quantity,
        p_meta_title: params.meta_title,
        p_meta_description: params.meta_description,
        p_tags: params.tags,
        p_low_stock_threshold: params.low_stock_threshold,
        p_variants: params.variants,
        p_initial_stock: params.initial_stock,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      if (data.success) {
        showSuccess("Product Added", data.message);
        queryClient.invalidateQueries({ queryKey: ["products"] });
        // Invalidate all inventory-related queries
        queryClient.invalidateQueries({ queryKey: ["inventory-levels"] });
        queryClient.invalidateQueries({ queryKey: ["inventory-movements"] });
        queryClient.invalidateQueries({ queryKey: ["inventory-summary"] });
        queryClient.invalidateQueries({ queryKey: ["inventory-stats"] });
      } else {
        showError("Failed to Add Product", data.message);
      }
    },
    onError: (error) => {
      showError("Failed to Add Product", inventoryRpcErrorMessage(error));
    },
  });
}

// Update Product Mutation (inventory RPC; distinct from catalog useUpdateProduct)
export function useInventoryUpdateProduct() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: async (params: InventoryUpdateProductParams) => {
      const { data, error } = await supabase.rpc("update_product", {
        p_product_id: params.product_id,
        p_name: params.name,
        p_slug: params.slug,
        p_description: params.description,
        p_short_description: params.short_description,
        p_sku: params.sku,
        p_category_id: params.category_id,
        p_brand_id: params.brand_id,
        p_gender: params.gender,
        p_material: params.material,
        p_care_instructions: params.care_instructions,
        p_weight: params.weight,
        p_dimensions: params.dimensions,
        p_base_price: params.base_price,
        p_compare_at_price: params.compare_at_price,
        p_is_featured: params.is_featured,
        p_requires_shipping: params.requires_shipping,
        p_track_inventory: params.track_inventory,
        p_allow_backorder: params.allow_backorder,
        p_min_order_quantity: params.min_order_quantity,
        p_max_order_quantity: params.max_order_quantity,
        p_meta_title: params.meta_title,
        p_meta_description: params.meta_description,
        p_tags: params.tags,
        p_low_stock_threshold: params.low_stock_threshold,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      if (data.success) {
        showSuccess("Product Updated", data.message);
        queryClient.invalidateQueries({ queryKey: ["products"] });
        queryClient.invalidateQueries({
          queryKey: ["product", data.product_id],
        });
      } else {
        showError("Failed to Update Product", data.message);
      }
    },
    onError: (error) => {
      showError("Failed to Update Product", inventoryRpcErrorMessage(error));
    },
  });
}

// Restock Inventory Mutation
export function useRestockInventory() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: async (params: RestockParams) => {
      const { data, error } = await supabase.rpc("restock_inventory", {
        p_variant_id: params.variant_id,
        p_quantity: params.quantity,
        p_cost_per_unit: params.cost_per_unit,
        p_reference_number: params.reference_number,
        p_notes: params.notes,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      if (data.success) {
        showSuccess("Stock Updated", data.message);
        // Invalidate all inventory-related queries
        queryClient.invalidateQueries({ queryKey: ["inventory-levels"] });
        queryClient.invalidateQueries({ queryKey: ["inventory-movements"] });
        queryClient.invalidateQueries({ queryKey: ["inventory-summary"] });
        queryClient.invalidateQueries({ queryKey: ["inventory-stats"] });
        queryClient.invalidateQueries({ queryKey: ["products"] });
      } else {
        showError("Failed to Restock", data.message);
      }
    },
    onError: (error) => {
      showError("Failed to Restock", inventoryRpcErrorMessage(error));
    },
  });
}

// Decrease Stock Mutation
export function useDecreaseStock() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: async (params: DecreaseStockParams) => {
      const { data, error } = await supabase.rpc("decrease_stock", {
        p_variant_id: params.variant_id,
        p_quantity: params.quantity,
        p_order_id: params.order_id ?? null,
        p_order_item_id: params.order_item_id ?? null,
        p_user_id: null,
        p_reference_number: null,
        p_notes: params.notes ?? null,
        p_location: "main",
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      if (data.success) {
        showSuccess("Stock Decreased", data.message);
        // Invalidate all inventory-related queries
        queryClient.invalidateQueries({ queryKey: ["inventory-levels"] });
        queryClient.invalidateQueries({ queryKey: ["inventory-movements"] });
        queryClient.invalidateQueries({ queryKey: ["inventory-summary"] });
        queryClient.invalidateQueries({ queryKey: ["inventory-stats"] });
        queryClient.invalidateQueries({ queryKey: ["products"] });
      } else {
        showError("Failed to Decrease Stock", data.message);
      }
    },
    onError: (error) => {
      showError("Failed to Decrease Stock", inventoryRpcErrorMessage(error));
    },
  });
}

// Reserve Stock Mutation
export function useReserveStock() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: async (params: ReserveStockParams) => {
      const { data, error } = await supabase.rpc("reserve_stock", {
        p_variant_id: params.variant_id,
        p_quantity: params.quantity,
        p_order_id: params.order_id,
        p_order_item_id: params.order_item_id,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      if (data.success) {
        showSuccess("Stock Reserved", data.message);
        // Invalidate all inventory-related queries
        queryClient.invalidateQueries({ queryKey: ["inventory-levels"] });
        queryClient.invalidateQueries({ queryKey: ["inventory-movements"] });
        queryClient.invalidateQueries({ queryKey: ["inventory-summary"] });
        queryClient.invalidateQueries({ queryKey: ["inventory-stats"] });
      } else {
        showError("Failed to Reserve Stock", data.message);
      }
    },
    onError: (error) => {
      showError("Failed to Reserve Stock", inventoryRpcErrorMessage(error));
    },
  });
}

// Unreserve Stock Mutation
export function useUnreserveStock() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: async (params: UnreserveStockParams) => {
      const { data, error } = await supabase.rpc("unreserve_stock", {
        p_variant_id: params.variant_id,
        p_quantity: params.quantity,
        p_order_id: params.order_id,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      if (data.success) {
        showSuccess("Stock Unreserved", data.message);
        // Invalidate all inventory-related queries
        queryClient.invalidateQueries({ queryKey: ["inventory-levels"] });
        queryClient.invalidateQueries({ queryKey: ["inventory-movements"] });
        queryClient.invalidateQueries({ queryKey: ["inventory-summary"] });
        queryClient.invalidateQueries({ queryKey: ["inventory-stats"] });
      } else {
        showError("Failed to Unreserve Stock", data.message);
      }
    },
    onError: (error) => {
      showError("Failed to Unreserve Stock", inventoryRpcErrorMessage(error));
    },
  });
}

// Cancel Order Mutation
export function useCancelOrder() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: async (params: CancelOrderParams) => {
      const { data, error } = await supabase.rpc("cancel_order", {
        p_order_id: params.order_id,
        p_reason: params.reason,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      if (data.success) {
        showSuccess("Order Cancelled", data.message);
        queryClient.invalidateQueries({ queryKey: ["orders"] });
        // Invalidate all inventory-related queries
        queryClient.invalidateQueries({ queryKey: ["inventory-levels"] });
        queryClient.invalidateQueries({ queryKey: ["inventory-movements"] });
        queryClient.invalidateQueries({ queryKey: ["inventory-summary"] });
        queryClient.invalidateQueries({ queryKey: ["inventory-stats"] });
      } else {
        showError("Failed to Cancel Order", data.message);
      }
    },
    onError: (error) => {
      showError("Failed to Cancel Order", inventoryRpcErrorMessage(error));
    },
  });
}

// Return Item Mutation
export function useReturnItem() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: async (params: ReturnItemParams) => {
      const { data, error } = await supabase.rpc("return_item", {
        p_order_id: params.order_id,
        p_order_item_id: params.order_item_id,
        p_quantity: params.quantity,
        p_reason: params.reason,
        p_is_resellable: params.is_resellable,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      if (data.success) {
        showSuccess("Item Returned", data.message);
        queryClient.invalidateQueries({ queryKey: ["orders"] });
        // Invalidate all inventory-related queries
        queryClient.invalidateQueries({ queryKey: ["inventory-levels"] });
        queryClient.invalidateQueries({ queryKey: ["inventory-movements"] });
        queryClient.invalidateQueries({ queryKey: ["inventory-summary"] });
        queryClient.invalidateQueries({ queryKey: ["inventory-stats"] });
      } else {
        showError("Failed to Return Item", data.message);
      }
    },
    onError: (error) => {
      showError("Failed to Return Item", inventoryRpcErrorMessage(error));
    },
  });
}
