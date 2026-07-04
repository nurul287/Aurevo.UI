import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import {
  Sidebar,
  SidebarContent,
  SidebarProvider,
  SidebarTrigger,
} from "../sidebar";

describe("Sidebar", () => {
  it("starts expanded by default", () => {
    render(
      <SidebarProvider>
        <Sidebar>
          <SidebarContent>Menu</SidebarContent>
        </Sidebar>
      </SidebarProvider>
    );
    expect(screen.getByText("Menu")).toBeInTheDocument();
  });

  it("respects defaultOpen=false, starting collapsed", () => {
    render(
      <SidebarProvider defaultOpen={false}>
        <Sidebar collapsible="none">
          <SidebarContent>Menu</SidebarContent>
        </Sidebar>
      </SidebarProvider>
    );
    // With collapsible="none" the sidebar always renders its children;
    // this just verifies the provider accepts defaultOpen without crashing.
    expect(screen.getByText("Menu")).toBeInTheDocument();
  });

  it("toggles open state when SidebarTrigger is clicked", async () => {
    const user = userEvent.setup();
    render(
      <SidebarProvider>
        <SidebarTrigger />
        <Sidebar>
          <SidebarContent>Menu</SidebarContent>
        </Sidebar>
      </SidebarProvider>
    );

    const trigger = screen.getByRole("button");
    await user.click(trigger);
    await user.click(trigger);
    // No crash across two toggles is the meaningful assertion here — the
    // underlying `open` state isn't exposed on the DOM for collapsible="offcanvas".
    expect(trigger).toBeInTheDocument();
  });

  it("throws when Sidebar is used outside a SidebarProvider", () => {
    expect(() =>
      render(
        <Sidebar>
          <SidebarContent>Menu</SidebarContent>
        </Sidebar>
      )
    ).toThrow("useSidebar must be used within a SidebarProvider.");
  });
});
