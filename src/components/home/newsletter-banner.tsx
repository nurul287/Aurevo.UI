import { Button } from "@/components/ui/button";
import { useState } from "react";

export const NewsletterBanner = () => {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle newsletter subscription
    console.log("Newsletter subscription:", email);
    setEmail("");
  };

  return (
    <section className="relative py-20 md:py-32 overflow-hidden">
      {/* Background with basketball image effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1518611012118-696072aa579a?w=1200')] bg-cover bg-center opacity-30"></div>
      </div>

      <div className="container-custom relative z-10">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <h2 className="text-4xl md:text-5xl font-bold text-white">
            EXPLORE AUREVO FASHION BRAND
          </h2>
          <p className="text-white/90 text-lg max-w-2xl mx-auto">
            Stay updated with our latest collections, exclusive offers, and
            fashion trends. Subscribe to our newsletter and never miss out.
          </p>

          <form
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto"
          >
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 px-6 py-4 rounded-full border-2 border-white/20 bg-white/10 text-white placeholder:text-gray-300 focus:outline-none focus:border-white/40 backdrop-blur-sm"
              required
            />
            <Button
              type="submit"
              size="lg"
              className="bg-white text-gray-900 hover:bg-gray-100 px-8 py-4 text-lg font-semibold rounded-full shadow-xl whitespace-nowrap"
            >
              SUBSCRIBE
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
};
