import {
  HeroSection,
  ProductCategorySection,
  FullCollectionBanner,
  NewCollectionSection,
  PromotionalBanners,
  OurShopSection,
  AboutStoreSection,
  ContactUsSection,
  StoreLocationSection,
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

      {/* About The Store Section */}
      <AboutStoreSection />

      {/* Contact Us Section */}
      <ContactUsSection />

      {/* Store Location Section */}
      <StoreLocationSection />

      {/* Newsletter Banner */}
      <NewsletterBanner />
    </div>
  );
};

export default HomePage;
