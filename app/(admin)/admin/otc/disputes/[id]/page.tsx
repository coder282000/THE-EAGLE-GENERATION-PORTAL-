'use client';

// ADM-164 — Dispute Arbitration Workspace (detail)
// Route: /admin/otc/disputes/[id]

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Button } from '@/components/button';
import { Card } from '@/components/card';
import {
  getOTCDisputeById,
  getOTCOrderById,
  canViewOTC,
  canArbitrateDisputes,
  canResolveDispute,
  OTC_DISPUTE_STATUS_LABELS,
  formatMinor,
  type OTCDisputeStatus,
} from '@/lib/mock/otc';

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-ink/60">{label}</dt>
      <dd className="mt-1 text-sm text-ink">{value}</dd>
    </div>
  );
}

type Resolution = 'BUYER' | 'SELLER' | 'SPLIT';

export default function OTCDisputeDetailPage() {
  const params = useParams<{ id: string }>();
  const dispute = useMemo(() => getOTCDisputeById(params.id), [params.id]);
  const order = useMemo(
    () => (dispute ? getOTCOrderById(dispute.orderId) : null),
    [dispute]
  );

  const canArbitrate = canArbitrateDisputes();
  const canResolve = canResolveDispute(dispute);

  const [resolution, setResolution] = useState<Resolution>('BUYER');
  const [rationale, setRationale] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  if (!canViewOTC()) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <Card>
          <h1 className="text-lg font-semibold text-ink">Permission denied</h1>
          <p className="mt-2 text-sm text-ink/70">You do not have access to the OTC desk.</p>
        </Card>
      </div>
    );
  }

  if (!dispute) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <Card>
          <h1 className="text-lg font-semibold text-ink">Dispute not found</h1>
          <Link href="/admin/otc/disputes" className="mt-3 inline-block text-sm text-sky hover:underline">
            Back to disputes
          </Link>
        </Card>
      </div>
    );
  }

  const isResolved = Boolean(dispute.resolvedAt);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canResolve) {
      setError('You cannot resolve this dispute — you opened it, or you do not have arbitration rights.');
      return;
    }
    if (rationale.trim().length < 30) {
      setError('Rationale must be at least 30 characters — this is the arbitration record.');
      return;
    }
    setError(null);
    setSubmitted(true);
  }

  return (
    <div className="p-6">
      <nav aria-label="Breadcrumb" className="mb-3 text-xs text-ink/60">
        <Link href="/admin/otc" className="hover:text-sky">OTC Desk</Link>
        <span className="mx-2">/</span>
        <Link href="/admin/otc/disputes" className="hover:text-sky">Disputes</Link>
        <span className="mx-2">/</span>
        <span className="text-ink">{dispute.reference}</span>
      </nav>

      <header className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-ink/60">PNL-13 · Dispute</p>
          <h1 className="mt-1 font-mono text-2xl font-semibold text-ink">{dispute.reference}</h1>
          <p className="mt-1 text-sm text-ink/70">
            {dispute.raisedByName} against {dispute.againstName} · order {dispute.orderRef}
          </p>
        </div>
        <span className="inline-flex items-center rounded-full bg-sky/15 px-3 py-1 text-sm font-medium text-sky">
          {OTC_DISPUTE_STATUS_LABELS[dispute.status]}
        </span>
      </header>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <h2 className="text-sm font-semibold text-ink">Dispute details</h2>
          <dl className="mt-4 grid grid-cols-2 gap-4">
            <Field label="Reason" value={dispute.reason} />
            <Field label="Opened" value={new Date(dispute.openedAt).toLocaleString('en-GB')} />
            <Field label="SLA deadline" value={new Date(dispute.slaDeadline).toLocaleString('en-GB')} />
            <Field label="Assigned to" value={dispute.assignedTo ?? 'Unassigned'} />
          </dl>
          <div className="mt-4">
            <dt className="text-xs uppercase tracking-wide text-ink/60">Description</dt>
            <dd className="mt-1 whitespace-pre-wrap text-sm text-ink">{dispute.description}</dd>
          </div>
        </Card>

        <Card>
          <h2 className="text-sm font-semibold text-ink">Order context</h2>
          {order ? (
            <dl className="mt-4 space-y-3">
              <Field label="Order" value={order.reference} />
              <Field label="Side" value={order.side} />
              <Field label="Fiat" value={formatMinor(order.fiatAmountMinor, order.fiatCurrency)} />
              <Field label="Status" value={order.status} />
              <div>
                <dt className="text-xs uppercase tracking-wide text-ink/60">Open order</dt>
                <dd className="mt-1">
                  <Link
                    href={`/admin/otc/orders/${order.id}`}
                    className="text-sm text-sky hover:underline"
                  >
                    Open order workspace
                  </Link>
                </dd>
              </div>
            </dl>
          ) : (
            <p className="mt-3 text-sm text-ink/60">Order no longer available.</p>
          )}
        </Card>
      </div>

      <Card className="mt-4">
        <h2 className="text-sm font-semibold text-ink">Resolution</h2>

        {!canArbitrate ? (
          <p className="mt-2 text-sm text-ink/60">
            Your role cannot arbitrate disputes. Compliance Lead, Admin, or Super Admin only.
          </p>
        ) : isResolved ? (
          <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
            <p className="text-sm font-medium text-emerald-900">
              Resolved as {OTC_DISPUTE_STATUS_LABELS[dispute.status]}
            </p>
            <p className="mt-1 text-xs text-emerald-800">
              {new Date(dispute.resolvedAt!).toLocaleString('en-GB')}
            </p>
          </div>
        ) : submitted ? (
          <div className="mt-3 rounded-lg border border-sky/30 bg-sky/5 p-4">
            <p className="text-sm font-medium text-ink">Resolution submitted</p>
            <dl className="mt-3 grid grid-cols-2 gap-3">
              <Field label="Resolution" value={resolution} />
              <Field label="Rationale" value={rationale} />
            </dl>
            <p className="mt-3 text-xs text-ink/60">
              Escrow will be released to the {resolution === 'SPLIT' ? 'agreed split' : resolution.toLowerCase()} once
              a second arbitrator confirms in production. Notify both parties via the platform.
            </p>
          </div>
        ) : !canResolve ? (
          <div role="alert" className="mt-3 rounded-lg border border-clay/30 bg-clay/5 p-4">
            <p className="text-sm font-medium text-ink">
              Four-eyes rule: you cannot resolve a dispute you opened
            </p>
            <p className="mt-1 text-xs text-ink/70">
              A different arbitrator must complete this dispute. Escalating to another handler preserves
              independence.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-3">
            <fieldset>
              <legend className="text-xs font-medium text-ink/70">Resolve in favour of</legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {(['BUYER', 'SELLER', 'SPLIT'] as Resolution[]).map((r) => (
                  <label
                    key={r}
                    className={`cursor-pointer rounded-md border px-3 py-2 text-sm ${
                      resolution === r
                        ? 'border-sky bg-sky/10 text-sky'
                        : 'border-ink/15 bg-paper text-ink hover:bg-ink/5'
                    }`}
                  >
                    <input
                      type="radio"
                      name="resolution"
                      value={r}
                      checked={resolution === r}
                      onChange={() => setResolution(r)}
                      className="sr-only"
                    />
                    Resolve for {r.toLowerCase()}
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="mt-4">
              <label htmlFor="rationale" className="block text-xs font-medium text-ink/70">
                Rationale (minimum 30 characters — this becomes the arbitration record)
              </label>
              <textarea
                id="rationale"
                rows={4}
                value={rationale}
                onChange={(e) => setRationale(e.target.value)}
                className="mt-1 w-full rounded-md border border-ink/15 bg-paper px-3 py-2 text-sm text-ink focus:border-sky focus:outline-none focus:ring-2 focus:ring-sky/40"
                aria-invalid={error ? 'true' : 'false'}
                aria-describedby={error ? 'rationale-error' : undefined}
              />
              {error ? (
                <p id="rationale-error" role="alert" className="mt-1 text-xs text-red-700">{error}</p>
              ) : (
                <p className="mt-1 text-xs text-ink/60">{rationale.length} / 30 minimum</p>
              )}
            </div>

            <div className="mt-4">
              <Button variant="primary" type="submit">
                Submit resolution
              </Button>
            </div>
          </form>
        )}
      </Card>

      <Card className="mt-4">
        <h2 className="text-sm font-semibold text-ink">Timeline</h2>
        <ol className="mt-4 space-y-3 text-sm">
          <li className="flex gap-3">
            <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-clay" aria-hidden />
            <div>
              <p className="text-ink">Dispute opened by {dispute.raisedByName}</p>
              <p className="text-xs text-ink/60">{new Date(dispute.openedAt).toLocaleString('en-GB')}</p>
            </div>
          </li>
          {dispute.assignedTo ? (
            <li className="flex gap-3">
              <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-sky" aria-hidden />
              <div>
                <p className="text-ink">Assigned to {dispute.assignedTo}</p>
                <p className="text-xs text-ink/60">For investigation</p>
              </div>
            </li>
          ) : null}
          {dispute.resolvedAt ? (
            <li className="flex gap-3">
              <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-emerald-600" aria-hidden />
              <div>
                <p className="text-ink">Resolved — {OTC_DISPUTE_STATUS_LABELS[dispute.status]}</p>
                <p className="text-xs text-ink/60">{new Date(dispute.resolvedAt).toLocaleString('en-GB')}</p>
              </div>
            </li>
          ) : null}
        </ol>
      </Card>
    </div>
  );
}