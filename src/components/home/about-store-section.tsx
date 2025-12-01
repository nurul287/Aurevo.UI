import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export const AboutStoreSection = () => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container-custom">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              About The Store
            </h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>
                Welcome to <strong className="text-gray-900">Aurevo</strong>, your
                premier destination for premium footwear, streetwear, and apparel.
                We are dedicated to providing you with the latest trends and
                highest quality products.
              </p>
              <p>
                Our e-commerce platform offers a seamless shopping experience
                with a wide selection of sneakers, boots, and fashion-forward
                items. From classic designs to the latest releases, we have
                something for everyone.
              </p>
              <p>
                At Aurevo, we believe that style and comfort should go hand in
                hand. That's why we carefully curate our collection to ensure
                every product meets our high standards of quality and design.
              </p>
            </div>
            <Button
              asChild
              size="lg"
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-6 text-lg font-semibold rounded-full"
            >
              <Link to="/products">Explore More</Link>
            </Button>
          </div>

          {/* Right Image */}
          <div className="relative">
            <div className="relative w-full h-96 rounded-2xl overflow-hidden shadow-2xl">
              {/* Placeholder for store image */}
              <div className="w-full h-full bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 flex items-center justify-center">
                <div className="text-center space-y-4">
                  <div className="text-6xl">🏪</div>
                  <p className="text-gray-600 font-semibold">Store Image</p>
                </div>
              </div>
              {/* You can replace this with an actual image */}
              {/* <img src="/store-image.jpg" alt="Aurevo Store" className="w-full h-full object-cover" /> */}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
