import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import { ProductCard } from "../product-card";

vi.mock("@/hooks/use-cart", () => ({
  useCart: vi.fn(),
}));

vi.mock("@/hooks/use-toast", () => ({
  useToast: vi.fn(),
}));

const mockUseCart = vi.mocked(useCart);
const mockUseToast = vi.mocked(useToast);

const baseProduct = {
  id: "product-1",
  name: "Air Runner",
  base_price: 1000,
  compare_at_price: 0,
  images: [],
  variants: [
    { id: "variant-40", size: "40" },
    { id: "variant-41", size: "41" },
  ],
};

function renderProductCard(product: Record<string, unknown> = baseProduct, variant?: "default" | "teaser") {
  return render(
    <MemoryRouter>
      <ProductCard product={product} variant={variant} />
    </MemoryRouter>
  );
}

describe("ProductCard", () => {
  const addItem = vi.fn().mockResolvedValue(undefined);
  const showWarning = vi.fn();

  beforeEach(() => {
    addItem.mockClear();
    showWarning.mockClear();
    mockUseCart.mockReturnValue({ addItem } as unknown as ReturnType<typeof useCart>);
    mockUseToast.mockReturnValue({ showWarning } as unknown as ReturnType<typeof useToast>);
  });

  it("renders the product name and formatted price", () => {
    renderProductCard();
    expect(screen.getByText("Air Runner")).toBeInTheDocument();
    expect(screen.getByText("1,000")).toBeInTheDocument();
  });

  it("shows a discount badge when compare_at_price is higher than base_price", () => {
    renderProductCard({ ...baseProduct, base_price: 800, compare_at_price: 1000 });
    expect(screen.getByText("-20%")).toBeInTheDocument();
  });

  it("does not show a discount badge when there is no discount", () => {
    renderProductCard();
    expect(screen.queryByText(/-\d+%/)).not.toBeInTheDocument();
  });

  it("renders the available sizes from variants", () => {
    renderProductCard();
    expect(screen.getByRole("button", { name: "40" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "41" })).toBeInTheDocument();
  });

  it("warns and does not add to cart when no size is selected", async () => {
    renderProductCard();

    fireEvent.click(screen.getByRole("button", { name: /add cart/i }));

    expect(showWarning).toHaveBeenCalledWith(
      "Please select a size",
      expect.any(String)
    );
    expect(addItem).not.toHaveBeenCalled();
  });

  it("adds the selected variant to the cart", async () => {
    renderProductCard();

    fireEvent.click(screen.getByRole("button", { name: "41" }));
    fireEvent.click(screen.getByRole("button", { name: /add cart/i }));

    expect(addItem).toHaveBeenCalledWith("product-1", "variant-41", 1);
  });

  it("falls back to the default size list when variants have no size field", () => {
    const noSizeProduct = {
      ...baseProduct,
      variants: [{ id: "variant-only" }],
    };
    renderProductCard(noSizeProduct);

    expect(screen.getByRole("button", { name: "40" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "44" })).toBeInTheDocument();
  });

  it("hides the add-to-cart controls in teaser variant", () => {
    renderProductCard(baseProduct, "teaser");
    expect(screen.queryByRole("button", { name: /add cart/i })).not.toBeInTheDocument();
  });
});
