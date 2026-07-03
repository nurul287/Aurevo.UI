import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { HeroSection } from "../hero-section";

describe("HeroSection", () => {
  it("renders the storefront cover image with descriptive alt text", () => {
    render(<HeroSection />);
    const image = screen.getByRole("img", {
      name: "AUREVO Fashion — storefront and contact",
    });
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute("loading", "eager");
  });
});
