"use client";

import { use, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/button";
import {
  getSafeguardingCaseById,
  canViewSafeguarding,
  SAFEGUARDING_SEVERITY_LABELS,
  SAFEGUARDING_STATUS_LABELS,
  type SafeguardingSeverity,
  type SafeguardingStatus,
} from "@/lib/mock/moderation";
import { getCurrentUser } from "@/lib/mock/current-user";

const SEVERITY_TONE: Record<SafeguardingSeverity, string> = {
  CRITICAL: "bg-red-100 text-red-800 border-red-200",
  HIGH: "bg-clay/15 text-clay border-clay/30",
  MEDIUM: "bg-sky/10 text-sky border-sky/20",
  LOW: "bg-ink/5 text-ink/70 border-ink/10",
};

const STATUS_TONE: Record<SafeguardingStatus, string> = {
  OPEN: "bg-sky/10 text-sky",
  INVESTIGATING: "bg-clay/15 text-clay",
  AWAITING_AUTHORITY: "bg-ink/10 text-ink/70",
  CLOSED: "bg-green-100 text-green-800",
};

type ActionKey =
  | null
  | "narrative"
  | "authority"
  | "escalate"
  | "restrict"
  | "notify"
  | "close"
  | "export"
  | "reassign";

export default function SafeguardingCasePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [action, setAction] = useState<ActionKey>(null);

  const canView = canViewSafeguarding();
  const me = getCurrentUser();
  const privileged = me.role === "SUPER_ADMIN" || me.role === "COMPLIANCE_LEAD";
  const handler = me.capabilities?.includes("SAFEGUARDING_HANDLER") ?? false;
  const c = getSafeguardingCaseById(id);

  if (!canView || !c) {
    return (
      <div className="p-6">
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-sm text-red-900">
          This case does not exist or you are not assigned to it.
        </div>
      </div>
    );
  }

  const isClosed = c.status === "CLOSED";
  const ageDays = Math.max(1, Math.round((Date.now() - new Date(c.createdAt).getTime()) / 86400000));

  return (
    <div className="space-y-6 p-6">
      <div role="alert" className="sticky top-0 z-10 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-900">
        <strong>Restricted case.</strong> Every action and every view is logged. Do not share case details outside the assigned handler team.
      </div>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link href="/admin/moderation/safeguarding" className="text-sm text-sky hover:underline">
            Back to cases
          </Link>
          <h1 className="mt-2 text-2xl font-semibold text-ink">{c.reference}</h1>
          <p className="mt-1 text-sm text-ink/60">
            Subject: {c.subjectName}
            {c.reporterName && ` / Reporter: ${c.reporterName}`}
          </p>
          <p className="mt-1 text-xs text-ink/50">Open {ageDays} day{ageDays === 1 ? "" : "s"}</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="flex gap-2">
            <span className={"inline-block rounded-full border px-2 py-0.5 text-xs " + SEVERITY_TONE[c.severity]}>
              {SAFEGUARDING_SEVERITY_LABELS[c.severity]}
            </span>
            <span className={"inline-block rounded-full px-2 py-0.5 text-xs " + STATUS_TONE[c.status]}>
              {SAFEGUARDING_STATUS_LABELS[c.status]}
            </span>
            {c.isMinor && (
              <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-800">Minor</span>
            )}
          </div>
          <span className="text-xs text-ink/60">
            {c.assignedTo ? `Handler: ${c.assignedTo}` : "Unassigned"}
          </span>
          {c.reportId && (
            <Link href={`/admin/moderation/${c.reportId}`} className="text-xs text-sky hover:underline">
              Source report
            </Link>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <section className="rounded-lg border border-ink/10 bg-paper p-5">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink/60">Case summary</h2>
            <dl className="grid gap-3 sm:grid-cols-2 text-sm">
              <Row k="Reference" v={c.reference} />
              <Row k="Status" v={SAFEGUARDING_STATUS_LABELS[c.status]} />
              <Row k="Severity" v={SAFEGUARDING_SEVERITY_LABELS[c.severity]} />
              <Row k="Person at risk" v={c.subjectName} />
              <Row k="Is minor" v={c.isMinor ? "Yes" : "No"} />
              <Row k="Opened" v={new Date(c.createdAt).toLocaleString("en-GB")} />
              {c.closedAt && <Row k="Closed" v={new Date(c.closedAt).toLocaleString("en-GB")} />}
              {c.closedReason && <Row k="Closed reason" v={c.closedReason} />}
            </dl>
          </section>

          <section className="rounded-lg border border-ink/10 bg-paper p-5">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink/60">Narrative</h2>
            {c.narrative.length === 0 ? (
              <p className="text-sm text-ink/60">No narrative entries yet.</p>
            ) : (
              <ul className="space-y-3">
                {c.narrative.map((n) => (
                  <li key={n.id} className="rounded-md bg-ink/5 p-3 text-sm">
                    <div className="text-xs text-ink/60">
                      {n.category} / {n.author} / {new Date(n.at).toLocaleString("en-GB")}
                    </div>
                    <div className="mt-1">{n.body}</div>
                  </li>
                ))}
              </ul>
            )}
            {handler && !isClosed && (
              <div className="mt-4">
                <Button variant="outline" onClick={() => setAction("narrative")}>Add narrative entry</Button>
              </div>
            )}
          </section>

          <section className="rounded-lg border border-ink/10 bg-paper p-5">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink/60">External authority log</h2>
            {c.authorityLog.length === 0 ? (
              <p className="text-sm text-ink/60">No external authority contact recorded.</p>
            ) : (
              <ul className="space-y-3">
                {c.authorityLog.map((a) => (
                  <li key={a.id} className="rounded-md border border-ink/10 p-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-ink">{a.authority}</span>
                      <span className="text-xs text-ink/50">{new Date(a.at).toLocaleString("en-GB")}</span>
                    </div>
                    <div className="mt-1 text-xs text-ink/60">Method: {a.method} / By: {a.by}</div>
                    <div className="mt-2">{a.summary}</div>
                    <div className="mt-1 text-ink/70">Outcome: {a.outcome}</div>
                  </li>
                ))}
              </ul>
            )}
            {handler && !isClosed && (
              <div className="mt-4">
                <Button variant="outline" onClick={() => setAction("authority")}>Log authority contact</Button>
              </div>
            )}
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-lg border border-ink/10 bg-paper p-5">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink/60">Actions</h2>
            {!handler && !privileged && (
              <p className="text-sm text-ink/60">Read-only access. You cannot action this case.</p>
            )}

            <div className="flex flex-col gap-2">
              {handler && !isClosed && (
                <>
                  <Button variant="outline" onClick={() => setAction("escalate")}>Escalate severity</Button>
                  <Button variant="destructive" onClick={() => setAction("restrict")}>Restrict member</Button>
                  <Button variant="secondary" onClick={() => setAction("notify")}>Notify Compliance Lead</Button>
                  <Button variant="primary" onClick={() => setAction("close")}>Close case</Button>
                </>
              )}
              {privileged && (
                <>
                  <Button variant="outline" onClick={() => setAction("reassign")}>Reassign handler</Button>
                  <Button variant="outline" onClick={() => setAction("export")}>Export case</Button>
                </>
              )}
            </div>

            {(handler || privileged) && (
              <p className="mt-3 text-xs text-ink/60">
                Every action here is written to the audit log.
                {isClosed && " This case is closed."}
              </p>
            )}
          </section>

          <section className="rounded-lg border border-ink/10 bg-paper p-5">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink/60">Case timeline</h2>
            <ol className="space-y-3 text-sm">
              <li className="border-l-2 border-ink/10 pl-3">
                <div className="text-xs text-ink/60">{new Date(c.createdAt).toLocaleString("en-GB")}</div>
                <div>Case opened</div>
              </li>
              {c.narrative.map((n) => (
                <li key={"tl-" + n.id} className="border-l-2 border-ink/10 pl-3">
                  <div className="text-xs text-ink/60">{new Date(n.at).toLocaleString("en-GB")} / {n.author}</div>
                  <div>{n.category}: {n.body.slice(0, 60)}{n.body.length > 60 ? "..." : ""}</div>
                </li>
              ))}
              {c.authorityLog.map((a) => (
                <li key={"tl-a-" + a.id} className="border-l-2 border-ink/10 pl-3">
                  <div className="text-xs text-ink/60">{new Date(a.at).toLocaleString("en-GB")} / {a.by}</div>
                  <div>Authority contact: {a.authority}</div>
                </li>
              ))}
              {c.closedAt && (
                <li className="border-l-2 border-red-200 pl-3">
                  <div className="text-xs text-ink/60">{new Date(c.closedAt).toLocaleString("en-GB")}</div>
                  <div>Case closed</div>
                </li>
              )}
            </ol>
          </section>
        </div>
      </div>

      {action && (
        <ActionDialog action={action} subjectName={c.subjectName} onClose={() => setAction(null)} />
      )}
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
  subjectName,
  onClose,
}: {
  action: Exclude<ActionKey, null>;
  subjectName: string;
  onClose: () => void;
}) {
  const [reason, setReason] = useState("");
  const [typed, setTyped] = useState("");
  const [category, setCategory] = useState("OBSERVATION");

  const titles: Record<Exclude<ActionKey, null>, string> = {
    narrative: "Add narrative entry",
    authority: "Log authority contact",
    escalate: "Escalate severity",
    restrict: `Restrict ${subjectName}?`,
    notify: "Notify Compliance Lead",
    close: "Close this case?",
    export: "Export this case?",
    reassign: "Reassign handler",
  };

  const descriptions: Record<Exclude<ActionKey, null>, string> = {
    narrative: "Record an observation, action, or outcome. Minimum 20 characters.",
    authority: "Record contact with an external authority. Include authority name, method, summary and outcome.",
    escalate: "Escalation notifies the Compliance Lead immediately. Minimum 30 characters.",
    restrict: "The member is locked out immediately. Type the subject name to confirm.",
    notify: "Sends a restricted notification to the Compliance Lead. No reason required.",
    close: "Closing requires Compliance Lead sign-off. Minimum 50 characters. This is audited.",
    export: "The export is watermarked with your identity and the timestamp. It is audited.",
    reassign: "Select a new handler from the safeguarding team.",
  };

  const needsReason =
    action === "narrative" ? reason.trim().length < 20
    : action === "escalate" ? reason.trim().length < 30
    : action === "close" ? reason.trim().length < 50
    : action === "authority" ? reason.trim().length < 20
    : false;

  const needsTyped = action === "restrict" && typed.trim() !== subjectName;

  const destructive = action === "restrict" || action === "close";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4">
      <div className="w-full max-w-lg rounded-lg bg-paper p-6 shadow-xl">
        <h3 className="text-lg font-semibold text-ink">{titles[action]}</h3>
        <p className="mt-2 text-sm text-ink/70">{descriptions[action]}</p>

        {action === "narrative" && (
          <div className="mt-4">
            <label className="block text-xs uppercase tracking-wide text-ink/60">Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)}
              className="mt-1 w-full rounded-md border border-ink/20 bg-white px-3 py-2 text-sm">
              <option value="OBSERVATION">Observation</option>
              <option value="ACTION">Action</option>
              <option value="OUTCOME">Outcome</option>
            </select>
          </div>
        )}

        {(action === "narrative" || action === "authority" || action === "escalate" || action === "close") && (
          <div className="mt-4">
            <label className="block text-xs uppercase tracking-wide text-ink/60">
              {action === "authority" ? "Summary and outcome" : "Reason"}
            </label>
            <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={4}
              className="mt-1 w-full rounded-md border border-ink/20 bg-white px-3 py-2 text-sm" />
          </div>
        )}

        {needsTyped && (
          <div className="mt-4">
            <label className="block text-xs uppercase tracking-wide text-ink/60">
              Type {subjectName} to confirm
            </label>
            <input value={typed} onChange={(e) => setTyped(e.target.value)}
              className="mt-1 w-full rounded-md border border-ink/20 bg-white px-3 py-2 text-sm" />
          </div>
        )}

        <div className="mt-5 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            variant={destructive ? "destructive" : "primary"}
            disabled={needsReason || needsTyped}
            onClick={onClose}
          >
            Confirm
          </Button>
        </div>
      </div>
    </div>
  );
}