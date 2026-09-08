import createClient from 'openapi-fetch';
import type { paths } from './generated.js';

export type { paths };

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
