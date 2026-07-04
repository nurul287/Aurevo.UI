import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CategoryImageField } from "../category-image-field";

function makeImageFile(name = "cover.png") {
  return new File(["fake-bytes"], name, { type: "image/png" });
}

describe("CategoryImageField", () => {
  it("shows the placeholder prompt when there is no file or existing image", () => {
    render(<CategoryImageField file={null} onFileChange={vi.fn()} />);
    expect(
      screen.getByText("Drag and drop an image here, or click to browse")
    ).toBeInTheDocument();
  });

  it("shows the existing image preview when provided", () => {
    const { container } = render(
      <CategoryImageField
        file={null}
        existingUrl="https://example.com/cover.png"
        onFileChange={vi.fn()}
      />
    );
    // Decorative image (alt="") — not exposed under the "img" role.
    expect(container.querySelector("img")).toHaveAttribute(
      "src",
      "https://example.com/cover.png"
    );
  });

  it("calls onFileChange when a file is selected via the input", () => {
    const onFileChange = vi.fn();
    render(<CategoryImageField file={null} onFileChange={onFileChange} />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = makeImageFile();
    fireEvent.change(input, { target: { files: [file] } });

    expect(onFileChange).toHaveBeenCalledWith(file);
  });

  it("shows a Remove button once a file or existing image is present", () => {
    render(
      <CategoryImageField
        file={makeImageFile()}
        onFileChange={vi.fn()}
      />
    );
    expect(screen.getByRole("button", { name: /Remove/ })).toBeInTheDocument();
  });

  it("clears the file when Remove is clicked", () => {
    const onFileChange = vi.fn();
    render(<CategoryImageField file={makeImageFile()} onFileChange={onFileChange} />);

    fireEvent.click(screen.getByRole("button", { name: /Remove/ }));
    expect(onFileChange).toHaveBeenCalledWith(null);
  });

  it("disables the choose-file button when disabled", () => {
    render(<CategoryImageField file={null} onFileChange={vi.fn()} disabled />);
    expect(screen.getByRole("button", { name: /Choose file/ })).toBeDisabled();
  });
});
