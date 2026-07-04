import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Package } from "lucide-react";
import { describe, expect, it } from "vitest";
import { SidebarProvider } from "@/components/ui/sidebar";
import { NavMain } from "../nav-main";

const ITEMS = [
  {
    title: "Products",
    url: "/admin/products",
    icon: Package,
    isActive: true,
    items: [{ title: "All Products", url: "/admin/products" }],
  },
];

describe("NavMain", () => {
  it("renders the top-level nav item and, since isActive, its sub-items", () => {
    render(
      <SidebarProvider>
        <NavMain items={ITEMS} />
      </SidebarProvider>
    );

    expect(screen.getByText("Products")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "All Products" })).toHaveAttribute(
      "href",
      "/admin/products"
    );
  });

  it("toggles sub-items closed when the trigger is collapsed", async () => {
    const user = userEvent.setup();
    render(
      <SidebarProvider>
        <NavMain items={ITEMS} />
      </SidebarProvider>
    );

    await user.click(screen.getByText("Products"));
    expect(screen.queryByRole("link", { name: "All Products" })).not.toBeInTheDocument();
  });
});
