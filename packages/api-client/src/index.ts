import createClient from 'openapi-fetch';
import type { components, paths } from './generated.js';

export type { components, paths };
export type Language = components['schemas']['Language'];
export type AuthUser = components['schemas']['AuthUser'];
export type User = components['schemas']['User'];
export type Role = components['schemas']['Role'];
export type Permission = components['schemas']['Permission'];
export type Media = components['schemas']['Media'];
export type MediaFolder = components['schemas']['MediaFolder'];
export type MediaUsage = components['schemas']['MediaUsage'];
export type UploadSession = components['schemas']['UploadSession'];
export type NavigationItem = components['schemas']['NavigationItem'];
export type NavigationMenu = components['schemas']['NavigationMenu'];
export type PublicSettings = components['schemas']['PublicSettings'];
export type Setting = components['schemas']['Setting'];
export type Redirect = components['schemas']['Redirect'];
export type RedirectMatch = components['schemas']['RedirectMatch'];
export type SubmissionReceipt = components['schemas']['SubmissionReceipt'];
export type ContentRecord = components['schemas']['ContentRecord'];
export type Lead = components['schemas']['Lead'];

export class ApiError extends Error {
  readonly type: string;
  readonly title: string;
  readonly status: number;
  readonly detail: string;
  constructor(problem: { type: string; title: string; status: number; detail: string }) {
    super(problem.detail);
    this.name = 'ApiError';
    this.type = problem.type;
    this.title = problem.title;
    this.status = problem.status;
    this.detail = problem.detail;
  }
}

export const API_BASE_PATH = '/api/v1' as const;

/**
 * Normalizes an API URL to its origin (protocol + host + port),
 * stripping any trailing path like `/api/v1` and trailing slashes.
 *
 * Examples:
 * - "https://api.gatevia.sa/api/v1" -> "https://api.gatevia.sa"
 * - "https://api.gatevia.sa/api/v1/" -> "https://api.gatevia.sa"
 * - "http://localhost:3002" -> "http://localhost:3002"
 * - "http://localhost:3002/api/v1" -> "http://localhost:3002"
 */
export function resolveApiOrigin(urlOrOrigin: string): string {
  if (!urlOrOrigin) return '';
  const trimmed = urlOrOrigin.trim().replace(/\/+$/, '');
  try {
    const parsed = new URL(trimmed);
    const pathname = parsed.pathname.replace(/\/api\/v1\/?$/, '').replace(/\/+$/, '');
    return `${parsed.origin}${pathname}`;
  } catch {
    return trimmed.replace(/\/api\/v1\/?$/, '');
  }
}

/**
 * Returns the canonical API URL including the `/api/v1` base path prefix.
 *
 * Examples:
 * - "https://api.gatevia.sa" -> "https://api.gatevia.sa/api/v1"
 * - "https://api.gatevia.sa/api/v1" -> "https://api.gatevia.sa/api/v1"
 * - "http://localhost:3002" -> "http://localhost:3002/api/v1"
 */
export function resolveApiUrl(urlOrOrigin: string): string {
  const origin = resolveApiOrigin(urlOrOrigin);
  return `${origin}${API_BASE_PATH}`;
}

/**
 * Normalizes an API endpoint path. If it starts with `/api/v1`, it is preserved.
 * If not, `/api/v1` is prepended.
 *
 * Examples:
 * - "/public/languages" -> "/api/v1/public/languages"
 * - "/api/v1/public/languages" -> "/api/v1/public/languages"
 * - "public/languages" -> "/api/v1/public/languages"
 */
export function resolveApiPath(path: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  if (normalized.startsWith(API_BASE_PATH)) {
    return normalized;
  }
  return `${API_BASE_PATH}${normalized}`;
}

export interface ApiClientOptions {
  /**
   * The API baseUrl or origin.
   * Can be passed as full URL (e.g. `https://api.gatevia.sa/api/v1`)
   * or as origin (e.g. `https://api.gatevia.sa`).
   * It will be automatically normalized so `/api/v1` is never duplicated.
   */
  baseUrl: string;
  csrfToken?: string;
  fetcher?: typeof fetch;
  headers?: Record<string, string>;
}

export function createApiClient(options: ApiClientOptions) {
  // OpenAPI paths already start with `/api/v1/...` (e.g. `/api/v1/auth/login`),
  // so the openapi-fetch baseUrl MUST be the API origin to prevent `/api/v1/api/v1/...`.
  const origin = resolveApiOrigin(options.baseUrl);

  return createClient<paths>({
    baseUrl: origin,
    fetch: options.fetcher ?? fetch,
    headers: {
      Accept: 'application/json',
      ...(options.csrfToken ? { 'X-CSRF-Token': options.csrfToken } : {}),
      ...options.headers,
    },
  });
}

export type ApiClient = ReturnType<typeof createApiClient>;
