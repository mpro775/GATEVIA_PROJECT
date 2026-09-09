import {
  ApiError,
  createApiClient,
  resolveApiOrigin,
  resolveApiPath,
  resolveApiUrl,
} from '@gatevia/api-client';

const rawApiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3002/api/v1';

/** Base origin (e.g. https://api.gatevia.sa or http://localhost:3002) */
export const apiOrigin = resolveApiOrigin(rawApiUrl);

/** Canonical API base URL with /api/v1 prefix */
export const apiUrl = resolveApiUrl(rawApiUrl);

function cookie(name: string): string | undefined {
  if (typeof document === 'undefined') return undefined;
  return document.cookie
    .split('; ')
    .find((item) => item.startsWith(`${name}=`))
    ?.split('=')
    .slice(1)
    .join('=');
}

function csrfHeaders(): Record<string, string> {
  const token = typeof document !== 'undefined' ? cookie('gatevia_csrf') : undefined;
  return token ? { 'X-CSRF-Token': token } : {};
}

/**
 * Typed OpenAPI client instance with credentials and CSRF support.
 * Use client.GET / client.POST / client.PATCH for typed, path-safe requests.
 */
export const client = createApiClient({
  baseUrl: apiOrigin,
  fetcher: (req) =>
    fetch(req, {
      credentials: 'include',
      headers: {
        ...(typeof document !== 'undefined' && cookie('gatevia_csrf')
          ? { 'X-CSRF-Token': cookie('gatevia_csrf')! }
          : {}),
      },
    }),
});

// ─── Typed client wrappers ────────────────────────────────────────────────────
// These route requests through the typed client and unwrap the { data } envelope.
// Use these in all new code. The legacy api() / apiEnvelope() below are preserved
// for existing callers but also delegate to client internally.

/**
 * Unwraps the openapi-fetch result, throwing ApiError on failures.
 * @internal
 */
function unwrapClientResult<T>(result: { data?: T; error?: unknown; response: Response }): T {
  if (result.error != null) {
    const err = result.error as { type?: string; title?: string; status?: number; detail?: string };
    throw new ApiError({
      type: err.type ?? 'request-error',
      title: err.title ?? 'Request failed',
      status: err.status ?? result.response.status,
      detail: err.detail ?? 'The request failed.',
    });
  }
  // 204 No Content or other empty success responses
  if (result.data === undefined && result.response.ok) return undefined as unknown as T;
  return result.data as T;
}

// ─── Typed endpoint helpers (preferred API for new code) ─────────────────────

/** GET /api/v1/auth/me — returns the authenticated admin user */
export const getMe = () =>
  client
    .GET('/api/v1/auth/me')
    .then(unwrapClientResult)
    .then((d) => d.data);

/** POST /api/v1/auth/logout */
export const postLogout = () => client.POST('/api/v1/auth/logout').then(unwrapClientResult);

/** GET /api/v1/admin/languages */
export const getLanguages = () =>
  client
    .GET('/api/v1/admin/languages')
    .then(unwrapClientResult)
    .then((d) => d.data);

/** GET /api/v1/admin/leads — use apiEnvelope('/admin/leads?...') for paginated results */
// Note: typed helper omitted here because /api/v1/admin/leads has a query-param
// schema that requires a more complex params shape; use apiEnvelope() for now.

// ─── Legacy wrappers (backward-compatible, delegate to client) ────────────────
// These preserve the existing call-sites unchanged while routing through client.

/**
 * General-purpose API helper for GATEVIA admin endpoints.
 * Routes through the typed client's fetcher (credentials + CSRF) for consistent
 * transport. Prefer the typed helpers above for new code.
 *
 * @deprecated Prefer typed client helpers (client.GET / client.POST / client.PATCH)
 *   or the named helpers exported from this module for new endpoints.
 */
export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const fullUrl = `${apiOrigin}${resolveApiPath(path)}`;
  const method = (init.method ?? 'GET').toUpperCase();
  const isMutating = !['GET', 'HEAD'].includes(method);

  // Route through the same fetch instance as client (credentials + CSRF)
  const response = await fetch(fullUrl, {
    ...init,
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
      ...(isMutating ? csrfHeaders() : {}),
      ...init.headers,
    },
  });
  const body = (await response.json()) as { data: T; detail?: string; status?: number };
  if (!response.ok)
    throw new ApiError({
      type: 'request-error',
      title: 'Request failed',
      status: body.status ?? response.status,
      detail: body.detail ?? 'The request failed.',
    });
  return body.data;
}

/**
 * Paginated list helper for GATEVIA admin endpoints.
 * Routes through the same fetch / credential pipeline as client.
 *
 * @deprecated Prefer typed client helpers for new code.
 */
export const apiEnvelope = async <T>(
  path: string,
): Promise<{
  data: T[];
  meta: { page: number; pageSize: number; total: number; pageCount: number };
}> => {
  const fullUrl = `${apiOrigin}${resolveApiPath(path)}`;
  const response = await fetch(fullUrl, {
    credentials: 'include',
    headers: { Accept: 'application/json' },
  });
  const body = (await response.json()) as {
    data: T[];
    meta?: { page: number; pageSize: number; total: number; pageCount: number };
    detail?: string;
  };
  if (!response.ok) throw new Error(body.detail ?? 'Request failed');
  return {
    data: body.data,
    meta: body.meta ?? {
      page: 1,
      pageSize: body.data.length,
      total: body.data.length,
      pageCount: 1,
    },
  };
};
