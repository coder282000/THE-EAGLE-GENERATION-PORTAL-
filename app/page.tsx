"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/button";
import { Wordmark } from "@/components/wordmark";
import { PillarTag } from "@/components/pillarTag";

const TIERS = [
  { id: "STUDENT", name: "Student", age: "18–25 years", description: "Currently enrolled at a campus chapter or partner university." },
  { id: "PROFESSIONAL", name: "Professional", age: "25–40 years, 2+ yrs experience", description: "Working across marketplace, governance, or technology sectors." },
  { id: "ASSOCIATE", name: "Associate", age: "Any age", description: "Supporting the movement outside the campus or professional track." },
];

export default function HomePage() {
  const [tier, setTier] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-paper">
      {/* Header */}
      <header className="border-b border-ink-100 bg-white">
        <div className="container-portal flex h-16 items-center justify-between">
          <Wordmark />
        </div>
      </header>

      {/* Hero */}
      <section className="bg-ink-900 py-14 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)', backgroundSize: '3px 3px' }} />
        <div className="container-portal relative">
          <p className="font-mono text-xs uppercase tracking-widest text-dawn-400">
            Isaiah 40:31
          </p>
          <h1 className="mt-3 font-display text-3xl font-semibold leading-tight">
            Mount up with wings as eagles.
          </h1>
          <p className="mt-3 text-[15px] text-ink-200">
            One identity. One learning record. One chapter. One place to belong.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <PillarTag pillar="marketplace" />
            <PillarTag pillar="governance" />
            <PillarTag pillar="technology" />
          </div>
        </div>
      </section>

      {/* Tier selection */}
      <section className="container-portal py-10">
        <h2 className="font-display text-lg font-semibold text-ink-900">Apply for membership</h2>
        <p className="mt-1 text-sm text-ink-500">
          Membership is by application and vetting — select the tier that fits you.
        </p>

        <div className="flex flex-col gap-3 mt-6">
          {TIERS.map((t) => {
            const selected = tier === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTier(t.id)}
                aria-pressed={selected}
                className={`w-full text-left rounded-lg border p-4 transition-all duration-150
                  ${selected ? "border-ink-900 bg-ink-900 shadow-raised" : "border-ink-200 bg-white hover:border-ink-400"}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className={`font-display font-semibold text-[15px] ${selected ? "text-white" : "text-ink-900"}`}>{t.name}</p>
                    <p className={`text-[13px] mt-0.5 ${selected ? "text-ink-300" : "text-ink-400"}`}>{t.age}</p>
                  </div>
                  <div className={`mt-0.5 h-5 w-5 shrink-0 rounded-full border-2 flex items-center justify-center
                    ${selected ? "border-dawn-400 bg-dawn-400" : "border-ink-200"}`}
                  >
                    {selected && (
                      <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                        <path d="M2.5 6.5L5 9L9.5 3.5" stroke="#141B2E" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                </div>
                <p className={`text-[13.5px] mt-2 leading-relaxed ${selected ? "text-ink-200" : "text-ink-500"}`}>{t.description}</p>
              </button>
            );
          })}
        </div>

        <Link href={tier ? `/apply/form?tier=${tier}` : "#"} className="block mt-7">
          <Button variant="primary" size="lg" fullWidth disabled={!tier}>
            Continue
          </Button>
        </Link>

        {/* Footer Links – updated with all public routes */}
        <div className="mt-8 pt-6 border-t border-ink-100 space-y-3">
          <p className="text-center text-[13.5px] text-ink-400">
            Already applied?{" "}
            <Link href="/apply/status" className="text-ink-900 font-medium underline underline-offset-2">
              Check your status
            </Link>
          </p>
          <p className="text-center text-[13.5px] text-ink-400">
            Already a member?{" "}
            <Link href="/login" className="text-ink-900 font-medium underline underline-offset-2">
              Log in
            </Link>
          </p>
          <p className="text-center text-[13.5px] text-ink-400">
            Explore events?{" "}
            <Link href="/events" className="text-ink-900 font-medium underline underline-offset-2">
              Upcoming Events
            </Link>
          </p>
          <p className="text-center text-[13.5px] text-ink-400">
            Browse our shop?{" "}
            <Link href="/shop" className="text-ink-900 font-medium underline underline-offset-2">
              Shop Now
            </Link>
          </p>
          <p className="text-center text-[13.5px] text-ink-400">
            Verify a certificate?{" "}
            <Link href="/verify/example-id" className="text-ink-900 font-medium underline underline-offset-2">
              Verify Certificate
            </Link>
          </p>
          <p className="text-center text-[13.5px] text-ink-400">
            Support the movement?{" "}
            <Link href="/give" className="text-ink-900 font-medium underline underline-offset-2">
              Give Now
            </Link>
          </p>
          <p className="text-center text-[13.5px] text-ink-400">
            Need help?{" "}
            <Link href="/help" className="text-ink-900 font-medium underline underline-offset-2">
              Help Centre
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}
