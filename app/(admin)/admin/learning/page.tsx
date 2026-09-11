'use client';

// ADM-050 — Course List + Learning Dashboard
// Route: /admin/learning

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/card';
import {
  getCourses,
  getCourseCounts,
  getCohortCounts,
  getCertificateCounts,
  getInstructorCounts,
  getGradingCounts,
  canViewLearning,
  canAuthorCourses,
  PILLAR_LABELS,
  COURSE_LEVEL_LABELS,
  COURSE_STATUS_LABELS,
  type CourseStatus,
  type Pillar,
} from '@/lib/mock/learning';

type StatusFilter = 'ALL' | CourseStatus;
type PillarFilter = 'ALL' | Pillar;

const STATUS_TONE: Record<CourseStatus, string> = {
  DRAFT: 'bg-ink/10 text-ink/70',
  PUBLISHED: 'bg-emerald-100 text-emerald-800',
  ARCHIVED: 'bg-clay/15 text-clay',
};

function Kpi({
  label,
  value,
  hint,
  tone,
  href,
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: 'clay' | 'red' | 'emerald';
  href?: string;
}) {
  const cls =
    tone === 'red'
      ? 'text-red-700'
      : tone === 'clay'
      ? 'text-clay'
      : tone === 'emerald'
      ? 'text-emerald-700'
      : 'text-ink';
  const inner = (
    <Card>
      <dl>
        <dt className="text-xs uppercase tracking-wide text-ink/60">{label}</dt>
        <dd className={`mt-1 text-2xl font-semibold ${cls}`}>{value}</dd>
        {hint ? <dd className="mt-1 text-xs text-ink/60">{hint}</dd> : null}
      </dl>
    </Card>
  );
  return href ? (
    <Link href={href} className="block hover:opacity-90">
      {inner}
    </Link>
  ) : (
    inner
  );
}

