import { OAuthErrorRouteHandler } from "@/components/oauth-error-route-handler";
import { OAuthSuccessLandingRedirect } from "@/components/oauth-success-landing-redirect";
import { useEffect } from "react";
import { BrowserRouter as Router, useLocation } from "react-router-dom";
import { Toaster } from "./components/ui/sonner";
import { AuthProvider } from "./contexts/auth-context";
import { GuestCartProvider } from "./contexts/guest-cart-context";
import AppRoutes from "./routes";
import "./App.css";

/** Reset window scroll on route changes (Router does not do this by default). */
function ScrollToTop() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname, search]);

  return null;
}

function App() {
  return (
    <Router>
      <ScrollToTop />
      <AuthProvider>
        <OAuthErrorRouteHandler />
        <OAuthSuccessLandingRedirect />
        <GuestCartProvider>
          <AppRoutes />
          <Toaster richColors position="top-right" />
        </GuestCartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
