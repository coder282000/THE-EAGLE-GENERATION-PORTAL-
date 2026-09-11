"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import {
  getModerationSummary,
  canViewModeration,
} from "@/lib/mock/moderation";

const ResponsiveContainer = dynamic(
  () => import("recharts").then((m) => m.ResponsiveContainer),
  { ssr: false }
);
const LineChart = dynamic(() => import("recharts").then((m) => m.LineChart), { ssr: false });
const Line = dynamic(() => import("recharts").then((m) => m.Line), { ssr: false });
const XAxis = dynamic(() => import("recharts").then((m) => m.XAxis), { ssr: false });
const YAxis = dynamic(() => import("recharts").then((m) => m.YAxis), { ssr: false });
const Tooltip = dynamic(() => import("recharts").then((m) => m.Tooltip), { ssr: false });
const CartesianGrid = dynamic(() => import("recharts").then((m) => m.CartesianGrid), { ssr: false });
const BarChart = dynamic(() => import("recharts").then((m) => m.BarChart), { ssr: false });
const Bar = dynamic(() => import("recharts").then((m) => m.Bar), { ssr: false });
const PieChart = dynamic(() => import("recharts").then((m) => m.PieChart), { ssr: false });
const Pie = dynamic(() => import("recharts").then((m) => m.Pie), { ssr: false });
const Cell = dynamic(() => import("recharts").then((m) => m.Cell), { ssr: false });

const RANGE_OPTIONS = [7, 30, 90] as const;

