import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const BANNER_BG = "/full-collection-banner.png";

export const FullCollectionBanner = () => {
  return (
    <div className="bg-white py-10">
      <section className="relative w-full overflow-hidden bg-zinc-100">
        <img
          src={BANNER_BG}
          alt=""
          className="block h-auto w-full"
          decoding="async"
          loading="lazy"
        />
        <div
          className="pointer-events-none absolute inset-0 bg-white/25"
          aria-hidden
        />
        <div className="absolute inset-0 flex items-center justify-center p-4">
          <div className="container-custom pointer-events-auto relative z-10">
            <div className="space-y-5 text-center">
              <h2 className="text-4xl font-bold drop-shadow-md md:text-5xl">
                <span className="text-[#FF383C]">AUREVO</span>{" "}
                <span className="text-gray-900">FULL COLLECTION</span>
              </h2>
              <Button
                asChild
                className="h-10 rounded-md bg-[#111111] px-6 text-sm font-medium text-white hover:bg-[#2A2A2A]"
              >
                <Link to="/products">Shop</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
