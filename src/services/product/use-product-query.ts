import { apiFetch, apiFetchList } from "@/lib/api";
import {
  sortAdminVariantRows,
  sortProductVariants,
  withSortedVariants,
  withSortedVariantsOnProducts,
} from "@/lib/variant-size-sort";
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
import {
  productMatchesPromoColorRole,
  PROMOTIONAL_BANNER_PRODUCT_SLUGS,
  type PromotionalBannerColor,
} from "@/constants/promotional-banners";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

export type AdminProductsParams = {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: "true" | "false";
  categoryId?: string;
  brandId?: string;
};

export const productQueryKeys = {
  adminProducts: (params: AdminProductsParams) => ["products", "admin", params] as const,
  products: (params: PaginationParams) => ["products", "list", params] as const,
  product: (id: string) => ["products", "detail", id] as const,
  productBySlug: (slug: string) => ["products", "detail", "slug", slug] as const,
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
  promotionalBannerProducts: ["products", "promotional-banners"] as const,
} as const;

// ── helpers ──────────────────────────────────────────────────────────────────

function buildProductsUrl(params: {
  page?: number;
  limit?: number;
  search?: string | null;
  categoryId?: string | null;
  brandId?: string | null;
  isActive?: boolean;
  isFeatured?: boolean;
}): string {
  const q = new URLSearchParams();
  if (params.page) q.set("page", String(params.page));
  if (params.limit) q.set("limit", String(params.limit));
  if (params.search) q.set("search", params.search);
  if (params.categoryId) q.set("categoryId", params.categoryId);
  if (params.brandId) q.set("brandId", params.brandId);
  if (params.isActive !== undefined) q.set("isActive", String(params.isActive));
  if (params.isFeatured !== undefined) q.set("isFeatured", String(params.isFeatured));
  return `/products?${q.toString()}`;
}

async function fetchPublicProductBySlug(
  slug: string
): Promise<PublicProductWithVariants | null> {
  try {
    const data = await apiFetch<PublicProductWithVariants>(
      `/products/by-slug/${encodeURIComponent(slug)}`,
      { skipAuth: true }
    );
    return data ? withSortedVariants(data) : null;
  } catch (err: unknown) {
    if ((err as { status?: number }).status === 404) return null;
    throw err;
  }
}

async function resolvePromotionalBannerProduct(
  role: PromotionalBannerColor,
  excludeProductIds: string[] = []
): Promise<PublicProductWithVariants | null> {
  const slugs = PROMOTIONAL_BANNER_PRODUCT_SLUGS[role];
  const results = await Promise.all(slugs.map(fetchPublicProductBySlug));
  const match = results.find(
    (p) => p !== null && !excludeProductIds.includes(p.id)
  );
  if (match) return match;

  // Fallback: search for vomero
  try {
    const { data } = await apiFetchList<PublicProductWithVariants>(
      "/products?search=vomero&limit=20&isActive=true",
      { skipAuth: true }
    );
    const products = withSortedVariantsOnProducts(data ?? []).filter(
      (p) => !excludeProductIds.includes(p.id)
    );
    const byColor = products.filter((p) =>
      productMatchesPromoColorRole(p.variants, role)
    );
    if (byColor[0]) return byColor[0];
    if (products.length === 1) return products[0];
  } catch {
    // ignore
  }
  return null;
}

// ── Public query hooks ────────────────────────────────────────────────────────

