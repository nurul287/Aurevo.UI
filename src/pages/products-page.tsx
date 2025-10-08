import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/auth-context";
import { useAddToCart, useProducts } from "@/services";
import React, { useState } from "react";
import { Link } from "react-router-dom";

const ProductsPage = () => {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const [allProducts, setAllProducts] = useState<any[]>([]);

  const {
    data: productsData,
    isLoading,
    error,
    isFetching,
  } = useProducts({ page: currentPage, limit: 12 });
  const addToCartMutation = useAddToCart();

  // Update allProducts when new data is fetched
  React.useEffect(() => {
    if (productsData?.data) {
      if (currentPage === 1) {
        // First page - replace all products
        setAllProducts(productsData.data);
      } else {
        // Subsequent pages - append to existing products
        setAllProducts((prev) => [...prev, ...productsData.data]);
      }
    }
  }, [productsData, currentPage]);

  const handleLoadMore = () => {
    setCurrentPage((prev) => prev + 1);
  };

  const handleAddToCart = async (product: any) => {
    try {
      // For now, use the first variant if available
      const variant = product.variants?.[0];
      if (!variant) {
        alert("This product has no available variants");
        return;
      }

      // Use TanStack Query mutation (works for both logged-in and guest users)
      await addToCartMutation.mutateAsync({
        userId: user?.id,
        sessionId: user?.id
          ? undefined
          : localStorage.getItem("guest_session_id") || undefined,
        productId: product.id,
        variantId: variant.id,
        quantity: 1,
      });

      alert(`${product.name} has been added to your cart`);
    } catch (error) {
      console.error("Add to cart error:", error);
      alert("Failed to add item to cart");
    }
  };

  // Show loading spinner only for initial load (page 1)
  if (isLoading && currentPage === 1) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner"></div>
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
          <Button>Try Again</Button>
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
          <Button>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container-custom">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">All Products</h1>
          <p className="text-gray-600">
            Discover our complete collection of premium footwear
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {allProducts.map((product) => (
            <Card
              key={product.id}
              className="overflow-hidden hover:shadow-lg transition-shadow"
            >
              <Link to={`/products/${product.id}`}>
                <img
                  src={
                    product.images?.[0]?.url ||
                    "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400"
                  }
                  alt={product.name}
                  className="w-full h-64 object-cover"
                />
              </Link>
              <CardContent className="p-4">
                <CardTitle className="text-lg mb-2">{product.name}</CardTitle>
                <p className="text-gray-600 text-sm mb-2">
                  {product.brand?.name}
                </p>
                <div className="flex items-center justify-between">
                  <p className="text-primary-600 font-bold text-xl">
                    ${product.base_price}
                  </p>
                  <Button
                    onClick={(e) => {
                      e.preventDefault();
                      handleAddToCart(product);
                    }}
                    variant="addToCart"
                    size="sm"
                    disabled={!product.variants?.length}
                  >
                    Add to Cart
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Load More Button */}
        {productsData && allProducts.length < productsData.count && (
          <div className="mt-12 text-center">
            <Button
              onClick={handleLoadMore}
              disabled={isFetching}
              variant="loadMore"
              size="xl"
              className="px-12 py-4"
            >
              {isFetching ? (
                <>
                  <div className="w-5 h-5 border-2 border-slate-600 border-t-transparent rounded-full animate-spin mr-3" />
                  Loading More...
                </>
              ) : (
                <>
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                  Load More Products
                </>
              )}
            </Button>
          </div>
        )}
        <p className="text-sm text-gray-500 mt-4 font-medium text-center">
          Showing {allProducts.length} of {productsData?.count} products
        </p>
      </div>
    </div>
  );
};

export default ProductsPage;
