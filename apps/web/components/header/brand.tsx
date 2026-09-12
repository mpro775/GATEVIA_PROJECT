import Image from 'next/image';
import Link from 'next/link';
import { MediaImage } from '@/components/media-image';
import type { MediaIdentity } from '@/lib/media';
import { copy } from '@/lib/ui-copy';

export function HeaderBrand({
  locale,
  identity,
  onNavigate,
}: {
  locale: string;
  identity: MediaIdentity;
  onNavigate?: () => void;
}) {
  const t = copy(locale);
  return (
    <Link
      href={`/${locale}`}
      className="brand"
      aria-label={`${identity.name} ${t.brandHome}`}
      {...(onNavigate ? { onClick: onNavigate } : {})}
    >
      {identity.logoMedia?.url ? (
        <MediaImage
          media={identity.logoMedia}
          preset="logo"
          alt=""
          width={42}
          height={42}
          sizes="42px"
          className="brand-mark"
        />
      ) : (
        <Image
          src="/brand/gatevia-mark.svg"
          alt=""
          width={42}
          height={42}
          className="brand-mark"
          unoptimized
        />
      )}
      <span>{identity.name}</span>
    </Link>
  );
}
