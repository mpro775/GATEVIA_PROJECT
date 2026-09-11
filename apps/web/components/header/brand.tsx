import Image from 'next/image';
import Link from 'next/link';

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
  return (
    <Link
      href={`/${locale}`}
      className="brand"
      aria-label={`${identity.name} home`}
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
