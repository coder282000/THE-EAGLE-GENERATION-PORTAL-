"use client";

import { use, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/button";
import {
  getReportById,
  canViewModeration,
  canActionModeration,
  isChapterLeaderScoped,
  REPORT_TYPE_LABELS,
  REPORT_PRIORITY_LABELS,
  REPORT_STATUS_LABELS,
  slaRemainingHours,
  isSlaBreached,
  reportAgeHours,
  type ReportPriority,
  type ReportStatus,
} from "@/lib/mock/moderation";

const PRIORITY_TONE: Record<ReportPriority, string> = {
  CRITICAL: "bg-red-100 text-red-800 border-red-200",
  HIGH: "bg-clay/15 text-clay border-clay/30",
  MEDIUM: "bg-sky/10 text-sky border-sky/20",
  LOW: "bg-ink/5 text-ink/70 border-ink/10",
};

const STATUS_TONE: Record<ReportStatus, string> = {
  OPEN: "bg-sky/10 text-sky",
  IN_REVIEW: "bg-clay/15 text-clay",
  ESCALATED: "bg-red-100 text-red-800",
  RESOLVED: "bg-green-100 text-green-800",
  DISMISSED: "bg-ink/10 text-ink/70",
};

type ActionKey = null | "remove" | "warn" | "suspend" | "escalate" | "dismiss" | "block";

export default function ReportDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [action, setAction] = useState<ActionKey>(null);
  const [noteDraft, setNoteDraft] = useState("");

  const canView = canViewModeration();
  const canAction = canActionModeration();
  const scoped = isChapterLeaderScoped();
  const report = getReportById(id);

  if (!canView || !report) {
    return (
      <div className="p-6">
        <div className="rounded-lg border border-ink/10 bg-paper p-6 text-sm text-ink/70">
          This report does not exist or you do not have access.
        </div>
      </div>
    );
  }

  const breached = isSlaBreached(report.slaDeadlineAt);
  const slaH = slaRemainingHours(report.slaDeadlineAt);
  const ageH = reportAgeHours(report.createdAt);
  const closed = report.status === "RESOLVED" || report.status === "DISMISSED";

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link href="/admin/moderation" className="text-sm text-sky hover:underline">
            Back to queue
          </Link>
          <h1 className="mt-2 text-2xl font-semibold text-ink">{report.reference}</h1>
          <p className="mt-1 text-sm text-ink/60">
            {REPORT_TYPE_LABELS[report.type]} report on {report.targetAuthorName}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="flex gap-2">
            <span className={"inline-block rounded-full border px-2 py-0.5 text-xs " + PRIORITY_TONE[report.priority]}>
              {REPORT_PRIORITY_LABELS[report.priority]}
            </span>
            <span className={"inline-block rounded-full px-2 py-0.5 text-xs " + STATUS_TONE[report.status]}>
              {REPORT_STATUS_LABELS[report.status]}
            </span>
          </div>
          <span className={closed ? "text-sm text-ink/50" : breached ? "text-sm text-red-600" : slaH <= 4 ? "text-sm text-clay" : "text-sm text-ink/60"}>
            {closed ? "Closed" : breached ? `SLA exceeded by ${-slaH}h` : `${slaH}h until SLA`}
          </span>
          <span className="text-xs text-ink/50">Reported {ageH}h ago</span>
        </div>
      </div>

      {scoped && (
        <div className="rounded-lg border border-sky/30 bg-sky/5 p-3 text-sm text-ink">
          You have own-chapter access on this report. Escalation is available; removal and suspension are not.
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <section className="rounded-lg border border-ink/10 bg-paper p-5">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink/60">Reported content</h2>
            <div className="rounded-md border border-ink/10 bg-white p-4 text-sm">
              <p className="text-ink">{report.targetSummary}</p>
              <p className="mt-3 text-xs text-ink/50">
                Author: {report.targetAuthorName}
                {report.targetChapterCode ? ` / ${report.targetChapterCode}` : ""}
              </p>
            </div>
          </section>

          <section className="rounded-lg border border-ink/10 bg-paper p-5">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink/60">Reported by</h2>
            <dl className="grid gap-3 sm:grid-cols-2 text-sm">
              <Row k="Member" v={report.reportedByName} />
              <Row k="When" v={new Date(report.createdAt).toLocaleString("en-GB")} />
              <Row k="Prior reports on target" v={String(report.priorReportsOnTarget)} />
            </dl>
            {report.reporterNote && (
              <div className="mt-4 rounded-md bg-ink/5 p-3 text-sm">
                <div className="text-xs uppercase tracking-wide text-ink/60">Reporter note</div>
                <div className="mt-1">{report.reporterNote}</div>
              </div>
            )}
          </section>

          <section className="rounded-lg border border-ink/10 bg-paper p-5">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink/60">Internal notes</h2>
            {report.notes.length === 0 ? (
              <p className="text-sm text-ink/60">No internal notes yet.</p>
            ) : (
              <ul className="space-y-3">
                {report.notes.map((n) => (
                  <li key={n.id} className="rounded-md bg-ink/5 p-3 text-sm">
                    <div className="text-xs text-ink/60">{n.author} / {new Date(n.at).toLocaleString("en-GB")}</div>
                    <div className="mt-1">{n.body}</div>
                  </li>
                ))}
              </ul>
            )}
            {canAction && (
              <div className="mt-4 space-y-2">
                <textarea
                  value={noteDraft}
                  onChange={(e) => setNoteDraft(e.target.value)}
                  rows={3}
                  maxLength={2000}
                  placeholder="Add a note..."
                  className="w-full rounded-md border border-ink/20 bg-white px-3 py-2 text-sm"
                />
                <div className="flex justify-end">
                  <Button variant="outline" disabled={!noteDraft.trim()} onClick={() => setNoteDraft("")}>
                    Add note
                  </Button>
                </div>
              </div>
            )}
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-lg border border-ink/10 bg-paper p-5">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink/60">Actions</h2>
            {!canAction && !scoped && (
              <p className="text-sm text-ink/60">Read-only access. You cannot action this report.</p>
            )}
            <div className="flex flex-col gap-2">
              {canAction && (
                <>
                  <Button variant="primary" onClick={() => setAction("remove")}>Remove content</Button>
                  <Button variant="secondary" onClick={() => setAction("warn")}>Warn member</Button>
                  <Button variant="outline" onClick={() => setAction("suspend")}>Suspend member</Button>
                  <Button variant="outline" onClick={() => setAction("escalate")}>Escalate to safeguarding</Button>
                  <Button variant="outline" onClick={() => setAction("dismiss")}>Dismiss report</Button>
                  <Button variant="destructive" onClick={() => setAction("block")}>Block target</Button>
                </>
              )}
              {!canAction && scoped && (
                <Button variant="outline" onClick={() => setAction("escalate")}>Escalate to safeguarding</Button>
              )}
            </div>
            {(canAction || scoped) && (
              <p className="mt-3 text-xs text-ink/60">Every action here is written to the audit log.</p>
            )}
          </section>

          <section className="rounded-lg border border-ink/10 bg-paper p-5">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink/60">Timeline</h2>
            <ol className="space-y-3 text-sm">
              <li className="border-l-2 border-ink/10 pl-3">
                <div className="text-xs text-ink/60">{new Date(report.createdAt).toLocaleString("en-GB")}</div>
                <div>Report created</div>
              </li>
              {report.assignedTo && (
                <li className="border-l-2 border-ink/10 pl-3">
                  <div className="text-xs text-ink/60">Assigned to {report.assignedTo}</div>
                </li>
              )}
              {report.notes.map((n) => (
                <li key={"tl-" + n.id} className="border-l-2 border-ink/10 pl-3">
                  <div className="text-xs text-ink/60">{new Date(n.at).toLocaleString("en-GB")} / {n.author}</div>
                  <div>{n.body.slice(0, 80)}{n.body.length > 80 ? "..." : ""}</div>
                </li>
              ))}
            </ol>
          </section>
        </div>
      </div>

      {action && (
        <ActionDialog
          action={action}
          targetName={report.targetAuthorName}
          onClose={() => setAction(null)}
        />
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
  targetName,
  onClose,
}: {
  action: Exclude<ActionKey, null>;
  targetName: string;
  onClose: () => void;
}) {
  const [reason, setReason] = useState("");
  const [typed, setTyped] = useState("");

  const titles: Record<Exclude<ActionKey, null>, string> = {
    remove: "Remove this content?",
    warn: `Send a warning to ${targetName}?`,
    suspend: `Suspend ${targetName}?`,
    escalate: "Escalate to safeguarding?",
    dismiss: "Dismiss this report?",
    block: `Block ${targetName}?`,
  };

  const descriptions: Record<Exclude<ActionKey, null>, string> = {
    remove: "The author will be notified and the content will be hidden from the community. Reason is recorded.",
    warn: "The member will see your message. Reason is recorded.",
    suspend: "The member will be locked out immediately. A reason is required and audited. Type the member name to confirm.",
    escalate: "The case moves to restricted handling. The reporter is not notified. Reason required.",
    dismiss: "No action will be taken. Reason required (min 10 characters).",
    block: "The member cannot contact you or appear in your feed. This is audited.",
  };

  const needsReason = action !== "block";
  const needsTyped = action === "suspend" || action === "block";
  const destructive = action === "suspend" || action === "block" || action === "escalate";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4">
      <div className="w-full max-w-md rounded-lg bg-paper p-6 shadow-xl">
        <h3 className="text-lg font-semibold text-ink">{titles[action]}</h3>
        <p className="mt-2 text-sm text-ink/70">{descriptions[action]}</p>

        {needsReason && (
          <div className="mt-4">
            <label className="block text-xs uppercase tracking-wide text-ink/60">Reason</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              className="mt-1 w-full rounded-md border border-ink/20 bg-white px-3 py-2 text-sm"
            />
          </div>
        )}

        {needsTyped && (
          <div className="mt-4">
            <label className="block text-xs uppercase tracking-wide text-ink/60">
              Type {targetName} to confirm
            </label>
            <input
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              className="mt-1 w-full rounded-md border border-ink/20 bg-white px-3 py-2 text-sm"
            />
          </div>
        )}

        <div className="mt-5 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            variant={destructive ? "destructive" : "primary"}
            onClick={onClose}
            disabled={(needsReason && reason.trim().length < 10) || (needsTyped && typed.trim() !== targetName)}
          >
            Confirm
          </Button>
        </div>
      </div>
    </div>
  );
}