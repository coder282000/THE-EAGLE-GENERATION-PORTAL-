"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/button";
import {
  getSettlements,
  canViewCommerce,
  canActionCommerce,
  formatMoney,
  SETTLEMENT_STATUS_LABELS,
  SETTLEMENT_PSP_LABELS,
  type Settlement,
  type SettlementStatus,
} from "@/lib/mock/commerce";

const STATUS_TONE: Record<SettlementStatus, string> = {
  EXPECTED: "bg-sky/10 text-sky",
  RECEIVED: "bg-green-100 text-green-800",
  OVERDUE: "bg-red-100 text-red-800",
  DISCREPANCY: "bg-clay/15 text-clay",
  CANCELLED: "bg-ink/10 text-ink/70",
};

type ActionKey = null | "received" | "discrepancy";

export default function SettlementsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [pspFilter, setPspFilter] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [action, setAction] = useState<ActionKey>(null);

  const canView = canViewCommerce();
  const canAction = canActionCommerce();
  const all = useMemo(() => getSettlements(), []);

  const filtered = useMemo(() => {
    let r = all;
    if (statusFilter !== "all") r = r.filter((s) => s.status === statusFilter);
    if (pspFilter !== "all") r = r.filter((s) => s.psp === pspFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter((s) => s.reference.toLowerCase().includes(q));
    }
    return r;
  }, [all, search, statusFilter, pspFilter]);

  if (!canView) {
    return (
      <div className="p-6">
        <div className="rounded-lg border border-ink/10 bg-paper p-6 text-sm text-ink/70">
          You do not have permission to view settlements.
        </div>
      </div>
    );
  }

  const settled = all.filter((s) => s.status === "RECEIVED");
  const settledTotal = settled.reduce((s, x) => s + x.netMinor, 0);
  const pending = all.filter((s) => s.status === "EXPECTED");
  const pendingTotal = pending.reduce((s, x) => s + x.netMinor, 0);
  const overdue = all.filter((s) => s.status === "OVERDUE");
  const overdueTotal = overdue.reduce((s, x) => s + x.netMinor, 0);

  const nextExpected = [...all]
    .filter((s) => s.status === "EXPECTED")
    .sort((a, b) => a.expectedAt.localeCompare(b.expectedAt))[0];

  const settledWithDates = settled.filter((s) => s.receivedAt);
  const avgLag =
    settledWithDates.length > 0
      ? Math.round(
          settledWithDates.reduce((sum, s) => {
            const expected = new Date(s.expectedAt).getTime();
            const received = new Date(s.receivedAt!).getTime();
            return sum + (received - expected) / 86400000;
          }, 0) / settledWithDates.length
        )
      : 0;

  const selected = selectedId ? all.find((s) => s.id === selectedId) ?? null : null;

  return (
    <div className="space-y-6 p-6">
      <header>
        <h1 className="text-2xl font-semibold text-ink">Settlements</h1>
        <p className="mt-1 text-sm text-ink/60">
          What the PSP has paid into the TEG account.
        </p>
      </header>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <Kpi label="Settled (all)" value={formatMoney(settledTotal, "KES")} tone="success" />
        <Kpi label="Pending settlement" value={formatMoney(pendingTotal, "KES")} />
        <Kpi
          label="Overdue"
          value={formatMoney(overdueTotal, "KES")}
          tone={overdue.length > 0 ? "danger" : "ink"}
        />
        <Kpi
          label="Next expected"
          value={nextExpected ? new Date(nextExpected.expectedAt).toLocaleDateString("en-GB") : "—"}
        />
        <Kpi
          label="Avg lag"
          value={`${avgLag} day${Math.abs(avgLag) === 1 ? "" : "s"}`}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-lg border border-ink/10 bg-paper">
          <div className="flex flex-wrap gap-3 border-b border-ink/10 p-4">
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search settlement reference"
              className="flex-1 min-w-[200px] rounded-md border border-ink/20 bg-white px-3 py-2 text-sm"
              aria-label="Search settlements"
            />
            <select
              value={pspFilter}
              onChange={(e) => setPspFilter(e.target.value)}
              className="rounded-md border border-ink/20 bg-white px-3 py-2 text-sm"
              aria-label="Filter by PSP"
            >
              <option value="all">All PSPs</option>
              {Object.entries(SETTLEMENT_PSP_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-md border border-ink/20 bg-white px-3 py-2 text-sm"
              aria-label="Filter by status"
            >
              <option value="all">All statuses</option>
              {Object.entries(SETTLEMENT_STATUS_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>

          {filtered.length === 0 ? (
            <div className="p-8 text-center text-sm text-ink/60">
              No settlements in this period.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <caption className="sr-only">Settlement reports</caption>
                <thead className="bg-ink/5 text-left text-xs uppercase tracking-wide text-ink/60">
                  <tr>
                    <th scope="col" className="px-4 py-2">Reference</th>
                    <th scope="col" className="px-4 py-2">PSP</th>
                    <th scope="col" className="px-4 py-2">Period</th>
                    <th scope="col" className="px-4 py-2">Gross</th>
                    <th scope="col" className="px-4 py-2">Fees</th>
                    <th scope="col" className="px-4 py-2">Net</th>
                    <th scope="col" className="px-4 py-2">Expected</th>
                    <th scope="col" className="px-4 py-2">Received</th>
                    <th scope="col" className="px-4 py-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink/5">
                  {filtered.map((s: Settlement) => (
                    <tr
                      key={s.id}
                      onClick={() => { setSelectedId(s.id); setAction(null); }}
                      className={
                        "cursor-pointer hover:bg-ink/5 " +
                        (selectedId === s.id ? "bg-sky/5" : "")
                      }
                    >
                      <td className="px-4 py-3 font-medium text-ink">{s.reference}</td>
                      <td className="px-4 py-3 text-ink/70">
                        {SETTLEMENT_PSP_LABELS[s.psp]}
                      </td>
                      <td className="px-4 py-3 text-xs text-ink/60">
                        {new Date(s.periodFrom).toLocaleDateString("en-GB")} →{" "}
                        {new Date(s.periodTo).toLocaleDateString("en-GB")}
                      </td>
                      <td className="px-4 py-3">{formatMoney(s.grossMinor, s.currency)}</td>
                      <td className="px-4 py-3 text-ink/70">
                        -{formatMoney(s.feesMinor, s.currency)}
                      </td>
                      <td className="px-4 py-3 font-medium">
                        {formatMoney(s.netMinor, s.currency)}
                      </td>
                      <td className="px-4 py-3 text-ink/70">
                        {new Date(s.expectedAt).toLocaleDateString("en-GB")}
                      </td>
                      <td className="px-4 py-3 text-ink/70">
                        {s.receivedAt
                          ? new Date(s.receivedAt).toLocaleDateString("en-GB")
                          : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span className={"rounded-full px-2 py-0.5 text-xs " + STATUS_TONE[s.status]}>
                          {SETTLEMENT_STATUS_LABELS[s.status]}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div>
          {!selected ? (
            <div className="rounded-lg border border-ink/10 bg-paper p-6 text-sm text-ink/60">
              Select a settlement to view details.
            </div>
          ) : (
            <section className="rounded-lg border border-ink/10 bg-paper p-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs text-ink/50">{SETTLEMENT_PSP_LABELS[selected.psp]}</div>
                  <h2 className="mt-1 text-base font-semibold text-ink">
                    {selected.reference}
                  </h2>
                  <div className="mt-1 text-xs text-ink/60">
                    {new Date(selected.periodFrom).toLocaleDateString("en-GB")} →{" "}
                    {new Date(selected.periodTo).toLocaleDateString("en-GB")}
                  </div>
                </div>
                <span className={"rounded-full px-2 py-0.5 text-xs " + STATUS_TONE[selected.status]}>
                  {SETTLEMENT_STATUS_LABELS[selected.status]}
                </span>
              </div>

              <dl className="mt-4 grid gap-3 text-sm">
                <Row k="Gross" v={formatMoney(selected.grossMinor, selected.currency)} />
                <Row k="PSP fees" v={formatMoney(selected.feesMinor, selected.currency)} />
                <Row k="Net" v={formatMoney(selected.netMinor, selected.currency)} />
                <Row
                  k="Transactions"
                  v={selected.transactionCount.toLocaleString()}
                />
                <Row
                  k="Expected"
                  v={new Date(selected.expectedAt).toLocaleDateString("en-GB")}
                />
                {selected.receivedAt && (
                  <Row
                    k="Received"
                    v={new Date(selected.receivedAt).toLocaleString("en-GB")}
                  />
                )}
                {selected.bankReference && (
                  <Row k="Bank reference" v={selected.bankReference} />
                )}
              </dl>

              {canAction && selected.status === "EXPECTED" && (
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button variant="primary" onClick={() => setAction("received")}>
                    Mark received
                  </Button>
                  <Button variant="outline" onClick={() => setAction("discrepancy")}>
                    Flag discrepancy
                  </Button>
                </div>
              )}

              {selected.status === "OVERDUE" && (
                <div className="mt-4 rounded-md border border-red-300 bg-red-50 p-3 text-xs text-red-900">
                  Overdue. Contact the PSP if not received within 48 hours.
                </div>
              )}

              {selected.status === "DISCREPANCY" && (
                <div className="mt-4 rounded-md border border-clay/40 bg-clay/5 p-3 text-xs text-ink">
                  Discrepancy flagged. Awaiting resolution.
                </div>
              )}

              {selected.statementUrl && (
                <div className="mt-4">
                  <Button variant="outline" onClick={() => { /* download */ }}>
                    Download PSP statement
                  </Button>
                </div>
              )}
            </section>
          )}
        </div>
      </div>

      {action && selected && (
        <ActionDialog
          action={action}
          settlement={selected}
          onClose={() => setAction(null)}
        />
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

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <dt className="text-ink/60">{k}</dt>
      <dd>{v}</dd>
    </div>
  );
}

function ActionDialog({
  action,
  settlement,
  onClose,
}: {
  action: Exclude<ActionKey, null>;
  settlement: Settlement;
  onClose: () => void;
}) {
  const [reason, setReason] = useState("");
  const [category, setCategory] = useState("UNDERPAYMENT");

  const titles: Record<Exclude<ActionKey, null>, string> = {
    received: `Mark ${settlement.reference} as received?`,
    discrepancy: `Flag a discrepancy on ${settlement.reference}?`,
  };

  const descriptions: Record<Exclude<ActionKey, null>, string> = {
    received: "The received amount must equal the net amount. If they differ, flag a discrepancy instead.",
    discrepancy: "Choose a reason and describe what happened (min 20 chars). The reconciliation dashboard will pick this up.",
  };

  const needReason = action === "discrepancy" && reason.trim().length < 20;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4">
      <div className="w-full max-w-md rounded-lg bg-paper p-6 shadow-xl">
        <h3 className="text-lg font-semibold text-ink">{titles[action]}</h3>
        <p className="mt-2 text-sm text-ink/70">{descriptions[action]}</p>

        <div className="mt-4 rounded-md border border-ink/10 bg-white p-3 text-sm">
          <div className="flex justify-between">
            <span className="text-ink/60">Expected net</span>
            <span className="font-semibold">
              {formatMoney(settlement.netMinor, settlement.currency)}
            </span>
          </div>
          <div className="mt-1 flex justify-between">
            <span className="text-ink/60">Transactions</span>
            <span>{settlement.transactionCount}</span>
          </div>
        </div>

        {action === "discrepancy" && (
          <>
            <div className="mt-4">
              <label className="block text-xs uppercase tracking-wide text-ink/60">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="mt-1 w-full rounded-md border border-ink/20 bg-white px-3 py-2 text-sm"
              >
                <option value="UNDERPAYMENT">Underpayment</option>
                <option value="OVERPAYMENT">Overpayment</option>
                <option value="MISSING_TRANSFER">Missing transfer</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div className="mt-4">
              <label className="block text-xs uppercase tracking-wide text-ink/60">
                Description (min 20 chars)
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                className="mt-1 w-full rounded-md border border-ink/20 bg-white px-3 py-2 text-sm"
              />
            </div>
          </>
        )}

        <div className="mt-5 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            variant={action === "discrepancy" ? "destructive" : "primary"}
            disabled={needReason}
            onClick={onClose}
          >
            Confirm
          </Button>
        </div>
      </div>
    </div>
  );
}