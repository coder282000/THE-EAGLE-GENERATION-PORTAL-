'use client';

// ADM-181 — KYC Case Detail
// Route: /admin/compliance/cases/[id]

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Button } from '@/components/button';
import { Card } from '@/components/card';
import {
  getKYCCaseById,
  canViewCompliance,
  canWorkCases,
  KYC_STATUS_LABELS,
  KYC_TIER_LABELS,
  type KYCCaseStatus,
} from '@/lib/mock/compliance';

const STATUS_TONE: Record<KYCCaseStatus, string> = {
  SUBMITTED: 'bg-clay/15 text-clay',
  IN_REVIEW: 'bg-sky/15 text-sky',
  MORE_INFO_NEEDED: 'bg-clay/15 text-clay',
  APPROVED: 'bg-emerald-100 text-emerald-800',
  REJECTED: 'bg-red-100 text-red-800',
};

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-ink/60">{label}</dt>
      <dd className={`mt-1 text-sm text-ink ${mono ? 'font-mono text-xs' : ''}`}>{value}</dd>
    </div>
  );
}

export default function KYCCaseDetailPage() {
  const params = useParams<{ id: string }>();
  const kase = useMemo(() => getKYCCaseById(params.id), [params.id]);
  const canWork = canWorkCases();

  const [decision, setDecision] = useState<KYCCaseStatus | null>(null);
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  if (!canViewCompliance()) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <Card>
          <h1 className="text-lg font-semibold text-ink">Permission denied</h1>
          <p className="mt-2 text-sm text-ink/70">You do not have access to the compliance panel.</p>
        </Card>
      </div>
    );
  }

  if (!kase) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <Card>
          <h1 className="text-lg font-semibold text-ink">KYC case not found</h1>
          <Link href="/admin/compliance" className="mt-3 inline-block text-sm text-sky hover:underline">
            Back to compliance dashboard
          </Link>
        </Card>
      </div>
    );
  }

  const isTerminal = kase.status === 'APPROVED' || kase.status === 'REJECTED';

  function submitDecision(e: React.FormEvent) {
    e.preventDefault();
    if (!decision) {
      setError('Choose a decision.');
      return;
    }
    if (reason.trim().length < 15) {
      setError('Reason must be at least 15 characters — this is audited.');
      return;
    }
    setError(null);
    setSubmitted(true);
  }

  return (
    <div className="p-6">
      <nav aria-label="Breadcrumb" className="mb-3 text-xs text-ink/60">
        <Link href="/admin/compliance" className="hover:text-sky">Compliance</Link>
        <span className="mx-2">/</span>
        <span className="text-ink">{kase.reference}</span>
      </nav>

      <header className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-ink/60">PNL-15 · KYC Case</p>
          <h1 className="mt-1 font-mono text-2xl font-semibold text-ink">{kase.reference}</h1>
          <p className="mt-1 text-sm text-ink/70">
            {kase.memberName} · {kase.memberNumber} · {kase.memberCountry}
          </p>
        </div>
        <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${STATUS_TONE[kase.status]}`}>
          {KYC_STATUS_LABELS[kase.status]}
        </span>
      </header>

      {submitted ? (
        <div role="status" className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
          Decision recorded: {decision ? KYC_STATUS_LABELS[decision] : ''}. In production this would write
          the new tier to the member record and, if approved, notify the member that KYC is complete.
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <h2 className="text-sm font-semibold text-ink">Case details</h2>
          <dl className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-3">
            <Field label="Member" value={kase.memberName} />
            <Field label="Member number" value={kase.memberNumber} mono />
            <Field label="Country" value={kase.memberCountry} />
            <Field label="Requested tier" value={KYC_TIER_LABELS[kase.tier]} />
            <Field label="Documents" value={`${kase.documentCount} file${kase.documentCount === 1 ? '' : 's'}`} />
            <Field label="Assigned analyst" value={kase.assignee ?? 'Unassigned'} />
            <Field label="Submitted" value={new Date(kase.submittedAt).toLocaleString('en-GB')} />
            {kase.decidedAt ? (
              <>
                <Field label="Decided" value={new Date(kase.decidedAt).toLocaleString('en-GB')} />
                <Field label="Decided by" value={kase.decidedBy ?? '—'} />
              </>
            ) : null}
          </dl>
          {kase.reason ? (
            <div className="mt-4">
              <dt className="text-xs uppercase tracking-wide text-ink/60">Last note</dt>
              <dd className="mt-1 whitespace-pre-wrap text-sm text-ink">{kase.reason}</dd>
            </div>
          ) : null}
        </Card>

        <Card>
          <h2 className="text-sm font-semibold text-ink">Documents</h2>
          <p className="mt-2 text-xs text-ink/60">
            In production this panel displays the encrypted identity document, the liveness capture, and
            the extracted data side by side. Documents are served from a signed URL with a short TTL.
          </p>
          <ul className="mt-3 space-y-2 text-sm">
            <li className="flex items-center justify-between rounded border border-ink/10 p-2">
              <span>National ID — front</span>
              <span className="text-xs text-ink/60">Encrypted</span>
            </li>
            <li className="flex items-center justify-between rounded border border-ink/10 p-2">
              <span>National ID — back</span>
              <span className="text-xs text-ink/60">Encrypted</span>
            </li>
            <li className="flex items-center justify-between rounded border border-ink/10 p-2">
              <span>Selfie / liveness</span>
              <span className="text-xs text-ink/60">Encrypted</span>
            </li>
            {kase.documentCount >= 4 ? (
              <li className="flex items-center justify-between rounded border border-ink/10 p-2">
                <span>Proof of address</span>
                <span className="text-xs text-ink/60">Encrypted</span>
              </li>
            ) : null}
          </ul>
        </Card>
      </div>

      <Card className="mt-4">
        <h2 className="text-sm font-semibold text-ink">Decision</h2>

        {!canWork ? (
          <p className="mt-2 text-sm text-ink/60">
            Your role can view KYC cases but not decide them. Compliance Analyst, Compliance Lead, and
            Super Admin only.
          </p>
        ) : isTerminal && !submitted ? (
          <p className="mt-2 text-sm text-ink/60">
            This case is in a terminal state ({KYC_STATUS_LABELS[kase.status]}) and cannot be changed from
            this view. Corrections require a separate audited action by the Compliance Lead.
          </p>
        ) : submitted ? null : (
          <form onSubmit={submitDecision} className="mt-3">
            <fieldset>
              <legend className="text-xs font-medium text-ink/70">Choose a decision</legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {(
                  [
                    { value: 'APPROVED', label: 'Approve KYC' },
                    { value: 'MORE_INFO_NEEDED', label: 'Request more info' },
                    { value: 'REJECTED', label: 'Reject' },
                  ] as { value: KYCCaseStatus; label: string }[]
                ).map((opt) => (
                  <label
                    key={opt.value}
                    className={`cursor-pointer rounded-md border px-3 py-2 text-sm ${
                      decision === opt.value
                        ? 'border-sky bg-sky/10 text-sky'
                        : 'border-ink/15 bg-paper text-ink hover:bg-ink/5'
                    }`}
                  >
                    <input
                      type="radio"
                      name="decision"
                      value={opt.value}
                      checked={decision === opt.value}
                      onChange={() => setDecision(opt.value)}
                      className="sr-only"
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="mt-4">
              <label htmlFor="kyc-reason" className="block text-xs font-medium text-ink/70">
                Reason (minimum 15 characters, audited)
              </label>
              <textarea
                id="kyc-reason"
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="mt-1 w-full rounded-md border border-ink/15 bg-paper px-3 py-2 text-sm text-ink focus:border-sky focus:outline-none focus:ring-2 focus:ring-sky/40"
                aria-invalid={error ? 'true' : 'false'}
                aria-describedby={error ? 'kyc-error' : undefined}
              />
              {error ? (
                <p id="kyc-error" role="alert" className="mt-1 text-xs text-red-700">{error}</p>
              ) : (
                <p className="mt-1 text-xs text-ink/60">{reason.length} / 15 minimum</p>
              )}
            </div>

            <div className="mt-4 flex gap-2">
              <Button variant="primary" type="submit">Record decision</Button>
              <Button
                variant="outline"
                type="button"
                onClick={() => {
                  setDecision(null);
                  setReason('');
                  setError(null);
                }}
              >
                Clear
              </Button>
            </div>
            <p role="note" className="mt-3 text-xs text-clay">
              This decision writes to the member record and is retained for 7 years per AML record-keeping.
            </p>
          </form>
        )}
      </Card>

      <Card className="mt-4">
        <h2 className="text-sm font-semibold text-ink">Case timeline</h2>
        <ol className="mt-4 space-y-3 text-sm">
          <li className="flex gap-3">
            <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-sky" aria-hidden />
            <div>
              <p className="text-ink">Documents submitted</p>
              <p className="text-xs text-ink/60">{new Date(kase.submittedAt).toLocaleString('en-GB')}</p>
            </div>
          </li>
          {kase.assignee ? (
            <li className="flex gap-3">
              <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-sky" aria-hidden />
              <div>
                <p className="text-ink">Assigned to {kase.assignee}</p>
              </div>
            </li>
          ) : null}
          {kase.decidedAt ? (
            <li className="flex gap-3">
              <span
                className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                  kase.status === 'APPROVED' ? 'bg-emerald-600' : 'bg-red-600'
                }`}
                aria-hidden
              />
              <div>
                <p className="text-ink">
                  {KYC_STATUS_LABELS[kase.status]} — {kase.reason ?? 'No reason recorded'}
                </p>
                <p className="text-xs text-ink/60">{new Date(kase.decidedAt).toLocaleString('en-GB')}</p>
              </div>
            </li>
          ) : null}
        </ol>
      </Card>
    </div>
  );
}