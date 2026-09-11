"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/button";
import {
  getRefunds,
  canViewCommerce,
  canApproveRefund,
  formatMoney,
  refundAgeHours,
  TRANSACTION_SURFACE_LABELS,
  REFUND_STATUS_LABELS,
  type Refund,
  type RefundStatus,
} from "@/lib/mock/commerce";
import { getCurrentUser } from "@/lib/mock/current-user";

const STATUS_TONE: Record<RefundStatus, string> = {
  PENDING: "bg-clay/15 text-clay",
  APPROVED: "bg-sky/10 text-sky",
  REJECTED: "bg-red-100 text-red-800",
  EXECUTED: "bg-green-100 text-green-800",
  FAILED: "bg-red-100 text-red-800",
};

type ActionKey = null | "approve" | "reject" | "info";

export default function RefundApprovalsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("PENDING");
  const [action, setAction] = useState<ActionKey>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const canView = canViewCommerce();
  const me = getCurrentUser();
  const all = useMemo(() => getRefunds(), []);

  const filtered = useMemo(() => {
    let r = all;
    if (statusFilter !== "ALL") r = r.filter((x) => x.status === statusFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter(
        (x) =>
          x.reference.toLowerCase().includes(q) ||
          x.memberNumber.toLowerCase().includes(q) ||
          x.transactionReference.toLowerCase().includes(q)
      );
    }
    return r;
  }, [all, search, statusFilter]);

  if (!canView) {
    return (
      <div className="p-6">
        <div className="rounded-lg border border-ink/10 bg-paper p-6 text-sm text-ink/70">
          You do not have permission to view refunds.
        </div>
      </div>
    );
  }

  const pending = all.filter((r) => r.status === "PENDING");
  const pendingAmount = pending.reduce((s, r) => s + r.amountMinor, 0);
  const approvedToday = all.filter(
    (r) => r.approvedAt && new Date(r.approvedAt).toDateString() === new Date().toDateString()
  ).length;
  const oldestPending = pending.length
    ? Math.max(...pending.map((r) => refundAgeHours(r.createdAt)))
    : 0;

  const selectedRefund = selectedId ? all.find((r) => r.id === selectedId) ?? null : null;

  return (
    <div className="space-y-6 p-6">
      <header>
        <h1 className="text-2xl font-semibold text-ink">Refund approvals</h1>
        <p className="mt-1 text-sm text-ink/60">
          Approve refunds. A second approver is required.
        </p>
      </header>

      <div role="note" className="rounded-lg border border-clay/40 bg-clay/5 p-3 text-sm text-ink">
        You cannot approve a refund you requested. The database enforces this.
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Kpi label="Pending" value={pending.length} tone={pending.length > 0 ? "clay" : "ink"} />
        <Kpi label="Pending amount" value={formatMoney(pendingAmount, "KES")} />
        <Kpi label="Approved today" value={approvedToday} tone="success" />
        <Kpi label="Oldest pending" value={`${oldestPending}h`} tone={oldestPending > 24 ? "danger" : "ink"} />
      </div>

      <div className="rounded-lg border border-ink/10 bg-paper">
        <div className="flex flex-wrap gap-3 border-b border-ink/10 p-4">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search reference, member, transaction"
            className="flex-1 min-w-[240px] rounded-md border border-ink/20 bg-white px-3 py-2 text-sm"
            aria-label="Search refunds"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-md border border-ink/20 bg-white px-3 py-2 text-sm"
            aria-label="Filter by status"
          >
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
            <option value="EXECUTED">Executed</option>
            <option value="ALL">All statuses</option>
          </select>
        </div>

        {filtered.length === 0 ? (
          <div className="p-8 text-center text-sm text-ink/60">
            No refunds awaiting approval.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <caption className="sr-only">Refunds</caption>
              <thead className="bg-ink/5 text-left text-xs uppercase tracking-wide text-ink/60">
                <tr>
                  <th scope="col" className="px-4 py-2">Reference</th>
                  <th scope="col" className="px-4 py-2">Transaction</th>
                  <th scope="col" className="px-4 py-2">Member no.</th>
                  <th scope="col" className="px-4 py-2">Surface</th>
                  <th scope="col" className="px-4 py-2">Amount</th>
                  <th scope="col" className="px-4 py-2">Requested by</th>
                  <th scope="col" className="px-4 py-2">Age</th>
                  <th scope="col" className="px-4 py-2">Status</th>
                  <th scope="col" className="px-4 py-2"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/5">
                {filtered.map((r: Refund) => {
                  const age = refundAgeHours(r.createdAt);
                  const initiatorIsMe = r.initiatedBy === me.name;
                  const canAct = r.status === "PENDING" && !initiatorIsMe;
                  return (
                    <tr key={r.id} className="hover:bg-ink/5">
                      <td className="px-4 py-3 font-medium text-ink">{r.reference}</td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/finance/transactions/${r.transactionId}`}
                          className="text-sky hover:underline"
                        >
                          {r.transactionReference}
                        </Link>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs">{r.memberNumber}</td>
                      <td className="px-4 py-3 text-ink/70">
                        {TRANSACTION_SURFACE_LABELS[r.surface]}
                      </td>
                      <td className="px-4 py-3">{formatMoney(r.amountMinor, r.currency)}</td>
                      <td className="px-4 py-3 text-ink/70">{r.initiatedBy}</td>
                      <td className={"px-4 py-3 " + (age > 24 ? "text-clay" : "text-ink/70")}>
                        {age}h
                      </td>
                      <td className="px-4 py-3">
                        <span className={"rounded-full px-2 py-0.5 text-xs " + STATUS_TONE[r.status]}>
                          {REFUND_STATUS_LABELS[r.status]}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {r.status === "PENDING" && (
                          <div className="flex gap-1">
                            <Button
                              variant="primary"
                              disabled={!canAct}
                              aria-disabled={!canAct}
                              title={
                                initiatorIsMe
                                  ? "You initiated this refund. A different approver is required."
                                  : undefined
                              }
                              onClick={() => { setSelectedId(r.id); setAction("approve"); }}
                            >
                              Approve
                            </Button>
                            <Button
                              variant="destructive"
                              disabled={!canAct}
                              onClick={() => { setSelectedId(r.id); setAction("reject"); }}
                            >
                              Reject
                            </Button>
                            <Button
                              variant="outline"
                              disabled={!canAct}
                              onClick={() => { setSelectedId(r.id); setAction("info"); }}
                            >
                              Info
                            </Button>
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
      </div>

      {action && selectedRefund && (
        <ActionDialog
          action={action}
          refund={selectedRefund}
          onClose={() => { setAction(null); setSelectedId(null); }}
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

function ActionDialog({
  action,
  refund,
  onClose,
}: {
  action: Exclude<ActionKey, null>;
  refund: Refund;
  onClose: () => void;
}) {
  const [reason, setReason] = useState("");

  const titles: Record<Exclude<ActionKey, null>, string> = {
    approve: `Approve refund ${refund.reference}?`,
    reject: `Reject refund ${refund.reference}?`,
    info: `Request more information on ${refund.reference}?`,
  };

  const descriptions: Record<Exclude<ActionKey, null>, string> = {
    approve: `The PSP will be instructed to refund ${formatMoney(refund.amountMinor, refund.currency)}. A reversing ledger pair will be created and the member notified.`,
    reject: "The requester will be notified. A reason is required (min 20 characters).",
    info: "The refund stays pending until the requester responds.",
  };

  const needReason = action === "reject" && reason.trim().length < 20;
  const destructive = action === "reject";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4">
      <div className="w-full max-w-md rounded-lg bg-paper p-6 shadow-xl">
        <h3 className="text-lg font-semibold text-ink">{titles[action]}</h3>
        <p className="mt-2 text-sm text-ink/70">{descriptions[action]}</p>

        <div className="mt-4 rounded-md border border-ink/10 bg-white p-3 text-sm">
          <div className="flex justify-between">
            <span className="text-ink/60">Transaction</span>
            <span className="font-mono text-xs">{refund.transactionReference}</span>
          </div>
          <div className="mt-1 flex justify-between">
            <span className="text-ink/60">Member no.</span>
            <span className="font-mono text-xs">{refund.memberNumber}</span>
          </div>
          <div className="mt-1 flex justify-between">
            <span className="text-ink/60">Amount</span>
            <span className="font-semibold">{formatMoney(refund.amountMinor, refund.currency)}</span>
          </div>
          <div className="mt-1 flex justify-between">
            <span className="text-ink/60">Requested by</span>
            <span>{refund.initiatedBy}</span>
          </div>
          <div className="mt-2 text-xs text-ink/60">{refund.reason}</div>
        </div>

        {(action === "reject" || action === "approve") && (
          <div className="mt-4">
            <label className="block text-xs uppercase tracking-wide text-ink/60">
              {action === "reject" ? "Reason (min 20 chars)" : "Note (optional)"}
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              className="mt-1 w-full rounded-md border border-ink/20 bg-white px-3 py-2 text-sm"
            />
          </div>
        )}

        <div className="mt-5 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            variant={destructive ? "destructive" : "primary"}
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