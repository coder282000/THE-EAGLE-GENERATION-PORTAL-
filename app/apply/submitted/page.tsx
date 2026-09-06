'use client';
"use client";

import Link from "next/link";
import { Button } from "@/components/button";

export default function SubmittedPage() {
  return (
    <div className="min-h-screen bg-paper flex flex-col items-center justify-center p-6">
      <div className="container-portal flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-full bg-dawn-50 flex items-center justify-center mb-6">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#E29B3D" strokeWidth="2">
            <path d="M20 6L9 17L4 12" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>

        <h1 className="font-display font-semibold text-[26px] text-ink-900">Application Submitted</h1>
        <p className="text-ink-500 text-[15px] mt-2 max-w-[32ch]">
          Your application is being reviewed. We'll notify you by email when there's an update.
        </p>

        <div className="mt-8 w-full max-w-[280px]">
          <Link href="/">
            <Button variant="primary" size="lg" fullWidth>
              Return Home
            </Button>
          </Link>
        </div>

        <p className="text-[13px] text-ink-400 mt-4">
          Reference: <span className="font-mono">TEG-26-PND-0042</span>
        </p>
      </div>
    </div>
  );
}
