import { ErrorBoundary } from "@/components/error-boundary";
import { MetaPixelTracker } from "@/components/meta-pixel-tracker";
import { SpeedInsightsTracker } from "@/components/speed-insights-tracker";
import { VercelAnalyticsTracker } from "@/components/vercel-analytics-tracker";
import { AiChatWidget } from "@/components/ai-chat-widget";
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
    <ErrorBoundary>
      <Router>
      <ScrollToTop />
      <MetaPixelTracker />
      <SpeedInsightsTracker />
      <VercelAnalyticsTracker />
      <AuthProvider>
        <OAuthErrorRouteHandler />
        <OAuthSuccessLandingRedirect />
        <GuestCartProvider>
          <AppRoutes />
          <AiChatWidget />
          <Toaster richColors position="top-center" />
        </GuestCartProvider>
      </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
