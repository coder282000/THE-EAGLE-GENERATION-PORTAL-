"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/button";
import { DetailSection, DetailField } from "@/components/applications/detail-section";
import {
  AuditTrail,
  type AuditEntry,
} from "@/components/applications/audit-trail";
import {
  NotesPanel,
  type Note,
} from "@/components/applications/notes-panel";
import { ApplicationStatusStepper } from "@/components/applications/application-status-stepper";
import {
  getApplicationById,
  getApplicationNotes,
  canScheduleInterview,
  canRecordOutcome,
  canDecideApplication,
  canAddNote,
  canReverseDecision,
  APPLICATION_STATUS_LABELS,
  APPLICATION_TIER_LABELS,
  type Application,
  type ApplicationNote,
} from "@/lib/mock/applications";
import type { ApplicationRecommendation } from "@/components/mock/data";
import {
  ArrowLeft,
  ShieldAlert,
  Calendar,
  ClipboardCheck,
  CheckCircle2,
  RotateCcw,
} from "lucide-react";

const REVERSAL_WINDOW_MS = 30 * 24 * 60 * 60 * 1000;

const RECOMMENDATION_LABELS: Record<ApplicationRecommendation, string> = {
  STRONG_YES: "Strong yes",
  YES: "Yes",
  NO: "No",
  STRONG_NO: "Strong no",
};

