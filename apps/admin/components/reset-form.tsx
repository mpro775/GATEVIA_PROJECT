'use client';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button, Field, Input } from '@gatevia/ui';
import { api } from '@/lib/api';
import { useAdminI18n } from './admin-locale-provider';
export function ResetForm({ invitation = false }: { invitation?: boolean }) {
  const { t } = useAdminI18n();
  const query = useSearchParams();
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    const data = new FormData(event.currentTarget);
    if (data.get('password') !== data.get('confirm')) {
      setMessage(t('auth.passwordMismatch'));
      setBusy(false);
      return;
    }
    try {
      await api('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token: query.get('token'), password: data.get('password') }),
      });
      router.replace('/login');
    } catch {
      setMessage(t('auth.linkInvalid'));
    } finally {
      setBusy(false);
    }
  }
  return (
    <form onSubmit={submit}>
      <div>
        <span className="eyebrow">GATEVIA ADMIN</span>
        <h1>{invitation ? t('auth.activate') : t('auth.resetPassword')}</h1>
      </div>
      <Field label={t('auth.newPassword')} hint={t('auth.passwordHint')}>
        <Input
          type="password"
          name="password"
          minLength={16}
          required
          autoComplete="new-password"
        />
      </Field>
      <Field label={t('auth.confirmPassword')}>
        <Input type="password" name="confirm" minLength={16} required autoComplete="new-password" />
      </Field>
      {message && (
        <div className="form-status form-status--error" role="alert">
          {message}
        </div>
      )}
      <Button disabled={busy}>{busy ? t('action.saving') : t('auth.setPassword')}</Button>
    </form>
  );
}
