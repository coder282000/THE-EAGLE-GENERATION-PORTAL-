'use client';

// ADM-060 — Instructor Management
// Route: /admin/learning/instructors

import { useMemo, useState } from 'react';
import { Card } from '@/components/card';
import {
  getInstructors,
  getInstructorCounts,
  getCourses,
  canViewLearning,
  INSTRUCTOR_STATUS_LABELS,
} from '@/lib/mock/learning';

type Filter = 'ALL' | 'ACTIVE' | 'ON_LEAVE' | 'OFF_BOARDED';

const STATUS_TONE: Record<string, string> = {
  ACTIVE: 'bg-emerald-100 text-emerald-800',
  ON_LEAVE: 'bg-clay/15 text-clay',
  OFF_BOARDED: 'bg-ink/10 text-ink/70',
};

function Kpi({ label, value, tone }: { label: string; value: string; tone?: 'clay' | 'emerald' }) {
  const cls = tone === 'emerald' ? 'text-emerald-700' : tone === 'clay' ? 'text-clay' : 'text-ink';
  return (
    <Card>
      <dl>
        <dt className="text-xs uppercase tracking-wide text-ink/60">{label}</dt>
        <dd className={`mt-1 text-2xl font-semibold ${cls}`}>{value}</dd>
      </dl>
    </Card>
  );
}

export default function InstructorsPage() {
  const allowed = canViewLearning();
  const instructors = useMemo(() => (allowed ? getInstructors() : []), [allowed]);
  const counts = useMemo(() => getInstructorCounts(), []);
  const courses = useMemo(() => (allowed ? getCourses() : []), [allowed]);

  const [filter, setFilter] = useState<Filter>('ALL');
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    let list = instructors;
    if (filter !== 'ALL') list = list.filter((i) => i.status === filter);
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          i.email.toLowerCase().includes(q)
      );
    }
    return list;
  }, [instructors, filter, query]);

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

  function coursesForInstructor(ids: string[]) {
    return courses.filter((c) => ids.includes(c.id));
  }

  return (
    <div className="p-6">
      <header className="mb-6">
        <p className="text-xs uppercase tracking-wide text-ink/60">PNL-05 · Learning</p>
        <h1 className="mt-1 text-2xl font-semibold text-ink">Instructor Management</h1>
        <p className="mt-1 text-sm text-ink/70">
          Every instructor, their assigned courses, grading throughput, and status.
        </p>
      </header>

      <section aria-label="Instructor counts" className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Kpi label="Total" value={String(counts.total)} />
        <Kpi label="Active" value={String(counts.active)} tone="emerald" />
        <Kpi label="On leave" value={String(counts.onLeave)} tone={counts.onLeave > 0 ? 'clay' : undefined} />
        <Kpi label="Off-boarded" value={String(counts.offBoarded)} />
      </section>

      <Card className="mt-6">
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label htmlFor="in-query" className="block text-xs font-medium text-ink/70">Search</label>
            <input
              id="in-query"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Name or email…"
              className="mt-1 w-64 rounded-md border border-ink/15 bg-paper px-3 py-2 text-sm text-ink focus:border-sky focus:outline-none focus:ring-2 focus:ring-sky/40"
            />
          </div>
          <div>
            <label htmlFor="in-status" className="block text-xs font-medium text-ink/70">Status</label>
            <select
              id="in-status"
              value={filter}
              onChange={(e) => setFilter(e.target.value as Filter)}
              className="mt-1 rounded-md border border-ink/15 bg-paper px-3 py-2 text-sm text-ink focus:border-sky focus:outline-none focus:ring-2 focus:ring-sky/40"
            >
              <option value="ALL">All statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="ON_LEAVE">On leave</option>
              <option value="OFF_BOARDED">Off-boarded</option>
            </select>
          </div>
          <div className="ml-auto text-xs text-ink/60">
            Showing {filtered.length} of {instructors.length}
          </div>
        </div>
      </Card>

      <Card className="mt-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <caption className="sr-only">Instructors</caption>
            <thead className="border-b border-ink/10 text-xs uppercase tracking-wide text-ink/60">
              <tr>
                <th scope="col" className="py-2 pr-4">Instructor</th>
                <th scope="col" className="py-2 pr-4">Email</th>
                <th scope="col" className="py-2 pr-4">Courses</th>
                <th scope="col" className="py-2 pr-4 text-right">Active cohorts</th>
                <th scope="col" className="py-2 pr-4 text-right">Graded (30d)</th>
                <th scope="col" className="py-2 pr-4 text-right">Avg hours</th>
                <th scope="col" className="py-2 pr-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-sm text-ink/60">
                    No instructors match the current filters.
                  </td>
                </tr>
              ) : (
                filtered.map((i) => {
                  const insCourses = coursesForInstructor(i.courseIds);
                  return (
                    <tr key={i.id} className="border-b border-ink/5 hover:bg-paper">
                      <td className="py-2 pr-4">
                        <div className="flex items-center gap-2">
                          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-sky/15 text-xs font-medium text-sky">
                            {i.initials}
                          </span>
                          <span className="text-ink">{i.name}</span>
                        </div>
                      </td>
                      <td className="py-2 pr-4 font-mono text-xs text-ink/70">{i.email}</td>
                      <td className="py-2 pr-4 text-xs text-ink/80">
                        {insCourses.length === 0 ? (
                          <span className="text-ink/40">None assigned</span>
                        ) : (
                          <ul className="space-y-0.5">
                            {insCourses.map((c) => (
                              <li key={c.id}>{c.title}</li>
                            ))}
                          </ul>
                        )}
                      </td>
                      <td className="py-2 pr-4 text-right font-mono text-xs">{i.activeCohorts}</td>
                      <td className="py-2 pr-4 text-right font-mono text-xs">{i.submissionsGraded30d}</td>
                      <td className="py-2 pr-4 text-right font-mono text-xs">
                        {i.avgGradingHours > 0 ? i.avgGradingHours : '—'}
                      </td>
                      <td className="py-2 pr-4">
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_TONE[i.status]}`}>
                          {INSTRUCTOR_STATUS_LABELS[i.status]}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="mt-6">
        <h2 className="text-sm font-semibold text-ink">Instructor lifecycle</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-ink/70">
          <li>Instructors are assigned to one or more courses. A course requires at least one.</li>
          <li>On leave: an instructor is not assigned new cohorts but existing ones continue.</li>
          <li>Off-boarded: all open cohorts must be reassigned before the instructor is removed.</li>
          <li>Avg grading hours is the median time from submission to grade.</li>
          <li>All assignment and status changes are audited.</li>
        </ul>
      </Card>
    </div>
  );
}