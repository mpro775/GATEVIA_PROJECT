import {
  createApiClient,
  resolveApiOrigin,
  resolveApiPath,
  resolveApiUrl,
  ApiError,
  type ContentRecord,
  type Language,
  type NavigationItem,
  type NavigationMenu,
  type PublicSettings,
} from '@gatevia/api-client';

export type { Language } from '@gatevia/api-client';
export { ApiError } from '@gatevia/api-client';

/**
 * Normalizes a route slug to Unicode NFC and safely decodes any existing percent-encoding
 * to prevent double-encoding (e.g. %D8%A3... -> %25D8%25A3...).
 */
export function normalizeRouteSlug(value: string): string {
  try {
    return decodeURIComponent(value).normalize('NFC');
  } catch {
    return value.normalize('NFC');
  }
}

/**
 * Checks if an error represents an HTTP 404 Not Found response.
 */
export function isNotFoundError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  if ('status' in error && (error as Record<string, unknown>)['status'] === 404) return true;
  if ('statusCode' in error && (error as Record<string, unknown>)['statusCode'] === 404)
    return true;
  if (error instanceof Error && error.message.includes('404')) return true;
  return false;
}

const rawApiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3002/api/v1';

/** Base origin (e.g. https://api.gatevia.sa or http://localhost:3002) */
export const apiOrigin = resolveApiOrigin(rawApiUrl);

/** Canonical public API base URL with /api/v1 prefix */
export const publicApiUrl = resolveApiUrl(rawApiUrl);

/** Typed OpenAPI client instance */
export const apiClient = createApiClient({ baseUrl: apiOrigin });

export type NavItem = NavigationItem;

// ─── Typed content helpers via client.GET ────────────────────────────────────
// The web app consumes read-only public endpoints; all requests use apiClient.GET
// which routes through openapi-fetch with the Accept header set by createApiClient.
// Next.js `fetch` cache options (revalidate / tags) are passed via the `next` init
// option, which openapi-fetch forwards to the underlying fetch call.

/**
 * Typed GET wrapper for public content endpoints.
 * Uses apiClient.GET and forwards Next.js cache options.
 * Throws an ApiError preserving status and detail when response is not ok.
 * @internal
 */
async function request<T>(path: string, revalidate = 60): Promise<T> {
  // Build the full path with /api/v1 prefix for openapi-fetch
  const apiPath = resolveApiPath(path);
  const fullUrl = `${apiOrigin}${apiPath}`;

  // openapi-fetch does not yet thread Next.js-specific fetch init through its
  // typed overloads, so we use fetch directly here with the same Accept header
  // that createApiClient sets. This keeps Next.js ISR / tags working correctly
  // while still targeting paths declared in the OpenAPI schema.
  const response = await fetch(fullUrl, {
    headers: { Accept: 'application/json' },
    next: { revalidate, tags: ['gatevia-content'] },
  });
  if (!response.ok) {
    let detail = `CMS request failed: ${response.status}`;
    let title = response.statusText || 'CMS Request Failed';
    let type = 'about:blank';
    try {
      const errBody = (await response.json()) as Record<string, unknown>;
      if (errBody && typeof errBody === 'object') {
        if (typeof errBody.detail === 'string') detail = errBody.detail;
        else if (typeof errBody.message === 'string') detail = errBody.message;
        if (typeof errBody.title === 'string') title = errBody.title;
        if (typeof errBody.type === 'string') type = errBody.type;
      }
    } catch {
      // Response body was not JSON
    }
    throw new ApiError({
      status: response.status,
      title,
      detail,
      type,
    });
  }
  const body = (await response.json()) as { data: T };
  return body.data;
}

// ─── Public content API (typed via @gatevia/api-client schemas) ───────────────
// These functions target paths defined in generated.ts; the return types are
// taken directly from the OpenAPI schema components — no hand-written types.

export const getLanguages = () => request<Language[]>('/public/languages', 300);
export const getSettings = (locale?: string) =>
  request<PublicSettings>(
    `/public/settings${locale ? `?locale=${encodeURIComponent(locale)}` : ''}`,
    300,
  );
export const getPage = (locale: string, slug: string, preview?: string) => {
  const normalizedSlug = normalizeRouteSlug(slug);
  return request<ContentRecord>(
    `/public/pages/${encodeURIComponent(normalizedSlug)}?locale=${encodeURIComponent(locale)}${preview ? `&preview=${encodeURIComponent(preview)}` : ''}`,
    preview ? 0 : 60,
  );
};
export const getList = (resource: string, locale: string, params = '') =>
  request<ContentRecord[]>(`/public/${resource}?locale=${encodeURIComponent(locale)}${params}`);
export const getDetail = (resource: string, locale: string, slug: string, preview?: string) => {
  const normalizedSlug = normalizeRouteSlug(slug);
  return request<ContentRecord>(
    `/public/${resource}/${encodeURIComponent(normalizedSlug)}?locale=${encodeURIComponent(locale)}${preview ? `&preview=${encodeURIComponent(preview)}` : ''}`,
    preview ? 0 : 60,
  );
};

/** Fetch a CMS navigation menu by its key. Falls back to an empty items array. */
export const getNavigation = async (key: string, locale: string): Promise<NavItem[]> => {
  try {
    const menu = await request<NavigationMenu>(
      `/public/navigation/${encodeURIComponent(key)}?locale=${encodeURIComponent(locale)}`,
      120,
    );
    return menu.items ?? [];
  } catch {
    return [];
  }
};

export async function safe<T>(promise: Promise<T>, fallback: T): Promise<T> {
  try {
    return await promise;
  } catch {
    return fallback;
  }
}
