'use client';

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="p-6">
      <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4">
        <h2 className="text-sm font-semibold text-red-900">Could not load SAR filing log</h2>
        <p className="mt-1 text-sm text-red-800">
          The SAR list failed to render. Do not approve or file anything from another tab until this
          succeeds — filing deadlines are regulatory.
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