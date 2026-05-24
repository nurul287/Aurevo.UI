import {
  getMetaPixelNoscriptImageUrl,
  initMetaPixel,
  isMetaPixelEnabled,
  logMetaPixelStatus,
  shouldTrackRoute,
  trackMetaPixelPageView,
} from "@/lib/meta-pixel";
import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

/**
 * Initializes Meta Pixel and sends PageView on each client-side route change.
 * Set VITE_META_PIXEL_ID (from Meta Events Manager → Data sources → Pixel).
 */
export function MetaPixelTracker() {
  const { pathname, search } = useLocation();
  const lastPageViewKey = useRef<string | null>(null);

  useEffect(() => {
    logMetaPixelStatus();
    if (!isMetaPixelEnabled()) return;
    initMetaPixel();
  }, []);

  useEffect(() => {
    if (!isMetaPixelEnabled() || !shouldTrackRoute(pathname)) return;

    const routeKey = `${pathname}${search}`;
    // Avoid duplicate PageView when React StrictMode re-runs effects in dev.
    if (lastPageViewKey.current === routeKey) return;
    lastPageViewKey.current = routeKey;

    trackMetaPixelPageView();
  }, [pathname, search]);

  const noscriptSrc = getMetaPixelNoscriptImageUrl();
  if (!noscriptSrc) return null;

  return (
    <noscript>
      <img
        height="1"
        width="1"
        style={{ display: "none" }}
        src={noscriptSrc}
        alt=""
      />
    </noscript>
  );
}
