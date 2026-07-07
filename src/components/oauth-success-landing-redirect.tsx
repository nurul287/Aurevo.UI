import { APP_PATHS } from "@/constants/app-paths";
import { consumeOAuthLoginPending, peekOAuthLoginPending } from "@/lib/oauth-login-flag";
import { api, storeTokens } from "@/lib/api";
import { authQueryKeys } from "@/services/auth/use-auth-query";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

interface OAuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number | null;
}

/**
 * Handles the final leg of the backend-driven OAuth flow.
 * The BE callback exchanges the provider code and redirects here with
 * `?oauth_code=<one-time-code>`. We redeem it for real tokens, store them,
 * and forward to the dashboard.
 */
export function OAuthSuccessLandingRedirect() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  const onHome = location.pathname === APP_PATHS.home;
  // Capture the exchange code once on mount so we can clear it in state after use.
  const [exchangeCode] = useState(() =>
    new URLSearchParams(location.search).get("oauth_code"),
  );
  const [active, setActive] = useState(!!exchangeCode);

  const pending = onHome && peekOAuthLoginPending();
  const showHandoffOverlay = onHome && active && (!!exchangeCode || pending);

  useEffect(() => {
    if (!exchangeCode) return;

    api
      .get<OAuthTokens>(`/auth/oauth/session?code=${exchangeCode}`, { skipAuth: true, raw: true })
      .then((data) => {
        storeTokens(data as unknown as OAuthTokens);
        consumeOAuthLoginPending();
        window.history.replaceState({}, "", "/");
        queryClient.invalidateQueries({ queryKey: authQueryKeys.me });
        navigate(APP_PATHS.dashboard, { replace: true });
      })
      .catch(() => {
        consumeOAuthLoginPending();
        window.history.replaceState({}, "", "/");
        setActive(false);
      });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
