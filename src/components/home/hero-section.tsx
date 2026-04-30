import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";
import bannerImage from "@/assets/image/banner-section-image.png";

export const HeroSection = () => {
  return (
    <section className="relative overflow-hidden bg-[#F3FAFF]">
      <div className="container-custom">
        <div className="grid md:grid-cols-[50%_50%] gap-4 items-center min-h-[600px] pb-12">
          {/* Right Image - Shown first on mobile */}
          <div className="relative flex items-center justify-center order-1 md:order-2">
            <img
              src={bannerImage}
              alt="FILA x Hyperice Hyperboot"
              className="w-full h-full lg:mt-[-100px] object-contain"
            />
          </div>

          {/* Left Content - Shown second on mobile */}
          <div className="space-y-4 max-w-[460px] order-2 md:order-1">
            <h1 className="text-5xl md:text-[52px] font-bold leading-[1.1] text-gray-900">
              FILA x Hyperice
              <br />
              Hyperboot
            </h1>
            <p className="text-[14px] text-gray-600 leading-[1.7] max-w-[550px]">
              Optimize your warm-up and recovery routines with the Hyperboot, a
              Nike x Hyperice collaboration. The wearable technology offers heat
              and Normatec dynamic air compression for feet and ankles that you
              can customize on the go.
            </p>
            <div className="pt-3">
              <Button
                asChild
                className="bg-[#111111] hover:bg-[#2A2A2A] text-white px-7 h-[42px] text-sm font-medium rounded-md"
              >
                <Link to="/products" className="inline-flex items-center">
                  <ShoppingCart className="mr-2 h-[18px] w-[18px]" />
                  Add Cart
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Pagination Dots */}
        <div className="flex justify-center items-center gap-2 pb-8 pt-4">
          <div className="w-2 h-2 rounded-full bg-gray-300"></div>
          <div className="w-2 h-2 rounded-full bg-gray-900"></div>
          <div className="w-2 h-2 rounded-full bg-gray-300"></div>
          <div className="w-2 h-2 rounded-full bg-gray-300"></div>
          <div className="w-2 h-2 rounded-full bg-gray-300"></div>
        </div>
      </div>
    </section>
  );
};
