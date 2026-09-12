'use client';
import { useEffect, useRef, useState } from 'react';
import type { Media } from '@gatevia/api-client';
import { Button, Input } from '@gatevia/ui';
import { api } from '@/lib/api';
import { MediaBrowser } from './media-browser';
import { useAdminI18n } from './admin-locale-provider';

export function MediaPicker({ value, onSelect, acceptMimePrefix }: { value?: string; onSelect: (id: string) => void; acceptMimePrefix?: string | undefined }) {
  const { t } = useAdminI18n();
  const dialog = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState<Media | null>(null);
  const [pending, setPending] = useState<Media | null>(null);

  useEffect(() => {
    if (!value) { setCurrent(null); return; }
    let active = true;
    void api<Media>(`/admin/media/${encodeURIComponent(value)}`).then((row) => { if (active) setCurrent(row); }).catch(() => { if (active) setCurrent(null); });
    return () => { active = false; };
  }, [value]);

  function show() {
    setPending(current); setOpen(true);
    window.requestAnimationFrame(() => dialog.current?.showModal());
  }
  function close() { dialog.current?.close(); setOpen(false); }
  function confirm(row = pending) {
    if (!row) return;
    onSelect(row.id); setCurrent(row); close();
  }

  return <div className="media-picker-field">
    <div className="media-picker-field__selection">
      {current?.url && current.mimeType.startsWith('image/') && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={current.url} alt="" width={72} height={48}/>
      )}
      <Input readOnly value={current?.originalFilename ?? value ?? ''} placeholder={t('media.noSelection')}/>
      <Button type="button" onClick={show}>{t('action.chooseMedia')}</Button>
      {value && <Button type="button" variant="secondary" onClick={() => { onSelect(''); setCurrent(null); }}>{t('action.clear')}</Button>}
    </div>
    <dialog ref={dialog} className="media-picker-dialog" onClose={() => setOpen(false)}>
      <div className="media-picker-dialog__header"><div><h2>{t('media.pickerTitle')}</h2>{acceptMimePrefix && <span className="cell-meta">{acceptMimePrefix}*</span>}</div><button type="button" className="text-link" onClick={close} aria-label={t('action.close')}>✕</button></div>
      <div className="media-picker-dialog__body">{open && <MediaBrowser {...(pending?.id ? { selectedId: pending.id } : {})} onSelected={setPending} onConfirm={confirm} {...(acceptMimePrefix ? { mimePrefix: acceptMimePrefix } : {})} pageSize={24}/>}</div>
      <div className="media-picker-dialog__footer"><span className="cell-meta">{pending ? pending.originalFilename : t('media.noSelection')}</span><div><Button type="button" variant="secondary" onClick={close}>{t('action.cancel')}</Button><Button type="button" disabled={!pending} onClick={() => confirm()}>{t('action.select')}</Button></div></div>
    </dialog>
  </div>;
}
