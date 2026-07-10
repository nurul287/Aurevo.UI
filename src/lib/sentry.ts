import * as Sentry from "@sentry/react";

const dsn = import.meta.env.VITE_SENTRY_DSN as string | undefined;

/**
 * Error tracking. No-op unless VITE_SENTRY_DSN is set (prod on Vercel) — local
 * dev without the env var sends nothing.
 */
export function initSentry() {
  if (!dsn) return;

  Sentry.init({
    dsn,
    environment: import.meta.env.MODE,
    integrations: [Sentry.replayIntegration()],
    // Record 10% of normal sessions, 100% of sessions that hit an error
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
  });
}

export { Sentry };
