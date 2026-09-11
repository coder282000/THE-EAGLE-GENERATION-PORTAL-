"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import {
  getMembershipKpis,
  getApplicationFunnel,
  getMembershipByTier,
  getMembershipGrowth,
  getChapterLeague,
  canViewMembership,
  formatPercent,
  type ChapterRow,
} from "@/lib/mock/analytics";

const ResponsiveContainer = dynamic(
  () => import("recharts").then((m) => m.ResponsiveContainer),
  { ssr: false }
);
const LineChart = dynamic(() => import("recharts").then((m) => m.LineChart), { ssr: false });
const Line = dynamic(() => import("recharts").then((m) => m.Line), { ssr: false });
const BarChart = dynamic(() => import("recharts").then((m) => m.BarChart), { ssr: false });
const Bar = dynamic(() => import("recharts").then((m) => m.Bar), { ssr: false });
const PieChart = dynamic(() => import("recharts").then((m) => m.PieChart), { ssr: false });
const Pie = dynamic(() => import("recharts").then((m) => m.Pie), { ssr: false });
const Cell = dynamic(() => import("recharts").then((m) => m.Cell), { ssr: false });
const XAxis = dynamic(() => import("recharts").then((m) => m.XAxis), { ssr: false });
const YAxis = dynamic(() => import("recharts").then((m) => m.YAxis), { ssr: false });
const Tooltip = dynamic(() => import("recharts").then((m) => m.Tooltip), { ssr: false });
const CartesianGrid = dynamic(() => import("recharts").then((m) => m.CartesianGrid), { ssr: false });

const RANGE_OPTIONS = [30, 90, 365] as const;

const TIER_COLORS: Record<string, string> = {
  STUDENT: "#2563EB",
  PROFESSIONAL: "#D97706",
  ASSOCIATE: "#7C3AED",
};

const TIER_LABELS: Record<string, string> = {
  STUDENT: "Student",
  PROFESSIONAL: "Professional",
  ASSOCIATE: "Associate",
};

export default function MembershipAnalyticsPage() {
  const [rangeDays, setRangeDays] = useState<(typeof RANGE_OPTIONS)[number]>(90);

  const canView = canViewMembership();
  const kpis = useMemo(() => getMembershipKpis(), []);
  const funnel = useMemo(() => getApplicationFunnel(), []);
  const byTier = useMemo(() => getMembershipByTier(), []);
  const growth = useMemo(() => getMembershipGrowth(), []);
  const chapterRows = useMemo(() => getChapterLeague(), []);

  if (!canView || !funnel) {
    return (
      <div className="p-6">
        <div className="rounded-lg border border-ink/10 bg-paper p-6 text-sm text-ink/70">
          You do not have permission to view membership analytics.
        </div>
      </div>
    );
  }

  const tierData = Object.entries(byTier).map(([k, v]) => ({
    name: TIER_LABELS[k] ?? k,
    value: v,
    color: TIER_COLORS[k] ?? "#6B7280",
  }));

  const funnelData = [
    { stage: "Submitted", count: funnel.submitted },
    { stage: "Under review", count: funnel.underReview },
    { stage: "Interviewed", count: funnel.interviewed },
    { stage: "Approved", count: funnel.approved },
    { stage: "Rejected", count: funnel.rejected },
    { stage: "Lapsed", count: funnel.lapsed },
  ];

  return (
    <div className="space-y-6 p-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Membership analytics</h1>
          <p className="mt-1 text-sm text-ink/60">
            Applications, admissions, and retention.
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
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink/60">Application funnel</h2>
        <p className="mb-3 text-xs text-ink/60">
          {funnel.submitted} applications received. Stages are not cumulative.
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

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="rounded-lg border border-ink/10 bg-paper p-5 lg:col-span-2">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink/60">Membership growth</h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={growth.map((p) => ({ date: p.date.slice(0, 7), value: p.value }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="date" stroke="#6B7280" fontSize={12} />
                <YAxis stroke="#6B7280" fontSize={12} />
                <Tooltip formatter={(v) => Number(v ?? 0).toLocaleString()} />
                <Line type="monotone" dataKey="value" stroke="#2563EB" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-2 text-xs text-ink/50">
            Text alternative: membership grew from {growth[0]?.value ?? 0} to{" "}
            {growth[growth.length - 1]?.value ?? 0} over {growth.length} months.
          </p>
        </section>

        <section className="rounded-lg border border-ink/10 bg-paper p-5">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink/60">By tier</h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={tierData} dataKey="value" nameKey="name" outerRadius={80} label>
                  {tierData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => Number(v ?? 0).toLocaleString()} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="mt-2 flex flex-wrap gap-3 text-xs text-ink/70">
            {tierData.map((t) => (
              <li key={t.name} className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full" style={{ background: t.color }} />
                {t.name}: {t.value}
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="rounded-lg border border-ink/10 bg-paper p-5">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink/60">Chapter summary</h2>
        <p className="mb-3 text-xs text-ink/60">
          Chapters with fewer than 5 members are marked insufficient data and excluded from medians.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <caption className="sr-only">Chapter membership summary</caption>
            <thead className="bg-ink/5 text-left text-xs uppercase tracking-wide text-ink/60">
              <tr>
                <th scope="col" className="px-4 py-2">Chapter</th>
                <th scope="col" className="px-4 py-2">Region</th>
                <th scope="col" className="px-4 py-2">Type</th>
                <th scope="col" className="px-4 py-2">Members</th>
                <th scope="col" className="px-4 py-2">Growth (30d)</th>
                <th scope="col" className="px-4 py-2">Retention</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/5">
              {chapterRows.map((r: ChapterRow) => (
                <tr key={r.code} className="hover:bg-ink/5">
                  <td className="px-4 py-3 font-medium text-ink">{r.name}</td>
                  <td className="px-4 py-3 text-ink/70">{r.region}</td>
                  <td className="px-4 py-3 text-ink/70">{r.type}</td>
                  <td className="px-4 py-3">{r.members}</td>
                  <td className="px-4 py-3">+{r.growth30d}</td>
                  <td className="px-4 py-3">
                    {r.insufficientData ? (
                      <span className="text-ink/50">Insufficient data</span>
                    ) : (
                      formatPercent(r.retention)
                    )}
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
    kpi.unit === "percent"
      ? formatPercent(kpi.value)
      : kpi.value.toLocaleString();

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