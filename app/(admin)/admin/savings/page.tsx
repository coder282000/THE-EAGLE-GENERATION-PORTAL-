"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/button";
import {
  getCircles,
  getPendingPayouts,
  canViewSavings,
  canActionSavings,
  isCircleLeaderScoped,
  formatMoney,
  CIRCLE_TYPE_LABELS,
  CIRCLE_FREQUENCY_LABELS,
  CIRCLE_STATUS_LABELS,
  CIRCLE_HEALTH_LABELS,
  type SavingsCircle,
  type CircleHealth,
} from "@/lib/mock/savings";

const HEALTH_TONE: Record<CircleHealth, string> = {
  HEALTHY: "bg-green-100 text-green-800",
  WATCHED: "bg-clay/15 text-clay",
  AT_RISK: "bg-red-100 text-red-800",
};

const PAGE_SIZE = 25;

export default function CircleListPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [healthFilter, setHealthFilter] = useState("all");
  const [page, setPage] = useState(1);

  const canView = canViewSavings();
  const canAction = canActionSavings();
  const scoped = isCircleLeaderScoped();
  const all = useMemo(() => getCircles(), []);
  const pending = useMemo(() => getPendingPayouts(), []);

  const filtered = useMemo(() => {
    let r = all;
    if (statusFilter !== "all") r = r.filter((c) => c.status === statusFilter);
    if (typeFilter !== "all") r = r.filter((c) => c.type === typeFilter);
    if (healthFilter !== "all") r = r.filter((c) => c.health === healthFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter((c) => c.name.toLowerCase().includes(q) || c.region.toLowerCase().includes(q));
    }
    return r;
  }, [all, search, statusFilter, typeFilter, healthFilter]);

  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  if (!canView) {
    return (
      <div className="p-6">
        <div className="rounded-lg border border-ink/10 bg-paper p-6 text-sm text-ink/70">
          You do not have permission to view savings circles.
        </div>
      </div>
    );
  }

  const stats = {
    active: all.filter((c) => c.status === "ACTIVE").length,
    members: all.reduce((s, c) => s + c.memberCount, 0),
    contributions: all.reduce((s, c) => s + c.contributionMinor, 0),
    arrears: all.filter((c) => c.arrearsCount > 0).length,
    pendingApproval: pending.length,
  };

  return (
    <div className="space-y-6 p-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Savings circles</h1>
          <p className="mt-1 text-sm text-ink/60">
            Oversight of every savings circle, contribution, and payout.
          </p>
        </div>
        {canAction && (
          <Link
            href="/admin/savings/circles/new"
            className="rounded-md border border-sky bg-sky px-3 py-1.5 text-xs text-white hover:bg-sky/90"
          >
            Create circle
          </Link>
        )}
      </header>

      {scoped && (
        <div role="note" className="rounded-lg border border-sky/30 bg-sky/5 p-3 text-sm text-ink">
          Own-circle scope: you see only circles you lead. Cross-circle oversight is reserved for admins and finance.
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <Kpi label="Active circles" value={stats.active} />
        <Kpi label="Total members" value={stats.members} />
        <Kpi
          label="Target contributions"
          value={formatMoney(stats.contributions, "KES")}
          tone="ink"
        />
        <Kpi label="Circles in arrears" value={stats.arrears} tone={stats.arrears > 0 ? "clay" : "success"} />
        <Kpi
          label="Payouts pending"
          value={stats.pendingApproval}
          tone={stats.pendingApproval > 0 ? "danger" : "ink"}
        />
      </div>

      <div className="rounded-lg border border-ink/10 bg-paper">
        <div className="flex flex-wrap gap-3 border-b border-ink/10 p-4">
          <input
            type="search"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search circle name or region"
            className="flex-1 min-w-[200px] rounded-md border border-ink/20 bg-white px-3 py-2 text-sm"
            aria-label="Search circles"
          />
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="rounded-md border border-ink/20 bg-white px-3 py-2 text-sm"
            aria-label="Filter by status"
          >
            <option value="all">All statuses</option>
            {Object.entries(CIRCLE_STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <select
            value={typeFilter}
            onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
            className="rounded-md border border-ink/20 bg-white px-3 py-2 text-sm"
            aria-label="Filter by type"
          >
            <option value="all">All types</option>
            {Object.entries(CIRCLE_TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <select
            value={healthFilter}
            onChange={(e) => { setHealthFilter(e.target.value); setPage(1); }}
            className="rounded-md border border-ink/20 bg-white px-3 py-2 text-sm"
            aria-label="Filter by health"
          >
            <option value="all">All health</option>
            {Object.entries(CIRCLE_HEALTH_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>

        {paged.length === 0 ? (
          <div className="p-8 text-center text-sm text-ink/60">
            No savings circles match your filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <caption className="sr-only">Savings circles</caption>
              <thead className="bg-ink/5 text-left text-xs uppercase tracking-wide text-ink/60">
                <tr>
                  <th scope="col" className="px-4 py-2">Name</th>
                  <th scope="col" className="px-4 py-2">Type</th>
                  <th scope="col" className="px-4 py-2">Region</th>
                  <th scope="col" className="px-4 py-2">Members</th>
                  <th scope="col" className="px-4 py-2">Contribution</th>
                  <th scope="col" className="px-4 py-2">Frequency</th>
                  <th scope="col" className="px-4 py-2">Next payout</th>
                  <th scope="col" className="px-4 py-2">Arrears</th>
                  <th scope="col" className="px-4 py-2">Health</th>
                  <th scope="col" className="px-4 py-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/5">
                {paged.map((c) => (
                  <tr key={c.id} className="hover:bg-ink/5">
                    <td className="px-4 py-3">
                      <Link href={`/admin/savings/circles/${c.id}`} className="text-sky hover:underline">
                        {c.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3">{CIRCLE_TYPE_LABELS[c.type]}</td>
                    <td className="px-4 py-3 text-ink/70">{c.region}</td>
                    <td className="px-4 py-3">{c.memberCount}</td>
                    <td className="px-4 py-3">{formatMoney(c.contributionMinor, c.currency)}</td>
                    <td className="px-4 py-3">{CIRCLE_FREQUENCY_LABELS[c.frequency]}</td>
                    <td className="px-4 py-3 text-ink/70">
                      {c.nextPayoutAt ? new Date(c.nextPayoutAt).toLocaleDateString("en-GB") : "—"}
                    </td>
                    <td className={"px-4 py-3 " + (c.arrearsCount > 0 ? "text-clay" : "")}>
                      {c.arrearsCount}
                    </td>
                    <td className="px-4 py-3">
                      <span className={"rounded-full px-2 py-0.5 text-xs " + HEALTH_TONE[c.health]}>
                        {CIRCLE_HEALTH_LABELS[c.health]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-ink/10 px-2 py-0.5 text-xs">
                        {CIRCLE_STATUS_LABELS[c.status]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {filtered.length > PAGE_SIZE && (
          <div className="flex items-center justify-between border-t border-ink/10 p-4 text-sm">
            <span className="text-ink/60">
              Page {page} of {totalPages} ({filtered.length} circles)
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

function Kpi({ label, value, tone = "ink" }: { label: string; value: number | string; tone?: "ink" | "clay" | "danger" | "success" }) {
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