import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  useAdminProducts,
  useBulkCreateVariants,
  useProduct,
} from "@/services/product";
import { GenerateVariantsDialog } from "../generate-variants-dialog";

vi.mock("@/services/product", () => ({
  useAdminProducts: vi.fn(),
  useProduct: vi.fn(),
  useBulkCreateVariants: vi.fn(),
}));

const mockUseAdminProducts = vi.mocked(useAdminProducts);
const mockUseProduct = vi.mocked(useProduct);
const mockUseBulkCreateVariants = vi.mocked(useBulkCreateVariants);

describe("GenerateVariantsDialog", () => {
  const mutateAsync = vi.fn().mockResolvedValue([]);
  const onOpenChange = vi.fn();

  beforeEach(() => {
    mutateAsync.mockClear();
    onOpenChange.mockClear();
    mockUseAdminProducts.mockReturnValue({
      data: { data: [], count: 0, page: 1, limit: 20, totalPages: 0 },
      isFetching: false,
    } as unknown as ReturnType<typeof useAdminProducts>);
    mockUseProduct.mockReturnValue({
      data: undefined,
    } as unknown as ReturnType<typeof useProduct>);
    mockUseBulkCreateVariants.mockReturnValue({
      mutateAsync,
      isPending: false,
    } as unknown as ReturnType<typeof useBulkCreateVariants>);
  });

  it("does not render dialog content when closed", () => {
    render(
      <GenerateVariantsDialog open={false} onOpenChange={onOpenChange} />
    );
    expect(screen.queryByText("Generate Variants")).not.toBeInTheDocument();
  });

  it("renders the size and color pickers when open", () => {
    render(
      <GenerateVariantsDialog
        open
        onOpenChange={onOpenChange}
        defaultProductId="p1"
      />
    );

    expect(screen.getByText("Generate Variants")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "36" })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Color name/)).toBeInTheDocument();
  });

  it("disables the Generate button until sizes, a color, and stock are set", () => {
    render(
      <GenerateVariantsDialog
        open
        onOpenChange={onOpenChange}
        defaultProductId="p1"
      />
    );
    expect(screen.getByRole("button", { name: "Generate" })).toBeDisabled();
  });

  it("builds a preview and enables Generate once size + color + stock are filled in", () => {
    render(
      <GenerateVariantsDialog
        open
        onOpenChange={onOpenChange}
        defaultProductId="p1"
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "40" }));
    fireEvent.change(screen.getByPlaceholderText(/Color name/), {
      target: { value: "Black" },
    });
    fireEvent.change(screen.getByLabelText(/Initial stock per variant/), {
      target: { value: "10" },
    });

    expect(screen.getByText("Black / 40")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Generate 1 variant" })
    ).toBeEnabled();
  });

  it("submits the expected variant payload and closes on success", async () => {
    render(
      <GenerateVariantsDialog
        open
        onOpenChange={onOpenChange}
        defaultProductId="p1"
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "40" }));
    fireEvent.change(screen.getByPlaceholderText(/Color name/), {
      target: { value: "Black" },
    });
    fireEvent.change(screen.getByLabelText(/Initial stock per variant/), {
      target: { value: "10" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Generate 1 variant" }));

    expect(mutateAsync).toHaveBeenCalledWith({
      product_id: "p1",
      variants: [
        expect.objectContaining({
          name: "Black / 40",
          size: "40",
          color: "Black",
          initial_stock: 10,
        }),
      ],
    });
  });
});
