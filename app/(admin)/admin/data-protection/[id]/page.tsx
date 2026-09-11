"use client";

import { use, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/button";
import {
  getDSRById, canViewDataProtection, canActionDSR,
  DSR_TYPE_LABELS, DSR_STATUS_LABELS, daysUntil, isOverdue,
} from "@/lib/mock/data-protection";

type Action = null | "extend" | "anonymise" | "complete" | "reject";

export default function DSRCasePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [confirmAction, setConfirmAction] = useState<Action>(null);
  const [note, setNote] = useState("");

  const canView = canViewDataProtection();
  const canAction = canActionDSR();
  const dsr = getDSRById(id);

  if (!canView || !dsr) {
    return (
      <div className="p-6">
        <div className="rounded-lg border border-ink/10 bg-paper p-6 text-sm text-ink/70">
          This DSR does not exist or you do not have access.
        </div>
      </div>
    );
  }

  const overdue = isOverdue(dsr.deadlineAt);
  const dLeft = daysUntil(dsr.deadlineAt);

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-start justify-between">
        <div>
          <Link href="/admin/data-protection" className="text-sm text-sky hover:underline">Back to requests</Link>
          <h1 className="mt-2 text-2xl font-semibold text-ink">{dsr.reference}</h1>
          <p className="mt-1 text-sm text-ink/60">
            {DSR_TYPE_LABELS[dsr.type]} / {dsr.memberName} / {dsr.memberNumber}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className="rounded-full bg-ink/10 px-3 py-1 text-xs">
            {DSR_STATUS_LABELS[dsr.status]}
          </span>
          <span className={overdue ? "text-sm text-red-600" : "text-sm text-ink/60"}>
            {overdue ? `${-dLeft} days overdue` : `Due in ${dLeft} days`}
          </span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <section className="rounded-lg border border-ink/10 bg-paper p-5">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink/60">Request details</h2>
            <dl className="grid gap-3 sm:grid-cols-2 text-sm">
              <Row k="Type" v={DSR_TYPE_LABELS[dsr.type]} />
              <Row k="Scope" v={dsr.scope} />
              <Row k="Received" v={new Date(dsr.receivedAt).toLocaleString("en-GB")} />
              <Row k="Deadline" v={new Date(dsr.deadlineAt).toLocaleDateString("en-GB")} />
              <Row k="Identity verified" v={dsr.identityVerifiedAt ? new Date(dsr.identityVerifiedAt).toLocaleDateString("en-GB") : "Not yet"} />
              <Row k="Extended" v={dsr.extended ? (dsr.extensionReason ?? "Yes") : "No"} />
              <Row k="Completion method" v={dsr.completionMethod ?? "-"} />
              <Row k="Delivery proof" v={dsr.deliveryProof ?? "-"} />
            </dl>
          </section>

          {canAction && (
            <section className="rounded-lg border border-ink/10 bg-paper p-5">
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink/60">Actions</h2>
              <div className="flex flex-wrap gap-2">
                <Button variant="primary" onClick={() => setConfirmAction("complete")}>Complete</Button>
                <Button variant="secondary" onClick={() => setConfirmAction("extend")}>Extend deadline</Button>
                <Button variant="outline" onClick={() => setConfirmAction("anonymise")}>Anonymise</Button>
                <Button variant="destructive" onClick={() => setConfirmAction("reject")}>Reject</Button>
              </div>
              <p className="mt-3 text-xs text-ink/60">Every action here is written to the audit log.</p>
            </section>
          )}

          <section className="rounded-lg border border-ink/10 bg-paper p-5">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink/60">Notes</h2>
            {dsr.notes ? (
              <div className="mb-4 rounded-md bg-ink/5 p-3 text-sm">
                <div className="text-xs text-ink/60">{dsr.assignedTo} / {new Date(dsr.receivedAt).toLocaleDateString("en-GB")}</div>
                <div className="mt-1">{dsr.notes}</div>
              </div>
            ) : (
              <div className="mb-4 text-sm text-ink/60">No notes yet.</div>
            )}
            {canAction && (
              <div className="space-y-2">
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  maxLength={2000}
                  rows={3}
                  placeholder="Add a note..."
                  className="w-full rounded-md border border-ink/20 bg-white px-3 py-2 text-sm"
                />
                <div className="flex justify-end">
                  <Button variant="outline" disabled={!note.trim()} onClick={() => setNote("")}>Add note</Button>
                </div>
              </div>
            )}
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-lg border border-ink/10 bg-paper p-5">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink/60">Timeline</h2>
            <ol className="space-y-3 text-sm">
              {dsr.timeline.map((t) => (
                <li key={t.id} className="border-l-2 border-ink/10 pl-3">
                  <div className="text-xs text-ink/60">
                    {new Date(t.at).toLocaleString("en-GB")} / {t.actor}
                  </div>
                  <div>{t.action}</div>
                </li>
              ))}
            </ol>
          </section>
        </div>
      </div>

      {confirmAction && (
        <InlineConfirm
          title={
            confirmAction === "extend" ? "Extend deadline by 30 days"
            : confirmAction === "anonymise" ? "Anonymise member record?"
            : confirmAction === "complete" ? "Mark as completed?"
            : "Reject this request?"
          }
          description={
            confirmAction === "extend" ? "Can be applied once per request under DPA s.28. Provide a reason."
            : confirmAction === "anonymise" ? "This cannot be undone. Financial records will be retained with a pseudonymous key."
            : confirmAction === "complete" ? "Confirm the response has been delivered with proof."
            : "A recorded reason is required. The member will be notified without disclosing the internal reason."
          }
          confirmVariant={confirmAction === "reject" || confirmAction === "anonymise" ? "destructive" : "primary"}
          onConfirm={() => setConfirmAction(null)}
          onCancel={() => setConfirmAction(null)}
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

function InlineConfirm({
  title, description, confirmVariant, onConfirm, onCancel,
}: {
  title: string; description: string;
  confirmVariant: "primary" | "destructive";
  onConfirm: () => void; onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4">
      <div className="w-full max-w-md rounded-lg bg-paper p-6 shadow-xl">
        <h3 className="text-lg font-semibold text-ink">{title}</h3>
        <p className="mt-2 text-sm text-ink/70">{description}</p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button variant={confirmVariant} onClick={onConfirm}>Confirm</Button>
        </div>
      </div>
    </div>
  );
}