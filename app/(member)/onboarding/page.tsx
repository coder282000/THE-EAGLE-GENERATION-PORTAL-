'use client';

// SCR-020 — Onboarding wizard, welcome
// Route: /onboarding

import Link from 'next/link';
import { Card } from '@/components/card';

export default function OnboardingWelcomePage() {
  return (
    <div className="mx-auto max-w-3xl p-6">
      <header className="mb-6">
        <p className="text-xs uppercase tracking-wide text-ink/60">Welcome</p>
        <h1 className="mt-1 text-2xl font-semibold text-ink">
          Welcome to the Eagle Generation
        </h1>
        <p className="mt-2 text-sm text-ink/70">
          Your application was approved. Let&apos;s set up your profile in three short steps:
          introduce yourself, choose your pillars, and set your preferences.
        </p>
      </header>

      <Card>
        <ol className="space-y-4">
          <li className="flex gap-3">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-sky/15 text-xs font-semibold text-sky">
              1
            </span>
            <div>
              <p className="text-sm font-medium text-ink">Your profile</p>
              <p className="mt-0.5 text-xs text-ink/60">
                Add a photo and a short bio so your chapter knows who you are.
              </p>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-sky/15 text-xs font-semibold text-sky">
              2
            </span>
            <div>
              <p className="text-sm font-medium text-ink">Your pillars</p>
              <p className="mt-0.5 text-xs text-ink/60">
                Choose the programme pillars you want to focus on: Marketplace, Governance, Technology.
              </p>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-sky/15 text-xs font-semibold text-sky">
              3
            </span>
            <div>
              <p className="text-sm font-medium text-ink">Your preferences</p>
              <p className="mt-0.5 text-xs text-ink/60">
                Control what we notify you about and how your profile is visible.
              </p>
            </div>
          </li>
        </ol>
      </Card>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href="/onboarding/profile"
          className="rounded-md bg-sky px-4 py-2 text-sm font-medium text-white hover:bg-sky/90"
        >
          Begin
        </Link>
        <Link
          href="/dashboard"
          className="rounded-md border border-ink/20 bg-paper px-4 py-2 text-sm font-medium text-ink hover:bg-ink/5"
        >
          Skip for now
        </Link>
      </div>
    </div>
  );
}