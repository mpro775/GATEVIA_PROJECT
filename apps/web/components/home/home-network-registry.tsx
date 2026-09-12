import Image from 'next/image';
import { text, translation } from '@/lib/content';
import { copy } from '@/lib/ui-copy';

type MediaRecord = Record<string, { url?: string; translations?: Array<{ altText?: string }> }>;

function logoFor(item: Record<string, unknown>) {
  const media = item.media as MediaRecord | undefined;
  return typeof item.logoMediaId === 'string' ? media?.[item.logoMediaId] : undefined;
}

function validWebsite(value: unknown): string | undefined {
  return typeof value === 'string' && /^https?:\/\//i.test(value) ? value : undefined;
}

function RegistryItem({
  item,
  type,
  locale,
  index,
}: {
  item: Record<string, unknown>;
  type: 'client' | 'partner';
  locale: string;
  index: number;
}) {
  const t = copy(locale);
  const tr = translation(item);
  const name = text(tr.name);
  const logo = logoFor(item);
  const website = validWebsite(item.website);
  const partnerType = text(item.partnerType);
  const partnerLabel =
    type === 'partner' && partnerType
      ? t.partnerTypes[partnerType as keyof typeof t.partnerTypes]
      : undefined;
  const content = (
    <>
      <span className="home-network__index" aria-hidden="true">
        {String(index + 1).padStart(2, '0')}
      </span>
      <span className="home-network__logo">
        {logo?.url ? (
          <Image
            src={logo.url}
            alt={logo.translations?.[0]?.altText ?? name}
            width={180}
            height={72}
            sizes="180px"
          />
        ) : (
          <span className="home-network__monogram" aria-hidden="true">
            {name.slice(0, 2)}
          </span>
        )}
      </span>
      <strong>{name}</strong>
      {partnerLabel && <small>{partnerLabel}</small>}
    </>
  );

  return (
    <li
      data-reveal="network-item"
      style={{ '--reveal-delay': `${Math.min(index, 8) * 45}ms` } as React.CSSProperties}
    >
      {website ? (
        <a href={website} target="_blank" rel="noopener noreferrer">
          {content}
        </a>
      ) : (
        <div>{content}</div>
      )}
    </li>
  );
}

function RegistryGroup({
  title,
  items,
  type,
  locale,
}: {
  title: string;
  items: Record<string, unknown>[];
  type: 'client' | 'partner';
  locale: string;
}) {
  if (items.length === 0) return null;
  return (
    <section className="home-network__group" aria-labelledby={`network-${type}`}>
      <header data-reveal="line">
        <h3 id={`network-${type}`}>{title}</h3>
        <span aria-hidden="true">{String(items.length).padStart(2, '0')}</span>
      </header>
      <ul>
        {items.map((item, index) => (
          <RegistryItem
            key={String(item.id ?? index)}
            item={item}
            type={type}
            locale={locale}
            index={index}
          />
        ))}
      </ul>
    </section>
  );
}

export function HomeNetworkRegistry({
  content,
  clients,
  partners,
  locale,
  demo,
}: {
  content: Record<string, unknown>;
  clients: Record<string, unknown>[];
  partners: Record<string, unknown>[];
  locale: string;
  demo: boolean;
}) {
  if (clients.length === 0 && partners.length === 0) return null;
  const t = copy(locale);
  return (
    <section className="section home-network" data-home-section="network">
      <div className="container-wide">
        <header className="home-section-header home-network__heading">
          <div data-reveal="up">
            {Boolean(content.eyebrow) && <span className="eyebrow">{text(content.eyebrow)}</span>}
            {Boolean(content.title) && <h2>{text(content.title)}</h2>}
            {demo && <span className="home-demo-badge">{t.demoContent}</span>}
          </div>
        </header>
        <div className="home-network__registry">
          <RegistryGroup title={t.clients} items={clients} type="client" locale={locale} />
          <RegistryGroup title={t.partners} items={partners} type="partner" locale={locale} />
        </div>
      </div>
    </section>
  );
}
