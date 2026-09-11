"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/button";
import {
  getReports,
  getReportRuns,
  canViewCommerce,
  canExportReports,
  type FinancialReport,
  type ReportRun,
  type ReportKey,
  type ReportFormat,
} from "@/lib/mock/commerce";
import { getCurrentUser } from "@/lib/mock/current-user";

type Tab = "available" | "runs";

export default function FinancialReportsPage() {
  const [tab, setTab] = useState<Tab>("available");
  const [selectedKey, setSelectedKey] = useState<ReportKey | null>(null);
  const [generating, setGenerating] = useState(false);

  const canView = canViewCommerce();
  const canExport = canExportReports();
  const me = getCurrentUser();
  const reports = useMemo(() => getReports(), []);
  const runs = useMemo(() => getReportRuns(), []);

  if (!canView) {
    return (
      <div className="p-6">
        <div className="rounded-lg border border-ink/10 bg-paper p-6 text-sm text-ink/70">
          You do not have permission to view financial reports.
        </div>
      </div>
    );
  }

  const runsThisMonth = runs.filter((r) => {
    const d = new Date(r.generatedAt);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;
  const lastRun = runs[0];

  const selectedReport = selectedKey ? reports.find((r) => r.key === selectedKey) ?? null : null;

  const handleGenerate = () => {
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
      setTab("runs");
    }, 1200);
  };

  return (
    <div className="space-y-6 p-6">
      <header>
        <h1 className="text-2xl font-semibold text-ink">Financial reports</h1>
        <p className="mt-1 text-sm text-ink/60">
          Periodic reports and exports derived from the ledger.
        </p>
      </header>

      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Kpi label="Reports available" value={reports.length} />
        <Kpi label="Runs this month" value={runsThisMonth} />
        <Kpi
          label="Last run"
          value={lastRun ? new Date(lastRun.generatedAt).toLocaleDateString("en-GB") : "—"}
        />
        <Kpi
          label="Most recent export"
          value={lastRun ? lastRun.format : "—"}
        />
      </section>

      <div role="tablist" className="flex border-b border-ink/10">
        <TabBtn active={tab === "available"} onClick={() => setTab("available")}>
          Available reports
        </TabBtn>
        <TabBtn active={tab === "runs"} onClick={() => setTab("runs")}>
          Recent runs ({runs.length})
        </TabBtn>
      </div>

      {tab === "available" && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {reports.map((r: FinancialReport) => (
            <article
              key={r.key}
              className="rounded-lg border border-ink/10 bg-paper p-5 transition-shadow hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <h2 className="text-base font-semibold text-ink">{r.name}</h2>
                <span className="rounded-full bg-ink/10 px-2 py-0.5 text-xs text-ink/70">
                  {r.format}
                </span>
              </div>
              <p className="mt-2 text-sm text-ink/70">{r.description}</p>
              <dl className="mt-3 grid grid-cols-2 gap-3 text-xs">
                <div>
                  <dt className="uppercase tracking-wide text-ink/50">Typical period</dt>
                  <dd className="mt-0.5 text-ink">{r.typicalPeriod}</dd>
                </div>
                <div>
                  <dt className="uppercase tracking-wide text-ink/50">Last run</dt>
                  <dd className="mt-0.5 text-ink">
                    {r.lastRunAt ? new Date(r.lastRunAt).toLocaleDateString("en-GB") : "Never"}
                  </dd>
                </div>
              </dl>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button variant="outline" onClick={() => setSelectedKey(r.key)}>
                  Preview
                </Button>
                <Button variant="primary" onClick={() => { setSelectedKey(r.key); }}>
                  Generate
                </Button>
              </div>
            </article>
          ))}
        </div>
      )}

      {tab === "runs" && (
        <section className="rounded-lg border border-ink/10 bg-paper">
          {runs.length === 0 ? (
            <div className="p-8 text-center text-sm text-ink/60">
              No reports generated yet. Pick a report above.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <caption className="sr-only">Recent report runs</caption>
                <thead className="bg-ink/5 text-left text-xs uppercase tracking-wide text-ink/60">
                  <tr>
                    <th scope="col" className="px-4 py-2">Report</th>
                    <th scope="col" className="px-4 py-2">Period</th>
                    <th scope="col" className="px-4 py-2">Format</th>
                    <th scope="col" className="px-4 py-2">Generated by</th>
                    <th scope="col" className="px-4 py-2">Generated at</th>
                    <th scope="col" className="px-4 py-2">Status</th>
                    <th scope="col" className="px-4 py-2"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink/5">
                  {runs.map((run: ReportRun) => {
                    const report = reports.find((r) => r.key === run.reportKey);
                    return (
                      <tr key={run.id} className="hover:bg-ink/5">
                        <td className="px-4 py-3 font-medium text-ink">
                          {report?.name ?? run.reportKey}
                        </td>
                        <td className="px-4 py-3 text-xs text-ink/70">
                          {new Date(run.periodFrom).toLocaleDateString("en-GB")} →{" "}
                          {new Date(run.periodTo).toLocaleDateString("en-GB")}
                        </td>
                        <td className="px-4 py-3">{run.format}</td>
                        <td className="px-4 py-3 text-ink/70">{run.generatedBy}</td>
                        <td className="px-4 py-3 text-ink/70">
                          {new Date(run.generatedAt).toLocaleString("en-GB")}
                        </td>
                        <td className="px-4 py-3">
                          <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-800">
                            {run.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {canExport && (
                            <div className="flex gap-1">
                              {run.pdfUrl && (
                                <a
                                  href={run.pdfUrl}
                                  className="rounded-md border border-ink/20 px-2 py-1 text-xs hover:bg-ink/5"
                                >
                                  PDF
                                </a>
                              )}
                              {run.csvUrl && (
                                <a
                                  href={run.csvUrl}
                                  className="rounded-md border border-ink/20 px-2 py-1 text-xs hover:bg-ink/5"
                                >
                                  CSV
                                </a>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {selectedReport && (
        <section className="rounded-lg border border-ink/10 bg-paper p-5">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-base font-semibold text-ink">{selectedReport.name}</h2>
              <p className="mt-1 text-sm text-ink/70">{selectedReport.description}</p>
            </div>
            <button
              type="button"
              onClick={() => setSelectedKey(null)}
              className="text-sm text-ink/60 hover:text-ink"
              aria-label="Close preview"
            >
              Close
            </button>
          </div>

          <div className="mt-4 rounded-md border border-ink/10 bg-white p-4 text-sm">
            <div className="text-xs uppercase tracking-wide text-ink/50">Preview</div>
            <p className="mt-2 text-ink/70">
              {selectedReport.name} for the selected period. Derived from ledger entries.
              Never from stored balances.
            </p>
            <p className="mt-1 text-xs text-ink/50">
              Generating produces a PDF and CSV watermarked with your identity, the period,
              and the timestamp.
            </p>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              variant="primary"
              disabled={generating}
              onClick={handleGenerate}
            >
              {generating ? "Generating..." : "Generate report"}
            </Button>
            <Button variant="outline" onClick={() => setSelectedKey(null)}>
              Cancel
            </Button>
          </div>

          <p className="mt-2 text-xs text-ink/50">
            Prepared by {me.name}. Report runs are retained for 7 years.
          </p>
        </section>
      )}
    </div>
  );
}

function TabBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={
        "border-b-2 px-4 py-2 text-sm " +
        (active ? "border-sky text-sky" : "border-transparent text-ink/60 hover:text-ink")
      }
    >
      {children}
    </button>
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