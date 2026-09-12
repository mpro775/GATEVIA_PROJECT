import Image from 'next/image';
import { text, translation } from '@/lib/content';
import { copy } from '@/lib/ui-copy';

type MediaRecord = Record<string, { url?: string; translations?: Array<{ altText?: string }> }>;

function testimonialLogo(item: Record<string, unknown>) {
  const media = item.media as MediaRecord | undefined;
  return typeof item.logoMediaId === 'string' ? media?.[item.logoMediaId] : undefined;
}

function Attribution({ item }: { item: Record<string, unknown> }) {
  const logo = testimonialLogo(item);
  const detail = [text(item.personRole), text(item.companyName)].filter(Boolean).join(' · ');
  return (
    <footer className="home-testimonials__attribution">
      {logo?.url && (
        <span className="home-testimonials__logo">
          <Image
            src={logo.url}
            alt={logo.translations?.[0]?.altText ?? text(item.companyName)}
            width={120}
            height={48}
            sizes="120px"
          />
        </span>
      )}
      <span>
        <strong>{text(item.personName)}</strong>
        {detail && <small>{detail}</small>}
      </span>
    </footer>
  );
}

export function HomeTestimonials({
  content,
  items,
  locale,
  demo,
}: {
  content: Record<string, unknown>;
  items: Record<string, unknown>[];
  locale: string;
  demo: boolean;
}) {
  if (items.length === 0) return null;
  const t = copy(locale);
  const featuredIndex = Math.max(
    0,
    items.findIndex((item) => item.featured === true),
  );
  const featured = items[featuredIndex]!;
  const secondary = items.filter((_, index) => index !== featuredIndex);

  return (
    <section className="section home-testimonials" data-home-section="testimonials">
      <div className="container-wide home-testimonials__layout">
        <header className="home-testimonials__header" data-reveal="up">
          {Boolean(content.eyebrow) && <span className="eyebrow">{text(content.eyebrow)}</span>}
          {Boolean(content.title) && <h2>{text(content.title)}</h2>}
          {demo && <span className="home-demo-badge">{t.demoContent}</span>}
        </header>

        <div className="home-testimonials__voices">
          <blockquote className="home-testimonials__featured" data-reveal="testimonial-quote">
            <span className="home-testimonials__quote-mark" aria-hidden="true">
              “
            </span>
            <p>{text(translation(featured).quote)}</p>
            <Attribution item={featured} />
          </blockquote>

          {secondary.length > 0 && (
            <div className="home-testimonials__secondary">
              {secondary.map((item, index) => (
                <blockquote
                  key={String(item.id ?? index)}
                  data-reveal="testimonial-row"
                  style={
                    { '--reveal-delay': `${Math.min(index, 5) * 65}ms` } as React.CSSProperties
                  }
                >
                  <span aria-hidden="true">{String(index + 2).padStart(2, '0')}</span>
                  <p>“{text(translation(item).quote)}”</p>
                  <Attribution item={item} />
                </blockquote>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
