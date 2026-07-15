export const API_URL =
  (import.meta.env.VITE_API_URL as string) || "http://localhost:5000/api";

export interface ApiError extends Error {
  code?: string;
  status?: number;
  details?: unknown;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiListResult<T> {
  data: T[];
  pagination: PaginationMeta;
}

// ── Token helpers ─────────────────────────────────────────────────────────────

export const TOKEN_KEYS = {
  accessToken: "aurevo_access_token",
  refreshToken: "aurevo_refresh_token",
  expiresAt: "aurevo_token_expires_at",
} as const;

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEYS.accessToken);
}

export function storeTokens(tokens: {
  accessToken: string;
  refreshToken: string;
  expiresAt?: number | null;
}) {
  localStorage.setItem(TOKEN_KEYS.accessToken, tokens.accessToken);
  localStorage.setItem(TOKEN_KEYS.refreshToken, tokens.refreshToken);
  if (tokens.expiresAt != null) {
    localStorage.setItem(TOKEN_KEYS.expiresAt, String(tokens.expiresAt));
  }
}

export function clearStoredTokens() {
  localStorage.removeItem(TOKEN_KEYS.accessToken);
  localStorage.removeItem(TOKEN_KEYS.refreshToken);
  localStorage.removeItem(TOKEN_KEYS.expiresAt);
}

// ── Key conversion ──────────────────────────────────────────────────────────
// The BE returns camelCase; the FE was built against Supabase PostgREST
// which returns snake_case. Convert every response key to snake_case so
// existing component code works without changes.

function camelToSnake(str: string): string {
  return str.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);
}

function snakifyKeys(val: unknown): unknown {
  if (Array.isArray(val)) return val.map(snakifyKeys);
  if (val !== null && typeof val === "object") {
    return Object.fromEntries(
      Object.entries(val as Record<string, unknown>).map(([k, v]) => [
        camelToSnake(k),
        snakifyKeys(v),
      ])
    );
  }
  return val;
}

// ── Error ────────────────────────────────────────────────────────────────────

function buildError(
  json: { error?: { code?: string; message?: string; details?: unknown } },
  status: number
): ApiError {
  const err = new Error(json.error?.message ?? "API error") as ApiError;
  err.code = json.error?.code;
  err.status = status;
  err.details = json.error?.details;
  return err;
}

// ── Token refresh ─────────────────────────────────────────────────────────────

let refreshPromise: Promise<string | null> | null = null;

