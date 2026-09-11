"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/button";
import { getIntegrations, canViewSystemSettings, INTEGRATION_STATUS_TONE } from "@/lib/mock/system-settings";

export default function IntegrationsPage() {
  const canView = canViewSystemSettings();
  const all = useMemo(() => getIntegrations(), []);
  const [categoryFilter, setCategoryFilter] = useState("all");

  if (!canView) {
    return <div className="p-6"><div className="rounded-lg border border-ink/10 bg-paper p-6 text-sm text-ink/70">Access denied.</div></div>;
  }

  const categories = ["all", ...Array.from(new Set(all.map((i) => i.category)))];
  const filtered = categoryFilter === "all" ? all : all.filter((i) => i.category === categoryFilter);

  const healthy = all.filter((i) => i.status === "HEALTHY").length;
  const degraded = all.filter((i) => i.status === "DEGRADED").length;
  const down = all.filter((i) => i.status === "DOWN").length;
  const notConfigured = all.filter((i) => i.status === "NOT_CONFIGURED").length;

  return (
    <div className="space-y-6 p-6">
      <header>
        <h1 className="text-2xl font-semibold text-ink">Integrations and health</h1>
        <p className="mt-1 text-sm text-ink/60">Credentials are never displayed in the UI.</p>
      </header>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Kpi label="Healthy" value={healthy} tone="success" />
        <Kpi label="Degraded" value={degraded} tone="clay" />
        <Kpi label="Down" value={down} tone="danger" />
        <Kpi label="Not configured" value={notConfigured} />
      </div>

      <div className="rounded-lg border border-ink/10 bg-paper">
        <div className="flex flex-wrap items-center gap-3 border-b border-ink/10 p-4">
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-md border border-ink/20 bg-white px-3 py-2 text-sm">
            {categories.map((c) => <option key={c} value={c}>{c === "all" ? "All categories" : c}</option>)}
          </select>
          <Button variant="outline" onClick={() => window.location.reload()}>Refresh</Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-ink/5 text-left text-xs uppercase tracking-wide text-ink/60">
              <tr>
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Category</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Environment</th>
                <th className="px-4 py-2">Last checked</th>
                <th className="px-4 py-2">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/5">
              {filtered.map((i) => (
                <tr key={i.id} className="hover:bg-ink/5">
                  <td className="px-4 py-3">{i.name}</td>
                  <td className="px-4 py-3">{i.category}</td>
                  <td className={"px-4 py-3 " + INTEGRATION_STATUS_TONE[i.status]}>{i.status.replace("_", " ")}</td>
                  <td className="px-4 py-3">{i.environment}</td>
                  <td className="px-4 py-3">{new Date(i.lastCheckedAt).toLocaleString("en-GB")}</td>
                  <td className="px-4 py-3 text-ink/60">{i.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Kpi({ label, value, tone = "ink" }: { label: string; value: number; tone?: "ink" | "clay" | "danger" | "success" }) {
  const tones: Record<string, string> = { ink: "text-ink", clay: "text-clay", danger: "text-red-600", success: "text-green-700" };
  return (
    <div className="rounded-lg border border-ink/10 bg-paper p-4">
      <div className="text-xs uppercase tracking-wide text-ink/50">{label}</div>
      <div className={"mt-1 text-2xl font-semibold " + tones[tone]}>{value}</div>
    </div>
  );
}