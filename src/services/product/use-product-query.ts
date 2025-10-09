import { supabase } from "@/lib/supabase";
import {
  Brand,
  Category,
  PaginatedResponse,
  PaginationParams,
  Product,
  ProductImage,
  ProductVariant,
  ProductWithVariants,
} from "@/services/types";
import { useQuery } from "@tanstack/react-query";

// Query keys for consistent cache management
export const productQueryKeys = {
  products: (params: PaginationParams) => ["products", "list", params] as const,
  product: (id: string) => ["products", "detail", id] as const,
  productsByCategory: (categoryId: string, params: PaginationParams) =>
    ["products", "category", categoryId, params] as const,
  searchProducts: (query: string, params: PaginationParams) =>
    ["products", "search", query, params] as const,
  productVariants: (productId: string) =>
    ["products", "variants", productId] as const,
  productVariant: (variantId: string) =>
    ["products", "variant", variantId] as const,
  productImages: (productId: string) =>
    ["products", "images", productId] as const,
  productImage: (imageId: string) => ["products", "image", imageId] as const,
  categories: ["products", "categories"] as const,
  brands: ["products", "brands"] as const,
} as const;

/**
 * Hook to get all products with pagination
 */
export function useProducts(params: PaginationParams = {}) {
  return useQuery({
    queryKey: productQueryKeys.products(params),
    queryFn: async (): Promise<PaginatedResponse<ProductWithVariants>> => {
      const { page = 1, limit = 10 } = params;
      const offset = (page - 1) * limit;

      console.log("🔍 Fetching products with pagination:", {
        page,
        limit,
        offset,
      });

      // Single optimized query that gets both count and data
      const { data, error, count } = await supabase
        .from("products")
        .select(
          `
          *,
          category:categories!category_id(*),
          brand:brands!brand_id(*),
          variants:product_variants(*),
          images:product_images(*)
        `,
          { count: "exact" }
        )
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error("❌ Error fetching products:", error);
        throw error;
      }

      const totalPages = Math.ceil((count || 0) / limit);

      console.log("📦 Products fetched:", {
        items: data?.length || 0,
        total: count || 0,
        page,
        totalPages,
      });

      return {
        data: data || [],
        count: count || 0,
        page,
        limit,
        totalPages,
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to get a single product by ID
 */
export function useProduct(id: string) {
  return useQuery({
    queryKey: productQueryKeys.product(id),
    queryFn: async (): Promise<ProductWithVariants | null> => {
      const { data, error } = await supabase
        .from("products")
        .select(
          `
          *,
          category:categories!category_id(*),
          brand:brands!brand_id(*),
          variants:product_variants(*),
          images:product_images(*)
        `
        )
        .eq("id", id)
        .single();

      if (error) {
        if (error.code === "PGRST116") return null; // Product doesn't exist
        throw error;
      }

      return data;
    },
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook to get products by category
 */
export function useProductsByCategory(
  categoryId: string,
  params: PaginationParams = {}
) {
  return useQuery({
    queryKey: productQueryKeys.productsByCategory(categoryId, params),
    queryFn: async (): Promise<PaginatedResponse<ProductWithVariants>> => {
      const { page = 1, limit = 10 } = params;
      const offset = (page - 1) * limit;

      console.log("🔍 Fetching products by category:", {
        categoryId,
        page,
        limit,
        offset,
      });

      // Single optimized query that gets both count and data
      const { data, error, count } = await supabase
        .from("products")
        .select(
          `
          *,
          category:categories!category_id(*),
          brand:brands!brand_id(*),
          variants:product_variants(*),
          images:product_images(*)
        `,
          { count: "exact" }
        )
        .eq("category_id", categoryId)
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error("❌ Error fetching products by category:", error);
        throw error;
      }

      const totalPages = Math.ceil((count || 0) / limit);

      console.log("📦 Products by category fetched:", {
        categoryId,
        items: data?.length || 0,
        total: count || 0,
        page,
        totalPages,
      });

      return {
        data: data || [],
        count: count || 0,
        page,
        limit,
        totalPages,
      };
    },
    enabled: !!categoryId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to search products
 */
export function useSearchProducts(
  query: string,
  params: PaginationParams = {}
) {
  return useQuery({
    queryKey: productQueryKeys.searchProducts(query, params),
    queryFn: async (): Promise<PaginatedResponse<ProductWithVariants>> => {
      const { page = 1, limit = 10 } = params;
      const offset = (page - 1) * limit;

      console.log("🔍 Searching products:", { query, page, limit, offset });

      // Single optimized query that gets both count and data
      const { data, error, count } = await supabase
        .from("products")
        .select(
          `
          *,
          category:categories!category_id(*),
          brand:brands!brand_id(*),
          variants:product_variants(*),
          images:product_images(*)
        `,
          { count: "exact" }
        )
        .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error("❌ Error searching products:", error);
        throw error;
      }

      const totalPages = Math.ceil((count || 0) / limit);

      console.log("📦 Search results:", {
        query,
        items: data?.length || 0,
        total: count || 0,
        page,
        totalPages,
      });

      return {
        data: data || [],
        count: count || 0,
        page,
        limit,
        totalPages,
      };
    },
    enabled: !!query && query.length > 0,
    staleTime: 2 * 60 * 1000, // 2 minutes for search results
  });
}

/**
 * Hook to get product variants
 */
export function useProductVariants(productId: string) {
  return useQuery({
    queryKey: productQueryKeys.productVariants(productId),
    queryFn: async (): Promise<ProductVariant[]> => {
      const { data, error } = await supabase
        .from("product_variants")
        .select("*")
        .eq("product_id", productId)
        .order("size", { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: !!productId,
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
}

/**
 * Hook to get all variants across all products
 */
export function useAllVariants() {
  return useQuery({
    queryKey: ["products", "variants", "all"],
    queryFn: async (): Promise<(ProductVariant & { product?: Product })[]> => {
      const { data, error } = await supabase
        .from("product_variants")
        .select(
          `
          *,
          product:products(id, name, slug)
        `
        )
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
}

/**
 * Hook to get all images across all products
 */
export function useAllImages() {
  return useQuery({
    queryKey: ["products", "images", "all"],
    queryFn: async (): Promise<
      (ProductImage & { product?: Product; variant?: ProductVariant })[]
    > => {
      const { data, error } = await supabase
        .from("product_images")
        .select(
          `
          *,
          product:products(id, name, slug),
          variant:product_variants(id, name, size, color)
        `
        )
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
}

/**
 * Hook to get categories
 */
export function useCategories() {
  return useQuery({
    queryKey: productQueryKeys.categories,
    queryFn: async (): Promise<Category[]> => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });

      if (error) throw error;
      return data || [];
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
}

/**
 * Hook to get brands
 */
export function useBrands() {
  return useQuery({
    queryKey: productQueryKeys.brands,
    queryFn: async (): Promise<Brand[]> => {
      const { data, error } = await supabase
        .from("brands")
        .select("*")
        .eq("is_active", true)
        .order("name", { ascending: true });

      if (error) throw error;
      return data || [];
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
}
