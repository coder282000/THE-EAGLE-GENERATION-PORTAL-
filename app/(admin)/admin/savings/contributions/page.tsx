"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/button";
import {
  getContributions,
  canViewSavings,
  canActionSavings,
  isCircleLeaderScoped,
  formatMoney,
  CONTRIBUTION_METHOD_LABELS,
  CONTRIBUTION_STATUS_LABELS,
  type Contribution,
  type ContributionStatus,
} from "@/lib/mock/savings";

const STATUS_TONE: Record<ContributionStatus, string> = {
  PAID: "bg-green-100 text-green-800",
  PENDING: "bg-sky/10 text-sky",
  FAILED: "bg-red-100 text-red-800",
  REVERSED: "bg-ink/10 text-ink/70",
  LATE: "bg-clay/15 text-clay",
};

const PAGE_SIZE = 50;

export default function ContributionMonitoringPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [circleFilter, setCircleFilter] = useState("all");
  const [page, setPage] = useState(1);

  const canView = canViewSavings();
  const canAction = canActionSavings();
  const scoped = isCircleLeaderScoped();
  const all = useMemo(() => getContributions(), []);

  const circleOptions = useMemo(
    () => Array.from(new Set(all.map((c) => c.circleName))).sort(),
    [all]
  );

  const filtered = useMemo(() => {
    let r = all;
    if (statusFilter !== "all") r = r.filter((c) => c.status === statusFilter);
    if (circleFilter !== "all") r = r.filter((c) => c.circleName === circleFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter(
        (c) =>
          c.memberNumber.toLowerCase().includes(q) ||
          c.circleName.toLowerCase().includes(q) ||
          c.ledgerPairId.toLowerCase().includes(q)
      );
    }
    return r;
  }, [all, search, statusFilter, circleFilter]);

  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  if (!canView) {
    return (
      <div className="p-6">
        <div className="rounded-lg border border-ink/10 bg-paper p-6 text-sm text-ink/70">
          You do not have permission to view contributions.
        </div>
      </div>
    );
  }

  const paid = filtered.filter((c) => c.status === "PAID");
  const collected = paid.reduce((s, c) => s + c.amountMinor, 0);
  const failed = filtered.filter((c) => c.status === "FAILED").length;
  const late = filtered.filter((c) => c.status === "LATE").length;
  const total = filtered.length;
  const onTimeRate = total > 0 ? paid.length / total : 0;

  return (
    <div className="space-y-6 p-6">
      <header>
        <h1 className="text-2xl font-semibold text-ink">Contributions</h1>
        <p className="mt-1 text-sm text-ink/60">
          Every contribution made, pending, or missed.
        </p>
      </header>

      {scoped && (
        <div role="note" className="rounded-lg border border-sky/30 bg-sky/5 p-3 text-sm text-ink">
          Own-circle scope: you see only contributions on circles you lead.
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <Kpi label="Collected" value={formatMoney(collected, "KES")} tone="success" />
        <Kpi label="Contributions" value={total} />
        <Kpi label="On-time rate" value={`${Math.round(onTimeRate * 100)}%`} />
        <Kpi label="Late" value={late} tone={late > 0 ? "clay" : "ink"} />
        <Kpi label="Failed" value={failed} tone={failed > 0 ? "danger" : "ink"} />
      </div>

      <div className="rounded-lg border border-ink/10 bg-paper">
        <div className="flex flex-wrap gap-3 border-b border-ink/10 p-4">
          <input
            type="search"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search member no., circle, ledger pair"
            className="flex-1 min-w-[220px] rounded-md border border-ink/20 bg-white px-3 py-2 text-sm"
            aria-label="Search contributions"
          />
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="rounded-md border border-ink/20 bg-white px-3 py-2 text-sm"
            aria-label="Filter by status"
          >
            <option value="all">All statuses</option>
            {Object.entries(CONTRIBUTION_STATUS_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
          <select
            value={circleFilter}
            onChange={(e) => { setCircleFilter(e.target.value); setPage(1); }}
            className="rounded-md border border-ink/20 bg-white px-3 py-2 text-sm"
            aria-label="Filter by circle"
          >
            <option value="all">All circles</option>
            {circleOptions.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {paged.length === 0 ? (
          <div className="p-8 text-center text-sm text-ink/60">
            No contributions in this period.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <caption className="sr-only">Contributions</caption>
              <thead className="bg-ink/5 text-left text-xs uppercase tracking-wide text-ink/60">
                <tr>
                  <th scope="col" className="px-4 py-2">Date</th>
                  <th scope="col" className="px-4 py-2">Member no.</th>
                  <th scope="col" className="px-4 py-2">Circle</th>
                  <th scope="col" className="px-4 py-2">Amount</th>
                  <th scope="col" className="px-4 py-2">Method</th>
                  <th scope="col" className="px-4 py-2">Status</th>
                  <th scope="col" className="px-4 py-2">Ledger pair</th>
                  {canAction && <th scope="col" className="px-4 py-2"></th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/5">
                {paged.map((c: Contribution) => (
                  <tr key={c.id} className="hover:bg-ink/5">
                    <td className="px-4 py-3 text-ink/70">
                      {new Date(c.createdAt).toLocaleDateString("en-GB")}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">{c.memberNumber}</td>
                    <td className="px-4 py-3">{c.circleName}</td>
                    <td className="px-4 py-3">{formatMoney(c.amountMinor, c.currency)}</td>
                    <td className="px-4 py-3 text-ink/70">{CONTRIBUTION_METHOD_LABELS[c.method]}</td>
                    <td className="px-4 py-3">
                      <span className={"rounded-full px-2 py-0.5 text-xs " + STATUS_TONE[c.status]}>
                        {CONTRIBUTION_STATUS_LABELS[c.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-ink/50">{c.ledgerPairId}</td>
                    {canAction && (
                      <td className="px-4 py-3">
                        {c.status === "PAID" && (
                          <Button variant="outline" onClick={() => { /* reverse */ }}>
                            Reverse
                          </Button>
                        )}
                        {c.status === "PENDING" && (
                          <Button variant="outline" onClick={() => { /* mark late */ }}>
                            Mark late
                          </Button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {filtered.length > PAGE_SIZE && (
          <div className="flex items-center justify-between border-t border-ink/10 p-4 text-sm">
            <span className="text-ink/60">
              Page {page} of {totalPages} ({filtered.length} contributions)
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