import { ProductCard } from "@/components/product-card";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { APP_PATHS } from "@/constants/app-paths";
import { useInfiniteProducts } from "@/services";
import { useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";

const ProductsPage = () => {
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const {
    data,
    isLoading,
    error,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteProducts(12);

  // Flatten all pages into a single array
  const allProducts = data?.pages.flatMap((page) => page.data) || [];
  const totalCount = data?.pages[0]?.count || 0;

  // Intersection Observer for infinite scroll
  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const target = entries[0];
      if (target.isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    [hasNextPage, isFetchingNextPage, fetchNextPage]
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

  // Show loading spinner only for initial load
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-gray-300 border-t-gray-900 rounded-full animate-spin"></div>
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

  // Show no products message only if we have no products at all
  if (!isLoading && allProducts.length === 0) {
    return (
      <div className="min-h-screen py-8">
        <div className="container-custom text-center">
          <h1 className="text-3xl font-bold mb-4">No Products Available</h1>
          <p className="text-gray-600 mb-8">
            We're having trouble loading our products. Please try again later.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 bg-gray-50">
      <div className="container-custom">
        {/* Breadcrumb */}
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to={APP_PATHS.home}>Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Products</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">All Products</h1>
          <p className="text-gray-600">
            Discover our complete collection of premium footwear
          </p>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {allProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* Infinite Scroll Trigger */}
        <div ref={loadMoreRef} className="mt-8 flex justify-center">
          {isFetchingNextPage && (
            <div className="flex items-center gap-3 py-4">
              <div className="w-6 h-6 border-3 border-gray-300 border-t-gray-900 rounded-full animate-spin"></div>
              <span className="text-sm text-gray-500">
                Loading more products...
              </span>
            </div>
          )}
        </div>

        {/* Product Count */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500 font-medium">
            Showing {allProducts.length} of {totalCount} products
          </p>
          {!hasNextPage && allProducts.length > 0 && (
            <p className="text-sm text-gray-400 mt-2">Showing all products.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
