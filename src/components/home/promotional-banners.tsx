import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { PromotionalBannerColor } from "@/constants/promotional-banners";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import { getFirstVariantForCart } from "@/lib/variant-size-sort";
import {
  usePromotionalBannerProducts,
  type PublicProductWithVariants,
} from "@/services";
import promotionCard1 from "@/assets/image/promotion-card-1.png";
import promotionCard2 from "@/assets/image/promotion-card-2.png";

const badgeBaseClass =
  "pointer-events-none absolute top-4 right-4 z-20 flex h-[52px] w-[52px] items-center justify-center rounded-full font-bold text-xs text-black hover:bg-inherit md:right-8 md:h-[60px] md:w-[60px] md:text-sm";

const contentShellClass =
  "absolute inset-y-0 left-0 z-10 flex w-[56%] max-w-[56%] flex-col justify-start gap-2 px-4 py-8 sm:w-[52%] sm:max-w-[52%] md:w-[60%] md:max-w-[60%] md:gap-6 md:p-4 md:pb-8 md:pt-8";

const titleClass =
  "mt-0 text-sm font-semibold leading-snug text-gray-900 sm:text-[0.9375rem] md:mt-4 md:text-2xl md:leading-tight";

const descClass =
  "text-[0.6875rem] leading-relaxed text-gray-700 line-clamp-3 sm:text-xs md:text-base md:leading-[1.8] md:line-clamp-none";

const ctaRowClass = "flex w-full justify-start pt-1 sm:pt-2";

const ctaButtonClass =
  "h-8 bg-[#111111] px-4 text-[0.6875rem] font-medium text-white hover:bg-[#2A2A2A] sm:h-9 sm:px-5 sm:text-xs md:h-10 md:px-6 md:text-sm";

const promoPanelClass =
  "relative w-full overflow-hidden rounded-2xl bg-[#EEEDF3]";

const promoImageWrapClass = "pointer-events-none absolute inset-0";

const promoImageClass =
  "h-full w-full object-cover object-right md:object-center";

const PROMO_COPY = {
  title: "Nike Vomero 18 Running Shoes",
  description:
    "The Nike Vomero 18 is a premium, maximum-cushion road running shoe engineered to deliver a highly cushioned, stable, and responsive ride. It is optimized for daily training, recovery days, and long-distance runs like marathons.",
} as const;

type PromoBannerCardProps = {
  product: PublicProductWithVariants | null | undefined;
  isProductsLoading: boolean;
  imageSrc: string;
  badgeClassName: string;
  panelClassName: string;
};

function PromoBannerCard({
  product,
  isProductsLoading,
  imageSrc,
  badgeClassName,
  panelClassName,
}: PromoBannerCardProps) {
  const { addItem, isAddingToCart } = useCart();
  const { showError, showWarning } = useToast();

  const handleAddToCart = async () => {
    if (!product) {
      showError(
        "Product unavailable",
        "This promotion could not be linked to a product. Check that Vomero products exist and are active in the admin catalog.",
      );
      return;
    }

    const variant = getFirstVariantForCart(product.variants);
    if (!variant) {
      showWarning(
        "Out of stock",
        "No sizes are available for this product right now.",
      );
      return;
    }

    try {
      await addItem(product.id, variant.id, 1);
    } catch {
      showError(
        "Failed to add to cart",
        "Something went wrong. Please try again.",
      );
    }
  };

  const ctaDisabled = isProductsLoading || isAddingToCart;
  const ctaLabel = isProductsLoading
    ? "Loading…"
    : isAddingToCart
      ? "Adding…"
      : "Add to Cart";

  return (
    <div className={`${promoPanelClass} ${panelClassName}`}>
      <div className={promoImageWrapClass} aria-hidden>
        <img
          src={imageSrc}
          alt=""
          className={promoImageClass}
          loading="lazy"
          decoding="async"
        />
      </div>

      <Badge className={`${badgeBaseClass} ${badgeClassName}`}>-25%</Badge>

      <div className={contentShellClass}>
        <h3 className={titleClass}>{PROMO_COPY.title}</h3>
        <p className={descClass}>{PROMO_COPY.description}</p>
        <div className={ctaRowClass}>
          <Button
            type="button"
            className={`rounded ${ctaButtonClass}`}
            disabled={ctaDisabled}
            onClick={handleAddToCart}
          >
            {ctaLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

const BANNER_CONFIG: {
  color: PromotionalBannerColor;
  imageSrc: string;
  badgeClassName: string;
  panelClassName: string;
}[] = [
  {
    color: "orange",
    imageSrc: promotionCard1,
    badgeClassName: "bg-[#F8F898] hover:bg-[#F8F898]",
    panelClassName: "aspect-[661/538] min-h-0 md:aspect-auto md:min-h-[537px]",
  },
  {
    color: "white",
    imageSrc: promotionCard2,
    badgeClassName: "bg-[#FFDEA8] hover:bg-[#FFDEA8]",
    panelClassName: "aspect-[648/537] min-h-0 md:aspect-auto md:min-h-[400px]",
  },
];

export const PromotionalBanners = () => {
  const { data: promoProducts, isLoading: isProductsLoading } =
    usePromotionalBannerProducts();

  return (
    <section className="bg-white">
      <div className="container-custom">
        <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
          {BANNER_CONFIG.map((banner) => (
            <PromoBannerCard
              key={banner.color}
              product={promoProducts?.[banner.color]}
              isProductsLoading={isProductsLoading}
              imageSrc={banner.imageSrc}
              badgeClassName={banner.badgeClassName}
              panelClassName={banner.panelClassName}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
