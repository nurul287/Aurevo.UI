/** Product slugs for home promo banners (primary + fallbacks if migration 019 was not applied). */
export type PromotionalBannerColor = "orange" | "white";

export const PROMOTIONAL_BANNER_PRODUCT_SLUGS: Record<
  PromotionalBannerColor,
  readonly string[]
> = {
  orange: ["nike-vomero-18-orange", "nike-vomero-18"],
  white: ["nike-vomero-18-white"],
};

const COLOR_HINTS: Record<PromotionalBannerColor, readonly string[]> = {
  orange: ["orange", "pink", "coral", "red", "habanero", "ember"],
  white: ["white", "cream", "sail", "light", "grey", "gray", "bone"],
};

export function productMatchesPromoColorRole(
  variants: { color?: string | null }[] | null | undefined,
  role: PromotionalBannerColor,
): boolean {
  const hints = COLOR_HINTS[role];
  return (variants ?? []).some((v) => {
    const c = (v.color ?? "").toLowerCase();
    return hints.some((h) => c.includes(h));
  });
}
