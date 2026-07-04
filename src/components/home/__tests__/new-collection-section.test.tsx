import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import { useProducts } from "@/services";
import { NewCollectionSection } from "../new-collection-section";

vi.mock("@/hooks/use-cart", () => ({ useCart: vi.fn() }));
vi.mock("@/hooks/use-toast", () => ({ useToast: vi.fn() }));
vi.mock("@/services", () => ({ useProducts: vi.fn() }));

const mockUseCart = vi.mocked(useCart);
const mockUseToast = vi.mocked(useToast);
const mockUseProducts = vi.mocked(useProducts);

function renderSection() {
  return render(
    <MemoryRouter>
      <NewCollectionSection />
    </MemoryRouter>
  );
}

describe("NewCollectionSection", () => {
  beforeEach(() => {
    mockUseCart.mockReturnValue({ addItem: vi.fn() } as unknown as ReturnType<
      typeof useCart
    >);
    mockUseToast.mockReturnValue({ showWarning: vi.fn() } as unknown as ReturnType<
      typeof useToast
    >);
  });

  it("shows skeleton placeholders while loading", () => {
    mockUseProducts.mockReturnValue({
      data: undefined,
      isLoading: true,
    } as unknown as ReturnType<typeof useProducts>);

    const { container } = renderSection();
    expect(container.querySelectorAll(".animate-pulse").length).toBeGreaterThan(0);
  });

  it("shows an empty state when there are no products", () => {
    mockUseProducts.mockReturnValue({
      data: { data: [] },
      isLoading: false,
    } as unknown as ReturnType<typeof useProducts>);

    renderSection();
    expect(
      screen.getByText("No products available in the new collection.")
    ).toBeInTheDocument();
  });

  it("renders a carousel of product cards when products are available", () => {
    mockUseProducts.mockReturnValue({
      data: {
        data: [{ id: "p1", name: "Air Runner", base_price: 100, variants: [] }],
      },
      isLoading: false,
    } as unknown as ReturnType<typeof useProducts>);

    renderSection();
    expect(screen.getByText("Air Runner")).toBeInTheDocument();
    expect(screen.getByRole("region")).toHaveAttribute("aria-roledescription", "carousel");
  });
});
