"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/button";
import {
  canBuildCustomReport,
  formatMoney,
  formatPercent,
  type ReportDefinition,
} from "@/lib/mock/analytics";
import { getCurrentUser } from "@/lib/mock/current-user";

const ResponsiveContainer = dynamic(
  () => import("recharts").then((m) => m.ResponsiveContainer),
  { ssr: false }
);
const BarChart = dynamic(() => import("recharts").then((m) => m.BarChart), { ssr: false });
const Bar = dynamic(() => import("recharts").then((m) => m.Bar), { ssr: false });
const LineChart = dynamic(() => import("recharts").then((m) => m.LineChart), { ssr: false });
const Line = dynamic(() => import("recharts").then((m) => m.Line), { ssr: false });
const XAxis = dynamic(() => import("recharts").then((m) => m.XAxis), { ssr: false });
const YAxis = dynamic(() => import("recharts").then((m) => m.YAxis), { ssr: false });
const Tooltip = dynamic(() => import("recharts").then((m) => m.Tooltip), { ssr: false });
const CartesianGrid = dynamic(() => import("recharts").then((m) => m.CartesianGrid), { ssr: false });

type Tab = "builder" | "definitions" | "schedules";
type OutputFormat = "TABLE" | "BAR" | "LINE";

interface MetricOption {
  key: string;
  label: string;
  group: "MEMBERSHIP" | "LEARNING" | "ENGAGEMENT" | "FINANCIAL" | "CHAPTERS";
}

const METRIC_CATALOG: MetricOption[] = [
  { key: "members_onboarded", label: "Members onboarded", group: "MEMBERSHIP" },
  { key: "applications_received", label: "Applications received", group: "MEMBERSHIP" },
  { key: "conversion_rate", label: "Application conversion rate", group: "MEMBERSHIP" },
  { key: "retention_30d", label: "30-day retention", group: "MEMBERSHIP" },
  { key: "enrolment", label: "Course enrolment", group: "LEARNING" },
  { key: "completion_rate", label: "Course completion rate", group: "LEARNING" },
  { key: "drop_off", label: "Drop-off rate", group: "LEARNING" },
  { key: "dau", label: "Daily active users", group: "ENGAGEMENT" },
  { key: "wau", label: "Weekly active users", group: "ENGAGEMENT" },
  { key: "mau", label: "Monthly active users", group: "ENGAGEMENT" },
  { key: "stickiness", label: "Stickiness (DAU/MAU)", group: "ENGAGEMENT" },
  { key: "revenue", label: "Revenue processed", group: "FINANCIAL" },
  { key: "transactions", label: "Transaction count", group: "FINANCIAL" },
  { key: "recon_rate", label: "Reconciliation rate", group: "FINANCIAL" },
  { key: "chapter_members", label: "Chapter members", group: "CHAPTERS" },
  { key: "chapter_completion", label: "Chapter learning completion", group: "CHAPTERS" },
  { key: "chapter_attendance", label: "Chapter event attendance", group: "CHAPTERS" },
];

const DIMENSIONS = [
  { key: "chapter", label: "Chapter" },
  { key: "tier", label: "Tier" },
  { key: "month", label: "Month" },
  { key: "surface", label: "Surface" },
  { key: "cohort", label: "Cohort" },
  { key: "pillar", label: "Pillar" },
];

const FILTER_FIELDS = ["chapter", "tier", "pillar", "surface", "cohort"];
const FILTER_OPS = ["equals", "not equals", "in", "greater than", "less than"];

