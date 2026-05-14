/**
 * Optional higher-resolution URL for the PDP hero.
 *
 * Supabase `/storage/v1/render/image/public/...` only works when **Image
 * Transformations** are enabled on the project. Using it otherwise returns
 * errors and the `<img>` will not load — so resizing is **opt-in**.
 *
 * Set in `.env`:
 *   `VITE_USE_SUPABASE_IMAGE_TRANSFORM=true`
 * when your Supabase plan supports image transforms.
 */

export function getProductHeroImageUrl(
  url: string,
  maxWidthPx: number = 1920,
): string {
  if (!url?.trim()) return url;

  if (import.meta.env.VITE_USE_SUPABASE_IMAGE_TRANSFORM !== "true") {
    return url;
  }

  try {
    const parsed = new URL(url);

    const supabaseBase = import.meta.env.VITE_SUPABASE_URL as
      | string
      | undefined;
    if (supabaseBase) {
      const projectOrigin = new URL(supabaseBase).origin;
      if (
        parsed.origin === projectOrigin &&
        parsed.pathname.includes("/storage/v1/object/public/")
      ) {
        parsed.pathname = parsed.pathname.replace(
          "/storage/v1/object/public/",
          "/storage/v1/render/image/public/",
        );
        parsed.searchParams.set("width", String(maxWidthPx));
        parsed.searchParams.set("quality", "86");
        return parsed.toString();
      }
    }

    if (
      parsed.hostname === "images.unsplash.com" ||
      parsed.hostname.endsWith(".unsplash.com")
    ) {
      parsed.searchParams.set("w", String(maxWidthPx));
      parsed.searchParams.set("q", "85");
      parsed.searchParams.set("auto", "format");
      return parsed.toString();
    }
  } catch {
    return url;
  }

  return url;
}
