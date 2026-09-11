'use client';

// ADM-053 — Quiz Builder
// Route: /admin/learning/quizzes/[id]

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Button } from '@/components/button';
import { Card } from '@/components/card';
import {
  getCourses,
  getPhasesByCourse,
  getQuizByPhase,
  canViewLearning,
  canAuthorCourses,
  PHASE_LABELS,
  QUESTION_KIND_LABELS,
  type Quiz,
  type QuestionKind,
} from '@/lib/mock/learning';

export default function QuizBuilderPage() {
  const params = useParams<{ id: string }>();
  const canAuthor = canAuthorCourses();

  const { quiz, phase, course } = useMemo(() => {
    const allCourses = getCourses();
    for (const c of allCourses) {
      for (const p of getPhasesByCourse(c.id)) {
        const q = getQuizByPhase(p.id);
        if (q && q.id === params.id) return { quiz: q, phase: p, course: c };
      }
    }
    return { quiz: null as Quiz | null, phase: null, course: null };
  }, [params.id]);

  const [passMark, setPassMark] = useState(String(quiz?.passMarkPct ?? 70));
  const [attemptLimit, setAttemptLimit] = useState(String(quiz?.attemptLimit ?? 3));
  const [timeLimit, setTimeLimit] = useState(String(quiz?.timeLimitMinutes ?? 30));
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

  if (!quiz || !phase || !course) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <Card>
          <h1 className="text-lg font-semibold text-ink">Quiz not found</h1>
          <Link href="/admin/learning" className="mt-3 inline-block text-sm text-sky hover:underline">
            Back to learning dashboard
          </Link>
        </Card>
      </div>
    );
  }

  function save(e: React.FormEvent) {
    e.preventDefault();
    const pm = parseInt(passMark, 10);
    const al = parseInt(attemptLimit, 10);
    const tl = parseInt(timeLimit, 10);
    if (!Number.isFinite(pm) || pm < 0 || pm > 100) return setError('Pass mark must be 0–100.');
    if (!Number.isFinite(al) || al < 1 || al > 10) return setError('Attempt limit must be 1–10.');
    if (!Number.isFinite(tl) || tl < 1 || tl > 180) return setError('Time limit must be 1–180 minutes.');
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
        <span className="text-ink">Quiz builder</span>
      </nav>

      <header className="mb-6">
        <p className="text-xs uppercase tracking-wide text-ink/60">PNL-05 · Quiz builder</p>
        <h1 className="mt-1 text-2xl font-semibold text-ink">{quiz.title}</h1>
        <p className="mt-1 text-sm text-ink/70">
          {course.title} · {PHASE_LABELS[phase.kind]} gate · {quiz.questions.length} question
          {quiz.questions.length === 1 ? '' : 's'}
        </p>
      </header>

      {saved ? (
        <div role="status" className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
          Quiz saved. In production this would create a content revision.
        </div>
      ) : null}

      <Card>
        <h2 className="text-sm font-semibold text-ink">Gate configuration</h2>
        <form onSubmit={save} className="mt-4">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <div>
              <label htmlFor="q-pass" className="block text-xs font-medium text-ink/70">Pass mark (%)</label>
              <input
                id="q-pass"
                type="number"
                value={passMark}
                onChange={(e) => setPassMark(e.target.value)}
                disabled={!canAuthor}
                className="mt-1 w-full rounded-md border border-ink/15 bg-paper px-3 py-2 font-mono text-sm text-ink focus:border-sky focus:outline-none focus:ring-2 focus:ring-sky/40 disabled:opacity-50"
              />
            </div>
            <div>
              <label htmlFor="q-att" className="block text-xs font-medium text-ink/70">Attempt limit</label>
              <input
                id="q-att"
                type="number"
                value={attemptLimit}
                onChange={(e) => setAttemptLimit(e.target.value)}
                disabled={!canAuthor}
                className="mt-1 w-full rounded-md border border-ink/15 bg-paper px-3 py-2 font-mono text-sm text-ink focus:border-sky focus:outline-none focus:ring-2 focus:ring-sky/40 disabled:opacity-50"
              />
            </div>
            <div>
              <label htmlFor="q-time" className="block text-xs font-medium text-ink/70">Time limit (min)</label>
              <input
                id="q-time"
                type="number"
                value={timeLimit}
                onChange={(e) => setTimeLimit(e.target.value)}
                disabled={!canAuthor}
                className="mt-1 w-full rounded-md border border-ink/15 bg-paper px-3 py-2 font-mono text-sm text-ink focus:border-sky focus:outline-none focus:ring-2 focus:ring-sky/40 disabled:opacity-50"
              />
            </div>
          </div>

          {error ? <p role="alert" className="mt-3 text-xs text-red-700">{error}</p> : null}

          {canAuthor ? (
            <div className="mt-4 flex gap-2">
              <Button variant="primary" type="submit">Save configuration</Button>
            </div>
          ) : null}
        </form>
      </Card>

      <Card className="mt-4">
        <h2 className="text-sm font-semibold text-ink">Question bank</h2>
        {quiz.questions.length === 0 ? (
          <p className="mt-3 text-sm text-ink/60">No questions yet.</p>
        ) : (
          <ol className="mt-3 space-y-3">
            {quiz.questions.map((q, idx) => (
              <li key={q.id} className="rounded-lg border border-ink/10 p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-ink/60">Q{idx + 1}</span>
                    <span className="inline-flex rounded-full bg-sky/15 px-2 py-0.5 text-xs font-medium text-sky">
                      {QUESTION_KIND_LABELS[q.kind as QuestionKind]}
                    </span>
                    <span className="text-xs text-ink/60">{q.points} pt{q.points === 1 ? '' : 's'}</span>
                  </div>
                </div>
                <p className="mt-2 text-sm text-ink">{q.prompt}</p>
                {q.options ? (
                  <ul className="mt-2 space-y-1 text-xs text-ink/70">
                    {q.options.map((o, i) => (
                      <li key={i} className={i === q.correctIndex ? 'font-medium text-emerald-700' : ''}>
                        {String.fromCharCode(65 + i)}. {o}
                        {i === q.correctIndex ? ' ✓' : ''}
                      </li>
                    ))}
                  </ul>
                ) : q.correctAnswer ? (
                  <p className="mt-2 text-xs">
                    <span className="text-ink/60">Answer:</span>{' '}
                    <span className="font-mono text-ink">{q.correctAnswer}</span>
                  </p>
                ) : null}
                <p className="mt-2 text-xs italic text-ink/60">{q.explanation}</p>
              </li>
            ))}
          </ol>
        )}
      </Card>
    </div>
  );
}