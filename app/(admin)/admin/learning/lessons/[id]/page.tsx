'use client';

// ADM-052 — Lesson Editor
// Route: /admin/learning/lessons/[id]

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Button } from '@/components/button';
import { Card } from '@/components/card';
import {
  getCourses,
  getLessonsByCourse,
  canViewLearning,
  canAuthorCourses,
  LESSON_KIND_LABELS,
  type LessonKind,
} from '@/lib/mock/learning';

export default function LessonEditorPage() {
  const params = useParams<{ id: string }>();
  const canAuthor = canAuthorCourses();
  const courses = useMemo(() => getCourses(), []);
  const allLessons = useMemo(
    () => courses.flatMap((c) => getLessonsByCourse(c.id).map((l) => ({ ...l, courseTitle: c.title }))),
    [courses]
  );
  const lesson = useMemo(() => allLessons.find((l) => l.id === params.id), [allLessons, params.id]);

  const [kind, setKind] = useState<LessonKind>(lesson?.kind ?? 'VIDEO');
  const [title, setTitle] = useState(lesson?.title ?? '');
  const [bodyText, setBodyText] = useState(lesson?.bodyText ?? '');
  const [assetUrl, setAssetUrl] = useState(lesson?.assetUrl ?? '');
  const [duration, setDuration] = useState(String(lesson?.durationMinutes ?? 10));
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

  if (!lesson) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <Card>
          <h1 className="text-lg font-semibold text-ink">Lesson not found</h1>
          <Link href="/admin/learning" className="mt-3 inline-block text-sm text-sky hover:underline">
            Back to learning dashboard
          </Link>
        </Card>
      </div>
    );
  }

  function save(e: React.FormEvent) {
    e.preventDefault();
    if (title.trim().length < 3) return setError('Title must be at least 3 characters.');
    const dur = parseInt(duration, 10);
    if (!Number.isFinite(dur) || dur < 1 || dur > 600) return setError('Duration must be between 1 and 600 minutes.');
    if (kind === 'VIDEO' || kind === 'PDF' || kind === 'LINK') {
      if (!assetUrl.trim()) return setError('URL required for this lesson kind.');
    }
    if (kind === 'TEXT' && bodyText.trim().length < 20) return setError('Text lessons need at least 20 characters of body.');
    setError(null);
    setSaved(true);
  }

  return (
    <div className="p-6">
      <nav aria-label="Breadcrumb" className="mb-3 text-xs text-ink/60">
        <Link href="/admin/learning" className="hover:text-sky">Learning</Link>
        <span className="mx-2">/</span>
        <span className="text-ink">Lesson editor</span>
      </nav>

      <header className="mb-6">
        <p className="text-xs uppercase tracking-wide text-ink/60">PNL-05 · Lesson editor</p>
        <h1 className="mt-1 text-2xl font-semibold text-ink">{lesson.title}</h1>
        <p className="mt-1 text-sm text-ink/70">
          {lesson.courseTitle} · {LESSON_KIND_LABELS[lesson.kind]} · {lesson.durationMinutes} min
        </p>
      </header>

      {!canAuthor ? (
        <div role="note" className="mb-4 rounded-lg border border-clay/30 bg-clay/5 p-3 text-sm text-ink">
          Your role can view this lesson but not edit it.
        </div>
      ) : null}

      {saved ? (
        <div role="status" className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
          Lesson saved. In production this would create a content revision; learners already enrolled
          continue on the revision pinned at their enrolment.
        </div>
      ) : null}

      <Card>
        <form onSubmit={save}>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <div>
              <label htmlFor="les-kind" className="block text-xs font-medium text-ink/70">Kind</label>
              <select
                id="les-kind"
                value={kind}
                onChange={(e) => setKind(e.target.value as LessonKind)}
                disabled={!canAuthor}
                className="mt-1 w-full rounded-md border border-ink/15 bg-paper px-3 py-2 text-sm text-ink focus:border-sky focus:outline-none focus:ring-2 focus:ring-sky/40 disabled:opacity-50"
              >
                {(Object.keys(LESSON_KIND_LABELS) as LessonKind[]).map((k) => (
                  <option key={k} value={k}>{LESSON_KIND_LABELS[k]}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label htmlFor="les-title" className="block text-xs font-medium text-ink/70">Title</label>
              <input
                id="les-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={!canAuthor}
                className="mt-1 w-full rounded-md border border-ink/15 bg-paper px-3 py-2 text-sm text-ink focus:border-sky focus:outline-none focus:ring-2 focus:ring-sky/40 disabled:opacity-50"
              />
            </div>
          </div>

          {(kind === 'VIDEO' || kind === 'PDF' || kind === 'LINK') ? (
            <div className="mt-3">
              <label htmlFor="les-url" className="block text-xs font-medium text-ink/70">
                {kind === 'VIDEO' ? 'Video URL (hosted externally)' : kind === 'PDF' ? 'PDF URL' : 'External URL'}
              </label>
              <input
                id="les-url"
                type="url"
                value={assetUrl}
                onChange={(e) => setAssetUrl(e.target.value)}
                disabled={!canAuthor}
                className="mt-1 w-full rounded-md border border-ink/15 bg-paper px-3 py-2 font-mono text-xs text-ink focus:border-sky focus:outline-none focus:ring-2 focus:ring-sky/40 disabled:opacity-50"
              />
              {kind === 'VIDEO' ? (
                <p className="mt-1 text-xs text-ink/60">
                  Video is always hosted externally (Mux, Cloudflare Stream, unlisted YouTube). Never
                  served from the app.
                </p>
              ) : null}
            </div>
          ) : null}

          {kind === 'TEXT' ? (
            <div className="mt-3">
              <label htmlFor="les-body" className="block text-xs font-medium text-ink/70">Body text</label>
              <textarea
                id="les-body"
                rows={8}
                value={bodyText}
                onChange={(e) => setBodyText(e.target.value)}
                disabled={!canAuthor}
                className="mt-1 w-full rounded-md border border-ink/15 bg-paper px-3 py-2 text-sm text-ink focus:border-sky focus:outline-none focus:ring-2 focus:ring-sky/40 disabled:opacity-50"
              />
              <p className="mt-1 text-xs text-ink/60">{bodyText.length} characters</p>
            </div>
          ) : null}

          <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
            <div>
              <label htmlFor="les-dur" className="block text-xs font-medium text-ink/70">Duration (minutes)</label>
              <input
                id="les-dur"
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                disabled={!canAuthor}
                className="mt-1 w-full rounded-md border border-ink/15 bg-paper px-3 py-2 font-mono text-sm text-ink focus:border-sky focus:outline-none focus:ring-2 focus:ring-sky/40 disabled:opacity-50"
              />
            </div>
          </div>

          {error ? <p role="alert" className="mt-3 text-xs text-red-700">{error}</p> : null}

          {canAuthor ? (
            <div className="mt-4 flex gap-2">
              <Button variant="primary" type="submit">Save lesson</Button>
              <Button variant="outline" type="button" onClick={() => window.history.back()}>Cancel</Button>
            </div>
          ) : null}
        </form>
      </Card>
    </div>
  );
}