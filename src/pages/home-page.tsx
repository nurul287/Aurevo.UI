import {
  HeroSection,
  ProductCategorySection,
  FullCollectionBanner,
  NewCollectionSection,
  PromotionalBanners,
  OurShopSection,
  NewsletterBanner,
} from "@/components/home";

const HomePage = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <HeroSection />

      {/* Product Category Section */}
      <ProductCategorySection />

      {/* Full Collection Banner */}
      <FullCollectionBanner />

      {/* New Collection Section */}
      <NewCollectionSection />

      {/* Promotional Banners */}
      <PromotionalBanners />

      {/* Our Shop Section */}
      <OurShopSection />

      {/* Newsletter Banner */}
      <NewsletterBanner />
    </div>
  );
};

export default HomePage;
