"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import {
  getChapterLeague,
  canViewChapters,
  formatPercent,
  type ChapterRow,
} from "@/lib/mock/analytics";
import { getCurrentUser } from "@/lib/mock/current-user";

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

const RANGE_OPTIONS = [30, 90, 365] as const;

const TYPE_LABELS: Record<string, string> = {
  CAMPUS: "Campus",
  PROFESSIONAL: "Professional",
  REGIONAL: "Regional",
};

export default function ChapterPerformancePage() {
  const [rangeDays, setRangeDays] = useState<(typeof RANGE_OPTIONS)[number]>(90);
  const [typeFilter, setTypeFilter] = useState("all");
  const [regionFilter, setRegionFilter] = useState("all");

  const canView = canViewChapters();
  const me = getCurrentUser();
  const isChapterLeader = me.role === "CHAPTER_LEADER";
  const all = useMemo(() => getChapterLeague(), []);

  const regions = useMemo(() => Array.from(new Set(all.map((c) => c.region))), [all]);

  const filtered = useMemo(() => {
    let r = all;
    if (typeFilter !== "all") r = r.filter((c) => c.type === typeFilter);
    if (regionFilter !== "all") r = r.filter((c) => c.region === regionFilter);
    return r;
  }, [all, typeFilter, regionFilter]);

  if (!canView) {
    return (
      <div className="p-6">
        <div className="rounded-lg border border-ink/10 bg-paper p-6 text-sm text-ink/70">
          You do not have permission to view chapter performance.
        </div>
      </div>
    );
  }

  // Chapter leader: own-chapter focus view
  if (isChapterLeader) {
    const own = all[0] ?? null;
    if (!own) {
      return (
        <div className="p-6">
          <div className="rounded-lg border border-ink/10 bg-paper p-6 text-sm text-ink/70">
            Your chapter has no activity in this period yet.
          </div>
        </div>
      );
    }
    return (
      <div className="space-y-6 p-6">
        <div role="note" className="rounded-lg border border-sky/30 bg-sky/5 p-3 text-sm text-ink">
          You are seeing your own chapter only. Contact an administrator for cross-chapter comparisons.
        </div>
        <header>
          <h1 className="text-2xl font-semibold text-ink">{own.name}</h1>
          <p className="mt-1 text-sm text-ink/60">
            {TYPE_LABELS[own.type]} chapter in {own.region}.
          </p>
        </header>
        <section className="grid grid-cols-2 gap-4 lg:grid-cols-5">
          <Mini label="Members" value={own.members} />
          <Mini label="Growth (30d)" value={`+${own.growth30d}`} />
          <Mini label="Retention" value={formatPercent(own.retention)} />
          <Mini label="Learning completion" value={formatPercent(own.completion)} />
          <Mini label="Event attendance" value={formatPercent(own.attendance)} />
        </section>
        <section className="rounded-lg border border-ink/10 bg-paper p-5">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink/60">
            Engagement score
          </h2>
          <div className="text-3xl font-semibold text-ink">{own.engagementScore}</div>
          <p className="mt-1 text-xs text-ink/50">
            Composite score across attendance, learning completion, retention, and activity.
          </p>
        </section>
      </div>
    );
  }

  const top10 = [...filtered]
    .filter((c) => !c.insufficientData)
    .sort((a, b) => b.completion - a.completion)
    .slice(0, 10);

  const completionChart = top10.map((c) => ({
    chapter: c.code,
    completion: Math.round(c.completion * 100),
  }));

  const scatterData = filtered
    .filter((c) => !c.insufficientData)
    .map((c) => ({ x: c.members, y: c.engagementScore, chapter: c.code }));

  return (
    <div className="space-y-6 p-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Chapter performance</h1>
          <p className="mt-1 text-sm text-ink/60">
            How each chapter is doing against the same measures.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="rounded-md border border-ink/20 bg-white px-3 py-1 text-xs"
            aria-label="Filter by chapter type"
          >
            <option value="all">All types</option>
            {Object.entries(TYPE_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
          <select
            value={regionFilter}
            onChange={(e) => setRegionFilter(e.target.value)}
            className="rounded-md border border-ink/20 bg-white px-3 py-1 text-xs"
            aria-label="Filter by region"
          >
            <option value="all">All regions</option>
            {regions.map((r) => <option key={r} value={r}>{r}</option>)}
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
              {d}d
            </button>
          ))}
        </div>
      </header>

      <section className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <Mini label="Active chapters" value={all.length} />
        <Mini
          label="Avg members"
          value={Math.round(
            all.filter((c) => !c.insufficientData).reduce((s, c) => s + c.members, 0) /
              Math.max(1, all.filter((c) => !c.insufficientData).length)
          )}
        />
        <Mini
          label="Median retention"
          value={formatPercent(
            all.filter((c) => !c.insufficientData).map((c) => c.retention).sort()[Math.floor(all.filter((c) => !c.insufficientData).length / 2)] ?? 0
          )}
        />
        <Mini
          label="Median completion"
          value={formatPercent(
            all.filter((c) => !c.insufficientData).map((c) => c.completion).sort()[Math.floor(all.filter((c) => !c.insufficientData).length / 2)] ?? 0
          )}
        />
        <Mini
          label="Median attendance"
          value={formatPercent(
            all.filter((c) => !c.insufficientData).map((c) => c.attendance).sort()[Math.floor(all.filter((c) => !c.insufficientData).length / 2)] ?? 0
          )}
        />
      </section>

      <section className="rounded-lg border border-ink/10 bg-paper p-5">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink/60">
          Learning completion by chapter (top 10)
        </h2>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={completionChart} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis type="number" domain={[0, 100]} stroke="#6B7280" fontSize={12} />
              <YAxis type="category" dataKey="chapter" stroke="#6B7280" fontSize={12} width={90} />
              <Tooltip formatter={(v) => `${Number(v ?? 0)}%`} />
              <Bar dataKey="completion" fill="#2563EB" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="mt-2 text-xs text-ink/50">
          Text alternative: {completionChart.map((c) => `${c.chapter} ${c.completion}%`).join("; ")}.
        </p>
      </section>

      <section className="rounded-lg border border-ink/10 bg-paper p-5">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink/60">
          Chapter performance (members vs engagement)
        </h2>
        <p className="mb-3 text-xs text-ink/60">
          Each point is a chapter. Chapters with fewer than 5 members are excluded.
        </p>
        <ul className="space-y-2 text-xs">
          {scatterData.map((p) => (
            <li key={p.chapter} className="flex items-center justify-between border-b border-ink/5 pb-1">
              <span className="font-medium text-ink">{p.chapter}</span>
              <span className="text-ink/60">{p.x} members</span>
              <span className="text-ink/60">score {p.y}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-lg border border-ink/10 bg-paper p-5">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink/60">
          League table
        </h2>
        <p className="mb-3 text-xs text-ink/60">
          Chapters with fewer than 5 members are marked insufficient data and excluded from medians.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <caption className="sr-only">Chapter league table</caption>
            <thead className="bg-ink/5 text-left text-xs uppercase tracking-wide text-ink/60">
              <tr>
                <th scope="col" className="px-3 py-2">Chapter</th>
                <th scope="col" className="px-3 py-2">Region</th>
                <th scope="col" className="px-3 py-2">Type</th>
                <th scope="col" className="px-3 py-2">Members</th>
                <th scope="col" className="px-3 py-2">Growth 30d</th>
                <th scope="col" className="px-3 py-2">Retention</th>
                <th scope="col" className="px-3 py-2">Completion</th>
                <th scope="col" className="px-3 py-2">Attendance</th>
                <th scope="col" className="px-3 py-2">Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/5">
              {filtered.map((c: ChapterRow) => (
                <tr key={c.code} className="hover:bg-ink/5">
                  <td className="px-3 py-3 font-medium text-ink">{c.name}</td>
                  <td className="px-3 py-3 text-ink/70">{c.region}</td>
                  <td className="px-3 py-3 text-ink/70">{TYPE_LABELS[c.type]}</td>
                  <td className="px-3 py-3">{c.members}</td>
                  <td className="px-3 py-3">+{c.growth30d}</td>
                  <td className="px-3 py-3">
                    {c.insufficientData ? <span className="text-ink/50">—</span> : formatPercent(c.retention)}
                  </td>
                  <td className="px-3 py-3">
                    {c.insufficientData ? <span className="text-ink/50">—</span> : formatPercent(c.completion)}
                  </td>
                  <td className="px-3 py-3">
                    {c.insufficientData ? <span className="text-ink/50">—</span> : formatPercent(c.attendance)}
                  </td>
                  <td className="px-3 py-3">
                    {c.insufficientData ? (
                      <span className="text-ink/50">Insufficient data</span>
                    ) : (
                      c.engagementScore
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

function Mini({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-ink/10 bg-paper p-4">
      <div className="text-xs uppercase tracking-wide text-ink/50">{label}</div>
      <div className="mt-1 text-2xl font-semibold text-ink">{value}</div>
    </div>
  );
}