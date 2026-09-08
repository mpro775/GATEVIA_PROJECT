import type { ProblemDetails } from '@gatevia/contracts';

export class ApiError extends Error {
  constructor(public readonly problem: ProblemDetails) {
    super(problem.detail);
  }
}

export interface ApiClientOptions { baseUrl: string; csrfToken?: string; fetcher?: typeof fetch }

export function createApiClient(options: ApiClientOptions) {
  const request = async <T>(path: string, init: RequestInit = {}): Promise<T> => {
    const response = await (options.fetcher ?? fetch)(`${options.baseUrl}${path}`, {
      ...init,
      credentials: 'include',
      headers: {
        Accept: 'application/json',
        ...(init.body ? { 'Content-Type': 'application/json' } : {}),
        ...(options.csrfToken ? { 'X-CSRF-Token': options.csrfToken } : {}),
        ...init.headers,
      },
    });
    const body = (await response.json()) as T | ProblemDetails;
    if (!response.ok) throw new ApiError(body as ProblemDetails);
    return body as T;
  };
  return {
    get: <T>(path: string) => request<T>(path),
    post: <T>(path: string, body?: unknown, headers?: HeadersInit) => request<T>(path, { method: 'POST', body: body === undefined ? undefined : JSON.stringify(body), headers }),
    patch: <T>(path: string, body: unknown) => request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
  };
}
