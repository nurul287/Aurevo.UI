import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { useAdminProducts } from "@/services/product";
import { ProductCombobox } from "../product-combobox";

vi.mock("@/services/product", () => ({
  useAdminProducts: vi.fn(),
}));

const mockUseAdminProducts = vi.mocked(useAdminProducts);

describe("ProductCombobox", () => {
  it("shows 'All Products' when value is 'all'", () => {
    mockUseAdminProducts.mockReturnValue({
      data: { data: [], count: 0, page: 1, limit: 20, totalPages: 0 },
      isFetching: false,
    } as unknown as ReturnType<typeof useAdminProducts>);

    render(<ProductCombobox value="all" onChange={vi.fn()} />);
    expect(screen.getByRole("combobox")).toHaveTextContent("All Products");
  });

  it("opens the product list on click and selects a product", async () => {
    const user = userEvent.setup();
    mockUseAdminProducts.mockReturnValue({
      data: {
        data: [{ id: "p1", name: "Air Runner" }],
        count: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
      },
      isFetching: false,
    } as unknown as ReturnType<typeof useAdminProducts>);

    const onChange = vi.fn();
    render(<ProductCombobox value="all" onChange={onChange} />);

    await user.click(screen.getByRole("combobox"));
    await user.click(screen.getByText("Air Runner"));

    expect(onChange).toHaveBeenCalledWith("p1");
  });

  it("shows a 'no products found' message when the list is empty", async () => {
    const user = userEvent.setup();
    mockUseAdminProducts.mockReturnValue({
      data: { data: [], count: 0, page: 1, limit: 20, totalPages: 0 },
      isFetching: false,
    } as unknown as ReturnType<typeof useAdminProducts>);

    render(<ProductCombobox value="all" onChange={vi.fn()} />);
    await user.click(screen.getByRole("combobox"));

    expect(screen.getByText("No products found")).toBeInTheDocument();
  });
});
