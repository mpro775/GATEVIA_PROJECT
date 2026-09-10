import Link from 'next/link';
import { Icon } from '@gatevia/ui';
export default function NotFound() {
  return (
    <main className="error-boundary">
      <div className="gv-state">
        <span className="error-code">404</span>
        <h1>Page not found</h1>
        <p>The requested page is unavailable or has not been published.</p>
        <Link className="gv-button" href="/">
          Return home <Icon name="arrow" />
        </Link>
      </div>
    </main>
  );
}
