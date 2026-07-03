import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { useSession } from "@/services/auth/use-auth-query";
import { OAuthSuccessLandingRedirect } from "../oauth-success-landing-redirect";

vi.mock("@/services/auth/use-auth-query", () => ({
  useSession: vi.fn(),
}));

const mockUseSession = vi.mocked(useSession);

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route
          path="/"
          element={
            <>
              <OAuthSuccessLandingRedirect />
              <div>Home Page</div>
            </>
          }
        />
        <Route path="/dashboard" element={<div>Dashboard Page</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe("OAuthSuccessLandingRedirect", () => {
  it("renders nothing extra on a normal home visit with no session", () => {
    mockUseSession.mockReturnValue({
      user: null,
      isLoading: false,
    } as unknown as ReturnType<typeof useSession>);

    renderAt("/");
    expect(screen.getByText("Home Page")).toBeInTheDocument();
    expect(screen.queryByText("Signing you in…")).not.toBeInTheDocument();
  });

  it("redirects to the dashboard once a session appears after an OAuth return", () => {
    mockUseSession.mockReturnValue({
      user: { id: "user-1" },
      isLoading: false,
    } as unknown as ReturnType<typeof useSession>);

    renderAt("/?code=abc123");
    expect(screen.getByText("Dashboard Page")).toBeInTheDocument();
  });

  it("shows a handoff overlay while the session is still loading after an OAuth return", () => {
    mockUseSession.mockReturnValue({
      user: null,
      isLoading: true,
    } as unknown as ReturnType<typeof useSession>);

    renderAt("/?code=abc123");
    expect(screen.getByText("Signing you in…")).toBeInTheDocument();
  });
});
