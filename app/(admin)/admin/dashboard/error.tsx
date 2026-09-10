// app/admin/dashboard/error.tsx
"use client";

import { Button } from "@/components/button";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <span className="text-5xl mb-4" aria-hidden="true">
        ⚠️
      </span>
      <h2 className="text-xl font-semibold text-ink">
        Unable to load dashboard
      </h2>
      <p className="text-sm text-ink/60 mt-2 max-w-md">
        Something went wrong while loading the dashboard. Please try again.
      </p>
      <div className="flex gap-3 mt-6">
        <Button variant="outline" onClick={() => (window.location.href = "/admin/dashboard")}>
          Reload
        </Button>
        <Button variant="primary" onClick={reset}>
          Try Again
        </Button>
      </div>
    </div>
  );
}