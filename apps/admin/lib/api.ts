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

/** Typed OpenAPI client instance with credentials and CSRF support */
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

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const fullUrl = `${apiOrigin}${resolveApiPath(path)}`;
  const response = await fetch(fullUrl, {
    ...init,
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
      ...(!['GET', 'HEAD'].includes(init.method ?? 'GET')
        ? { 'X-CSRF-Token': cookie('gatevia_csrf') ?? '' }
        : {}),
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
