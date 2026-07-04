import { fireEvent, render, screen } from "@testing-library/react";
import type { ComponentProps } from "react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useSearchProducts } from "@/services";
import { HeaderProductSearch } from "../header-product-search";

vi.mock("@/services", () => ({
  useSearchProducts: vi.fn(),
}));

const mockUseSearchProducts = vi.mocked(useSearchProducts);

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>(
    "react-router-dom"
  );
  return { ...actual, useNavigate: () => mockNavigate };
});

function renderSearch(props: Partial<ComponentProps<typeof HeaderProductSearch>> = {}) {
  const onChange = vi.fn();
  const onSubmitSearch = vi.fn();
  render(
    <MemoryRouter>
      <HeaderProductSearch
        value=""
        onChange={onChange}
        onSubmitSearch={onSubmitSearch}
        inputClassName="input"
        {...props}
      />
    </MemoryRouter>
  );
  return { onChange, onSubmitSearch };
}

describe("HeaderProductSearch", () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    mockUseSearchProducts.mockReturnValue({
      data: { data: [], count: 0 },
      isFetching: false,
      isError: false,
    } as unknown as ReturnType<typeof useSearchProducts>);
  });

  it("renders a search input", () => {
    renderSearch();
    expect(screen.getByLabelText("Search products")).toBeInTheDocument();
  });

  it("calls onChange as the user types", () => {
    const { onChange } = renderSearch();
    fireEvent.change(screen.getByLabelText("Search products"), {
      target: { value: "sneaker" },
    });
    expect(onChange).toHaveBeenCalledWith("sneaker");
  });

  it("submits the search on form submit when there is a query", () => {
    const { onSubmitSearch } = renderSearch({ value: "sneaker" });
    fireEvent.submit(screen.getByLabelText("Search products").closest("form")!);
    expect(onSubmitSearch).toHaveBeenCalled();
  });

  it("does not submit when the query is empty", () => {
    const { onSubmitSearch } = renderSearch({ value: "   " });
    fireEvent.submit(screen.getByLabelText("Search products").closest("form")!);
    expect(onSubmitSearch).not.toHaveBeenCalled();
  });

  it("shows a suggestion panel with results on focus", () => {
    mockUseSearchProducts.mockReturnValue({
      data: {
        data: [
          {
            id: "p1",
            name: "Air Runner",
            base_price: 1500,
            images: [],
          },
        ],
        count: 1,
      },
      isFetching: false,
      isError: false,
    } as unknown as ReturnType<typeof useSearchProducts>);

    renderSearch({ value: "runner" });
    fireEvent.focus(screen.getByLabelText("Search products"));

    expect(screen.getByRole("listbox")).toBeInTheDocument();
    expect(screen.getByText("Air Runner")).toBeInTheDocument();
  });

  it("navigates to the product detail page when a suggestion is clicked", () => {
    mockUseSearchProducts.mockReturnValue({
      data: {
        data: [{ id: "p1", name: "Air Runner", base_price: 1500, images: [] }],
        count: 1,
      },
      isFetching: false,
      isError: false,
    } as unknown as ReturnType<typeof useSearchProducts>);

    renderSearch({ value: "runner" });
    fireEvent.focus(screen.getByLabelText("Search products"));
    fireEvent.click(screen.getByRole("option", { name: /Air Runner/i }));

    expect(mockNavigate).toHaveBeenCalledWith("/products/p1");
  });

  it("navigates to the full results page when 'View all' is clicked", () => {
    mockUseSearchProducts.mockReturnValue({
      data: {
        data: [{ id: "p1", name: "Air Runner", base_price: 1500, images: [] }],
        count: 5,
      },
      isFetching: false,
      isError: false,
    } as unknown as ReturnType<typeof useSearchProducts>);

    renderSearch({ value: "runner" });
    fireEvent.focus(screen.getByLabelText("Search products"));
    fireEvent.click(screen.getByRole("button", { name: /view all 5 results/i }));

    expect(mockNavigate).toHaveBeenCalledWith("/products?search=runner");
  });

  it("shows an empty state message when there are no results", () => {
    renderSearch({ value: "zz" });
    fireEvent.focus(screen.getByLabelText("Search products"));
    expect(screen.getByText(/no products found/i)).toBeInTheDocument();
  });

  it("shows an error message when the search request fails", () => {
    mockUseSearchProducts.mockReturnValue({
      data: undefined,
      isFetching: false,
      isError: true,
    } as unknown as ReturnType<typeof useSearchProducts>);

    renderSearch({ value: "zz" });
    fireEvent.focus(screen.getByLabelText("Search products"));
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
  });
});
