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
  PublicProductWithVariants,
} from "@/services/types";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

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
          variants:product_variants(*, inventory(*)),
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

export type InfiniteProductsFilters = {
  categorySlug?: string | null;
  search?: string | null;
};

/** Escape LIKE wildcards and commas so user search cannot broaden or break `.or()`. */
function escapeIlikePattern(raw: string) {
  return raw
    .replace(/\\/g, "\\\\")
    .replace(/%/g, "\\%")
    .replace(/_/g, "\\_")
    .replace(/,/g, " ");
}

/**
 * Hook to get all products with infinite scroll pagination
 */
export function useInfiniteProducts(
  limit: number = 12,
  filters: InfiniteProductsFilters = {}
) {
  const categorySlug = filters.categorySlug?.trim() || null;
  const searchRaw = filters.search?.trim() || null;

  return useInfiniteQuery({
    queryKey: ["products", "infinite", limit, categorySlug ?? "", searchRaw ?? ""],
    queryFn: async ({ pageParam = 1 }) => {
      let resolvedCategoryId: string | null = null;

      if (categorySlug) {
        const { data: catRow, error: catError } = await supabase
          .from("categories")
          .select("id")
          .eq("is_active", true)
          .ilike("slug", categorySlug)
          .maybeSingle();

        if (catError) {
          console.error("❌ Error resolving category:", catError);
          throw catError;
        }

        if (!catRow?.id) {
          return {
            data: [],
            count: 0,
            page: pageParam,
            limit,
            totalPages: 0,
          };
        }
        resolvedCategoryId = catRow.id;
      }

      const offset = (pageParam - 1) * limit;

      let query = supabase
        .from("products")
        .select(
          `
          *,
          category:categories!category_id(*),
          brand:brands!brand_id(*),
          variants:product_variants(*, inventory(*)),
          images:product_images(*)
        `,
          { count: "exact" }
        )
        .eq("is_active", true);

      if (resolvedCategoryId) {
        query = query.eq("category_id", resolvedCategoryId);
      }

      if (searchRaw) {
        const term = escapeIlikePattern(searchRaw);
        query = query.or(
          `name.ilike.%${term}%,description.ilike.%${term}%,short_description.ilike.%${term}%`
        );
      }

      const { data, error, count } = await query
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error("❌ Error fetching products:", error);
        throw error;
      }

      const totalPages = Math.ceil((count || 0) / limit);

      return {
        data: data || [],
        count: count || 0,
        page: pageParam,
        limit,
        totalPages,
      };
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.page < lastPage.totalPages) {
        return lastPage.page + 1;
      }
      return undefined;
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
    queryFn: async (): Promise<PublicProductWithVariants | null> => {
      const { data, error } = await supabase
        .from("products")
        .select(
          `
          id,
          name,
          slug,
          description,
          short_description,
          sku,
          category_id,
          brand_id,
          gender,
          material,
          care_instructions,
          weight,
          dimensions,
          base_price,
          compare_at_price,
          is_active,
          is_featured,
          is_digital,
          requires_shipping,
          track_inventory,
          allow_backorder,
          min_order_quantity,
          max_order_quantity,
          meta_title,
          meta_description,
          tags,
          created_at,
          updated_at,
          category:categories!category_id(*),
          brand:brands!brand_id(*),
          variants:product_variants(id, product_id, sku, name, size, color, color_code, material, weight, price, compare_at_price, barcode, is_active, sort_order, created_at, updated_at, inventory(*)),
          images:product_images(*)
        `
        )
        .eq("id", id)
        .single();

      if (error) {
        if (error.code === "PGRST116") return null; // Product doesn't exist
        throw error;
      }

      // Supabase returns foreign key relations as arrays, normalize to single objects
      return data as unknown as PublicProductWithVariants;
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
    queryFn: async (): Promise<
      PaginatedResponse<PublicProductWithVariants>
    > => {
      const { page = 1, limit = 10 } = params;
      const offset = (page - 1) * limit;

      console.log("🔍 Fetching products by category:", {
        categoryId,
        page,
        limit,
        offset,
      });

      // Single optimized query that gets both count and data
      // Excluding cost_price from products and variants for security
      const { data, error, count } = await supabase
        .from("products")
        .select(
          `
          id,
          name,
          slug,
          description,
          short_description,
          sku,
          category_id,
          brand_id,
          gender,
          material,
          care_instructions,
          weight,
          dimensions,
          base_price,
          compare_at_price,
          is_active,
          is_featured,
          is_digital,
          requires_shipping,
          track_inventory,
          allow_backorder,
          min_order_quantity,
          max_order_quantity,
          meta_title,
          meta_description,
          tags,
          created_at,
          updated_at,
          category:categories!category_id(*),
          brand:brands!brand_id(*),
          variants:product_variants(id, product_id, sku, name, size, color, color_code, material, weight, price, compare_at_price, barcode, is_active, sort_order, created_at, updated_at, inventory(*)),
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
        data: (data || []) as unknown as PublicProductWithVariants[],
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
    queryFn: async (): Promise<
      PaginatedResponse<PublicProductWithVariants>
    > => {
      const { page = 1, limit = 10 } = params;
      const offset = (page - 1) * limit;

      console.log("🔍 Searching products:", { query, page, limit, offset });

      // Single optimized query that gets both count and data
      // Excluding cost_price from products and variants for security
      const { data, error, count } = await supabase
        .from("products")
        .select(
          `
          id,
          name,
          slug,
          description,
          short_description,
          sku,
          category_id,
          brand_id,
          gender,
          material,
          care_instructions,
          weight,
          dimensions,
          base_price,
          compare_at_price,
          is_active,
          is_featured,
          is_digital,
          requires_shipping,
          track_inventory,
          allow_backorder,
          min_order_quantity,
          max_order_quantity,
          meta_title,
          meta_description,
          tags,
          created_at,
          updated_at,
          category:categories!category_id(*),
          brand:brands!brand_id(*),
          variants:product_variants(id, product_id, sku, name, size, color, color_code, material, weight, price, compare_at_price, barcode, is_active, sort_order, created_at, updated_at, inventory(*)),
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
        data: (data || []) as unknown as PublicProductWithVariants[],
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
