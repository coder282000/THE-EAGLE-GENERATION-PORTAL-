"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Button } from "@/components/button";
import {
  getSnapshots,
  getReconciliationRuns,
  canViewSavings,
  canActionSavings,
  formatMoney,
  drift,
  totalMemberFunds,
  totalOperatingFunds,
  daysClean,
  SEGREGATION_STATUS_LABELS,
  type SegregationSnapshot,
  type ReconciliationRun,
  type SegregationStatus,
} from "@/lib/mock/savings";

const ResponsiveContainer = dynamic(
  () => import("recharts").then((m) => m.ResponsiveContainer),
  { ssr: false }
);
const LineChart = dynamic(() => import("recharts").then((m) => m.LineChart), { ssr: false });
const Line = dynamic(() => import("recharts").then((m) => m.Line), { ssr: false });
const BarChart = dynamic(() => import("recharts").then((m) => m.BarChart), { ssr: false });
const Bar = dynamic(() => import("recharts").then((m) => m.Bar), { ssr: false });
const XAxis = dynamic(() => import("recharts").then((m) => m.XAxis), { ssr: false });
const YAxis = dynamic(() => import("recharts").then((m) => m.YAxis), { ssr: false });
const Tooltip = dynamic(() => import("recharts").then((m) => m.Tooltip), { ssr: false });
const CartesianGrid = dynamic(() => import("recharts").then((m) => m.CartesianGrid), { ssr: false });

const STATUS_TONE: Record<SegregationStatus, string> = {
  BALANCED: "bg-green-100 text-green-800",
  EXCEPTIONS: "bg-red-100 text-red-800",
  INCOMPLETE: "bg-clay/15 text-clay",
};

