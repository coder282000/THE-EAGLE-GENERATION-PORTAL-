"use client";

import { useMemo, useState } from "react";
import {
  getBreaches, canViewDataProtection,
  BREACH_SEVERITY_LABELS, BREACH_STATUS_LABELS,
  hoursUntil, isOverdue,
} from "@/lib/mock/data-protection";

export default function BreachRegisterPage() {
  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const canView = canViewDataProtection();
  const all = useMemo(() => getBreaches(), []);

  const filtered = useMemo(() => {
    let r = all;
    if (severityFilter !== "all") r = r.filter((b) => b.severity === severityFilter);
    if (statusFilter !== "all") r = r.filter((b) => b.status === statusFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter((b) => b.reference.toLowerCase().includes(q) || b.title.toLowerCase().includes(q));
    }
    return r;
  }, [all, severityFilter, statusFilter, search]);

  if (!canView) {
    return <div className="p-6"><div className="rounded-lg border border-ink/10 bg-paper p-6 text-sm text-ink/70">Access denied.</div></div>;
  }

  const open = all.filter((b) => !["CLOSED", "NOTIFIED"].includes(b.status));
  const clockActive = open.filter((b) => !isOverdue(b.notificationDeadlineAt));

  return (
    <div className="space-y-6 p-6">
      <header>
        <h1 className="text-2xl font-semibold text-ink">Breach register</h1>
        <p className="mt-1 text-sm text-ink/60">
          72-hour ODPC notification clock. Every entry is immutable after notification (DPA-10).
        </p>
      </header>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Kpi label="Open" value={open.length} tone={open.length ? "clay" : "success"} />
        <Kpi label="72h clock active" value={clockActive.length} tone="danger" />
        <Kpi label="Notified (30d)" value={all.filter((b) => b.notifiedODPCAt).length} />
        <Kpi label="Closed" value={all.filter((b) => b.status === "CLOSED").length} />
      </div>

      <div className="rounded-lg border border-ink/10 bg-paper">
        <div className="flex flex-wrap gap-3 border-b border-ink/10 p-4">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search reference or title"
            className="flex-1 min-w-[200px] rounded-md border border-ink/20 bg-white px-3 py-2 text-sm"
          />
          <select value={severityFilter} onChange={(e) => setSeverityFilter(e.target.value)}
            className="rounded-md border border-ink/20 bg-white px-3 py-2 text-sm">
            <option value="all">All severities</option>
            {Object.entries(BREACH_SEVERITY_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-md border border-ink/20 bg-white px-3 py-2 text-sm">
            <option value="all">All statuses</option>
            {Object.entries(BREACH_STATUS_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>

        {filtered.length === 0 ? (
          <div className="p-8 text-center text-sm text-ink/60">No incidents recorded.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-ink/5 text-left text-xs uppercase tracking-wide text-ink/60">
                <tr>
                  <th className="px-4 py-2">Reference</th>
                  <th className="px-4 py-2">Title</th>
                  <th className="px-4 py-2">Severity</th>
                  <th className="px-4 py-2">Category</th>
                  <th className="px-4 py-2">Discovered</th>
                  <th className="px-4 py-2">72h clock</th>
                  <th className="px-4 py-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/5">
                {filtered.map((b) => {
                  let clock = "Notified";
                  let clockTone = "text-green-700";
                  if (!b.notifiedODPCAt) {
                    const h = hoursUntil(b.notificationDeadlineAt);
                    clock = h < 0 ? `${-h}h overdue` : `${h}h left`;
                    clockTone = h < 0 ? "text-red-600" : h <= 12 ? "text-clay" : "text-ink";
                  }
                  return (
                    <tr key={b.id} className="hover:bg-ink/5">
                      <td className="px-4 py-3">{b.reference}</td>
                      <td className="px-4 py-3">{b.title}</td>
                      <td className="px-4 py-3">{BREACH_SEVERITY_LABELS[b.severity]}</td>
                      <td className="px-4 py-3">{b.category}</td>
                      <td className="px-4 py-3">{new Date(b.discoveredAt).toLocaleDateString("en-GB")}</td>
                      <td className={"px-4 py-3 " + clockTone}>{clock}</td>
                      <td className="px-4 py-3">
                        <span className="rounded-full bg-ink/10 px-2 py-0.5 text-xs">
                          {BREACH_STATUS_LABELS[b.status]}
                        </span>
                      </td>
                    </tr>
                  );
                })}
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