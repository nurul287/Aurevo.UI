import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { useAuth } from "@/contexts/auth-context";
import { useSession } from "@/services/auth/use-auth-query";
import GuestGuard from "./guest-guard";

vi.mock("@/contexts/auth-context", () => ({
  useAuth: vi.fn(),
}));

vi.mock("@/services/auth/use-auth-query", () => ({
  useSession: vi.fn(),
}));

const mockUseAuth = vi.mocked(useAuth);
const mockUseSession = vi.mocked(useSession);

function renderGuestGuard(initialEntry = "/login") {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/login" element={<GuestGuard />}>
          <Route index element={<div>Login Form</div>} />
        </Route>
        <Route path="/admin" element={<div>Admin Page</div>} />
        <Route path="/dashboard" element={<div>Dashboard Page</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe("GuestGuard", () => {
  it("renders a loading state while the session is resolving", () => {
    mockUseSession.mockReturnValue({
      user: null,
      isLoading: true,
    } as unknown as ReturnType<typeof useSession>);
    mockUseAuth.mockReturnValue({
      isAdmin: false,
    } as unknown as ReturnType<typeof useAuth>);

    const { container } = renderGuestGuard();

    expect(container.querySelector(".loading-spinner")).toBeInTheDocument();
  });

  it("renders the guest content when there is no session", () => {
    mockUseSession.mockReturnValue({
      user: null,
      isLoading: false,
    } as unknown as ReturnType<typeof useSession>);
    mockUseAuth.mockReturnValue({
      isAdmin: false,
    } as unknown as ReturnType<typeof useAuth>);

    renderGuestGuard();

    expect(screen.getByText("Login Form")).toBeInTheDocument();
  });

  it("redirects to /admin when logged in as an admin", () => {
    mockUseSession.mockReturnValue({
      user: { id: "user-1" },
      isLoading: false,
    } as unknown as ReturnType<typeof useSession>);
    mockUseAuth.mockReturnValue({
      isAdmin: true,
    } as unknown as ReturnType<typeof useAuth>);

    renderGuestGuard();

    expect(screen.getByText("Admin Page")).toBeInTheDocument();
  });

  it("redirects to /dashboard when logged in as a regular user", () => {
    mockUseSession.mockReturnValue({
      user: { id: "user-1" },
      isLoading: false,
    } as unknown as ReturnType<typeof useSession>);
    mockUseAuth.mockReturnValue({
      isAdmin: false,
    } as unknown as ReturnType<typeof useAuth>);

    renderGuestGuard();

    expect(screen.getByText("Dashboard Page")).toBeInTheDocument();
  });
});
