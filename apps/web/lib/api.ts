import type {
  ContentRecord,
  Language,
  NavigationItem,
  NavigationMenu,
  PublicSettings,
} from '@gatevia/api-client';

export type { Language } from '@gatevia/api-client';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3002/api/v1';

export type NavItem = NavigationItem;

async function request<T>(path: string, revalidate = 60): Promise<T> {
  const response = await fetch(`${API}${path}`, {
    headers: { Accept: 'application/json' },
    next: { revalidate, tags: ['gatevia-content'] },
  });
  if (!response.ok) throw new Error(`CMS request failed: ${response.status}`);
  const body = (await response.json()) as { data: T };
  return body.data;
}

export const getLanguages = () => request<Language[]>('/public/languages', 300);
export const getSettings = (locale?: string) =>
  request<PublicSettings>(
    `/public/settings${locale ? `?locale=${encodeURIComponent(locale)}` : ''}`,
    300,
  );
export const getPage = (locale: string, slug: string, preview?: string) =>
  request<ContentRecord>(
    `/public/pages/${encodeURIComponent(slug)}?locale=${encodeURIComponent(locale)}${preview ? `&preview=${encodeURIComponent(preview)}` : ''}`,
    preview ? 0 : 60,
  );
export const getList = (resource: string, locale: string, params = '') =>
  request<ContentRecord[]>(`/public/${resource}?locale=${encodeURIComponent(locale)}${params}`);
export const getDetail = (resource: string, locale: string, slug: string, preview?: string) =>
  request<ContentRecord>(
    `/public/${resource}/${encodeURIComponent(slug)}?locale=${encodeURIComponent(locale)}${preview ? `&preview=${encodeURIComponent(preview)}` : ''}`,
    preview ? 0 : 60,
  );

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

export const publicApiUrl = API;
