import type { Media } from '@gatevia/api-client';

export const MEDIA_VARIANT_SIZES = ['thumbnail', 'small', 'medium', 'large'] as const;
export type MediaVariantSize = (typeof MEDIA_VARIANT_SIZES)[number];
export type MediaFormat = 'avif' | 'webp';
export type MediaPreset = 'thumbnail' | 'card' | 'content' | 'hero' | 'logo' | 'avatar';

type MediaStatus = Media['status'];
type MediaTranslation = NonNullable<Media['translations']>[number];
type MediaVariant = NonNullable<Media['variants']>[number];

export interface MediaLike {
  id?: string | undefined;
  url?: string | undefined;
  mimeType?: string | undefined;
  status?: MediaStatus | undefined;
  width?: number | undefined;
  height?: number | undefined;
  translations?: Array<Partial<MediaTranslation>> | undefined;
  variants?: Array<Partial<MediaVariant>> | undefined;
}

export type DefaultMediaResource =
  | 'clients'
  | 'partners'
  | 'brands'
  | 'products'
  | 'team'
  | 'team-members';

export interface ResourceMediaResolution {
  media: MediaLike | undefined;
  isFallback: boolean;
}

const DEFAULT_RESOURCE_MEDIA: Record<Exclude<DefaultMediaResource, 'team-members'>, MediaLike> = {
  clients: {
    id: 'default-client',
    url: '/image/default-client.webp',
    mimeType: 'image/webp',
    status: 'ready',
    width: 800,
    height: 800,
  },
  partners: {
    id: 'default-partner',
    url: '/image/default-partner.webp',
    mimeType: 'image/webp',
    status: 'ready',
    width: 800,
    height: 800,
  },
  brands: {
    id: 'default-brand',
    url: '/image/default-brand.webp',
    mimeType: 'image/webp',
    status: 'ready',
    width: 800,
    height: 800,
  },
  products: {
    id: 'default-product',
    url: '/image/default-product.webp',
    mimeType: 'image/webp',
    status: 'ready',
    width: 800,
    height: 800,
  },
  team: {
    id: 'default-team',
    url: '/image/default-team.webp',
    mimeType: 'image/webp',
    status: 'ready',
    width: 800,
    height: 800,
  },
};

function defaultMediaResource(resource: string | undefined): Exclude<DefaultMediaResource, 'team-members'> | undefined {
  if (resource === 'team-members') return 'team';
  if (resource === 'clients' || resource === 'partners' || resource === 'brands' || resource === 'products' || resource === 'team') {
    return resource;
  }
  return undefined;
}

export function getDefaultResourceMedia(resource: string | undefined): MediaLike | undefined {
  const key = defaultMediaResource(resource);
  return key ? DEFAULT_RESOURCE_MEDIA[key] : undefined;
}

export function withDefaultResourceMedia(
  media: MediaLike | null | undefined,
  resource: string | undefined,
): ResourceMediaResolution {
  if (media?.url) return { media, isFallback: false };
  const fallback = getDefaultResourceMedia(resource);
  return { media: fallback, isFallback: Boolean(fallback) };
}
export type MediaMap = Record<string, MediaLike | undefined>;
export interface MediaIdentity {
  name: string;
  logoMedia?: MediaLike | undefined;
}

export interface MediaSource {
  url: string;
  width?: number | undefined;
  height?: number | undefined;
  mimeType?: string | undefined;
  size: MediaVariantSize | 'original';
  format?: MediaFormat | undefined;
  isOriginal: boolean;
}

export interface MediaPresetConfig {
  size: MediaVariantSize;
  format: MediaFormat;
  sizes: string;
}

export const MEDIA_PRESETS: Record<MediaPreset, MediaPresetConfig> = {
  thumbnail: { size: 'thumbnail', format: 'avif', sizes: '320px' },
  avatar: { size: 'thumbnail', format: 'avif', sizes: '96px' },
  logo: { size: 'thumbnail', format: 'webp', sizes: '180px' },
  card: {
    size: 'small',
    format: 'avif',
    sizes: '(max-width: 640px) calc(100vw - 2rem), (max-width: 1100px) 50vw, 33vw',
  },
  content: { size: 'medium', format: 'avif', sizes: '(max-width: 768px) 100vw, 50vw' },
  hero: { size: 'large', format: 'avif', sizes: '100vw' },
};

