"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/button";
import {
  getApplicationById,
  canScheduleInterview,
  APPLICATION_STATUS_LABELS,
} from "@/lib/mock/applications";
import { ArrowLeft, ShieldAlert, Calendar } from "lucide-react";

const DURATIONS = [
  { value: "30", label: "30 minutes" },
  { value: "45", label: "45 minutes" },
  { value: "60", label: "60 minutes" },
];

export default function ScheduleInterviewPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const app = params.id ? getApplicationById(params.id) : null;

  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [duration, setDuration] = useState("45");
  const [interviewer, setInterviewer] = useState("");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

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

  if (!canScheduleInterview()) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16">
        <Card className="p-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-clay-50">
            <ShieldAlert className="h-6 w-6 text-clay-600" aria-hidden="true" />
          </div>
          <h1 className="mt-4 font-display text-xl text-ink-900">Permission denied</h1>
          <p className="mt-2 text-sm text-ink-500">
            You do not have permission to schedule interviews.
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

  if (!["SUBMITTED", "UNDER_REVIEW"].includes(app.status)) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16">
        <Card className="p-8 text-center">
          <h1 className="font-display text-xl text-ink-900">
            Cannot schedule interview
          </h1>
          <p className="mt-2 text-sm text-ink-500">
            This application is {APPLICATION_STATUS_LABELS[app.status].toLowerCase()}.
            Only submitted or under-review applications can be scheduled.
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
    if (!date) next.date = "Date is required.";
    if (!time) next.time = "Time is required.";
    if (!interviewer.trim()) next.interviewer = "Interviewer is required.";

    if (date && time) {
      const when = new Date(`${date}T${time}`);
      if (Number.isNaN(when.getTime())) {
        next.date = "Enter a valid date and time.";
      } else if (when.getTime() <= Date.now()) {
        next.date = "Date and time must be in the future.";
      }
    }

    if (Object.keys(next).length) {
      setErrors(next);
      return;
    }

    setErrors({});
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 600));
    // Mock: POST /api/v1/admin/applications/:id/schedule-interview
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
          Schedule interview
        </h1>
        <p className="mt-1 text-sm text-ink-500">
          {app.firstName} {app.lastName} · <span className="font-mono">{app.reference}</span>
        </p>
      </div>

      <Card className="p-6">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sky-50">
            <Calendar className="h-5 w-5 text-sky-600" aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm font-medium text-ink-900">
              Vision-alignment interview
            </p>
            <p className="mt-1 text-sm text-ink-500">
              A calendar invitation will be sent to the applicant at{" "}
              <span className="font-medium text-ink-700">{app.email}</span>.
              Reminders will be sent 24 hours and 1 hour before.
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-ink-700">
                Date <span className="text-clay-600">*</span>
              </label>
              <input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                aria-invalid={!!errors.date}
                aria-describedby={errors.date ? "date-error" : undefined}
                className="mt-2 w-full rounded-md border border-ink-200 bg-white px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/30"
              />
              {errors.date && (
                <p id="date-error" className="mt-1 text-xs text-red-600">
                  {errors.date}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="time" className="block text-sm font-medium text-ink-700">
                Time <span className="text-clay-600">*</span>
              </label>
              <input
                id="time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                aria-invalid={!!errors.time}
                aria-describedby={errors.time ? "time-error" : undefined}
                className="mt-2 w-full rounded-md border border-ink-200 bg-white px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/30"
              />
              {errors.time && (
                <p id="time-error" className="mt-1 text-xs text-red-600">
                  {errors.time}
                </p>
              )}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="duration" className="block text-sm font-medium text-ink-700">
                Duration
              </label>
              <select
                id="duration"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="mt-2 w-full rounded-md border border-ink-200 bg-white px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/30"
              >
                {DURATIONS.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="interviewer" className="block text-sm font-medium text-ink-700">
                Interviewer <span className="text-clay-600">*</span>
              </label>
              <input
                id="interviewer"
                type="text"
                value={interviewer}
                onChange={(e) => setInterviewer(e.target.value)}
                placeholder="e.g. Pastor James"
                aria-invalid={!!errors.interviewer}
                aria-describedby={errors.interviewer ? "interviewer-error" : undefined}
                className="mt-2 w-full rounded-md border border-ink-200 bg-white px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/30"
              />
              {errors.interviewer && (
                <p id="interviewer-error" className="mt-1 text-xs text-red-600">
                  {errors.interviewer}
                </p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-ink-700">
              Notes for interviewer (optional)
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              maxLength={1000}
              placeholder="Anything the interviewer should know in advance."
              className="mt-2 w-full rounded-md border border-ink-200 bg-white px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/30"
            />
            <p className="mt-1 text-xs text-ink-400">{notes.length}/1000</p>
          </div>

          <div className="flex flex-col gap-3 border-t border-ink-100 pt-5 sm:flex-row-reverse">
            <Button type="submit" variant="primary" disabled={submitting}>
              {submitting ? "Scheduling…" : "Schedule interview"}
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