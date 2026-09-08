import { LoginForm } from '@/components/login-form';
export default function Login() {
  return (
    <main className="login-page">
      <section className="login-art">
        <div className="login-portal">
          <strong>GATEVIA</strong>
        </div>
      </section>
      <section className="login-form">
        <LoginForm />
      </section>
    </main>
  );
}