function nonEmpty(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function formatForMime(mimeType: unknown): MediaFormat | undefined {
  if (mimeType === 'image/avif') return 'avif';
  if (mimeType === 'image/webp') return 'webp';
  return undefined;
}

function originalSource(media: MediaLike): MediaSource | undefined {
  if (!nonEmpty(media.url)) return undefined;
  return {
    url: media.url,
    width: media.width,
    height: media.height,
    mimeType: media.mimeType,
    size: 'original',
    isOriginal: true,
  };
}

function isRasterCandidate(media: MediaLike): boolean {
  if (media.mimeType === 'image/svg+xml' || media.mimeType === 'image/gif') return false;
  return !media.mimeType || media.mimeType.startsWith('image/');
}

export function getMediaVariant(
  media: MediaLike | null | undefined,
  options: { size: MediaVariantSize; format?: MediaFormat | undefined },
): MediaSource | undefined {
  if (!media || media.status === 'archived') return undefined;
  const original = originalSource(media);
  if (!isRasterCandidate(media) || (media.status && media.status !== 'ready')) return original;

  const variants = (media.variants ?? []).filter(
    (variant) =>
      nonEmpty(variant.url) &&
      MEDIA_VARIANT_SIZES.includes((variant.variantKey ?? variant.key) as MediaVariantSize) &&
      Boolean(formatForMime(variant.mimeType)),
  );
  const requestedIndex = MEDIA_VARIANT_SIZES.indexOf(options.size);
  const formats: MediaFormat[] = options.format === 'webp' ? ['webp', 'avif'] : ['avif', 'webp'];
  const larger = MEDIA_VARIANT_SIZES.slice(requestedIndex + 1);
  const smaller = MEDIA_VARIANT_SIZES.slice(0, requestedIndex).reverse();

  const find = (sizes: readonly MediaVariantSize[]) => {
    for (const size of sizes) {
      for (const format of formats) {
        const variant = variants.find(
          (candidate) =>
            (candidate.variantKey ?? candidate.key) === size &&
            formatForMime(candidate.mimeType) === format,
        );
        if (variant?.url) {
          return {
            url: variant.url,
            width: variant.width,
            height: variant.height,
            mimeType: variant.mimeType,
            size,
            format,
            isOriginal: false,
          } satisfies MediaSource;
        }
      }
    }
    return undefined;
  };

  // Preserve visual quality: exact size, then the nearest larger variant. Prefer the
  // original over an undersized raster; smaller variants are only a last resort when
  // no original URL exists (for partially migrated records).
  return find([options.size]) ?? find(larger) ?? original ?? find(smaller);
}

export function resolveMediaSource(
  media: MediaLike | null | undefined,
  options: {
    preset?: MediaPreset | undefined;
    size?: MediaVariantSize | undefined;
    format?: MediaFormat | undefined;
  } = {},
): MediaSource | undefined {
  const preset = MEDIA_PRESETS[options.preset ?? 'content'];
  return getMediaVariant(media, {
    size: options.size ?? preset.size,
    format: options.format ?? preset.format,
  });
}

export function getMediaAlt(media: MediaLike | null | undefined, fallback = ''): string {
  const translation = media?.translations?.[0];
  if (translation?.decorative) return '';
  return translation?.altText?.trim() || translation?.title?.trim() || fallback;
}

export function mediaFromMap(map: unknown, id: unknown): MediaLike | undefined {
  if (!map || typeof map !== 'object' || typeof id !== 'string') return undefined;
  return (map as MediaMap)[id];
}

export function isSvgMedia(media: MediaLike | null | undefined, source?: MediaSource): boolean {
  return media?.mimeType === 'image/svg+xml' || source?.mimeType === 'image/svg+xml';
}
