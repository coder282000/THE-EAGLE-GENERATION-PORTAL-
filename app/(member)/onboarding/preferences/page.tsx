'use client';

// SCR-023 — Onboarding wizard, notification and privacy preferences
// Route: /onboarding/preferences

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/button';
import { Card } from '@/components/card';

export default function OnboardingPreferencesPage() {
  const router = useRouter();

  const [notifyEmail, setNotifyEmail] = useState(true);
  const [notifySms, setNotifySms] = useState(false);
  const [notifyPush, setNotifyPush] = useState(true);
  const [marketingOptIn, setMarketingOptIn] = useState(false);
  const [profileVisible, setProfileVisible] = useState(true);
  const [submitted, setSubmitted] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <Card>
          <h1 className="text-lg font-semibold text-ink">You&apos;re all set</h1>
          <p className="mt-2 text-sm text-ink/70">
            Your profile is ready. Welcome to the Eagle Generation.
          </p>
          <div className="mt-4">
            <Button variant="primary" onClick={() => router.push('/dashboard')}>
              Go to my dashboard
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl p-6">
      <nav aria-label="Progress" className="mb-4">
        <ol className="flex items-center gap-2 text-xs text-ink/60">
          <li>1. Profile</li>
          <li aria-hidden>·</li>
          <li>2. Interests</li>
          <li aria-hidden>·</li>
          <li className="font-medium text-sky">3. Preferences</li>
        </ol>
      </nav>

      <header className="mb-6">
        <p className="text-xs uppercase tracking-wide text-ink/60">Step 3 of 3</p>
        <h1 className="mt-1 text-2xl font-semibold text-ink">Your preferences</h1>
        <p className="mt-2 text-sm text-ink/70">
          Control how we reach you and how your profile appears to other members.
        </p>
      </header>

      <Card>
        <form onSubmit={submit}>
          <fieldset>
            <legend className="text-xs font-medium uppercase tracking-wide text-ink/60">
              Notification channels
            </legend>
            <div className="mt-3 space-y-3">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={notifyEmail}
                  onChange={(e) => setNotifyEmail(e.target.checked)}
                />
                <div>
                  <p className="text-sm text-ink">Email</p>
                  <p className="text-xs text-ink/60">Chapter announcements, cohort updates, receipts.</p>
                </div>
              </label>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={notifySms}
                  onChange={(e) => setNotifySms(e.target.checked)}
                />
                <div>
                  <p className="text-sm text-ink">SMS</p>
                  <p className="text-xs text-ink/60">
                    Only for time-critical notices: event reminders, session starts, security.
                  </p>
                </div>
              </label>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={notifyPush}
                  onChange={(e) => setNotifyPush(e.target.checked)}
                />
                <div>
                  <p className="text-sm text-ink">Push notifications</p>
                  <p className="text-xs text-ink/60">Real-time alerts in your browser or PWA.</p>
                </div>
              </label>
            </div>
          </fieldset>

          <fieldset className="mt-6">
            <legend className="text-xs font-medium uppercase tracking-wide text-ink/60">
              Marketing and profile
            </legend>
            <div className="mt-3 space-y-3">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={marketingOptIn}
                  onChange={(e) => setMarketingOptIn(e.target.checked)}
                />
                <div>
                  <p className="text-sm text-ink">Marketing emails</p>
                  <p className="text-xs text-ink/60">
                    Optional. Separate from transactional emails. You can change this any time.
                  </p>
                </div>
              </label>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={profileVisible}
                  onChange={(e) => setProfileVisible(e.target.checked)}
                />
                <div>
                  <p className="text-sm text-ink">Profile visible to members</p>
                  <p className="text-xs text-ink/60">
                    When off, only your chapter leaders and administrators can see your profile.
                  </p>
                </div>
              </label>
            </div>
          </fieldset>

          <div className="mt-6 flex flex-wrap gap-2">
            <Button variant="primary" type="submit">Finish</Button>
            <button
              type="button"
              onClick={() => router.back()}
              className="rounded-md border border-ink/20 bg-paper px-3 py-2 text-sm font-medium text-ink hover:bg-ink/5"
            >
              Back
            </button>
          </div>
          <p className="mt-3 text-xs text-ink/60">
            These preferences are covered by the platform Privacy Notice. You can change any of them
            later from /profile/settings.
          </p>
        </form>
      </Card>
    </div>
  );
}