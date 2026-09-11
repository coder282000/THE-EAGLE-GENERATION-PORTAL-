'use client';

// ADM-058 — Grading Queue
// Route: /admin/learning/grading

import { useMemo, useState } from 'react';
import { Button } from '@/components/button';
import { Card } from '@/components/card';
import {
  getGradingQueue,
  getGradingCounts,
  canViewLearning,
  canGrade,
  type GradingSubmission,
} from '@/lib/mock/learning';

type Filter = 'AWAITING' | 'ALL' | 'GRADED';

const STATUS_TONE: Record<GradingSubmission['status'], string> = {
  AWAITING_GRADING: 'bg-clay/15 text-clay',
  GRADED: 'bg-emerald-100 text-emerald-800',
};

export default function GradingPage() {
  const allowed = canViewLearning();
  const canGradeNow = canGrade();

  const submissions = useMemo(() => (allowed ? getGradingQueue() : []), [allowed]);
  const counts = useMemo(() => getGradingCounts(), []);

  const [filter, setFilter] = useState<Filter>('AWAITING');
  const [openId, setOpenId] = useState<string | null>(null);
  const [score, setScore] = useState('');
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [graded, setGraded] = useState<Record<string, { score: number; feedback: string }>>({});

  const filtered = useMemo(() => {
    if (filter === 'ALL') return submissions;
    return submissions.filter((s) => (filter === 'AWAITING' ? s.status === 'AWAITING_GRADING' : s.status === 'GRADED'));
  }, [submissions, filter]);

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

  function submitGrade(subId: string) {
    const s = parseInt(score, 10);
    if (!Number.isFinite(s) || s < 0 || s > 100) {
      setError('Score must be a whole number from 0 to 100.');
      return;
    }
    if (feedback.trim().length < 20) {
      setError('Feedback must be at least 20 characters — the member sees this.');
      return;
    }
    setError(null);
    setGraded((g) => ({ ...g, [subId]: { score: s, feedback } }));
    setOpenId(null);
    setScore('');
    setFeedback('');
  }

  return (
    <div className="p-6">
      <header className="mb-6">
        <p className="text-xs uppercase tracking-wide text-ink/60">PNL-05 · Learning</p>
        <h1 className="mt-1 text-2xl font-semibold text-ink">Grading Queue</h1>
        <p className="mt-1 text-sm text-ink/70">
          Every submission awaiting grading. Feedback text is required, not just a score.
        </p>
      </header>

      <section aria-label="Grading counts" className="grid grid-cols-2 gap-4 md:grid-cols-3">
        <Card>
          <dl>
            <dt className="text-xs uppercase tracking-wide text-ink/60">Awaiting grading</dt>
            <dd className={`mt-1 text-2xl font-semibold ${counts.awaiting > 0 ? 'text-clay' : 'text-emerald-700'}`}>
              {counts.awaiting}
            </dd>
          </dl>
        </Card>
        <Card>
          <dl>
            <dt className="text-xs uppercase tracking-wide text-ink/60">Graded (this view)</dt>
            <dd className="mt-1 text-2xl font-semibold text-ink">{counts.graded}</dd>
          </dl>
        </Card>
        <Card>
          <dl>
            <dt className="text-xs uppercase tracking-wide text-ink/60">Total submissions</dt>
            <dd className="mt-1 text-2xl font-semibold text-ink">{counts.total}</dd>
          </dl>
        </Card>
      </section>

      {!canGradeNow ? (
        <div role="note" className="mt-4 rounded-lg border border-clay/30 bg-clay/5 p-3 text-sm text-ink">
          Your role can view submissions but not grade them. Mentor, Instructor, Admin, and Super Admin only.
        </div>
      ) : null}

      <Card className="mt-6">
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label htmlFor="gr-filter" className="block text-xs font-medium text-ink/70">View</label>
            <select
              id="gr-filter"
              value={filter}
              onChange={(e) => setFilter(e.target.value as Filter)}
              className="mt-1 rounded-md border border-ink/15 bg-paper px-3 py-2 text-sm text-ink focus:border-sky focus:outline-none focus:ring-2 focus:ring-sky/40"
            >
              <option value="AWAITING">Awaiting grading</option>
              <option value="GRADED">Graded</option>
              <option value="ALL">All submissions</option>
            </select>
          </div>
          <div className="ml-auto text-xs text-ink/60">
            Showing {filtered.length} of {submissions.length}
          </div>
        </div>
      </Card>

      {error ? (
        <div role="alert" className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-900">
          {error}
        </div>
      ) : null}

      <div className="mt-4 space-y-4">
        {filtered.length === 0 ? (
          <Card>
            <p className="text-center text-sm text-ink/60">No submissions match the current view.</p>
          </Card>
        ) : (
          filtered.map((s) => {
            const done = graded[s.id];
            const action = done ? 'GRADED' : s.status;
            return (
              <Card key={s.id}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-mono text-sm font-semibold text-ink">{s.reference}</h2>
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_TONE[s.status]}`}>
                        {s.status === 'AWAITING_GRADING' ? 'Awaiting grading' : 'Graded'}
                      </span>
                      <span className="text-xs text-ink/60">Attempt {s.attempt}</span>
                    </div>
                    <p className="mt-1 text-sm text-ink">{s.assignmentTitle}</p>
                    <p className="mt-1 text-xs text-ink/60">
                      {s.cohortName} · {s.memberName} ({s.memberNumber})
                    </p>
                    <p className="mt-1 text-xs text-ink/60">
                      Submitted {new Date(s.submittedAt).toLocaleString('en-GB')}
                    </p>
                  </div>
                  {s.status === 'GRADED' && !done ? (
                    <div className="text-right">
                      <p className="text-xs uppercase tracking-wide text-ink/60">Grade</p>
                      <p className="font-mono text-lg font-semibold text-ink">{s.gradePct}%</p>
                      <p className="text-xs text-ink/60">by {s.gradedBy}</p>
                    </div>
                  ) : null}
                </div>

                {s.status === 'GRADED' && s.feedback && !done ? (
                  <div className="mt-3 rounded-lg border border-ink/10 bg-paper p-3">
                    <p className="text-xs uppercase tracking-wide text-ink/60">Feedback</p>
                    <p className="mt-1 text-sm text-ink">{s.feedback}</p>
                  </div>
                ) : null}

                {done ? (
                  <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
                    Graded at {done.score}%. Feedback saved. Member will be notified in production.
                  </div>
                ) : action === 'AWAITING_GRADING' && canGradeNow ? (
                  <div className="mt-4">
                    {openId === s.id ? (
                      <div>
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                          <div>
                            <label htmlFor={`sc-${s.id}`} className="block text-xs font-medium text-ink/70">Score (%)</label>
                            <input
                              id={`sc-${s.id}`}
                              type="number"
                              value={score}
                              onChange={(e) => setScore(e.target.value)}
                              className="mt-1 w-full rounded-md border border-ink/15 bg-paper px-3 py-2 font-mono text-sm text-ink focus:border-sky focus:outline-none focus:ring-2 focus:ring-sky/40"
                            />
                          </div>
                        </div>
                        <div className="mt-3">
                          <label htmlFor={`fb-${s.id}`} className="block text-xs font-medium text-ink/70">
                            Feedback (minimum 20 characters, visible to member)
                          </label>
                          <textarea
                            id={`fb-${s.id}`}
                            rows={4}
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            className="mt-1 w-full rounded-md border border-ink/15 bg-paper px-3 py-2 text-sm text-ink focus:border-sky focus:outline-none focus:ring-2 focus:ring-sky/40"
                          />
                        </div>
                        <div className="mt-4 flex gap-2">
                          <Button variant="primary" onClick={() => submitGrade(s.id)}>Save grade</Button>
                          <Button variant="outline" onClick={() => {
                            setOpenId(null);
                            setScore('');
                            setFeedback('');
                          }}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button variant="primary" onClick={() => { setOpenId(s.id); setError(null); }}>
                        Grade submission
                      </Button>
                    )}
                  </div>
                ) : null}
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}