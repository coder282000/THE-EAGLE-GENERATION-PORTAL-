'use client';

// SCR-021 — Onboarding wizard, photo and bio
// Route: /onboarding/profile

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { Textarea } from '@/components/textarea';

export default function OnboardingProfilePage() {
  const router = useRouter();
  const [bio, setBio] = useState('');
  const [photoName, setPhotoName] = useState('');
  const [error, setError] = useState<string | null>(null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (bio.trim().length < 20) {
      setError('Bio must be at least 20 characters — this is what other members see.');
      return;
    }
    setError(null);
    router.push('/onboarding/interests');
  }

  return (
    <div className="mx-auto max-w-3xl p-6">
      <nav aria-label="Progress" className="mb-4">
        <ol className="flex items-center gap-2 text-xs text-ink/60">
          <li className="font-medium text-sky">1. Profile</li>
          <li aria-hidden>·</li>
          <li>2. Interests</li>
          <li aria-hidden>·</li>
          <li>3. Preferences</li>
        </ol>
      </nav>

      <header className="mb-6">
        <p className="text-xs uppercase tracking-wide text-ink/60">Step 1 of 3</p>
        <h1 className="mt-1 text-2xl font-semibold text-ink">Your profile</h1>
        <p className="mt-2 text-sm text-ink/70">
          Introduce yourself. This is what your chapter and cohort see when they meet you.
        </p>
      </header>

      <Card>
        <form onSubmit={submit}>
          <div>
            <label className="block text-xs font-medium text-ink/70">Profile photo</label>
            <div className="mt-2 flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-ink/5 text-ink/40">
                <span aria-hidden className="text-lg">+</span>
              </div>
              <label className="cursor-pointer rounded-md border border-ink/20 bg-paper px-3 py-1.5 text-sm font-medium text-ink hover:bg-ink/5">
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={(e) => setPhotoName(e.target.files?.[0]?.name ?? '')}
                />
                Choose photo
              </label>
              {photoName ? (
                <span className="text-xs text-ink/60">{photoName}</span>
              ) : null}
            </div>
          </div>

          <div className="mt-5">
            <Textarea
              label="Short bio"
              hint="At least 20 characters. What are you building, leading or learning?"
              value={bio}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setBio(e.target.value)}
              rows={5}
              required
            />
            <p className="mt-1 text-xs text-ink/60">{bio.length} characters</p>
          </div>

          {error ? <p role="alert" className="mt-3 text-xs text-red-700">{error}</p> : null}

          <div className="mt-5 flex flex-wrap gap-2">
            <Button variant="primary" type="submit">Continue</Button>
            <Link
              href="/dashboard"
              className="rounded-md border border-ink/20 bg-paper px-3 py-2 text-sm font-medium text-ink hover:bg-ink/5"
            >
              Skip
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
}