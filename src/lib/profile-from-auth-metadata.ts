/** Map Supabase Auth `user_metadata` (OAuth or email signup) onto profile columns. */
export function buildProfileFieldsFromUserMetadata(
  meta: Record<string, unknown>,
): {
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
} {
  const directFirst =
    meta.first_name ?? meta.given_name ?? meta.firstName;
  const directLast =
    meta.last_name ?? meta.family_name ?? meta.lastName;

  if (typeof directFirst === "string" || typeof directLast === "string") {
    return {
      first_name:
        typeof directFirst === "string" ? directFirst.trim() : undefined,
      last_name: typeof directLast === "string" ? directLast.trim() : undefined,
      avatar_url: pickAvatar(meta),
    };
  }

  const full = String(meta.full_name ?? meta.name ?? "").trim();
  if (!full) {
    return { avatar_url: pickAvatar(meta) };
  }
  const parts = full.split(/\s+/);
  return {
    first_name: parts[0],
    last_name: parts.length > 1 ? parts.slice(1).join(" ") : undefined,
    avatar_url: pickAvatar(meta),
  };
}

function pickAvatar(meta: Record<string, unknown>): string | undefined {
  if (typeof meta.avatar_url === "string" && meta.avatar_url.trim())
    return meta.avatar_url.trim();
  if (typeof meta.picture === "string" && meta.picture.trim())
    return meta.picture.trim();
  return undefined;
}
