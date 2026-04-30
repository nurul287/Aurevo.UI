import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export const FullCollectionBanner = () => {
  return (
    <div className="py-10 bg-[#F3FAFF]">
      <section className="relative h-[300px] flex items-center justify-center overflow-hidden">
        <div className="container-custom relative z-10">
          <div className="text-center space-y-5">
            <h2 className="text-4xl md:text-5xl font-bold drop-shadow-lg">
              <span className="text-[#FF383C]">AUREVO</span>{" "}
              <span className="text-gray-900">FULL COLLECTION</span>
            </h2>
            <Button
              asChild
              className="bg-[#111111] hover:bg-[#2A2A2A] text-white px-6 h-10 text-sm font-medium rounded-md"
            >
              <Link to="/products">Shop</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};
