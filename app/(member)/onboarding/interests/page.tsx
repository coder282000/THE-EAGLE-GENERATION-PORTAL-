'use client';

// SCR-022 — Onboarding wizard, pillar interests
// Route: /onboarding/interests

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/button';
import { Card } from '@/components/card';

const PILLARS = [
  { id: 'MARKETPLACE', name: 'Marketplace', desc: 'Business, ethics, economics, and Kingdom-driven enterprise.' },
  { id: 'GOVERNANCE', name: 'Governance', desc: 'Public service, integrity, policy, and accountability.' },
  { id: 'TECHNOLOGY', name: 'Technology', desc: 'Innovation, ethics in AI, data stewardship, and building for Africa.' },
];

export default function OnboardingInterestsPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  function toggle(id: string) {
    setSelected((list) =>
      list.includes(id) ? list.filter((x) => x !== id) : [...list, id]
    );
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (selected.length === 0) {
      setError('Choose at least one pillar.');
      return;
    }
    setError(null);
    router.push('/onboarding/preferences');
  }

  return (
    <div className="mx-auto max-w-3xl p-6">
      <nav aria-label="Progress" className="mb-4">
        <ol className="flex items-center gap-2 text-xs text-ink/60">
          <li>1. Profile</li>
          <li aria-hidden>·</li>
          <li className="font-medium text-sky">2. Interests</li>
          <li aria-hidden>·</li>
          <li>3. Preferences</li>
        </ol>
      </nav>

      <header className="mb-6">
        <p className="text-xs uppercase tracking-wide text-ink/60">Step 2 of 3</p>
        <h1 className="mt-1 text-2xl font-semibold text-ink">Your pillars</h1>
        <p className="mt-2 text-sm text-ink/70">
          Choose the pillars you want to focus on. You can change this later from your profile.
        </p>
      </header>

      <Card>
        <form onSubmit={submit}>
          <fieldset>
            <legend className="sr-only">Choose pillars</legend>
            <div className="space-y-3">
              {PILLARS.map((p) => {
                const isOn = selected.includes(p.id);
                return (
                  <label
                    key={p.id}
                    className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 ${
                      isOn ? 'border-sky bg-sky/5' : 'border-ink/15 bg-paper hover:bg-ink/5'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isOn}
                      onChange={() => toggle(p.id)}
                      className="mt-0.5"
                    />
                    <div>
                      <p className={`text-sm font-medium ${isOn ? 'text-sky' : 'text-ink'}`}>
                        {p.name}
                      </p>
                      <p className="mt-0.5 text-xs text-ink/60">{p.desc}</p>
                    </div>
                  </label>
                );
              })}
            </div>
          </fieldset>

          {error ? <p role="alert" className="mt-3 text-xs text-red-700">{error}</p> : null}

          <div className="mt-5 flex flex-wrap gap-2">
            <Button variant="primary" type="submit">Continue</Button>
            <button
              type="button"
              onClick={() => router.back()}
              className="rounded-md border border-ink/20 bg-paper px-3 py-2 text-sm font-medium text-ink hover:bg-ink/5"
            >
              Back
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}