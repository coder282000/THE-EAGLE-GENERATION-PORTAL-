"use client";

import { Button } from "@/components/button";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="p-6">
      <h2 className="text-lg font-semibold text-ink">Could not load safeguarding cases</h2>
      <p className="mt-1 text-sm text-ink/60">Something went wrong. Try again.</p>
      <Button variant="primary" className="mt-4" onClick={reset}>Retry</Button>
    </div>
  );
}