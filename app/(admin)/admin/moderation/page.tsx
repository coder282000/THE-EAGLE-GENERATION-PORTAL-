"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/button";
import {
  getReports,
  canViewModeration,
  isChapterLeaderScoped,
  REPORT_TYPE_LABELS,
  REPORT_PRIORITY_LABELS,
  REPORT_STATUS_LABELS,
  reportAgeHours,
  slaRemainingHours,
  isSlaBreached,
  type ReportPriority,
} from "@/lib/mock/moderation";

const PAGE_SIZE = 25;

const PRIORITY_TONE: Record<ReportPriority, string> = {
  CRITICAL: "bg-red-100 text-red-800 border-red-200",
  HIGH: "bg-clay/15 text-clay border-clay/30",
  MEDIUM: "bg-sky/10 text-sky border-sky/20",
  LOW: "bg-ink/5 text-ink/70 border-ink/10",
};

export default function ModerationQueuePage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [page, setPage] = useState(1);

  const canView = canViewModeration();
  const scoped = isChapterLeaderScoped();
  const all = useMemo(() => getReports(), []);

  const filtered = useMemo(() => {
    let r = all;
    if (statusFilter !== "all") r = r.filter((x) => x.status === statusFilter);
    if (priorityFilter !== "all") r = r.filter((x) => x.priority === priorityFilter);
    if (typeFilter !== "all") r = r.filter((x) => x.type === typeFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter(
        (x) =>
          x.reference.toLowerCase().includes(q) ||
          x.targetSummary.toLowerCase().includes(q) ||
          x.reportedByName.toLowerCase().includes(q) ||
          x.targetAuthorName.toLowerCase().includes(q)
      );
    }
    return r;
  }, [all, statusFilter, priorityFilter, typeFilter, search]);

  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  const stats = useMemo(() => {
    const open = all.filter((x) => x.status === "OPEN" || x.status === "IN_REVIEW");
    return {
      open: open.length,
      high: open.filter((x) => x.priority === "HIGH" || x.priority === "CRITICAL").length,
      breached: open.filter((x) => isSlaBreached(x.slaDeadlineAt)).length,
      resolved: all.filter((x) => x.status === "RESOLVED").length,
    };
  }, [all]);

  if (!canView) {
    return (
      <div className="p-6">
        <div className="rounded-lg border border-ink/10 bg-paper p-6 text-sm text-ink/70">
          You do not have permission to view the moderation queue.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Moderation queue</h1>
          <p className="mt-1 text-sm text-ink/60">
            Review reports, action content, and protect members.
          </p>
        </div>
      </header>

      {scoped && (
        <div className="rounded-lg border border-sky/30 bg-sky/5 p-3 text-sm text-ink">
          Showing reports for your chapter only.
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Kpi label="Open" value={stats.open} />
        <Kpi label="High / critical" value={stats.high} tone="clay" />
        <Kpi label="SLA breached" value={stats.breached} tone="danger" />
        <Kpi label="Resolved" value={stats.resolved} tone="success" />
      </div>

      <div className="rounded-lg border border-ink/10 bg-paper">
        <div className="flex flex-wrap gap-3 border-b border-ink/10 p-4">
          <input
            type="search"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search reference, target, reporter"
            className="flex-1 min-w-[200px] rounded-md border border-ink/20 bg-white px-3 py-2 text-sm"
            aria-label="Search reports"
          />
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="rounded-md border border-ink/20 bg-white px-3 py-2 text-sm"
            aria-label="Filter by status"
          >
            <option value="all">All statuses</option>
            {Object.entries(REPORT_STATUS_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
          <select
            value={priorityFilter}
            onChange={(e) => { setPriorityFilter(e.target.value); setPage(1); }}
            className="rounded-md border border-ink/20 bg-white px-3 py-2 text-sm"
            aria-label="Filter by priority"
          >
            <option value="all">All priorities</option>
            {Object.entries(REPORT_PRIORITY_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
          <select
            value={typeFilter}
            onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
            className="rounded-md border border-ink/20 bg-white px-3 py-2 text-sm"
            aria-label="Filter by type"
          >
            <option value="all">All types</option>
            {Object.entries(REPORT_TYPE_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>

        {paged.length === 0 ? (
          <div className="p-8 text-center text-sm text-ink/60">
            No reports found. Community is quiet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <caption className="sr-only">Moderation reports</caption>
              <thead className="bg-ink/5 text-left text-xs uppercase tracking-wide text-ink/60">
                <tr>
                  <th scope="col" className="px-4 py-2">Reference</th>
                  <th scope="col" className="px-4 py-2">Type</th>
                  <th scope="col" className="px-4 py-2">Target</th>
                  <th scope="col" className="px-4 py-2">Reported by</th>
                  <th scope="col" className="px-4 py-2">Priority</th>
                  <th scope="col" className="px-4 py-2">Age</th>
                  <th scope="col" className="px-4 py-2">SLA</th>
                  <th scope="col" className="px-4 py-2">Assignee</th>
                  <th scope="col" className="px-4 py-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/5">
                {paged.map((r) => {
                  const breached = isSlaBreached(r.slaDeadlineAt);
                  const slaH = slaRemainingHours(r.slaDeadlineAt);
                  const ageH = reportAgeHours(r.createdAt);
                  const closed = r.status === "RESOLVED" || r.status === "DISMISSED";
                  return (
                    <tr key={r.id} className="hover:bg-ink/5">
                      <td className="px-4 py-3">
                        <Link href={`/admin/moderation/${r.id}`} className="text-sky hover:underline">
                          {r.reference}
                        </Link>
                      </td>
                      <td className="px-4 py-3">{REPORT_TYPE_LABELS[r.type]}</td>
                      <td className="px-4 py-3 max-w-[320px] truncate" title={r.targetSummary}>
                        {r.targetSummary}
                      </td>
                      <td className="px-4 py-3">{r.reportedByName}</td>
                      <td className="px-4 py-3">
                        <span className={"inline-block rounded-full border px-2 py-0.5 text-xs " + PRIORITY_TONE[r.priority]}>
                          {REPORT_PRIORITY_LABELS[r.priority]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-ink/70">{ageH}h</td>
                      <td className={"px-4 py-3 " + (closed ? "text-ink/50" : breached ? "text-red-600" : slaH <= 4 ? "text-clay" : "text-ink/70")}>
                        {closed ? "-" : breached ? `${-slaH}h over` : `${slaH}h`}
                      </td>
                      <td className="px-4 py-3">{r.assignedTo ?? "-"}</td>
                      <td className="px-4 py-3">
                        <span className="rounded-full bg-ink/10 px-2 py-0.5 text-xs">
                          {REPORT_STATUS_LABELS[r.status]}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {filtered.length > PAGE_SIZE && (
          <div className="flex items-center justify-between border-t border-ink/10 p-4 text-sm">
            <span className="text-ink/60">
              Page {page} of {totalPages} ({filtered.length} reports)
            </span>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>
                Previous
              </Button>
              <Button variant="outline" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Kpi({ label, value, tone = "ink" }: { label: string; value: number; tone?: "ink" | "clay" | "danger" | "success" }) {
  const tones: Record<string, string> = {
    ink: "text-ink",
    clay: "text-clay",
    danger: "text-red-600",
    success: "text-green-700",
  };
  return (
    <div className="rounded-lg border border-ink/10 bg-paper p-4">
      <div className="text-xs uppercase tracking-wide text-ink/50">{label}</div>
      <div className={"mt-1 text-2xl font-semibold " + tones[tone]}>{value}</div>
    </div>
  );
}