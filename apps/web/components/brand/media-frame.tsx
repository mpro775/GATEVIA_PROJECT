import Image from 'next/image';

export function MediaFrame({
  src,
  alt = '',
  priority = false,
  className = '',
}: {
  src: string;
  alt?: string;
  priority?: boolean;
  className?: string;
}) {
  return (
    <figure className={`media-frame ${className}`.trim()} data-reveal="media">
      <Image
        src={src}
        alt={alt}
        width={1280}
        height={900}
        sizes="(max-width: 768px) 100vw, 50vw"
        priority={priority}
      />
    </figure>
  );
}
