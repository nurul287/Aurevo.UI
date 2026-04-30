import { useState } from "react";
import subscriptionBannerImage from "@/assets/image/subscription-banner.png";
import subscribeIcon from "@/assets/image/subscribe.png";

export const NewsletterBanner = () => {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle newsletter subscription
    console.log("Newsletter subscription:", email);
    setEmail("");
  };

  return (
    <section className="py-10 bg-white">
      <div className="container-custom">
        <div className="relative max-w-[980px] h-[200px] sm:h-[240px] md:h-[280px] mx-auto rounded-3xl overflow-hidden">
          {/* Background Image */}
          <img
            src={subscriptionBannerImage}
            alt="Newsletter Banner"
            className="absolute inset-0 w-full h-full object-cover"
          />

          {/* Content */}
          <div className="relative z-10 px-4 sm:px-8 py-6 sm:py-8 md:py-12">
            {/* Left Content */}
            <div className="text-center w-full ">
              <h2 className="text-base sm:text-2xl md:text-3xl font-bold text-white mb-2 sm:mb-3">
                EXPLORE <span className="text-[#FF0000]">AUREVO</span> FASHION
                BRAND
              </h2>
              <p className="text-white/80 text-[10px] sm:text-xs md:text-sm">
                Subscribe to get updated about new Arrival,
                <br />
                Offers and Discount With Page or You tube
              </p>

              {/* Email Input */}
              <form
                onSubmit={handleSubmit}
                className="mt-3 sm:mt-4 md:mt-6 flex justify-center"
              >
                <div className="flex items-center bg-white rounded-full w-full max-w-[200px] sm:max-w-[320px] md:max-w-[450px]">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 md:py-3 text-[10px] sm:text-xs md:text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none bg-transparent rounded-full"
                    required
                  />
                </div>
              </form>
            </div>
          </div>

          {/* YouTube Subscribe Button - Absolute positioned */}
          <a
            href="https://youtube.com"
            target="_blank"
            rel="noopener noreferrer"
            className="absolute bottom-0 right-0 hover:cursor-pointer"
          >
            <img
              src={subscribeIcon}
              alt="Subscribe"
              className="w-[50px] h-[50px] sm:w-[70px] sm:h-[70px] md:w-[90px] md:h-[90px] lg:w-[120px] lg:h-[105px]"
            />
          </a>
        </div>
      </div>
    </section>
  );
};
