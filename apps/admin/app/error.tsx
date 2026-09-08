'use client';
import { ErrorState } from '@gatevia/ui';
export default function Error({ reset }: { reset: () => void }) {
  return (
    <main className="admin-content">
      <ErrorState
        title="Something went wrong"
        description="The administration view could not be loaded."
      />
      <button className="gv-button" onClick={reset}>
        Retry
      </button>
    </main>
  );
}
