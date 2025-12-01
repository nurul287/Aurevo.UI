import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export const FullCollectionBanner = () => {
  return (
    <section className="relative py-20 md:py-32 overflow-hidden">
      {/* Background with blur effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-orange-400 via-yellow-400 to-orange-500">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1200')] bg-cover bg-center opacity-20 blur-sm"></div>
      </div>

      <div className="container-custom relative z-10">
        <div className="text-center space-y-6">
          <h2 className="text-4xl md:text-5xl font-bold text-white drop-shadow-lg">
            AUREVO Full Collection
          </h2>
          <p className="text-white/90 text-lg max-w-2xl mx-auto">
            Discover our complete range of premium footwear, designed for every
            occasion and style preference.
          </p>
          <Button
            asChild
            size="lg"
            className="bg-orange-500 hover:bg-orange-600 text-white px-10 py-6 text-lg font-semibold rounded-full shadow-xl hover:shadow-2xl transition-all"
          >
            <Link to="/products">Shop</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};
