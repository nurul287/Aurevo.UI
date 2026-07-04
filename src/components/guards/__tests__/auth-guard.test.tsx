import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { useAuth } from "@/contexts/auth-context";
import AuthGuard from "../auth-guard";

vi.mock("@/contexts/auth-context", () => ({
  useAuth: vi.fn(),
}));

const mockUseAuth = vi.mocked(useAuth);

function renderAuthGuard(initialEntry = "/protected") {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/protected" element={<AuthGuard />}>
          <Route index element={<div>Protected Content</div>} />
        </Route>
        <Route path="/login" element={<div>Login Page</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe("AuthGuard", () => {
  it("renders a loading state while auth status is resolving", () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      loading: true,
    } as unknown as ReturnType<typeof useAuth>);

    const { container } = renderAuthGuard();

    expect(container.querySelector(".loading-spinner")).toBeInTheDocument();
    expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
  });

  it("redirects to /login when the user is not authenticated", () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      loading: false,
    } as unknown as ReturnType<typeof useAuth>);

    renderAuthGuard();

    expect(screen.getByText("Login Page")).toBeInTheDocument();
    expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
  });

  it("renders the protected outlet when the user is authenticated", () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      loading: false,
    } as unknown as ReturnType<typeof useAuth>);

    renderAuthGuard();

    expect(screen.getByText("Protected Content")).toBeInTheDocument();
  });
});
