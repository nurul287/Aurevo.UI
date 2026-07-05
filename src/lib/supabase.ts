import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

// Supabase client is kept only for Google/Facebook OAuth redirects.
// All email/password auth is handled by Aurevo.BE endpoints.
// persistSession: true is required for PKCE OAuth to work — the SDK must be
// able to store the intermediate code-verifier and exchange the ?code= param
// after the OAuth redirect. Without it, detectSessionInUrl cannot complete the
// exchange and onAuthStateChange never fires with the SIGNED_IN event.
// Our onAuthStateChange listener (use-auth-query.ts) copies the token into
// our own localStorage keys and that remains the source of truth for all API
// calls. autoRefreshToken is off because token refresh goes through our BE.
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: true,
    detectSessionInUrl: true,
  },
});
