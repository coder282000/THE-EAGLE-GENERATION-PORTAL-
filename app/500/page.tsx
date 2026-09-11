'use client';

// SCR-035 — 500 Internal Server Error
// Route: /500

import Link from 'next/link';

export default function ServerErrorPage() {
  return (
    <div className="mx-auto max-w-2xl p-6">
      <div className="rounded-lg border border-ink/10 bg-paper p-8 text-center">
        <p className="text-5xl font-semibold text-ink/30">500</p>
        <h1 className="mt-4 text-xl font-semibold text-ink">Something went wrong on our side</h1>
        <p className="mt-2 text-sm text-ink/70">
          We&apos;re looking into it. Please try again in a moment, or contact support if the
          problem persists.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Link
            href="/"
            className="rounded-md bg-sky px-4 py-2 text-sm font-medium text-white hover:bg-sky/90"
          >
            Home
          </Link>
          <Link
            href="/help/support"
            className="rounded-md border border-ink/20 bg-paper px-4 py-2 text-sm font-medium text-ink hover:bg-ink/5"
          >
            Contact support
          </Link>
        </div>
        <p className="mt-6 text-xs text-ink/50">
          If you&apos;re seeing this often, please share the time and what you were doing.
        </p>
      </div>
    </div>
  );
}