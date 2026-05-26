import { Analytics } from "@vercel/analytics/react";
import { useLocation } from "react-router-dom";

/**
 * Vercel Web Analytics — page views and traffic (production on Vercel only).
 * `route` groups SPA navigations by path in the dashboard.
 */
export function VercelAnalyticsTracker() {
  const { pathname, search } = useLocation();
  const route = `${pathname}${search}`;

  return (
    <Analytics
      route={route}
      beforeSend={(event) => {
        try {
          const path = new URL(event.url, window.location.origin).pathname;
          if (path.startsWith("/admin")) return null;
        } catch {
          // keep event if URL parsing fails
        }
        return event;
      }}
    />
  );
}
