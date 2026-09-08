import { describe, expect, it } from 'vitest';
import {
  API_BASE_PATH,
  createApiClient,
  resolveApiOrigin,
  resolveApiPath,
  resolveApiUrl,
} from './index.js';

describe('API URL resolution and normalization', () => {
  it('correctly resolves API origin by stripping /api/v1 and trailing slashes', () => {
    expect(resolveApiOrigin('https://api.gatevia.sa/api/v1')).toBe('https://api.gatevia.sa');
    expect(resolveApiOrigin('https://api.gatevia.sa/api/v1/')).toBe('https://api.gatevia.sa');
    expect(resolveApiOrigin('http://localhost:3002')).toBe('http://localhost:3002');
    expect(resolveApiOrigin('http://localhost:3002/api/v1')).toBe('http://localhost:3002');
    expect(resolveApiOrigin('http://localhost:3002/api/v1/')).toBe('http://localhost:3002');
  });

  it('correctly resolves canonical API URL with base path /api/v1', () => {
    expect(resolveApiUrl('https://api.gatevia.sa')).toBe('https://api.gatevia.sa/api/v1');
    expect(resolveApiUrl('https://api.gatevia.sa/api/v1')).toBe('https://api.gatevia.sa/api/v1');
    expect(resolveApiUrl('http://localhost:3002')).toBe('http://localhost:3002/api/v1');
  });

  it('correctly normalizes API paths to include /api/v1 without duplication', () => {
    expect(resolveApiPath('/public/languages')).toBe('/api/v1/public/languages');
    expect(resolveApiPath('/api/v1/public/languages')).toBe('/api/v1/public/languages');
    expect(resolveApiPath('public/languages')).toBe('/api/v1/public/languages');
    expect(resolveApiPath('/admin/leads')).toBe('/api/v1/admin/leads');
    expect(resolveApiPath('/api/v1/admin/leads')).toBe('/api/v1/admin/leads');
  });

  it('createApiClient never duplicates /api/v1 in requests', async () => {
    let capturedUrl = '';
    const mockFetch = async (input: RequestInfo | URL) => {
      capturedUrl = input instanceof Request ? input.url : typeof input === 'string' ? input : input.toString();
      return new Response(JSON.stringify({ data: [] }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    };

    // Client created with baseUrl ending in /api/v1 (e.g. from NEXT_PUBLIC_API_URL)
    const client = createApiClient({
      baseUrl: 'https://api.gatevia.sa/api/v1',
      fetcher: mockFetch as unknown as typeof fetch,
    });

    await client.GET('/api/v1/public/languages');
    expect(capturedUrl).toBe('https://api.gatevia.sa/api/v1/public/languages');
    expect(capturedUrl).not.toContain('/api/v1/api/v1');

    // Client created with plain origin
    const client2 = createApiClient({
      baseUrl: 'http://localhost:3002',
      fetcher: mockFetch as unknown as typeof fetch,
    });

    await client2.GET('/api/v1/admin/leads');
    expect(capturedUrl).toBe('http://localhost:3002/api/v1/admin/leads');
    expect(capturedUrl).not.toContain('/api/v1/api/v1');
  });
});
