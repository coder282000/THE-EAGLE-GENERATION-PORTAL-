"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  getSafeguardingCases,
  canViewSafeguarding,
  SAFEGUARDING_SEVERITY_LABELS,
  SAFEGUARDING_STATUS_LABELS,
  type SafeguardingCase,
  type SafeguardingSeverity,
} from "@/lib/mock/moderation";
import { getCurrentUser } from "@/lib/mock/current-user";

const SEVERITY_TONE: Record<SafeguardingSeverity, string> = {
  CRITICAL: "bg-red-100 text-red-800 border-red-200",
  HIGH: "bg-clay/15 text-clay border-clay/30",
  MEDIUM: "bg-sky/10 text-sky border-sky/20",
  LOW: "bg-ink/5 text-ink/70 border-ink/10",
};

export default function SafeguardingListPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [severityFilter, setSeverityFilter] = useState("all");

  const canView = canViewSafeguarding();
  const me = getCurrentUser();
  const privileged = me.role === "SUPER_ADMIN" || me.role === "COMPLIANCE_LEAD";
  const all = useMemo(() => getSafeguardingCases(), []);

  const filtered = useMemo(() => {
    let r = all;
    if (statusFilter !== "all") r = r.filter((c) => c.status === statusFilter);
    if (severityFilter !== "all") r = r.filter((c) => c.severity === severityFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter(
        (c) =>
          c.reference.toLowerCase().includes(q) ||
          c.subjectName.toLowerCase().includes(q) ||
          (c.reporterName ?? "").toLowerCase().includes(q)
      );
    }
    return r;
  }, [all, search, statusFilter, severityFilter]);

  if (!canView) {
    return (
      <div className="p-6">
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-sm text-red-900">
          Access denied. Safeguarding cases are restricted to assigned handlers, SUPER_ADMIN, and COMPLIANCE_LEAD.
        </div>
      </div>
    );
  }

  const stats = {
    open: all.filter((c) => c.status === "OPEN").length,
    investigating: all.filter((c) => c.status === "INVESTIGATING").length,
    awaiting: all.filter((c) => c.status === "AWAITING_AUTHORITY").length,
    closed: all.filter((c) => c.status === "CLOSED").length,
  };

  return (
    <div className="space-y-6 p-6">
      <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-900">
        <strong>Restricted case board.</strong> Every view and action is logged. Do not share case details outside the assigned handler team.
      </div>

      <header>
        <h1 className="text-2xl font-semibold text-ink">Safeguarding cases</h1>
        <p className="mt-1 text-sm text-ink/60">
          Restricted handling for member safety.
          {!privileged && " You see only cases assigned to you."}
        </p>
      </header>

      {privileged && (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Kpi label="Open" value={stats.open} tone={stats.open > 0 ? "danger" : "ink"} />
          <Kpi label="Investigating" value={stats.investigating} tone="clay" />
          <Kpi label="Awaiting authority" value={stats.awaiting} />
          <Kpi label="Closed" value={stats.closed} tone="success" />
        </div>
      )}

      <div className="rounded-lg border border-ink/10 bg-paper">
        {privileged && (
          <div className="flex flex-wrap gap-3 border-b border-ink/10 p-4">
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search reference, subject, reporter"
              className="flex-1 min-w-[200px] rounded-md border border-ink/20 bg-white px-3 py-2 text-sm"
              aria-label="Search cases"
            />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-md border border-ink/20 bg-white px-3 py-2 text-sm" aria-label="Filter by status">
              <option value="all">All statuses</option>
              {Object.entries(SAFEGUARDING_STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
            <select value={severityFilter} onChange={(e) => setSeverityFilter(e.target.value)}
              className="rounded-md border border-ink/20 bg-white px-3 py-2 text-sm" aria-label="Filter by severity">
              <option value="all">All severities</option>
              {Object.entries(SAFEGUARDING_SEVERITY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
        )}

        {filtered.length === 0 ? (
          <div className="p-8 text-center text-sm text-ink/60">
            {privileged ? "No cases match the current filters." : "No cases assigned to you."}
          </div>
        ) : (
          <ul className="divide-y divide-ink/5">
            {filtered.map((c) => (
              <li key={c.id}>
                <Link href={`/admin/moderation/safeguarding/${c.id}`} className="block p-4 hover:bg-ink/5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-[240px] flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-ink">{c.reference}</span>
                        <span className={"inline-block rounded-full border px-2 py-0.5 text-xs " + SEVERITY_TONE[c.severity]}>
                          {SAFEGUARDING_SEVERITY_LABELS[c.severity]}
                        </span>
                        {c.isMinor && (
                          <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-800">
                            Minor
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-ink/70">
                        Subject: {c.subjectName}
                        {c.reporterName && ` / Reporter: ${c.reporterName}`}
                      </p>
                      {c.assignedTo && (
                        <p className="mt-1 text-xs text-ink/50">Assigned to {c.assignedTo}</p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="rounded-full bg-ink/10 px-2 py-0.5 text-xs">
                        {SAFEGUARDING_STATUS_LABELS[c.status]}
                      </span>
                      <span className="text-xs text-ink/50">
                        Opened {new Date(c.createdAt).toLocaleDateString("en-GB")}
                      </span>
                      {c.closedAt && (
                        <span className="text-xs text-ink/50">
                          Closed {new Date(c.closedAt).toLocaleDateString("en-GB")}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
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