export default function SegregationDashboardPage() {
  const [confirmRun, setConfirmRun] = useState(false);

  const canView = canViewSavings();
  const canAction = canActionSavings();
  const snapshots = useMemo(() => getSnapshots(), []);
  const runs = useMemo(() => getReconciliationRuns(), []);

  if (!canView) {
    return (
      <div className="p-6">
        <div className="rounded-lg border border-ink/10 bg-paper p-6 text-sm text-ink/70">
          You do not have permission to view member-fund segregation.
        </div>
      </div>
    );
  }

  const memberFunds = totalMemberFunds();
  const operatingFunds = totalOperatingFunds();
  const clean = daysClean();
  const lastRun = runs[0];
  const exceptions = snapshots.filter((s) => s.status === "EXCEPTIONS");
  const hasExceptions = exceptions.length > 0;

  // Chart: member vs operating funds. We derive a simple series from the runs
  // in real life; here we use a small synthetic snapshot for visual shape.
  const fundsSeries = [
    { date: "D-6", member: memberFunds - 12000000, operating: operatingFunds - 2000000 },
    { date: "D-5", member: memberFunds - 9000000, operating: operatingFunds - 1500000 },
    { date: "D-4", member: memberFunds - 6000000, operating: operatingFunds - 1000000 },
    { date: "D-3", member: memberFunds - 4000000, operating: operatingFunds - 500000 },
    { date: "D-2", member: memberFunds - 2000000, operating: operatingFunds },
    { date: "D-1", member: memberFunds - 500000, operating: operatingFunds },
    { date: "Today", member: memberFunds, operating: operatingFunds },
  ];

  const exceptionSeries = runs
    .slice(0, 30)
    .map((r: ReconciliationRun) => ({ date: r.date.slice(5, 10), exceptions: r.exceptions }))
    .reverse();

  return (
    <div className="space-y-6 p-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Member-fund segregation</h1>
          <p className="mt-1 text-sm text-ink/60">
            Daily proof that member funds are ring-fenced from operating funds.
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
          <strong>{exceptions.length} exception{exceptions.length === 1 ? "" : "s"} detected.</strong>{" "}
          Investigate before further payouts on the affected circles.
          <ul className="mt-2 list-disc pl-5">
            {exceptions.map((e) => (
              <li key={e.id}>
                <Link
                  href={`/admin/savings/circles/${e.circleId}`}
                  className="underline hover:no-underline"
                >
                  {e.circleName}
                </Link>{" "}
                — drift {formatMoney(drift(e), e.currency)}
              </li>
            ))}
          </ul>
        </div>
      )}

      <section className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <Kpi label="Member funds held" value={formatMoney(memberFunds, "KES")} />
        <Kpi label="Operating funds held" value={formatMoney(operatingFunds, "KES")} />
        <Kpi
          label="Status"
          value={hasExceptions ? `${exceptions.length} exceptions` : "Balanced"}
          tone={hasExceptions ? "danger" : "success"}
        />
        <Kpi
          label="Last reconciled"
          value={lastRun ? new Date(lastRun.runAt).toLocaleDateString("en-GB") : "—"}
        />
        <Kpi label="Days clean" value={clean} tone={clean >= 7 ? "success" : "clay"} />
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-lg border border-ink/10 bg-paper p-5">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink/60">
            Member vs operating funds (last 7 days)
          </h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={fundsSeries.map((p) => ({
                date: p.date,
                member: Math.round(p.member / 100),
                operating: Math.round(p.operating / 100),
              }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="date" stroke="#6B7280" fontSize={12} />
                <YAxis stroke="#6B7280" fontSize={12} />
                <Tooltip formatter={(v) => `KES ${Number(v ?? 0).toLocaleString("en-KE")}`} />
                <Line type="monotone" dataKey="member" stroke="#2563EB" strokeWidth={2} dot={false} name="Member funds" />
                <Line type="monotone" dataKey="operating" stroke="#7C3AED" strokeWidth={2} dot={false} name="Operating funds" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-2 text-xs text-ink/50">
            Text alternative: member funds held {formatMoney(memberFunds, "KES")}, operating funds held{" "}
            {formatMoney(operatingFunds, "KES")}.
          </p>
        </section>

        <section className="rounded-lg border border-ink/10 bg-paper p-5">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink/60">
            Exceptions over time (last 30 runs)
          </h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={exceptionSeries}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="date" stroke="#6B7280" fontSize={12} />
                <YAxis stroke="#6B7280" fontSize={12} />
                <Tooltip formatter={(v) => Number(v ?? 0).toLocaleString()} />
                <Bar dataKey="exceptions" fill="#DC2626" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-2 text-xs text-ink/50">
            Text alternative: {exceptionSeries.filter((s) => s.exceptions > 0).length} runs with exceptions over the
            last 30 days.
          </p>
        </section>
      </div>

      <section className="rounded-lg border border-ink/10 bg-paper p-5">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink/60">
          Current segregation snapshot
        </h2>
        {snapshots.length === 0 ? (
          <p className="text-sm text-ink/60">Reconciliation has not run yet. It runs nightly at 02:00.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <caption className="sr-only">Segregation snapshot per circle</caption>
              <thead className="bg-ink/5 text-left text-xs uppercase tracking-wide text-ink/60">
                <tr>
                  <th scope="col" className="px-4 py-2">Circle</th>
                  <th scope="col" className="px-4 py-2">Member funds</th>
                  <th scope="col" className="px-4 py-2">External balance</th>
                  <th scope="col" className="px-4 py-2">Drift</th>
                  <th scope="col" className="px-4 py-2">Reconciled</th>
                  <th scope="col" className="px-4 py-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/5">
                {snapshots.map((s: SegregationSnapshot) => {
                  const d = drift(s);
                  return (
                    <tr key={s.id} className="hover:bg-ink/5">
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/savings/circles/${s.circleId}`}
                          className="text-sky hover:underline"
                        >
                          {s.circleName}
                        </Link>
                      </td>
                      <td className="px-4 py-3">{formatMoney(s.memberFundsMinor, s.currency)}</td>
                      <td className="px-4 py-3">{formatMoney(s.externalBalanceMinor, s.currency)}</td>
                      <td className={"px-4 py-3 " + (d !== 0 ? "text-red-600 font-semibold" : "text-ink/70")}>
                        {formatMoney(d, s.currency)}
                      </td>
                      <td className="px-4 py-3 text-ink/70">
                        {new Date(s.reconciledAt).toLocaleString("en-GB")}
                      </td>
                      <td className="px-4 py-3">
                        <span className={"rounded-full px-2 py-0.5 text-xs " + STATUS_TONE[s.status]}>
                          {SEGREGATION_STATUS_LABELS[s.status]}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="rounded-lg border border-ink/10 bg-paper p-5">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink/60">
          Recent reconciliation runs
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
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/5">
              {runs.map((r: ReconciliationRun) => (
                <tr key={r.id} className="hover:bg-ink/5">
                  <td className="px-4 py-3 text-ink/70">
                    {new Date(r.date).toLocaleDateString("en-GB")}
                  </td>
                  <td className="px-4 py-3 text-ink/70">
                    {new Date(r.runAt).toLocaleString("en-GB")}
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {confirmRun && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4">
          <div className="w-full max-w-md rounded-lg bg-paper p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-ink">Run reconciliation now?</h3>
            <p className="mt-2 text-sm text-ink/70">
              A snapshot will be recorded and audited. Reason required.
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