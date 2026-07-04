import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { AboutStoreSection } from "../about-store-section";

describe("AboutStoreSection", () => {
  it("renders the heading and an 'Explore More' link to the products page", () => {
    render(
      <MemoryRouter>
        <AboutStoreSection />
      </MemoryRouter>
    );

    expect(screen.getByRole("heading", { name: "About The Store" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Explore More" })).toHaveAttribute(
      "href",
      "/products"
    );
  });
});
