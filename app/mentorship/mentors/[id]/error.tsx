"use client";

import { MemberLayout } from "@/components/layout/memberLayout";
import { Button } from "@/components/button";

export default function MentorProfileError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <MemberLayout>
      <div className="max-w-3xl mx-auto flex flex-col items-center justify-center py-12 text-center">
        <span className="text-4xl mb-4">⚠️</span>
        <p className="text-lg text-ink-600">Something went wrong loading this mentor profile.</p>
        <p className="text-sm text-ink-400 mt-1">{error.message}</p>
        <div className="flex gap-3 mt-4">
          <Button variant="primary" onClick={reset}>Try again</Button>
          <Button variant="outline" onClick={() => window.location.href = "/mentorship/find"}>
            Back to Mentors
          </Button>
        </div>
      </div>
    </MemberLayout>
  );
}
