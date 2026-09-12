'use client';
import { useEffect, useRef, useState } from 'react';
import type { Media } from '@gatevia/api-client';
import { Button, EmptyState, Input } from '@gatevia/ui';
import { apiEnvelope } from '@/lib/api';
type MediaRow = Pick<
  Media,
  'id' | 'originalFilename' | 'mimeType' | 'status' | 'translations' | 'url'
>;
export function MediaPicker({
  value,
  onSelect,
  acceptMimePrefix,
}: {
  value?: string;
  onSelect: (id: string) => void;
  acceptMimePrefix?: string | undefined;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [rows, setRows] = useState<MediaRow[]>([]);
  const [q, setQ] = useState('');
  useEffect(() => {
    if (dialog.current?.open)
      void apiEnvelope<MediaRow>(
        `/admin/media?pageSize=100&status=ready&q=${encodeURIComponent(q)}`,
      ).then((result) => setRows(result.data));
  }, [q]);
  function open() {
    dialog.current?.showModal();
    void apiEnvelope<MediaRow>('/admin/media?pageSize=100&status=ready').then((result) =>
      setRows(result.data),
    );
  }
  const visibleRows = acceptMimePrefix
    ? rows.filter((row) => row.mimeType.startsWith(acceptMimePrefix))
    : rows;
  const selected = rows.find((row) => row.id === value);
  return (
    <div>
      <div className="toolbar">
        {selected?.url && selected.mimeType.startsWith('image/') ? (
          // The admin picker displays source thumbnails and does not need Next image optimization.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={selected.url}
            alt=""
            width={56}
            height={40}
            style={{ objectFit: 'cover', borderRadius: '.35rem' }}
          />
        ) : null}
        <Input
          readOnly
          value={selected?.originalFilename ?? value ?? ''}
          placeholder="No media selected"
        />
        <Button type="button" onClick={open}>
          Choose media
        </Button>
        {value ? (
          <Button type="button" variant="secondary" onClick={() => onSelect('')}>
            Clear
          </Button>
        ) : null}
      </div>
      <dialog ref={dialog} className="panel">
        <div className="page-title">
          <h2>Media picker</h2>
          <button className="text-link" onClick={() => dialog.current?.close()}>
            Close
          </button>
        </div>
        <Input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search media"
        />
        {visibleRows.length ? (
          <div className="media-grid">
            {visibleRows.map((row) => (
              <button
                className="media-tile"
                key={row.id}
                onClick={() => {
                  onSelect(row.id);
                  dialog.current?.close();
                }}
              >
                {row.url && row.mimeType.startsWith('image/') ? (
                  // The admin picker displays source thumbnails and does not need Next image optimization.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={row.url}
                    alt=""
                    loading="lazy"
                    style={{ width: '100%', aspectRatio: '16 / 10', objectFit: 'cover' }}
                  />
                ) : null}
                <strong>{row.originalFilename}</strong>
                <span className="cell-meta">{row.translations?.[0]?.altText ?? row.status}</span>
              </button>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No ready media found"
            description="Upload an approved asset in the Media Library first."
          />
        )}
      </dialog>
    </div>
  );
}
