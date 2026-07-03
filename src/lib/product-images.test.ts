import { describe, expect, it } from "vitest";
import { getLeadImageUrl, sortProductImages } from "./product-images";

describe("sortProductImages", () => {
  it("returns an empty array for null or undefined input", () => {
    expect(sortProductImages(null)).toEqual([]);
    expect(sortProductImages(undefined)).toEqual([]);
  });

  it("puts primary images before non-primary ones", () => {
    const images = [
      { is_primary: false, sort_order: 0, url: "b" },
      { is_primary: true, sort_order: 1, url: "a" },
    ];
    expect(sortProductImages(images).map((i) => i.url)).toEqual(["a", "b"]);
  });

  it("orders same-priority images by sort_order", () => {
    const images = [
      { is_primary: true, sort_order: 2, url: "second" },
      { is_primary: true, sort_order: 1, url: "first" },
    ];
    expect(sortProductImages(images).map((i) => i.url)).toEqual(["first", "second"]);
  });

  it("does not mutate the input array", () => {
    const images = [{ is_primary: false, sort_order: 1, url: "a" }];
    const result = sortProductImages(images);
    expect(result).not.toBe(images);
  });
});

describe("getLeadImageUrl", () => {
  it("returns undefined when there are no images", () => {
    expect(getLeadImageUrl([])).toBeUndefined();
    expect(getLeadImageUrl(null)).toBeUndefined();
  });

  it("returns the primary image's url", () => {
    const images = [
      { is_primary: false, sort_order: 0, url: "secondary.jpg" },
      { is_primary: true, sort_order: 0, url: "primary.jpg" },
    ];
    expect(getLeadImageUrl(images)).toBe("primary.jpg");
  });
});
