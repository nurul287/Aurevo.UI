import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/auth-context";
import { AppSidebar } from "../app-sidebar";

vi.mock("@/contexts/auth-context", () => ({
  useAuth: vi.fn(),
}));

const mockUseAuth = vi.mocked(useAuth);

function renderSidebar(initialEntry = "/admin") {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <SidebarProvider>
        <AppSidebar />
      </SidebarProvider>
    </MemoryRouter>
  );
}

describe("AppSidebar", () => {
  it("shows a fallback name/initial when there is no profile yet", () => {
    mockUseAuth.mockReturnValue({
      user: { email: "admin@example.com" },
      profile: null,
      signOut: vi.fn(),
    } as unknown as ReturnType<typeof useAuth>);

    renderSidebar();
    expect(screen.getByText("Admin User")).toBeInTheDocument();
    expect(screen.getByText("admin@example.com")).toBeInTheDocument();
  });

  it("shows the user's full name from their profile", () => {
    mockUseAuth.mockReturnValue({
      user: { email: "jane@example.com" },
      profile: { first_name: "Jane", last_name: "Doe" },
      signOut: vi.fn(),
    } as unknown as ReturnType<typeof useAuth>);

    renderSidebar();
    expect(screen.getByText("Jane Doe")).toBeInTheDocument();
  });

  it("renders navigation links for every top-level section", () => {
    mockUseAuth.mockReturnValue({
      user: { email: "admin@example.com" },
      profile: null,
      signOut: vi.fn(),
    } as unknown as ReturnType<typeof useAuth>);

    renderSidebar();
    expect(screen.getByRole("link", { name: /Dashboard/ })).toHaveAttribute(
      "href",
      "/admin"
    );
    expect(screen.getByText("Orders")).toBeInTheDocument();
  });

  it("calls signOut when the sign-out button is clicked", () => {
    const signOut = vi.fn();
    mockUseAuth.mockReturnValue({
      user: { email: "admin@example.com" },
      profile: null,
      signOut,
    } as unknown as ReturnType<typeof useAuth>);

    renderSidebar();
    screen.getByText("Sign out").click();
    expect(signOut).toHaveBeenCalledTimes(1);
  });
});
