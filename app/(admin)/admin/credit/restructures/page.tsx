'use client';

// ADM-127 — Restructure / Reschedule Workspace (four-eyes)
// Route: /admin/credit/restructures

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/card';
import {
  getRestructures,
  getRestructureCounts,
  canViewCredit,
  canDecideCredit,
  canApproveRestructure,
  RESTRUCTURE_STATUS_LABELS,
  formatMinor,
  type RestructureStatus,
} from '@/lib/mock/credit';

type Filter = 'ALL' | RestructureStatus;

const STATUS_TONE: Record<RestructureStatus, string> = {
  PENDING: 'bg-clay/15 text-clay',
  APPROVED: 'bg-emerald-100 text-emerald-800',
  REJECTED: 'bg-red-100 text-red-800',
  WITHDRAWN: 'bg-ink/10 text-ink/70',
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

export default function RestructuresPage() {
  const allowed = canViewCredit();
  const canApprove = canDecideCredit();

  const requests = useMemo(() => (allowed ? getRestructures() : []), [allowed]);
  const counts = useMemo(() => getRestructureCounts(), []);

  const [filter, setFilter] = useState<Filter>('PENDING');
  const [actioned, setActioned] = useState<Record<string, 'APPROVED' | 'REJECTED'>>({});
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let list = requests;
    if (filter !== 'ALL') list = list.filter((r) => r.status === filter);
    return list;
  }, [requests, filter]);

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

  function tryAction(id: string, proposedBy: string, action: 'APPROVED' | 'REJECTED') {
    if (action === 'APPROVED' && !canApproveRestructure({ proposedBy })) {
      setError(
        'Four-eyes: a restructure cannot be approved by the officer who proposed it, and only the Credit Manager can approve.'
      );
      return;
    }
    if (reason.trim().length < 20) {
      setError('Reason must be at least 20 characters — this becomes part of the credit file.');
      return;
    }
    setError(null);
    setActioned((a) => ({ ...a, [id]: action }));
    setReason('');
    setOpenId(null);
  }

  return (
    <div className="p-6">
      <nav aria-label="Breadcrumb" className="mb-3 text-xs text-ink/60">
        <Link href="/admin/credit" className="hover:text-sky">Credit</Link>
        <span className="mx-2">/</span>
        <span className="text-ink">Restructures</span>
      </nav>

      <header className="mb-6">
        <p className="text-xs uppercase tracking-wide text-ink/60">PNL-10 · Credit</p>
        <h1 className="mt-1 text-2xl font-semibold text-ink">Restructure and Reschedule</h1>
        <p className="mt-1 text-sm text-ink/70">
          Variations to a loan when a member cannot pay as originally agreed. Every restructure is
          four-eyes — proposer ≠ approver.
        </p>
      </header>

      <section aria-label="Restructure counts" className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Kpi label="Total requests" value={String(counts.total)} />
        <Kpi label="Pending" value={String(counts.pending)} tone={counts.pending > 0 ? 'clay' : undefined} />
        <Kpi label="Approved" value={String(counts.approved)} tone="emerald" />
        <Kpi label="Rejected" value={String(counts.rejected)} />
      </section>

      {error ? (
        <div role="alert" className="mt-4 rounded-lg border border-clay/40 bg-clay/5 p-3 text-sm text-ink">
          {error}
        </div>
      ) : null}

      <Card className="mt-6">
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label htmlFor="rs-status" className="block text-xs font-medium text-ink/70">View</label>
            <select
              id="rs-status"
              value={filter}
              onChange={(e) => setFilter(e.target.value as Filter)}
              className="mt-1 rounded-md border border-ink/15 bg-paper px-3 py-2 text-sm text-ink focus:border-sky focus:outline-none focus:ring-2 focus:ring-sky/40"
            >
              <option value="PENDING">Pending</option>
              <option value="ALL">All statuses</option>
              {(Object.keys(RESTRUCTURE_STATUS_LABELS) as RestructureStatus[]).map((s) => (
                <option key={s} value={s}>{RESTRUCTURE_STATUS_LABELS[s]}</option>
              ))}
            </select>
          </div>
          <div className="ml-auto text-xs text-ink/60">
            Showing {filtered.length} of {requests.length}
          </div>
        </div>
      </Card>

      <div className="mt-4 space-y-4">
        {filtered.length === 0 ? (
          <Card>
            <p className="text-center text-sm text-ink/60">No restructure requests match the current view.</p>
          </Card>
        ) : (
          filtered.map((r) => {
            const action = actioned[r.id];
            const isPending = r.status === 'PENDING';
            return (
              <Card key={r.id}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-mono text-sm font-semibold text-ink">{r.reference}</h2>
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_TONE[r.status]}`}>
                        {RESTRUCTURE_STATUS_LABELS[r.status]}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-ink">
                      {r.memberName} · {r.loanReference}
                    </p>
                    <p className="mt-1 text-xs text-ink/60">
                      Proposed by {r.proposedBy} on {new Date(r.proposedAt).toLocaleString('en-GB')}
                    </p>
                  </div>
                </div>

                <dl className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-3">
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-ink/60">New tenor</dt>
                    <dd className="mt-1 font-mono text-sm text-ink">{r.newTenorMonths} months</dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-ink/60">New instalment</dt>
                    <dd className="mt-1 font-mono text-sm text-ink">
                      {formatMinor(r.newInstalmentMinor, 'KES')}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-ink/60">Loan</dt>
                    <dd className="mt-1 text-sm">
                      <Link
                        href={`/admin/credit/loans/${r.loanId}`}
                        className="text-sky hover:underline"
                      >
                        Open loan →
                      </Link>
                    </dd>
                  </div>
                </dl>

                <div className="mt-3">
                  <dt className="text-xs uppercase tracking-wide text-ink/60">Reason</dt>
                  <dd className="mt-1 whitespace-pre-wrap text-sm text-ink">{r.reason}</dd>
                </div>

                {r.decidedBy ? (
                  <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
                    Decided by {r.decidedBy} on{' '}
                    {r.decidedAt ? new Date(r.decidedAt).toLocaleString('en-GB') : '—'}.
                    {r.decisionReason ? <p className="mt-1">{r.decisionReason}</p> : null}
                  </div>
                ) : action ? (
                  <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
                    Restructure marked {action === 'APPROVED' ? 'approved' : 'rejected'} in this session.
                    In production the loan schedule would be updated and the member notified.
                  </div>
                ) : isPending ? (
                  <div className="mt-4">
                    {openId === r.id ? (
                      <div>
                        <label htmlFor={`rs-reason-${r.id}`} className="block text-xs font-medium text-ink/70">
                          Decision reason (minimum 20 characters, audited)
                        </label>
                        <textarea
                          id={`rs-reason-${r.id}`}
                          rows={3}
                          value={reason}
                          onChange={(e) => setReason(e.target.value)}
                          className="mt-1 w-full rounded-md border border-ink/15 bg-paper px-3 py-2 text-sm text-ink focus:border-sky focus:outline-none focus:ring-2 focus:ring-sky/40"
                        />
                        <div className="mt-3 flex gap-2">
                          <button
                            type="button"
                            onClick={() => tryAction(r.id, r.proposedBy, 'APPROVED')}
                            disabled={!canApprove}
                            className={`rounded-md px-3 py-1.5 text-sm font-medium ${
                              canApprove
                                ? 'bg-sky text-white hover:bg-sky/90'
                                : 'cursor-not-allowed bg-ink/10 text-ink/50'
                            }`}
                          >
                            Approve restructure
                          </button>
                          <button
                            type="button"
                            onClick={() => tryAction(r.id, r.proposedBy, 'REJECTED')}
                            disabled={!canApprove}
                            className={`rounded-md border px-3 py-1.5 text-sm font-medium ${
                              canApprove
                                ? 'border-red-300 text-red-700 hover:bg-red-50'
                                : 'cursor-not-allowed border-ink/10 text-ink/30'
                            }`}
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
                        {!canApprove ? (
                          <p className="mt-2 text-xs text-clay">
                            Only the Credit Manager can approve, and never a restructure they proposed.
                          </p>
                        ) : null}
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setOpenId(r.id);
                          setReason('');
                          setError(null);
                        }}
                        className="rounded-md border border-ink/20 bg-paper px-3 py-1.5 text-sm font-medium text-ink hover:bg-ink/5"
                      >
                        Make decision
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