export function useProducts(params: PaginationParams = {}) {
  const { page = 1, limit = 10 } = params;
  return useQuery({
    queryKey: productQueryKeys.products(params),
    queryFn: async (): Promise<PaginatedResponse<ProductWithVariants>> => {
      const { data, pagination } = await apiFetchList<ProductWithVariants>(
        buildProductsUrl({ page, limit }),
        { skipAuth: true }
      );
      return {
        data: withSortedVariantsOnProducts(data),
        count: pagination.total,
        page: pagination.page,
        limit: pagination.limit,
        totalPages: pagination.totalPages,
      };
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useAdminProducts(params: AdminProductsParams & { enabled?: boolean } = {}) {
  const { page = 1, limit = 20, search, isActive, categoryId, brandId, enabled = true } = params;
  return useQuery({
    queryKey: productQueryKeys.adminProducts(params),
    enabled,
    queryFn: async (): Promise<PaginatedResponse<ProductWithVariants>> => {
      const { data, pagination } = await apiFetchList<ProductWithVariants>(
        buildProductsUrl({ page, limit, search: search || undefined, isActive: isActive ? isActive === "true" : undefined, categoryId, brandId }),
        { skipAuth: false }
      );
      return {
        data: withSortedVariantsOnProducts(data),
        count: pagination.total,
        page: pagination.page,
        limit: pagination.limit,
        totalPages: pagination.totalPages,
      };
    },
    staleTime: 0,
  });
}

export type InfiniteProductsFilters = {
  categorySlug?: string | null;
  search?: string | null;
};

export function useInfiniteProducts(
  limit: number = 12,
  filters: InfiniteProductsFilters = {}
) {
  const categorySlug = filters.categorySlug?.trim() || null;
  const searchRaw = filters.search?.trim() || null;

  return useInfiniteQuery({
    queryKey: ["products", "infinite", limit, categorySlug ?? "", searchRaw ?? ""],
    queryFn: async ({ pageParam = 1 }) => {
      // Resolve categorySlug → id via BE
      let categoryId: string | null = null;
      if (categorySlug) {
        try {
          const { data: cats } = await apiFetchList<Category>(
            `/categories?limit=100`,
            { skipAuth: true }
          );
          categoryId =
            cats.find(
              (c) => c.slug.toLowerCase() === categorySlug.toLowerCase()
            )?.id ?? null;
          if (!categoryId) {
            return { data: [], count: 0, page: pageParam, limit, totalPages: 0 };
          }
        } catch {
          return { data: [], count: 0, page: pageParam, limit, totalPages: 0 };
        }
      }

      const { data, pagination } = await apiFetchList<PublicProductWithVariants>(
        buildProductsUrl({
          page: pageParam,
          limit,
          search: searchRaw,
          categoryId,
          isActive: true,
        }),
        { skipAuth: true }
      );

      return {
        data: withSortedVariantsOnProducts(data ?? []),
        count: pagination.total,
        page: pageParam,
        limit,
        totalPages: pagination.totalPages,
      };
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
    staleTime: 5 * 60 * 1000,
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: productQueryKeys.product(id),
    queryFn: async (): Promise<PublicProductWithVariants | null> => {
      try {
        const data = await apiFetch<PublicProductWithVariants>(
          `/products/${id}`,
          { skipAuth: true }
        );
        return data ? withSortedVariants(data) : null;
      } catch (err: unknown) {
        if ((err as { status?: number }).status === 404) return null;
        throw err;
      }
    },
    enabled: !!id,
    staleTime: 10 * 60 * 1000,
  });
}

export function useProductBySlug(slug: string) {
  return useQuery({
    queryKey: productQueryKeys.productBySlug(slug),
    queryFn: () => fetchPublicProductBySlug(slug),
    enabled: !!slug,
    staleTime: 10 * 60 * 1000,
  });
}

export function usePromotionalBannerProducts() {
  return useQuery({
    queryKey: productQueryKeys.promotionalBannerProducts,
    queryFn: async (): Promise<{
      orange: PublicProductWithVariants | null;
      white: PublicProductWithVariants | null;
    }> => {
      const orange = await resolvePromotionalBannerProduct("orange");
      const white = await resolvePromotionalBannerProduct(
        "white",
        orange ? [orange.id] : []
      );
      return { orange, white };
    },
    staleTime: 10 * 60 * 1000,
  });
}

export function useProductsByCategory(
  categoryId: string,
  params: PaginationParams = {}
) {
  const { page = 1, limit = 10 } = params;
  return useQuery({
    queryKey: productQueryKeys.productsByCategory(categoryId, params),
    queryFn: async (): Promise<PaginatedResponse<PublicProductWithVariants>> => {
      const { data, pagination } = await apiFetchList<PublicProductWithVariants>(
        buildProductsUrl({ page, limit, categoryId }),
        { skipAuth: true }
      );
      return {
        data: withSortedVariantsOnProducts(data),
        count: pagination.total,
        page: pagination.page,
        limit: pagination.limit,
        totalPages: pagination.totalPages,
      };
    },
    enabled: !!categoryId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useSearchProducts(query: string, params: PaginationParams = {}) {
  const { page = 1, limit = 10 } = params;
  return useQuery({
    queryKey: productQueryKeys.searchProducts(query, params),
    queryFn: async (): Promise<PaginatedResponse<PublicProductWithVariants>> => {
      const { data, pagination } = await apiFetchList<PublicProductWithVariants>(
        buildProductsUrl({ page, limit, search: query.trim(), isActive: true }),
        { skipAuth: true }
      );
      return {
        data: withSortedVariantsOnProducts(data),
        count: pagination.total,
        page: pagination.page,
        limit: pagination.limit,
        totalPages: pagination.totalPages,
      };
    },
    enabled: !!query.trim() && query.trim().length >= 2,
    staleTime: 2 * 60 * 1000,
  });
}

export function useProductVariants(productId: string) {
  return useQuery({
    queryKey: productQueryKeys.productVariants(productId),
    queryFn: async (): Promise<ProductVariant[]> => {
      const { data } = await apiFetchList<ProductVariant>(
        `/products/${productId}/variants`,
        { skipAuth: true }
      );
      return sortProductVariants(data);
    },
    enabled: !!productId,
    staleTime: 15 * 60 * 1000,
  });
}

export function useAllVariants() {
  return useQuery({
    queryKey: ["variants", "all"],
    queryFn: async (): Promise<(ProductVariant & { product?: Product })[]> => {
      const { data } = await apiFetchList<ProductVariant & { product?: Product }>(
        "/variants"
      );
      return sortAdminVariantRows(data);
    },
    staleTime: 15 * 60 * 1000,
  });
}

export function useAllImages() {
  return useQuery({
    queryKey: ["products", "images", "all"],
    queryFn: async (): Promise<
      (ProductImage & { product?: Product; variant?: ProductVariant })[]
    > => {
      const { data } = await apiFetchList<
        ProductImage & { product?: Product; variant?: ProductVariant }
      >("/products?limit=1000");
      const allProducts = data as unknown as (Product & {
        images?: (ProductImage & { variant?: ProductVariant })[];
      })[];
      const images: (ProductImage & { product?: Product; variant?: ProductVariant })[] = [];
      for (const p of allProducts) {
        for (const img of p.images ?? []) {
          images.push({ ...img, product: p });
        }
      }
      return images;
    },
    staleTime: 15 * 60 * 1000,
  });
}

export function useCategories() {
  return useQuery({
    queryKey: productQueryKeys.categories,
    queryFn: async (): Promise<Category[]> => {
      const { data } = await apiFetchList<Category>("/categories?limit=100", {
        skipAuth: true,
      });
      return data;
    },
    staleTime: 30 * 60 * 1000,
  });
}

export function useBrands() {
  return useQuery({
    queryKey: productQueryKeys.brands,
    queryFn: async (): Promise<Brand[]> => {
      const { data } = await apiFetchList<Brand>("/brands?limit=100", {
        skipAuth: true,
      });
      return data;
    },
    staleTime: 30 * 60 * 1000,
  });
}
