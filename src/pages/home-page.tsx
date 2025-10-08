import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useCategories, useProducts, useProductsByCategory } from "@/services";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  HeartIcon,
  RotateCcwIcon,
  ShieldCheckIcon,
  TruckIcon,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

const HomePage = () => {
  const { data: categories = [], isLoading: categoriesLoading } =
    useCategories();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 12;

  // Fetch all products or filtered by category
  const allProductsQuery = useProducts({
    page: currentPage,
    limit,
  });

  const categoryProductsQuery = useProductsByCategory(selectedCategory || "", {
    page: currentPage,
    limit,
  });

  // Use the appropriate query based on selected category
  const {
    data: productsData,
    isLoading: productsLoading,
    error: productsError,
  } = selectedCategory ? categoryProductsQuery : allProductsQuery;

  const products = productsData?.data || [];
  const totalProducts = productsData?.count || 0;
  const totalPages = productsData?.totalPages || 1;

  const handleCategoryClick = (categoryId: string | null) => {
    setSelectedCategory(categoryId);
    setCurrentPage(1); // Reset to first page when category changes
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Hero Section - Modern and Eye-catching */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-white rounded-full mix-blend-overlay filter blur-xl animate-blob"></div>
          <div className="absolute top-0 -right-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-overlay filter blur-xl animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-overlay filter blur-xl animate-blob animation-delay-4000"></div>
        </div>

        <div className="container-custom relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center py-20 md:py-32">
            <div className="text-white space-y-6">
              <div className="inline-block">
                <Badge className="bg-white/20 text-white border-white/30 px-4 py-1.5 text-sm font-medium backdrop-blur-sm">
                  ✨ New Collection 2024
                </Badge>
              </div>
              <h1 className="text-5xl md:text-7xl font-bold leading-tight">
                Step Into
                <span className="block bg-clip-text text-transparent bg-gradient-to-r from-yellow-200 to-pink-200">
                  Style & Comfort
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-purple-100 leading-relaxed">
                Discover premium footwear crafted with precision, designed for
                those who demand both style and comfort in every step.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button
                  asChild
                  size="lg"
                  className="bg-white text-purple-600 hover:bg-gray-100 shadow-xl hover:shadow-2xl transform hover:-translate-y-0.5 transition-all duration-200 font-semibold text-lg px-8 py-6"
                >
                  <Link to="/products">
                    Explore Collection
                    <ChevronRightIcon className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="border-2 border-white/30 text-white hover:bg-white/10 backdrop-blur-sm font-semibold text-lg px-8 py-6"
                >
                  <Link to="/products?featured=true">View Featured</Link>
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 pt-8">
                <div>
                  <div className="text-3xl font-bold">500+</div>
                  <div className="text-purple-200 text-sm">Products</div>
                </div>
                <div>
                  <div className="text-3xl font-bold">50K+</div>
                  <div className="text-purple-200 text-sm">Happy Customers</div>
                </div>
                <div>
                  <div className="text-3xl font-bold">4.9★</div>
                  <div className="text-purple-200 text-sm">Rating</div>
                </div>
              </div>
            </div>

            {/* Hero Image/Decoration */}
            <div className="hidden md:block relative">
              <div className="relative w-full h-96">
                <div className="absolute inset-0 bg-white/10 rounded-3xl backdrop-blur-sm transform rotate-6"></div>
                <div className="absolute inset-0 bg-white/5 rounded-3xl backdrop-blur-sm transform -rotate-6"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section - Clean and Modern */}
      <section className="sticky top-0 z-30 bg-white border-b shadow-md">
        <div className="container-custom py-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">
              Shop by Category
            </h2>
            <Link
              to="/products"
              className="text-sm text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1 transition-colors"
            >
              View All
              <ChevronRightIcon className="h-4 w-4" />
            </Link>
          </div>

          {categoriesLoading ? (
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton
                  key={i}
                  className="h-11 w-32 flex-shrink-0 rounded-full"
                />
              ))}
            </div>
          ) : (
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              <Button
                variant={selectedCategory === null ? "default" : "outline"}
                onClick={() => handleCategoryClick(null)}
                className={`flex-shrink-0 rounded-full px-6 transition-all duration-200 ${
                  selectedCategory === null
                    ? "bg-indigo-600 hover:bg-indigo-700 shadow-lg"
                    : "hover:border-indigo-300"
                }`}
              >
                All Products
                {selectedCategory === null && totalProducts > 0 && (
                  <Badge
                    variant="secondary"
                    className="ml-2 bg-white text-indigo-600"
                  >
                    {totalProducts}
                  </Badge>
                )}
              </Button>
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={
                    selectedCategory === category.id ? "default" : "outline"
                  }
                  onClick={() => handleCategoryClick(category.id)}
                  className={`flex-shrink-0 rounded-full px-6 transition-all duration-200 ${
                    selectedCategory === category.id
                      ? "bg-indigo-600 hover:bg-indigo-700 shadow-lg"
                      : "hover:border-indigo-300"
                  }`}
                >
                  {category.name}
                </Button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Products Section - Beautiful Grid */}
      <section className="py-16">
        <div className="container-custom">
          {productsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {[...Array(limit)].map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="h-80 w-full" />
                  <CardContent className="p-6 space-y-3">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-9 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : productsError ? (
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
                <span className="text-3xl">😞</span>
              </div>
              <p className="text-red-600 text-lg font-medium">
                Oops! Something went wrong
              </p>
              <p className="text-gray-500 mt-2">
                We couldn't load the products. Please try again later.
              </p>
            </div>
          ) : products.length > 0 ? (
            <>
              {/* Product Count and Info */}
              <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">
                    {selectedCategory
                      ? categories.find((c) => c.id === selectedCategory)?.name
                      : "All Products"}
                  </h3>
                  <p className="text-gray-600">
                    Showing {(currentPage - 1) * limit + 1}–
                    {Math.min(currentPage * limit, totalProducts)} of{" "}
                    <span className="font-semibold">{totalProducts}</span>{" "}
                    products
                  </p>
                </div>
              </div>

              {/* Products Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                {products.map((product: any) => {
                  const firstImage = product.images?.[0]?.url;
                  const hasDiscount =
                    product.compare_at_price &&
                    product.compare_at_price > product.base_price;
                  const discountPercent = hasDiscount
                    ? Math.round(
                        ((product.compare_at_price - product.base_price) /
                          product.compare_at_price) *
                          100
                      )
                    : 0;

                  return (
                    <Link
                      key={product.id}
                      to={`/products/${product.id}`}
                      className="group"
                    >
                      <Card className="overflow-hidden border-2 border-transparent hover:border-indigo-200 hover:shadow-2xl transition-all duration-300 h-full">
                        {/* Image Container */}
                        <div className="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
                          {firstImage ? (
                            <>
                              <img
                                src={firstImage}
                                alt={product.name}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                loading="lazy"
                              />
                              {/* Overlay on hover */}
                              <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                            </>
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50">
                              <span className="text-7xl font-bold text-indigo-200">
                                {product.name.charAt(0)}
                              </span>
                            </div>
                          )}

                          {/* Badges */}
                          <div className="absolute top-3 right-3 flex flex-col gap-2">
                            {hasDiscount && (
                              <Badge className="bg-red-500 text-white px-3 py-1 shadow-lg font-bold">
                                -{discountPercent}%
                              </Badge>
                            )}
                            {product.is_featured && (
                              <Badge className="bg-yellow-400 text-yellow-900 px-3 py-1 shadow-lg font-bold">
                                ⭐ Featured
                              </Badge>
                            )}
                          </div>

                          {/* Wishlist Button */}
                          <button className="absolute top-3 left-3 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white hover:scale-110 shadow-lg">
                            <HeartIcon className="h-5 w-5 text-gray-700 hover:text-red-500 transition-colors" />
                          </button>

                          {/* Quick View Button */}
                          <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                            <Button
                              size="sm"
                              className="w-full bg-white text-gray-900 hover:bg-gray-100 shadow-lg font-semibold"
                            >
                              Quick View
                            </Button>
                          </div>
                        </div>

                        {/* Product Info */}
                        <CardContent className="p-5 space-y-2">
                          {/* Category Tag */}
                          {product.category_id && (
                            <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wide">
                              {categories.find(
                                (c) => c.id === product.category_id
                              )?.name || ""}
                            </span>
                          )}

                          {/* Product Name */}
                          <h3 className="font-bold text-lg text-gray-900 line-clamp-2 group-hover:text-indigo-600 transition-colors min-h-[3.5rem]">
                            {product.name}
                          </h3>

                          {/* Short Description */}
                          {product.short_description && (
                            <p className="text-sm text-gray-500 line-clamp-2 min-h-[2.5rem]">
                              {product.short_description}
                            </p>
                          )}

                          {/* Price */}
                          <div className="flex items-center gap-2 pt-2">
                            <span className="text-2xl font-bold text-gray-900">
                              ৳{product.base_price}
                            </span>
                            {hasDiscount && (
                              <span className="text-base text-gray-400 line-through">
                                ৳{product.compare_at_price}
                              </span>
                            )}
                          </div>

                          {/* Rating (placeholder) */}
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <span key={i} className="text-yellow-400 text-sm">
                                ★
                              </span>
                            ))}
                            <span className="text-sm text-gray-500 ml-1">
                              (4.8)
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>

              {/* Pagination - Modern Design */}
              {totalPages > 1 && (
                <div className="mt-16 flex justify-center items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="rounded-full w-10 h-10 disabled:opacity-50"
                  >
                    <ChevronLeftIcon className="h-5 w-5" />
                  </Button>

                  <div className="flex gap-2">
                    {[...Array(totalPages)].map((_, i) => {
                      const page = i + 1;
                      if (
                        page === 1 ||
                        page === totalPages ||
                        (page >= currentPage - 1 && page <= currentPage + 1)
                      ) {
                        return (
                          <Button
                            key={page}
                            variant={
                              currentPage === page ? "default" : "outline"
                            }
                            onClick={() => setCurrentPage(page)}
                            className={`w-10 h-10 rounded-full ${
                              currentPage === page
                                ? "bg-indigo-600 hover:bg-indigo-700 shadow-lg"
                                : "hover:border-indigo-300"
                            }`}
                          >
                            {page}
                          </Button>
                        );
                      } else if (
                        page === currentPage - 2 ||
                        page === currentPage + 2
                      ) {
                        return (
                          <span
                            key={page}
                            className="flex items-center px-2 text-gray-400"
                          >
                            ...
                          </span>
                        );
                      }
                      return null;
                    })}
                  </div>

                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="rounded-full w-10 h-10 disabled:opacity-50"
                  >
                    <ChevronRightIcon className="h-5 w-5" />
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 mb-6">
                <span className="text-5xl">🔍</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                No Products Found
              </h3>
              <p className="text-gray-500 text-lg mb-6">
                {selectedCategory
                  ? "Try selecting a different category or view all products"
                  : "We're currently updating our collection"}
              </p>
              {selectedCategory && (
                <Button
                  onClick={() => handleCategoryClick(null)}
                  variant="outline"
                  className="rounded-full px-6"
                >
                  View All Products
                </Button>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Features Section - Modern Cards */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              Why Choose Us
            </h2>
            <p className="text-gray-600 text-lg">
              Experience premium service with every purchase
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="group">
              <Card className="text-center p-8 border-2 hover:border-indigo-200 hover:shadow-xl transition-all duration-300 h-full">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300">
                  <TruckIcon className="w-10 h-10 text-indigo-600" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">
                  Free Shipping
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Enjoy free delivery on all orders. Fast, reliable, and tracked
                  shipping to your doorstep.
                </p>
              </Card>
            </div>

            {/* Feature 2 */}
            <div className="group">
              <Card className="text-center p-8 border-2 hover:border-indigo-200 hover:shadow-xl transition-all duration-300 h-full">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300">
                  <ShieldCheckIcon className="w-10 h-10 text-green-600" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">
                  Quality Guarantee
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Premium materials and expert craftsmanship in every pair.
                  Built to last.
                </p>
              </Card>
            </div>

            {/* Feature 3 */}
            <div className="group">
              <Card className="text-center p-8 border-2 hover:border-indigo-200 hover:shadow-xl transition-all duration-300 h-full">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300">
                  <RotateCcwIcon className="w-10 h-10 text-orange-600" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">
                  Easy Returns
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  30-day hassle-free return policy. Not satisfied? We'll make it
                  right.
                </p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-20 bg-gradient-to-r from-indigo-600 to-purple-600">
        <div className="container-custom text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Stay in the Loop
            </h2>
            <p className="text-purple-100 text-lg mb-8">
              Subscribe to get special offers, free giveaways, and
              once-in-a-lifetime deals.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-6 py-4 rounded-full border-2 border-white/20 bg-white/10 text-white placeholder:text-purple-200 focus:outline-none focus:border-white/40 backdrop-blur-sm"
              />
              <Button
                size="lg"
                className="bg-white text-indigo-600 hover:bg-gray-100 rounded-full px-8 font-semibold shadow-xl"
              >
                Subscribe
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
