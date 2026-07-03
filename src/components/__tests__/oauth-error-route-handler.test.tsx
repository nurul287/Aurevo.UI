import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, describe, expect, it } from "vitest";
import { OAuthErrorRouteHandler } from "../oauth-error-route-handler";

// The handler reads the OAuth error directly off the real `window.location`
// (via parseSupabaseOAuthErrorFromUrl), independent of MemoryRouter's
// virtual history — so the query string must be set on window.location too.
function renderAt(searchOrHash: string) {
  window.history.pushState({}, "", `/${searchOrHash}`);
  return render(
    <MemoryRouter initialEntries={["/"]}>
      <Routes>
        <Route
          path="/"
          element={
            <>
              <OAuthErrorRouteHandler />
              <div>Home Page</div>
            </>
          }
        />
        <Route path="/login" element={<div>Login Page</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe("OAuthErrorRouteHandler", () => {
  afterEach(() => {
    window.history.pushState({}, "", "/");
  });

  it("does nothing when there is no OAuth error in the URL", () => {
    renderAt("");
    expect(screen.getByText("Home Page")).toBeInTheDocument();
  });

  it("redirects to /login with a readable message when an OAuth error is present", () => {
    renderAt("?error=access_denied");
    expect(screen.getByText("Login Page")).toBeInTheDocument();
  });
});
