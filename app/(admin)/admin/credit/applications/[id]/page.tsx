'use client';

// ADM-121 — Loan Application Assessment Workspace
// Route: /admin/credit/applications/[id]

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Button } from '@/components/button';
import { Card } from '@/components/card';
import {
  getApplicationById,
  canViewCredit,
  canOperateCredit,
  canDecideCredit,
  canConfirmDecision,
  LOAN_APP_STATUS_LABELS,
  formatMinor,
  type LoanApplicationStatus,
} from '@/lib/mock/credit';

const STATUS_TONE: Record<LoanApplicationStatus, string> = {
  SUBMITTED: 'bg-clay/15 text-clay',
  ASSESSMENT: 'bg-sky/15 text-sky',
  RECOMMENDED: 'bg-clay/15 text-clay',
  APPROVED: 'bg-emerald-100 text-emerald-800',
  DECLINED: 'bg-red-100 text-red-800',
  WITHDRAWN: 'bg-ink/10 text-ink/70',
  OFFER_ISSUED: 'bg-sky/15 text-sky',
  OFFER_ACCEPTED: 'bg-sky/15 text-sky',
  DISBURSED: 'bg-emerald-100 text-emerald-800',
};

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-ink/60">{label}</dt>
      <dd className={`mt-1 text-sm text-ink ${mono ? 'font-mono text-xs' : ''}`}>{value}</dd>
    </div>
  );
}

