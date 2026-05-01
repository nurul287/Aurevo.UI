/**
 * Best-effort message from Supabase/PostgREST RPC errors (often PostgrestError).
 */
export function getSupabaseErrorMessage(error: unknown): string {
  if (error == null) {
    return "Something went wrong. Please try again.";
  }
  if (typeof error === "object") {
    const o = error as Record<string, unknown>;
    const msg = o.message;
    if (typeof msg === "string" && msg.trim()) {
      return msg.trim();
    }
  }
  if (error instanceof Error && error.message.trim()) {
    return error.message.trim();
  }
  const s = String(error).trim();
  return s || "Something went wrong. Please try again.";
}
