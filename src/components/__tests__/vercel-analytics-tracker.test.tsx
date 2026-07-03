import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { VercelAnalyticsTracker } from "../vercel-analytics-tracker";

describe("VercelAnalyticsTracker", () => {
  it("renders without crashing on a normal route", () => {
    expect(() =>
      render(
        <MemoryRouter initialEntries={["/products"]}>
          <VercelAnalyticsTracker />
        </MemoryRouter>,
      ),
    ).not.toThrow();
  });

  it("renders without crashing on an admin route", () => {
    expect(() =>
      render(
        <MemoryRouter initialEntries={["/admin/products"]}>
          <VercelAnalyticsTracker />
        </MemoryRouter>,
      ),
    ).not.toThrow();
  });
});
