import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAuth } from "@/contexts/auth-context";
import { useGuestCart } from "@/contexts/guest-cart-context";
import { useCart } from "@/hooks/use-cart";
import { useCategories } from "@/services";
import Layout from "../layout";

vi.mock("@/contexts/auth-context", () => ({ useAuth: vi.fn() }));
vi.mock("@/contexts/guest-cart-context", () => ({ useGuestCart: vi.fn() }));
vi.mock("@/hooks/use-cart", () => ({ useCart: vi.fn() }));
vi.mock("@/services", () => ({
  useCategories: vi.fn(),
  useSearchProducts: vi.fn(() => ({
    data: undefined,
    isFetching: false,
    isError: false,
  })),
}));
// The real cart drawer is covered by its own test file — stub it here so
// Layout's test doesn't need to re-mock its entire dependency tree.
vi.mock("@/components/cart-side-panel", () => ({
  default: () => <div data-testid="cart-side-panel-stub" />,
}));

const mockUseAuth = vi.mocked(useAuth);
const mockUseGuestCart = vi.mocked(useGuestCart);
const mockUseCart = vi.mocked(useCart);
const mockUseCategories = vi.mocked(useCategories);

function renderLayout(initialEntry = "/") {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<div>Home Content</div>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
}

describe("Layout", () => {
  const openCartPanel = vi.fn();

  beforeEach(() => {
    openCartPanel.mockClear();
    mockUseCategories.mockReturnValue({
      data: [{ id: "c1", name: "Sneakers", slug: "sneakers" }],
    } as unknown as ReturnType<typeof useCategories>);
    mockUseCart.mockReturnValue({ itemCount: 0 } as unknown as ReturnType<
      typeof useCart
    >);
    mockUseGuestCart.mockReturnValue({ openCartPanel } as unknown as ReturnType<
      typeof useGuestCart
    >);
  });

  it("renders the routed page content via Outlet", () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isAdmin: false,
      signOut: vi.fn(),
    } as unknown as ReturnType<typeof useAuth>);

    renderLayout();
    expect(screen.getByText("Home Content")).toBeInTheDocument();
  });

  it("renders category navigation links from the API", () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isAdmin: false,
      signOut: vi.fn(),
    } as unknown as ReturnType<typeof useAuth>);

    renderLayout();
    expect(
      screen.getAllByRole("link", { name: "Sneakers" })[0],
    ).toHaveAttribute("href", "/products?category=sneakers");
  });

  it("shows a 'Sign in' link when there is no user", () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isAdmin: false,
      signOut: vi.fn(),
    } as unknown as ReturnType<typeof useAuth>);

    renderLayout();
    expect(screen.getByRole("link", { name: "Sign in" })).toHaveAttribute(
      "href",
      "/login",
    );
  });

  it("shows the user menu with a Dashboard link when logged in", () => {
    mockUseAuth.mockReturnValue({
      user: { email: "jane@example.com" },
      isAdmin: false,
      signOut: vi.fn(),
    } as unknown as ReturnType<typeof useAuth>);

    renderLayout();
    fireEvent.click(screen.getByRole("button", { expanded: false }));
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.queryByText("Admin Panel")).not.toBeInTheDocument();
  });

  it("shows an Admin Panel link for admin users", () => {
    mockUseAuth.mockReturnValue({
      user: { email: "admin@example.com" },
      isAdmin: true,
      signOut: vi.fn(),
    } as unknown as ReturnType<typeof useAuth>);

    renderLayout();
    fireEvent.click(screen.getByRole("button", { expanded: false }));
    expect(screen.getByText("Admin Panel")).toBeInTheDocument();
  });

  it("shows the cart item count badge when the cart has items", () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isAdmin: false,
      signOut: vi.fn(),
    } as unknown as ReturnType<typeof useAuth>);
    mockUseCart.mockReturnValue({ itemCount: 3 } as unknown as ReturnType<
      typeof useCart
    >);

    renderLayout();
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("opens the cart panel when the cart button is clicked", () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isAdmin: false,
      signOut: vi.fn(),
    } as unknown as ReturnType<typeof useAuth>);

    renderLayout();
    fireEvent.click(screen.getByRole("button", { name: "Open cart" }));
    expect(openCartPanel).toHaveBeenCalledTimes(1);
  });
});
