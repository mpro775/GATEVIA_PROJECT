import Image, { type ImageProps } from 'next/image';
import {
  getMediaAlt,
  isSvgMedia,
  MEDIA_PRESETS,
  resolveMediaSource,
  type MediaFormat,
  type MediaLike,
  type MediaPreset,
  type MediaVariantSize,
} from '@/lib/media';

type MediaImageProps = Omit<ImageProps, 'src' | 'alt'> & {
  media: MediaLike | null | undefined;
  alt?: string;
  preset?: MediaPreset;
  preferredSize?: MediaVariantSize;
  preferredFormat?: MediaFormat;
};

export function MediaImage({
  media,
  alt,
  preset = 'content',
  preferredSize,
  preferredFormat,
  sizes,
  width,
  height,
  unoptimized,
  fill,
  ...props
}: MediaImageProps) {
  const source = resolveMediaSource(media, {
    preset,
    size: preferredSize,
    format: preferredFormat,
  });
  if (!source) return null;

  const resolvedWidth = source.width ?? width;
  const resolvedHeight = source.height ?? height;
  if (!fill && (!resolvedWidth || !resolvedHeight)) return null;

  const shared = {
    ...props,
    src: source.url,
    sizes: sizes ?? MEDIA_PRESETS[preset].sizes,
    unoptimized: unoptimized ?? isSvgMedia(media, source),
  };
  const resolvedAlt = alt === '' ? '' : getMediaAlt(media, alt);

  if (fill) return <Image {...shared} alt={resolvedAlt} fill />;

  return (
    <Image
      {...shared}
      alt={resolvedAlt}
      width={resolvedWidth!}
      height={resolvedHeight!}
    />
  );
}
