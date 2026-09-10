"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import dynamic from "next/dynamic";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/button";
import {
  getChapterByCode,
  getChapterMembers,
  canViewChapters,
} from "@/lib/mock/chapters";
import { ArrowLeft, ShieldAlert, Download } from "lucide-react";

const GrowthChart = dynamic(
  () =>
    import("recharts").then((m) => {
      const { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } = m;
      return function Growth({
        data,
      }: {
        data: { week: string; count: number }[];
      }) {
        return (
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={data} margin={{ left: 8, right: 16, top: 8, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="week" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip formatter={(v) => [Number(v ?? 0), "Members"]} />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#2563EB"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        );
      };
    }),
  { ssr: false }
);

const CompletionChart = dynamic(
  () =>
    import("recharts").then((m) => {
      const { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } = m;
      const COLORS = ["#2563EB", "#7C3AED", "#D97706"];
      return function Completion({
        data,
      }: {
        data: { pillar: string; count: number }[];
      }) {
        return (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data} margin={{ left: 8, right: 16, top: 8, bottom: 8 }}>
              <XAxis dataKey="pillar" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip formatter={(v) => [Number(v ?? 0), "Completions"]} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {data.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        );
      };
    }),
  { ssr: false }
);

export default function ChapterPerformancePage() {
  const params = useParams<{ code: string }>();
  const code = params.code ? decodeURIComponent(params.code) : null;
  const chapter = useMemo(() => (code ? getChapterByCode(code) : null), [code]);

  const [from, setFrom] = useState(() => {
    const d = new Date();
    d.setMonth(0, 1);
    return d.toISOString().slice(0, 10);
  });
  const [to, setTo] = useState(() => new Date().toISOString().slice(0, 10));
  const [rangeError, setRangeError] = useState<string | null>(null);

  if (!chapter) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16">
        <Card className="p-8 text-center">
          <h1 className="font-display text-xl text-ink-900">Chapter not found</h1>
          <p className="mt-2 text-sm text-ink-500">
            The chapter does not exist, or you do not have permission to view it.
          </p>
          <div className="mt-6">
            <Link href="/admin/chapters">
              <Button variant="primary">Back to chapters</Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  if (!canViewChapters()) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16">
        <Card className="p-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-clay-50">
            <ShieldAlert className="h-6 w-6 text-clay-600" aria-hidden="true" />
          </div>
          <h1 className="mt-4 font-display text-xl text-ink-900">Permission denied</h1>
          <div className="mt-6">
            <Link href={`/admin/chapters/${encodeURIComponent(chapter.code)}`}>
              <Button variant="primary">Back to chapter</Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  const members = getChapterMembers(chapter.code);
  const activeMembers = members.filter((m) => m.status === "active");

  // Synthesise growth data from member joinedAt
  const growthData = useMemo(() => {
    const buckets: Record<string, number> = {};
    members.forEach((m) => {
      const d = new Date(m.joinedAt);
      const week = `W${getWeekNumber(d)}`;
      buckets[week] = (buckets[week] ?? 0) + 1;
    });
    const weeks = Object.keys(buckets).sort();
    let running = 0;
    return weeks.map((w) => {
      running += buckets[w];
      return { week: w, count: running };
    });
  }, [members]);

  // Synthesise completions by pillar
  const completionsData = useMemo(() => {
    const pillars = ["Marketplace", "Governance", "Technology"] as const;
    return pillars.map((p) => ({
      pillar: p,
      count: activeMembers.filter((m) => m.pillarInterest.includes(p)).length,
    }));
  }, [activeMembers]);

  const validateRange = (f: string, t: string) => {
    if (f > t) {
      setRangeError("From must be before To.");
      return;
    }
    const cap = new Date(f);
    cap.setMonth(cap.getMonth() + 12);
    if (new Date(t) > cap) {
      setRangeError("Range cannot exceed 12 months.");
      return;
    }
    if (new Date(t) > new Date()) {
      setRangeError("Range cannot extend into the future.");
      return;
    }
    setRangeError(null);
  };

  const engagementRate =
    members.length > 0 ? activeMembers.length / members.length : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            href={`/admin/chapters/${encodeURIComponent(chapter.code)}`}
            className="inline-flex items-center gap-1 text-sm text-ink-500 hover:text-ink-700"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to chapter
          </Link>
          <h1 className="mt-2 font-display text-2xl font-semibold tracking-tight text-ink-900">
            {chapter.name} · Performance
          </h1>
          <p className="mt-1 text-sm text-ink-500">
            Engagement, learning and growth for this chapter.
          </p>
        </div>
        <Button variant="outline" onClick={() => alert("Export coming soon.")}>
          <Download className="mr-2 h-4 w-4" aria-hidden="true" />
          Export CSV
        </Button>
      </div>

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

      {/* KPIs with denominators */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard
          label="Total members"
          value={members.length.toLocaleString()}
          denominator="all members"
        />
        <KpiCard
          label="Active members"
          value={activeMembers.length.toLocaleString()}
          denominator={`of ${members.length}`}
          tone="green"
        />
        <KpiCard
          label="Engagement rate"
          value={`${Math.round(engagementRate * 100)}%`}
          denominator="active / total"
          tone="sky"
        />
        <KpiCard
          label="Activity events"
          value="—"
          denominator="see activity tab"
        />
      </div>

      {/* Growth */}
      <Card className="p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-fg-muted">
          Membership growth
        </h2>
        <div className="mt-4">
          {growthData.length === 0 ? (
            <EmptyChart message="No membership data in the selected period." />
          ) : (
            <GrowthChart data={growthData} />
          )}
        </div>
      </Card>

      {/* Completions */}
      <Card className="p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-fg-muted">
          Members by pillar interest
        </h2>
        <div className="mt-4">
          {completionsData.length === 0 ? (
            <EmptyChart message="No pillar data." />
          ) : (
            <CompletionChart data={completionsData} />
          )}
        </div>
      </Card>
    </div>
  );
}

function getWeekNumber(d: Date): number {
  const target = new Date(d.valueOf());
  const dayNr = (d.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNr + 3);
  const firstThursday = target.valueOf();
  target.setMonth(0, 1);
  if (target.getDay() !== 4) {
    target.setMonth(0, 1 + ((4 - target.getDay() + 7) % 7));
  }
  return 1 + Math.ceil((firstThursday - target.valueOf()) / (7 * 24 * 3600 * 1000));
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
  tone?: "ink" | "green" | "sky";
}) {
  const valueClass =
    tone === "green"
      ? "text-green-700"
      : tone === "sky"
      ? "text-sky-700"
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