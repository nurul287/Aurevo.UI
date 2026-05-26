export const HeroSection = () => {
  return (
    <section className="relative w-full overflow-hidden bg-neutral-100">
      {/*
       * width/height reflect intrinsic image dimensions (7450×10753).
       * Browser uses them to compute the aspect-ratio before the image
       * arrives, reserving the correct amount of space and eliminating CLS.
       */}
      <img
        src="/cover-photo.webp"
        alt="AUREVO Fashion — storefront and contact"
        className="block h-auto w-full"
        width={7450}
        height={10753}
        loading="eager"
        fetchPriority="high"
        decoding="async"
      />
    </section>
  );
};
