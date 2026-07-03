import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../breadcrumb";

describe("Breadcrumb", () => {
  it("renders a nav landmark labeled 'breadcrumb'", () => {
    render(
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Products</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    );

    expect(screen.getByRole("navigation", { name: "breadcrumb" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute("href", "/");
    expect(screen.getByText("Products")).toHaveAttribute("aria-current", "page");
  });

  it("renders a default chevron separator when no children are given", () => {
    const { container } = render(<BreadcrumbSeparator />);
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("renders the ellipsis with a 'More' label for screen readers", () => {
    render(<BreadcrumbEllipsis />);
    expect(screen.getByText("More")).toBeInTheDocument();
  });
});
