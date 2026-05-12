import { APP_PATHS } from "@/constants/app-paths";
import {
  consumeOAuthLoginPending,
  peekOAuthLoginPending,
} from "@/lib/oauth-login-flag";
import { useSession } from "@/services/auth/use-auth-query";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

/**
 * After OAuth, Supabase may send users to Site URL (`/`). Home is not under
 * GuestGuard, so they can stay on the landing page while signed in. If the URL
 * still has OAuth tokens, or we marked an OAuth attempt in sessionStorage,
 * send them to the dashboard as soon as the **session** is ready (do not wait
 * for `profiles` — that was causing a ~1s flash of the marketing home page).
 */
export function OAuthSuccessLandingRedirect() {
  const { user, isLoading: sessionLoading } = useSession();
  const navigate = useNavigate();
  const location = useLocation();

  const onHome = location.pathname === APP_PATHS.home;
  const search = new URLSearchParams(location.search);
  const hash = location.hash;
  const looksLikeOAuthReturn =
    search.has("code") ||
    hash.includes("access_token") ||
    hash.includes("code=");
  const pending = onHome && peekOAuthLoginPending();
  const showHandoffOverlay =
    onHome && (pending || looksLikeOAuthReturn) && sessionLoading;

  useEffect(() => {
    if (sessionLoading || location.pathname !== APP_PATHS.home) return;

    const looksLike =
      new URLSearchParams(location.search).has("code") ||
      location.hash.includes("access_token") ||
      location.hash.includes("code=");

    const isPending = peekOAuthLoginPending();

    if (!looksLike && !isPending) return;

    if (!user) {
      if (isPending && !looksLike) {
        consumeOAuthLoginPending();
      }
      return;
    }

    consumeOAuthLoginPending();
    navigate(APP_PATHS.dashboard, { replace: true });
  }, [
    sessionLoading,
    user,
    location.pathname,
    location.search,
    location.hash,
    navigate,
  ]);

  if (!showHandoffOverlay) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-3 bg-background/95 text-muted-foreground"
      aria-live="polite"
      aria-busy="true"
    >
      <Loader2 className="h-10 w-10 animate-spin text-foreground" />
      <p className="text-sm font-medium text-foreground">Signing you in…</p>
    </div>
  );
}
