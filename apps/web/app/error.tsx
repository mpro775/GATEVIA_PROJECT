'use client';
import { ErrorState } from '@gatevia/ui';
export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="error-boundary">
      <div>
        <ErrorState title="Something went wrong" description="The page could not be loaded." />
        <button className="gv-button" onClick={reset}>
          Try again
        </button>
      </div>
    </main>
  );
}
