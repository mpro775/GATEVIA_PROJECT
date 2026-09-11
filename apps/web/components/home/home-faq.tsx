import Link from 'next/link';
import { Icon } from '@gatevia/ui';
import { text, translation } from '@/lib/content';

export function HomeFaq({
  content,
  faqs,
  locale,
}: {
  content: Record<string, unknown>;
  faqs: Record<string, unknown>[];
  locale: string;
}) {
  const isArabic = locale.toLowerCase().startsWith('ar');

  return (
    <section className="section home-faq">
      <div className="container-wide home-faq__layout">
        <aside className="home-faq__context" data-reveal="up">
          <span className="eyebrow">GATEVIA · FAQ</span>
          {Boolean(content.title) && <h2>{text(content.title)}</h2>}
          <p>
            {isArabic
              ? 'إجابات واضحة عن أكثر الأسئلة المرتبطة بدخول السوق السعودي.'
              : 'Clear answers to common questions about entering the Saudi market.'}
          </p>
          <div className="home-faq__cta">
            <span>{isArabic ? 'لم تجد إجابتك؟' : 'Still have a question?'}</span>
            <Link href={`/${locale}/book-consultation`}>
              {isArabic ? 'احجز استشارة' : 'Book a consultation'}
              <Icon name="arrow" />
            </Link>
          </div>
        </aside>

        <div className="home-faq__list">
          {faqs.map((faq, index) => {
            const tr = translation(faq);
            return (
              <details
                key={String(faq.id ?? index)}
                className="home-faq__item"
                data-reveal="fade"
                style={{ '--reveal-delay': `${80 + index * 60}ms` } as React.CSSProperties}
              >
                <summary>
                  <span className="home-faq__index">{String(index + 1).padStart(2, '0')}</span>
                  <span className="home-faq__question">{text(tr.title ?? tr.question)}</span>
                  <span className="home-faq__indicator" aria-hidden="true" />
                </summary>
                <div className="home-faq__answer">
                  <p>{text(tr.answer ?? tr.content)}</p>
                </div>
              </details>
            );
          })}
        </div>
      </div>
    </section>
  );
}
