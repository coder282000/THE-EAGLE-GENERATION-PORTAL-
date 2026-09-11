"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import {
  getTransactions,
  getProducts,
  canViewCommerce,
  formatMoney,
  TRANSACTION_SURFACE_LABELS,
  type TransactionSurface,
} from "@/lib/mock/commerce";

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

const SURFACES: TransactionSurface[] = ["EVENTS", "SHOP", "COURSES", "SUBSCRIPTIONS", "DONATIONS"];

export default function RevenueAnalyticsPage() {
  const [rangeDays, setRangeDays] = useState<(typeof RANGE_OPTIONS)[number]>(30);
  const [surfaceFilter, setSurfaceFilter] = useState<TransactionSurface | "all">("all");

  const canView = canViewCommerce();
  const transactions = useMemo(() => getTransactions(), []);
  const products = useMemo(() => getProducts(), []);

  if (!canView) {
    return (
      <div className="p-6">
        <div className="rounded-lg border border-ink/10 bg-paper p-6 text-sm text-ink/70">
          You do not have permission to view revenue analytics.
        </div>
      </div>
    );
  }

  const payments = transactions.filter((t) => t.type === "PAYMENT" && t.status === "SUCCESS");
  const refunds = transactions.filter((t) => t.type === "REFUND" && t.status === "SUCCESS");

  const scopedPayments = surfaceFilter === "all"
    ? payments
    : payments.filter((t) => t.surface === surfaceFilter);

  const revenue = scopedPayments.reduce((s, t) => s + t.amountMinor, 0);
  const refundTotal = refunds
    .filter((t) => surfaceFilter === "all" || t.surface === surfaceFilter)
    .reduce((s, t) => s + t.amountMinor, 0);
  const net = revenue - refundTotal;
  const avg = scopedPayments.length > 0 ? Math.round(revenue / scopedPayments.length) : 0;

  // Revenue by surface
  const bySurface = SURFACES.map((s) => ({
    surface: TRANSACTION_SURFACE_LABELS[s],
    revenue: payments
      .filter((t) => t.surface === s)
      .reduce((sum, t) => sum + t.amountMinor, 0),
  }));

  // Revenue by month (last 6 months)
  const monthlyData = useMemo(() => {
    const map: Record<string, number> = {};
    for (const t of payments) {
      const key = t.createdAt.slice(0, 7);
      map[key] = (map[key] ?? 0) + t.amountMinor;
    }
    const keys = Object.keys(map).sort().slice(-6);
    return keys.map((k) => ({
      month: k,
      revenue: Math.round(map[k] / 100),
      target: 900000,
    }));
  }, [payments]);

  // Revenue by product (approximation using top products)
  const productRevenue = products
    .filter((p) => p.surface !== undefined)
    .map((p) => ({
      name: p.name,
      revenue: payments
        .filter((t) => t.surface === p.surface)
        .reduce((sum, t) => sum + t.amountMinor, 0) / products.filter((x) => x.surface === p.surface).length,
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  return (
    <div className="space-y-6 p-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Revenue analytics</h1>
          <p className="mt-1 text-sm text-ink/60">
            Revenue by surface, product, and period.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={surfaceFilter}
            onChange={(e) => setSurfaceFilter(e.target.value as TransactionSurface | "all")}
            className="rounded-md border border-ink/20 bg-white px-3 py-1 text-xs"
            aria-label="Filter by surface"
          >
            <option value="all">All surfaces</option>
            {SURFACES.map((s) => (
              <option key={s} value={s}>{TRANSACTION_SURFACE_LABELS[s]}</option>
            ))}
          </select>
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
              Last {d}d
            </button>
          ))}
        </div>
      </header>

      <section className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <Kpi label="Revenue" value={formatMoney(revenue, "KES")} tone="success" />
        <Kpi label="Transactions" value={scopedPayments.length} />
        <Kpi label="Average value" value={formatMoney(avg, "KES")} />
        <Kpi
          label="Refunds"
          value={formatMoney(refundTotal, "KES")}
          tone={refundTotal > 0 ? "clay" : "ink"}
        />
        <Kpi label="Net revenue" value={formatMoney(net, "KES")} />
      </section>

      <section className="rounded-lg border border-ink/10 bg-paper p-5">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink/60">
          Revenue over time
        </h2>
        <p className="mb-3 text-xs text-ink/60">
          Actual revenue vs. target KES 900,000 per month.
        </p>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="month" stroke="#6B7280" fontSize={12} />
              <YAxis stroke="#6B7280" fontSize={12} />
              <Tooltip formatter={(v) => `KES ${Number(v ?? 0).toLocaleString("en-KE")}`} />
              <Line type="monotone" dataKey="revenue" stroke="#2563EB" strokeWidth={2} dot={false} name="Actual" />
              <Line type="monotone" dataKey="target" stroke="#D97706" strokeDasharray="5 5" strokeWidth={2} dot={false} name="Target" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-lg border border-ink/10 bg-paper p-5">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink/60">
            Revenue by surface
          </h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bySurface.map((s) => ({ surface: s.surface, revenue: Math.round(s.revenue / 100) }))} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis type="number" stroke="#6B7280" fontSize={12} />
                <YAxis type="category" dataKey="surface" stroke="#6B7280" fontSize={12} width={120} />
                <Tooltip formatter={(v) => `KES ${Number(v ?? 0).toLocaleString("en-KE")}`} />
                <Bar dataKey="revenue" fill="#2563EB" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-2 text-xs text-ink/50">
            Text alternative: {bySurface.map((s) => `${s.surface} KES ${Math.round(s.revenue / 100).toLocaleString("en-KE")}`).join("; ")}.
          </p>
        </section>

        <section className="rounded-lg border border-ink/10 bg-paper p-5">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink/60">
            Top products (approximate)
          </h2>
          <p className="mb-3 text-xs text-ink/60">
            Average revenue per product within surface. Real implementation aggregates per SKU.
          </p>
          <ul className="space-y-2 text-sm">
            {productRevenue.map((p) => (
              <li key={p.name} className="flex items-center justify-between border-b border-ink/5 pb-2">
                <span className="text-ink/80">{p.name}</span>
                <span className="font-mono text-xs">{formatMoney(Math.round(p.revenue), "KES")}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="rounded-lg border border-ink/10 bg-paper p-5">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink/60">
          Monthly summary
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <caption className="sr-only">Monthly revenue summary</caption>
            <thead className="bg-ink/5 text-left text-xs uppercase tracking-wide text-ink/60">
              <tr>
                <th scope="col" className="px-4 py-2">Month</th>
                <th scope="col" className="px-4 py-2">Revenue</th>
                <th scope="col" className="px-4 py-2">Target</th>
                <th scope="col" className="px-4 py-2">Variance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/5">
              {monthlyData.map((m) => {
                const variance = m.revenue - m.target;
                return (
                  <tr key={m.month}>
                    <td className="px-4 py-3 font-medium text-ink">{m.month}</td>
                    <td className="px-4 py-3">
                      KES {m.revenue.toLocaleString("en-KE")}
                    </td>
                    <td className="px-4 py-3 text-ink/70">
                      KES {m.target.toLocaleString("en-KE")}
                    </td>
                    <td className={"px-4 py-3 " + (variance >= 0 ? "text-green-700" : "text-clay")}>
                      {variance >= 0 ? "+" : ""}
                      {variance.toLocaleString("en-KE")}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function Kpi({
  label,
  value,
  tone = "ink",
}: {
  label: string;
  value: string | number;
  tone?: "ink" | "clay" | "danger" | "success";
}) {
  const tones: Record<string, string> = {
    ink: "text-ink",
    clay: "text-clay",
    danger: "text-red-600",
    success: "text-green-700",
  };
  return (
    <div className="rounded-lg border border-ink/10 bg-paper p-4">
      <div className="text-xs uppercase tracking-wide text-ink/50">{label}</div>
      <div className={"mt-1 text-lg font-semibold " + tones[tone]}>{value}</div>
    </div>
  );
}