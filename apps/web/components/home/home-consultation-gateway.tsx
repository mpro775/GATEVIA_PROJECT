import Link from 'next/link';
import { Icon } from '@gatevia/ui';
import { text } from '@/lib/content';

function ConsultationGatewayVisual() {
  return (
    <div className="home-consultation__visual" aria-hidden="true" data-reveal="home-consultation">
      <span className="home-consultation__frame home-consultation__frame--outer" />
      <span className="home-consultation__frame home-consultation__frame--inner" />
      <svg viewBox="0 0 640 300" focusable="false">
        <path
          className="home-consultation__path-shadow"
          d="M32 220 C178 220 205 152 316 152 C432 152 478 85 606 85"
        />
        <path
          className="home-consultation__path"
          d="M32 220 C178 220 205 152 316 152 C432 152 478 85 606 85"
          pathLength="1"
        />
      </svg>
      <span className="home-consultation__node home-consultation__node--start" />
      <span className="home-consultation__node home-consultation__node--decision" />
      <span className="home-consultation__node home-consultation__node--next" />
      <span className="home-consultation__visual-label">NEXT MOVE</span>
    </div>
  );
}

export function HomeConsultationGateway({
  content,
  locale,
}: {
  content: Record<string, unknown>;
  locale: string;
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
          <ConsultationGatewayVisual />
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