const seedDefinitions: ReportDefinition[] = [
  {
    id: "def-1",
    name: "Q3 Board Pack",
    description: "Members, chapters, and revenue for the board.",
    metrics: ["members_onboarded", "chapter_members", "revenue"],
    dimensions: ["month"],
    filters: [{ field: "tier", op: "in", value: "STUDENT,PROFESSIONAL,ASSOCIATE" }],
    from: "2026-07-01",
    to: "2026-09-30",
    format: "LINE",
    ownerId: "user-solomon",
    visibility: "ADMIN_ONLY",
    lastRunAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    lastRunStatus: "SUCCESS",
  },
  {
    id: "def-2",
    name: "Chapter engagement comparison",
    description: "Completion and attendance across chapters.",
    metrics: ["chapter_completion", "chapter_attendance"],
    dimensions: ["chapter"],
    filters: [],
    from: "2026-01-01",
    to: "2026-09-30",
    format: "BAR",
    ownerId: "user-solomon",
    visibility: "SHARED",
    lastRunAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    lastRunStatus: "SUCCESS",
  },
  {
    id: "def-3",
    name: "Funder quarterly pack",
    description: "Membership growth and completion rate.",
    metrics: ["members_onboarded", "completion_rate"],
    dimensions: ["month"],
    filters: [],
    from: "2026-04-01",
    to: "2026-06-30",
    format: "TABLE",
    ownerId: "user-solomon",
    visibility: "SHARED",
    schedule: {
      frequency: "MONTHLY",
      recipients: ["solomon@eaglegeneration.org"],
      format: "PDF",
    },
    lastRunAt: new Date(Date.now() - 25 * 86400000).toISOString(),
    lastRunStatus: "SUCCESS",
  },
];

