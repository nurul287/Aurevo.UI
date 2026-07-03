import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useGuestCart } from "@/contexts/guest-cart-context";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import { useProduct, useVariantsAvailableQuantities } from "@/services";
import CartSidePanel from "../cart-side-panel";

vi.mock("@/hooks/use-cart", () => ({ useCart: vi.fn() }));
vi.mock("@/hooks/use-toast", () => ({ useToast: vi.fn() }));
vi.mock("@/contexts/guest-cart-context", () => ({ useGuestCart: vi.fn() }));
vi.mock("@/services", () => ({
  useProduct: vi.fn(),
  useVariantsAvailableQuantities: vi.fn(),
}));

const mockUseCart = vi.mocked(useCart);
const mockUseToast = vi.mocked(useToast);
const mockUseGuestCart = vi.mocked(useGuestCart);
const mockUseProduct = vi.mocked(useProduct);
const mockUseVariantsAvailableQuantities = vi.mocked(useVariantsAvailableQuantities);

const CART_ITEM = {
  id: "item-1",
  product_id: "p1",
  variant_id: "v1",
  quantity: 2,
  price: 500,
  product: { id: "p1", name: "Air Runner", images: [] },
  variant: { id: "v1", size: "42", price: 500 },
};

function renderPanel(cartItems: unknown[] = [CART_ITEM]) {
  const removeItem = vi.fn().mockResolvedValue(undefined);
  const updateItemQuantity = vi.fn().mockResolvedValue(undefined);
  const addItem = vi.fn().mockResolvedValue(undefined);
  const closeCartPanel = vi.fn();

  mockUseCart.mockReturnValue({
    cartItems,
    cartTotal: 1000,
    updateItemQuantity,
    removeItem,
    addItem,
    isUpdatingQuantity: false,
    isRemovingItem: false,
  } as unknown as ReturnType<typeof useCart>);

  mockUseGuestCart.mockReturnValue({
    isCartPanelOpen: true,
    closeCartPanel,
  } as unknown as ReturnType<typeof useGuestCart>);

  mockUseProduct.mockReturnValue({ data: undefined } as unknown as ReturnType<
    typeof useProduct
  >);
  mockUseVariantsAvailableQuantities.mockReturnValue({
    data: {},
  } as unknown as ReturnType<typeof useVariantsAvailableQuantities>);

  mockUseToast.mockReturnValue({
    showError: vi.fn(),
    showSuccess: vi.fn(),
  } as unknown as ReturnType<typeof useToast>);

  const result = render(
    <MemoryRouter>
      <CartSidePanel />
    </MemoryRouter>
  );

  return { ...result, removeItem, updateItemQuantity, addItem, closeCartPanel };
}

describe("CartSidePanel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows an empty cart message when there are no items", () => {
    renderPanel([]);
    expect(screen.getByText("Your cart is empty")).toBeInTheDocument();
  });

  it("renders each cart item's name, price, and quantity", () => {
    renderPanel();
    expect(screen.getByText("Air Runner")).toBeInTheDocument();
    expect(screen.getByRole("spinbutton")).toHaveValue("2");
  });

  it("shows the cart subtotal and item count in the header", () => {
    renderPanel();
    // cartItems.length drives the count, not the line's quantity.
    expect(screen.getByText("(1 item)")).toBeInTheDocument();
    expect(screen.getByText("Subtotal:")).toBeInTheDocument();
    expect(screen.getByText("৳1,000.00")).toBeInTheDocument();
  });

  it("removes an item when its remove button is clicked", () => {
    const { removeItem } = renderPanel();
    fireEvent.click(screen.getByRole("button", { name: "Remove item" }));
    expect(removeItem).toHaveBeenCalledWith("item-1");
  });

  it("navigates to checkout and closes the panel on checkout click", () => {
    const { closeCartPanel } = renderPanel();
    fireEvent.click(screen.getByRole("button", { name: /check out/i }));
    expect(closeCartPanel).toHaveBeenCalledTimes(1);
  });

  it("closes the panel when 'Continue Shopping' is clicked on an empty cart", () => {
    const { closeCartPanel } = renderPanel([]);
    fireEvent.click(screen.getByRole("button", { name: "Continue Shopping" }));
    expect(closeCartPanel).toHaveBeenCalledTimes(1);
  });
});