async function tryRefreshToken(): Promise<string | null> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    const refreshToken = localStorage.getItem(TOKEN_KEYS.refreshToken);
    if (!refreshToken) return null;

    try {
      const res = await fetch(`${API_URL}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });
      if (!res.ok) {
        clearStoredTokens();
        return null;
      }
      const json = await res.json();
      if (!json.success || !json.data?.accessToken) {
        clearStoredTokens();
        return null;
      }
      storeTokens({
        accessToken: json.data.accessToken,
        refreshToken: json.data.refreshToken,
        expiresAt: json.data.expiresAt,
      });
      return json.data.accessToken as string;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

// ── Core fetch ───────────────────────────────────────────────────────────────

async function makeRequest(
  path: string,
  options: {
    method?: string;
    body?: unknown;
    guestSessionId?: string;
    skipAuth?: boolean;
  } = {}
): Promise<{ json: Record<string, unknown>; status: number }> {
  const { method = "GET", body, guestSessionId, skipAuth = false } = options;

  const doFetch = async (token: string | null) => {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    if (guestSessionId) headers["X-Guest-Session"] = guestSessionId;

    const res = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    if (res.status === 204) return { json: { success: true, data: undefined }, status: 204 };
    const json = await res.json();
    return { json, status: res.status };
  };

  const token = skipAuth ? null : getStoredToken();
  const result = await doFetch(token);

  // Auto-refresh on 401 (token expired)
  if (result.status === 401 && !skipAuth && token) {
    const newToken = await tryRefreshToken();
    if (newToken) return doFetch(newToken);
  }

  return result;
}

/**
 * Send a multipart/form-data request (file uploads). No Content-Type header —
 * the browser sets it with the correct boundary automatically.
 */
export async function apiFetchForm<T>(
  path: string,
  options: {
    method?: string;
    formData: FormData;
    guestSessionId?: string;
  }
): Promise<T> {
  const { method = "POST", formData, guestSessionId } = options;

  const doFetch = async (token: string | null) => {
    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;
    if (guestSessionId) headers["X-Guest-Session"] = guestSessionId;
    return fetch(`${API_URL}${path}`, { method, headers, body: formData });
  };

  const token = getStoredToken();
  let res = await doFetch(token);

  if (res.status === 401 && token) {
    const newToken = await tryRefreshToken();
    if (newToken) res = await doFetch(newToken);
  }

  if (res.status === 204) return undefined as T;
  const json = await res.json();
  if (!json.success) throw buildError(json, res.status);
  return snakifyKeys(json.data) as T;
}

/**
 * Fetch a single resource (or perform a mutation that returns a single object).
 * Response keys are converted camelCase → snake_case to match FE types.
 */
export async function apiFetch<T>(
  path: string,
  options: {
    method?: string;
    body?: unknown;
    guestSessionId?: string;
    skipAuth?: boolean;
    /** Skip camelCase → snake_case conversion. Use for endpoints (e.g. auth
     * token responses) whose consumers expect the BE's raw camelCase shape. */
    raw?: boolean;
  } = {}
): Promise<T> {
  const { json, status } = await makeRequest(path, options);

  if (!json.success) throw buildError(json as never, status);

  return (options.raw ? json.data : snakifyKeys(json.data)) as T;
}

/**
 * Fetch a paginated list. Returns `{ data, pagination }`.
 * Response keys are converted camelCase → snake_case.
 */
export async function apiFetchList<T>(
  path: string,
  options: {
    guestSessionId?: string;
    skipAuth?: boolean;
  } = {}
): Promise<ApiListResult<T>> {
  const { json, status } = await makeRequest(path, { ...options, method: "GET" });

  if (!json.success) throw buildError(json as never, status);

  const meta = (json.meta as Record<string, unknown>)?.pagination as PaginationMeta | undefined;

  return {
    data: (snakifyKeys(json.data) as T[]),
    pagination: meta ?? {
      page: 1,
      limit: (json.data as unknown[])?.length ?? 0,
      total: (json.data as unknown[])?.length ?? 0,
      totalPages: 1,
    },
  };
}

/**
 * Fetch a binary response (e.g. a server-generated .xlsx export) and trigger
 * a browser download. Filename is read from the server's Content-Disposition
 * header — the server owns the naming, not the client.
 */
export async function apiDownloadFile(path: string): Promise<void> {
  const token = getStoredToken();
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { headers });

  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw buildError(json as never, res.status);
  }

  const disposition = res.headers.get("Content-Disposition") ?? "";
  const match = disposition.match(/filename="?([^"]+)"?/);
  const filename = match?.[1] ?? "download";

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

/** Convenience wrappers */
export const api = {
  get: <T>(path: string, opts?: Parameters<typeof apiFetch>[1]) =>
    apiFetch<T>(path, { ...opts, method: "GET" }),
  post: <T>(path: string, body?: unknown, opts?: Parameters<typeof apiFetch>[1]) =>
    apiFetch<T>(path, { ...opts, method: "POST", body }),
  patch: <T>(path: string, body?: unknown, opts?: Parameters<typeof apiFetch>[1]) =>
    apiFetch<T>(path, { ...opts, method: "PATCH", body }),
  put: <T>(path: string, body?: unknown, opts?: Parameters<typeof apiFetch>[1]) =>
    apiFetch<T>(path, { ...opts, method: "PUT", body }),
  delete: <T>(path: string, opts?: Parameters<typeof apiFetch>[1]) =>
    apiFetch<T>(path, { ...opts, method: "DELETE" }),
  list: <T>(path: string, opts?: Parameters<typeof apiFetchList>[1]) =>
    apiFetchList<T>(path, opts),
};
