import { ProductCard } from "@/components/product-card";
import { LoadingIndicator, LoadingSpinner } from "@/components/ui/loading-spinner";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { APP_PATHS } from "@/constants/app-paths";
import { useCategories, useInfiniteProducts } from "@/services";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";

const ProductsPage = () => {
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const [searchParams] = useSearchParams();
  const categorySlug = searchParams.get("category")?.trim() ?? "";
  const searchParam = searchParams.get("search")?.trim() ?? "";

  const { data: categories = [], isLoading: categoriesLoading } =
    useCategories();

  const matchedCategory = useMemo(() => {
    if (!categorySlug) return undefined;
    return categories.find(
      (c) => c.slug?.toLowerCase() === categorySlug.toLowerCase(),
    );
  }, [categories, categorySlug]);

  const filters = useMemo(
    () => ({
      categorySlug: categorySlug || null,
      search: searchParam || null,
    }),
    [categorySlug, searchParam],
  );

  const {
    data,
    isLoading,
    error,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteProducts(12, filters);

  const allProducts = data?.pages.flatMap((page) => page.data) || [];
  const totalCount = data?.pages[0]?.count ?? 0;

  const unknownCategory =
    Boolean(categorySlug) && !categoriesLoading && !matchedCategory;

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const target = entries[0];
      if (target.isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    [hasNextPage, isFetchingNextPage, fetchNextPage],
  );

  useEffect(() => {
    const observer = new IntersectionObserver(handleObserver, {
      root: null,
      rootMargin: "100px",
      threshold: 0.1,
    });

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [handleObserver]);

  const showInitialSpinner =
    isLoading || (Boolean(categorySlug) && categoriesLoading);

  if (showInitialSpinner) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" className="text-gray-900" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen py-8">
        <div className="container-custom text-center">
          <h1 className="text-3xl font-bold mb-4">Error Loading Products</h1>
          <p className="text-gray-600 mb-8">
            {error.message ||
              "Failed to load products. Please try again later."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-6 bg-gray-50">
      <div className="container-custom">
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to={APP_PATHS.home}>Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              {matchedCategory && !unknownCategory ? (
                <>
                  <BreadcrumbLink asChild>
                    <Link to={APP_PATHS.products}>Products</Link>
                  </BreadcrumbLink>
                  <BreadcrumbSeparator />
                  <BreadcrumbPage>{matchedCategory.name}</BreadcrumbPage>
                </>
              ) : (
                <BreadcrumbPage>Products</BreadcrumbPage>
              )}
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {unknownCategory ? (
          <div className="rounded-lg border border-gray-200 bg-white px-6 py-12 text-center max-w-lg mx-auto">
            <p className="text-gray-700 mb-6">
              Check the spelling or pick a category from the header. You can
              still explore everything we carry.
            </p>
            <Link
              to={APP_PATHS.products}
              className="text-sm font-medium text-[#FF6600] hover:text-[#E65C00] underline"
            >
              View all products
            </Link>
          </div>
        ) : !isLoading && allProducts.length === 0 && totalCount === 0 ? (
          <div className="rounded-lg border border-gray-200 bg-white px-6 py-12 text-center max-w-lg mx-auto">
            {searchParam ? (
              <>
                <p className="text-gray-700 mb-2">
                  No products matched your search.
                </p>
                <p className="text-gray-500 text-sm mb-6">
                  Try different keywords, or browse by category from the menu
                  above.
                </p>
                <Link
                  to={APP_PATHS.products}
                  className="text-sm font-medium text-[#FF6600] hover:text-[#E65C00] underline"
                >
                  Clear search and view all products
                </Link>
              </>
            ) : matchedCategory ? (
              <>
                <p className="text-gray-700 mb-2">
                  There are no products listed in{" "}
                  <span className="font-semibold text-gray-900">
                    {matchedCategory.name}
                  </span>{" "}
                  right now.
                </p>
                <p className="text-gray-500 text-sm mb-6">
                  New arrivals land regularly—please check back soon, or browse
                  our other categories.
                </p>
                <Link
                  to={APP_PATHS.products}
                  className="text-sm font-medium text-[#FF6600] hover:text-[#E65C00] underline"
                >
                  View all products
                </Link>
              </>
            ) : (
              <>
                <p className="text-gray-700 mb-2">No products available</p>
                <p className="text-gray-500 text-sm mb-6">
                  We could not load any products at the moment. Please try again
                  later.
                </p>
              </>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {allProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            <div ref={loadMoreRef} className="mt-8 flex justify-center">
              {isFetchingNextPage && (
                <LoadingIndicator
                  size="sm"
                  className="py-4"
                  label="Loading more products"
                />
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ProductsPage;
