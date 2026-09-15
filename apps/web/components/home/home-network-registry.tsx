import { Icon } from '@gatevia/ui';
import { MediaImage } from '@/components/media-image';
import { text, translation } from '@/lib/content';
import { mediaFromMap, withDefaultResourceMedia } from '@/lib/media';
import { copy } from '@/lib/ui-copy';

function visualFor(item: Record<string, unknown>, resource: 'clients' | 'partners') {
  return withDefaultResourceMedia(mediaFromMap(item.media, item.logoMediaId), resource);
}

function validWebsite(value: unknown): string | undefined {
  return typeof value === 'string' && /^https?:\/\//i.test(value) ? value : undefined;
}

function ClientTile({ item, index }: { item: Record<string, unknown>; index: number }) {
  const tr = translation(item);
  const name = text(tr.name);
  const visualMedia = visualFor(item, 'clients');
  const website = validWebsite(item.website);
  const visual = (
    <>
      <span
        className={`home-network__client-logo${visualMedia.isFallback ? ' home-network__client-logo--fallback' : ''}`}
      >
        {visualMedia.media?.url && (
          <MediaImage
            media={visualMedia.media}
            alt={name}
            preset={visualMedia.isFallback ? 'card' : 'logo'}
            width={210}
            height={visualMedia.isFallback ? 210 : 88}
            sizes="210px"
          />
        )}
      </span>
      <span className="home-network__client-name">{name}</span>
    </>
  );
  return (
    <li
      data-reveal="network-item"
      style={{ '--reveal-delay': `${Math.min(index, 8) * 45}ms` } as React.CSSProperties}
    >
      {website ? (
        <a href={website} target="_blank" rel="noopener noreferrer" aria-label={name}>
          {visual}
        </a>
      ) : (
        <div>{visual}</div>
      )}
    </li>
  );
}

function PartnerCard({
  item,
  locale,
  index,
}: {
  item: Record<string, unknown>;
  locale: string;
  index: number;
}) {
  const t = copy(locale);
  const tr = translation(item);
  const name = text(tr.name);
  const description = text(tr.description ?? tr.shortDescription);
  const visualMedia = visualFor(item, 'partners');
  const website = validWebsite(item.website);
  const partnerType = text(item.partnerType);
  const partnerLabel = partnerType
    ? t.partnerTypes[partnerType as keyof typeof t.partnerTypes]
    : undefined;
  const country = text(item.countryCode);
  const body = (
    <>
      <div className="home-network__partner-top">
        <span
          className={`home-network__partner-logo${visualMedia.isFallback ? ' home-network__partner-logo--fallback' : ''}`}
        >
          {visualMedia.media?.url && (
            <MediaImage
              media={visualMedia.media}
              alt={name}
              preset={visualMedia.isFallback ? 'card' : 'logo'}
              width={180}
              height={visualMedia.isFallback ? 180 : 72}
              sizes="180px"
            />
          )}
        </span>
        {website && <Icon name="external" />}
      </div>
      <div className="home-network__partner-copy">
        <div className="home-network__partner-meta">
          {partnerLabel && <span>{partnerLabel}</span>}
          {country && <span>{country}</span>}
        </div>
        <h4>{name}</h4>
        {description && <p>{description}</p>}
      </div>
    </>
  );
  return (
    <li
      data-reveal="network-item"
      style={{ '--reveal-delay': `${Math.min(index, 6) * 55}ms` } as React.CSSProperties}
    >
      {website ? (
        <a href={website} target="_blank" rel="noopener noreferrer">
          {body}
        </a>
      ) : (
        <article>{body}</article>
      )}
    </li>
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
            {Boolean(content.body) && <p>{text(content.body)}</p>}
            {demo && <span className="home-demo-badge">{t.demoContent}</span>}
          </div>
        </header>

        {clients.length > 0 && (
          <section className="home-network__clients" aria-labelledby="network-clients">
            <div className="home-network__subhead" data-reveal="line">
              <div>
                <span className="eyebrow">{String(clients.length).padStart(2, '0')}</span>
                <h3 id="network-clients">{t.clientsTrust}</h3>
              </div>
              <span>{t.clients}</span>
            </div>
            <ul className="home-network__client-grid">
              {clients.map((item, index) => (
                <ClientTile key={String(item.id ?? index)} item={item} index={index} />
              ))}
            </ul>
          </section>
        )}

        {partners.length > 0 && (
          <section className="home-network__partners" aria-labelledby="network-partners">
            <div className="home-network__subhead" data-reveal="line">
              <div>
                <span className="eyebrow">{String(partners.length).padStart(2, '0')}</span>
                <h3 id="network-partners">{t.partnerNetwork}</h3>
              </div>
              <span>{t.partners}</span>
            </div>
            <ul className="home-network__partner-grid">
              {partners.map((item, index) => (
                <PartnerCard
                  key={String(item.id ?? index)}
                  item={item}
                  locale={locale}
                  index={index}
                />
              ))}
            </ul>
          </section>
        )}
      </div>
    </section>
  );
}
