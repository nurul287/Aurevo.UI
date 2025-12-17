import { Skeleton } from "@/components/ui/skeleton";
import { useProducts } from "@/services";
import { ProductCard } from "@/components/product-card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

export const NewCollectionSection = () => {
  const { data: productsData, isLoading } = useProducts({
    page: 1,
    limit: 12,
  });

  const products = productsData?.data || [];

  return (
    <section className="py-10 bg-[#F3FAFF]">
      <div className="container-custom">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 uppercase">
            New Collection
          </h2>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
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
              No products available in the new collection.
            </p>
          </div>
        ) : (
          <Carousel
            opts={{
              align: "start",
              slidesToScroll: 1,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-4 mb-2">
              {products.map((product: any) => (
                <CarouselItem
                  key={product.id}
                  className="pl-4 md:basis-1/2 lg:basis-1/3"
                >
                  <ProductCard product={product} />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-0" />
            <CarouselNext className="right-0" />
          </Carousel>
        )}
      </div>
    </section>
  );
};
