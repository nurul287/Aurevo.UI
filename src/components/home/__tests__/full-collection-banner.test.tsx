import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { FullCollectionBanner } from "../full-collection-banner";

describe("FullCollectionBanner", () => {
  it("renders the heading and a link to the products page", () => {
    render(
      <MemoryRouter>
        <FullCollectionBanner />
      </MemoryRouter>
    );

    expect(screen.getByText("AUREVO")).toBeInTheDocument();
    expect(screen.getByText("FULL COLLECTION")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Shop" })).toHaveAttribute(
      "href",
      "/products"
    );
  });
});