export default function ModerationAnalyticsPage() {
  const [rangeDays, setRangeDays] = useState<(typeof RANGE_OPTIONS)[number]>(30);
  const canView = canViewModeration();
  const summary = useMemo(() => getModerationSummary(), []);

  if (!canView || !summary) {
    return (
      <div className="p-6">
        <div className="rounded-lg border border-ink/10 bg-paper p-6 text-sm text-ink/70">
          You do not have permission to view moderation analytics.
        </div>
      </div>
    );
  }

  const resolutionPie = [
    { name: "Removed", value: summary.resolutionMix.removed, color: "#DC2626" },
    { name: "Warned", value: summary.resolutionMix.warned, color: "#D97706" },
    { name: "Suspended", value: summary.resolutionMix.suspended, color: "#7C3AED" },
    { name: "Escalated", value: summary.resolutionMix.escalated, color: "#2563EB" },
    { name: "Dismissed", value: summary.resolutionMix.dismissed, color: "#6B7280" },
  ];

  const totalActions = resolutionPie.reduce((s, x) => s + x.value, 0);

  return (
    <div className="space-y-6 p-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Moderation analytics</h1>
          <p className="mt-1 text-sm text-ink/60">
            Volume, response time, and resolution across reports.
          </p>
        </div>
        <div className="flex gap-2">
          {RANGE_OPTIONS.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setRangeDays(d)}
              className={
                "rounded-md border px-3 py-1 text-xs " +
                (rangeDays === d ? "border-sky bg-sky/10 text-sky" : "border-ink/20 text-ink/70 hover:bg-ink/5")
              }
            >
              Last {d} days
            </button>
          ))}
        </div>
      </header>

      <section className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <Kpi
          label="Reports received"
          value={summary.reportsReceived}
          denominator={`in the last ${rangeDays} days`}
        />
        <Kpi
          label="Median first response"
          value={`${summary.medianFirstResponseH}h`}
          denominator={`over ${summary.reportsReceived} reports received`}
        />
        <Kpi
          label="Median resolution"
          value={`${summary.medianResolutionH}h`}
          denominator={`over ${summary.resolutionMix.removed + summary.resolutionMix.warned + summary.resolutionMix.suspended + summary.resolutionMix.escalated + summary.resolutionMix.dismissed} reports resolved`}
        />
        <Kpi
          label="Resolution rate"
          value={`${Math.round(summary.resolutionRate * 100)}%`}
          denominator={`${Math.round(summary.resolutionRate * summary.reportsReceived)} resolved of ${summary.reportsReceived} received`}
        />
        <Kpi
          label="Repeat reporters"
          value={`${Math.round(summary.repeatReporterRate * 100)}%`}
          denominator={`submitted 2+ reports of unique reporters`}
        />
      </section>

      <section className="rounded-lg border border-ink/10 bg-paper p-5">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink/60">Response time distribution</h2>
        <p className="mb-3 text-xs text-ink/60">
          {summary.reportsReceived} reports bucketed by hours-to-first-response.
        </p>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={summary.responseBuckets}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="bucket" stroke="#6B7280" fontSize={12} />
              <YAxis stroke="#6B7280" fontSize={12} />
              <Tooltip formatter={(v) => Number(v ?? 0).toLocaleString()} />
              <Bar dataKey="count" fill="#2563EB" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="mt-2 text-xs text-ink/50">
          Text alternative: {summary.responseBuckets.map((b) => `${b.bucket}: ${b.count}`).join("; ")}.
        </p>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-lg border border-ink/10 bg-paper p-5">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink/60">Resolution mix</h2>
          <p className="mb-3 text-xs text-ink/60">
            {totalActions} actions taken across the period.
          </p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={resolutionPie} dataKey="value" nameKey="name" outerRadius={90} label>
                  {resolutionPie.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => Number(v ?? 0).toLocaleString()} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="mt-2 flex flex-wrap gap-3 text-xs text-ink/70">
            {resolutionPie.map((x) => (
              <li key={x.name} className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full" style={{ background: x.color }} />
                {x.name}: {x.value}
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-lg border border-ink/10 bg-paper p-5">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink/60">Top reported members</h2>
          <p className="mb-3 text-xs text-ink/60">
            Listed by member number only. Names are not shown, in line with data minimisation.
          </p>
          <table className="w-full text-sm">
            <thead className="bg-ink/5 text-left text-xs uppercase tracking-wide text-ink/60">
              <tr>
                <th scope="col" className="px-3 py-2">Member no.</th>
                <th scope="col" className="px-3 py-2">Reports</th>
                <th scope="col" className="px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/5">
              {summary.topOffenders.map((o) => (
                <tr key={o.memberNumber}>
                  <td className="px-3 py-2 font-mono text-xs">{o.memberNumber}</td>
                  <td className="px-3 py-2">{o.reports}</td>
                  <td className="px-3 py-2">{o.actions}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-lg border border-ink/10 bg-paper p-5">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink/60">Top reporters</h2>
          <table className="w-full text-sm">
            <thead className="bg-ink/5 text-left text-xs uppercase tracking-wide text-ink/60">
              <tr>
                <th scope="col" className="px-3 py-2">Member no.</th>
                <th scope="col" className="px-3 py-2">Reports</th>
                <th scope="col" className="px-3 py-2">Dismissed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/5">
              {summary.topReporters.map((r) => (
                <tr key={r.memberNumber}>
                  <td className="px-3 py-2 font-mono text-xs">{r.memberNumber}</td>
                  <td className="px-3 py-2">{r.reports}</td>
                  <td className="px-3 py-2">{r.dismissed}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="rounded-lg border border-ink/10 bg-paper p-5">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink/60">Top chapters by reports</h2>
          <table className="w-full text-sm">
            <thead className="bg-ink/5 text-left text-xs uppercase tracking-wide text-ink/60">
              <tr>
                <th scope="col" className="px-3 py-2">Chapter</th>
                <th scope="col" className="px-3 py-2">Reports</th>
                <th scope="col" className="px-3 py-2">Per 100 members</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/5">
              {summary.topChapters.map((c) => (
                <tr key={c.chapterCode}>
                  <td className="px-3 py-2">{c.chapterCode}</td>
                  <td className="px-3 py-2">{c.reports}</td>
                  <td className="px-3 py-2">{c.per100.toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
}

function Kpi({
  label,
  value,
  denominator,
}: {
  label: string;
  value: number | string;
  denominator: string;
}) {
  return (
    <div className="rounded-lg border border-ink/10 bg-paper p-4">
      <div className="text-xs uppercase tracking-wide text-ink/50">{label}</div>
      <div className="mt-1 text-2xl font-semibold text-ink">{value}</div>
      <div className="mt-1 text-xs text-ink/50">of {denominator}</div>
    </div>
  );
}