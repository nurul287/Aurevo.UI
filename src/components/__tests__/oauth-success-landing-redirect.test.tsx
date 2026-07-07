import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "@/test/msw/server";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { OAuthSuccessLandingRedirect } from "../oauth-success-landing-redirect";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function renderAt(path: string) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
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
    </QueryClientProvider>,
  );
}

describe("OAuthSuccessLandingRedirect", () => {
  it("renders nothing extra on a normal home visit", () => {
    renderAt("/");
    expect(screen.getByText("Home Page")).toBeInTheDocument();
    expect(screen.queryByText("Signing you in…")).not.toBeInTheDocument();
  });

  it("shows a handoff overlay immediately when ?oauth_code= is present", () => {
    server.use(
      // Never resolve — keeps the component in the redeeming state
      http.get(`${API_URL}/auth/oauth/session`, () => new Promise(() => {})),
    );

    renderAt("/?oauth_code=one-time-code");
    expect(screen.getByText("Signing you in…")).toBeInTheDocument();
  });

  it("redeems the exchange code and redirects to dashboard on success", async () => {
    server.use(
      http.get(`${API_URL}/auth/oauth/session`, () =>
        HttpResponse.json({
          success: true,
          data: { accessToken: "tok-access", refreshToken: "tok-refresh", expiresAt: 9999999999 },
        }),
      ),
    );

    renderAt("/?oauth_code=one-time-code");

    await waitFor(() =>
      expect(screen.getByText("Dashboard Page")).toBeInTheDocument(),
    );
  });

  it("cleans the URL and does not crash when exchange code redemption fails", async () => {
    server.use(
      http.get(`${API_URL}/auth/oauth/session`, () =>
        HttpResponse.json({ success: false }, { status: 400 }),
      ),
    );

    renderAt("/?oauth_code=bad-code");

    // After the failed request the overlay disappears and home page is shown
    await waitFor(() =>
      expect(screen.queryByText("Signing you in…")).not.toBeInTheDocument(),
    );
    expect(screen.getByText("Home Page")).toBeInTheDocument();
  });
});
