import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Toaster } from "../sonner";

describe("Toaster", () => {
  it("renders a notifications region", () => {
    render(<Toaster />);
    expect(
      document.querySelector('section[aria-label*="Notifications"]')
    ).toBeInTheDocument();
  });
});
