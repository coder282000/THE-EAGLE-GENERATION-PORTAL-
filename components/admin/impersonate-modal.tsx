"use client";

import { useState } from "react";
import { Button } from "@/components/button";
import { ShieldAlert } from "lucide-react";
import type { Member } from "@/lib/mock/members";

const DURATIONS = [
  { value: 15, label: "15 minutes" },
  { value: 30, label: "30 minutes" },
  { value: 60, label: "60 minutes" },
];

interface ImpersonateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: Member;
}

export function ImpersonateModal({
  open,
  onOpenChange,
  member,
}: ImpersonateModalProps) {
  const [consent, setConsent] = useState(false);
  const [duration, setDuration] = useState(15);
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (!open) return null;

  const handleStart = async () => {
    setError(null);
    if (!consent) {
      setError("You must confirm the member has consented.");
      return;
    }
    if (reason.trim().length < 10) {
      setError("Reason must be at least 10 characters.");
      return;
    }
    setBusy(true);
    await new Promise((r) => setTimeout(r, 600));
    setBusy(false);
    onOpenChange(false);
    // eslint-disable-next-line no-alert
    alert(`Impersonation session started for ${duration} minutes (mock).`);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="impersonate-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4"
    >
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-dawn-50">
            <ShieldAlert className="h-5 w-5 text-dawn-700" aria-hidden="true" />
          </div>
          <div>
            <h2 id="impersonate-title" className="text-lg font-semibold text-ink-900">
              Impersonate {member.firstName}?
            </h2>
            <p className="mt-2 text-sm text-ink-600">
              You will view the platform as this member. Actions are logged
              against <strong>your</strong> admin account, not theirs.
            </p>
          </div>
        </div>

        <label className="mt-5 flex items-start gap-2 text-sm text-ink-700">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-ink-200 text-sky-600 focus:ring-sky-500"
          />
          <span>
            I confirm {member.firstName} has been notified and consented to this
            support session.
          </span>
        </label>

        <div className="mt-5">
          <label htmlFor="imp-duration" className="block text-sm font-medium text-ink-700">
            Duration
          </label>
          <select
            id="imp-duration"
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            className="mt-2 w-full rounded-md border border-ink-200 bg-white px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/30"
          >
            {DURATIONS.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-5">
          <label htmlFor="imp-reason" className="block text-sm font-medium text-ink-700">
            Reason <span className="text-clay-600">*</span>
          </label>
          <textarea
            id="imp-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            maxLength={500}
            placeholder="e.g. Investigating a reported login issue."
            className="mt-2 w-full rounded-md border border-ink-200 px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/30"
          />
        </div>

        <div className="mt-5 rounded-md border border-clay-200 bg-clay-50 p-3 text-xs text-clay-800">
          Read-only mode is enforced. Every action is recorded in the audit log
          with your admin identity.
        </div>

        {error && (
          <p role="alert" className="mt-3 text-sm text-red-600">
            {error}
          </p>
        )}

        <div className="mt-6 flex flex-col gap-2 sm:flex-row-reverse">
          <Button variant="primary" fullWidth onClick={handleStart} disabled={busy}>
            {busy ? "Starting…" : "Start session"}
          </Button>
          <Button
            variant="outline"
            fullWidth
            onClick={() => onOpenChange(false)}
            disabled={busy}
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}