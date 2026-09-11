"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/button";
import {
  getExceptions,
  canViewCommerce,
  canActionCommerce,
  formatMoney,
  EXCEPTION_TYPE_LABELS,
  EXCEPTION_STATUS_LABELS,
  type ReconciliationException,
  type ExceptionStatus,
  type ExceptionType,
} from "@/lib/mock/commerce";

const STATUS_TONE: Record<ExceptionStatus, string> = {
  OPEN: "bg-sky/10 text-sky",
  INVESTIGATING: "bg-clay/15 text-clay",
  RESOLVED: "bg-green-100 text-green-800",
  ESCALATED: "bg-red-100 text-red-800",
};

const TYPE_TONE: Record<ExceptionType, string> = {
  MISSING_IN_LEDGER: "bg-red-100 text-red-800",
  MISSING_IN_PSP: "bg-clay/15 text-clay",
  AMOUNT_MISMATCH: "bg-clay/15 text-clay",
  DUPLICATE: "bg-red-100 text-red-800",
  ORPHANED: "bg-ink/10 text-ink/70",
};

type ActionKey = null | "resolve" | "escalate" | "assign";

export default function ExceptionQueuePage() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [action, setAction] = useState<ActionKey>(null);

  const canView = canViewCommerce();
  const canAction = canActionCommerce();
  const all = useMemo(() => getExceptions(), []);

  const filtered = useMemo(() => {
    let r = all;
    if (typeFilter !== "all") r = r.filter((e) => e.type === typeFilter);
    if (statusFilter !== "all") r = r.filter((e) => e.status === statusFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter(
        (e) =>
          e.reference.toLowerCase().includes(q) ||
          (e.pspReference ?? "").toLowerCase().includes(q)
      );
    }
    return r;
  }, [all, search, typeFilter, statusFilter]);

  if (!canView) {
    return (
      <div className="p-6">
        <div className="rounded-lg border border-ink/10 bg-paper p-6 text-sm text-ink/70">
          You do not have permission to view exceptions.
        </div>
      </div>
    );
  }

  const open = all.filter((e) => e.status === "OPEN" || e.status === "INVESTIGATING");
  const aged = open.filter((e) => e.ageHours > 24 * 7);
  const escalated = all.filter((e) => e.status === "ESCALATED");
  const resolved = all.filter((e) => e.status === "RESOLVED");
  const medianResolve = resolved.length > 0 ? Math.round(resolved.reduce((s, e) => s + e.ageHours, 0) / resolved.length) : 0;

  const selected = selectedId ? all.find((e) => e.id === selectedId) ?? null : null;

  return (
    <div className="space-y-6 p-6">
      <header>
        <h1 className="text-2xl font-semibold text-ink">Exception queue</h1>
        <p className="mt-1 text-sm text-ink/60">
          Resolve mismatches between the ledger and the PSP.
        </p>
      </header>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <Kpi label="Open" value={open.length} tone={open.length > 0 ? "clay" : "success"} />
        <Kpi label="Aged (7d+)" value={aged.length} tone={aged.length > 0 ? "danger" : "ink"} />
        <Kpi label="Escalated" value={escalated.length} tone={escalated.length > 0 ? "danger" : "ink"} />
        <Kpi label="Resolved (all)" value={resolved.length} tone="success" />
        <Kpi label="Median time to resolve" value={`${medianResolve}h`} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-lg border border-ink/10 bg-paper">
          <div className="flex flex-wrap gap-3 border-b border-ink/10 p-4">
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search reference or PSP ref"
              className="flex-1 min-w-[200px] rounded-md border border-ink/20 bg-white px-3 py-2 text-sm"
              aria-label="Search exceptions"
            />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="rounded-md border border-ink/20 bg-white px-3 py-2 text-sm"
              aria-label="Filter by type"
            >
              <option value="all">All types</option>
              {Object.entries(EXCEPTION_TYPE_LABELS).map(([k, v]) => (
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
              {Object.entries(EXCEPTION_STATUS_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>

          {filtered.length === 0 ? (
            <div className="p-8 text-center text-sm text-ink/60">
              No exceptions. Reconciliation is clean.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <caption className="sr-only">Reconciliation exceptions</caption>
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
                  {filtered.map((e: ReconciliationException) => {
                    const days = Math.round(e.ageHours / 24);
                    return (
                      <tr
                        key={e.id}
                        onClick={() => { setSelectedId(e.id); setAction(null); }}
                        className={
                          "cursor-pointer hover:bg-ink/5 " +
                          (selectedId === e.id ? "bg-sky/5" : "")
                        }
                      >
                        <td className="px-4 py-3 font-medium text-ink">{e.reference}</td>
                        <td className="px-4 py-3">
                          <span className={"rounded-full px-2 py-0.5 text-xs " + TYPE_TONE[e.type]}>
                            {EXCEPTION_TYPE_LABELS[e.type]}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {e.amountMinor && e.currency
                            ? formatMoney(e.amountMinor, e.currency)
                            : "—"}
                        </td>
                        <td className={"px-4 py-3 " + (days > 7 ? "text-red-600 font-semibold" : "text-ink/70")}>
                          {days}d
                        </td>
                        <td className="px-4 py-3 text-ink/70">{e.assignedTo ?? "—"}</td>
                        <td className="px-4 py-3">
                          <span className={"rounded-full px-2 py-0.5 text-xs " + STATUS_TONE[e.status]}>
                            {EXCEPTION_STATUS_LABELS[e.status]}
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

        <div>
          {!selected ? (
            <div className="rounded-lg border border-ink/10 bg-paper p-6 text-sm text-ink/60">
              Select an exception to investigate.
            </div>
          ) : (
            <section className="rounded-lg border border-ink/10 bg-paper p-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs text-ink/50">{EXCEPTION_TYPE_LABELS[selected.type]}</div>
                  <h2 className="mt-1 text-base font-semibold text-ink">{selected.reference}</h2>
                  <div className="mt-1 text-xs text-ink/60">
                    Opened {new Date(selected.createdAt).toLocaleDateString("en-GB")} ({Math.round(selected.ageHours / 24)}d ago)
                  </div>
                </div>
                <span className={"rounded-full px-2 py-0.5 text-xs " + STATUS_TONE[selected.status]}>
                  {EXCEPTION_STATUS_LABELS[selected.status]}
                </span>
              </div>

              <dl className="mt-4 grid gap-3 text-sm">
                {selected.amountMinor && selected.currency && (
                  <Row k="Amount" v={formatMoney(selected.amountMinor, selected.currency)} />
                )}
                {selected.pspReference && <Row k="PSP reference" v={selected.pspReference} />}
                {selected.assignedTo && <Row k="Assigned to" v={selected.assignedTo} />}
              </dl>

              {selected.pspEvidence && (
                <div className="mt-4 rounded-md border border-ink/10 bg-white p-3 text-sm">
                  <div className="text-xs text-ink/60">PSP evidence</div>
                  <div className="mt-1">{selected.pspEvidence}</div>
                </div>
              )}

              {selected.transactionId && (
                <div className="mt-3">
                  <Link
                    href={`/admin/finance/transactions/${selected.transactionId}`}
                    className="text-xs text-sky hover:underline"
                  >
                    Open related transaction
                  </Link>
                </div>
              )}

              {selected.resolution && (
                <div className="mt-4 rounded-md border border-green-600/30 bg-green-50 p-3 text-sm">
                  <div className="text-xs text-green-800">Resolution</div>
                  <div className="mt-1 text-green-900">{selected.resolution}</div>
                  {selected.resolvedBy && (
                    <div className="mt-1 text-xs text-green-800">
                      Resolved by {selected.resolvedBy}
                      {selected.resolvedAt && ` on ${new Date(selected.resolvedAt).toLocaleDateString("en-GB")}`}
                    </div>
                  )}
                </div>
              )}

              {canAction && selected.status !== "RESOLVED" && selected.status !== "ESCALATED" && (
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button variant="primary" onClick={() => setAction("resolve")}>
                    Resolve
                  </Button>
                  <Button variant="outline" onClick={() => setAction("escalate")}>
                    Escalate
                  </Button>
                  <Button variant="outline" onClick={() => setAction("assign")}>
                    Assign
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
          exception={selected}
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
  exception,
  onClose,
}: {
  action: Exclude<ActionKey, null>;
  exception: ReconciliationException;
  onClose: () => void;
}) {
  const [reason, setReason] = useState("");
  const [resolutionType, setResolutionType] = useState("MATCHED_MANUALLY");
  const [typed, setTyped] = useState("");
  const [assignee, setAssignee] = useState("Miriam K.");

  const titles: Record<Exclude<ActionKey, null>, string> = {
    resolve: `Resolve ${exception.reference}?`,
    escalate: `Escalate ${exception.reference}?`,
    assign: `Assign ${exception.reference}?`,
  };

  const descriptions: Record<Exclude<ActionKey, null>, string> = {
    resolve: "Choose a resolution type and describe what happened (min 30 chars). Type the reference to confirm.",
    escalate: "This will notify the Compliance Lead. Reason required (min 30 chars).",
    assign: "Select a handler for this exception.",
  };

  const needReason =
    (action === "resolve" && reason.trim().length < 30) ||
    (action === "escalate" && reason.trim().length < 30);
  const needTyped = action === "resolve" && typed.trim() !== exception.reference;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4">
      <div className="w-full max-w-md rounded-lg bg-paper p-6 shadow-xl">
        <h3 className="text-lg font-semibold text-ink">{titles[action]}</h3>
        <p className="mt-2 text-sm text-ink/70">{descriptions[action]}</p>

        {action === "resolve" && (
          <>
            <div className="mt-4">
              <label className="block text-xs uppercase tracking-wide text-ink/60">
                Resolution type
              </label>
              <select
                value={resolutionType}
                onChange={(e) => setResolutionType(e.target.value)}
                className="mt-1 w-full rounded-md border border-ink/20 bg-white px-3 py-2 text-sm"
              >
                <option value="MATCHED_MANUALLY">Matched manually</option>
                <option value="CREATED_ADJUSTMENT">Created adjustment</option>
                <option value="PSP_ERROR">PSP error</option>
                <option value="FALSE_POSITIVE">False positive</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div className="mt-4">
              <label className="block text-xs uppercase tracking-wide text-ink/60">
                Reason (min 30 chars)
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                className="mt-1 w-full rounded-md border border-ink/20 bg-white px-3 py-2 text-sm"
              />
            </div>
            <div className="mt-4">
              <label className="block text-xs uppercase tracking-wide text-ink/60">
                Type {exception.reference} to confirm
              </label>
              <input
                value={typed}
                onChange={(e) => setTyped(e.target.value)}
                className="mt-1 w-full rounded-md border border-ink/20 bg-white px-3 py-2 text-sm font-mono"
              />
            </div>
          </>
        )}

        {action === "escalate" && (
          <div className="mt-4">
            <label className="block text-xs uppercase tracking-wide text-ink/60">
              Reason (min 30 chars)
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              className="mt-1 w-full rounded-md border border-ink/20 bg-white px-3 py-2 text-sm"
            />
          </div>
        )}

        {action === "assign" && (
          <div className="mt-4">
            <label className="block text-xs uppercase tracking-wide text-ink/60">
              Assign to
            </label>
            <select
              value={assignee}
              onChange={(e) => setAssignee(e.target.value)}
              className="mt-1 w-full rounded-md border border-ink/20 bg-white px-3 py-2 text-sm"
            >
              <option>Miriam K. (Finance Officer)</option>
              <option>Solomon A. (Super Admin)</option>
              <option>James O. (Compliance Lead)</option>
            </select>
          </div>
        )}

        <div className="mt-5 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            variant={action === "escalate" ? "destructive" : "primary"}
            disabled={needReason || needTyped}
            onClick={onClose}
          >
            Confirm
          </Button>
        </div>
      </div>
    </div>
  );
}