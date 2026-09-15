import { describe, expect, it } from 'vitest';
import {
  getDefaultResourceMedia,
  getMediaAlt,
  getMediaVariant,
  resolveMediaSource,
  withDefaultResourceMedia,
  type MediaLike,
} from './media';

const complete: MediaLike = {
  id: 'media-1',
  url: 'https://media.test/original.jpg',
  mimeType: 'image/jpeg',
  status: 'ready',
  width: 3000,
  height: 2000,
  translations: [{ locale: 'en', altText: 'Market access' }],
  variants: [
    { variantKey: 'small', url: 'https://media.test/small.webp', width: 640, height: 427, mimeType: 'image/webp' },
    { variantKey: 'small', url: 'https://media.test/small.avif', width: 640, height: 427, mimeType: 'image/avif' },
    { variantKey: 'large', url: 'https://media.test/large.webp', width: 1920, height: 1280, mimeType: 'image/webp' },
  ],
};

describe('media delivery', () => {
  it('selects the requested format and size', () => {
    expect(resolveMediaSource(complete, { preset: 'card' })?.url).toBe('https://media.test/small.avif');
  });

  it('uses a larger variant before the original', () => {
    expect(getMediaVariant(complete, { size: 'medium', format: 'avif' })?.url).toBe('https://media.test/large.webp');
  });

  it('keeps legacy media working', () => {
    const legacy: MediaLike = {
      id: complete.id,
      url: complete.url,
      mimeType: complete.mimeType,
      width: complete.width,
      height: complete.height,
      variants: [],
    };
    expect(resolveMediaSource(legacy, { preset: 'hero' })?.isOriginal).toBe(true);
  });

  it('uses the original while processing', () => {
    expect(resolveMediaSource({ ...complete, status: 'processing' }, { preset: 'card' })?.isOriginal).toBe(true);
  });

  it('never selects raster variants for SVG or GIF media', () => {
    expect(resolveMediaSource({ ...complete, mimeType: 'image/svg+xml' }, { preset: 'logo' })?.isOriginal).toBe(true);
    expect(resolveMediaSource({ ...complete, mimeType: 'image/gif' }, { preset: 'card' })?.isOriginal).toBe(true);
  });

  it('is null safe and respects decorative alt metadata', () => {
    expect(resolveMediaSource(null)).toBeUndefined();
    expect(getMediaAlt({ ...complete, translations: [{ locale: 'en', decorative: true, altText: 'ignored' }] }, 'fallback')).toBe('');
  });

  it('maps resource fallbacks to the five local Gatevia placeholder images', () => {
    expect(getDefaultResourceMedia('products')?.url).toBe('/image/default-product.webp');
    expect(getDefaultResourceMedia('brands')?.url).toBe('/image/default-brand.webp');
    expect(getDefaultResourceMedia('clients')?.url).toBe('/image/default-client.webp');
    expect(getDefaultResourceMedia('partners')?.url).toBe('/image/default-partner.webp');
    expect(getDefaultResourceMedia('team-members')?.url).toBe('/image/default-team.webp');
    expect(getDefaultResourceMedia('services')).toBeUndefined();
  });

  it('never replaces real CMS media with a fallback', () => {
    expect(withDefaultResourceMedia(complete, 'products')).toEqual({
      media: complete,
      isFallback: false,
    });
    expect(withDefaultResourceMedia(undefined, 'products')).toMatchObject({
      media: { url: '/image/default-product.webp', width: 800, height: 800 },
      isFallback: true,
    });
  });
});
