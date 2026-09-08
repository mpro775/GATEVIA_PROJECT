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

export interface ApiClientOptions {
  baseUrl: string;
  csrfToken?: string;
  fetcher?: typeof fetch;
}

export function createApiClient(options: ApiClientOptions) {
  return createClient<paths>({
    baseUrl: options.baseUrl,
    fetch: options.fetcher ?? fetch,
    headers: {
      Accept: 'application/json',
      ...(options.csrfToken ? { 'X-CSRF-Token': options.csrfToken } : {}),
    },
  });
}
