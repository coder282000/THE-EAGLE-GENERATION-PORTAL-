'use client';

// ADM-061 — Learning Analytics
// Route: /admin/learning/analytics

import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Card } from '@/components/card';
import {
  getAnalytics,
  getCourseCounts,
  getCohortCounts,
  getCertificateCounts,
  canViewLearning,
  PILLAR_LABELS,
  type Pillar,
} from '@/lib/mock/learning';

function Kpi({
  label,
  value,
  denominator,
  hint,
  tone,
}: {
  label: string;
  value: string;
  denominator?: string;
  hint?: string;
  tone?: 'clay' | 'red' | 'emerald';
}) {
  const cls =
    tone === 'red' ? 'text-red-700' : tone === 'clay' ? 'text-clay' : tone === 'emerald' ? 'text-emerald-700' : 'text-ink';
  return (
    <Card>
      <dl>
        <dt className="text-xs uppercase tracking-wide text-ink/60">{label}</dt>
        <dd className={`mt-1 font-mono text-2xl font-semibold ${cls}`}>{value}</dd>
        {denominator ? (
          <dd className="mt-0.5 text-xs text-ink/60">
            <span className="font-medium">Denominator:</span> {denominator}
          </dd>
        ) : null}
        {hint ? <dd className="mt-1 text-xs text-ink/60">{hint}</dd> : null}
      </dl>
    </Card>
  );
}

export default function LearningAnalyticsPage() {
  const allowed = canViewLearning();
  const analytics = useMemo(() => (allowed ? getAnalytics() : []), [allowed]);
  const courseCounts = useMemo(() => getCourseCounts(), []);
  const cohortCounts = useMemo(() => getCohortCounts(), []);
  const certCounts = useMemo(() => getCertificateCounts(), []);

  const latest = analytics[0] ?? null;

  const dropOffData = useMemo(
    () =>
      latest
        ? latest.dropOffsByLesson.map((d) => ({
            lesson: d.lessonTitle.length > 30 ? d.lessonTitle.slice(0, 28) + '…' : d.lessonTitle,
            fullTitle: d.lessonTitle,
            dropOff: d.dropOffPct,
          }))
        : [],
    [latest]
  );

  const pillarData = useMemo(
    () =>
      latest
        ? latest.byPillar.map((p) => ({
            pillar: PILLAR_LABELS[p.pillar as Pillar],
            enrolments: p.enrolments,
            completionPct: p.completionPct,
          }))
        : [],
    [latest]
  );

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
      <header className="mb-6">
        <p className="text-xs uppercase tracking-wide text-ink/60">PNL-05 · Learning</p>
        <h1 className="mt-1 text-2xl font-semibold text-ink">Learning Analytics</h1>
        <p className="mt-1 text-sm text-ink/70">
          Enrolments, completion, drop-off by lesson, and outcomes by pillar. Every rate shows its
          denominator (FR-10.6).
        </p>
      </header>

      <section aria-label="Learning KPIs" className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Kpi
          label="Enrolments (30d)"
          value={String(latest?.enrolments ?? 0)}
          denominator={`${courseCounts.published} published courses · ${cohortCounts.running} running cohorts`}
        />
        <Kpi
          label="Completion rate"
          value={`${latest?.completionRatePct ?? 0}%`}
          denominator={
            latest ? `${latest.completions} completions of ${latest.enrolments} enrolments` : undefined
          }
          hint="Target 65% at M12"
          tone={latest && latest.completionRatePct >= 65 ? 'emerald' : 'clay'}
        />
        <Kpi
          label="Avg time to complete"
          value={latest ? `${latest.avgTimeToCompleteDays} days` : '—'}
          denominator={
            latest ? `${latest.completions} completed enrolments` : undefined
          }
        />
        <Kpi
          label="Certificates issued"
          value={String(certCounts.issued)}
          denominator={`${certCounts.revoked} revoked`}
        />
      </section>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="text-sm font-semibold text-ink">Drop-off by lesson</h2>
          <p className="mt-1 text-xs text-ink/60">
            Percentage of cohort who drop out at each lesson. Spikes point to lessons that need
            re-authoring.
          </p>
          <div className="mt-4 h-64" aria-hidden>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dropOffData} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="lesson" tick={{ fontSize: 10 }} interval={0} angle={-15} textAnchor="end" height={60} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}%`} />
                <Tooltip formatter={(v) => `${Number(v ?? 0).toFixed(1)}%`} />
                <Bar dataKey="dropOff" fill="#D97706" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <table className="sr-only">
            <caption>Drop-off by lesson</caption>
            <thead>
              <tr>
                <th scope="col">Lesson</th>
                <th scope="col">Drop-off</th>
              </tr>
            </thead>
            <tbody>
              {dropOffData.map((d) => (
                <tr key={d.fullTitle}>
                  <td>{d.fullTitle}</td>
                  <td>{d.dropOff.toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
          {dropOffData.length > 0 ? (
            <p className="mt-3 text-xs text-clay">
              Largest drop-off: &ldquo;{dropOffData.reduce((max, d) => (d.dropOff > max.dropOff ? d : max), dropOffData[0]).fullTitle}&rdquo;
            </p>
          ) : null}
        </Card>

        <Card>
          <h2 className="text-sm font-semibold text-ink">Enrolments and completion by pillar</h2>
          <p className="mt-1 text-xs text-ink/60">
            Enrolment volume versus completion rate — a high volume and low rate points to content
            mismatch.
          </p>
          <div className="mt-4 h-64" aria-hidden>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pillarData} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="pillar" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="enrolments" fill="#2563EB" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <table className="sr-only">
            <caption>Enrolments and completion by pillar</caption>
            <thead>
              <tr>
                <th scope="col">Pillar</th>
                <th scope="col">Enrolments</th>
                <th scope="col">Completion %</th>
              </tr>
            </thead>
            <tbody>
              {pillarData.map((p) => (
                <tr key={p.pillar}>
                  <td>{p.pillar}</td>
                  <td>{p.enrolments}</td>
                  <td>{p.completionPct}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>

      <Card className="mt-6">
        <h2 className="text-sm font-semibold text-ink">Reading these numbers</h2>
        <p className="mt-2 text-sm text-ink/70">
          Drop-off is measured per lesson, not per phase — a phase-level view hides which specific
          lesson lost the cohort. Completion rate is measured per enrolment, not per course; a course
          can be run twice with very different outcomes. Every KPI in this panel displays its
          denominator because a rate without one is a claim, not a measurement.
        </p>
      </Card>
    </div>
  );
}