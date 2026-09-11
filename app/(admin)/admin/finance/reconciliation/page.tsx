"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Button } from "@/components/button";
import {
  getReconRuns,
  getExceptions,
  canViewCommerce,
  canActionCommerce,
  formatMoney,
  reconDaysClean,
  EXCEPTION_TYPE_LABELS,
  EXCEPTION_STATUS_LABELS,
  type ReconciliationRun,
  type ReconciliationException,
  type ReconRunStatus,
  type ExceptionStatus,
} from "@/lib/mock/commerce";

const ResponsiveContainer = dynamic(
  () => import("recharts").then((m) => m.ResponsiveContainer),
  { ssr: false }
);
const BarChart = dynamic(() => import("recharts").then((m) => m.BarChart), { ssr: false });
const Bar = dynamic(() => import("recharts").then((m) => m.Bar), { ssr: false });
const XAxis = dynamic(() => import("recharts").then((m) => m.XAxis), { ssr: false });
const YAxis = dynamic(() => import("recharts").then((m) => m.YAxis), { ssr: false });
const Tooltip = dynamic(() => import("recharts").then((m) => m.Tooltip), { ssr: false });
const CartesianGrid = dynamic(() => import("recharts").then((m) => m.CartesianGrid), { ssr: false });

const RUN_TONE: Record<ReconRunStatus, string> = {
  BALANCED: "bg-green-100 text-green-800",
  EXCEPTIONS: "bg-red-100 text-red-800",
  INCOMPLETE: "bg-clay/15 text-clay",
  FAILED: "bg-red-100 text-red-800",
};

const EXCEPTION_TONE: Record<ExceptionStatus, string> = {
  OPEN: "bg-sky/10 text-sky",
  INVESTIGATING: "bg-clay/15 text-clay",
  RESOLVED: "bg-green-100 text-green-800",
  ESCALATED: "bg-red-100 text-red-800",
};

