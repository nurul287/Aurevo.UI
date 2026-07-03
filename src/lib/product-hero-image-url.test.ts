import { afterEach, describe, expect, it, vi } from "vitest";
import { getProductHeroImageUrl } from "./product-hero-image-url";

describe("getProductHeroImageUrl", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns the original url unchanged when it is empty", () => {
    expect(getProductHeroImageUrl("")).toBe("");
  });

  it("returns the original url when image transforms are disabled", () => {
    vi.stubEnv("VITE_USE_SUPABASE_IMAGE_TRANSFORM", "false");
    const url = "https://example.supabase.co/storage/v1/object/public/img.jpg";
    expect(getProductHeroImageUrl(url)).toBe(url);
  });

  it("rewrites a matching Supabase storage URL to the render/image endpoint", () => {
    vi.stubEnv("VITE_USE_SUPABASE_IMAGE_TRANSFORM", "true");
    vi.stubEnv("VITE_SUPABASE_URL", "https://myproj.supabase.co");

    const url = "https://myproj.supabase.co/storage/v1/object/public/bucket/img.jpg";
    const result = getProductHeroImageUrl(url, 800);

    expect(result).toContain("/storage/v1/render/image/public/bucket/img.jpg");
    expect(result).toContain("width=800");
    expect(result).toContain("quality=86");
  });

  it("adds resize params for Unsplash URLs when transforms are enabled", () => {
    vi.stubEnv("VITE_USE_SUPABASE_IMAGE_TRANSFORM", "true");
    const url = "https://images.unsplash.com/photo-123";
    const result = getProductHeroImageUrl(url, 1200);

    expect(result).toContain("w=1200");
    expect(result).toContain("q=85");
  });

  it("leaves unrelated URLs untouched even when transforms are enabled", () => {
    vi.stubEnv("VITE_USE_SUPABASE_IMAGE_TRANSFORM", "true");
    const url = "https://cdn.example.com/img.jpg";
    expect(getProductHeroImageUrl(url)).toBe(url);
  });

  it("returns the original string for an invalid URL instead of throwing", () => {
    vi.stubEnv("VITE_USE_SUPABASE_IMAGE_TRANSFORM", "true");
    expect(getProductHeroImageUrl("not a valid url")).toBe("not a valid url");
  });
});
