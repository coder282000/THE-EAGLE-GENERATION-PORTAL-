// app/admin/tasks/error.tsx
"use client";

import { Button } from "@/components/button";

export default function TasksError({ reset }: { reset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <span className="text-5xl mb-4" aria-hidden="true">
        ⚠️
      </span>
      <h2 className="text-xl font-semibold text-ink">
        Unable to load tasks
      </h2>
      <p className="text-sm text-ink/60 mt-2 max-w-md">
        Something went wrong while loading your task queue.
      </p>
      <Button variant="primary" className="mt-6" onClick={reset}>
        Try Again
      </Button>
    </div>
  );
}