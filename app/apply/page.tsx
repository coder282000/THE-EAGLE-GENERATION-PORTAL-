"use client";

import Link from "next/link";
import { Button } from "@/components/button";
import { Wordmark } from "@/components/wordmark";

export default function ApplyLandingPage() {
  return (
    <div className="min-h-screen bg-paper">
      <header className="border-b border-ink-100 bg-white">
        <div className="container-portal flex h-16 items-center">
          <Link href="/">
            <Wordmark />
          </Link>
        </div>
      </header>

      <section className="container-portal py-14 flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-full bg-dawn-50 flex items-center justify-center mb-6">
          <span className="text-3xl">🦅</span>
        </div>

        <h1 className="font-display text-3xl font-semibold text-ink-900">
          Apply to Join The Eagle Generation
        </h1>
        <p className="mt-2 text-ink-500 max-w-[36ch]">
          Membership is by application and vetting. Start your journey by selecting your membership tier.
        </p>

        <div className="mt-8 w-full max-w-sm">
          <Link href="/">
            <Button variant="primary" size="lg" fullWidth>
              Start Your Application
            </Button>
          </Link>
        </div>

        <p className="mt-4 text-sm text-ink-400">
          Already applied?{" "}
          <Link href="/apply/status" className="text-sky-600 hover:underline font-medium">
            Check your status
          </Link>
        </p>
      </section>
    </div>
  );
}
