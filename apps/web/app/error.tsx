'use client';
import { ErrorState } from '@gatevia/ui';
import { Button } from '@gatevia/ui';
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
        <Button onClick={reset}>Try again</Button>
      </div>
    </main>
  );
}