export default function ApplicationAssessmentPage() {
  const params = useParams<{ id: string }>();
  const app = useMemo(() => getApplicationById(params.id), [params.id]);
  const canOperate = canOperateCredit();
  const canDecide = canDecideCredit();

  const [recommendation, setRecommendation] = useState<'APPROVE' | 'DECLINE' | 'APPROVE_WITH_CONDITIONS' | null>(null);
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [recommended, setRecommended] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [confirmError, setConfirmError] = useState<string | null>(null);

  if (!canViewCredit()) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <Card>
          <h1 className="text-lg font-semibold text-ink">Permission denied</h1>
          <p className="mt-2 text-sm text-ink/70">You do not have access to the credit panel.</p>
        </Card>
      </div>
    );
  }

  if (!app) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <Card>
          <h1 className="text-lg font-semibold text-ink">Application not found</h1>
          <Link href="/admin/credit" className="mt-3 inline-block text-sm text-sky hover:underline">
            Back to credit dashboard
          </Link>
        </Card>
      </div>
    );
  }

  const isTerminal = ['APPROVED', 'DECLINED', 'DISBURSED', 'WITHDRAWN'].includes(app.status);

  function submitRecommendation(e: React.FormEvent) {
    e.preventDefault();
    if (!recommendation) {
      setError('Choose a recommendation.');
      return;
    }
    if (reason.trim().length < 20) {
      setError('Reason must be at least 20 characters — this becomes the credit file.');
      return;
    }
    setError(null);
    setRecommended(true);
  }

  function confirmDecision() {
    if (!canConfirmDecision({ recommendBy: 'u-credit-officer-01' })) {
      setConfirmError(
        'Four-eyes: the recommender cannot also confirm. A different Credit Officer or Manager must confirm.'
      );
      return;
    }
    setConfirmError(null);
    setConfirmed(true);
  }

  return (
    <div className="p-6">
      <nav aria-label="Breadcrumb" className="mb-3 text-xs text-ink/60">
        <Link href="/admin/credit" className="hover:text-sky">Credit</Link>
        <span className="mx-2">/</span>
        <Link href="/admin/credit/applications" className="hover:text-sky">Applications</Link>
        <span className="mx-2">/</span>
        <span className="text-ink">{app.reference}</span>
      </nav>

      <header className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-ink/60">PNL-10 · Assessment</p>
          <h1 className="mt-1 font-mono text-2xl font-semibold text-ink">{app.reference}</h1>
          <p className="mt-1 text-sm text-ink/70">
            {app.memberName} · {app.memberNumber} · {app.productName}
          </p>
        </div>
        <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${STATUS_TONE[app.status]}`}>
          {LOAN_APP_STATUS_LABELS[app.status]}
        </span>
      </header>

      {recommended ? (
        <div role="status" className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
          Recommendation recorded: {recommendation}. Awaiting confirmation from a different credit officer.
        </div>
      ) : null}
      {confirmed ? (
        <div role="status" className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
          Decision confirmed. In production this issues an offer to the member via the member portal.
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <h2 className="text-sm font-semibold text-ink">Application details</h2>
          <dl className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-3">
            <Field label="Member" value={app.memberName} />
            <Field label="Member number" value={app.memberNumber} mono />
            <Field label="Product" value={app.productName} />
            <Field label="Requested" value={formatMinor(app.requestedAmountMinor, 'KES')} mono />
            <Field label="Tenor" value={`${app.requestedTenorMonths} months`} />
            <Field label="Guarantors" value={String(app.guarantorCount)} />
            <Field label="Submitted" value={new Date(app.submittedAt).toLocaleString('en-GB')} />
            <Field label="Updated" value={new Date(app.updatedAt).toLocaleString('en-GB')} />
          </dl>
          <div className="mt-4">
            <dt className="text-xs uppercase tracking-wide text-ink/60">Purpose</dt>
            <dd className="mt-1 whitespace-pre-wrap text-sm text-ink">{app.purpose}</dd>
          </div>
        </Card>

        <Card>
          <h2 className="text-sm font-semibold text-ink">Assessment inputs</h2>
          <p className="mt-2 text-xs text-ink/60">
            Affordability, existing obligations, savings history, CRB result, and guarantor strength are
            scored together to produce a debt-service ratio.
          </p>
          <dl className="mt-3 space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-ink/70">Monthly income (declared)</dt>
              <dd className="font-mono text-ink">KES 145,000</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink/70">Existing obligations</dt>
              <dd className="font-mono text-ink">KES 22,000</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink/70">Proposed instalment</dt>
              <dd className="font-mono text-ink">
                {formatMinor(Math.round(app.requestedAmountMinor / app.requestedTenorMonths), 'KES')}
              </dd>
            </div>
            <div className="flex justify-between border-t border-ink/10 pt-3">
              <dt className="font-medium text-ink">Debt-service ratio</dt>
              <dd className="font-mono font-medium text-emerald-700">~38%</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink/70">Policy maximum</dt>
              <dd className="font-mono text-ink">45%</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink/70">CRB result</dt>
              <dd className="text-ink">No adverse records</dd>
            </div>
          </dl>
        </Card>
      </div>

      {app.recommendBy ? (
        <Card className="mt-4">
          <h2 className="text-sm font-semibold text-ink">Existing recommendation</h2>
          <dl className="mt-3 grid grid-cols-2 gap-4 md:grid-cols-3">
            <Field label="Recommender" value={app.recommendBy} />
            <Field label="Decision" value={app.recommendedDecision ?? '—'} />
            <Field label="At" value={app.recommendedAt ? new Date(app.recommendedAt).toLocaleString('en-GB') : '—'} />
          </dl>
          <div className="mt-3">
            <dt className="text-xs uppercase tracking-wide text-ink/60">Reason</dt>
            <dd className="mt-1 whitespace-pre-wrap text-sm text-ink">{app.recommendReason}</dd>
          </div>
          {app.confirmedBy ? (
            <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
              Confirmed by {app.confirmedBy} at{' '}
              {app.confirmedAt ? new Date(app.confirmedAt).toLocaleString('en-GB') : '—'}.
              {app.declineReason ? ` Decline reason: ${app.declineReason}` : ''}
            </div>
          ) : canDecide || canOperate ? (
            <div className="mt-4">
              <Button variant="primary" onClick={confirmDecision}>Confirm decision</Button>
              {confirmError ? (
                <p role="alert" className="mt-2 text-xs text-red-700">{confirmError}</p>
              ) : null}
            </div>
          ) : null}
        </Card>
      ) : null}

      {!isTerminal && canOperate && !recommended ? (
        <Card className="mt-4">
          <h2 className="text-sm font-semibold text-ink">Record recommendation</h2>
          <form onSubmit={submitRecommendation} className="mt-3">
            <fieldset>
              <legend className="text-xs font-medium text-ink/70">Recommendation</legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {(
                  [
                    { value: 'APPROVE', label: 'Approve' },
                    { value: 'APPROVE_WITH_CONDITIONS', label: 'Approve with conditions' },
                    { value: 'DECLINE', label: 'Decline' },
                  ] as { value: typeof recommendation; label: string }[]
                ).map((opt) => (
                  <label
                    key={opt.value}
                    className={`cursor-pointer rounded-md border px-3 py-2 text-sm ${
                      recommendation === opt.value
                        ? 'border-sky bg-sky/10 text-sky'
                        : 'border-ink/15 bg-paper text-ink hover:bg-ink/5'
                    }`}
                  >
                    <input
                      type="radio"
                      name="recommendation"
                      value={opt.value ?? ''}
                      checked={recommendation === opt.value}
                      onChange={() => setRecommendation(opt.value)}
                      className="sr-only"
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
            </fieldset>
            <div className="mt-4">
              <label htmlFor="rec-reason" className="block text-xs font-medium text-ink/70">
                Reason (minimum 20 characters, audited)
              </label>
              <textarea
                id="rec-reason"
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="mt-1 w-full rounded-md border border-ink/15 bg-paper px-3 py-2 text-sm text-ink focus:border-sky focus:outline-none focus:ring-2 focus:ring-sky/40"
                aria-invalid={error ? 'true' : 'false'}
                aria-describedby={error ? 'rec-error' : undefined}
              />
              {error ? (
                <p id="rec-error" role="alert" className="mt-1 text-xs text-red-700">{error}</p>
              ) : (
                <p className="mt-1 text-xs text-ink/60">{reason.length} / 20 minimum</p>
              )}
            </div>
            <div className="mt-4 flex gap-2">
              <Button variant="primary" type="submit">Record recommendation</Button>
              <Button
                variant="outline"
                type="button"
                onClick={() => {
                  setRecommendation(null);
                  setReason('');
                  setError(null);
                }}
              >
                Clear
              </Button>
            </div>
            <p role="note" className="mt-3 text-xs text-clay">
              Four-eyes: the recommender cannot confirm their own recommendation. A second credit officer
              or the Credit Manager must confirm before the offer is issued.
            </p>
          </form>
        </Card>
      ) : null}
    </div>
  );
}