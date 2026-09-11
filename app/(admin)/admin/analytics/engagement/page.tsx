"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import {
  getEngagementKpis,
  getFeatureAdoption,
  canViewEngagement,
  formatPercent,
  type FeatureAdoption,
} from "@/lib/mock/analytics";

const ResponsiveContainer = dynamic(
  () => import("recharts").then((m) => m.ResponsiveContainer),
  { ssr: false }
);
const BarChart = dynamic(() => import("recharts").then((m) => m.BarChart), { ssr: false });
const Bar = dynamic(() => import("recharts").then((m) => m.Bar), { ssr: false });
const XAxis = dynamic(() => import("recharts").then((m) => m.XAxis), { ssr: false });
const YAxis = dynamic(() => import("recharts").then((m) => m.YAxis), { ssr: false });
const Tooltip = dynamic(() => import("recharts").then((m) => m.Tooltip), { ssr: false });
const CartesianGrid = dynamic(() => import("recharts").then((m) => m.CartesianGrid), { ssr: false });

const RANGE_OPTIONS = [30, 90] as const;

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const HOUR_BUCKETS = ["00-04", "04-08", "08-12", "12-16", "16-20", "20-24"];

// Mock heatmap: value per [day][hourBucket]
const heatmap: number[][] = [
  [2, 6, 18, 22, 24, 14],
  [3, 8, 20, 24, 26, 16],
  [2, 7, 22, 26, 28, 18],
  [3, 8, 21, 25, 27, 17],
  [4, 9, 20, 22, 24, 20],
  [6, 12, 14, 18, 22, 24],
  [5, 10, 12, 16, 18, 20],
];

function heatTone(v: number): string {
  if (v === 0) return "bg-ink/5";
  if (v < 8) return "bg-sky/15";
  if (v < 15) return "bg-sky/35";
  if (v < 22) return "bg-sky/60";
  return "bg-sky/90";
}

export default function EngagementAnalyticsPage() {
  const [rangeDays, setRangeDays] = useState<(typeof RANGE_OPTIONS)[number]>(30);
  const [showHeatmap, setShowHeatmap] = useState(false);

  const canView = canViewEngagement();
  const kpis = useMemo(() => getEngagementKpis(), []);
  const features = useMemo(() => getFeatureAdoption(), []);

  if (!canView) {
    return (
      <div className="p-6">
        <div className="rounded-lg border border-ink/10 bg-paper p-6 text-sm text-ink/70">
          You do not have permission to view engagement analytics.
        </div>
      </div>
    );
  }

  const top10 = features.slice(0, 10);
  const featureChart = top10.map((f) => ({ feature: f.feature, users: f.uniqueUsers }));

  return (
    <div className="space-y-6 p-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Engagement analytics</h1>
          <p className="mt-1 text-sm text-ink/60">
            How members use the platform day to day.
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
          Feature adoption
        </h2>
        <p className="mb-3 text-xs text-ink/60">
          Unique users per feature, top 10. Denominator: 312 active members in range.
        </p>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={featureChart} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis type="number" stroke="#6B7280" fontSize={12} />
              <YAxis type="category" dataKey="feature" stroke="#6B7280" fontSize={12} width={110} />
              <Tooltip formatter={(v) => Number(v ?? 0).toLocaleString()} />
              <Bar dataKey="users" fill="#2563EB" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="mt-2 text-xs text-ink/50">
          Text alternative: {featureChart.map((f) => `${f.feature} ${f.users}`).join("; ")}.
        </p>
      </section>

      <section className="rounded-lg border border-ink/10 bg-paper p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-ink/60">
            Engagement heatmap
          </h2>
          <button
            type="button"
            onClick={() => setShowHeatmap((s) => !s)}
            className="rounded-md border border-ink/20 px-3 py-1 text-xs text-ink/70 hover:bg-ink/5"
          >
            {showHeatmap ? "Hide" : "Show"}
          </button>
        </div>
        {showHeatmap ? (
          <>
            <p className="mb-3 text-xs text-ink/60">
              Active members by day of week and time of day. Lower to higher engagement.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full border-separate border-spacing-1 text-xs">
                <caption className="sr-only">Engagement heatmap by day and hour bucket</caption>
                <thead>
                  <tr>
                    <th scope="col" className="text-left text-ink/60">&nbsp;</th>
                    {HOUR_BUCKETS.map((h) => (
                      <th scope="col" key={h} className="text-ink/60 px-2 py-1">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {DAYS.map((d, i) => (
                    <tr key={d}>
                      <th scope="row" className="text-right pr-2 text-ink/60">{d}</th>
                      {HOUR_BUCKETS.map((h, j) => {
                        const v = heatmap[i][j];
                        return (
                          <td
                            key={h}
                            className={"h-8 w-12 rounded " + heatTone(v)}
                            aria-label={`${d} ${h}: ${v} active members`}
                          />
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-2 text-xs text-ink/50">
              Peak engagement: Thursday 16:00-20:00 with 28 active members.
            </p>
          </>
        ) : (
          <p className="text-sm text-ink/60">
            Heatmap is collapsed. Show it to see engagement by day and hour.
          </p>
        )}
      </section>

      <section className="rounded-lg border border-ink/10 bg-paper p-5">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink/60">
          Feature detail
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <caption className="sr-only">Feature adoption detail</caption>
            <thead className="bg-ink/5 text-left text-xs uppercase tracking-wide text-ink/60">
              <tr>
                <th scope="col" className="px-4 py-2">Feature</th>
                <th scope="col" className="px-4 py-2">Unique users</th>
                <th scope="col" className="px-4 py-2">Sessions</th>
                <th scope="col" className="px-4 py-2">Avg time (min)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/5">
              {features.map((f: FeatureAdoption) => (
                <tr key={f.feature} className="hover:bg-ink/5">
                  <td className="px-4 py-3 font-medium text-ink">{f.feature}</td>
                  <td className="px-4 py-3">{f.uniqueUsers}</td>
                  <td className="px-4 py-3">{f.sessions}</td>
                  <td className="px-4 py-3">{f.avgTimeOnFeature.toFixed(1)}</td>
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