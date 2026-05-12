/**
 * Supabase OAuth redirects may append `error` / `error_description` to the
 * query string, the hash, or both. Parse a user-facing message (or null).
 */
export function parseSupabaseOAuthErrorFromUrl(): string | null {
  const fromSearch = parseParams(new URLSearchParams(window.location.search));
  if (fromSearch) return fromSearch;
  const hash = window.location.hash;
  if (!hash || hash.length <= 1) return null;
  return parseParams(new URLSearchParams(hash.slice(1)));
}

function parseParams(params: URLSearchParams): string | null {
  const err = params.get("error");
  if (!err) return null;
  const rawDesc = params.get("error_description") ?? "";
  const desc = safeDecode(rawDesc);
  return humanizeOAuthError(err, desc);
}

function safeDecode(s: string): string {
  try {
    return decodeURIComponent(s.replace(/\+/g, " "));
  } catch {
    return s;
  }
}

function humanizeOAuthError(code: string, desc: string): string {
  if (desc) {
    if (/email from external provider/i.test(desc)) {
      return "We could not get an email from Facebook or Google. In Supabase → Authentication → Facebook/Google, enable allowing users without an email, or use an account that shares email.";
    }
    if (/invalid.?scope/i.test(desc)) {
      return "The social app is not allowed to request one of the sign-in permissions. Check Facebook/Google developer settings for email and public profile.";
    }
    if (desc.length < 220) return desc;
    return `${desc.slice(0, 217)}…`;
  }
  if (code === "access_denied") return "Sign-in was cancelled.";
  return `Sign-in failed (${code}). Please try again.`;
}

/** Remove OAuth error params from the current URL without a full navigation. */
export function stripSupabaseOAuthParamsFromUrl(): void {
  const url = new URL(window.location.href);
  for (const key of ["error", "error_code", "error_description"]) {
    url.searchParams.delete(key);
  }
  let hash = url.hash;
  if (hash.length > 1) {
    const hp = new URLSearchParams(hash.slice(1));
    if (hp.get("error")) {
      hash = "";
    }
  }
  url.hash = hash;
  const search = url.searchParams.toString();
  const path = `${url.pathname}${search ? `?${search}` : ""}${url.hash}`;
  window.history.replaceState({}, "", path);
}
