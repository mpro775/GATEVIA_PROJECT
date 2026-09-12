import { list, text } from '@/lib/content';
import { copy } from '@/lib/ui-copy';

export function HomeEvidenceLedger({
  content,
  demo,
  locale,
}: {
  content: Record<string, unknown>;
  demo: boolean;
  locale: string;
}) {
  const items = list(content.items) as Record<string, unknown>[];
  if (items.length === 0) return null;

  const t = copy(locale);

  return (
    <section className="section home-evidence" data-home-section="evidence">
      <div className="container-wide home-evidence__layout">
        <header className="home-evidence__intro" data-reveal="up">
          {Boolean(content.eyebrow) && <span className="eyebrow">{text(content.eyebrow)}</span>}
          {Boolean(content.title) && <h2>{text(content.title)}</h2>}
          {Boolean(content.body) && <p>{text(content.body)}</p>}
          {demo && <span className="home-demo-badge">{t.demoContent}</span>}
          <span className="home-evidence__folio" aria-hidden="true">
            GATEVIA / EVIDENCE
          </span>
        </header>

        <ol className="home-evidence__ledger">
          {items.map((item, index) => (
            <li
              className="home-evidence__metric"
              key={`${text(item.label)}-${index}`}
              data-reveal="up"
              style={
                { '--reveal-delay': `${90 + Math.min(index, 7) * 65}ms` } as React.CSSProperties
              }
            >
              <span className="home-evidence__index" aria-hidden="true">
                {String(index + 1).padStart(2, '0')}
              </span>
              <strong className="home-evidence__value">
                {text(item.value)}
                {text(item.suffix)}
              </strong>
              <span className="home-evidence__label">{text(item.label)}</span>
              <span className="home-evidence__rule" data-reveal="line" aria-hidden="true" />
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
