import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/auth-context";
import { NavUser } from "../nav-user";

vi.mock("@/contexts/auth-context", () => ({
  useAuth: vi.fn(),
}));

const mockUseAuth = vi.mocked(useAuth);

const USER = { name: "Jane Doe", email: "jane@example.com", avatar: "" };

describe("NavUser", () => {
  it("renders the user's name and email", () => {
    mockUseAuth.mockReturnValue({
      signOut: vi.fn(),
    } as unknown as ReturnType<typeof useAuth>);

    render(
      <SidebarProvider>
        <NavUser user={USER} />
      </SidebarProvider>
    );
    expect(screen.getAllByText("Jane Doe")[0]).toBeInTheDocument();
    expect(screen.getAllByText("jane@example.com")[0]).toBeInTheDocument();
  });

  it("opens the account menu with a Log out option", async () => {
    mockUseAuth.mockReturnValue({
      signOut: vi.fn(),
    } as unknown as ReturnType<typeof useAuth>);

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

  it("calls signOut when Log out is clicked", async () => {
    const signOut = vi.fn();
    mockUseAuth.mockReturnValue({
      signOut,
    } as unknown as ReturnType<typeof useAuth>);

    const user = userEvent.setup();
    render(
      <SidebarProvider>
        <NavUser user={USER} />
      </SidebarProvider>
    );

    await user.click(screen.getAllByText("Jane Doe")[0]);
    await user.click(screen.getByText("Log out"));
    expect(signOut).toHaveBeenCalledTimes(1);
  });
});
