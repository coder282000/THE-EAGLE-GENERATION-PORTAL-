"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import {
  getFinancialKpis,
  getRevenueBySurface,
  getPaymentMethodMix,
  getSettlementAging,
  getFinancialMonthly,
  getRevenueByMonth,
  canViewFinancial,
  formatMoney,
  formatPercent,
  type SurfaceRevenue,
  type MonthlySummary,
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

const SURFACE_LABELS: Record<string, string> = {
  EVENTS: "Events",
  SHOP: "Shop",
  COURSES: "Courses",
  SUBSCRIPTIONS: "Subscriptions",
  DONATIONS: "Donations",
};

const METHOD_COLORS: Record<string, string> = {
  "M-Pesa": "#16A34A",
  Card: "#2563EB",
  Bank: "#7C3AED",
  Other: "#6B7280",
};

export default function FinancialAnalyticsPage() {
  const [rangeDays, setRangeDays] = useState<(typeof RANGE_OPTIONS)[number]>(30);

  const canView = canViewFinancial();
  const kpis = useMemo(() => getFinancialKpis(), []);
  const surfaces = useMemo(() => getRevenueBySurface(), []);
  const methods = useMemo(() => getPaymentMethodMix(), []);
  const aging = useMemo(() => getSettlementAging(), []);
  const monthly = useMemo(() => getFinancialMonthly(), []);
  const revenueSeries = useMemo(() => getRevenueByMonth(), []);

  if (!canView || !aging) {
    return (
      <div className="p-6">
        <div className="rounded-lg border border-ink/10 bg-paper p-6 text-sm text-ink/70">
          You do not have permission to view financial analytics.
        </div>
      </div>
    );
  }

  const surfaceData = surfaces.map((s: SurfaceRevenue) => ({
    surface: SURFACE_LABELS[s.surface] ?? s.surface,
    revenue: Math.round(s.revenueMinor / 100),
  }));

  const methodData = Object.entries(methods).map(([k, v]) => ({
    name: k,
    value: Math.round(v * 100),
    color: METHOD_COLORS[k] ?? "#6B7280",
  }));

  const agingData = [
    { stage: "Settled", count: aging.settled },
    { stage: "Pending", count: aging.pending },
    { stage: "Overdue", count: aging.overdue },
  ];

  return (
    <div className="space-y-6 p-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Financial analytics</h1>
          <p className="mt-1 text-sm text-ink/60">
            Revenue, settlement, and reconciliation across every surface.
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

      <div role="note" className="rounded-lg border border-sky/30 bg-sky/5 p-3 text-xs text-ink/80">
        All amounts are stored and displayed as integer minor units with an explicit ISO 4217 currency. Never floats.
      </div>

      <section className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        {kpis.map((k) => (
          <Kpi key={k.key} kpi={k} />
        ))}
      </section>

      <section className="rounded-lg border border-ink/10 bg-paper p-5">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink/60">
          Revenue processed (KES) - target overlay
        </h2>
        <p className="mb-3 text-xs text-ink/60">
          Solid line is actual revenue. Target KES 900,000 per month (Charter S6), shown as a dashed line.
        </p>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={revenueSeries.map((p) => ({
                date: p.date.slice(0, 7),
                actual: Math.round(p.value / 100),
                target: 900000,
              }))}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="date" stroke="#6B7280" fontSize={12} />
              <YAxis stroke="#6B7280" fontSize={12} />
              <Tooltip formatter={(v) => `KES ${Number(v ?? 0).toLocaleString("en-KE")}`} />
              <Line type="monotone" dataKey="actual" stroke="#2563EB" strokeWidth={2} dot={false} name="Actual" />
              <Line type="monotone" dataKey="target" stroke="#D97706" strokeDasharray="5 5" strokeWidth={2} dot={false} name="Target (not achieved)" />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <p className="mt-2 text-xs text-ink/50">
          Text alternative: revenue grew from{" "}
          {revenueSeries[0] ? formatMoney(revenueSeries[0].value, "KES") : "-"} to{" "}
          {revenueSeries[revenueSeries.length - 1] ? formatMoney(revenueSeries[revenueSeries.length - 1].value, "KES") : "-"}. Target is KES 900,000 per month.
        </p>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-lg border border-ink/10 bg-paper p-5">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink/60">
            Revenue by surface
          </h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={surfaceData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis type="number" stroke="#6B7280" fontSize={12} />
                <YAxis type="category" dataKey="surface" stroke="#6B7280" fontSize={12} width={110} />
                <Tooltip formatter={(v) => `KES ${Number(v ?? 0).toLocaleString("en-KE")}`} />
                <Bar dataKey="revenue" fill="#2563EB" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-2 text-xs text-ink/50">
            Text alternative: {surfaceData.map((s) => `${s.surface} KES ${s.revenue.toLocaleString("en-KE")}`).join("; ")}.
          </p>
        </section>

        <section className="rounded-lg border border-ink/10 bg-paper p-5">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink/60">
            Payment method mix
          </h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={methodData} dataKey="value" nameKey="name" outerRadius={80} label>
                  {methodData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => `${Number(v ?? 0)}%`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="mt-2 flex flex-wrap gap-3 text-xs text-ink/70">
            {methodData.map((m) => (
              <li key={m.name} className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full" style={{ background: m.color }} />
                {m.name}: {m.value}%
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="rounded-lg border border-ink/10 bg-paper p-5">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink/60">
          Settlement aging
        </h2>
        <p className="mb-3 text-xs text-ink/60">
          {aging.settled + aging.pending + aging.overdue} transactions in range.
        </p>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={agingData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="stage" stroke="#6B7280" fontSize={12} />
              <YAxis stroke="#6B7280" fontSize={12} />
              <Tooltip formatter={(v) => Number(v ?? 0).toLocaleString()} />
              <Bar dataKey="count" fill="#7C3AED" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="mt-2 text-xs text-ink/50">
          Text alternative: {agingData.map((a) => `${a.stage}: ${a.count}`).join("; ")}.
        </p>
      </section>

      <section className="rounded-lg border border-ink/10 bg-paper p-5">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink/60">
          Monthly summary
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <caption className="sr-only">Monthly financial summary</caption>
            <thead className="bg-ink/5 text-left text-xs uppercase tracking-wide text-ink/60">
              <tr>
                <th scope="col" className="px-4 py-2">Month</th>
                <th scope="col" className="px-4 py-2">Revenue</th>
                <th scope="col" className="px-4 py-2">Transactions</th>
                <th scope="col" className="px-4 py-2">Members</th>
                <th scope="col" className="px-4 py-2">Retention</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/5">
              {monthly.map((m: MonthlySummary) => (
                <tr key={m.month} className="hover:bg-ink/5">
                  <td className="px-4 py-3 font-medium text-ink">{m.month}</td>
                  <td className="px-4 py-3">{formatMoney(m.revenueMinor, "KES")}</td>
                  <td className="px-4 py-3">
                    {Math.round(m.revenueMinor / 54867).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">{m.members}</td>
                  <td className="px-4 py-3">{formatPercent(m.retention)}</td>
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
    kpi.unit === "money" && kpi.currency
      ? formatMoney(kpi.value, kpi.currency)
      : kpi.unit === "percent"
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