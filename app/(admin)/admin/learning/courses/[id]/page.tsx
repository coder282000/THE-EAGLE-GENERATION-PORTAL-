'use client';

// ADM-051 — Course Builder (structure and phases)
// Route: /admin/learning/courses/[id]

import { useMemo } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Card } from '@/components/card';
import {
  getCourseById,
  getPhasesByCourse,
  getLessonsByCourse,
  getQuizByPhase,
  getAssignmentByPhase,
  canViewLearning,
  canAuthorCourses,
  PILLAR_LABELS,
  COURSE_LEVEL_LABELS,
  COURSE_STATUS_LABELS,
  PHASE_LABELS,
  LESSON_KIND_LABELS,
  type PhaseKind,
} from '@/lib/mock/learning';

export default function CourseBuilderPage() {
  const params = useParams<{ id: string }>();
  const course = useMemo(() => getCourseById(params.id), [params.id]);
  const phases = useMemo(() => (course ? getPhasesByCourse(course.id) : []), [course]);
  const lessons = useMemo(() => (course ? getLessonsByCourse(course.id) : []), [course]);
  const canAuthor = canAuthorCourses();

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

  if (!course) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <Card>
          <h1 className="text-lg font-semibold text-ink">Course not found</h1>
          <Link href="/admin/learning" className="mt-3 inline-block text-sm text-sky hover:underline">
            Back to learning dashboard
          </Link>
        </Card>
      </div>
    );
  }

  const publishable = phases.length === 3 && phases.every((p) => p.lessonIds.length > 0);

  function phaseLessons(phaseId: string) {
    return lessons.filter((l) => l.phaseId === phaseId).sort((a, b) => a.order - b.order);
  }

  return (
    <div className="p-6">
      <nav aria-label="Breadcrumb" className="mb-3 text-xs text-ink/60">
        <Link href="/admin/learning" className="hover:text-sky">Learning</Link>
        <span className="mx-2">/</span>
        <Link href="/admin/learning/courses" className="hover:text-sky">Courses</Link>
        <span className="mx-2">/</span>
        <span className="text-ink">{course.title}</span>
      </nav>

      <header className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-ink/60">PNL-05 · Course builder</p>
          <h1 className="mt-1 text-2xl font-semibold text-ink">{course.title}</h1>
          <p className="mt-1 text-sm text-ink/70">
            {PILLAR_LABELS[course.pillar]} · {COURSE_LEVEL_LABELS[course.level]} ·{' '}
            {COURSE_STATUS_LABELS[course.status]}
          </p>
          <p className="mt-1 font-mono text-xs text-ink/60">{course.slug}</p>
        </div>
        <div className="text-right text-xs text-ink/60">
          <div>Last updated {new Date(course.updatedAt).toLocaleString('en-GB')}</div>
          {course.publishedAt ? (
            <div>Published {new Date(course.publishedAt).toLocaleDateString('en-GB')}</div>
          ) : null}
        </div>
      </header>

      {!canAuthor ? (
        <div role="note" className="mb-4 rounded-lg border border-clay/30 bg-clay/5 p-3 text-sm text-ink">
          Your role can view this course but not edit it. Admin, Super Admin, and Instructor roles can
          author.
        </div>
      ) : !publishable ? (
        <div role="alert" className="mb-4 rounded-lg border border-clay/40 bg-clay/5 p-3 text-sm text-ink">
          <strong className="font-medium">Not publishable yet.</strong> All three phases must exist with at
          least one lesson each. Currently {phases.length} of 3 phases populated.
        </div>
      ) : course.status === 'PUBLISHED' ? (
        <div role="status" className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
          Course is published. Members can enrol in open cohorts.
        </div>
      ) : null}

      <Card>
        <h2 className="text-sm font-semibold text-ink">Course summary</h2>
        <p className="mt-2 text-sm text-ink">{course.summary}</p>
      </Card>

      <div className="mt-4 space-y-4">
        {phases.map((phase) => {
          const quiz = getQuizByPhase(phase.id);
          const assignment = getAssignmentByPhase(phase.id);
          const phaseLessonList = phaseLessons(phase.id);
          return (
            <Card key={phase.id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-sm font-semibold text-ink">
                      Phase {phase.order} · {PHASE_LABELS[phase.kind as PhaseKind]}
                    </h2>
                    <span className="inline-flex rounded-full bg-sky/15 px-2 py-0.5 text-xs font-medium text-sky">
                      {phaseLessonList.length} lesson{phaseLessonList.length === 1 ? '' : 's'}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-ink/80">{phase.title}</p>
                  <p className="mt-1 text-xs text-ink/60">{phase.summary}</p>
                </div>
                {canAuthor ? (
                  <div className="flex gap-2">
                    <Link
                      href={`/admin/learning/lessons/new?courseId=${course.id}&phaseId=${phase.id}`}
                      className="rounded-md border border-ink/20 bg-paper px-2 py-1 text-xs font-medium text-ink hover:bg-ink/5"
                    >
                      Add lesson
                    </Link>
                  </div>
                ) : null}
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
                <div className="lg:col-span-2">
                  <h3 className="text-xs uppercase tracking-wide text-ink/60">Lessons</h3>
                  {phaseLessonList.length === 0 ? (
                    <p className="mt-2 text-sm text-ink/60">No lessons yet.</p>
                  ) : (
                    <ol className="mt-2 divide-y divide-ink/5 rounded border border-ink/10">
                      {phaseLessonList.map((l) => (
                        <li key={l.id} className="flex items-center justify-between gap-3 p-2">
                          <div className="flex items-center gap-3">
                            <span className="font-mono text-xs text-ink/60">{l.order}</span>
                            <div>
                              <p className="text-sm text-ink">{l.title}</p>
                              <p className="text-xs text-ink/60">
                                {LESSON_KIND_LABELS[l.kind]} · {l.durationMinutes} min
                              </p>
                            </div>
                          </div>
                          {canAuthor ? (
                            <Link
                              href={`/admin/learning/lessons/${l.id}`}
                              className="text-xs font-medium text-sky hover:underline"
                            >
                              Edit
                            </Link>
                          ) : null}
                        </li>
                      ))}
                    </ol>
                  )}
                </div>

                <div>
                  <h3 className="text-xs uppercase tracking-wide text-ink/60">Gate</h3>
                  <div className="mt-2 space-y-2">
                    {quiz ? (
                      <div className="rounded border border-ink/10 p-2">
                        <p className="text-xs font-medium text-ink">Quiz · {quiz.title}</p>
                        <p className="text-xs text-ink/60">
                          Pass {quiz.passMarkPct}% · {quiz.attemptLimit} attempts
                        </p>
                        <p className="text-xs text-ink/60">
                          {quiz.questions.length} question{quiz.questions.length === 1 ? '' : 's'}
                        </p>
                      </div>
                    ) : null}
                    {assignment ? (
                      <div className="rounded border border-ink/10 p-2">
                        <p className="text-xs font-medium text-ink">Assignment · {assignment.title}</p>
                        <p className="text-xs text-ink/60">
                          Due {assignment.dueDays} days · {assignment.rubric.length} criteria
                        </p>
                      </div>
                    ) : null}
                    {!quiz && !assignment ? (
                      <p className="text-sm text-ink/60">No gate configured.</p>
                    ) : null}
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <Card className="mt-6">
        <h2 className="text-sm font-semibold text-ink">Publication rules</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-ink/70">
          <li>All three phases must exist: Foundation, Specialisation, Application.</li>
          <li>Each phase must have at least one lesson.</li>
          <li>Foundation and Specialisation gates are quizzes; Application has an assignment.</li>
          <li>Publishing triggers email notification to instructors and opens cohort creation.</li>
          <li>Once published, edits create a new content revision; learners already in a cohort see
          the version pinned at their enrolment.</li>
        </ul>
      </Card>
    </div>
  );
}