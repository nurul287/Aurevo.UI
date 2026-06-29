import { supabase } from "./supabase";

const API_URL =
  (import.meta.env.VITE_API_URL as string) || "http://localhost:3001/api";

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

// ── Auth ─────────────────────────────────────────────────────────────────────

async function getToken(): Promise<string | null> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.access_token ?? null;
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

  const token = skipAuth ? null : await getToken();

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
  const token = await getToken();

  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  if (guestSessionId) headers["X-Guest-Session"] = guestSessionId;

  const res = await fetch(`${API_URL}${path}`, { method, headers, body: formData });

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
  } = {}
): Promise<T> {
  const { json, status } = await makeRequest(path, options);

  if (!json.success) throw buildError(json as never, status);

  return snakifyKeys(json.data) as T;
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
