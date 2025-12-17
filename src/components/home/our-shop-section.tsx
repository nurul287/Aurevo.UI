import { Skeleton } from "@/components/ui/skeleton";
import { useProducts } from "@/services";
import { ProductCard } from "@/components/product-card";

export const OurShopSection = () => {
  const { data: productsData, isLoading } = useProducts({
    page: 1,
    limit: 8,
  });

  const products = productsData?.data || [];

  return (
    <section className="py-10 bg-[#F3FAFF]">
      <div className="container-custom">
        <h2 className="text-3xl md:text-4xl font-bold mb-8 text-gray-900">
          Our Shop
        </h2>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="overflow-hidden">
                <Skeleton className="h-64 w-full rounded-t-2xl" />
                <div className="p-4 space-y-2 bg-[#FDF7F3] rounded-b-2xl">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-9 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              No products available in our shop.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
