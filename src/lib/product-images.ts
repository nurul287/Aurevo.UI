/**
 * Order product images so the "lead" image always comes first.
 *
 * Rules (in priority order):
 *   1. Primary images (`is_primary = true`) come before non-primary.
 *   2. Within the same primary group, lower `sort_order` wins.
 *   3. Stable for ties.
 *
 * Returns a new array; never mutates the input.
 */
export function sortProductImages<
  T extends { is_primary?: boolean | null; sort_order?: number | null },
>(images: T[] | null | undefined): T[] {
  if (!images || images.length === 0) return [];
  return [...images].sort((a, b) => {
    if (!!a.is_primary !== !!b.is_primary) return b.is_primary ? 1 : -1;
    return (a.sort_order ?? 0) - (b.sort_order ?? 0);
  });
}

/**
 * Convenience: returns the URL of the lead image, or undefined if none.
 */
export function getLeadImageUrl<
  T extends {
    is_primary?: boolean | null;
    sort_order?: number | null;
    url?: string | null;
  },
>(images: T[] | null | undefined): string | undefined {
  const sorted = sortProductImages(images);
  return sorted[0]?.url ?? undefined;
}
