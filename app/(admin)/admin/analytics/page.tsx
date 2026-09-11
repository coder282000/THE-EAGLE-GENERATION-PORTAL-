"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  getExecutiveKpis,
  getSuccessCriteria,
  getMembershipGrowth,
  getRevenueByMonth,
  getCompletionByWeek,
  canViewExecutive,
  canViewFinancial,
  formatMoney,
  formatPercent,
  type SuccessCriterion,
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

const CRITERIA_TONE: Record<SuccessCriterion["status"], string> = {
  MET: "bg-green-100 text-green-800",
  ON_TRACK: "bg-sky/10 text-sky",
  AT_RISK: "bg-clay/15 text-clay",
  OFF_TRACK: "bg-red-100 text-red-800",
};

const RANGE_OPTIONS = [30, 90, 365] as const;

export default function ExecutiveDashboardPage() {
  const [rangeDays, setRangeDays] = useState<(typeof RANGE_OPTIONS)[number]>(90);

  const canView = canViewExecutive();
  const canViewFin = canViewFinancial();
  const kpis = useMemo(() => getExecutiveKpis(), []);
  const criteria = useMemo(() => getSuccessCriteria(), []);
  const growth = useMemo(() => getMembershipGrowth(), []);
  const revenue = useMemo(() => (canViewFin ? getRevenueByMonth() : []), [canViewFin]);
  const completion = useMemo(() => getCompletionByWeek(), []);

  if (!canView) {
    return (
      <div className="p-6">
        <div className="rounded-lg border border-ink/10 bg-paper p-6 text-sm text-ink/70">
          You do not have permission to view the executive dashboard.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Executive dashboard</h1>
          <p className="mt-1 text-sm text-ink/60">
            Progress against the movement's objectives.
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
          <Link
            href="/admin/analytics/impact"
            className="rounded-md border border-sky bg-sky px-3 py-1 text-xs text-white hover:bg-sky/90"
          >
            Generate impact report
          </Link>
        </div>
      </header>

      <section aria-labelledby="criteria-heading" className="rounded-lg border border-clay/40 bg-clay/5 p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 id="criteria-heading" className="text-sm font-semibold uppercase tracking-wide text-ink/70">
            Success criteria
          </h2>
          <span className="text-xs text-ink/60">Targets are labelled as such. Actuals shown separately.</span>
        </div>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
          {criteria.map((c) => (
            <div key={c.id} className="rounded-md border border-ink/10 bg-paper p-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-ink/50">{c.id}</span>
                <span className={"rounded-full px-2 py-0.5 text-xs " + CRITERIA_TONE[c.status]}>
                  {c.status.replace("_", " ")}
                </span>
              </div>
              <div className="mt-2 text-xs text-ink/70">{c.label}</div>
              <div className="mt-2 text-sm">
                <span className="font-semibold text-ink">
                  {c.unit === "money" && c.currency
                    ? formatMoney(c.actual, c.currency)
                    : c.unit === "percent"
                    ? formatPercent(c.actual)
                    : c.actual.toLocaleString()}
                </span>
                <span className="text-ink/50"> / </span>
                <span className="text-ink/60">
                  target{" "}
                  {c.unit === "money" && c.currency
                    ? formatMoney(c.target, c.currency)
                    : c.unit === "percent"
                    ? formatPercent(c.target)
                    : c.target.toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        {kpis.map((k) => (
          <Kpi key={k.key} kpi={k} />
        ))}
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-lg border border-ink/10 bg-paper p-5">
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

        {canViewFin && (
          <section className="rounded-lg border border-ink/10 bg-paper p-5">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink/60">
              Revenue processed (KES)
            </h2>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenue.map((p) => ({ date: p.date.slice(0, 7), value: p.value / 100 }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="date" stroke="#6B7280" fontSize={12} />
                  <YAxis stroke="#6B7280" fontSize={12} />
                  <Tooltip formatter={(v) => `KES ${Number(v ?? 0).toLocaleString("en-KE")}`} />
                  <Bar dataKey="value" fill="#2563EB" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="mt-2 text-xs text-ink/50">
              Text alternative: revenue processed monthly, latest{" "}
              {revenue.length > 0 ? formatMoney(revenue[revenue.length - 1].value, "KES") : "-"}.
            </p>
          </section>
        )}

        <section className="rounded-lg border border-ink/10 bg-paper p-5 lg:col-span-2">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink/60">
            Course completion rate (weekly)
          </h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={completion.map((p) => ({ date: p.date.slice(5, 10), value: Math.round(p.value * 100) }))}>
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
            {completion[0] ? formatPercent(completion[0].value) : "-"} to{" "}
            {completion[completion.length - 1] ? formatPercent(completion[completion.length - 1].value) : "-"} over the period.
          </p>
        </section>
      </div>
    </div>
  );
}

function Kpi({ kpi }: { kpi: { key: string; label: string; value: number; unit: string; currency?: string; denominator: string; trend: number } }) {
  const valueDisplay =
    kpi.unit === "money" && kpi.currency
      ? formatMoney(kpi.value, kpi.currency)
      : kpi.unit === "percent"
      ? formatPercent(kpi.value)
      : kpi.value.toLocaleString();

  const trendTone = kpi.trend > 0 ? "text-green-700" : kpi.trend < 0 ? "text-red-600" : "text-ink/50";

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