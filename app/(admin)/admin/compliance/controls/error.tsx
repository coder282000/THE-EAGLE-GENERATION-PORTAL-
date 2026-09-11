'use client';

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="p-6">
      <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4">
        <h2 className="text-sm font-semibold text-red-900">Could not load control evidence</h2>
        <p className="mt-1 text-sm text-red-800">
          The control dashboard failed to render. Do not make compliance assertions from another tab until
          this succeeds — the control register is authoritative.
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-3 rounded-md bg-red-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-800"
        >
          Retry
        </button>
      </div>
    </div>
  );
}