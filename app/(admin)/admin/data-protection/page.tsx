"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/button";
import {
  getDSRs, canViewDataProtection,
  DSR_TYPE_LABELS, DSR_STATUS_LABELS, daysUntil, isOverdue,
} from "@/lib/mock/data-protection";

const PAGE_SIZE = 20;

export default function DSRQueuePage() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);

  const canView = canViewDataProtection();
  const all = useMemo(() => getDSRs(), []);

  const filtered = useMemo(() => {
    let r = all;
    if (typeFilter !== "all") r = r.filter((d) => d.type === typeFilter);
    if (statusFilter !== "all") r = r.filter((d) => d.status === statusFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter((d) =>
        d.reference.toLowerCase().includes(q) ||
        d.memberName.toLowerCase().includes(q) ||
        d.memberNumber.toLowerCase().includes(q)
      );
    }
    return r;
  }, [all, typeFilter, statusFilter, search]);

  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  const stats = useMemo(() => {
    const open = all.filter((d) => !["COMPLETED", "REJECTED"].includes(d.status));
    return {
      open: open.length,
      approaching: open.filter((d) => { const x = daysUntil(d.deadlineAt); return x >= 0 && x <= 7; }).length,
      overdue: open.filter((d) => isOverdue(d.deadlineAt)).length,
      completed: all.filter((d) => d.status === "COMPLETED").length,
    };
  }, [all]);

  if (!canView) {
    return (
      <div className="p-6">
        <div className="rounded-lg border border-ink/10 bg-paper p-6 text-sm text-ink/70">
          You do not have permission to view the Data Protection panel.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <header>
        <h1 className="text-2xl font-semibold text-ink">Data subject requests</h1>
        <p className="mt-1 text-sm text-ink/60">
          Track and process every DSR within the 30-day statutory window.
        </p>
      </header>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Kpi label="Open" value={stats.open} />
        <Kpi label="Due in 7 days" value={stats.approaching} tone="clay" />
        <Kpi label="Overdue" value={stats.overdue} tone="danger" />
        <Kpi label="Completed (30d)" value={stats.completed} tone="success" />
      </div>

      <div className="rounded-lg border border-ink/10 bg-paper">
        <div className="flex flex-wrap gap-3 border-b border-ink/10 p-4">
          <input
            type="search"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search reference, name, member no."
            className="flex-1 min-w-[200px] rounded-md border border-ink/20 bg-white px-3 py-2 text-sm"
          />
          <select
            value={typeFilter}
            onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
            className="rounded-md border border-ink/20 bg-white px-3 py-2 text-sm"
          >
            <option value="all">All types</option>
            {Object.entries(DSR_TYPE_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="rounded-md border border-ink/20 bg-white px-3 py-2 text-sm"
          >
            <option value="all">All statuses</option>
            {Object.entries(DSR_STATUS_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>

        {paged.length === 0 ? (
          <div className="p-8 text-center text-sm text-ink/60">No requests found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-ink/5 text-left text-xs uppercase tracking-wide text-ink/60">
                <tr>
                  <th className="px-4 py-2">Reference</th>
                  <th className="px-4 py-2">Type</th>
                  <th className="px-4 py-2">Member</th>
                  <th className="px-4 py-2">Member no.</th>
                  <th className="px-4 py-2">Received</th>
                  <th className="px-4 py-2">Deadline</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2">Assignee</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/5">
                {paged.map((r) => {
                  const d = daysUntil(r.deadlineAt);
                  const overdue = isOverdue(r.deadlineAt);
                  return (
                    <tr key={r.id} className="hover:bg-ink/5">
                      <td className="px-4 py-3">
                        <Link href={`/admin/data-protection/${r.id}`} className="text-sky hover:underline">
                          {r.reference}
                        </Link>
                      </td>
                      <td className="px-4 py-3">{DSR_TYPE_LABELS[r.type]}</td>
                      <td className="px-4 py-3">{r.memberName}</td>
                      <td className="px-4 py-3">{r.memberNumber}</td>
                      <td className="px-4 py-3">{new Date(r.receivedAt).toLocaleDateString("en-GB")}</td>
                      <td className={"px-4 py-3 " + (overdue ? "text-red-600" : d <= 7 ? "text-clay" : "text-ink")}>
                        {d < 0 ? `${-d}d overdue` : `${d}d`}
                      </td>
                      <td className="px-4 py-3">
                        <span className="rounded-full bg-ink/10 px-2 py-0.5 text-xs">
                          {DSR_STATUS_LABELS[r.status]}
                        </span>
                      </td>
                      <td className="px-4 py-3">{r.assignedTo}</td>
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
              Page {page} of {pages} ({filtered.length} rows)
            </span>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setPage((p) => Math.max(1, p - 1))}>Previous</Button>
              <Button variant="outline" onClick={() => setPage((p) => Math.min(pages, p + 1))}>Next</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Kpi({ label, value, tone = "ink" }: { label: string; value: number; tone?: "ink" | "clay" | "danger" | "success" }) {
  const tones: Record<string, string> = {
    ink: "text-ink", clay: "text-clay", danger: "text-red-600", success: "text-green-700",
  };
  return (
    <div className="rounded-lg border border-ink/10 bg-paper p-4">
      <div className="text-xs uppercase tracking-wide text-ink/50">{label}</div>
      <div className={"mt-1 text-2xl font-semibold " + tones[tone]}>{value}</div>
    </div>
  );
}