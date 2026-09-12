'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Icon } from '@gatevia/ui';
import { useId, useState } from 'react';
import { text, translation } from '@/lib/content';
import { copy } from '@/lib/ui-copy';

type MediaRecord = Record<string, { url?: string; translations?: Array<{ altText?: string }> }>;

function sectorMedia(item: Record<string, unknown>) {
  const tr = translation(item);
  const media = item.media as MediaRecord | undefined;
  for (const id of [item.heroMediaId, tr.ogMediaId]) {
    if (typeof id === 'string' && media?.[id]?.url) return media[id];
  }
  return undefined;
}

function SectorFallback({ variant }: { variant: number }) {
  return (
    <div
      className={`home-sector-explorer__fallback home-sector-explorer__fallback--${(variant % 3) + 1}`}
      aria-hidden="true"
    >
      <span className="home-sector-explorer__frame" />
      <span className="home-sector-explorer__axis home-sector-explorer__axis--a" />
      <span className="home-sector-explorer__axis home-sector-explorer__axis--b" />
      <span className="home-sector-explorer__node home-sector-explorer__node--a" />
      <span className="home-sector-explorer__node home-sector-explorer__node--b" />
      <span className="home-sector-explorer__node home-sector-explorer__node--c" />
    </div>
  );
}

export function HomeSectorExplorer({
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
  const [activeIndex, setActiveIndex] = useState(0);
  const previewId = useId();
  if (items.length === 0) return null;

  const t = copy(locale);
  const safeIndex = Math.min(activeIndex, items.length - 1);
  const activeItem = items[safeIndex]!;
  const activeTranslation = translation(activeItem);
  const media = sectorMedia(activeItem);
  const title = text(activeTranslation.name ?? activeTranslation.title);
  const description = text(activeTranslation.shortDescription ?? activeTranslation.excerpt);
  const slug = text(activeTranslation.slug);

  return (
    <section className="section home-sector-explorer" data-home-section="sectors">
      <div className="container-wide">
        <header className="home-section-header home-sector-explorer__header">
          <div data-reveal="up">
            {Boolean(content.eyebrow) && <span className="eyebrow">{text(content.eyebrow)}</span>}
            {Boolean(content.title) && <h2>{text(content.title)}</h2>}
            {Boolean(content.body) && <p>{text(content.body)}</p>}
            {demo && <span className="home-demo-badge">{t.demoContent}</span>}
          </div>
          <span className="home-sector-explorer__count" data-reveal="fade" aria-hidden="true">
            {String(items.length).padStart(2, '0')} / SECTORS
          </span>
        </header>

        <div className="home-sector-explorer__surface" data-reveal="up">
          {/* Preview region — labelled by the active sector heading */}
          <div
            className="home-sector-explorer__preview"
            id={previewId}
            aria-live="polite"
            aria-atomic="true"
          >
            <div
              className="home-sector-explorer__visual"
              key={`${String(activeItem.id)}-${safeIndex}`}
            >
              {media?.url ? (
                <Image
                  src={media.url}
                  alt={media.translations?.[0]?.altText ?? title}
                  fill
                  sizes="(max-width: 768px) 100vw, 58vw"
                />
              ) : (
                <SectorFallback variant={safeIndex} />
              )}
              <span className="home-sector-explorer__visual-index" aria-hidden="true">
                {String(safeIndex + 1).padStart(2, '0')}
              </span>
            </div>
            <div className="home-sector-explorer__active-copy">
              <span className="eyebrow">{t.activeSector}</span>
              <h3>{title}</h3>
              {description && <p>{description}</p>}
              {slug && (
                <Link href={`/${locale}/industries/${slug}`}>
                  {t.exploreSector}
                  <Icon name="arrow" />
                </Link>
              )}
            </div>
          </div>

          {/* Selector buttons — use aria-pressed (Option A) */}
          <div className="home-sector-explorer__list" role="group" aria-label={text(content.title)}>
            {items.map((item, index) => {
              const tr = translation(item);
              const itemTitle = text(tr.name ?? tr.title);
              const selected = index === safeIndex;
              return (
                <button
                  key={String(item.id ?? index)}
                  className="home-sector-explorer__row"
                  type="button"
                  aria-pressed={selected}
                  aria-controls={previewId}
                  onClick={() => setActiveIndex(index)}
                  onFocus={() => setActiveIndex(index)}
                  onMouseEnter={() => setActiveIndex(index)}
                  onKeyDown={(event) => {
                    if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
                    event.preventDefault();
                    const next =
                      event.key === 'Home'
                        ? 0
                        : event.key === 'End'
                          ? items.length - 1
                          : (index + (event.key === 'ArrowDown' ? 1 : -1) + items.length) %
                            items.length;
                    setActiveIndex(next);
                    // Focus the next button in the list
                    const buttons = document.querySelectorAll<HTMLButtonElement>(
                      '.home-sector-explorer__row',
                    );
                    buttons[next]?.focus();
                  }}
                >
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  <strong>{itemTitle}</strong>
                  <Icon name="arrow" />
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
