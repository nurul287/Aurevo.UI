import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { SidebarProvider } from "@/components/ui/sidebar";
import { NavUser } from "../nav-user";

const USER = { name: "Jane Doe", email: "jane@example.com", avatar: "" };

describe("NavUser", () => {
  it("renders the user's name and email", () => {
    render(
      <SidebarProvider>
        <NavUser user={USER} />
      </SidebarProvider>
    );
    expect(screen.getAllByText("Jane Doe")[0]).toBeInTheDocument();
    expect(screen.getAllByText("jane@example.com")[0]).toBeInTheDocument();
  });

  it("opens the account menu with a Log out option", async () => {
    const user = userEvent.setup();
    render(
      <SidebarProvider>
        <NavUser user={USER} />
      </SidebarProvider>
    );

    await user.click(screen.getAllByText("Jane Doe")[0]);
    expect(screen.getByText("Log out")).toBeInTheDocument();
    expect(screen.getByText("Billing")).toBeInTheDocument();
  });
});
