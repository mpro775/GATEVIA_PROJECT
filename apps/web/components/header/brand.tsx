import Image from 'next/image';
import Link from 'next/link';
import { copy } from '@/lib/ui-copy';

export function HeaderBrand({
  locale,
  identity,
  onNavigate,
}: {
  locale: string;
  identity: { name: string; logoUrl?: string | undefined };
  onNavigate?: () => void;
}) {
  const markSrc = identity.logoUrl ?? '/brand/gatevia-mark.svg';
  const t = copy(locale);
  return (
    <Link
      href={`/${locale}`}
      className="brand"
      aria-label={`${identity.name} ${t.brandHome}`}
      {...(onNavigate ? { onClick: onNavigate } : {})}
    >
      <Image
        src={markSrc}
        alt=""
        width={42}
        height={42}
        className="brand-mark"
        unoptimized={!identity.logoUrl || markSrc.endsWith('.svg')}
      />
      <span>{identity.name}</span>
    </Link>
  );
}
