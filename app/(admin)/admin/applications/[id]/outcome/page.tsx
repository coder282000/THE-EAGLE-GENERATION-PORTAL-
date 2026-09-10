"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/button";
import {
  getApplicationById,
  canRecordOutcome,
  APPLICATION_STATUS_LABELS,
} from "@/lib/mock/applications";
import type { ApplicationRecommendation } from "@/components/mock/data";
import { ArrowLeft, ShieldAlert, ClipboardCheck } from "lucide-react";

const RECOMMENDATIONS: { value: ApplicationRecommendation; label: string; description: string }[] = [
  { value: "STRONG_YES", label: "Strong yes", description: "Clearly aligned, recommend approval." },
  { value: "YES", label: "Yes", description: "Aligned, recommend approval." },
  { value: "NO", label: "No", description: "Not aligned at this time." },
  { value: "STRONG_NO", label: "Strong no", description: "Not a fit for the programme." },
];

export default function RecordOutcomePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const app = params.id ? getApplicationById(params.id) : null;

  const [strengths, setStrengths] = useState("");
  const [concerns, setConcerns] = useState("");
  const [recommendation, setRecommendation] = useState<ApplicationRecommendation | "">("");
  const [score, setScore] = useState<number>(0);
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

  if (!canRecordOutcome()) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16">
        <Card className="p-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-clay-50">
            <ShieldAlert className="h-6 w-6 text-clay-600" aria-hidden="true" />
          </div>
          <h1 className="mt-4 font-display text-xl text-ink-900">Permission denied</h1>
          <p className="mt-2 text-sm text-ink-500">
            You do not have permission to record interview outcomes.
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

  if (app.status !== "INTERVIEW_SCHEDULED" && app.status !== "INTERVIEWED") {
    return (
      <div className="mx-auto max-w-xl px-4 py-16">
        <Card className="p-8 text-center">
          <h1 className="font-display text-xl text-ink-900">
            Cannot record outcome
          </h1>
          <p className="mt-2 text-sm text-ink-500">
            This application is {APPLICATION_STATUS_LABELS[app.status].toLowerCase()}.
            Only scheduled or already-interviewed applications can have outcomes recorded.
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
    if (!strengths.trim()) next.strengths = "Strengths is required.";
    if (!recommendation) next.recommendation = "Please select a recommendation.";
    if (!score) next.score = "Please rate the applicant 1–5.";

    if (Object.keys(next).length) {
      setErrors(next);
      return;
    }

    setErrors({});
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 600));
    // Mock: POST /api/v1/admin/applications/:id/outcome
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
          Record interview outcome
        </h1>
        <p className="mt-1 text-sm text-ink-500">
          {app.firstName} {app.lastName} · <span className="font-mono">{app.reference}</span>
        </p>
      </div>

      <Card className="p-6">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sky-50">
            <ClipboardCheck className="h-5 w-5 text-sky-600" aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm font-medium text-ink-900">Structured outcome</p>
            <p className="mt-1 text-sm text-ink-500">
              Your notes feed into the decision but are not shared with the applicant.
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="strengths" className="block text-sm font-medium text-ink-700">
              Strengths <span className="text-clay-600">*</span>
            </label>
            <textarea
              id="strengths"
              value={strengths}
              onChange={(e) => setStrengths(e.target.value)}
              rows={4}
              maxLength={2000}
              placeholder="What stood out? Alignment to pillars, character, capacity for the programme."
              aria-invalid={!!errors.strengths}
              aria-describedby={errors.strengths ? "strengths-error" : undefined}
              className="mt-2 w-full rounded-md border border-ink-200 bg-white px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/30"
            />
            {errors.strengths && (
              <p id="strengths-error" className="mt-1 text-xs text-red-600">
                {errors.strengths}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="concerns" className="block text-sm font-medium text-ink-700">
              Concerns (optional)
            </label>
            <textarea
              id="concerns"
              value={concerns}
              onChange={(e) => setConcerns(e.target.value)}
              rows={3}
              maxLength={2000}
              placeholder="Any reservations or development areas to flag for the decision."
              className="mt-2 w-full rounded-md border border-ink-200 bg-white px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/30"
            />
          </div>

          <fieldset>
            <legend className="block text-sm font-medium text-ink-700">
              Recommendation <span className="text-clay-600">*</span>
            </legend>
            <div className="mt-3 space-y-2">
              {RECOMMENDATIONS.map((r) => (
                <label
                  key={r.value}
                  className={`flex cursor-pointer items-start gap-3 rounded-md border p-3 transition-colors ${
                    recommendation === r.value
                      ? "border-sky-500 bg-sky-50"
                      : "border-ink-200 hover:border-ink-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="recommendation"
                    value={r.value}
                    checked={recommendation === r.value}
                    onChange={() => setRecommendation(r.value)}
                    className="mt-0.5 h-4 w-4 text-sky-600 focus:ring-sky-500"
                  />
                  <span className="min-w-0">
                    <span className="block text-sm font-medium text-ink-900">{r.label}</span>
                    <span className="mt-0.5 block text-xs text-ink-500">{r.description}</span>
                  </span>
                </label>
              ))}
            </div>
            {errors.recommendation && (
              <p className="mt-2 text-xs text-red-600">{errors.recommendation}</p>
            )}
          </fieldset>

          <div>
            <label htmlFor="score" className="block text-sm font-medium text-ink-700">
              Overall score (1–5) <span className="text-clay-600">*</span>
            </label>
            <div className="mt-2 flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setScore(n)}
                  aria-label={`Score ${n} of 5`}
                  aria-pressed={score === n}
                  className={`h-10 w-10 rounded-md border text-sm font-medium transition-colors ${
                    score === n
                      ? "border-sky-500 bg-sky-500 text-white"
                      : "border-ink-200 text-ink-700 hover:border-ink-300"
                  }`}
                >
                  {n}
                </button>
              ))}
              {score > 0 && (
                <span className="ml-2 text-xs text-ink-500">{score} of 5</span>
              )}
            </div>
            {errors.score && <p className="mt-1 text-xs text-red-600">{errors.score}</p>}
          </div>

          <div className="flex flex-col gap-3 border-t border-ink-100 pt-5 sm:flex-row-reverse">
            <Button type="submit" variant="primary" disabled={submitting}>
              {submitting ? "Saving…" : "Save outcome"}
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