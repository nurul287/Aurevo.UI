import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  useAdminProducts,
  useBulkUploadProductImages,
  useProductVariants,
} from "@/services/product";
import { BulkImageUploadDialog } from "../bulk-image-upload-dialog";

vi.mock("@/services/product", () => ({
  useAdminProducts: vi.fn(),
  useProductVariants: vi.fn(),
  useBulkUploadProductImages: vi.fn(),
}));

const mockUseAdminProducts = vi.mocked(useAdminProducts);
const mockUseProductVariants = vi.mocked(useProductVariants);
const mockUseBulkUploadProductImages = vi.mocked(useBulkUploadProductImages);

function makeImageFile(name = "photo.png", type = "image/png", size = 1024) {
  const file = new File([new Uint8Array(size)], name, { type });
  return file;
}

describe("BulkImageUploadDialog", () => {
  const mutateAsync = vi.fn().mockResolvedValue(undefined);
  const onOpenChange = vi.fn();

  beforeEach(() => {
    mutateAsync.mockClear();
    onOpenChange.mockClear();
    mockUseAdminProducts.mockReturnValue({
      data: { data: [], count: 0, page: 1, limit: 20, totalPages: 0 },
      isFetching: false,
    } as unknown as ReturnType<typeof useAdminProducts>);
    mockUseProductVariants.mockReturnValue({
      data: [],
      isLoading: false,
    } as unknown as ReturnType<typeof useProductVariants>);
    mockUseBulkUploadProductImages.mockReturnValue({
      mutateAsync,
      isPending: false,
    } as unknown as ReturnType<typeof useBulkUploadProductImages>);
  });

  it("does not render dialog content when closed", () => {
    render(<BulkImageUploadDialog open={false} onOpenChange={onOpenChange} />);
    expect(screen.queryByText("Bulk Upload Images")).not.toBeInTheDocument();
  });

  it("renders the drop zone when open", () => {
    render(
      <BulkImageUploadDialog open onOpenChange={onOpenChange} defaultProductId="p1" />
    );
    expect(screen.getByText("Bulk Upload Images")).toBeInTheDocument();
    expect(screen.getByText(/Drop images here/)).toBeInTheDocument();
  });

  it("keeps the Upload button disabled until a file is queued", () => {
    render(
      <BulkImageUploadDialog open onOpenChange={onOpenChange} defaultProductId="p1" />
    );
    expect(screen.getByRole("button", { name: "Upload" })).toBeDisabled();
  });

  it("queues a valid image file and enables the Upload button", () => {
    render(
      <BulkImageUploadDialog open onOpenChange={onOpenChange} defaultProductId="p1" />
    );

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = makeImageFile();
    fireEvent.change(input, { target: { files: [file] } });

    expect(screen.getByText("photo.png")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Upload 1 image" })).toBeEnabled();
  });

  it("rejects a file with a disallowed MIME type", () => {
    render(
      <BulkImageUploadDialog open onOpenChange={onOpenChange} defaultProductId="p1" />
    );

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = makeImageFile("doc.pdf", "application/pdf");
    fireEvent.change(input, { target: { files: [file] } });

    expect(screen.getByText(/not allowed/)).toBeInTheDocument();
  });

  it("submits the queued file to the upload mutation", async () => {
    render(
      <BulkImageUploadDialog open onOpenChange={onOpenChange} defaultProductId="p1" />
    );

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [makeImageFile()] } });

    fireEvent.click(screen.getByRole("button", { name: "Upload 1 image" }));

    expect(mutateAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        product_id: "p1",
        variant_ids: [],
        items: [expect.objectContaining({ is_primary: false, sort_order: 0 })],
      })
    );
  });
});
