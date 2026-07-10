import { useTranslation } from "react-i18next";

const GALLERY_COUNT = 8;

const GALLERY_ITEMS = Array.from({ length: GALLERY_COUNT }, (_, i) => {
  const n = i + 1;
  return {
    src: `/galary-${n}.webp`,
    alt: `Aurevo sneaker gallery — image ${n}`,
  };
});

const FIRST_ROW = GALLERY_ITEMS.slice(0, 4);
const SECOND_ROW = GALLERY_ITEMS.slice(4, 8);

/** Same height for every tile in a row → flat row tops/bottoms; photos crop inside. */
const TILE_FRAME = "h-[240px] sm:h-[260px] md:h-[280px] lg:h-[300px]";

type GalleryItem = (typeof GALLERY_ITEMS)[number];

function GalleryTile({ item }: { item: GalleryItem }) {
  return (
    <div
      className={`group relative h-full min-h-0 w-full overflow-hidden rounded-2xl bg-stone-200 shadow-sm ring-1 ring-black/5 transition-shadow duration-300 hover:shadow-md ${TILE_FRAME}`}
    >
      <img
        src={item.src}
        alt={item.alt}
        loading="lazy"
        decoding="async"
        sizes="(max-width: 640px) 50vw, 25vw"
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out will-change-transform group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
      />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 motion-reduce:opacity-0"
        aria-hidden
      />
    </div>
  );
}

function GalleryTileMobile({ item }: { item: GalleryItem }) {
  return (
    <div className="group relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-stone-200 shadow-sm ring-1 ring-black/5 transition-shadow duration-300 hover:shadow-md">
      <img
        src={item.src}
        alt={item.alt}
        loading="lazy"
        decoding="async"
        sizes="50vw"
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out will-change-transform group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
      />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 motion-reduce:opacity-0"
        aria-hidden
      />
    </div>
  );
}

export const SneakerGallerySection = () => {
  const { t } = useTranslation();
  return (
    <section
      className="border-t border-stone-200/80 bg-stone-50 py-10 sm:py-12"
      aria-labelledby="sneaker-gallery-heading"
    >
      <div className="container-custom">
        <div className="mx-auto mb-8 max-w-2xl text-center sm:mb-10">
          <h2
            id="sneaker-gallery-heading"
            className="text-2xl uppercase font-bold tracking-tight text-slate-900 sm:text-3xl md:text-4xl"
          >
            {t("home.gallery")}
          </h2>
        </div>

        <ul className="mx-auto grid max-w-6xl grid-cols-2 gap-2 sm:hidden">
          {GALLERY_ITEMS.map((item) => (
            <li key={item.src} className="min-w-0">
              <GalleryTileMobile item={item} />
            </li>
          ))}
        </ul>

        <div className="mx-auto hidden w-full max-w-6xl sm:block">
          <div
            className="grid gap-3 [grid-template-columns:minmax(0,1.5fr)_minmax(0,1fr)_minmax(0,1.5fr)_minmax(0,1fr)]"
            role="list"
          >
            {FIRST_ROW.map((item) => (
              <div key={item.src} className="min-h-0 min-w-0" role="listitem">
                <GalleryTile item={item} />
              </div>
            ))}
          </div>

          <div
            className="mt-3 grid gap-3 [grid-template-columns:minmax(0,1fr)_minmax(0,1.5fr)_minmax(0,1fr)_minmax(0,1.5fr)]"
            role="list"
          >
            {SECOND_ROW.map((item) => (
              <div key={item.src} className="min-h-0 min-w-0" role="listitem">
                <GalleryTile item={item} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
