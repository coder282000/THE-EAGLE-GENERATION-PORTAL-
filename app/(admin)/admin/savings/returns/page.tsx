"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/button";
import {
  getReturns,
  canViewSavings,
  canSubmitReturn,
  RETURN_TYPE_LABELS,
  RETURN_STATUS_LABELS,
  type SaccoReturn,
  type SaccoReturnStatus,
} from "@/lib/mock/savings";
import { getCurrentUser } from "@/lib/mock/current-user";

const STATUS_TONE: Record<SaccoReturnStatus, string> = {
  DRAFT: "bg-ink/10 text-ink/70",
  REVIEWED: "bg-sky/10 text-sky",
  SUBMITTED: "bg-clay/15 text-clay",
  ACCEPTED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800",
  OVERDUE: "bg-red-100 text-red-800",
};

type ActionKey = null | "generate" | "review" | "submit" | "revoke";

export default function SaccoReturnsPage() {
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [action, setAction] = useState<ActionKey>(null);

  const canView = canViewSavings();
  const canSubmit = canSubmitReturn();
  const me = getCurrentUser();
  const isFinanceOnly = me.role === "FINANCE_OFFICER";
  const all = useMemo(() => getReturns(), []);

  const filtered = useMemo(() => {
    let r = all;
    if (typeFilter !== "all") r = r.filter((x) => x.type === typeFilter);
    if (statusFilter !== "all") r = r.filter((x) => x.status === statusFilter);
    return r;
  }, [all, typeFilter, statusFilter]);

  if (!canView) {
    return (
      <div className="p-6">
        <div className="rounded-lg border border-ink/10 bg-paper p-6 text-sm text-ink/70">
          You do not have permission to view regulatory returns.
        </div>
      </div>
    );
  }

  const now = Date.now();
  const dueSoon = all.filter((r) => {
    const due = new Date(r.dueAt).getTime();
    return r.status === "DRAFT" || r.status === "REVIEWED"
      ? due - now <= 30 * 86400000
      : false;
  }).length;
  const overdue = all.filter((r) => new Date(r.dueAt).getTime() < now && r.status !== "ACCEPTED" && r.status !== "SUBMITTED").length;
  const submitted12m = all.filter((r) => r.status === "SUBMITTED" || r.status === "ACCEPTED").length;
  const nextDue = all
    .filter((r) => new Date(r.dueAt).getTime() > now)
    .sort((a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime())[0];

  const selected = selectedId ? all.find((r) => r.id === selectedId) ?? null : null;

  return (
    <div className="space-y-6 p-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-ink">SACCO regulatory returns</h1>
          <p className="mt-1 text-sm text-ink/60">
            Periodic returns required by SASRA, produced from the platform.
          </p>
        </div>
        {canSubmit && (
          <Button variant="primary" onClick={() => setAction("generate")}>
            Generate return
          </Button>
        )}
      </header>

      <div role="note" className="rounded-lg border border-sky/30 bg-sky/5 p-3 text-sm text-ink">
        Submission is a two-person action. The preparer generates and reviews; a separate submitter (Super Admin or Compliance Lead) submits. Both are recorded.
      </div>

      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Kpi label="Returns due (30d)" value={dueSoon} tone={dueSoon > 0 ? "clay" : "ink"} />
        <Kpi label="Returns overdue" value={overdue} tone={overdue > 0 ? "danger" : "success"} />
        <Kpi label="Submitted (12m)" value={submitted12m} tone="success" />
        <Kpi
          label="Next due"
          value={nextDue ? new Date(nextDue.dueAt).toLocaleDateString("en-GB") : "—"}
        />
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-lg border border-ink/10 bg-paper">
          <div className="flex flex-wrap gap-3 border-b border-ink/10 p-4">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="rounded-md border border-ink/20 bg-white px-3 py-2 text-sm"
              aria-label="Filter by return type"
            >
              <option value="all">All return types</option>
              {Object.entries(RETURN_TYPE_LABELS).map(([k, v]) => (
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
              {Object.entries(RETURN_STATUS_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>

          {filtered.length === 0 ? (
            <div className="p-8 text-center text-sm text-ink/60">
              No returns in this view. Generate the first return.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <caption className="sr-only">SACCO regulatory returns</caption>
                <thead className="bg-ink/5 text-left text-xs uppercase tracking-wide text-ink/60">
                  <tr>
                    <th scope="col" className="px-4 py-2">Return</th>
                    <th scope="col" className="px-4 py-2">Period</th>
                    <th scope="col" className="px-4 py-2">Due</th>
                    <th scope="col" className="px-4 py-2">Status</th>
                    <th scope="col" className="px-4 py-2">Prepared by</th>
                    <th scope="col" className="px-4 py-2">Submitted by</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink/5">
                  {filtered.map((r: SaccoReturn) => (
                    <tr
                      key={r.id}
                      onClick={() => { setSelectedId(r.id); setAction(null); }}
                      className={"cursor-pointer hover:bg-ink/5 " + (selectedId === r.id ? "bg-sky/5" : "")}
                    >
                      <td className="px-4 py-3 font-medium text-ink">{RETURN_TYPE_LABELS[r.type]}</td>
                      <td className="px-4 py-3">{r.period}</td>
                      <td className="px-4 py-3 text-ink/70">
                        {new Date(r.dueAt).toLocaleDateString("en-GB")}
                      </td>
                      <td className="px-4 py-3">
                        <span className={"rounded-full px-2 py-0.5 text-xs " + STATUS_TONE[r.status]}>
                          {RETURN_STATUS_LABELS[r.status]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-ink/70">{r.preparedBy ?? "—"}</td>
                      <td className="px-4 py-3 text-ink/70">{r.submittedBy ?? "—"}</td>
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
              Select a return to view details.
            </div>
          ) : (
            <section className="rounded-lg border border-ink/10 bg-paper p-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs text-ink/50">{RETURN_TYPE_LABELS[selected.type]}</div>
                  <h2 className="mt-1 text-base font-semibold text-ink">Period {selected.period}</h2>
                  <div className="mt-1 text-xs text-ink/60">
                    Due {new Date(selected.dueAt).toLocaleDateString("en-GB")}
                  </div>
                </div>
                <span className={"rounded-full px-2 py-0.5 text-xs " + STATUS_TONE[selected.status]}>
                  {RETURN_STATUS_LABELS[selected.status]}
                </span>
              </div>

              <dl className="mt-4 grid gap-3 text-sm">
                {selected.preparedBy && (
                  <Row k="Prepared by" v={`${selected.preparedBy} · ${selected.preparedAt ? new Date(selected.preparedAt).toLocaleDateString("en-GB") : ""}`} />
                )}
                {selected.submittedBy && (
                  <Row k="Submitted by" v={`${selected.submittedBy} · ${selected.submittedAt ? new Date(selected.submittedAt).toLocaleDateString("en-GB") : ""}`} />
                )}
                {selected.regulatorReference && (
                  <Row k="Regulator reference" v={selected.regulatorReference} />
                )}
              </dl>

              {selected.status === "REVIEWED" && canSubmit && (
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button variant="primary" onClick={() => setAction("submit")}>
                    Submit to regulator
                  </Button>
                </div>
              )}

              {selected.status === "DRAFT" && !isFinanceOnly && (
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button variant="outline" onClick={() => setAction("review")}>
                    Mark as reviewed
                  </Button>
                </div>
              )}

              {selected.status === "DRAFT" && isFinanceOnly && (
                <div className="mt-4 rounded-md border border-ink/10 bg-white p-3 text-xs text-ink/60">
                  As Finance Officer you can prepare and review returns. Submission is by a separate authorized user.
                </div>
              )}

              {selected.status === "SUBMITTED" && canSubmit && (
                <div className="mt-4">
                  <Button variant="outline" onClick={() => setAction("revoke")}>
                    Revoke submission
                  </Button>
                </div>
              )}

              {(selected.status === "SUBMITTED" || selected.status === "ACCEPTED") && (
                <div className="mt-4">
                  <div className="rounded-md border border-ink/10 bg-white p-3 text-sm">
                    <div className="text-xs text-ink/60">Submission log</div>
                    <div className="mt-1">
                      {selected.submittedBy} submitted on{" "}
                      {selected.submittedAt ? new Date(selected.submittedAt).toLocaleString("en-GB") : "—"}
                    </div>
                    {selected.regulatorReference && (
                      <div className="mt-1 text-xs text-ink/60">
                        Reference: {selected.regulatorReference}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </section>
          )}
        </div>
      </div>

      {action && (
        <ActionDialog
          action={action}
          selected={selected}
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
  selected,
  onClose,
}: {
  action: Exclude<ActionKey, null>;
  selected: SaccoReturn | null;
  onClose: () => void;
}) {
  const [reason, setReason] = useState("");
  const [typed, setTyped] = useState("");
  const [reference, setReference] = useState("");
  const [period, setPeriod] = useState("");

  const titles: Record<Exclude<ActionKey, null>, string> = {
    generate: "Generate a new return",
    review: "Mark this return as reviewed?",
    submit: `Submit ${selected?.period ?? ""} return?`,
    revoke: "Revoke this submission?",
  };

  const descriptions: Record<Exclude<ActionKey, null>, string> = {
    generate: "Select a return type and period. It will be prepared for review. You will not be able to submit it yourself if you are the Finance Officer.",
    review: "The return will be ready for a separate submitter.",
    submit: "Type the period to confirm. The submission will be recorded with your identity and the timestamp.",
    revoke: "Reason required (min 30 chars). Revocation is only allowed within 24 hours of submission.",
  };

  const needReason = action === "revoke" && reason.trim().length < 30;
  const needTyped = action === "submit" && selected && typed.trim() !== selected.period;
  const needGenerate = action === "generate" && (period.length < 4);
  const destructive = action === "revoke";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4">
      <div className="w-full max-w-md rounded-lg bg-paper p-6 shadow-xl">
        <h3 className="text-lg font-semibold text-ink">{titles[action]}</h3>
        <p className="mt-2 text-sm text-ink/70">{descriptions[action]}</p>

        {action === "generate" && (
          <div className="mt-4 space-y-3">
            <div>
              <label className="block text-xs uppercase tracking-wide text-ink/60">Return type</label>
              <select className="mt-1 w-full rounded-md border border-ink/20 bg-white px-3 py-2 text-sm">
                <option value="MONTHLY_RETURN">Monthly return</option>
                <option value="QUARTERLY_RETURN">Quarterly return</option>
                <option value="ANNUAL_RETURN">Annual return</option>
              </select>
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wide text-ink/60">Period</label>
              <input
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                placeholder="e.g. 2026-10"
                className="mt-1 w-full rounded-md border border-ink/20 bg-white px-3 py-2 text-sm"
              />
            </div>
          </div>
        )}

        {action === "revoke" && (
          <div className="mt-4">
            <label className="block text-xs uppercase tracking-wide text-ink/60">Reason (min 30 chars)</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              className="mt-1 w-full rounded-md border border-ink/20 bg-white px-3 py-2 text-sm"
            />
          </div>
        )}

        {needTyped && selected && (
          <div className="mt-4">
            <label className="block text-xs uppercase tracking-wide text-ink/60">
              Type {selected.period} to confirm
            </label>
            <input
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              className="mt-1 w-full rounded-md border border-ink/20 bg-white px-3 py-2 text-sm font-mono"
            />
          </div>
        )}

        {action === "submit" && (
          <div className="mt-4">
            <label className="block text-xs uppercase tracking-wide text-ink/60">
              Regulator reference (optional)
            </label>
            <input
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              className="mt-1 w-full rounded-md border border-ink/20 bg-white px-3 py-2 text-sm font-mono"
            />
          </div>
        )}

        <div className="mt-5 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            variant={destructive ? "destructive" : "primary"}
            disabled={needReason || needTyped || needGenerate}
            onClick={onClose}
          >
            Confirm
          </Button>
        </div>
      </div>
    </div>
  );
}