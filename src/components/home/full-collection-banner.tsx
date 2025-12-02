import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import collectionBanner from "@/assets/image/collection-banner.png";

export const FullCollectionBanner = () => {
  return (
    <section className="relative py-10 bg-[#F3FAFF] h-[300px] flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${collectionBanner})` }}
      ></div>

      <div className="container-custom relative z-10">
        <div className="text-center space-y-5">
          <h2 className="text-4xl md:text-5xl font-semibold drop-shadow-lg">
            <span className="text-[#FF6600]">AUREVO</span>{" "}
            <span className="text-gray-900">FULL COLLECTION</span>
          </h2>
          <Button
            asChild
            className="bg-[#FF6600] hover:bg-[#E65C00] text-white px-6 h-10 text-sm font-medium rounded-md"
          >
            <Link to="/products">Shop</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};
