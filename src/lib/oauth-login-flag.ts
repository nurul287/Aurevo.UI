const OAUTH_LOGIN_PENDING_KEY = "aurevo_oauth_login_pending";

/** Call right before redirecting to the IdP so we can detect return to `/` after Supabase strips tokens from the URL. */
export function markOAuthLoginPending() {
  try {
    sessionStorage.setItem(OAUTH_LOGIN_PENDING_KEY, "1");
  } catch {
    /* ignore */
  }
}

export function peekOAuthLoginPending(): boolean {
  try {
    return sessionStorage.getItem(OAUTH_LOGIN_PENDING_KEY) === "1";
  } catch {
    return false;
  }
}

export function consumeOAuthLoginPending(): boolean {
  try {
    const v = sessionStorage.getItem(OAUTH_LOGIN_PENDING_KEY);
    if (v) sessionStorage.removeItem(OAUTH_LOGIN_PENDING_KEY);
    return v === "1";
  } catch {
    return false;
  }
}
