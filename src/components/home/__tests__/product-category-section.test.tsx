import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { useCategories } from "@/services";
import { ProductCategorySection } from "../product-category-section";

vi.mock("@/services", () => ({
  useCategories: vi.fn(),
}));

const mockUseCategories = vi.mocked(useCategories);

function renderSection() {
  return render(
    <MemoryRouter>
      <ProductCategorySection />
    </MemoryRouter>
  );
}

describe("ProductCategorySection", () => {
  it("shows skeleton placeholders while loading", () => {
    mockUseCategories.mockReturnValue({
      data: [],
      isLoading: true,
    } as unknown as ReturnType<typeof useCategories>);

    const { container } = renderSection();
    expect(container.querySelectorAll(".animate-pulse").length).toBeGreaterThan(0);
  });

  it("renders real categories from the API when available", () => {
    mockUseCategories.mockReturnValue({
      data: [{ id: "c1", name: "Sneakers", slug: "sneakers", image_url: null }],
      isLoading: false,
    } as unknown as ReturnType<typeof useCategories>);

    renderSection();
    expect(screen.getByText("SNEAKERS")).toBeInTheDocument();
  });

  it("falls back to placeholder categories when there are none from the API", () => {
    mockUseCategories.mockReturnValue({
      data: [],
      isLoading: false,
    } as unknown as ReturnType<typeof useCategories>);

    renderSection();
    expect(screen.getByText("PANJABI")).toBeInTheDocument();
  });

  it("links each category to the filtered products page", () => {
    mockUseCategories.mockReturnValue({
      data: [{ id: "c1", name: "Sneakers", slug: "sneakers", image_url: null }],
      isLoading: false,
    } as unknown as ReturnType<typeof useCategories>);

    renderSection();
    expect(screen.getByRole("link", { name: "SNEAKERS" })).toHaveAttribute(
      "href",
      "/products?category=sneakers"
    );
  });
});
