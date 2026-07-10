import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "react-i18next";
import { APP_PATHS } from "@/constants/app-paths";
import { useCategories } from "@/services";
import { useState } from "react";
import { Link } from "react-router-dom";

type CategoryCard = {
  id?: string;
  name: string;
  slug?: string;
  image_url?: string | null;
};

/** Pointy top / bottom hexagon (fits design “Polygon” tile). */
const HEX_CLIP =
  "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)" as const;

/** Figma: fill #D9D9D9; tile max 190×190, shrinks in narrower grid cells. */
const CATEGORY_FILL = "#D9D9D9";

const categoryGridClassName =
  "grid grid-cols-3 gap-2 justify-items-center sm:gap-3 md:gap-4 md:grid-cols-3 lg:grid-cols-6 lg:gap-x-2 lg:gap-y-3";

function SneakerLineIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 56 48"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M6 38h44l-1.5-6-6-14c-1.5-3.5-5-6-9-6H20c-3.5 0-6.5 2-8 5L7 30l-1 8Z"
        stroke="currentColor"
        strokeWidth="2.15"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M20 12h14c3 0 5.5 1.5 7 4l5 10M18 12l-2.5-4c-.8-1.2-2-2-3.5-2"
        stroke="currentColor"
        strokeWidth="2.15"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14 38h36"
        stroke="currentColor"
        strokeWidth="2.15"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CategoryHexVisual({
  imageUrl,
  name,
}: {
  imageUrl?: string | null;
  name: string;
}) {
  const [imgFailed, setImgFailed] = useState(false);
  const trimmed = imageUrl?.trim() ?? "";
  const showImg = trimmed.length > 0 && !imgFailed;

  return (
    <div
      className="flex aspect-square w-full max-w-full flex-col items-center justify-center gap-1 px-1.5 py-2.5 text-gray-900 drop-shadow-[0_2px_8px_rgba(0,0,0,0.07)] sm:max-w-[190px] sm:gap-2 sm:px-2 sm:py-4 md:gap-2.5 md:px-3 md:py-5"
      style={{
        clipPath: HEX_CLIP,
        background: CATEGORY_FILL,
      }}
    >
      <div className="flex h-[min(56px,40%)] w-[min(140px,72%)] shrink-0 items-center justify-center px-0.5 sm:h-[min(88px,41%)] sm:w-[min(140px,74%)] md:h-[min(100px,42%)]">
        {showImg ? (
          <img
            src={trimmed}
            alt=""
            className="mx-auto h-[100%] w-[100%] object-contain object-center"
            loading="lazy"
            decoding="async"
            onError={() => setImgFailed(true)}
          />
        ) : (
          <SneakerLineIcon className="mx-auto h-[100%] w-[100%] text-gray-800" />
        )}
      </div>
      <span className="max-w-full shrink-0 px-0.5 text-center text-[10px] font-semibold uppercase leading-tight tracking-wide text-gray-900 sm:px-1 sm:text-xs sm:leading-snug md:text-base lg:text-[18px]">
        {name}
      </span>
    </div>
  );
}

export const ProductCategorySection = () => {
  const { t } = useTranslation();
  const { data: categories = [], isLoading } = useCategories();

  const displayCategories = categories.slice(0, 6).map((cat) => ({
    id: cat.id,
    name: cat.name.toUpperCase(),
    slug: cat.slug,
    image_url: cat.image_url,
  }));

  const defaultCategories: CategoryCard[] = [
    { id: "ph-sneakers", name: "SNEAKERS", slug: "sneakers" },
    { id: "ph-panjabi", name: "PANJABI", slug: "panjabi" },
    { id: "ph-tshirt", name: "T-SHIRT", slug: "t-shirt" },
    { id: "ph-cap", name: "CAP", slug: "cap" },
    { id: "ph-slider", name: "SLIDER", slug: "slider" },
    { id: "ph-pant", name: "PANT", slug: "pant" },
  ];

  const categoriesToShow: CategoryCard[] =
    displayCategories.length > 0 ? displayCategories : defaultCategories;

  return (
    <section className="bg-white py-10 sm:py-12">
      <div className="container-custom">
        <h2 className="mb-8 text-center sm:text-3xl text-2xl font-bold uppercase tracking-tight text-slate-900 sm:mb-10 md:mb-12">
          {t("home.productCategory")}
        </h2>

        {isLoading ? (
          <div className={categoryGridClassName}>
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="flex w-full max-w-full items-center justify-center sm:max-w-[190px]"
              >
                <Skeleton className="aspect-square w-full max-w-full [clip-path:polygon(50%_0%,100%_25%,100%_75%,50%_100%,0%_75%,0%_25%)] sm:max-w-[190px]" />
              </div>
            ))}
          </div>
        ) : (
          <div className={categoryGridClassName}>
            {categoriesToShow.map((category, index) => (
              <Link
                key={category.id || index}
                to={`${APP_PATHS.products}?category=${encodeURIComponent(
                  category.slug || category.name.toLowerCase(),
                )}`}
                className="group flex w-full max-w-full items-center justify-center rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 sm:max-w-[190px]"
              >
                <article className="flex h-full w-full items-center justify-center transition-transform duration-200 group-hover:scale-[1.03]">
                  <CategoryHexVisual
                    imageUrl={category.image_url}
                    name={category.name}
                  />
                </article>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