export default function LearningDashboardPage() {
  const allowed = canViewLearning();
  const canAuthor = canAuthorCourses();

  const courses = useMemo(() => (allowed ? getCourses() : []), [allowed]);
  const courseCounts = useMemo(() => getCourseCounts(), []);
  const cohortCounts = useMemo(() => getCohortCounts(), []);
  const certCounts = useMemo(() => getCertificateCounts(), []);
  const instructorCounts = useMemo(() => getInstructorCounts(), []);
  const gradingCounts = useMemo(() => getGradingCounts(), []);

  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [pillarFilter, setPillarFilter] = useState<PillarFilter>('ALL');
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    let list = courses;
    if (statusFilter !== 'ALL') list = list.filter((c) => c.status === statusFilter);
    if (pillarFilter !== 'ALL') list = list.filter((c) => c.pillar === pillarFilter);
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.slug.toLowerCase().includes(q) ||
          c.summary.toLowerCase().includes(q)
      );
    }
    return list;
  }, [courses, statusFilter, pillarFilter, query]);

  if (!allowed) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <Card>
          <h1 className="text-lg font-semibold text-ink">Permission denied</h1>
          <p className="mt-2 text-sm text-ink/70">
            You do not have access to the learning panel. Restricted to Admin, Super Admin, Mentor,
            Instructor, and Chapter Leader roles.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6">
      <header className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-ink/60">PNL-05 · Learning</p>
          <h1 className="mt-1 text-2xl font-semibold text-ink">Learning Dashboard</h1>
          <p className="mt-1 text-sm text-ink/70">
            Courses, cohorts, certificates, instructors. The taxonomy is fixed: Marketplace, Governance,
            Technology.
          </p>
        </div>
        {canAuthor ? (
          <Link
            href="/admin/learning/courses/new"
            className="rounded-md bg-sky px-3 py-1.5 text-sm font-medium text-white hover:bg-sky/90"
          >
            New course
          </Link>
        ) : null}
      </header>

      <section aria-label="Learning summary" className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Kpi
          label="Published courses"
          value={String(courseCounts.published)}
          hint={`${courseCounts.draft} drafts · ${courseCounts.archived} archived`}
          href="/admin/learning/courses"
        />
        <Kpi
          label="Running cohorts"
          value={String(cohortCounts.running)}
          hint={`${cohortCounts.planned} planned · ${cohortCounts.completed} completed`}
          href="/admin/learning/cohorts"
        />
        <Kpi
          label="Awaiting grading"
          value={String(gradingCounts.awaiting)}
          hint={`${gradingCounts.graded} graded to date`}
          tone={gradingCounts.awaiting > 0 ? 'clay' : undefined}
          href="/admin/learning/grading"
        />
        <Kpi
          label="Certificates issued"
          value={String(certCounts.issued)}
          hint={certCounts.revoked > 0 ? `${certCounts.revoked} revoked` : 'No revocations'}
          href="/admin/learning/certificates"
        />
      </section>

      <section aria-label="Quick links" className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Link href="/admin/learning/courses" className="rounded-lg border border-sky/30 bg-sky/5 p-3 text-sm font-medium text-sky hover:bg-sky/10">
          Courses →
        </Link>
        <Link href="/admin/learning/cohorts" className="rounded-lg border border-ink/15 bg-paper p-3 text-sm font-medium text-ink hover:bg-ink/5">
          Cohorts →
        </Link>
        <Link href="/admin/learning/grading" className="rounded-lg border border-ink/15 bg-paper p-3 text-sm font-medium text-ink hover:bg-ink/5">
          Grading queue →
        </Link>
        <Link href="/admin/learning/certificates" className="rounded-lg border border-ink/15 bg-paper p-3 text-sm font-medium text-ink hover:bg-ink/5">
          Certificates →
        </Link>
        <Link href="/admin/learning/instructors" className="rounded-lg border border-ink/15 bg-paper p-3 text-sm font-medium text-ink hover:bg-ink/5">
          Instructors →
        </Link>
        <Link href="/admin/learning/analytics" className="rounded-lg border border-ink/15 bg-paper p-3 text-sm font-medium text-ink hover:bg-ink/5">
          Learning analytics →
        </Link>
        <Link href="/admin/learning/library" className="rounded-lg border border-ink/15 bg-paper p-3 text-sm font-medium text-ink hover:bg-ink/5">
          Content library →
        </Link>
        <Link href="/admin/learning/courses/new" className="rounded-lg border border-ink/15 bg-paper p-3 text-sm font-medium text-ink hover:bg-ink/5">
          New course →
        </Link>
      </section>

      <Card className="mt-6">
        <h2 className="text-sm font-semibold text-ink">Courses</h2>
        <div className="mt-3 flex flex-wrap items-end gap-3">
          <div>
            <label htmlFor="crs-query" className="block text-xs font-medium text-ink/70">Search</label>
            <input
              id="crs-query"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Title, slug, summary…"
              className="mt-1 w-64 rounded-md border border-ink/15 bg-paper px-3 py-2 text-sm text-ink focus:border-sky focus:outline-none focus:ring-2 focus:ring-sky/40"
            />
          </div>
          <div>
            <label htmlFor="crs-pillar" className="block text-xs font-medium text-ink/70">Pillar</label>
            <select
              id="crs-pillar"
              value={pillarFilter}
              onChange={(e) => setPillarFilter(e.target.value as PillarFilter)}
              className="mt-1 rounded-md border border-ink/15 bg-paper px-3 py-2 text-sm text-ink focus:border-sky focus:outline-none focus:ring-2 focus:ring-sky/40"
            >
              <option value="ALL">All pillars</option>
              {(Object.keys(PILLAR_LABELS) as Pillar[]).map((p) => (
                <option key={p} value={p}>{PILLAR_LABELS[p]}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="crs-status" className="block text-xs font-medium text-ink/70">Status</label>
            <select
              id="crs-status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              className="mt-1 rounded-md border border-ink/15 bg-paper px-3 py-2 text-sm text-ink focus:border-sky focus:outline-none focus:ring-2 focus:ring-sky/40"
            >
              <option value="ALL">All statuses</option>
              {(Object.keys(COURSE_STATUS_LABELS) as CourseStatus[]).map((s) => (
                <option key={s} value={s}>{COURSE_STATUS_LABELS[s]}</option>
              ))}
            </select>
          </div>
          <div className="ml-auto text-xs text-ink/60">
            Showing {filtered.length} of {courses.length}
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <caption className="sr-only">Courses</caption>
            <thead className="border-b border-ink/10 text-xs uppercase tracking-wide text-ink/60">
              <tr>
                <th scope="col" className="py-2 pr-4">Title</th>
                <th scope="col" className="py-2 pr-4">Pillar</th>
                <th scope="col" className="py-2 pr-4">Level</th>
                <th scope="col" className="py-2 pr-4">Status</th>
                <th scope="col" className="py-2 pr-4 text-right">Phases</th>
                <th scope="col" className="py-2 pr-4 text-right">Lessons</th>
                <th scope="col" className="py-2 pr-4 text-right">Cohorts</th>
                <th scope="col" className="py-2 pr-4 text-right">Enrolments</th>
                <th scope="col" className="py-2 pr-4 text-right">Completion</th>
                <th scope="col" className="py-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-sm text-ink/60">
                    No courses match the current filters.
                  </td>
                </tr>
              ) : (
                filtered.map((c) => (
                  <tr key={c.id} className="border-b border-ink/5 hover:bg-paper">
                    <td className="py-2 pr-4">
                      <div className="text-ink">{c.title}</div>
                      <div className="font-mono text-xs text-ink/60">{c.slug}</div>
                    </td>
                    <td className="py-2 pr-4 text-xs">{PILLAR_LABELS[c.pillar]}</td>
                    <td className="py-2 pr-4 text-xs">{COURSE_LEVEL_LABELS[c.level]}</td>
                    <td className="py-2 pr-4">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_TONE[c.status]}`}>
                        {COURSE_STATUS_LABELS[c.status]}
                      </span>
                    </td>
                    <td className="py-2 pr-4 text-right font-mono text-xs">{c.phaseCount}</td>
                    <td className="py-2 pr-4 text-right font-mono text-xs">{c.lessonCount}</td>
                    <td className="py-2 pr-4 text-right font-mono text-xs">{c.cohortCount}</td>
                    <td className="py-2 pr-4 text-right font-mono text-xs">{c.enrolmentsTotal}</td>
                    <td className="py-2 pr-4 text-right font-mono text-xs">
                      {c.completionRatePct > 0 ? `${c.completionRatePct}%` : '—'}
                    </td>
                    <td className="py-2 text-right">
                      <Link
                        href={`/admin/learning/courses/${c.id}`}
                        className="text-xs font-medium text-sky hover:underline"
                      >
                        {canAuthor ? 'Edit' : 'View'}
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="mt-6">
        <h2 className="text-sm font-semibold text-ink">Instructors</h2>
        <p className="mt-2 text-sm text-ink/70">
          {instructorCounts.active} active · {instructorCounts.onLeave} on leave · {instructorCounts.offBoarded} off-boarded
        </p>
        <Link
          href="/admin/learning/instructors"
          className="mt-2 inline-block text-sm text-sky hover:underline"
        >
          Manage instructors →
        </Link>
      </Card>
    </div>
  );
}