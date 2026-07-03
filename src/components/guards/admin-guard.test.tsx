import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { useAuth } from "@/contexts/auth-context";
import AdminGuard from "./admin-guard";

vi.mock("@/contexts/auth-context", () => ({
  useAuth: vi.fn(),
}));

const mockUseAuth = vi.mocked(useAuth);

function renderAdminGuard(initialEntry = "/admin") {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/admin" element={<AdminGuard />}>
          <Route index element={<div>Admin Content</div>} />
        </Route>
        <Route path="/login" element={<div>Login Page</div>} />
        <Route path="/dashboard" element={<div>Dashboard Page</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe("AdminGuard", () => {
  it("renders a loading state while auth status is resolving", () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      isAdmin: false,
      loading: true,
    } as unknown as ReturnType<typeof useAuth>);

    const { container } = renderAdminGuard();

    expect(container.querySelector(".loading-spinner")).toBeInTheDocument();
  });

  it("redirects to /login when the user is not authenticated", () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      isAdmin: false,
      loading: false,
    } as unknown as ReturnType<typeof useAuth>);

    renderAdminGuard();

    expect(screen.getByText("Login Page")).toBeInTheDocument();
  });

  it("redirects to /dashboard when authenticated but not an admin", () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      isAdmin: false,
      loading: false,
    } as unknown as ReturnType<typeof useAuth>);

    renderAdminGuard();

    expect(screen.getByText("Dashboard Page")).toBeInTheDocument();
  });

  it("renders the protected outlet when authenticated and an admin", () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      isAdmin: true,
      loading: false,
    } as unknown as ReturnType<typeof useAuth>);

    renderAdminGuard();

    expect(screen.getByText("Admin Content")).toBeInTheDocument();
  });
});
