import createClient from 'openapi-fetch';
import type { paths } from './generated.js';

export type { paths };

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
