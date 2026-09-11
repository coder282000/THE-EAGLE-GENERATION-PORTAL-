'use client';

// ADM-054 — Assignment Builder
// Route: /admin/learning/assignments/[id]

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Button } from '@/components/button';
import { Card } from '@/components/card';
import {
  getCourses,
  getPhasesByCourse,
  getAssignmentByPhase,
  canViewLearning,
  canAuthorCourses,
  PHASE_LABELS,
  type Assignment,
} from '@/lib/mock/learning';

export default function AssignmentBuilderPage() {
  const params = useParams<{ id: string }>();
  const canAuthor = canAuthorCourses();

  const { assignment, phase, course } = useMemo(() => {
    const allCourses = getCourses();
    for (const c of allCourses) {
      for (const p of getPhasesByCourse(c.id)) {
        const a = getAssignmentByPhase(p.id);
        if (a && a.id === params.id) return { assignment: a, phase: p, course: c };
      }
    }
    return { assignment: null as Assignment | null, phase: null, course: null };
  }, [params.id]);

  const [title, setTitle] = useState(assignment?.title ?? '');
  const [instructions, setInstructions] = useState(assignment?.instructions ?? '');
  const [dueDays, setDueDays] = useState(String(assignment?.dueDays ?? 21));
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

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

  if (!assignment || !phase || !course) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <Card>
          <h1 className="text-lg font-semibold text-ink">Assignment not found</h1>
          <Link href="/admin/learning" className="mt-3 inline-block text-sm text-sky hover:underline">
            Back to learning dashboard
          </Link>
        </Card>
      </div>
    );
  }

  const totalWeight = assignment.rubric.reduce((s, r) => s + r.weightPct, 0);

  function save(e: React.FormEvent) {
    e.preventDefault();
    if (title.trim().length < 3) return setError('Title must be at least 3 characters.');
    if (instructions.trim().length < 30) return setError('Instructions must be at least 30 characters.');
    const dd = parseInt(dueDays, 10);
    if (!Number.isFinite(dd) || dd < 1 || dd > 365) return setError('Due days must be 1–365.');
    if (totalWeight !== 100) return setError(`Rubric weights must sum to 100. Currently ${totalWeight}.`);
    setError(null);
    setSaved(true);
  }

  return (
    <div className="p-6">
      <nav aria-label="Breadcrumb" className="mb-3 text-xs text-ink/60">
        <Link href="/admin/learning" className="hover:text-sky">Learning</Link>
        <span className="mx-2">/</span>
        <Link href={`/admin/learning/courses/${course.id}`} className="hover:text-sky">{course.title}</Link>
        <span className="mx-2">/</span>
        <span className="text-ink">Assignment builder</span>
      </nav>

      <header className="mb-6">
        <p className="text-xs uppercase tracking-wide text-ink/60">PNL-05 · Assignment builder</p>
        <h1 className="mt-1 text-2xl font-semibold text-ink">{assignment.title}</h1>
        <p className="mt-1 text-sm text-ink/70">
          {course.title} · {PHASE_LABELS[phase.kind]} gate · {assignment.rubric.length} rubric criteria
        </p>
      </header>

      {saved ? (
        <div role="status" className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
          Assignment saved. In production this would create a content revision.
        </div>
      ) : null}

      <Card>
        <form onSubmit={save}>
          <div>
            <label htmlFor="as-title" className="block text-xs font-medium text-ink/70">Title</label>
            <input
              id="as-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={!canAuthor}
              className="mt-1 w-full rounded-md border border-ink/15 bg-paper px-3 py-2 text-sm text-ink focus:border-sky focus:outline-none focus:ring-2 focus:ring-sky/40 disabled:opacity-50"
            />
          </div>
          <div className="mt-3">
            <label htmlFor="as-ins" className="block text-xs font-medium text-ink/70">Instructions</label>
            <textarea
              id="as-ins"
              rows={6}
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              disabled={!canAuthor}
              className="mt-1 w-full rounded-md border border-ink/15 bg-paper px-3 py-2 text-sm text-ink focus:border-sky focus:outline-none focus:ring-2 focus:ring-sky/40 disabled:opacity-50"
            />
          </div>
          <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
            <div>
              <label htmlFor="as-days" className="block text-xs font-medium text-ink/70">Due after (days from cohort start)</label>
              <input
                id="as-days"
                type="number"
                value={dueDays}
                onChange={(e) => setDueDays(e.target.value)}
                disabled={!canAuthor}
                className="mt-1 w-full rounded-md border border-ink/15 bg-paper px-3 py-2 font-mono text-sm text-ink focus:border-sky focus:outline-none focus:ring-2 focus:ring-sky/40 disabled:opacity-50"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-ink/70">Submission kind</label>
              <p className="mt-2 text-sm text-ink">{assignment.submissionKind}</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-ink/70">Total rubric weight</label>
              <p className={`mt-2 font-mono text-sm ${totalWeight === 100 ? 'text-emerald-700' : 'text-red-700'}`}>
                {totalWeight}%
              </p>
            </div>
          </div>

          {error ? <p role="alert" className="mt-3 text-xs text-red-700">{error}</p> : null}

          {canAuthor ? (
            <div className="mt-4 flex gap-2">
              <Button variant="primary" type="submit">Save assignment</Button>
            </div>
          ) : null}
        </form>
      </Card>

      <Card className="mt-4">
        <h2 className="text-sm font-semibold text-ink">Rubric</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <caption className="sr-only">Assignment rubric</caption>
            <thead className="border-b border-ink/10 text-xs uppercase tracking-wide text-ink/60">
              <tr>
                <th scope="col" className="py-2 pr-4">Criterion</th>
                <th scope="col" className="py-2 pr-4">Description</th>
                <th scope="col" className="py-2 pr-4 text-right">Weight</th>
              </tr>
            </thead>
            <tbody>
              {assignment.rubric.map((r) => (
                <tr key={r.id} className="border-b border-ink/5">
                  <td className="py-2 pr-4 text-ink">{r.label}</td>
                  <td className="py-2 pr-4 text-xs text-ink/70">{r.description}</td>
                  <td className="py-2 pr-4 text-right font-mono text-xs">{r.weightPct}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}