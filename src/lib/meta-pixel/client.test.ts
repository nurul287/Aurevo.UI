import { afterEach, describe, expect, it, vi } from "vitest";
import {
  getMetaPixelId,
  getMetaPixelNoscriptImageUrl,
  isMetaPixelEnabled,
  shouldTrackRoute,
} from "./client";

describe("getMetaPixelId", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns undefined when the env var is not set", () => {
    vi.stubEnv("VITE_META_PIXEL_ID", "");
    expect(getMetaPixelId()).toBeUndefined();
  });

  it("returns undefined for a non-numeric id", () => {
    vi.stubEnv("VITE_META_PIXEL_ID", "not-numeric");
    expect(getMetaPixelId()).toBeUndefined();
  });

  it("returns the id when it is numeric", () => {
    vi.stubEnv("VITE_META_PIXEL_ID", "1409609890385063");
    expect(getMetaPixelId()).toBe("1409609890385063");
  });
});

describe("isMetaPixelEnabled", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("is false when there is no valid pixel id", () => {
    vi.stubEnv("VITE_META_PIXEL_ID", "");
    expect(isMetaPixelEnabled()).toBe(false);
  });

  it("is true when there is a valid pixel id", () => {
    vi.stubEnv("VITE_META_PIXEL_ID", "1409609890385063");
    expect(isMetaPixelEnabled()).toBe(true);
  });
});

describe("shouldTrackRoute", () => {
  it("returns false for admin routes", () => {
    expect(shouldTrackRoute("/admin/products")).toBe(false);
  });

  it("returns true for non-admin routes", () => {
    expect(shouldTrackRoute("/products")).toBe(true);
    expect(shouldTrackRoute("/")).toBe(true);
  });
});

describe("getMetaPixelNoscriptImageUrl", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns undefined when the pixel is not configured", () => {
    vi.stubEnv("VITE_META_PIXEL_ID", "");
    expect(getMetaPixelNoscriptImageUrl()).toBeUndefined();
  });

  it("builds the noscript tracking pixel URL when configured", () => {
    vi.stubEnv("VITE_META_PIXEL_ID", "1409609890385063");
    expect(getMetaPixelNoscriptImageUrl()).toBe(
      "https://www.facebook.com/tr?id=1409609890385063&ev=PageView&noscript=1"
    );
  });
});
