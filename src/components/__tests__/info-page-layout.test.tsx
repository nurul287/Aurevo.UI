import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { InfoPageLayout } from "../info-page-layout";

describe("InfoPageLayout", () => {
  it("renders the title, breadcrumb trail, and children", () => {
    render(
      <MemoryRouter>
        <InfoPageLayout title="Terms & Conditions" breadcrumbPage="Terms">
          <p>Body copy</p>
        </InfoPageLayout>
      </MemoryRouter>,
    );

    expect(
      screen.getByRole("heading", { name: "Terms & Conditions" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute(
      "href",
      "/",
    );
    expect(screen.getByText("Terms")).toHaveAttribute("aria-current", "page");
    expect(screen.getByText("Body copy")).toBeInTheDocument();
  });
});
