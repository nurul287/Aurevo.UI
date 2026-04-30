import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import promotionCard1 from "@/assets/image/promotion-card-1.png";
import promotionCard2 from "@/assets/image/promotion-card-2.png";

export const PromotionalBanners = () => {
  return (
    <section className="py-10 bg-white">
      <div className="container-custom">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Left Banner - Nike Air Max 97 */}
          <div
            className="relative overflow-hidden rounded-2xl min-h-[537px] bg-cover bg-center"
            style={{ backgroundImage: `url(${promotionCard1})` }}
          >
            {/* Discount Badge - Top Right */}
            <Badge className="absolute top-4 right-8 bg-[#F8F898] text-black font-bold text-sm rounded-full w-[60px] h-[60px] flex items-center justify-center hover:bg-[#F8F898] pointer-events-none">
              -25%
            </Badge>

            {/* Content Container - Left Half */}
            <div className="w-[60%] h-full p-4 flex flex-col justify-start space-y-6">
              <h3 className="text-xl md:text-2xl font-semibold text-gray-900 leading-tight mt-4">
                Nike Air Max 97 Shoe
                <br />
                Color MRLN2019
              </h3>
              <p className="text-gray-700 text-base leading-[1.8]">
                Lace up and feel the love in the Nike Air Max 97. Rippled design
                lines give this iconic sneaker fast-paced style. To ensure these
                kicks really turn heads, we mixed smooth leather with soft.
              </p>
              <div className="pt-2">
                <Button className="bg-[#111111] hover:bg-[#2A2A2A] text-white px-6 h-10 text-sm font-medium rounded">
                  Add Cart
                </Button>
              </div>
            </div>
          </div>

          {/* Right Banner - Nike Air Zoom */}
          <div
            className="relative overflow-hidden rounded-2xl min-h-[400px] bg-cover bg-center"
            style={{ backgroundImage: `url(${promotionCard2})` }}
          >
            {/* Discount Badge - Top Right */}
            <Badge className="absolute top-4 right-8 bg-[#FDCAA3] text-black font-bold text-sm rounded-full w-[60px] h-[60px] flex items-center justify-center hover:bg-[#FDCAA3] pointer-events-none">
              -25%
            </Badge>

            {/* Content Container - Left Half */}
            <div className="w-[60%] h-full p-4 flex flex-col justify-start space-y-6">
              <h3 className="text-xl md:text-2xl font-semibold text-gray-900 leading-tight mt-4">
                Nike Air Zoom Shoe
                <br />
                Color VN2023
              </h3>
              <p className="text-gray-700 text-base leading-[1.8]">
                Lace up and feel the love in the Nike Air Max 97. Rippled design
                lines give this iconic sneaker fast-paced style. To ensure these
                kicks really turn heads, we invest smooth leather with soft...
              </p>
              <div className="pt-2">
                <Button className="bg-[#111111] hover:bg-[#2A2A2A] text-white px-6 h-10 text-sm font-medium rounded">
                  Add Cart
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
