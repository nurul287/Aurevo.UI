import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { APP_PATHS } from "@/constants/app-paths";
import { useCategories } from "@/services";
import { useState } from "react";
import { Link } from "react-router-dom";

type CategoryCard = {
  id?: string;
  name: string;
  icon: string;
  slug?: string;
  image_url?: string | null;
};

const categoryIcons: Record<string, string> = {
  MAN: "👔",
  WOMEN: "👗",
  CHILD: "👶",
  BOOTS: "🥾",
  SLIDER: "🩴",
};

function CategoryTileMedia({
  imageUrl,
  icon,
}: {
  imageUrl?: string | null;
  icon: string;
}) {
  const [imgFailed, setImgFailed] = useState(false);
  const trimmed = imageUrl?.trim() ?? "";
  const showImg = trimmed.length > 0 && !imgFailed;

  if (showImg) {
    return (
      <img
        src={trimmed}
        alt=""
        className="relative z-10 h-[72px] w-[72px] object-contain"
        loading="lazy"
        decoding="async"
        onError={() => setImgFailed(true)}
      />
    );
  }

  return (
    <div className="relative z-10 text-5xl transform -rotate-45">{icon}</div>
  );
}

export const ProductCategorySection = () => {
  const { data: categories = [], isLoading } = useCategories();

  // Map categories to display format
  const displayCategories = categories.slice(0, 5).map((cat) => ({
    id: cat.id,
    name: cat.name.toUpperCase(),
    icon: categoryIcons[cat.name.toUpperCase()] || "👟",
    slug: cat.slug,
    image_url: cat.image_url,
  }));

  // If we don't have enough categories, add placeholders
  const defaultCategories: CategoryCard[] = [
    { id: "placeholder-man", name: "MAN", icon: "👔", slug: "man" },
    { id: "placeholder-women", name: "WOMEN", icon: "👗", slug: "women" },
    { id: "placeholder-child", name: "CHILD", icon: "👶", slug: "child" },
    { id: "placeholder-boots", name: "BOOTS", icon: "🥾", slug: "boots" },
    { id: "placeholder-slider", name: "SLIDER", icon: "🩴", slug: "slider" },
  ];

  const categoriesToShow: CategoryCard[] =
    displayCategories.length > 0 ? displayCategories : defaultCategories;

  return (
    <section className="py-10 bg-white">
      <div className="container-custom">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">
          OUR PRODUCT CATEGORY
        </h2>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-32 w-full rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {categoriesToShow.map((category, index) => (
              <Link
                key={category.id || index}
                to={`${APP_PATHS.products}?category=${encodeURIComponent(
                  category.slug || category.name.toLowerCase(),
                )}`}
                className="group"
              >
                <Card className="hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-indigo-200 h-full">
                  <CardContent className="p-6 flex flex-col items-center justify-center space-y-4 min-h-[180px]">
                    {/* Hexagonal Icon Container */}
                    <div className="relative w-24 h-24 flex items-center justify-center">
                      {/* Hexagon shape using clip-path */}
                      <div className="absolute inset-0 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg transform rotate-45 group-hover:scale-110 transition-transform duration-300"></div>
                      <CategoryTileMedia
                        imageUrl={category.image_url}
                        icon={category.icon}
                      />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 text-center group-hover:text-indigo-600 transition-colors">
                      {category.name}
                    </h3>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
