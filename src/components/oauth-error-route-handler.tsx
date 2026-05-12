import { APP_PATHS } from "@/constants/app-paths";
import {
  parseSupabaseOAuthErrorFromUrl,
  stripSupabaseOAuthParamsFromUrl,
} from "@/lib/oauth-error-url";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

/**
 * When Supabase OAuth fails it often redirects to Site URL (`/`) with error
 * query/hash. Forward that to the login screen with a readable message.
 */
export function OAuthErrorRouteHandler() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const msg = parseSupabaseOAuthErrorFromUrl();
    if (!msg) return;

    const path = location.pathname;
    if (path === APP_PATHS.login || path === APP_PATHS.register) {
      return;
    }

    stripSupabaseOAuthParamsFromUrl();
    navigate(APP_PATHS.login, { replace: true, state: { oauthError: msg } });
  }, [
    location.pathname,
    location.search,
    location.hash,
    navigate,
  ]);

  return null;
}
