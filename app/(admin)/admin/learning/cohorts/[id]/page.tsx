'use client';

// ADM-056 — Cohort Detail (roster, schedule, progress)
// Route: /admin/learning/cohorts/[id]

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Card } from '@/components/card';
import {
  getCohortById,
  getEnrollmentsByCohort,
  canViewLearning,
  COHORT_STATUS_LABELS,
  PHASE_LABELS,
  type CohortStatus,
  type PhaseKind,
} from '@/lib/mock/learning';

const STATUS_TONE: Record<CohortStatus, string> = {
  PLANNED: 'bg-clay/15 text-clay',
  RUNNING: 'bg-sky/15 text-sky',
  COMPLETED: 'bg-emerald-100 text-emerald-800',
  ARCHIVED: 'bg-ink/10 text-ink/70',
};

const PHASES: PhaseKind[] = ['FOUNDATION', 'SPECIALISATION', 'APPLICATION'];

export default function CohortDetailPage() {
  const params = useParams<{ id: string }>();
  const cohort = useMemo(() => getCohortById(params.id), [params.id]);
  const enrollments = useMemo(() => (cohort ? getEnrollmentsByCohort(cohort.id) : []), [cohort]);
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return enrollments;
    return enrollments.filter(
      (e) =>
        e.memberName.toLowerCase().includes(q) ||
        e.memberNumber.toLowerCase().includes(q)
    );
  }, [enrollments, query]);

  if (!canViewLearning()) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <Card>
          <h1 className="text-lg font-semibold text-ink">Permission denied</h1>
          <p className="mt-2 text-sm text-ink/70">You do not have access to the learning panel.</p>
        </Card>
      </div>
    );
  }

  if (!cohort) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <Card>
          <h1 className="text-lg font-semibold text-ink">Cohort not found</h1>
          <Link href="/admin/learning/cohorts" className="mt-3 inline-block text-sm text-sky hover:underline">
            Back to cohorts
          </Link>
        </Card>
      </div>
    );
  }

  const currentPhaseIndex = PHASES.indexOf(cohort.currentPhase);

  return (
    <div className="p-6">
      <nav aria-label="Breadcrumb" className="mb-3 text-xs text-ink/60">
        <Link href="/admin/learning" className="hover:text-sky">Learning</Link>
        <span className="mx-2">/</span>
        <Link href="/admin/learning/cohorts" className="hover:text-sky">Cohorts</Link>
        <span className="mx-2">/</span>
        <span className="text-ink">{cohort.name}</span>
      </nav>

      <header className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-ink/60">PNL-05 · Cohort</p>
          <h1 className="mt-1 text-2xl font-semibold text-ink">{cohort.name}</h1>
          <p className="mt-1 text-sm text-ink/70">{cohort.courseTitle}</p>
        </div>
        <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${STATUS_TONE[cohort.status]}`}>
          {COHORT_STATUS_LABELS[cohort.status]}
        </span>
      </header>

      <section aria-label="Cohort summary" className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card>
          <dl>
            <dt className="text-xs uppercase tracking-wide text-ink/60">Enrolment</dt>
            <dd className="mt-1 font-mono text-lg font-semibold text-ink">
              {cohort.enrolled} / {cohort.capacity}
            </dd>
          </dl>
        </Card>
        <Card>
          <dl>
            <dt className="text-xs uppercase tracking-wide text-ink/60">Dates</dt>
            <dd className="mt-1 text-sm text-ink">
              {new Date(cohort.startsOn).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
              {' — '}
              {new Date(cohort.endsOn).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
            </dd>
          </dl>
        </Card>
        <Card>
          <dl>
            <dt className="text-xs uppercase tracking-wide text-ink/60">Facilitators</dt>
            <dd className="mt-1 text-sm text-ink">
              {cohort.facilitatorIds.length} assigned
            </dd>
          </dl>
        </Card>
        <Card>
          <dl>
            <dt className="text-xs uppercase tracking-wide text-ink/60">Completion</dt>
            <dd className="mt-1 font-mono text-lg font-semibold text-ink">
              {cohort.completionRatePct > 0 ? `${cohort.completionRatePct}%` : '—'}
            </dd>
          </dl>
        </Card>
      </section>

      <Card className="mt-6">
        <h2 className="text-sm font-semibold text-ink">Phase progression</h2>
        <ol className="mt-4 grid grid-cols-3 gap-3">
          {PHASES.map((p, i) => {
            const state = i < currentPhaseIndex ? 'done' : i === currentPhaseIndex ? 'current' : 'upcoming';
            const tone =
              state === 'done'
                ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                : state === 'current'
                ? 'border-sky bg-sky/5 text-sky'
                : 'border-ink/15 bg-paper text-ink/60';
            return (
              <li key={p} className={`rounded-lg border p-3 ${tone}`}>
                <p className="text-xs uppercase tracking-wide">Phase {i + 1}</p>
                <p className="mt-1 text-sm font-medium">{PHASE_LABELS[p]}</p>
                <p className="mt-1 text-xs">
                  {state === 'done' ? 'Complete' : state === 'current' ? 'In progress' : 'Not started'}
                </p>
              </li>
            );
          })}
        </ol>
      </Card>

      <Card className="mt-4">
        <h2 className="text-sm font-semibold text-ink">Roster</h2>
        <div className="mt-3">
          <label htmlFor="en-query" className="block text-xs font-medium text-ink/70">Search</label>
          <input
            id="en-query"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Member name or number…"
            className="mt-1 w-64 rounded-md border border-ink/15 bg-paper px-3 py-2 text-sm text-ink focus:border-sky focus:outline-none focus:ring-2 focus:ring-sky/40"
          />
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <caption className="sr-only">Cohort roster</caption>
            <thead className="border-b border-ink/10 text-xs uppercase tracking-wide text-ink/60">
              <tr>
                <th scope="col" className="py-2 pr-4">Member</th>
                <th scope="col" className="py-2 pr-4">Enrolled</th>
                <th scope="col" className="py-2 pr-4">Current phase</th>
                <th scope="col" className="py-2 pr-4 text-right">Progress</th>
                <th scope="col" className="py-2 pr-4">Certificate</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-sm text-ink/60">
                    No enrolments match the current search.
                  </td>
                </tr>
              ) : (
                filtered.map((e) => (
                  <tr key={e.id} className="border-b border-ink/5 hover:bg-paper">
                    <td className="py-2 pr-4">
                      <div className="text-ink">{e.memberName}</div>
                      <div className="text-xs text-ink/60">{e.memberNumber}</div>
                    </td>
                    <td className="py-2 pr-4 text-xs text-ink/70">
                      {new Date(e.enrolledAt).toLocaleDateString('en-GB')}
                    </td>
                    <td className="py-2 pr-4 text-xs">{PHASE_LABELS[e.currentPhase]}</td>
                    <td className="py-2 pr-4 text-right font-mono text-xs">{e.progressPct}%</td>
                    <td className="py-2 pr-4 text-xs">
                      {e.certificateId ? (
                        <span className="text-emerald-700">Issued</span>
                      ) : (
                        <span className="text-ink/40">—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}