export default function DailyReconciliationPage() {
  const [confirmRun, setConfirmRun] = useState(false);

  const canView = canViewCommerce();
  const canAction = canActionCommerce();
  const runs = useMemo(() => getReconRuns(), []);
  const exceptions = useMemo(() => getExceptions(), []);

  if (!canView) {
    return (
      <div className="p-6">
        <div className="rounded-lg border border-ink/10 bg-paper p-6 text-sm text-ink/70">
          You do not have permission to view reconciliation.
        </div>
      </div>
    );
  }

  const lastRun = runs[0];
  const clean = reconDaysClean();
  const openExceptions = exceptions.filter(
    (e) => e.status === "OPEN" || e.status === "INVESTIGATING"
  );
  const hasExceptions = openExceptions.length > 0;
  const agedExceptions = openExceptions.filter((e) => e.ageHours > 24 * 7);

  const matchedTotal = lastRun?.matched ?? 0;
  const unmatchedTotal = lastRun?.unmatched ?? 0;

  // Chart data: last 30 runs, matched and unmatched
  const chartData = runs
    .slice(0, 30)
    .map((r: ReconciliationRun) => ({
      date: r.date.slice(5, 10),
      matched: r.matched,
      unmatched: r.unmatched,
    }))
    .reverse();

  return (
    <div className="space-y-6 p-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Daily reconciliation</h1>
          <p className="mt-1 text-sm text-ink/60">
            Proof that the ledger matches the PSP and the bank.
          </p>
          {lastRun && (
            <p className="mt-1 text-xs text-ink/50">
              Last reconciled {new Date(lastRun.runAt).toLocaleString("en-GB")} ({lastRun.source.toLowerCase()})
            </p>
          )}
        </div>
        {canAction && (
          <Button variant="outline" onClick={() => setConfirmRun(true)}>
            Run reconciliation
          </Button>
        )}
      </header>

      {hasExceptions && (
        <div role="alert" className="rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-900">
          <strong>{openExceptions.length} exception{openExceptions.length === 1 ? "" : "s"} detected.</strong>{" "}
          Investigate before further refunds.
          <ul className="mt-2 list-disc pl-5">
            {openExceptions.slice(0, 5).map((e) => (
              <li key={e.id}>
                <Link href="/admin/finance/exceptions" className="underline hover:no-underline">
                  {e.reference}
                </Link>
                {" — "}
                {EXCEPTION_TYPE_LABELS[e.type]}
                {e.amountMinor && e.currency
                  ? ` — ${formatMoney(e.amountMinor, e.currency)}`
                  : ""}
              </li>
            ))}
          </ul>
        </div>
      )}

      {agedExceptions.length > 0 && (
        <div role="alert" className="rounded-lg border border-clay/40 bg-clay/5 p-3 text-sm text-ink">
          <strong>{agedExceptions.length} exception{agedExceptions.length === 1 ? "" : "s"} older than 7 days.</strong>{" "}
          Escalate to Compliance Lead if no resolution within 48 hours.
        </div>
      )}

      <section className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <Kpi
          label="Last run status"
          value={
            lastRun
              ? lastRun.status === "BALANCED"
                ? "Balanced"
                : lastRun.status === "EXCEPTIONS"
                ? `${lastRun.exceptions} exceptions`
                : lastRun.status
              : "—"
          }
          tone={
            lastRun?.status === "BALANCED"
              ? "success"
              : lastRun?.status === "EXCEPTIONS"
              ? "danger"
              : "ink"
          }
        />
        <Kpi
          label="Last run at"
          value={lastRun ? new Date(lastRun.runAt).toLocaleDateString("en-GB") : "—"}
        />
        <Kpi label="Days clean" value={clean} tone={clean >= 7 ? "success" : "clay"} />
        <Kpi label="Matched (last run)" value={matchedTotal} />
        <Kpi
          label="Unmatched (last run)"
          value={unmatchedTotal}
          tone={unmatchedTotal > 0 ? "danger" : "success"}
        />
      </section>

      <section className="rounded-lg border border-ink/10 bg-paper p-5">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink/60">
          Matched vs unmatched (last 30 runs)
        </h2>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="date" stroke="#6B7280" fontSize={12} />
              <YAxis stroke="#6B7280" fontSize={12} />
              <Tooltip formatter={(v) => Number(v ?? 0).toLocaleString()} />
              <Bar dataKey="matched" stackId="a" fill="#2563EB" />
              <Bar dataKey="unmatched" stackId="a" fill="#DC2626" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="mt-2 text-xs text-ink/50">
          Text alternative: {chartData.filter((c) => c.unmatched > 0).length} runs with unmatched entries over the
          last 30 days.
        </p>
      </section>

      <section className="rounded-lg border border-ink/10 bg-paper p-5">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink/60">
          Recent runs
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <caption className="sr-only">Recent reconciliation runs</caption>
            <thead className="bg-ink/5 text-left text-xs uppercase tracking-wide text-ink/60">
              <tr>
                <th scope="col" className="px-4 py-2">Date</th>
                <th scope="col" className="px-4 py-2">Run at</th>
                <th scope="col" className="px-4 py-2">Source</th>
                <th scope="col" className="px-4 py-2">Matched</th>
                <th scope="col" className="px-4 py-2">Unmatched</th>
                <th scope="col" className="px-4 py-2">Exceptions</th>
                <th scope="col" className="px-4 py-2">Duration</th>
                <th scope="col" className="px-4 py-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/5">
              {runs.map((r: ReconciliationRun) => (
                <tr key={r.id} className="hover:bg-ink/5">
                  <td className="px-4 py-3 text-ink/70">
                    {new Date(r.date).toLocaleDateString("en-GB")}
                  </td>
                  <td className="px-4 py-3 text-ink/70">
                    {new Date(r.runAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-ink/10 px-2 py-0.5 text-xs">
                      {r.source}
                    </span>
                  </td>
                  <td className="px-4 py-3">{r.matched}</td>
                  <td className={"px-4 py-3 " + (r.unmatched > 0 ? "text-clay" : "")}>
                    {r.unmatched}
                  </td>
                  <td className={"px-4 py-3 " + (r.exceptions > 0 ? "text-red-600 font-semibold" : "")}>
                    {r.exceptions}
                  </td>
                  <td className="px-4 py-3 text-ink/70">{r.durationSeconds}s</td>
                  <td className="px-4 py-3">
                    <span className={"rounded-full px-2 py-0.5 text-xs " + RUN_TONE[r.status]}>
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-lg border border-ink/10 bg-paper p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-ink/60">
            Current exceptions
          </h2>
          <Link
            href="/admin/finance/exceptions"
            className="text-xs text-sky hover:underline"
          >
            Open exception queue
          </Link>
        </div>
        {exceptions.length === 0 ? (
          <p className="text-sm text-ink/60">No exceptions. Reconciliation is clean.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <caption className="sr-only">Open exceptions</caption>
              <thead className="bg-ink/5 text-left text-xs uppercase tracking-wide text-ink/60">
                <tr>
                  <th scope="col" className="px-4 py-2">Reference</th>
                  <th scope="col" className="px-4 py-2">Type</th>
                  <th scope="col" className="px-4 py-2">Amount</th>
                  <th scope="col" className="px-4 py-2">Age</th>
                  <th scope="col" className="px-4 py-2">Assigned to</th>
                  <th scope="col" className="px-4 py-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/5">
                {exceptions.map((e: ReconciliationException) => (
                  <tr key={e.id} className="hover:bg-ink/5">
                    <td className="px-4 py-3 font-medium text-ink">{e.reference}</td>
                    <td className="px-4 py-3 text-ink/70">{EXCEPTION_TYPE_LABELS[e.type]}</td>
                    <td className="px-4 py-3">
                      {e.amountMinor && e.currency ? formatMoney(e.amountMinor, e.currency) : "—"}
                    </td>
                    <td className={"px-4 py-3 " + (e.ageHours > 24 * 7 ? "text-red-600" : "text-ink/70")}>
                      {Math.round(e.ageHours / 24)}d
                    </td>
                    <td className="px-4 py-3 text-ink/70">{e.assignedTo ?? "—"}</td>
                    <td className="px-4 py-3">
                      <span className={"rounded-full px-2 py-0.5 text-xs " + EXCEPTION_TONE[e.status]}>
                        {EXCEPTION_STATUS_LABELS[e.status]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {confirmRun && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4">
          <div className="w-full max-w-md rounded-lg bg-paper p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-ink">Run reconciliation now?</h3>
            <p className="mt-2 text-sm text-ink/70">
              A new run will be recorded and audited. Reason required.
            </p>
            <label className="mt-4 block text-xs uppercase tracking-wide text-ink/60">Reason</label>
            <select className="mt-1 w-full rounded-md border border-ink/20 bg-white px-3 py-2 text-sm">
              <option>Routine check</option>
              <option>Post-incident verification</option>
              <option>Regulator request</option>
              <option>Other</option>
            </select>
            <div className="mt-5 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setConfirmRun(false)}>Cancel</Button>
              <Button variant="primary" onClick={() => setConfirmRun(false)}>Run now</Button>
            </div>
          </div>
        </div>
      )}
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