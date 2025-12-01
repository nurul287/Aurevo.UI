import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const PromotionalBanners = () => {
  return (
    <section className="py-16 bg-white">
      <div className="container-custom">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Left Banner - Nike Air Max 97 */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-400 via-yellow-400 to-orange-500 p-8 md:p-12 min-h-[400px] flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>

            <div className="relative z-10 space-y-4">
              <Badge className="bg-white text-orange-600 px-4 py-1 font-bold text-lg">
                -35%
              </Badge>
              <h3 className="text-3xl md:text-4xl font-bold text-white">
                Nike Air Max 97 Shoe
              </h3>
              <p className="text-white/90 text-lg max-w-md">
                Experience ultimate comfort and style with the iconic Air Max
                97 design.
              </p>
            </div>

            <div className="relative z-10 mt-6">
              <Button
                size="lg"
                className="bg-white text-orange-600 hover:bg-gray-100 px-8 py-6 text-lg font-semibold rounded-full shadow-xl"
              >
                Add Cart
              </Button>
            </div>

            {/* Shoe Image Placeholder */}
            <div className="absolute bottom-0 right-0 w-48 h-48 md:w-64 md:h-64 opacity-20">
              <div className="w-full h-full bg-white/30 rounded-full"></div>
            </div>
          </div>

          {/* Right Banner - Nike Air Zoom */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-pink-400 via-rose-400 to-pink-500 p-8 md:p-12 min-h-[400px] flex flex-col justify-between">
            <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -ml-32 -mt-32"></div>
            <div className="absolute bottom-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-24 -mb-24"></div>

            <div className="relative z-10 space-y-4">
              <Badge className="bg-white text-pink-600 px-4 py-1 font-bold text-lg">
                -25%
              </Badge>
              <h3 className="text-3xl md:text-4xl font-bold text-white">
                Nike Air Zoom Shoe
              </h3>
              <p className="text-white/90 text-lg max-w-md">
                Lightweight and responsive, perfect for your active lifestyle.
              </p>
            </div>

            <div className="relative z-10 mt-6">
              <Button
                size="lg"
                className="bg-white text-pink-600 hover:bg-gray-100 px-8 py-6 text-lg font-semibold rounded-full shadow-xl"
              >
                Add Cart
              </Button>
            </div>

            {/* Shoe Image Placeholder */}
            <div className="absolute bottom-0 right-0 w-48 h-48 md:w-64 md:h-64 opacity-20">
              <div className="w-full h-full bg-white/30 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
