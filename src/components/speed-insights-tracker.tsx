import { SpeedInsights } from "@vercel/speed-insights/react";
import { useLocation } from "react-router-dom";

/**
 * Reports Core Web Vitals to Vercel Speed Insights (production on Vercel only).
 * Passes the SPA route so metrics are grouped by page.
 */
export function SpeedInsightsTracker() {
  const { pathname, search } = useLocation();
  const route = `${pathname}${search}`;

  return <SpeedInsights route={route} />;
}
