import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const BANNER_BG = "/full-collection-banner.png";

/** Source asset is 3840×640 (~6:1). At mobile width, intrinsic height is tiny; we use a floor height + object-cover so the band reads as a real banner. */
const BANNER_SRC_W = 3840;
const BANNER_SRC_H = 640;

export const FullCollectionBanner = () => {
  return (
    <div className="bg-white">
      <section className="w-full bg-zinc-900">
        <div className="relative isolate mx-auto w-full max-w-[1920px] min-h-[12.5rem] overflow-hidden sm:min-h-[15rem] md:min-h-[17rem] lg:min-h-[19rem]">
          <img
            src={BANNER_BG}
            alt="Aurevo storefront — shop the full collection"
            width={BANNER_SRC_W}
            height={BANNER_SRC_H}
            sizes="100vw"
            className="absolute inset-0 z-0 h-full w-full object-cover object-left md:object-center"
            decoding="async"
            loading="lazy"
          />
          <div
            className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-b from-black/40 via-black/25 to-black/45"
            aria-hidden
          />
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 px-4 text-center sm:gap-4 md:gap-5">
            <div className="w-full max-w-3xl">
              <h2 className="text-balance text-2xl font-bold leading-tight tracking-tight text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.55)] sm:text-3xl md:text-4xl lg:text-5xl">
                <span className="text-[#FF383C]">AUREVO</span>{" "}
                <span className="text-white">FULL COLLECTION</span>
              </h2>
            </div>
            <Button
              asChild
              className="h-10 min-w-[8.5rem] shrink-0 rounded-md bg-[#111111] px-6 text-sm font-medium text-white shadow-md hover:bg-[#2A2A2A] sm:h-11"
            >
              <Link to="/products">Shop</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};
