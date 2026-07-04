import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LoadingIndicator, LoadingSpinner } from "../loading-spinner";

describe("LoadingSpinner", () => {
  it("renders with the default medium size", () => {
    const { container } = render(<LoadingSpinner />);
    expect(container.querySelector("svg")).toHaveClass("h-8", "w-8", "animate-spin");
  });

  it("applies the small size class", () => {
    const { container } = render(<LoadingSpinner size="sm" />);
    expect(container.querySelector("svg")).toHaveClass("h-5", "w-5");
  });

  it("applies the large size class", () => {
    const { container } = render(<LoadingSpinner size="lg" />);
    expect(container.querySelector("svg")).toHaveClass("h-10", "w-10");
  });

  it("merges a custom className", () => {
    const { container } = render(<LoadingSpinner className="text-red-500" />);
    expect(container.querySelector("svg")).toHaveClass("text-red-500");
  });

  it("is hidden from the accessibility tree", () => {
    const { container } = render(<LoadingSpinner />);
    expect(container.querySelector("svg")).toHaveAttribute("aria-hidden");
  });
});

describe("LoadingIndicator", () => {
  it("renders a status role with the default label", () => {
    render(<LoadingIndicator />);
    const status = screen.getByRole("status");
    expect(status).toBeInTheDocument();
    expect(status).toHaveTextContent("Loading");
  });

  it("renders a custom label for screen readers", () => {
    render(<LoadingIndicator label="Fetching products" />);
    expect(screen.getByText("Fetching products")).toBeInTheDocument();
  });
});
