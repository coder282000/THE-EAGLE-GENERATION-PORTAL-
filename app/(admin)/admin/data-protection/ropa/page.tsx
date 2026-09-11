"use client";

import { useMemo, useState } from "react";
import {
  getROPA, canViewDataProtection, LAWFUL_BASIS_LABELS,
} from "@/lib/mock/data-protection";

export default function ROPAPage() {
  const [search, setSearch] = useState("");
  const [basisFilter, setBasisFilter] = useState("all");

  const canView = canViewDataProtection();
  const all = useMemo(() => getROPA(), []);

  const filtered = useMemo(() => {
    let r = all;
    if (basisFilter !== "all") r = r.filter((e) => e.lawfulBasis === basisFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter((e) => e.processingName.toLowerCase().includes(q));
    }
    return r;
  }, [all, basisFilter, search]);

  if (!canView) {
    return <div className="p-6"><div className="rounded-lg border border-ink/10 bg-paper p-6 text-sm text-ink/70">Access denied.</div></div>;
  }

  const dpiaRequired = all.filter((e) => e.dpiaRequired).length;
  const crossBorder = all.filter((e) => e.crossBorderTransfers.length > 0).length;
  const reviewDue = all.filter((e) => new Date(e.nextReviewAt).getTime() - Date.now() < 90 * 86400000).length;

  return (
    <div className="space-y-6 p-6">
      <header>
        <h1 className="text-2xl font-semibold text-ink">Records of Processing Activities</h1>
        <p className="mt-1 text-sm text-ink/60">
          DPA-9 register. Every processing activity, its lawful basis, retention, and cross-border transfers.
        </p>
      </header>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Kpi label="Active entries" value={all.length} />
        <Kpi label="DPIA required" value={dpiaRequired} tone="clay" />
        <Kpi label="Cross-border" value={crossBorder} />
        <Kpi label="Review due (90d)" value={reviewDue} />
      </div>

      <div className="rounded-lg border border-ink/10 bg-paper">
        <div className="flex flex-wrap gap-3 border-b border-ink/10 p-4">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search processing activity"
            className="flex-1 min-w-[200px] rounded-md border border-ink/20 bg-white px-3 py-2 text-sm"
          />
          <select value={basisFilter} onChange={(e) => setBasisFilter(e.target.value)}
            className="rounded-md border border-ink/20 bg-white px-3 py-2 text-sm">
            <option value="all">All bases</option>
            {Object.entries(LAWFUL_BASIS_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>

        {filtered.length === 0 ? (
          <div className="p-8 text-center text-sm text-ink/60">No processing activities.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-ink/5 text-left text-xs uppercase tracking-wide text-ink/60">
                <tr>
                  <th className="px-4 py-2">Activity</th>
                  <th className="px-4 py-2">Lawful basis</th>
                  <th className="px-4 py-2">Data categories</th>
                  <th className="px-4 py-2">Retention</th>
                  <th className="px-4 py-2">DPIA</th>
                  <th className="px-4 py-2">Next review</th>
                  <th className="px-4 py-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/5">
                {filtered.map((e) => (
                  <tr key={e.id} className="hover:bg-ink/5">
                    <td className="px-4 py-3">{e.processingName}</td>
                    <td className="px-4 py-3">{LAWFUL_BASIS_LABELS[e.lawfulBasis]}</td>
                    <td className="px-4 py-3">{e.dataCategories.join(", ")}</td>
                    <td className="px-4 py-3">{e.retentionPeriod}</td>
                    <td className="px-4 py-3">
                      {e.dpiaRequired ? (e.dpiaCompletedAt ? "Complete" : "Required") : "-"}
                    </td>
                    <td className="px-4 py-3">{new Date(e.nextReviewAt).toLocaleDateString("en-GB")}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-ink/10 px-2 py-0.5 text-xs">{e.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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