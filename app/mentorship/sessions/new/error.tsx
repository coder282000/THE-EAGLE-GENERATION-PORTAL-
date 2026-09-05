"use client";

import { MemberLayout } from "@/components/layout/memberLayout";
import { Button } from "@/components/button";

export default function SessionSchedulingError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <MemberLayout>
      <div className="max-w-2xl mx-auto flex flex-col items-center justify-center py-12 text-center">
        <span className="text-4xl mb-4">⚠️</span>
        <p className="text-lg text-ink-600">Something went wrong loading the scheduling page.</p>
        <p className="text-sm text-ink-400 mt-1">{error.message}</p>
        <Button variant="primary" className="mt-4" onClick={reset}>
          Try again
        </Button>
      </div>
    </MemberLayout>
  );
}