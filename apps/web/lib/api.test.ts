import { describe, it, expect, vi, beforeEach } from 'vitest';
import { normalizeRouteSlug, isNotFoundError, getDetail, ApiError } from './api';

describe('normalizeRouteSlug', () => {
  it('normalizes decoded Arabic slug to NFC', () => {
    const rawArabic = 'أبحاث-السوق';
    const normalized = normalizeRouteSlug(rawArabic);
    expect(normalized).toBe('أبحاث-السوق');
  });

  it('safely decodes percent-encoded Arabic slug and prevents double encoding', () => {
    const encoded = '%D8%A3%D8%A8%D8%AD%D8%A7%D8%AB-%D8%A7%D9%84%D8%B3%D9%88%D9%82';
    const normalized = normalizeRouteSlug(encoded);
    expect(normalized).toBe('أبحاث-السوق');

    // When re-encoded for URL path, it produces single-encoded form, not double-encoded %25D8%25A3...
    const finalEncoded = encodeURIComponent(normalized);
    expect(finalEncoded).toBe('%D8%A3%D8%A8%D8%AD%D8%A7%D8%AB-%D8%A7%D9%84%D8%B3%D9%88%D9%82');
    expect(finalEncoded).not.toContain('%25');
  });

  it('handles standard Latin slugs properly', () => {
    expect(normalizeRouteSlug('market-research')).toBe('market-research');
  });

  it('handles malformed URI sequences gracefully', () => {
    expect(normalizeRouteSlug('%E0%A4%A')).toBe('%E0%A4%A');
  });
});

describe('isNotFoundError', () => {
  it('detects ApiError with 404', () => {
    const err = new ApiError({
      status: 404,
      title: 'Not Found',
      detail: 'Content translation unavailable.',
      type: 'about:blank',
    });
    expect(isNotFoundError(err)).toBe(true);
  });

  it('detects object with status 404 or statusCode 404', () => {
    expect(isNotFoundError({ status: 404 })).toBe(true);
    expect(isNotFoundError({ statusCode: 404 })).toBe(true);
  });

  it('detects Error with 404 in message', () => {
    expect(isNotFoundError(new Error('CMS request failed: 404'))).toBe(true);
  });

  it('returns false for 500 errors', () => {
    const err500 = new ApiError({
      status: 500,
      title: 'Internal Error',
      detail: 'Unexpected failure',
      type: 'about:blank',
    });
    expect(isNotFoundError(err500)).toBe(false);
    expect(isNotFoundError({ status: 500 })).toBe(false);
    expect(isNotFoundError(new Error('CMS request failed: 500'))).toBe(false);
  });

  it('returns false for network errors or null', () => {
    expect(isNotFoundError(new TypeError('fetch failed'))).toBe(false);
    expect(isNotFoundError(null)).toBe(false);
    expect(isNotFoundError(undefined)).toBe(false);
  });
});

describe('getDetail', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('calls fetch with single-encoded URL when slug is already percent-encoded', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: { id: 'service-1', name: 'أبحاث السوق' } }),
    });
    vi.stubGlobal('fetch', mockFetch);

    const encodedSlug = '%D8%A3%D8%A8%D8%AD%D8%A7%D8%AB-%D8%A7%D9%84%D8%B3%D9%88%D9%82';
    const result = await getDetail('services', 'ar-sa', encodedSlug);

    expect(result).toEqual({ id: 'service-1', name: 'أبحاث السوق' });
    expect(mockFetch).toHaveBeenCalledOnce();
    const requestUrl = mockFetch.mock.calls[0]?.[0] as string;

    // Check that the URL contains single percent encoding and NOT double encoding (%25D8...)
    expect(requestUrl).toContain('/public/services/%D8%A3%D8%A8%D8%AD%D8%A7%D8%AB-%D8%A7%D9%84%D8%B3%D9%88%D9%82?locale=ar-sa');
    expect(requestUrl).not.toContain('%25D8');
  });

  it('calls fetch with single-encoded URL when slug is raw Arabic unicode', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: { id: 'service-1', name: 'أبحاث السوق' } }),
    });
    vi.stubGlobal('fetch', mockFetch);

    const arabicSlug = 'أبحاث-السوق';
    const result = await getDetail('services', 'ar-sa', arabicSlug);

    expect(result).toEqual({ id: 'service-1', name: 'أبحاث السوق' });
    expect(mockFetch).toHaveBeenCalledOnce();
    const requestUrl = mockFetch.mock.calls[0]?.[0] as string;

    expect(requestUrl).toContain('/public/services/%D8%A3%D8%A8%D8%AD%D8%A7%D8%AB-%D8%A7%D9%84%D8%B3%D9%88%D9%82?locale=ar-sa');
  });

  it('throws ApiError with 404 status when API responds 404', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      statusText: 'Not Found',
      json: async () => ({
        type: 'https://gatevia.example/problems/request-error',
        title: 'Not Found',
        status: 404,
        detail: 'Content translation unavailable.',
      }),
    });
    vi.stubGlobal('fetch', mockFetch);

    await expect(getDetail('services', 'ar-sa', 'unknown')).rejects.toThrow(ApiError);
    try {
      await getDetail('services', 'ar-sa', 'unknown');
    } catch (err) {
      expect(isNotFoundError(err)).toBe(true);
      expect((err as ApiError).status).toBe(404);
      expect((err as ApiError).detail).toBe('Content translation unavailable.');
    }
  });

  it('throws ApiError with 500 status when API responds 500 and isNotFoundError returns false', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      json: async () => ({
        type: 'https://gatevia.example/problems/request-error',
        title: 'Internal server error',
        status: 500,
        detail: 'An unexpected error occurred.',
      }),
    });
    vi.stubGlobal('fetch', mockFetch);

    try {
      await getDetail('services', 'ar-sa', 'أبحاث-السوق');
    } catch (err) {
      expect(isNotFoundError(err)).toBe(false);
      expect((err as ApiError).status).toBe(500);
    }
  });
});
