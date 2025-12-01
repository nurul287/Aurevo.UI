import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useProducts } from "@/services";
import { HeartIcon } from "lucide-react";
import { Link } from "react-router-dom";

export const OurShopSection = () => {
  const { data: productsData, isLoading } = useProducts({
    page: 1,
    limit: 8,
  });

  const products = productsData?.data || [];

  return (
    <section className="py-16 bg-white">
      <div className="container-custom">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">
          Our Shop
        </h2>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="h-64 w-full" />
                <CardContent className="p-4 space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-9 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
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
                  <Card className="overflow-hidden border-2 border-transparent hover:border-indigo-200 hover:shadow-xl transition-all duration-300 h-full">
                    {/* Image Container */}
                    <div className="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
                      {firstImage ? (
                        <img
                          src={firstImage}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50">
                          <span className="text-6xl font-bold text-indigo-200">
                            {product.name.charAt(0)}
                          </span>
                        </div>
                      )}

                      {/* Wishlist Button */}
                      <button className="absolute top-3 right-3 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white hover:scale-110 shadow-lg z-10">
                        <HeartIcon className="h-5 w-5 text-gray-700 hover:text-red-500 transition-colors" />
                      </button>

                      {/* Discount Badge */}
                      {hasDiscount && (
                        <Badge className="absolute top-3 left-3 bg-red-500 text-white px-3 py-1 shadow-lg font-bold">
                          -{discountPercent}%
                        </Badge>
                      )}
                    </div>

                    {/* Product Info */}
                    <CardContent className="p-5 space-y-3">
                      <h3 className="font-bold text-lg text-gray-900 line-clamp-2 group-hover:text-indigo-600 transition-colors min-h-[3rem]">
                        {product.name}
                      </h3>

                      {/* Price */}
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-gray-900">
                          ৳{product.base_price}
                        </span>
                        {hasDiscount && (
                          <span className="text-base text-gray-400 line-through">
                            ৳{product.compare_at_price}
                          </span>
                        )}
                      </div>

                      {/* Add to Cart Button */}
                      <Button
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white mt-2"
                        onClick={(e) => {
                          e.preventDefault();
                          // Handle add to cart
                        }}
                      >
                        Add to cart
                      </Button>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
