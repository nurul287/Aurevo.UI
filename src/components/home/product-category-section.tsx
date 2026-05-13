import { Skeleton } from "@/components/ui/skeleton";
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
  "grid grid-cols-2 gap-3 justify-items-center sm:gap-4 md:grid-cols-3 md:gap-4 lg:grid-cols-6 lg:gap-x-2 lg:gap-y-3";

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
      className="flex aspect-square w-full max-w-[190px] flex-col items-center justify-center gap-2 px-2 py-4 text-gray-900 drop-shadow-[0_3px_10px_rgba(0,0,0,0.08)] sm:gap-2.5 sm:px-3 sm:py-5"
      style={{
        clipPath: HEX_CLIP,
        background: CATEGORY_FILL,
      }}
    >
      <div className="flex h-[min(100px,42%)] w-[min(140px,74%)] shrink-0 items-center justify-center px-0.5">
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
      <span className="max-w-full shrink-0 px-1 text-center font-semibold uppercase leading-snug tracking-wide text-gray-900 sm:text-[18px] text-base">
        {name}
      </span>
    </div>
  );
}

export const ProductCategorySection = () => {
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
    <section className="bg-white py-12 md:py-14">
      <div className="container-custom">
        <h2 className="mb-12 text-center text-2xl font-semibold uppercase tracking-tight text-slate-900 sm:text-4xl">
          Our product category
        </h2>

        {isLoading ? (
          <div className={categoryGridClassName}>
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="flex w-full max-w-[190px] items-center justify-center"
              >
                <Skeleton className="aspect-square w-full max-w-[190px] [clip-path:polygon(50%_0%,100%_25%,100%_75%,50%_100%,0%_75%,0%_25%)]" />
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
                className="group flex w-full max-w-[190px] items-center justify-center rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2"
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
