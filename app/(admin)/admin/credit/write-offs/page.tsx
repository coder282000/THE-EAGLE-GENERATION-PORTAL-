'use client';

// ADM-128 — Write-off Approval (four-eyes, two-stage)
// Route: /admin/credit/write-offs

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/card';
import {
  getWriteOffs,
  getWriteOffCounts,
  canViewCredit,
  canDecideCredit,
  canApproveFinance,
  canApproveWriteOff,
  WRITE_OFF_STATUS_LABELS,
  formatMinor,
  type WriteOffStatus,
} from '@/lib/mock/credit';

type Filter = 'ALL' | WriteOffStatus;

const STATUS_TONE: Record<WriteOffStatus, string> = {
  PENDING: 'bg-clay/15 text-clay',
  CREDIT_APPROVED: 'bg-sky/15 text-sky',
  FINANCE_APPROVED: 'bg-emerald-100 text-emerald-800',
  REJECTED: 'bg-red-100 text-red-800',
};

function Kpi({ label, value, tone }: { label: string; value: string; tone?: 'clay' | 'red' | 'emerald' }) {
  const cls =
    tone === 'red' ? 'text-red-700' : tone === 'clay' ? 'text-clay' : tone === 'emerald' ? 'text-emerald-700' : 'text-ink';
  return (
    <Card>
      <dl>
        <dt className="text-xs uppercase tracking-wide text-ink/60">{label}</dt>
        <dd className={`mt-1 text-2xl font-semibold ${cls}`}>{value}</dd>
      </dl>
    </Card>
  );
}

