import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { SpeedInsightsTracker } from "../speed-insights-tracker";

describe("SpeedInsightsTracker", () => {
  it("renders without crashing", () => {
    expect(() =>
      render(
        <MemoryRouter initialEntries={["/products"]}>
          <SpeedInsightsTracker />
        </MemoryRouter>
      )
    ).not.toThrow();
  });
});
