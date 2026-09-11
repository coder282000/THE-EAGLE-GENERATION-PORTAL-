'use client';

// SCR-043 — Chapter Leader Management
// Route: /chapter/manage

import { useState } from 'react';
import Link from 'next/link';
import { MemberLayout } from '@/components/layout/memberLayout';
import { Button } from '@/components/button';
import { Card } from '@/components/card';

export default function ChapterManagePage() {
  const [chapterName, setChapterName] = useState('Kenyatta University');
  const [description, setDescription] = useState(
    'The Kenyatta University chapter of the Eagle Generation. Campus-based, open to all current students.'
  );
  const [requiresApproval, setRequiresApproval] = useState(true);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function save(e: React.FormEvent) {
    e.preventDefault();
    if (chapterName.trim().length < 3) {
      setError('Chapter name must be at least 3 characters.');
      return;
    }
    if (description.trim().length < 20) {
      setError('Description must be at least 20 characters.');
      return;
    }
    setError(null);
    setSaved(true);
  }

  return (
    <MemberLayout>
      <div className="mx-auto max-w-3xl p-6">
        <nav aria-label="Breadcrumb" className="mb-3 text-xs text-ink/60">
          <Link href="/chapter" className="hover:text-sky">My Chapter</Link>
          <span className="mx-2">/</span>
          <span className="text-ink">Manage</span>
        </nav>

        <header className="mb-6">
          <p className="text-xs uppercase tracking-wide text-ink/60">Chapter leader</p>
          <h1 className="mt-1 text-2xl font-semibold text-ink">Manage chapter</h1>
          <p className="mt-1 text-sm text-ink/70">
            Update your chapter name, description and join policy. All changes are audited and
            visible to your members.
          </p>
        </header>

        {saved ? (
          <div role="status" className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
            Chapter updated. Members will see the new details on their next visit.
          </div>
        ) : null}

        <Card>
          <form onSubmit={save}>
            <div>
              <label htmlFor="ch-name" className="block text-xs font-medium text-ink/70">Chapter name</label>
              <input
                id="ch-name"
                type="text"
                value={chapterName}
                onChange={(e) => setChapterName(e.target.value)}
                className="mt-1 w-full rounded-md border border-ink/15 bg-paper px-3 py-2 text-sm text-ink focus:border-sky focus:outline-none focus:ring-2 focus:ring-sky/40"
              />
            </div>

            <div className="mt-4">
              <label htmlFor="ch-desc" className="block text-xs font-medium text-ink/70">Description</label>
              <textarea
                id="ch-desc"
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1 w-full rounded-md border border-ink/15 bg-paper px-3 py-2 text-sm text-ink focus:border-sky focus:outline-none focus:ring-2 focus:ring-sky/40"
              />
              <p className="mt-1 text-xs text-ink/60">{description.length} characters</p>
            </div>

            <fieldset className="mt-4">
              <legend className="text-xs font-medium text-ink/70">Join policy</legend>
              <label className="mt-2 flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={requiresApproval}
                  onChange={(e) => setRequiresApproval(e.target.checked)}
                />
                <div>
                  <p className="text-sm text-ink">Require leader approval to join</p>
                  <p className="text-xs text-ink/60">
                    When on, prospective members must be approved before they see the chapter feed.
                  </p>
                </div>
              </label>
            </fieldset>

            {error ? <p role="alert" className="mt-3 text-xs text-red-700">{error}</p> : null}

            <div className="mt-5 flex flex-wrap gap-2">
              <Button variant="primary" type="submit">Save changes</Button>
              <Link
                href="/chapter"
                className="rounded-md border border-ink/20 bg-paper px-3 py-2 text-sm font-medium text-ink hover:bg-ink/5"
              >
                Back to chapter
              </Link>
            </div>
          </form>
        </Card>

        <Card className="mt-4">
          <h2 className="text-sm font-semibold text-ink">Leader tools</h2>
          <ul className="mt-3 space-y-2 text-sm">
            <li className="flex justify-between rounded border border-ink/10 p-3">
              <span className="text-ink">Manage roster</span>
              <Link href="/chapter" className="text-sky hover:underline">Open →</Link>
            </li>
            <li className="flex justify-between rounded border border-ink/10 p-3">
              <span className="text-ink">Post chapter announcement</span>
              <Link href="/announcements" className="text-sky hover:underline">Open →</Link>
            </li>
            <li className="flex justify-between rounded border border-ink/10 p-3">
              <span className="text-ink">Create chapter event</span>
              <Link href="/events" className="text-sky hover:underline">Open →</Link>
            </li>
            <li className="flex justify-between rounded border border-ink/10 p-3">
              <span className="text-ink">Attendance tracking</span>
              <span className="text-xs text-ink/50">Coming with events</span>
            </li>
          </ul>
        </Card>

        <p className="mt-4 text-xs text-clay">
          Chapter scoping is enforced server-side. You only see and manage members of your own
          chapter.
        </p>
      </div>
    </MemberLayout>
  );
}