export default function CustomReportBuilderPage() {
  const [tab, setTab] = useState<Tab>("builder");

  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(["members_onboarded"]);
  const [selectedDimensions, setSelectedDimensions] = useState<string[]>(["month"]);
  const [filters, setFilters] = useState<{ field: string; op: string; value: string }[]>([]);
  const [from, setFrom] = useState("2026-07-01");
  const [to, setTo] = useState("2026-09-30");
  const [limit, setLimit] = useState(10);
  const [format, setFormat] = useState<OutputFormat>("TABLE");

  const [definitions, setDefinitions] = useState<ReportDefinition[]>(seedDefinitions);
  const [saving, setSaving] = useState(false);

  const canBuild = canBuildCustomReport();
  const me = getCurrentUser();
  const isFinanceOnly = me.role === "FINANCE_OFFICER";
  const isChapterLeader = me.role === "CHAPTER_LEADER";

  const availableMetrics = useMemo(() => {
    let m = METRIC_CATALOG;
    if (isFinanceOnly) m = m.filter((x) => x.group === "FINANCIAL");
    if (isChapterLeader) m = m.filter((x) => x.group === "CHAPTERS");
    return m;
  }, [isFinanceOnly, isChapterLeader]);

  const toggleMetric = (key: string) => {
    setSelectedMetrics((prev) =>
      prev.includes(key) ? prev.filter((x) => x !== key) : [...prev, key]
    );
  };

  const toggleDimension = (key: string) => {
    setSelectedDimensions((prev) =>
      prev.includes(key) ? prev.filter((x) => x !== key) : [...prev, key]
    );
  };

  const addFilter = () => {
    setFilters((prev) => [...prev, { field: "chapter", op: "equals", value: "" }]);
  };

  const removeFilter = (idx: number) => {
    setFilters((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateFilter = (idx: number, key: "field" | "op" | "value", v: string) => {
    setFilters((prev) => prev.map((f, i) => (i === idx ? { ...f, [key]: v } : f)));
  };

  if (!canBuild) {
    return (
      <div className="p-6">
        <div className="rounded-lg border border-ink/10 bg-paper p-6 text-sm text-ink/70">
          You do not have permission to build custom reports.
        </div>
      </div>
    );
  }

  const previewRows = useMemo(() => {
    // Deterministic mock output derived from selections
    const dims = selectedDimensions.length > 0 ? selectedDimensions : ["_all"];
    const rows = dims.flatMap((d, i) => [
      { dimension: `${d}-A`, v1: 100 + i * 12, v2: 0.62 + i * 0.02 },
      { dimension: `${d}-B`, v1: 80 + i * 8, v2: 0.58 + i * 0.01 },
      { dimension: `${d}-C`, v1: 60 + i * 4, v2: 0.55 + i * 0.02 },
    ]);
    return rows.slice(0, limit);
  }, [selectedDimensions, limit]);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      const newDef: ReportDefinition = {
        id: `def-${definitions.length + 1}`,
        name: "Untitled report",
        description: "",
        metrics: selectedMetrics,
        dimensions: selectedDimensions,
        filters,
        from,
        to,
        format,
        ownerId: me.id,
        visibility: "PRIVATE",
      };
      setDefinitions([newDef, ...definitions]);
      setSaving(false);
    }, 600);
  };

  const metricLabel = (key: string) =>
    METRIC_CATALOG.find((m) => m.key === key)?.label ?? key;

  return (
    <div className="space-y-6 p-6">
      <header>
        <h1 className="text-2xl font-semibold text-ink">Custom reports</h1>
        <p className="mt-1 text-sm text-ink/60">
          Build, save, and schedule reports from the platform's metrics.
        </p>
      </header>

      {isFinanceOnly && (
        <div role="note" className="rounded-lg border border-sky/30 bg-sky/5 p-3 text-sm text-ink">
          You see financial metrics only. Member and learning metrics are hidden for your role.
        </div>
      )}
      {isChapterLeader && (
        <div role="note" className="rounded-lg border border-sky/30 bg-sky/5 p-3 text-sm text-ink">
          You see chapter-scoped metrics only, for your own chapter.
        </div>
      )}

      <div role="tablist" className="flex border-b border-ink/10">
        <TabBtn active={tab === "builder"} onClick={() => setTab("builder")}>Builder</TabBtn>
        <TabBtn active={tab === "definitions"} onClick={() => setTab("definitions")}>
          Saved definitions ({definitions.length})
        </TabBtn>
        <TabBtn active={tab === "schedules"} onClick={() => setTab("schedules")}>
          Scheduled deliveries ({definitions.filter((d) => d.schedule).length})
        </TabBtn>
      </div>

      {tab === "builder" && (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <section className="rounded-lg border border-ink/10 bg-paper p-5">
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink/60">
                Metrics
              </h2>
              <p className="mb-3 text-xs text-ink/60">
                Select one or more. Only metrics your role can see are shown.
              </p>
              <div className="flex flex-wrap gap-2">
                {availableMetrics.map((m) => {
                  const active = selectedMetrics.includes(m.key);
                  return (
                    <button
                      key={m.key}
                      type="button"
                      onClick={() => toggleMetric(m.key)}
                      className={
                        "rounded-full border px-3 py-1 text-xs " +
                        (active
                          ? "border-sky bg-sky/10 text-sky"
                          : "border-ink/20 text-ink/70 hover:bg-ink/5")
                      }
                    >
                      {m.label}
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="rounded-lg border border-ink/10 bg-paper p-5">
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink/60">
                Group by
              </h2>
              <div className="flex flex-wrap gap-2">
                {DIMENSIONS.map((d) => {
                  const active = selectedDimensions.includes(d.key);
                  return (
                    <button
                      key={d.key}
                      type="button"
                      onClick={() => toggleDimension(d.key)}
                      className={
                        "rounded-full border px-3 py-1 text-xs " +
                        (active
                          ? "border-sky bg-sky/10 text-sky"
                          : "border-ink/20 text-ink/70 hover:bg-ink/5")
                      }
                    >
                      {d.label}
                    </button>
                  );
                })}
              </div>
              <p className="mt-2 text-xs text-ink/50">
                Select at least one dimension for grouped output, or none for a single aggregate.
              </p>
            </section>

            <section className="rounded-lg border border-ink/10 bg-paper p-5">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-ink/60">Filters</h2>
                <Button variant="outline" onClick={addFilter}>Add filter</Button>
              </div>
              {filters.length === 0 ? (
                <p className="text-sm text-ink/60">No filters applied.</p>
              ) : (
                <ul className="space-y-2">
                  {filters.map((f, idx) => (
                    <li key={idx} className="flex flex-wrap items-center gap-2">
                      <select
                        value={f.field}
                        onChange={(e) => updateFilter(idx, "field", e.target.value)}
                        className="rounded-md border border-ink/20 bg-white px-2 py-1 text-xs"
                        aria-label={`Filter ${idx + 1} field`}
                      >
                        {FILTER_FIELDS.map((x) => <option key={x} value={x}>{x}</option>)}
                      </select>
                      <select
                        value={f.op}
                        onChange={(e) => updateFilter(idx, "op", e.target.value)}
                        className="rounded-md border border-ink/20 bg-white px-2 py-1 text-xs"
                        aria-label={`Filter ${idx + 1} operator`}
                      >
                        {FILTER_OPS.map((x) => <option key={x} value={x}>{x}</option>)}
                      </select>
                      <input
                        value={f.value}
                        onChange={(e) => updateFilter(idx, "value", e.target.value)}
                        placeholder="value"
                        className="flex-1 min-w-[120px] rounded-md border border-ink/20 bg-white px-2 py-1 text-xs"
                        aria-label={`Filter ${idx + 1} value`}
                      />
                      <button
                        type="button"
                        onClick={() => removeFilter(idx)}
                        className="rounded border border-ink/20 px-2 py-1 text-xs hover:bg-ink/5"
                        aria-label={`Remove filter ${idx + 1}`}
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="rounded-lg border border-ink/10 bg-paper p-5">
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink/60">
                Period and limit
              </h2>
              <div className="grid gap-3 sm:grid-cols-3">
                <label className="block">
                  <span className="mb-1 block text-xs uppercase tracking-wide text-ink/60">From</span>
                  <input
                    type="date"
                    value={from}
                    onChange={(e) => setFrom(e.target.value)}
                    className="w-full rounded-md border border-ink/20 bg-white px-3 py-2 text-sm"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs uppercase tracking-wide text-ink/60">To</span>
                  <input
                    type="date"
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    className="w-full rounded-md border border-ink/20 bg-white px-3 py-2 text-sm"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs uppercase tracking-wide text-ink/60">Top N (1-100)</span>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={limit}
                    onChange={(e) => setLimit(Math.max(1, Math.min(100, Number(e.target.value) || 1)))}
                    className="w-full rounded-md border border-ink/20 bg-white px-3 py-2 text-sm"
                  />
                </label>
              </div>
            </section>
          </div>

          <div className="space-y-6">
            <section className="rounded-lg border border-ink/10 bg-paper p-5">
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink/60">Output</h2>
              <div className="flex flex-wrap gap-2">
                {(["TABLE", "BAR", "LINE"] as OutputFormat[]).map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setFormat(f)}
                    className={
                      "rounded-md border px-3 py-1 text-xs " +
                      (format === f
                        ? "border-sky bg-sky/10 text-sky"
                        : "border-ink/20 text-ink/70 hover:bg-ink/5")
                    }
                  >
                    {f === "TABLE" ? "Table" : f === "BAR" ? "Bar chart" : "Line chart"}
                  </button>
                ))}
              </div>
              <div className="mt-5 flex flex-col gap-2">
                <Button variant="primary" disabled={saving} onClick={handleSave}>
                  {saving ? "Saving..." : "Save definition"}
                </Button>
                <Button variant="outline" onClick={() => { /* run now */ }}>
                  Run now
                </Button>
              </div>
              <p className="mt-2 text-xs text-ink/50">
                Every run and scheduled delivery is audited.
              </p>
            </section>

            <section className="rounded-lg border border-ink/10 bg-paper p-5">
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink/60">Preview</h2>
              {selectedMetrics.length === 0 ? (
                <p className="text-sm text-ink/60">Add a metric to see a preview.</p>
              ) : format === "TABLE" ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <caption className="sr-only">Preview</caption>
                    <thead className="bg-ink/5 text-left text-xs uppercase tracking-wide text-ink/60">
                      <tr>
                        <th scope="col" className="px-3 py-2">Group</th>
                        {selectedMetrics.map((m) => (
                          <th key={m} scope="col" className="px-3 py-2">{metricLabel(m)}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-ink/5">
                      {previewRows.map((r, i) => (
                        <tr key={i}>
                          <td className="px-3 py-2 text-ink/70">{r.dimension}</td>
                          {selectedMetrics.map((m) => (
                            <td key={m} className="px-3 py-2">{r.v1}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : format === "BAR" ? (
                <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={previewRows}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis dataKey="dimension" stroke="#6B7280" fontSize={11} />
                      <YAxis stroke="#6B7280" fontSize={11} />
                      <Tooltip />
                      <Bar dataKey="v1" fill="#2563EB" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={previewRows}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis dataKey="dimension" stroke="#6B7280" fontSize={11} />
                      <YAxis stroke="#6B7280" fontSize={11} />
                      <Tooltip />
                      <Line type="monotone" dataKey="v1" stroke="#2563EB" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </section>
          </div>
        </div>
      )}

      {tab === "definitions" && (
        <section className="rounded-lg border border-ink/10 bg-paper">
          {definitions.length === 0 ? (
            <div className="p-8 text-center text-sm text-ink/60">
              No saved reports yet. Build one above.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <caption className="sr-only">Saved report definitions</caption>
                <thead className="bg-ink/5 text-left text-xs uppercase tracking-wide text-ink/60">
                  <tr>
                    <th scope="col" className="px-4 py-2">Name</th>
                    <th scope="col" className="px-4 py-2">Format</th>
                    <th scope="col" className="px-4 py-2">Visibility</th>
                    <th scope="col" className="px-4 py-2">Last run</th>
                    <th scope="col" className="px-4 py-2">Status</th>
                    <th scope="col" className="px-4 py-2"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink/5">
                  {definitions.map((d) => (
                    <tr key={d.id} className="hover:bg-ink/5">
                      <td className="px-4 py-3">
                        <div className="font-medium text-ink">{d.name}</div>
                        {d.description && (
                          <div className="text-xs text-ink/60">{d.description}</div>
                        )}
                      </td>
                      <td className="px-4 py-3">{d.format}</td>
                      <td className="px-4 py-3 text-ink/70">{d.visibility}</td>
                      <td className="px-4 py-3 text-ink/70">
                        {d.lastRunAt ? new Date(d.lastRunAt).toLocaleDateString("en-GB") : "—"}
                      </td>
                      <td className="px-4 py-3">
                        {d.lastRunStatus ? (
                          <span className={d.lastRunStatus === "SUCCESS" ? "text-green-700" : "text-red-600"}>
                            {d.lastRunStatus}
                          </span>
                        ) : (
                          <span className="text-ink/50">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <Button variant="outline" onClick={() => { /* run */ }}>Run</Button>
                          <Button variant="outline" onClick={() => { /* duplicate */ }}>Duplicate</Button>
                          <Button
                            variant="destructive"
                            onClick={() => setDefinitions(definitions.filter((x) => x.id !== d.id))}
                          >
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {tab === "schedules" && (
        <section className="rounded-lg border border-ink/10 bg-paper">
          {definitions.filter((d) => d.schedule).length === 0 ? (
            <div className="p-8 text-center text-sm text-ink/60">
              No scheduled deliveries yet.
            </div>
          ) : (
            <ul className="divide-y divide-ink/5">
              {definitions
                .filter((d) => d.schedule)
                .map((d) => (
                  <li key={d.id} className="flex flex-wrap items-center justify-between gap-3 p-4 hover:bg-ink/5">
                    <div>
                      <div className="font-medium text-ink">{d.name}</div>
                      <div className="mt-1 text-xs text-ink/60">
                        {d.schedule?.frequency} / {d.schedule?.format} / recipients:{" "}
                        {d.schedule?.recipients.join(", ")}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => { /* pause */ }}>Pause</Button>
                      <Button variant="destructive" onClick={() => { /* delete */ }}>Delete</Button>
                    </div>
                  </li>
                ))}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}

function TabBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={
        "border-b-2 px-4 py-2 text-sm " +
        (active ? "border-sky text-sky" : "border-transparent text-ink/60 hover:text-ink")
      }
    >
      {children}
    </button>
  );
}