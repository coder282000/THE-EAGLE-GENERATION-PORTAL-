"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import {
  getLearningKpis,
  getCompletionByPillar,
  getPhaseFunnel,
  getCohortSummary,
  getLessonDropOff,
  getCompletionByWeek,
  canViewLearning,
  formatPercent,
  type CohortRow,
  type LessonDropOff,
} from "@/lib/mock/analytics";

const ResponsiveContainer = dynamic(
  () => import("recharts").then((m) => m.ResponsiveContainer),
  { ssr: false }
);
const LineChart = dynamic(() => import("recharts").then((m) => m.LineChart), { ssr: false });
const Line = dynamic(() => import("recharts").then((m) => m.Line), { ssr: false });
const BarChart = dynamic(() => import("recharts").then((m) => m.BarChart), { ssr: false });
const Bar = dynamic(() => import("recharts").then((m) => m.Bar), { ssr: false });
const XAxis = dynamic(() => import("recharts").then((m) => m.XAxis), { ssr: false });
const YAxis = dynamic(() => import("recharts").then((m) => m.YAxis), { ssr: false });
const Tooltip = dynamic(() => import("recharts").then((m) => m.Tooltip), { ssr: false });
const CartesianGrid = dynamic(() => import("recharts").then((m) => m.CartesianGrid), { ssr: false });

const RANGE_OPTIONS = [30, 90, 365] as const;

const PILLAR_LABELS: Record<string, string> = {
  MARKETPLACE: "Marketplace",
  GOVERNANCE: "Governance",
  TECHNOLOGY: "Technology",
};

