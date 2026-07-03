import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Separator } from "./separator";

describe("Separator", () => {
  it("defaults to a horizontal orientation", () => {
    const { container } = render(<Separator />);
    expect(container.firstChild).toHaveAttribute("data-orientation", "horizontal");
  });

  it("supports a vertical orientation", () => {
    const { container } = render(<Separator orientation="vertical" />);
    expect(container.firstChild).toHaveAttribute("data-orientation", "vertical");
  });

  it("is decorative (hidden from assistive tech) by default", () => {
    const { container } = render(<Separator />);
    expect(container.firstChild).toHaveAttribute("role", "none");
  });
});
