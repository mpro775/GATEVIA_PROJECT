import { MediaImage } from '@/components/media-image';
import type { MediaLike, MediaPreset } from '@/lib/media';

export function MediaFrame({
  media,
  alt = '',
  priority = false,
  className = '',
  preset = 'content',
  sizes,
}: {
  media: MediaLike;
  alt?: string;
  priority?: boolean;
  className?: string;
  preset?: MediaPreset;
  sizes?: string;
}) {
  return (
    <figure className={`media-frame ${className}`.trim()} data-reveal="media">
      <MediaImage
        media={media}
        alt={alt}
        width={1280}
        height={900}
        sizes={sizes}
        priority={priority}
        preset={preset}
      />
    </figure>
  );
}