export default function ApplicationDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const app = useMemo(
    () => (params.id ? getApplicationById(params.id) : null),
    [params.id]
  );
  const notes = useMemo(
    () => (params.id ? getApplicationNotes(params.id) : []),
    [params.id]
  );

  const [localNotes, setLocalNotes] = useState<Note[] | null>(null);
  const [reverseOpen, setReverseOpen] = useState(false);
  const [reverseReason, setReverseReason] = useState("");
  const [reverseError, setReverseError] = useState<string | null>(null);
  const [reverseBusy, setReverseBusy] = useState(false);

  const effectiveNotes: Note[] = localNotes ?? notes;

  if (!app) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16">
        <Card className="p-8 text-center">
          <h1 className="font-display text-xl text-ink-900">Application not found</h1>
          <p className="mt-2 text-sm text-ink-500">
            The application does not exist, or you do not have permission to view it.
          </p>
          <div className="mt-6">
            <Link href="/admin/applications">
              <Button variant="primary">Back to applications</Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  const canSchedule = canScheduleInterview();
  const canOutcome = canRecordOutcome();
  const canDecide = canDecideApplication();
  const canNote = canAddNote();
  const canReverse = canReverseDecision();
  const reversalAvailable =
    canReverse &&
    app.status === "REJECTED" &&
    !!app.decidedAt &&
    Date.now() - new Date(app.decidedAt).getTime() < REVERSAL_WINDOW_MS;

  const auditEntries = buildAuditEntries(app, effectiveNotes);

  const handleAddNote = async (body: string) => {
    // Mock — in production POST /api/v1/admin/applications/:id/notes
    await new Promise((r) => setTimeout(r, 400));
    const next: Note = {
      id: `note_${Date.now().toString(36)}`,
      authorId: "current_user",
      authorName: "You",
      body,
      createdAt: new Date().toISOString(),
    };
    setLocalNotes((prev) => [next, ...(prev ?? notes)]);
  };

  const handleReverse = async () => {
    setReverseError(null);
    if (reverseReason.trim().length < 10) {
      setReverseError("A reason of at least 10 characters is required.");
      return;
    }
    setReverseBusy(true);
    await new Promise((r) => setTimeout(r, 500));
    // In production POST /api/v1/admin/applications/:id/reopen
    setReverseBusy(false);
    setReverseOpen(false);
    setReverseReason("");
    alert("Application reopened (mock).");
    router.refresh();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <Link
            href="/admin/applications"
            className="inline-flex items-center gap-1 text-sm text-ink-500 hover:text-ink-700"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Applications
          </Link>
          <h1 className="mt-2 font-display text-2xl font-semibold tracking-tight text-ink-900">
            {app.firstName} {app.lastName}
          </h1>
          <p className="mt-1 text-sm text-ink-500">
            <span className="font-mono">{app.reference}</span>
            <span className="mx-2 text-ink-300">·</span>
            {APPLICATION_TIER_LABELS[app.tier]}
            <span className="mx-2 text-ink-300">·</span>
            {app.chapter}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {reversalAvailable && (
            <Button variant="outline" onClick={() => setReverseOpen(true)}>
              <RotateCcw className="mr-2 h-4 w-4" aria-hidden="true" />
              Reverse decision
            </Button>
          )}
          {canSchedule && (app.status === "UNDER_REVIEW" || app.status === "SUBMITTED") && (
            <Link href={`/admin/applications/${app.id}/schedule`}>
              <Button variant="outline">
                <Calendar className="mr-2 h-4 w-4" aria-hidden="true" />
                Schedule interview
              </Button>
            </Link>
          )}
          {canOutcome && app.status === "INTERVIEW_SCHEDULED" && (
            <Link href={`/admin/applications/${app.id}/outcome`}>
              <Button variant="outline">
                <ClipboardCheck className="mr-2 h-4 w-4" aria-hidden="true" />
                Record outcome
              </Button>
            </Link>
          )}
          {canDecide && (app.status === "INTERVIEWED" || app.status === "UNDER_REVIEW") && (
            <Link href={`/admin/applications/${app.id}/decide`}>
              <Button variant="primary">
                <CheckCircle2 className="mr-2 h-4 w-4" aria-hidden="true" />
                Decide
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Stepper */}
      <Card className="p-6">
        <ApplicationStatusStepper
          status={app.status}
          reopened={!!app.reopenedAt}
        />
        {app.status === "LAPSED" && (
          <p className="mt-4 text-sm text-ink-500">
            This application auto-expired {formatDate(app.expiresAt)} without action.
          </p>
        )}
      </Card>

      {/* Body */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main */}
        <div className="space-y-6 lg:col-span-2">
          <DetailSection title="Applicant">
            <DetailField label="Full name" value={`${app.firstName} ${app.lastName}`} />
            <DetailField label="Email" value={app.email} />
            <DetailField
              label="Phone"
              value={app.phone ?? "—"}
              empty={!app.phone}
            />
            <DetailField label="Date of birth" value={formatDate(app.dateOfBirth)} />
            <DetailField
              label="Membership tier"
              value={APPLICATION_TIER_LABELS[app.tier]}
            />
            <DetailField label="Chapter preference" value={app.chapter} />
          </DetailSection>

          <DetailSection title="Pillar interests">
            {app.pillarInterest.length === 0 ? (
              <DetailField label="" value="None selected" empty />
            ) : (
              <div className="col-span-full flex flex-wrap gap-2">
                {app.pillarInterest.map((p) => (
                  <span
                    key={p}
                    className="rounded-full bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700"
                  >
                    {p}
                  </span>
                ))}
              </div>
            )}
          </DetailSection>

          <DetailSection title="Submission" layout="stacked">
            <DetailField
              label="Motivation"
              value={<p className="whitespace-pre-wrap text-sm text-ink-700">{app.motivation}</p>}
            />
            <DetailField
              label="Referral source"
              value={app.referralSource ?? "—"}
              empty={!app.referralSource}
            />
            <DetailField label="Submitted" value={formatDateTime(app.createdAt)} />
          </DetailSection>

          {(app.interviewAt || app.interviewNotes || app.outcome) && (
            <DetailSection title="Interview">
              <DetailField
                label="Scheduled for"
                value={app.interviewAt ? formatDateTime(app.interviewAt) : "—"}
                empty={!app.interviewAt}
              />
              <DetailField
                label="Outcome recommendation"
                value={app.outcome ? RECOMMENDATION_LABELS[app.outcome.recommendation] : "—"}
                empty={!app.outcome}
              />
              <DetailField
                label="Interview score"
                value={app.outcome ? `${app.outcome.score} / 5` : "—"}
                empty={!app.outcome}
              />
              {app.interviewNotes && (
                <div className="col-span-full">
                  <DetailField
                    label="Interviewer notes"
                    value={
                      <p className="whitespace-pre-wrap text-sm text-ink-700">
                        {app.interviewNotes}
                      </p>
                    }
                  />
                </div>
              )}
            </DetailSection>
          )}

          {(app.decidedAt || app.decisionReason || app.reopenedAt) && (
            <DetailSection title="Decision">
              <DetailField
                label="Status"
                value={APPLICATION_STATUS_LABELS[app.status]}
              />
              <DetailField
                label="Decided"
                value={app.decidedAt ? formatDateTime(app.decidedAt) : "—"}
                empty={!app.decidedAt}
              />
              <DetailField
                label="Decided by"
                value={app.decidedBy ? <span className="font-mono text-xs">{app.decidedBy}</span> : "—"}
                empty={!app.decidedBy}
              />
              {app.decisionReason && (
                <div className="col-span-full">
                  <DetailField
                    label="Reason (internal)"
                    value={
                      <p className="whitespace-pre-wrap text-sm text-ink-700">
                        {app.decisionReason}
                      </p>
                    }
                  />
                </div>
              )}
              {app.reopenedAt && (
                <div className="col-span-full mt-2 rounded-md border border-dawn-200 bg-dawn-50 p-3 text-sm text-dawn-800">
                  <strong>Reopened</strong> {formatDateTime(app.reopenedAt)}
                  {app.reopenedBy && <> by <span className="font-mono text-xs">{app.reopenedBy}</span></>}
                  {app.reopenReason && (
                    <p className="mt-1 text-dawn-700">{app.reopenReason}</p>
                  )}
                </div>
              )}
            </DetailSection>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Actions summary */}
          <Card className="p-5">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-fg-muted">
              Actions
            </h2>
            {!canSchedule && !canOutcome && !canDecide && !canReverse && (
              <p className="mt-3 text-sm text-ink-500">
                You have read-only access to this application.
              </p>
            )}
            {canSchedule && app.status === "SUBMITTED" && (
              <p className="mt-3 text-sm text-ink-500">
                Start by reviewing the submission, then schedule an interview.
              </p>
            )}
            {app.status === "APPROVED" && (
              <p className="mt-3 text-sm text-ink-500">
                Member number issued. Onboarding email sent.
              </p>
            )}
            {app.status === "REJECTED" && !reversalAvailable && canReverse && (
              <p className="mt-3 text-sm text-ink-500">
                Reversal window has closed (30 days from decision).
              </p>
            )}
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-ink-500">Expires</dt>
                <dd className="text-ink-700">{formatDate(app.expiresAt)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-500">Age</dt>
                <dd className="text-ink-700">{daysSince(app.createdAt)}d</dd>
              </div>
            </dl>
          </Card>

          <NotesPanel
            notes={effectiveNotes}
            onAddNote={handleAddNote}
            readOnly={!canNote}
            placeholder="Add an internal note. Not shared with the applicant."
            emptyMessage="No notes yet."
          />

          <Card className="p-5">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-fg-muted">
              Activity
            </h2>
            <div className="mt-4">
              <AuditTrail
                entries={auditEntries}
                defaultVisible={5}
                emptyMessage="No activity yet."
              />
            </div>
          </Card>
        </div>
      </div>

      {/* Reverse modal */}
      {reverseOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="reverse-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4"
        >
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-dawn-50">
                <ShieldAlert className="h-5 w-5 text-dawn-700" aria-hidden="true" />
              </div>
              <div>
                <h2 id="reverse-title" className="text-lg font-semibold text-ink-900">
                  Reverse decision?
                </h2>
                <p className="mt-2 text-sm text-ink-600">
                  The application will be returned to <strong>Under review</strong>.
                  This action is audited and only available to Super Admins.
                </p>
              </div>
            </div>

            <label
              htmlFor="reverse-reason"
              className="mt-5 block text-sm font-medium text-ink-700"
            >
              Reason for reversal
            </label>
            <textarea
              id="reverse-reason"
              value={reverseReason}
              onChange={(e) => setReverseReason(e.target.value)}
              rows={3}
              maxLength={500}
              placeholder="e.g. Applicant provided additional documentation."
              aria-invalid={!!reverseError}
              aria-describedby={reverseError ? "reverse-error" : undefined}
              className="mt-2 w-full rounded-md border border-ink-200 px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/30"
            />
            {reverseError && (
              <p id="reverse-error" className="mt-2 text-sm text-red-600">
                {reverseError}
              </p>
            )}

            <div className="mt-6 flex flex-col gap-2 sm:flex-row-reverse">
              <Button
                variant="primary"
                fullWidth
                onClick={handleReverse}
                disabled={reverseBusy}
              >
                {reverseBusy ? "Reopening…" : "Confirm reversal"}
              </Button>
              <Button
                variant="outline"
                fullWidth
                onClick={() => {
                  setReverseOpen(false);
                  setReverseReason("");
                  setReverseError(null);
                }}
                disabled={reverseBusy}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────

function buildAuditEntries(app: Application, notes: Note[]): AuditEntry[] {
  const entries: AuditEntry[] = [];

  entries.push({
    id: `${app.id}-submitted`,
    actor: `${app.firstName} ${app.lastName}`,
    action: "submitted application",
    timestamp: app.createdAt,
    category: "status",
  });

  if (app.interviewAt) {
    entries.push({
      id: `${app.id}-interview-scheduled`,
      actor: "Admin",
      action: "scheduled interview",
      target: formatDateTime(app.interviewAt),
      timestamp: app.interviewAt,
      category: "interview",
    });
  }

  if (app.outcome) {
    entries.push({
      id: `${app.id}-outcome`,
      actor: "Interviewer",
      action: "recorded outcome",
      target: RECOMMENDATION_LABELS[app.outcome.recommendation],
      timestamp: app.outcome.recordedAt,
      category: "interview",
    });
  }

  if (app.decidedAt) {
    entries.push({
      id: `${app.id}-decision`,
      actor: app.decidedBy ? "Admin" : "System",
      action:
        app.status === "APPROVED"
          ? "approved application"
          : app.status === "REJECTED"
          ? "rejected application"
          : "closed application",
      timestamp: app.decidedAt,
      category: "decision",
    });
  }

  if (app.reopenedAt) {
    entries.push({
      id: `${app.id}-reopened`,
      actor: "Super Admin",
      action: "reopened application",
      timestamp: app.reopenedAt,
      category: "reopen",
    });
  }

  for (const n of notes) {
    entries.push({
      id: n.id,
      actor: n.authorName,
      action: "added a note",
      timestamp: n.createdAt,
      category: "note",
    });
  }

  return entries.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function daysSince(iso: string) {
  return Math.floor((Date.now() - new Date(iso).getTime()) / (1000 * 60 * 60 * 24));
}