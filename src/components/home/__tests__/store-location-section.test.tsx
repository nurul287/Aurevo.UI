import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StoreLocationSection } from "../store-location-section";

describe("StoreLocationSection", () => {
  it("renders the heading and store address", () => {
    render(<StoreLocationSection />);
    expect(screen.getByRole("heading", { name: "Store Location" })).toBeInTheDocument();
    expect(screen.getByText("123 Main Street, Dhaka, Bangladesh")).toBeInTheDocument();
  });
});
