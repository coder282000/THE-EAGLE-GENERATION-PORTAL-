"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/button";
import { DetailSection, DetailField } from "@/components/applications/detail-section";
import {
  getApplicationById,
  canDecideApplication,
  APPLICATION_STATUS_LABELS,
  APPLICATION_TIER_LABELS,
} from "@/lib/mock/applications";
import { ArrowLeft, ShieldAlert, CheckCircle2, XCircle } from "lucide-react";

type Decision = "APPROVE" | "REJECT";

export default function DecideApplicationPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const app = params.id ? getApplicationById(params.id) : null;

  const [decision, setDecision] = useState<Decision | "">("");
  const [reason, setReason] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  // Member number preview — computed once per mount, deterministically from app.id
  const memberNumber = useMemo(() => {
    if (!app) return "";
    const year = new Date().getFullYear().toString().slice(-2);
    const seq = hashSeq(app.id);
    return `TEG-${year}-${app.chapterCode}-${seq}`;
  }, [app]);

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

  if (!canDecideApplication()) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16">
        <Card className="p-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-clay-50">
            <ShieldAlert className="h-6 w-6 text-clay-600" aria-hidden="true" />
          </div>
          <h1 className="mt-4 font-display text-xl text-ink-900">Permission denied</h1>
          <p className="mt-2 text-sm text-ink-500">
            You do not have permission to decide applications.
          </p>
          <div className="mt-6">
            <Link href={`/admin/applications/${app.id}`}>
              <Button variant="primary">Back to application</Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  const decidable = ["INTERVIEWED", "UNDER_REVIEW"].includes(app.status);
  if (!decidable) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16">
        <Card className="p-8 text-center">
          <h1 className="font-display text-xl text-ink-900">Cannot decide</h1>
          <p className="mt-2 text-sm text-ink-500">
            This application is {APPLICATION_STATUS_LABELS[app.status].toLowerCase()}.
            Only interviewed or under-review applications can be decided.
          </p>
          <div className="mt-6">
            <Link href={`/admin/applications/${app.id}`}>
              <Button variant="primary">Back to application</Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!decision) next.decision = "Select approve or reject.";
    if (decision === "REJECT" && reason.trim().length < 10) {
      next.reason = "A reason of at least 10 characters is required for rejection.";
    }

    if (Object.keys(next).length) {
      setErrors(next);
      return;
    }

    setErrors({});
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 700));
    // Mock: POST /api/v1/admin/applications/:id/decide
    router.push(`/admin/applications/${app.id}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={`/admin/applications/${app.id}`}
          className="inline-flex items-center gap-1 text-sm text-ink-500 hover:text-ink-700"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to application
        </Link>
        <h1 className="mt-2 font-display text-2xl font-semibold tracking-tight text-ink-900">
          Decide application
        </h1>
        <p className="mt-1 text-sm text-ink-500">
          {app.firstName} {app.lastName} · <span className="font-mono">{app.reference}</span>
        </p>
      </div>

      <DetailSection title="Applicant">
        <DetailField label="Name" value={`${app.firstName} ${app.lastName}`} />
        <DetailField label="Tier" value={APPLICATION_TIER_LABELS[app.tier]} />
        <DetailField label="Chapter" value={app.chapter} />
        <DetailField label="Email" value={app.email} />
        {app.outcome && (
          <DetailField
            label="Interview recommendation"
            value={app.outcome.recommendation.replace("_", " ").toLowerCase()}
          />
        )}
        {app.outcome && (
          <DetailField label="Interview score" value={`${app.outcome.score} / 5`} />
        )}
      </DetailSection>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <fieldset>
            <legend className="block text-sm font-medium text-ink-700">
              Decision <span className="text-clay-600">*</span>
            </legend>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <label
                className={`flex cursor-pointer items-start gap-3 rounded-lg border-2 p-4 transition-all ${
                  decision === "APPROVE"
                    ? "border-green-500 bg-green-50"
                    : "border-ink-200 hover:border-ink-300"
                }`}
              >
                <input
                  type="radio"
                  name="decision"
                  value="APPROVE"
                  checked={decision === "APPROVE"}
                  onChange={() => setDecision("APPROVE")}
                  className="mt-0.5 h-4 w-4 text-green-600 focus:ring-green-500"
                />
                <span className="min-w-0">
                  <span className="flex items-center gap-2 text-sm font-medium text-ink-900">
                    <CheckCircle2 className="h-4 w-4 text-green-600" aria-hidden="true" />
                    Approve
                  </span>
                  <span className="mt-1 block text-xs text-ink-500">
                    Issues member number and creates the user account.
                  </span>
                </span>
              </label>

              <label
                className={`flex cursor-pointer items-start gap-3 rounded-lg border-2 p-4 transition-all ${
                  decision === "REJECT"
                    ? "border-clay-500 bg-clay-50"
                    : "border-ink-200 hover:border-ink-300"
                }`}
              >
                <input
                  type="radio"
                  name="decision"
                  value="REJECT"
                  checked={decision === "REJECT"}
                  onChange={() => setDecision("REJECT")}
                  className="mt-0.5 h-4 w-4 text-clay-600 focus:ring-clay-500"
                />
                <span className="min-w-0">
                  <span className="flex items-center gap-2 text-sm font-medium text-ink-900">
                    <XCircle className="h-4 w-4 text-clay-600" aria-hidden="true" />
                    Reject
                  </span>
                  <span className="mt-1 block text-xs text-ink-500">
                    Applicant is notified without the reason. Reason is internal only.
                  </span>
                </span>
              </label>
            </div>
            {errors.decision && (
              <p className="mt-2 text-xs text-red-600">{errors.decision}</p>
            )}
          </fieldset>

          {decision === "APPROVE" && (
            <div className="rounded-md border border-green-200 bg-green-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wider text-green-800">
                Member number to be issued
              </p>
              <p className="mt-1 font-mono text-lg text-green-900">{memberNumber}</p>
              <p className="mt-2 text-xs text-green-700">
                Immutable once issued. The applicant will receive onboarding instructions by email.
              </p>
            </div>
          )}

          {decision === "REJECT" && (
            <div>
              <label htmlFor="reason" className="block text-sm font-medium text-ink-700">
                Reason (internal only) <span className="text-clay-600">*</span>
              </label>
              <textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={4}
                maxLength={500}
                placeholder="Recorded in the audit log. Not disclosed to the applicant."
                aria-invalid={!!errors.reason}
                aria-describedby={errors.reason ? "reason-error" : undefined}
                className="mt-2 w-full rounded-md border border-ink-200 bg-white px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/30"
              />
              {errors.reason && (
                <p id="reason-error" className="mt-1 text-xs text-red-600">
                  {errors.reason}
                </p>
              )}
            </div>
          )}

          <div className="rounded-md border border-ink-200 bg-ink-50 p-3 text-xs text-ink-600">
            Every decision writes to the audit log: actor, timestamp, before and after state.
          </div>

          <div className="flex flex-col gap-3 border-t border-ink-100 pt-5 sm:flex-row-reverse">
            <Button
              type="submit"
              variant={decision === "REJECT" ? "destructive" : "primary"}
              disabled={submitting || !decision}
            >
              {submitting
                ? "Submitting…"
                : decision === "REJECT"
                ? "Confirm rejection"
                : decision === "APPROVE"
                ? "Confirm approval"
                : "Select a decision"}
            </Button>
            <Link href={`/admin/applications/${app.id}`}>
              <Button type="button" variant="outline" fullWidth>
                Cancel
              </Button>
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
}

function hashSeq(id: string): string {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return String((h % 9000) + 1000).padStart(4, "0");
}