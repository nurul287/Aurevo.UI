import { Button } from "@/components/ui/button";
import { MapPinIcon } from "lucide-react";
import { useTranslation } from "react-i18next";

export const StoreLocationSection = () => {
  const { t } = useTranslation();
  return (
    <section className="py-16 bg-gray-50">
      <div className="container-custom">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">
          {t("home.storeLocation")}
        </h2>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Map Placeholder */}
          <div className="relative w-full h-96 rounded-2xl overflow-hidden shadow-xl">
            {/* Placeholder for map - you can integrate Google Maps or similar */}
            <div className="w-full h-full bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 flex items-center justify-center">
              <div className="text-center space-y-4">
                <MapPinIcon className="w-16 h-16 text-indigo-600 mx-auto" />
                <p className="text-gray-600 font-semibold">Bangladesh</p>
                <p className="text-sm text-gray-500">
                  Map integration can be added here
                </p>
              </div>
            </div>
            {/* Example: Replace with actual map component */}
            {/* <iframe
              src="https://www.google.com/maps/embed?pb=..."
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
            /> */}
          </div>

          {/* Location Info */}
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-gray-900">
                Visit Our Store
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Come visit us at our physical location in Bangladesh. Our
                friendly staff is ready to help you find the perfect pair of
                shoes.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <MapPinIcon className="w-5 h-5 text-indigo-600 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-900">Address</p>
                  <p className="text-gray-600">
                    123 Main Street, Dhaka, Bangladesh
                  </p>
                </div>
              </div>
            </div>

            <Button
              size="lg"
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-6 text-lg font-semibold rounded-full"
            >
              <MapPinIcon className="mr-2 h-5 w-5" />
              Location
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
