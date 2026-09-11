"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/button";
import { getJobs, canViewSystemSettings, canEditSystemSettings, JOB_STATUS_TONE } from "@/lib/mock/system-settings";

export default function JobsPage() {
  const canView = canViewSystemSettings();
  const canEdit = canEditSystemSettings();
  const all = useMemo(() => getJobs(), []);
  const [statusFilter, setStatusFilter] = useState("all");

  if (!canView) {
    return <div className="p-6"><div className="rounded-lg border border-ink/10 bg-paper p-6 text-sm text-ink/70">Access denied.</div></div>;
  }

  const filtered = statusFilter === "all" ? all : all.filter((j) => j.lastRunStatus === statusFilter);
  const failing = all.filter((j) => j.failureCount > 0).length;

  return (
    <div className="space-y-6 p-6">
      <header>
        <h1 className="text-2xl font-semibold text-ink">Background jobs</h1>
        <p className="mt-1 text-sm text-ink/60">Scheduled and queued jobs. Running a job manually is audited.</p>
      </header>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Kpi label="Total jobs" value={all.length} />
        <Kpi label="Running" value={all.filter((j) => j.lastRunStatus === "RUNNING").length} tone="clay" />
        <Kpi label="Failing" value={failing} tone={failing ? "danger" : "success"} />
        <Kpi label="Never run" value={all.filter((j) => !j.lastRunAt).length} />
      </div>

      <div className="rounded-lg border border-ink/10 bg-paper">
        <div className="flex flex-wrap items-center gap-3 border-b border-ink/10 p-4">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-md border border-ink/20 bg-white px-3 py-2 text-sm">
            <option value="all">All statuses</option>
            <option value="SUCCESS">Success</option>
            <option value="FAILED">Failed</option>
            <option value="RUNNING">Running</option>
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-ink/5 text-left text-xs uppercase tracking-wide text-ink/60">
              <tr>
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Schedule</th>
                <th className="px-4 py-2">Last run</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Next run</th>
                <th className="px-4 py-2">Failures</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/5">
              {filtered.map((j) => (
                <tr key={j.id} className="hover:bg-ink/5">
                  <td className="px-4 py-3">{j.name}</td>
                  <td className="px-4 py-3"><code className="text-xs">{j.schedule}</code></td>
                  <td className="px-4 py-3">{j.lastRunAt ? new Date(j.lastRunAt).toLocaleString("en-GB") : "-"}</td>
                  <td className={"px-4 py-3 " + (j.lastRunStatus ? JOB_STATUS_TONE[j.lastRunStatus] : "text-ink/50")}>
                    {j.lastRunStatus ?? "-"}
                  </td>
                  <td className="px-4 py-3">{new Date(j.nextRunAt).toLocaleString("en-GB")}</td>
                  <td className={"px-4 py-3 " + (j.failureCount > 0 ? "text-red-600" : "")}>{j.failureCount}</td>
                  <td className="px-4 py-3">
                    {canEdit && (
                      <Button variant="outline" onClick={() => { /* trigger */ }}>Run now</Button>
                    )}
                  </td>
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