export default function WriteOffsPage() {
  const allowed = canViewCredit();
  const canCreditApprove = canDecideCredit();
  const canFinApprove = canApproveFinance();

  const writeOffs = useMemo(() => (allowed ? getWriteOffs() : []), [allowed]);
  const counts = useMemo(() => getWriteOffCounts(), []);

  const [filter, setFilter] = useState<Filter>('ALL');
  const [actioned, setActioned] = useState<Record<string, { stage: 'CREDIT' | 'FINANCE'; action: 'APPROVED' | 'REJECTED' }>>({});
  const [openId, setOpenId] = useState<string | null>(null);
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let list = writeOffs;
    if (filter !== 'ALL') list = list.filter((w) => w.status === filter);
    return list;
  }, [writeOffs, filter]);

  if (!allowed) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <Card>
          <h1 className="text-lg font-semibold text-ink">Permission denied</h1>
          <p className="mt-2 text-sm text-ink/70">You do not have access to the credit panel.</p>
        </Card>
      </div>
    );
  }

  function tryAction(id: string, wo: { proposedBy: string; creditApprovedBy?: string }, stage: 'CREDIT' | 'FINANCE', action: 'APPROVED' | 'REJECTED') {
    if (action === 'APPROVED' && !canApproveWriteOff({ proposedBy: wo.proposedBy, creditApprovedBy: wo.creditApprovedBy }, stage)) {
      setError(
        stage === 'CREDIT'
          ? 'Four-eyes: only the Credit Manager can approve a write-off, and never one they proposed.'
          : 'Four-eyes: Finance approval must come from a different user than the one who gave credit approval, and must be a Finance Officer or Super Admin.'
      );
      return;
    }
    if (reason.trim().length < 30) {
      setError('Reason must be at least 30 characters — write-offs are the highest-consequence credit action.');
      return;
    }
    setError(null);
    setActioned((a) => ({ ...a, [id]: { stage, action } }));
    setReason('');
    setOpenId(null);
  }

  return (
    <div className="p-6">
      <nav aria-label="Breadcrumb" className="mb-3 text-xs text-ink/60">
        <Link href="/admin/credit" className="hover:text-sky">Credit</Link>
        <span className="mx-2">/</span>
        <span className="text-ink">Write-offs</span>
      </nav>

      <header className="mb-6">
        <p className="text-xs uppercase tracking-wide text-ink/60">PNL-10 · Credit</p>
        <h1 className="mt-1 text-2xl font-semibold text-ink">Write-off Approval</h1>
        <p className="mt-1 text-sm text-ink/70">
          Two-stage four-eyes: credit approval by the Credit Manager, then finance approval by a Finance
          Officer. Distinct users at each stage, neither the proposer.
        </p>
      </header>

      <section aria-label="Write-off counts" className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Kpi label="Total" value={String(counts.total)} />
        <Kpi label="Pending credit" value={String(counts.pending)} tone={counts.pending > 0 ? 'clay' : undefined} />
        <Kpi label="Awaiting finance" value={String(counts.creditApproved)} tone={counts.creditApproved > 0 ? 'clay' : undefined} />
        <Kpi label="Approved" value={String(counts.financeApproved)} tone="emerald" />
      </section>

      {error ? (
        <div role="alert" className="mt-4 rounded-lg border border-clay/40 bg-clay/5 p-3 text-sm text-ink">
          {error}
        </div>
      ) : null}

      <Card className="mt-6">
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label htmlFor="wo-status" className="block text-xs font-medium text-ink/70">View</label>
            <select
              id="wo-status"
              value={filter}
              onChange={(e) => setFilter(e.target.value as Filter)}
              className="mt-1 rounded-md border border-ink/15 bg-paper px-3 py-2 text-sm text-ink focus:border-sky focus:outline-none focus:ring-2 focus:ring-sky/40"
            >
              <option value="ALL">All statuses</option>
              {(Object.keys(WRITE_OFF_STATUS_LABELS) as WriteOffStatus[]).map((s) => (
                <option key={s} value={s}>{WRITE_OFF_STATUS_LABELS[s]}</option>
              ))}
            </select>
          </div>
          <div className="ml-auto text-xs text-ink/60">
            Showing {filtered.length} of {writeOffs.length}
          </div>
        </div>
      </Card>

      <div className="mt-4 space-y-4">
        {filtered.length === 0 ? (
          <Card>
            <p className="text-center text-sm text-ink/60">No write-off requests match the current view.</p>
          </Card>
        ) : (
          filtered.map((w) => {
            const action = actioned[w.id];
            const needsCredit = w.status === 'PENDING' && !action;
            const needsFinance = w.status === 'CREDIT_APPROVED' && !action;
            return (
              <Card key={w.id}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-mono text-sm font-semibold text-ink">{w.reference}</h2>
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_TONE[w.status]}`}>
                        {WRITE_OFF_STATUS_LABELS[w.status]}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-ink">
                      {w.memberName} · {w.memberNumber}
                    </p>
                    <p className="mt-1 text-xs text-ink/60">
                      Loan {w.loanReference} · proposed by {w.proposedBy} on{' '}
                      {new Date(w.proposedAt).toLocaleString('en-GB')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs uppercase tracking-wide text-ink/60">Outstanding</p>
                    <p className="font-mono text-lg font-semibold text-ink">
                      {formatMinor(w.outstandingMinor, w.currency)}
                    </p>
                  </div>
                </div>

                <div className="mt-3">
                  <dt className="text-xs uppercase tracking-wide text-ink/60">Reason</dt>
                  <dd className="mt-1 whitespace-pre-wrap text-sm text-ink">{w.reason}</dd>
                </div>

                <dl className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-3">
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-ink/60">Credit approval</dt>
                    <dd className="mt-1 text-sm text-ink">
                      {w.creditApprovedBy
                        ? `${w.creditApprovedBy} · ${w.creditApprovedAt ? new Date(w.creditApprovedAt).toLocaleDateString('en-GB') : ''}`
                        : 'Awaiting'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-ink/60">Finance approval</dt>
                    <dd className="mt-1 text-sm text-ink">
                      {w.financeApprovedBy
                        ? `${w.financeApprovedBy} · ${w.financeApprovedAt ? new Date(w.financeApprovedAt).toLocaleDateString('en-GB') : ''}`
                        : 'Awaiting'}
                    </dd>
                  </div>
                </dl>

                {action ? (
                  <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
                    {action.stage} stage {action.action === 'APPROVED' ? 'approved' : 'rejected'} in this session.
                  </div>
                ) : needsCredit || needsFinance ? (
                  <div className="mt-4">
                    {openId === w.id ? (
                      <div>
                        <label htmlFor={`wo-reason-${w.id}`} className="block text-xs font-medium text-ink/70">
                          Reason (minimum 30 characters, audited)
                        </label>
                        <textarea
                          id={`wo-reason-${w.id}`}
                          rows={3}
                          value={reason}
                          onChange={(e) => setReason(e.target.value)}
                          className="mt-1 w-full rounded-md border border-ink/15 bg-paper px-3 py-2 text-sm text-ink focus:border-sky focus:outline-none focus:ring-2 focus:ring-sky/40"
                        />
                        <div className="mt-3 flex gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              tryAction(
                                w.id,
                                { proposedBy: w.proposedBy, creditApprovedBy: w.creditApprovedBy },
                                needsCredit ? 'CREDIT' : 'FINANCE',
                                'APPROVED'
                              )
                            }
                            disabled={needsCredit ? !canCreditApprove : !canFinApprove}
                            className={`rounded-md px-3 py-1.5 text-sm font-medium ${
                              (needsCredit ? canCreditApprove : canFinApprove)
                                ? 'bg-sky text-white hover:bg-sky/90'
                                : 'cursor-not-allowed bg-ink/10 text-ink/50'
                            }`}
                          >
                            {needsCredit ? 'Approve (credit)' : 'Approve (finance)'}
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              tryAction(
                                w.id,
                                { proposedBy: w.proposedBy, creditApprovedBy: w.creditApprovedBy },
                                needsCredit ? 'CREDIT' : 'FINANCE',
                                'REJECTED'
                              )
                            }
                            className="rounded-md border border-red-300 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50"
                          >
                            Reject
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setOpenId(null);
                              setReason('');
                            }}
                            className="rounded-md border border-ink/20 bg-paper px-3 py-1.5 text-sm font-medium text-ink hover:bg-ink/5"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setOpenId(w.id);
                          setReason('');
                          setError(null);
                        }}
                        className="rounded-md border border-ink/20 bg-paper px-3 py-1.5 text-sm font-medium text-ink hover:bg-ink/5"
                      >
                        {needsCredit ? 'Record credit decision' : 'Record finance decision'}
                      </button>
                    )}
                  </div>
                ) : null}
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}