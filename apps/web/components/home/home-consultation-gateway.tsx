import Image from 'next/image';
import Link from 'next/link';
import { Icon } from '@gatevia/ui';
import { text } from '@/lib/content';

export function HomeConsultationGateway({
  content,
  locale,
  mediaItem,
}: {
  content: Record<string, unknown>;
  locale: string;
  mediaItem?: { url?: string; translations?: Array<{ altText?: string }> } | undefined;
}) {
  const primaryCta = content.primaryCta as Record<string, unknown> | undefined;
  const hasAction = Boolean(primaryCta?.label) && Boolean(primaryCta?.href);
  const isArabic = locale.toLowerCase().startsWith('ar');

  return (
    <section className="section home-consultation" data-home-section="consultation">
      <div className="container-wide home-consultation__layout">
        <div className="home-consultation__copy" data-reveal="up">
          <span className="eyebrow">
            {text(content.eyebrow, isArabic ? 'GATEVIA / الخطوة القادمة' : 'GATEVIA / NEXT MOVE')}
          </span>
          {Boolean(content.title) && <h2>{text(content.title)}</h2>}
          {Boolean(content.body) && <p>{text(content.body)}</p>}
        </div>

        <div className="home-consultation__action-side">
          {mediaItem?.url ? (
            <div className="home-consultation__visual" data-reveal="home-consultation">
              <Image
                src={mediaItem.url}
                alt={mediaItem.translations?.[0]?.altText ?? ''}
                fill
                sizes="(max-width: 834px) calc(100vw - 2rem), 42vw"
              />
            </div>
          ) : null}
          {hasAction && (
            <Link
              className="home-consultation__action"
              href={text(primaryCta?.href)}
              data-reveal="up"
            >
              <span>{text(primaryCta?.label)}</span>
              <Icon name="arrow" />
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
