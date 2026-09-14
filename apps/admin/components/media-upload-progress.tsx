'use client';

import type { UploadProgressItem } from '@/lib/media-upload';
import { useAdminI18n } from './admin-locale-provider';

export function MediaUploadProgress({ items }: { items: UploadProgressItem[] }) {
  const { t, formatNumber } = useAdminI18n();
  if (!items.length) return null;

  const totalBytes = items.reduce((sum, item) => sum + Math.max(item.size, 1), 0);
  const loadedBytes = items.reduce((sum, item) => sum + Math.min(item.loaded, item.size), 0);
  const overall = Math.max(0, Math.min(100, Math.round((loadedBytes / totalBytes) * 100)));

  return (
    <div className="media-upload-progress" role="status" aria-live="polite">
      <div className="media-upload-progress__summary">
        <strong>{t('media.uploadProgress')}</strong>
        <span>{formatNumber(overall)}%</span>
      </div>
      <progress value={overall} max={100}>{overall}%</progress>
      <div className="media-upload-progress__files">
        {items.map((item) => (
          <div className="media-upload-progress__file" key={item.id}>
            <span title={item.name}>{item.name}</span>
            <span>
              {item.phase === 'finalizing'
                ? t('media.finalizing')
                : item.phase === 'done'
                  ? t('media.uploadComplete')
                  : item.phase === 'error'
                    ? t('status.failed')
                    : `${formatNumber(item.percent)}%`}
            </span>
            <progress value={item.percent} max={100}>{item.percent}%</progress>
          </div>
        ))}
      </div>
    </div>
  );
}
