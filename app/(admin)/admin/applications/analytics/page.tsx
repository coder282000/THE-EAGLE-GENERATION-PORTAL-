"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/button";
import {
  getApplicationAnalytics,
  canViewApplicationAnalytics,
  canExportApplications,
} from "@/lib/mock/applications";
import { ArrowLeft, ShieldAlert, Download } from "lucide-react";

// Lazy-load Recharts — D3.6 spec §6
const FunnelChart = dynamic(() => import("recharts").then((m) => {
  const { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } = m;
  return function Funnel({
    data,
  }: {
    data: { label: string; count: number }[];
  }) {
    const colors = ["#2563EB", "#4A6FA5", "#7C3AED", "#16A34A"];
    return (
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data} layout="vertical" margin={{ left: 8, right: 24, top: 8, bottom: 8 }}>
          <XAxis type="number" hide />
          <YAxis dataKey="label" type="category" width={110} tick={{ fontSize: 12 }} />
          <Tooltip formatter={(v) => [Number(v ?? 0).toLocaleString(), "Applications"]} />
          <Bar dataKey="count" radius={[0, 4, 4, 0]}>
            {data.map((_, i) => (
              <Cell key={i} fill={colors[i % colors.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    );
  };
}), { ssr: false });

const SourceChart = dynamic(() => import("recharts").then((m) => {
  const { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } = m;
  return function Source({
    data,
  }: {
    data: { source: string; count: number }[];
  }) {
    return (
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data} layout="vertical" margin={{ left: 8, right: 24, top: 8, bottom: 8 }}>
          <XAxis type="number" hide />
          <YAxis dataKey="source" type="category" width={120} tick={{ fontSize: 12 }} />
          <Tooltip formatter={(v) => [Number(v ?? 0).toLocaleString(), "Applications"]} />
          <Bar dataKey="count" fill="#4A6FA5" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    );
  };
}), { ssr: false });

const TierChart = dynamic(() => import("recharts").then((m) => {
  const { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } = m;
  const COLORS = ["#2563EB", "#7C3AED", "#D97706"];
  const TIER_LABEL: Record<string, string> = {
    STUDENT: "Student",
    PROFESSIONAL: "Professional",
    ASSOCIATE: "Associate",
  };
  return function Tiers({
    data,
  }: {
    data: { tier: string; count: number }[];
  }) {
    const mapped = data.map((d) => ({ ...d, name: TIER_LABEL[d.tier] ?? d.tier }));
    return (
      <ResponsiveContainer width="100%" height={240}>
        <PieChart>
          <Pie data={mapped} dataKey="count" nameKey="name" outerRadius={80} label>
            {mapped.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(v) => Number(v ?? 0).toLocaleString()} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    );
  };
}), { ssr: false });

export default function ApplicationAnalyticsPage() {
  const canView = canViewApplicationAnalytics();
  const canExport = canExportApplications();

  const [from, setFrom] = useState(() => {
    const d = new Date();
    d.setMonth(0, 1);
    return d.toISOString().slice(0, 10);
  });
  const [to, setTo] = useState(() => new Date().toISOString().slice(0, 10));
  const [rangeError, setRangeError] = useState<string | null>(null);

  const analytics = useMemo(() => getApplicationAnalytics(), []);

  if (!canView) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16">
        <Card className="p-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-clay-50">
            <ShieldAlert className="h-6 w-6 text-clay-600" aria-hidden="true" />
          </div>
          <h1 className="mt-4 font-display text-xl text-ink-900">Permission denied</h1>
          <p className="mt-2 text-sm text-ink-500">
            You do not have permission to view application analytics.
          </p>
          <div className="mt-6">
            <Link href="/admin/dashboard">
              <Button variant="primary">Back to dashboard</Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  const validateRange = (nextFrom: string, nextTo: string) => {
    if (nextFrom > nextTo) {
      setRangeError("From must be before To.");
      return false;
    }
    const sixMonths = new Date(nextFrom);
    sixMonths.setMonth(sixMonths.getMonth() + 12);
    if (new Date(nextTo) > sixMonths) {
      setRangeError("Range cannot exceed 12 months.");
      return false;
    }
    if (new Date(nextTo) > new Date()) {
      setRangeError("Range cannot extend into the future.");
      return false;
    }
    setRangeError(null);
    return true;
  };

  const pct = (n: number) => `${Math.round(n * 100)}%`;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            href="/admin/applications"
            className="inline-flex items-center gap-1 text-sm text-ink-500 hover:text-ink-700"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Applications
          </Link>
          <h1 className="mt-2 font-display text-2xl font-semibold tracking-tight text-ink-900">
            Application analytics
          </h1>
          <p className="mt-1 text-sm text-ink-500">
            Conversion, time-to-decision, and source distribution.
          </p>
        </div>
        {canExport && (
          <Button variant="outline" onClick={() => alert("Export coming soon.")}>
            <Download className="mr-2 h-4 w-4" aria-hidden="true" />
            Export CSV
          </Button>
        )}
      </div>

      {/* Date range */}
      <Card className="p-4">
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label htmlFor="from" className="block text-xs font-medium text-ink-600">
              From
            </label>
            <input
              id="from"
              type="date"
              value={from}
              onChange={(e) => {
                setFrom(e.target.value);
                validateRange(e.target.value, to);
              }}
              className="mt-1 rounded-md border border-ink-200 bg-white px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/30"
            />
          </div>
          <div>
            <label htmlFor="to" className="block text-xs font-medium text-ink-600">
              To
            </label>
            <input
              id="to"
              type="date"
              value={to}
              onChange={(e) => {
                setTo(e.target.value);
                validateRange(from, e.target.value);
              }}
              className="mt-1 rounded-md border border-ink-200 bg-white px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/30"
            />
          </div>
          {rangeError && (
            <p role="alert" className="text-xs text-red-600">
              {rangeError}
            </p>
          )}
        </div>
      </Card>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard
          label="Total applications"
          value={analytics.total.toLocaleString()}
          denominator="all non-draft"
        />
        <KpiCard
          label="Conversion rate"
          value={pct(analytics.conversionRate)}
          denominator="of submitted"
          tone="green"
        />
        <KpiCard
          label="Avg time-to-decision"
          value={`${analytics.avgTimeToDecisionDays.toFixed(1)}d`}
          denominator="of decided"
        />
        <KpiCard
          label="Rejection rate"
          value={pct(analytics.rejectionRate)}
          denominator="of submitted"
          tone="clay"
        />
      </div>

      {/* Funnel */}
      <Card className="p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-fg-muted">
          Conversion funnel
        </h2>
        <div className="mt-4">
          {analytics.funnel.length === 0 ? (
            <EmptyChart message="No applications in the selected period." />
          ) : (
            <FunnelChart data={analytics.funnel.map((f) => ({ label: f.label, count: f.count }))} />
          )}
        </div>
      </Card>

      {/* Source + Tier */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-fg-muted">
            By source
          </h2>
          <div className="mt-4">
            {analytics.bySource.length === 0 ? (
              <EmptyChart message="No source data." />
            ) : (
              <SourceChart data={analytics.bySource} />
            )}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-fg-muted">
            By tier
          </h2>
          <div className="mt-4">
            {analytics.byTier.length === 0 ? (
              <EmptyChart message="No tier data." />
            ) : (
              <TierChart data={analytics.byTier} />
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

function KpiCard({
  label,
  value,
  denominator,
  tone = "ink",
}: {
  label: string;
  value: string;
  denominator: string;
  tone?: "ink" | "green" | "clay";
}) {
  const valueClass =
    tone === "green"
      ? "text-green-700"
      : tone === "clay"
      ? "text-clay-700"
      : "text-ink-900";
  return (
    <Card className="p-4">
      <p className="text-xs font-medium uppercase tracking-wider text-ink-500">
        {label}
      </p>
      <p className={`mt-2 text-2xl font-semibold ${valueClass}`}>{value}</p>
      <p className="mt-1 text-xs text-ink-400">{denominator}</p>
    </Card>
  );
}

function EmptyChart({ message }: { message: string }) {
  return (
    <div className="flex h-60 items-center justify-center rounded-md border border-dashed border-ink-200 text-sm text-ink-400">
      {message}
    </div>
  );
}