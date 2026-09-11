'use client';

// SCR-033 — 404 Not Found
// Route: /404

import Link from 'next/link';

export default function NotFoundPage() {
  return (
    <div className="mx-auto max-w-2xl p-6">
      <div className="rounded-lg border border-ink/10 bg-paper p-8 text-center">
        <p className="text-5xl font-semibold text-ink/30">404</p>
        <h1 className="mt-4 text-xl font-semibold text-ink">Page not found</h1>
        <p className="mt-2 text-sm text-ink/70">
          The page you are looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Link
            href="/"
            className="rounded-md bg-sky px-4 py-2 text-sm font-medium text-white hover:bg-sky/90"
          >
            Home
          </Link>
          <Link
            href="/dashboard"
            className="rounded-md border border-ink/20 bg-paper px-4 py-2 text-sm font-medium text-ink hover:bg-ink/5"
          >
            My dashboard
          </Link>
          <Link
            href="/help/support"
            className="rounded-md border border-ink/20 bg-paper px-4 py-2 text-sm font-medium text-ink hover:bg-ink/5"
          >
            Contact support
          </Link>
        </div>
      </div>
    </div>
  );
}