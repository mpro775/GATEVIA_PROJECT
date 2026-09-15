import Link from 'next/link';
import { MediaImage } from '@/components/media-image';
import { list, text } from '@/lib/content';
import { mediaFromMap, type MediaMap } from '@/lib/media';

export function editorialHeadingId(value: unknown, index: number): string {
  const base = text(value)
    .normalize('NFKD')
    .toLowerCase()
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64);
  return `section-${index + 1}${base ? `-${base}` : ''}`;
}

export function RichBlocks({
  blocks,
  media = {},
}: {
  blocks: unknown;
  media?: MediaMap;
}) {
  return (
    <>
      {list(blocks).map((raw, index) => {
        const block = raw as Record<string, unknown>;
        const type = text(block.type);
        if (type === 'heading') {
          const id = editorialHeadingId(block.text, index);
          const level = Number(block.level) === 3 ? 3 : 2;
          return level === 3 ? (
            <h3 id={id} key={index} data-reveal="up">{text(block.text)}</h3>
          ) : (
            <h2 id={id} key={index} data-reveal="up">{text(block.text)}</h2>
          );
        }
        if (type === 'quote')
          return (
            <blockquote key={index} data-reveal="up">
              {text(block.text)}
              {Boolean(block.attribution) && <footer>{text(block.attribution)}</footer>}
            </blockquote>
          );
        if (type === 'list')
          return block.ordered ? (
            <ol key={index}>
              {list(block.items).map((item, i) => (
                <li key={i}>{text(item)}</li>
              ))}
            </ol>
          ) : (
            <ul key={index}>
              {list(block.items).map((item, i) => (
                <li key={i}>{text(item)}</li>
              ))}
            </ul>
          );
        if (type === 'link')
          return (
            <p key={index}>
              <Link href={text(block.href)}>{text(block.text)}</Link>
            </p>
          );
        if (type === 'image') {
          const item = mediaFromMap(media, block.mediaId);
          return item?.url ? (
            <figure className="editorial-media" key={index} data-reveal="media">
              <MediaImage
                media={item}
                preset="content"
                width={1280}
                height={800}
                sizes="(max-width: 850px) 100vw, 800px"
              />
            </figure>
          ) : null;
        }
        if (type === 'callout')
          return (
            <aside key={index} className="panel" data-reveal="fade">
              {text(block.text)}
            </aside>
          );
        if (type === 'table')
          return (
            <div key={index} className="table-wrap">
              <table>
                <thead>
                  <tr>
                    {list(block.headers).map((header, i) => (
                      <th key={i}>{text(header)}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {list(block.rows).map((rawRow, i) => (
                    <tr key={i}>
                      {list(rawRow).map((cell, j) => (
                        <td key={j}>{text(cell)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        if (type === 'embed') {
          const provider = text(block.provider);
          const videoId = text(block.videoId);
          const src =
            provider === 'youtube'
              ? `https://www.youtube-nocookie.com/embed/${videoId}`
              : provider === 'vimeo'
                ? `https://player.vimeo.com/video/${videoId}`
                : '';
          return src ? (
            <iframe key={index} src={src} title="Embedded video" loading="lazy" allowFullScreen />
          ) : null;
        }
        return <p key={index}>{text(block.text)}</p>;
      })}
    </>
  );
}

export function ContentItems({ items }: { items: unknown }) {
  return (
    <ul className="content-items">
      {list(items).map((raw, index) => {
        if (typeof raw === 'string') return <li key={index}>{raw}</li>;
        const item = raw as Record<string, unknown>;
        return (
          <li key={index}>
            {Boolean(item.title) && <strong>{text(item.title)} </strong>}
            {text(item.body ?? item.label ?? item.value)}
            {text(item.suffix)}
          </li>
        );
      })}
    </ul>
  );
}
