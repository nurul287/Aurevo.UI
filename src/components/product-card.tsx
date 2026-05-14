import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { APP_PATHS } from "@/constants/app-paths";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import { formatPrice } from "@/lib/currency";
import { getLeadImageUrl } from "@/lib/product-images";
import { cn } from "@/lib/utils";
import { HeartIcon, ShoppingCart } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

interface ProductCardProps {
  product: any;
  /** Landing sections: no size picker or add-to-cart; single “View Details” CTA. */
  variant?: "default" | "teaser";
}

export const ProductCard = ({
  product,
  variant = "default",
}: ProductCardProps) => {
  const [selectedSize, setSelectedSize] = useState<string>("");
  const { addItem } = useCart();
  const { showWarning } = useToast();

  const firstImage = getLeadImageUrl(product.images);

  const basePrice = Number(product.base_price ?? 0);
  const comparePrice = Number(product.compare_at_price ?? 0);
  const hasDiscount = comparePrice > basePrice && basePrice > 0;
  const discountPercent = hasDiscount
    ? Math.round(((comparePrice - basePrice) / comparePrice) * 100)
    : 0;

  const rawSizes: string[] =
    product.variants
      ?.map((v: any) => v.size)
      .filter((s: unknown): s is string => Boolean(s)) ?? [];
  const uniqueSizes = Array.from(new Set(rawSizes));
  const availableSizes =
    uniqueSizes.length > 0
      ? uniqueSizes.sort((a, b) => {
          const na = Number(a);
          const nb = Number(b);
          if (!Number.isNaN(na) && !Number.isNaN(nb)) return na - nb;
          return a.localeCompare(b);
        })
      : ["40", "41", "42", "43", "44"];

  const handleSizeSelect = (size: string) => {
    setSelectedSize(size);
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (availableSizes.length === 0) {
      const firstVariant = product.variants?.[0];
      if (firstVariant) {
        await addItem(product.id, firstVariant.id, 1);
      } else {
        showWarning(
          "Product unavailable",
          "This product cannot be added to cart",
        );
      }
      return;
    }

    if (!selectedSize) {
      showWarning(
        "Please select a size",
        "Choose a size before adding to cart",
      );
      return;
    }

    const variantRow = product.variants?.find(
      (v: any) => v.size === selectedSize,
    );

    if (variantRow) {
      await addItem(product.id, variantRow.id, 1);
    }
  };

  const isTeaser = variant === "teaser";

  return (
    <div className="group flex h-full min-h-0 flex-col">
      <Card className="flex h-full min-h-0 flex-col overflow-hidden rounded-xl border-none bg-[#FDF7F3] shadow-md transition-all duration-300 hover:shadow-xl">
        <Link
          to={APP_PATHS.productDetail(product.id)}
          className="block shrink-0"
        >
          <div className="relative aspect-square overflow-hidden rounded-t-xl bg-white">
            {firstImage ? (
              <img
                src={firstImage}
                alt={product.name}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-120"
                loading="lazy"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gray-100">
                <span
                  className={cn(
                    "font-bold text-gray-300",
                    isTeaser ? "text-4xl sm:text-6xl" : "text-6xl",
                  )}
                >
                  {product.name.charAt(0)}
                </span>
              </div>
            )}

            <button
              type="button"
              className={cn(
                "absolute z-10 flex items-center justify-center transition-all hover:scale-110",
                isTeaser
                  ? "right-2 top-2 h-8 w-8 sm:right-3 sm:top-3 sm:h-9 sm:w-9"
                  : "right-3 top-3 h-9 w-9",
              )}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
            >
              <HeartIcon
                className={cn(
                  "text-[#E1680B] fill-none stroke-2",
                  isTeaser ? "h-5 w-5 sm:h-7 sm:w-7" : "h-7 w-7",
                )}
              />
            </button>

            {hasDiscount && (
              <Badge
                className={cn(
                  "pointer-events-none absolute flex items-center justify-center rounded-full border-transparent bg-black p-0 font-bold leading-none text-white shadow-sm",
                  isTeaser
                    ? "left-2 top-2 h-9 w-9 text-[10px] sm:left-3 sm:top-3 sm:h-11 sm:w-11 sm:text-[11px]"
                    : "left-3 top-3 h-11 w-11 text-[11px]",
                )}
              >
                -{discountPercent}%
              </Badge>
            )}
          </div>
        </Link>

        <CardContent
          className={cn(
            "flex min-h-0 flex-1 flex-col bg-[#FDF7F3]",
            isTeaser ? "p-3 sm:p-4" : "p-4",
          )}
        >
          <Link
            to={APP_PATHS.productDetail(product.id)}
            className={cn(isTeaser && "block min-w-0")}
          >
            <h3
              className={cn(
                "font-medium text-gray-900 transition-colors hover:text-gray-700",
                isTeaser
                  ? "mb-1 line-clamp-2 min-h-[2.75rem] text-xs leading-snug sm:mb-1.5 sm:min-h-[3.25rem] sm:text-sm sm:leading-snug md:text-base"
                  : "mb-2 line-clamp-2 text-lg",
              )}
            >
              {product.name}
            </h3>
          </Link>

          <div
            className={cn(
              "mb-3 flex items-center gap-x-2 gap-y-1",
              isTeaser
                ? "mb-2 min-w-0 flex-nowrap overflow-hidden sm:mb-3 sm:flex-wrap"
                : "flex-wrap",
            )}
          >
            <div
              className={cn(
                "flex min-w-0 items-center gap-1 sm:gap-1.5 md:gap-2",
                isTeaser && "shrink-0",
              )}
            >
              <div className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full bg-[#414141] sm:h-4 sm:w-4">
                <span className="text-[10px] font-medium text-white sm:text-xs">
                  ৳
                </span>
              </div>
              <span
                className={cn(
                  "font-semibold text-gray-900 tabular-nums",
                  isTeaser
                    ? "truncate text-xs sm:text-sm md:text-base lg:text-lg"
                    : "text-lg",
                )}
              >
                {formatPrice(basePrice, {
                  showSymbol: false,
                  decimals: 0,
                })}
              </span>
            </div>
            {hasDiscount && (
              <span
                className={cn(
                  "shrink-0 text-gray-400 line-through tabular-nums",
                  isTeaser
                    ? "truncate text-[11px] sm:text-xs md:text-sm"
                    : "text-sm",
                )}
              >
                ৳{" "}
                {formatPrice(comparePrice, {
                  showSymbol: false,
                  decimals: 0,
                })}
              </span>
            )}
          </div>

          {variant === "default" ? (
            <div className="mt-auto flex w-full flex-col gap-3">
              <div className="flex min-h-[2rem] flex-col justify-end">
                {availableSizes.length > 0 ? (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900">
                      Size
                    </span>
                    <div className="flex flex-wrap items-center gap-1">
                      {availableSizes.slice(0, 5).map((size: string) => (
                        <button
                          key={size}
                          onClick={(e) => {
                            e.preventDefault();
                            handleSizeSelect(size);
                          }}
                          className={`cursor-pointer border px-2.5 py-1 text-sm font-medium transition-all ${
                            selectedSize === size
                              ? "border-gray-900 bg-gray-900 text-white"
                              : "border-gray-300 hover:border-gray-900"
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">
                    No sizes available
                  </div>
                )}
              </div>

              <Button
                className="h-10 w-[120px] shrink-0 rounded bg-[#111111] text-sm font-normal text-white hover:bg-[#2A2A2A]"
                onClick={handleAddToCart}
              >
                <ShoppingCart className="mr-2 h-4.5 w-4.5" strokeWidth={3} />
                Add Cart
              </Button>
            </div>
          ) : (
            <div className="mt-auto shrink-0 pt-1">
              <Button
                asChild
                className={cn(
                  "w-fit rounded bg-[#111111] font-normal text-white hover:bg-[#2A2A2A]",
                  isTeaser
                    ? "h-9 px-4 text-xs sm:h-10 sm:px-6 sm:text-sm"
                    : "h-10 text-sm",
                )}
              >
                <Link to={APP_PATHS.productDetail(product.id)}>
                  View Details
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
