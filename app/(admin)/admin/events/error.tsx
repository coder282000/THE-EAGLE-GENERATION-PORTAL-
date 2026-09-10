'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[admin/events] error:', error);
  }, [error]);

  return (
    <div className="space-y-4 rounded-lg border border-ink/10 bg-white p-8 text-center">
      <h2 className="text-lg font-semibold text-ink">
        We couldn&apos;t load events.
      </h2>
      <p className="text-sm text-ink/60">
        Something went wrong while fetching the event list.
      </p>
      <button
        type="button"
        onClick={reset}
        className="inline-flex items-center rounded-md bg-sky px-4 py-2 text-sm font-medium text-white hover:bg-sky/90"
      >
        Try again
      </button>
    </div>
  );
}