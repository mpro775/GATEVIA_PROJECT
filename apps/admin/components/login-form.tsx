'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Field, Input } from '@gatevia/ui';
import { api } from '@/lib/api';
import { useAdminI18n } from './admin-locale-provider';
export function LoginForm() {
  const { t } = useAdminI18n();
  const router = useRouter();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError('');
    const data = new FormData(event.currentTarget);
    try {
      await api('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: data.get('email'), password: data.get('password') }),
      });
      router.replace('/dashboard');
      router.refresh();
    } catch {
      setError(t('auth.invalid'));
    } finally {
      setBusy(false);
    }
  }
  return (
    <form onSubmit={submit}>
      <div>
        <span className="eyebrow">{t('auth.secure')}</span>
        <h1>{t('auth.welcome')}</h1>
        <p>{t('auth.description')}</p>
      </div>
      <Field label={t('auth.email')}>
        <Input name="email" type="email" autoComplete="username" required />
      </Field>
      <Field label={t('auth.password')}>
        <Input
          name="password"
          type="password"
          autoComplete="current-password"
          minLength={12}
          required
        />
      </Field>
      {error && (
        <div className="form-status form-status--error" role="alert">
          {error}
        </div>
      )}
      <Button disabled={busy}>{busy ? t('auth.signingIn') : t('auth.signIn')}</Button>
    </form>
  );
}
