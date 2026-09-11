'use client';

// ADM-050 — Course List
// Route: /admin/learning/courses

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/card';
import {
  getCourses,
  getCourseCounts,
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

export default function CourseListPage() {
  const allowed = canViewLearning();
  const canAuthor = canAuthorCourses();

  const courses = useMemo(() => (allowed ? getCourses() : []), [allowed]);
  const counts = useMemo(() => getCourseCounts(), []);

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
        (c) => c.title.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q)
      );
    }
    return list;
  }, [courses, statusFilter, pillarFilter, query]);

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
        <span className="text-ink">Courses</span>
      </nav>

      <header className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-ink/60">PNL-05 · Learning</p>
          <h1 className="mt-1 text-2xl font-semibold text-ink">Courses</h1>
          <p className="mt-1 text-sm text-ink/70">
            {counts.published} published · {counts.draft} drafts · {counts.archived} archived
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

      <Card>
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label htmlFor="cl-query" className="block text-xs font-medium text-ink/70">Search</label>
            <input
              id="cl-query"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Title or slug…"
              className="mt-1 w-64 rounded-md border border-ink/15 bg-paper px-3 py-2 text-sm text-ink focus:border-sky focus:outline-none focus:ring-2 focus:ring-sky/40"
            />
          </div>
          <div>
            <label htmlFor="cl-pillar" className="block text-xs font-medium text-ink/70">Pillar</label>
            <select
              id="cl-pillar"
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
            <label htmlFor="cl-status" className="block text-xs font-medium text-ink/70">Status</label>
            <select
              id="cl-status"
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
      </Card>

      <div className="mt-4 space-y-4">
        {filtered.length === 0 ? (
          <Card>
            <p className="text-center text-sm text-ink/60">No courses match the current filters.</p>
          </Card>
        ) : (
          filtered.map((c) => (
            <Card key={c.id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-base font-semibold text-ink">{c.title}</h2>
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_TONE[c.status]}`}>
                      {COURSE_STATUS_LABELS[c.status]}
                    </span>
                  </div>
                  <p className="mt-1 font-mono text-xs text-ink/60">{c.slug}</p>
                  <p className="mt-2 text-sm text-ink/80">{c.summary}</p>
                  <p className="mt-2 text-xs text-ink/60">
                    {PILLAR_LABELS[c.pillar]} · {COURSE_LEVEL_LABELS[c.level]} · {c.phaseCount} phases ·{' '}
                    {c.lessonCount} lessons
                  </p>
                </div>
                <div className="text-right text-xs text-ink/60">
                  <div>{c.cohortCount} cohort{c.cohortCount === 1 ? '' : 's'}</div>
                  <div>{c.enrolmentsTotal} enrolments</div>
                  {c.completionRatePct > 0 ? <div>{c.completionRatePct}% completion</div> : null}
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <Link
                  href={`/admin/learning/courses/${c.id}`}
                  className="rounded-md border border-ink/20 bg-paper px-3 py-1.5 text-xs font-medium text-ink hover:bg-ink/5"
                >
                  {canAuthor ? 'Edit course' : 'View course'}
                </Link>
                <Link
                  href={`/admin/learning/cohorts?courseId=${c.id}`}
                  className="rounded-md border border-ink/20 bg-paper px-3 py-1.5 text-xs font-medium text-ink hover:bg-ink/5"
                >
                  View cohorts
                </Link>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}