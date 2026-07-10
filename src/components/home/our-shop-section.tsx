import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "react-i18next";
import { useProducts } from "@/services";
import { ProductCard } from "@/components/product-card";

export const OurShopSection = () => {
  const { t } = useTranslation();
  const { data: productsData, isLoading } = useProducts({
    page: 1,
    limit: 8,
  });

  const products = productsData?.data || [];

  return (
    <section className="bg-white py-10 sm:py-12">
      <div className="container-custom">
        <h2 className="mb-8 text-center text-2xl font-bold uppercase text-gray-900 sm:text-3xl">
          {t("home.ourShop")}
        </h2>

        {isLoading ? (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="overflow-hidden rounded-2xl">
                <Skeleton className="aspect-square w-full rounded-t-2xl" />
                <div className="space-y-2 rounded-b-2xl bg-[#FDF7F3] p-3 sm:p-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="mt-2 h-9 w-24" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-lg text-gray-500">
              No products available in our shop.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
            {products.map((product: any) => (
              <ProductCard
                key={product.id}
                product={product}
                variant="teaser"
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
