'use client';

// ADM-055 — Cohort List
// Route: /admin/learning/cohorts

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/card';
import {
  getCohorts,
  getCohortCounts,
  canViewLearning,
  canManageCohorts,
  COHORT_STATUS_LABELS,
  PHASE_LABELS,
  type CohortStatus,
} from '@/lib/mock/learning';

type Filter = 'ALL' | CohortStatus;

const STATUS_TONE: Record<CohortStatus, string> = {
  PLANNED: 'bg-clay/15 text-clay',
  RUNNING: 'bg-sky/15 text-sky',
  COMPLETED: 'bg-emerald-100 text-emerald-800',
  ARCHIVED: 'bg-ink/10 text-ink/70',
};

function Kpi({ label, value, hint, tone }: { label: string; value: string; hint?: string; tone?: 'clay' | 'emerald' }) {
  const cls = tone === 'emerald' ? 'text-emerald-700' : tone === 'clay' ? 'text-clay' : 'text-ink';
  return (
    <Card>
      <dl>
        <dt className="text-xs uppercase tracking-wide text-ink/60">{label}</dt>
        <dd className={`mt-1 text-2xl font-semibold ${cls}`}>{value}</dd>
        {hint ? <dd className="mt-1 text-xs text-ink/60">{hint}</dd> : null}
      </dl>
    </Card>
  );
}

export default function CohortsPage() {
  const allowed = canViewLearning();
  const canManage = canManageCohorts();

  const cohorts = useMemo(() => (allowed ? getCohorts() : []), [allowed]);
  const counts = useMemo(() => getCohortCounts(), []);

  const [filter, setFilter] = useState<Filter>('ALL');
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    let list = cohorts;
    if (filter !== 'ALL') list = list.filter((c) => c.status === filter);
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.courseTitle.toLowerCase().includes(q)
      );
    }
    return list;
  }, [cohorts, filter, query]);

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

  return (
    <div className="p-6">
      <nav aria-label="Breadcrumb" className="mb-3 text-xs text-ink/60">
        <Link href="/admin/learning" className="hover:text-sky">Learning</Link>
        <span className="mx-2">/</span>
        <span className="text-ink">Cohorts</span>
      </nav>

      <header className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-ink/60">PNL-05 · Learning</p>
          <h1 className="mt-1 text-2xl font-semibold text-ink">Cohorts</h1>
          <p className="mt-1 text-sm text-ink/70">
            Enrolment is into a cohort, never a bare course. Each cohort runs through the three phases.
          </p>
        </div>
        {canManage ? (
          <Link
            href="/admin/learning/cohorts/new"
            className="rounded-md bg-sky px-3 py-1.5 text-sm font-medium text-white hover:bg-sky/90"
          >
            New cohort
          </Link>
        ) : null}
      </header>

      <section aria-label="Cohort summary" className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Kpi label="Total cohorts" value={String(counts.total)} />
        <Kpi label="Planned" value={String(counts.planned)} tone={counts.planned > 0 ? 'clay' : undefined} />
        <Kpi label="Running" value={String(counts.running)} tone="emerald" />
        <Kpi label="Completed" value={String(counts.completed)} />
      </section>

      <Card className="mt-6">
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label htmlFor="co-query" className="block text-xs font-medium text-ink/70">Search</label>
            <input
              id="co-query"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cohort or course…"
              className="mt-1 w-64 rounded-md border border-ink/15 bg-paper px-3 py-2 text-sm text-ink focus:border-sky focus:outline-none focus:ring-2 focus:ring-sky/40"
            />
          </div>
          <div>
            <label htmlFor="co-status" className="block text-xs font-medium text-ink/70">Status</label>
            <select
              id="co-status"
              value={filter}
              onChange={(e) => setFilter(e.target.value as Filter)}
              className="mt-1 rounded-md border border-ink/15 bg-paper px-3 py-2 text-sm text-ink focus:border-sky focus:outline-none focus:ring-2 focus:ring-sky/40"
            >
              <option value="ALL">All statuses</option>
              {(Object.keys(COHORT_STATUS_LABELS) as CohortStatus[]).map((s) => (
                <option key={s} value={s}>{COHORT_STATUS_LABELS[s]}</option>
              ))}
            </select>
          </div>
          <div className="ml-auto text-xs text-ink/60">
            Showing {filtered.length} of {cohorts.length}
          </div>
        </div>
      </Card>

      <Card className="mt-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <caption className="sr-only">Cohorts</caption>
            <thead className="border-b border-ink/10 text-xs uppercase tracking-wide text-ink/60">
              <tr>
                <th scope="col" className="py-2 pr-4">Cohort</th>
                <th scope="col" className="py-2 pr-4">Course</th>
                <th scope="col" className="py-2 pr-4">Dates</th>
                <th scope="col" className="py-2 pr-4 text-right">Capacity</th>
                <th scope="col" className="py-2 pr-4">Phase</th>
                <th scope="col" className="py-2 pr-4">Status</th>
                <th scope="col" className="py-2 pr-4 text-right">Completion</th>
                <th scope="col" className="py-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-sm text-ink/60">
                    No cohorts match the current filters.
                  </td>
                </tr>
              ) : (
                filtered.map((c) => (
                  <tr key={c.id} className="border-b border-ink/5 hover:bg-paper">
                    <td className="py-2 pr-4 text-ink">{c.name}</td>
                    <td className="py-2 pr-4 text-xs text-ink/80">{c.courseTitle}</td>
                    <td className="py-2 pr-4 text-xs text-ink/70">
                      {new Date(c.startsOn).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}{' '}
                      —{' '}
                      {new Date(c.endsOn).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                    </td>
                    <td className="py-2 pr-4 text-right font-mono text-xs">
                      {c.enrolled} / {c.capacity}
                    </td>
                    <td className="py-2 pr-4 text-xs">{PHASE_LABELS[c.currentPhase]}</td>
                    <td className="py-2 pr-4">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_TONE[c.status]}`}>
                        {COHORT_STATUS_LABELS[c.status]}
                      </span>
                    </td>
                    <td className="py-2 pr-4 text-right font-mono text-xs">
                      {c.completionRatePct > 0 ? `${c.completionRatePct}%` : '—'}
                    </td>
                    <td className="py-2 text-right">
                      <Link
                        href={`/admin/learning/cohorts/${c.id}`}
                        className="text-xs font-medium text-sky hover:underline"
                      >
                        Open
                      </Link>
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