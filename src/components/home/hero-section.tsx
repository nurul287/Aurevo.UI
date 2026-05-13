export const HeroSection = () => {
  return (
    <section className="relative w-full overflow-hidden bg-neutral-100">
      <img
        src="/cover-photo.png"
        alt="AUREVO Fashion — storefront and contact"
        className="block h-auto w-full"
        loading="eager"
        fetchPriority="high"
        decoding="async"
      />
    </section>
  );
};
