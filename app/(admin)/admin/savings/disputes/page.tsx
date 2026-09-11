"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/button";
import {
  getDisputes,
  canViewSavings,
  canActionSavings,
  isCircleLeaderScoped,
  formatMoney,
  DISPUTE_PRIORITY_LABELS,
  DISPUTE_STATUS_LABELS,
  type Dispute,
  type DisputePriority,
  type DisputeStatus,
} from "@/lib/mock/savings";

const PRIORITY_TONE: Record<DisputePriority, string> = {
  HIGH: "bg-red-100 text-red-800",
  MEDIUM: "bg-clay/15 text-clay",
  LOW: "bg-ink/10 text-ink/70",
};

const STATUS_TONE: Record<DisputeStatus, string> = {
  OPEN: "bg-sky/10 text-sky",
  INVESTIGATING: "bg-clay/15 text-clay",
  AWAITING_RESPONSE: "bg-ink/10 text-ink/70",
  RESOLVED: "bg-green-100 text-green-800",
  WITHDRAWN: "bg-ink/10 text-ink/50",
};

type ActionKey = null | "assign" | "note" | "resolve" | "withdraw" | "escalate";

export default function DisputesPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [action, setAction] = useState<ActionKey>(null);

  const canView = canViewSavings();
  const canAction = canActionSavings();
  const scoped = isCircleLeaderScoped();
  const all = useMemo(() => getDisputes(), []);

  const filtered = useMemo(() => {
    let r = all;
    if (statusFilter !== "all") r = r.filter((d) => d.status === statusFilter);
    if (priorityFilter !== "all") r = r.filter((d) => d.priority === priorityFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter(
        (d) =>
          d.reference.toLowerCase().includes(q) ||
          d.subject.toLowerCase().includes(q) ||
          d.circleName.toLowerCase().includes(q) ||
          d.raisedByMemberNumber.toLowerCase().includes(q)
      );
    }
    return r;
  }, [all, search, statusFilter, priorityFilter]);

  if (!canView) {
    return (
      <div className="p-6">
        <div className="rounded-lg border border-ink/10 bg-paper p-6 text-sm text-ink/70">
          You do not have permission to view disputes.
        </div>
      </div>
    );
  }

  const open = all.filter((d) => d.status === "OPEN" || d.status === "INVESTIGATING" || d.status === "AWAITING_RESPONSE");
  const high = open.filter((d) => d.priority === "HIGH");
  const resolved = all.filter((d) => d.status === "RESOLVED");
  const selected = selectedId ? all.find((d) => d.id === selectedId) ?? null : null;

  return (
    <div className="space-y-6 p-6">
      <header>
        <h1 className="text-2xl font-semibold text-ink">Disputes</h1>
        <p className="mt-1 text-sm text-ink/60">
          Resolve member and leader disputes on savings circles.
        </p>
      </header>

      {scoped && (
        <div role="note" className="rounded-lg border border-sky/30 bg-sky/5 p-3 text-sm text-ink">
          Own-circle scope: you see only disputes on circles you lead. You can add notes but cannot resolve.
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Kpi label="Open" value={open.length} tone={open.length > 0 ? "clay" : "ink"} />
        <Kpi label="High priority" value={high.length} tone={high.length > 0 ? "danger" : "ink"} />
        <Kpi
          label="Median time to resolve"
          value={resolved.length > 0 ? "62h" : "—"}
        />
        <Kpi label="Resolved" value={resolved.length} tone="success" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="rounded-lg border border-ink/10 bg-paper">
            <div className="flex flex-wrap gap-3 border-b border-ink/10 p-4">
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search reference, subject, circle, member"
                className="flex-1 min-w-[220px] rounded-md border border-ink/20 bg-white px-3 py-2 text-sm"
                aria-label="Search disputes"
              />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-md border border-ink/20 bg-white px-3 py-2 text-sm"
                aria-label="Filter by status"
              >
                <option value="all">All statuses</option>
                {Object.entries(DISPUTE_STATUS_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="rounded-md border border-ink/20 bg-white px-3 py-2 text-sm"
                aria-label="Filter by priority"
              >
                <option value="all">All priorities</option>
                {Object.entries(DISPUTE_PRIORITY_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>

            {filtered.length === 0 ? (
              <div className="p-8 text-center text-sm text-ink/60">
                No disputes in this period.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <caption className="sr-only">Savings disputes</caption>
                  <thead className="bg-ink/5 text-left text-xs uppercase tracking-wide text-ink/60">
                    <tr>
                      <th scope="col" className="px-4 py-2">Reference</th>
                      <th scope="col" className="px-4 py-2">Circle</th>
                      <th scope="col" className="px-4 py-2">Subject</th>
                      <th scope="col" className="px-4 py-2">Priority</th>
                      <th scope="col" className="px-4 py-2">Age</th>
                      <th scope="col" className="px-4 py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ink/5">
                    {filtered.map((d: Dispute) => (
                      <tr
                        key={d.id}
                        onClick={() => { setSelectedId(d.id); setAction(null); }}
                        className={"cursor-pointer hover:bg-ink/5 " + (selectedId === d.id ? "bg-sky/5" : "")}
                      >
                        <td className="px-4 py-3 font-medium text-ink">{d.reference}</td>
                        <td className="px-4 py-3">
                          <Link
                            href={`/admin/savings/circles/${d.circleId}`}
                            className="text-sky hover:underline"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {d.circleName}
                          </Link>
                        </td>
                        <td className="px-4 py-3 max-w-[280px] truncate text-ink/70" title={d.subject}>
                          {d.subject}
                        </td>
                        <td className="px-4 py-3">
                          <span className={"rounded-full px-2 py-0.5 text-xs " + PRIORITY_TONE[d.priority]}>
                            {DISPUTE_PRIORITY_LABELS[d.priority]}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-ink/70">
                          {Math.round((Date.now() - new Date(d.createdAt).getTime()) / 3600000)}h
                        </td>
                        <td className="px-4 py-3">
                          <span className={"rounded-full px-2 py-0.5 text-xs " + STATUS_TONE[d.status]}>
                            {DISPUTE_STATUS_LABELS[d.status]}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div>
          {!selected ? (
            <div className="rounded-lg border border-ink/10 bg-paper p-6 text-sm text-ink/60">
              Select a dispute to open the workspace.
            </div>
          ) : (
            <section className="rounded-lg border border-ink/10 bg-paper p-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs text-ink/50">{selected.reference}</div>
                  <h2 className="mt-1 text-base font-semibold text-ink">{selected.subject}</h2>
                  <div className="mt-1 text-xs text-ink/60">
                    {selected.circleName} / Raised by {selected.raisedByMemberNumber}
                  </div>
                </div>
                <span className={"rounded-full px-2 py-0.5 text-xs " + STATUS_TONE[selected.status]}>
                  {DISPUTE_STATUS_LABELS[selected.status]}
                </span>
              </div>

              <p className="mt-3 text-sm text-ink/80">{selected.description}</p>

              {selected.amountMinor && selected.currency && (
                <div className="mt-3 rounded-md border border-ink/10 bg-white p-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-ink/60">Disputed amount</span>
                    <span className="font-semibold">
                      {formatMoney(selected.amountMinor, selected.currency)}
                    </span>
                  </div>
                  {selected.ledgerEntryId && (
                    <div className="mt-1 flex justify-between">
                      <span className="text-ink/60">Ledger entry</span>
                      <span className="font-mono text-xs">{selected.ledgerEntryId}</span>
                    </div>
                  )}
                </div>
              )}

              {canAction && selected.status !== "RESOLVED" && selected.status !== "WITHDRAWN" && (
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button variant="outline" onClick={() => setAction("note")}>Add note</Button>
                  {!scoped && (
                    <>
                      <Button variant="primary" onClick={() => setAction("resolve")}>Resolve</Button>
                      <Button variant="outline" onClick={() => setAction("escalate")}>Escalate</Button>
                    </>
                  )}
                </div>
              )}

              <div className="mt-5">
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink/60">
                  Narrative
                </h3>
                {selected.narrative.length === 0 ? (
                  <p className="text-sm text-ink/60">No narrative entries yet.</p>
                ) : (
                  <ul className="space-y-3">
                    {selected.narrative.map((n) => (
                      <li key={n.id} className="border-l-2 border-ink/10 pl-3 text-sm">
                        <div className="text-xs text-ink/60">
                          {new Date(n.at).toLocaleString("en-GB")} / {n.actor}
                        </div>
                        <div className="mt-1">{n.body}</div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {selected.resolvedAt && (
                <div className="mt-4 rounded-md border border-green-600/30 bg-green-50 p-3 text-sm">
                  <div className="text-xs text-green-800">
                    Resolved {new Date(selected.resolvedAt).toLocaleString("en-GB")}
                  </div>
                  {selected.resolution && (
                    <div className="mt-1 text-green-900">{selected.resolution}</div>
                  )}
                </div>
              )}
            </section>
          )}
        </div>
      </div>

      {action && selected && (
        <ActionDialog
          action={action}
          dispute={selected}
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

function ActionDialog({
  action,
  dispute,
  onClose,
}: {
  action: Exclude<ActionKey, null>;
  dispute: Dispute;
  onClose: () => void;
}) {
  const [body, setBody] = useState("");
  const [typed, setTyped] = useState("");

  const titles: Record<Exclude<ActionKey, null>, string> = {
    assign: "Assign to a handler",
    note: "Add narrative note",
    resolve: `Resolve dispute ${dispute.reference}?`,
    withdraw: "Withdraw this dispute?",
    escalate: "Escalate to compliance?",
  };

  const minLen = action === "resolve" ? 30 : action === "escalate" ? 20 : 10;
  const needReason = action !== "assign" && body.trim().length < minLen;
  const needTyped = action === "resolve" && typed.trim() !== dispute.reference;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4">
      <div className="w-full max-w-md rounded-lg bg-paper p-6 shadow-xl">
        <h3 className="text-lg font-semibold text-ink">{titles[action]}</h3>

        {action === "assign" && (
          <div className="mt-4">
            <label className="block text-xs uppercase tracking-wide text-ink/60">Assign to</label>
            <select className="mt-1 w-full rounded-md border border-ink/20 bg-white px-3 py-2 text-sm">
              <option>Miriam K. (Finance Officer)</option>
              <option>Solomon A. (Super Admin)</option>
              <option>James O. (Compliance Lead)</option>
            </select>
          </div>
        )}

        {(action === "note" || action === "resolve" || action === "escalate" || action === "withdraw") && (
          <div className="mt-4">
            <label className="block text-xs uppercase tracking-wide text-ink/60">
              {action === "note" ? "Note" : `Reason (min ${minLen} chars)`}
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={4}
              className="mt-1 w-full rounded-md border border-ink/20 bg-white px-3 py-2 text-sm"
            />
          </div>
        )}

        {needTyped && (
          <div className="mt-4">
            <label className="block text-xs uppercase tracking-wide text-ink/60">
              Type {dispute.reference} to confirm
            </label>
            <input
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              className="mt-1 w-full rounded-md border border-ink/20 bg-white px-3 py-2 text-sm font-mono"
            />
          </div>
        )}

        <div className="mt-5 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            variant={action === "resolve" || action === "withdraw" ? "primary" : "outline"}
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