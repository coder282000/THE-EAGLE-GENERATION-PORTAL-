'use client';

// ADM-057 — Create Cohort
// Route: /admin/learning/cohorts/new

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/button';
import { Card } from '@/components/card';
import {
  getCourses,
  getInstructors,
  canViewLearning,
  canManageCohorts,
  COURSE_STATUS_LABELS,
} from '@/lib/mock/learning';

export default function NewCohortPage() {
  const allowed = canViewLearning();
  const canManage = canManageCohorts();
  const router = useRouter();

  const courses = useMemo(() => getCourses().filter((c) => c.status === 'PUBLISHED'), []);
  const instructors = useMemo(() => getInstructors().filter((i) => i.status === 'ACTIVE'), []);

  const [courseId, setCourseId] = useState(courses[0]?.id ?? '');
  const [name, setName] = useState('');
  const [startsOn, setStartsOn] = useState('');
  const [endsOn, setEndsOn] = useState('');
  const [capacity, setCapacity] = useState('60');
  const [facilitatorIds, setFacilitatorIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  if (!allowed) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <Card>
          <h1 className="text-lg font-semibold text-ink">Permission denied</h1>
          <p className="mt-2 text-sm text-ink/70">You do not have access to the learning panel.</p>
        </Card>
      </div>
    );
  }

  if (!canManage) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <Card>
          <h1 className="text-lg font-semibold text-ink">Permission denied</h1>
          <p className="mt-2 text-sm text-ink/70">Your role cannot create cohorts.</p>
          <Link href="/admin/learning/cohorts" className="mt-3 inline-block text-sm text-sky hover:underline">
            Back to cohorts
          </Link>
        </Card>
      </div>
    );
  }

  function toggleFacilitator(id: string) {
    setFacilitatorIds((list) =>
      list.includes(id) ? list.filter((x) => x !== id) : [...list, id]
    );
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!courseId) return setError('Choose a published course.');
    if (name.trim().length < 3) return setError('Cohort name must be at least 3 characters.');
    if (!startsOn) return setError('Start date is required.');
    if (!endsOn) return setError('End date is required.');
    if (new Date(endsOn) <= new Date(startsOn)) return setError('End date must be after start date.');
    const cap = parseInt(capacity, 10);
    if (!Number.isFinite(cap) || cap < 1 || cap > 1000) return setError('Capacity must be 1–1000.');
    if (facilitatorIds.length === 0) return setError('At least one facilitator is required.');
    setError(null);
    setSubmitted(true);
  }

  return (
    <div className="p-6">
      <nav aria-label="Breadcrumb" className="mb-3 text-xs text-ink/60">
        <Link href="/admin/learning" className="hover:text-sky">Learning</Link>
        <span className="mx-2">/</span>
        <Link href="/admin/learning/cohorts" className="hover:text-sky">Cohorts</Link>
        <span className="mx-2">/</span>
        <span className="text-ink">New</span>
      </nav>

      <header className="mb-6">
        <p className="text-xs uppercase tracking-wide text-ink/60">PNL-05 · Learning</p>
        <h1 className="mt-1 text-2xl font-semibold text-ink">Create Cohort</h1>
        <p className="mt-1 text-sm text-ink/70">
          A cohort is a dated intake of a course with a fixed group of members. Only published courses can
          have cohorts.
        </p>
      </header>

      {submitted ? (
        <div role="status" className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
          Cohort &ldquo;{name}&rdquo; created in this session. In production this would open for enrolment and
          notify the facilitators.
          <div className="mt-2">
            <Button variant="outline" onClick={() => router.push('/admin/learning/cohorts')}>
              Back to cohorts
            </Button>
          </div>
        </div>
      ) : (
        <Card>
          <form onSubmit={submit}>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div className="md:col-span-2">
                <label htmlFor="nc-course" className="block text-xs font-medium text-ink/70">Course (published only)</label>
                <select
                  id="nc-course"
                  value={courseId}
                  onChange={(e) => setCourseId(e.target.value)}
                  className="mt-1 w-full rounded-md border border-ink/15 bg-paper px-3 py-2 text-sm text-ink focus:border-sky focus:outline-none focus:ring-2 focus:ring-sky/40"
                >
                  {courses.length === 0 ? (
                    <option value="">No published courses available</option>
                  ) : (
                    courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title} — {COURSE_STATUS_LABELS[c.status]}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div className="md:col-span-2">
                <label htmlFor="nc-name" className="block text-xs font-medium text-ink/70">Cohort name</label>
                <input
                  id="nc-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Foundation Cohort 2026-Q3"
                  className="mt-1 w-full rounded-md border border-ink/15 bg-paper px-3 py-2 text-sm text-ink focus:border-sky focus:outline-none focus:ring-2 focus:ring-sky/40"
                />
              </div>

              <div>
                <label htmlFor="nc-start" className="block text-xs font-medium text-ink/70">Starts on</label>
                <input
                  id="nc-start"
                  type="date"
                  value={startsOn}
                  onChange={(e) => setStartsOn(e.target.value)}
                  className="mt-1 w-full rounded-md border border-ink/15 bg-paper px-3 py-2 text-sm text-ink focus:border-sky focus:outline-none focus:ring-2 focus:ring-sky/40"
                />
              </div>

              <div>
                <label htmlFor="nc-end" className="block text-xs font-medium text-ink/70">Ends on</label>
                <input
                  id="nc-end"
                  type="date"
                  value={endsOn}
                  onChange={(e) => setEndsOn(e.target.value)}
                  className="mt-1 w-full rounded-md border border-ink/15 bg-paper px-3 py-2 text-sm text-ink focus:border-sky focus:outline-none focus:ring-2 focus:ring-sky/40"
                />
              </div>

              <div>
                <label htmlFor="nc-cap" className="block text-xs font-medium text-ink/70">Capacity</label>
                <input
                  id="nc-cap"
                  type="number"
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  className="mt-1 w-full rounded-md border border-ink/15 bg-paper px-3 py-2 font-mono text-sm text-ink focus:border-sky focus:outline-none focus:ring-2 focus:ring-sky/40"
                />
              </div>
            </div>

            <fieldset className="mt-4">
              <legend className="text-xs font-medium text-ink/70">Facilitators (at least one)</legend>
              {instructors.length === 0 ? (
                <p className="mt-2 text-sm text-ink/60">No active instructors available.</p>
              ) : (
                <ul className="mt-2 space-y-2">
                  {instructors.map((i) => (
                    <li key={i.id}>
                      <label className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 ${
                        facilitatorIds.includes(i.id)
                          ? 'border-sky bg-sky/5'
                          : 'border-ink/15 bg-paper hover:bg-ink/5'
                      }`}>
                        <input
                          type="checkbox"
                          checked={facilitatorIds.includes(i.id)}
                          onChange={() => toggleFacilitator(i.id)}
                        />
                        <div>
                          <p className="text-sm font-medium text-ink">{i.name}</p>
                          <p className="text-xs text-ink/60">
                            {i.courseIds.length} course{i.courseIds.length === 1 ? '' : 's'} · {i.activeCohorts} active cohort{i.activeCohorts === 1 ? '' : 's'}
                          </p>
                        </div>
                      </label>
                    </li>
                  ))}
                </ul>
              )}
            </fieldset>

            {error ? <p role="alert" className="mt-3 text-xs text-red-700">{error}</p> : null}

            <div className="mt-4 flex gap-2">
              <Button variant="primary" type="submit">Create cohort</Button>
              <Button variant="outline" type="button" onClick={() => router.back()}>Cancel</Button>
            </div>
          </form>
        </Card>
      )}
    </div>
  );
}