export default function LearningAnalyticsPage() {
  const [rangeDays, setRangeDays] = useState<(typeof RANGE_OPTIONS)[number]>(90);

  const canView = canViewLearning();
  const kpis = useMemo(() => getLearningKpis(), []);
  const byPillar = useMemo(() => getCompletionByPillar(), []);
  const funnel = useMemo(() => getPhaseFunnel(), []);
  const cohorts = useMemo(() => getCohortSummary(), []);
  const lessons = useMemo(() => getLessonDropOff(), []);
  const weekly = useMemo(() => getCompletionByWeek(), []);

  if (!canView || !funnel) {
    return (
      <div className="p-6">
        <div className="rounded-lg border border-ink/10 bg-paper p-6 text-sm text-ink/70">
          You do not have permission to view learning analytics.
        </div>
      </div>
    );
  }

  const pillarData = Object.entries(byPillar).map(([k, v]) => ({
    pillar: PILLAR_LABELS[k] ?? k,
    rate: Math.round(v * 100),
  }));

  const funnelData = [
    { stage: "Phase 1 started", count: funnel.phase1Started },
    { stage: "Phase 1 complete", count: funnel.phase1Complete },
    { stage: "Phase 2 complete", count: funnel.phase2Complete },
    { stage: "Phase 3 complete", count: funnel.phase3Complete },
    { stage: "Certified", count: funnel.certified },
  ];

  return (
    <div className="space-y-6 p-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Learning analytics</h1>
          <p className="mt-1 text-sm text-ink/60">
            Enrolment, completion, and drop-off across the three pillars.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {RANGE_OPTIONS.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setRangeDays(d)}
              className={
                "rounded-md border px-3 py-1 text-xs " +
                (rangeDays === d
                  ? "border-sky bg-sky/10 text-sky"
                  : "border-ink/20 text-ink/70 hover:bg-ink/5")
              }
            >
              Last {d} days
            </button>
          ))}
        </div>
      </header>

      <section className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        {kpis.map((k) => (
          <Kpi key={k.key} kpi={k} />
        ))}
      </section>

      <section className="rounded-lg border border-ink/10 bg-paper p-5">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink/60">
          Phase completion funnel
        </h2>
        <p className="mb-3 text-xs text-ink/60">
          {funnel.phase1Started} enrolments started Phase 1. Certified shows members who completed all three phases.
        </p>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={funnelData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="stage" stroke="#6B7280" fontSize={12} />
              <YAxis stroke="#6B7280" fontSize={12} />
              <Tooltip formatter={(v) => Number(v ?? 0).toLocaleString()} />
              <Bar dataKey="count" fill="#2563EB" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="mt-2 text-xs text-ink/50">
          Text alternative: {funnelData.map((f) => `${f.stage}: ${f.count}`).join("; ")}.
        </p>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-lg border border-ink/10 bg-paper p-5">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink/60">
            Completion rate by pillar
          </h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pillarData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis type="number" domain={[0, 100]} stroke="#6B7280" fontSize={12} />
                <YAxis type="category" dataKey="pillar" stroke="#6B7280" fontSize={12} width={110} />
                <Tooltip formatter={(v) => `${Number(v ?? 0)}%`} />
                <Bar dataKey="rate" fill="#7C3AED" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-2 text-xs text-ink/50">
            Text alternative: {pillarData.map((p) => `${p.pillar} ${p.rate}%`).join("; ")}.
          </p>
        </section>

        <section className="rounded-lg border border-ink/10 bg-paper p-5">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink/60">
            Weekly completion
          </h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weekly.map((p) => ({ date: p.date.slice(5, 10), value: Math.round(p.value * 100) }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="date" stroke="#6B7280" fontSize={12} />
                <YAxis stroke="#6B7280" fontSize={12} domain={[0, 100]} />
                <Tooltip formatter={(v) => `${Number(v ?? 0)}%`} />
                <Line type="monotone" dataKey="value" stroke="#D97706" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-2 text-xs text-ink/50">
            Text alternative: completion moved from{" "}
            {weekly[0] ? formatPercent(weekly[0].value) : "-"} to{" "}
            {weekly[weekly.length - 1] ? formatPercent(weekly[weekly.length - 1].value) : "-"}.
          </p>
        </section>
      </div>

      <section className="rounded-lg border border-ink/10 bg-paper p-5">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink/60">Cohort summary</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <caption className="sr-only">Cohort summary</caption>
            <thead className="bg-ink/5 text-left text-xs uppercase tracking-wide text-ink/60">
              <tr>
                <th scope="col" className="px-4 py-2">Cohort</th>
                <th scope="col" className="px-4 py-2">Course</th>
                <th scope="col" className="px-4 py-2">Pillar</th>
                <th scope="col" className="px-4 py-2">Capacity</th>
                <th scope="col" className="px-4 py-2">Enrolled</th>
                <th scope="col" className="px-4 py-2">Completed</th>
                <th scope="col" className="px-4 py-2">Completion</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/5">
              {cohorts.map((co: CohortRow) => (
                <tr key={co.id} className="hover:bg-ink/5">
                  <td className="px-4 py-3 font-medium text-ink">{co.name}</td>
                  <td className="px-4 py-3 text-ink/70">{co.course}</td>
                  <td className="px-4 py-3 text-ink/70">{PILLAR_LABELS[co.pillar] ?? co.pillar}</td>
                  <td className="px-4 py-3">{co.capacity}</td>
                  <td className="px-4 py-3">{co.enrolled}</td>
                  <td className="px-4 py-3">{co.completed}</td>
                  <td className="px-4 py-3">
                    {co.enrolled === 0 ? (
                      <span className="text-ink/50">—</span>
                    ) : (
                      formatPercent(co.completionRate)
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-lg border border-ink/10 bg-paper p-5">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink/60">
          Lesson drop-off (top 5)
        </h2>
        <p className="mb-3 text-xs text-ink/60">
          Lessons with the highest number of abandonments. Denominators show enrolments in that lesson's cohort.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <caption className="sr-only">Lesson drop-off</caption>
            <thead className="bg-ink/5 text-left text-xs uppercase tracking-wide text-ink/60">
              <tr>
                <th scope="col" className="px-4 py-2">Lesson</th>
                <th scope="col" className="px-4 py-2">Abandonments</th>
                <th scope="col" className="px-4 py-2">Enrolments</th>
                <th scope="col" className="px-4 py-2">Abandonment rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/5">
              {lessons.map((l: LessonDropOff) => (
                <tr key={l.lessonId} className="hover:bg-ink/5">
                  <td className="px-4 py-3 font-medium text-ink">{l.lessonTitle}</td>
                  <td className="px-4 py-3">{l.abandonments}</td>
                  <td className="px-4 py-3">{l.enrolments}</td>
                  <td className="px-4 py-3">
                    {l.enrolments === 0
                      ? "—"
                      : formatPercent(l.abandonments / l.enrolments)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function Kpi({
  kpi,
}: {
  kpi: {
    key: string;
    label: string;
    value: number;
    unit: string;
    currency?: string;
    denominator: string;
    trend: number;
  };
}) {
  const valueDisplay =
    kpi.unit === "percent" ? formatPercent(kpi.value) : kpi.value.toLocaleString();

  const trendTone =
    kpi.trend > 0 ? "text-green-700" : kpi.trend < 0 ? "text-red-600" : "text-ink/50";

  return (
    <div className="rounded-lg border border-ink/10 bg-paper p-4">
      <div className="text-xs uppercase tracking-wide text-ink/50">{kpi.label}</div>
      <div className="mt-1 text-2xl font-semibold text-ink">{valueDisplay}</div>
      <div className={"mt-1 text-xs " + trendTone}>
        {kpi.trend > 0 ? "+" : ""}
        {kpi.trend}% vs previous period
      </div>
      <div className="mt-2 text-xs text-ink/50">{kpi.denominator}</div>
    </div>
  );
}