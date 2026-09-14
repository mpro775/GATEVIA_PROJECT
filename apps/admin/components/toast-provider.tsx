'use client';

import { useEffect, useRef, useState } from 'react';
import { ADMIN_TOAST_EVENT, type AdminToastPayload } from '@/lib/toast';
import { useAdminI18n } from './admin-locale-provider';

type ToastItem = AdminToastPayload & { id: number };

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const { t } = useAdminI18n();
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const sequence = useRef(0);
  const lastToast = useRef<{ key: string; at: number } | null>(null);

  useEffect(() => {
    const onToast = (event: Event) => {
      const detail = (event as CustomEvent<AdminToastPayload>).detail;
      if (!detail) return;
      const message = detail.message?.trim() || (detail.kind === 'success' ? t('toast.success') : detail.kind === 'error' ? t('toast.error') : t('toast.info'));
      const now = Date.now();
      const key = `${detail.kind}:${message}`;
      if (lastToast.current?.key === key && now - lastToast.current.at < 900) return;
      lastToast.current = { key, at: now };

      const id = ++sequence.current;
      setToasts((current) => [...current.slice(-3), { ...detail, message, id }]);
      window.setTimeout(() => {
        setToasts((current) => current.filter((item) => item.id !== id));
      }, detail.kind === 'error' ? 6500 : 4200);
    };

    window.addEventListener(ADMIN_TOAST_EVENT, onToast);
    return () => window.removeEventListener(ADMIN_TOAST_EVENT, onToast);
  }, [t]);

  return (
    <>
      {children}
      <div className="admin-toast-viewport" aria-live="polite" aria-atomic="false">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`admin-toast admin-toast--${toast.kind}`}
            role={toast.kind === 'error' ? 'alert' : 'status'}
          >
            <span className="admin-toast__icon" aria-hidden="true">
              {toast.kind === 'success' ? '✓' : toast.kind === 'error' ? '!' : 'i'}
            </span>
            <span>{toast.message}</span>
            <button
              type="button"
              className="admin-toast__close"
              aria-label={t('action.close')}
              onClick={() => setToasts((current) => current.filter((item) => item.id !== toast.id))}
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </>
  );
}
