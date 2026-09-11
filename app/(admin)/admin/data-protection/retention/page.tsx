"use client";

import { useMemo } from "react";
import { getRetentionPolicies, canViewDataProtection } from "@/lib/mock/data-protection";

export default function RetentionMonitorPage() {
  const canView = canViewDataProtection();
  const policies = useMemo(() => getRetentionPolicies(), []);

  if (!canView) {
    return <div className="p-6"><div className="rounded-lg border border-ink/10 bg-paper p-6 text-sm text-ink/70">Access denied.</div></div>;
  }

  const eligible = policies.reduce((s, p) => s + p.recordsEligible, 0);
  const pending = policies.reduce((s, p) => s + p.recordsPendingReview, 0);

  return (
    <div className="space-y-6 p-6">
      <header>
        <h1 className="text-2xl font-semibold text-ink">Retention and purge monitor</h1>
        <p className="mt-1 text-sm text-ink/60">
          Per-entity retention policy and automated purge job status (DPA-8, RO-9).
        </p>
      </header>

      <div className="rounded-lg border border-clay/40 bg-clay/5 p-4 text-sm text-ink">
        <strong>Erasure vs retention.</strong> Member records with financial activity cannot be deleted.
        Identifying fields are anonymised; transaction history is retained for 7 years under
        financial record-keeping rules.
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Kpi label="Active policies" value={policies.length} />
        <Kpi label="Records eligible" value={eligible} tone="clay" />
        <Kpi label="Pending review" value={pending} />
        <Kpi label="Exceptions" value={0} tone="success" />
      </div>

      <div className="rounded-lg border border-ink/10 bg-paper">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-ink/5 text-left text-xs uppercase tracking-wide text-ink/60">
              <tr>
                <th className="px-4 py-2">Entity</th>
                <th className="px-4 py-2">Category</th>
                <th className="px-4 py-2">Retention</th>
                <th className="px-4 py-2">Legal basis</th>
                <th className="px-4 py-2">Last purge</th>
                <th className="px-4 py-2">Next purge</th>
                <th className="px-4 py-2">Eligible</th>
                <th className="px-4 py-2">Pending</th>
                <th className="px-4 py-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/5">
              {policies.map((p) => (
                <tr key={p.id} className="hover:bg-ink/5">
                  <td className="px-4 py-3">{p.entityName}</td>
                  <td className="px-4 py-3">{p.dataCategory}</td>
                  <td className="px-4 py-3">{p.retentionPeriodDays} days</td>
                  <td className="px-4 py-3">{p.legalBasis}</td>
                  <td className="px-4 py-3">{p.lastPurgeRunAt ? new Date(p.lastPurgeRunAt).toLocaleDateString("en-GB") : "-"}</td>
                  <td className="px-4 py-3">{new Date(p.nextPurgeRunAt).toLocaleDateString("en-GB")}</td>
                  <td className="px-4 py-3">{p.recordsEligible}</td>
                  <td className="px-4 py-3">{p.recordsPendingReview}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-ink/10 px-2 py-0.5 text-xs">{p.status}</span>
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