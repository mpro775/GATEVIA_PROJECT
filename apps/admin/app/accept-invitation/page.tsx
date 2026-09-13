import { Suspense } from 'react';
import { ResetForm } from '@/components/reset-form';
import { AuthLoading } from '@/components/auth-loading';
export default function Page() {
  return (
    <main className="login-page">
      <section className="login-art">
        <div className="login-portal">
          <strong>GATEVIA</strong>
        </div>
      </section>
      <section className="login-form">
        <Suspense fallback={<AuthLoading />}>
          <ResetForm invitation />
        </Suspense>
      </section>
    </main>
  );
}
