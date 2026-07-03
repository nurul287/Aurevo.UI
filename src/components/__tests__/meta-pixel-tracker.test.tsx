import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MetaPixelTracker } from "../meta-pixel-tracker";

describe("MetaPixelTracker", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("renders nothing (no noscript fallback) when the pixel is not configured", () => {
    vi.stubEnv("VITE_META_PIXEL_ID", "");
    const { container } = render(
      <MemoryRouter>
        <MetaPixelTracker />
      </MemoryRouter>
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("renders a noscript tracking pixel when configured", () => {
    vi.stubEnv("VITE_META_PIXEL_ID", "1409609890385063");
    const { container } = render(
      <MemoryRouter>
        <MetaPixelTracker />
      </MemoryRouter>
    );
    expect(container.querySelector("noscript")).toBeInTheDocument();
  });
});
