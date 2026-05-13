import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { APP_PATHS } from "@/constants/app-paths";
import promotionCard1 from "@/assets/image/promotion-card-1.png";
import promotionCard2 from "@/assets/image/promotion-card-2.png";
import { Link } from "react-router-dom";

const badgeBaseClass =
  "pointer-events-none absolute top-4 right-4 flex h-[52px] w-[52px] items-center justify-center rounded-full font-bold text-xs text-black hover:bg-inherit md:right-8 md:h-[60px] md:w-[60px] md:text-sm";

const contentShellClass =
  "relative z-10 flex flex-1 flex-col gap-2 px-4 pb-5 pt-12 md:absolute md:inset-y-0 md:left-0 md:flex md:w-[60%] md:max-w-[60%] md:flex-col md:justify-start md:gap-6 md:p-4 md:pb-8 md:pt-8";

const titleClass =
  "mt-0 max-w-[16.5rem] text-[0.9375rem] font-semibold leading-snug text-gray-900 sm:max-w-none md:mt-4 md:max-w-none md:text-2xl md:leading-tight";

const descClass =
  "max-w-[16.5rem] text-xs leading-relaxed text-gray-700 line-clamp-3 sm:max-w-none md:max-w-none md:text-base md:leading-[1.8] md:line-clamp-none";

const ctaRowClass =
  "flex w-full justify-start pt-2 md:pt-2";

const ctaButtonClass =
  "h-9 bg-[#111111] px-5 text-xs font-medium text-white hover:bg-[#2A2A2A] md:h-10 md:px-6 md:text-sm";

export const PromotionalBanners = () => {
  return (
    <section className="bg-white">
      <div className="container-custom">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Left Banner - Nike Air Max 97 */}
          <div
            className="relative flex min-h-[420px] flex-col overflow-hidden rounded-2xl bg-cover bg-center md:block md:min-h-[537px]"
            style={{ backgroundImage: `url(${promotionCard1})` }}
          >
            <Badge
              className={`${badgeBaseClass} bg-[#F8F898] hover:bg-[#F8F898]`}
            >
              -25%
            </Badge>

            <div className={contentShellClass}>
              <h3 className={titleClass}>
                Nike Air Max 97<span className="hidden md:inline"> Shoe</span>
                <span className="text-gray-800 md:hidden"> · </span>
                <br className="hidden md:block" />
                <span className="font-medium text-gray-800 md:font-semibold md:text-gray-900">
                  Color MRLN2019
                </span>
              </h3>
              <p className={descClass}>
                Lace up and feel the love in the Nike Air Max 97. Rippled design
                lines give this iconic sneaker fast-paced style. To ensure these
                kicks really turn heads, we mixed smooth leather with soft.
              </p>
              <div className={ctaRowClass}>
                <Button asChild className={`rounded ${ctaButtonClass}`}>
                  <Link to={APP_PATHS.products}>View Details</Link>
                </Button>
              </div>
            </div>
          </div>

          {/* Right Banner - Nike Air Zoom */}
          <div
            className="relative flex min-h-[380px] flex-col overflow-hidden rounded-2xl bg-cover bg-center md:block md:min-h-[400px]"
            style={{ backgroundImage: `url(${promotionCard2})` }}
          >
            <Badge
              className={`${badgeBaseClass} bg-[#FDCAA3] hover:bg-[#FDCAA3]`}
            >
              -25%
            </Badge>

            <div className={contentShellClass}>
              <h3 className={titleClass}>
                Nike Air Zoom<span className="hidden md:inline"> Shoe</span>
                <span className="text-gray-800 md:hidden"> · </span>
                <br className="hidden md:block" />
                <span className="font-medium text-gray-800 md:font-semibold md:text-gray-900">
                  Color VN2023
                </span>
              </h3>
              <p className={descClass}>
                Lace up and feel the love in the Nike Air Max 97. Rippled design
                lines give this iconic sneaker fast-paced style. To ensure these
                kicks really turn heads, we invest smooth leather with soft...
              </p>
              <div className={ctaRowClass}>
                <Button asChild className={`rounded ${ctaButtonClass}`}>
                  <Link to={APP_PATHS.products}>View Details</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
