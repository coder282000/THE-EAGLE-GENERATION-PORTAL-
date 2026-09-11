'use client';

// ADM-125 — Loan Detail and Servicing
// Route: /admin/credit/loans/[id]

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Button } from '@/components/button';
import { Card } from '@/components/card';
import {
  getLoanById,
  getGuarantees,
  getCRBSubmissions,
  canViewCredit,
  canOperateCredit,
  LOAN_STATUS_LABELS,
  GUARANTEE_STATUS_LABELS,
  CRB_STATUS_LABELS,
  formatMinor,
  bpsToPct,
  type LoanStatus,
} from '@/lib/mock/credit';

const STATUS_TONE: Record<LoanStatus, string> = {
  ACTIVE: 'bg-emerald-100 text-emerald-800',
  IN_ARREARS: 'bg-clay/15 text-clay',
  RESTRUCTURED: 'bg-sky/15 text-sky',
  CLOSED: 'bg-ink/10 text-ink/70',
  WRITTEN_OFF: 'bg-red-100 text-red-800',
};

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-ink/60">{label}</dt>
      <dd className={`mt-1 text-sm text-ink ${mono ? 'font-mono text-xs' : ''}`}>{value}</dd>
    </div>
  );
}

export default function LoanDetailPage() {
  const params = useParams<{ id: string }>();
  const loan = useMemo(() => getLoanById(params.id), [params.id]);
  const guarantees = useMemo(() => {
    if (!loan) return [];
    return getGuarantees().filter((g) => g.loanId === loan.id);
  }, [loan]);
  const crbSubs = useMemo(() => {
    if (!loan) return [];
    return getCRBSubmissions().filter((c) => c.loanReference === loan.reference);
  }, [loan]);

  const canOperate = canOperateCredit();

  const [adjustOpen, setAdjustOpen] = useState(false);
  const [adjustAmount, setAdjustAmount] = useState('');
  const [adjustReason, setAdjustReason] = useState('');
  const [adjustError, setAdjustError] = useState<string | null>(null);
  const [adjustSubmitted, setAdjustSubmitted] = useState(false);

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

  if (!loan) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <Card>
          <h1 className="text-lg font-semibold text-ink">Loan not found</h1>
          <Link href="/admin/credit/loans" className="mt-3 inline-block text-sm text-sky hover:underline">
            Back to loan book
          </Link>
        </Card>
      </div>
    );
  }

  function submitAdjustment(e: React.FormEvent) {
    e.preventDefault();
    const amt = parseFloat(adjustAmount);
    if (!Number.isFinite(amt) || amt === 0) {
      setAdjustError('Adjustment amount must be a non-zero number.');
      return;
    }
    if (adjustReason.trim().length < 30) {
      setAdjustError('Reason must be at least 30 characters — this becomes part of the credit file.');
      return;
    }
    setAdjustError(null);
    setAdjustSubmitted(true);
  }

  const instalmentsPaid = Math.max(0, Math.round((loan.principalMinor - loan.outstandingMinor) / loan.monthlyInstalmentMinor));
  const totalInstalments = loan.tenorMonths;

  return (
    <div className="p-6">
      <nav aria-label="Breadcrumb" className="mb-3 text-xs text-ink/60">
        <Link href="/admin/credit" className="hover:text-sky">Credit</Link>
        <span className="mx-2">/</span>
        <Link href="/admin/credit/loans" className="hover:text-sky">Loans</Link>
        <span className="mx-2">/</span>
        <span className="text-ink">{loan.reference}</span>
      </nav>

      <header className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-ink/60">PNL-10 · Loan servicing</p>
          <h1 className="mt-1 font-mono text-2xl font-semibold text-ink">{loan.reference}</h1>
          <p className="mt-1 text-sm text-ink/70">
            {loan.memberName} · {loan.memberNumber} · {loan.productName}
          </p>
        </div>
        <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${STATUS_TONE[loan.status]}`}>
          {LOAN_STATUS_LABELS[loan.status]}
        </span>
      </header>

      {loan.status === 'IN_ARREARS' ? (
        <div role="alert" className="mb-4 rounded-lg border border-clay/40 bg-clay/5 p-3 text-sm text-ink">
          <strong className="font-medium">In arrears — {loan.daysInArrears} days.</strong>{' '}
          <Link href="/admin/credit/arrears" className="underline">Open the collections workspace.</Link>
        </div>
      ) : null}

      <section aria-label="Loan balance summary" className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card>
          <dl>
            <dt className="text-xs uppercase tracking-wide text-ink/60">Principal</dt>
            <dd className="mt-1 font-mono text-lg font-semibold text-ink">
              {formatMinor(loan.principalMinor, loan.currency)}
            </dd>
          </dl>
        </Card>
        <Card>
          <dl>
            <dt className="text-xs uppercase tracking-wide text-ink/60">Outstanding</dt>
            <dd className="mt-1 font-mono text-lg font-semibold text-ink">
              {formatMinor(loan.outstandingMinor, loan.currency)}
            </dd>
          </dl>
        </Card>
        <Card>
          <dl>
            <dt className="text-xs uppercase tracking-wide text-ink/60">Instalments paid</dt>
            <dd className="mt-1 font-mono text-lg font-semibold text-ink">
              {instalmentsPaid} / {totalInstalments}
            </dd>
          </dl>
        </Card>
        <Card>
          <dl>
            <dt className="text-xs uppercase tracking-wide text-ink/60">Days in arrears</dt>
            <dd className={`mt-1 font-mono text-lg font-semibold ${loan.daysInArrears > 0 ? 'text-clay' : 'text-emerald-700'}`}>
              {loan.daysInArrears}
            </dd>
          </dl>
        </Card>
      </section>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <h2 className="text-sm font-semibold text-ink">Loan details</h2>
          <dl className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-3">
            <Field label="Monthly instalment" value={formatMinor(loan.monthlyInstalmentMinor, loan.currency)} mono />
            <Field label="Interest rate" value={`${bpsToPct(loan.interestRateBps)} p.a.`} />
            <Field label="Tenor" value={`${loan.tenorMonths} months`} />
            <Field label="Disbursed" value={new Date(loan.disbursedAt).toLocaleDateString('en-GB')} />
            <Field label="Maturity" value={new Date(loan.maturityAt).toLocaleDateString('en-GB')} />
            <Field label="Missed instalments" value={String(loan.missedInstalments)} />
            {loan.nextDueAt ? (
              <Field label="Next due" value={new Date(loan.nextDueAt).toLocaleDateString('en-GB')} />
            ) : null}
          </dl>
        </Card>

        <Card>
          <h2 className="text-sm font-semibold text-ink">Guarantees</h2>
          {guarantees.length === 0 ? (
            <p className="mt-3 text-sm text-ink/60">No guarantees on this loan.</p>
          ) : (
            <ul className="mt-3 space-y-3">
              {guarantees.map((g) => (
                <li key={g.id} className="rounded-lg border border-ink/10 p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium text-ink">{g.guarantorName}</p>
                      <p className="text-xs text-ink/60">{g.guarantorNumber}</p>
                    </div>
                    <span className="inline-flex rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800">
                      {GUARANTEE_STATUS_LABELS[g.status]}
                    </span>
                  </div>
                  <p className="mt-2 font-mono text-xs text-ink">
                    {formatMinor(g.amountMinor, g.currency)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <Card className="mt-4">
        <h2 className="text-sm font-semibold text-ink">Manual ledger adjustment</h2>
        {!canOperate ? (
          <p className="mt-2 text-sm text-ink/60">
            Your role can view the loan but not adjust it. Credit Officer, Credit Manager, or Super Admin only.
          </p>
        ) : adjustSubmitted ? (
          <div role="status" className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
            Adjustment recorded in this session. In production the ledger entry would be written as a
            double-entry pair (adjustment account — loan account) after four-eyes approval from a second
            officer. Corrections to the ledger are reversing entries, never edits.
          </div>
        ) : adjustOpen ? (
          <form onSubmit={submitAdjustment} className="mt-3">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div>
                <label htmlFor="adj-amount" className="block text-xs font-medium text-ink/70">
                  Adjustment amount (KES, positive to debit)
                </label>
                <input
                  id="adj-amount"
                  type="number"
                  step="0.01"
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(e.target.value)}
                  className="mt-1 w-full rounded-md border border-ink/15 bg-paper px-3 py-2 font-mono text-sm text-ink focus:border-sky focus:outline-none focus:ring-2 focus:ring-sky/40"
                />
              </div>
            </div>
            <div className="mt-3">
              <label htmlFor="adj-reason" className="block text-xs font-medium text-ink/70">
                Reason (minimum 30 characters, audited)
              </label>
              <textarea
                id="adj-reason"
                rows={3}
                value={adjustReason}
                onChange={(e) => setAdjustReason(e.target.value)}
                className="mt-1 w-full rounded-md border border-ink/15 bg-paper px-3 py-2 text-sm text-ink focus:border-sky focus:outline-none focus:ring-2 focus:ring-sky/40"
                aria-invalid={adjustError ? 'true' : 'false'}
                aria-describedby={adjustError ? 'adj-error' : undefined}
              />
              {adjustError ? (
                <p id="adj-error" role="alert" className="mt-1 text-xs text-red-700">{adjustError}</p>
              ) : (
                <p className="mt-1 text-xs text-ink/60">{adjustReason.length} / 30 minimum</p>
              )}
            </div>
            <div className="mt-4 flex gap-2">
              <Button variant="primary" type="submit">Raise adjustment for four-eyes</Button>
              <Button
                variant="outline"
                type="button"
                onClick={() => {
                  setAdjustOpen(false);
                  setAdjustAmount('');
                  setAdjustReason('');
                  setAdjustError(null);
                }}
              >
                Cancel
              </Button>
            </div>
            <p role="note" className="mt-3 text-xs text-clay">
              Manual adjustments to any loan ledger account require four-eyes. This initiation does not
              move money — it creates a pending approval that a second officer must confirm.
            </p>
          </form>
        ) : (
          <div className="mt-3">
            <Button variant="outline" onClick={() => setAdjustOpen(true)}>Raise manual adjustment</Button>
          </div>
        )}
      </Card>

      <Card className="mt-4">
        <h2 className="text-sm font-semibold text-ink">CRB submissions for this loan</h2>
        {crbSubs.length === 0 ? (
          <p className="mt-3 text-sm text-ink/60">No CRB submissions yet.</p>
        ) : (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <caption className="sr-only">CRB submissions</caption>
              <thead className="border-b border-ink/10 text-xs uppercase tracking-wide text-ink/60">
                <tr>
                  <th scope="col" className="py-2 pr-4">Reference</th>
                  <th scope="col" className="py-2 pr-4">Event</th>
                  <th scope="col" className="py-2 pr-4">Status</th>
                  <th scope="col" className="py-2 pr-4">Submitted</th>
                  <th scope="col" className="py-2 pr-4">CRB ref</th>
                </tr>
              </thead>
              <tbody>
                {crbSubs.map((c) => (
                  <tr key={c.id} className="border-b border-ink/5">
                    <td className="py-2 pr-4 font-mono text-xs text-ink">{c.reference}</td>
                    <td className="py-2 pr-4 text-xs">{c.eventType}</td>
                    <td className="py-2 pr-4">
                      <span className="inline-flex rounded-full bg-sky/15 px-2 py-0.5 text-xs font-medium text-sky">
                        {CRB_STATUS_LABELS[c.status]}
                      </span>
                    </td>
                    <td className="py-2 pr-4 text-xs text-ink/70">
                      {new Date(c.submittedAt).toLocaleDateString('en-GB')}
                    </td>
                    <td className="py-2 pr-4 font-mono text-xs text-ink/70">{c.crbReference ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}