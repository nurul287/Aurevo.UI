import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SneakerGallerySection } from "../sneaker-gallery-section";

describe("SneakerGallerySection", () => {
  it("renders the gallery heading", () => {
    render(<SneakerGallerySection />);
    expect(screen.getByRole("heading", { name: "Aurevo gallery" })).toBeInTheDocument();
  });

  it("renders all 8 gallery images (desktop + mobile layouts combined)", () => {
    render(<SneakerGallerySection />);
    const images = screen.getAllByAltText(/Aurevo sneaker gallery/);
    // 8 images render twice — once in the mobile grid, once in the desktop grid.
    expect(images).toHaveLength(16);
  });
});
