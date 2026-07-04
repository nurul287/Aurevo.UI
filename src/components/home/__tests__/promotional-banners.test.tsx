import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import { usePromotionalBannerProducts } from "@/services";
import { PromotionalBanners } from "../promotional-banners";

vi.mock("@/hooks/use-cart", () => ({ useCart: vi.fn() }));
vi.mock("@/hooks/use-toast", () => ({ useToast: vi.fn() }));
vi.mock("@/services", () => ({ usePromotionalBannerProducts: vi.fn() }));

const mockUseCart = vi.mocked(useCart);
const mockUseToast = vi.mocked(useToast);
const mockUsePromotionalBannerProducts = vi.mocked(usePromotionalBannerProducts);

describe("PromotionalBanners", () => {
  const addItem = vi.fn().mockResolvedValue(undefined);
  const showError = vi.fn();
  const showWarning = vi.fn();

  beforeEach(() => {
    addItem.mockClear();
    showError.mockClear();
    showWarning.mockClear();
    mockUseCart.mockReturnValue({
      addItem,
      isAddingToCart: false,
    } as unknown as ReturnType<typeof useCart>);
    mockUseToast.mockReturnValue({ showError, showWarning } as unknown as ReturnType<
      typeof useToast
    >);
  });

  it("shows an error when a promo has no linked product and Add to Cart is clicked", () => {
    mockUsePromotionalBannerProducts.mockReturnValue({
      data: { orange: null, white: null },
      isLoading: false,
    } as unknown as ReturnType<typeof usePromotionalBannerProducts>);

    render(<PromotionalBanners />);

    const [firstButton] = screen.getAllByRole("button", { name: "Add to Cart" });
    fireEvent.click(firstButton);

    expect(showError).toHaveBeenCalledWith(
      "Product unavailable",
      expect.any(String)
    );
    expect(addItem).not.toHaveBeenCalled();
  });

  it("adds the first cart-eligible variant when a linked product exists", () => {
    mockUsePromotionalBannerProducts.mockReturnValue({
      data: {
        orange: {
          id: "p1",
          variants: [{ id: "v1", size: "40", is_active: true }],
        },
        white: null,
      },
      isLoading: false,
    } as unknown as ReturnType<typeof usePromotionalBannerProducts>);

    render(<PromotionalBanners />);

    const [firstButton] = screen.getAllByRole("button", { name: "Add to Cart" });
    fireEvent.click(firstButton);

    expect(addItem).toHaveBeenCalledWith("p1", "v1", 1);
  });

  it("shows a loading label while promo products are being fetched", () => {
    mockUsePromotionalBannerProducts.mockReturnValue({
      data: undefined,
      isLoading: true,
    } as unknown as ReturnType<typeof usePromotionalBannerProducts>);

    render(<PromotionalBanners />);
    expect(screen.getAllByRole("button", { name: "Loading…" })[0]).toBeDisabled();
  });
});
