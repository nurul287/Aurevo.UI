import { render, screen } from "@testing-library/react";
import { Folder } from "lucide-react";
import { describe, expect, it } from "vitest";
import { SidebarProvider } from "@/components/ui/sidebar";
import { NavProjects } from "../nav-projects";

const PROJECTS = [{ name: "Storefront", url: "/admin/storefront", icon: Folder }];

describe("NavProjects", () => {
  it("renders each project as a link", () => {
    render(
      <SidebarProvider>
        <NavProjects projects={PROJECTS} />
      </SidebarProvider>
    );

    expect(screen.getByRole("link", { name: /Storefront/ })).toHaveAttribute(
      "href",
      "/admin/storefront"
    );
  });

  it("renders the 'Projects' group label and a trailing 'More' item", () => {
    render(
      <SidebarProvider>
        <NavProjects projects={PROJECTS} />
      </SidebarProvider>
    );

    expect(screen.getByText("Projects")).toBeInTheDocument();
    expect(screen.getAllByText("More").length).toBeGreaterThan(0);
  });
});
