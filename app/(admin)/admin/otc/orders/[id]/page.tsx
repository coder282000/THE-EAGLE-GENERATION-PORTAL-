'use client';

// ADM-161 — OTC Order Detail and Manual Intervention
// Route: /admin/otc/orders/[id]

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Button } from '@/components/button';
import { Card } from '@/components/card';
import {
  getOTCOrderById,
  getEscrowByOrderId,
  getOTCDisputes,
  canViewOTC,
  canInterveneOrder,
  canApproveIntervention,
  OTC_ORDER_STATUS_LABELS,
  OTC_ORDER_SIDE_LABELS,
  OTC_NETWORK_LABELS,
  OTC_PAYMENT_METHOD_LABELS,
  OTC_DISPUTE_STATUS_LABELS,
  formatMinor,
  formatUsdtMicro,
  type OTCOrder,
  type OTCOrderStatus,
} from '@/lib/mock/otc';

const STATUS_TONE: Record<OTCOrderStatus, string> = {
  PENDING: 'bg-clay/15 text-clay',
  MATCHED: 'bg-sky/15 text-sky',
  ESCROW_HELD: 'bg-sky/15 text-sky',
  PAYMENT_SENT: 'bg-sky/15 text-sky',
  CRYPTO_RELEASED: 'bg-sky/15 text-sky',
  COMPLETED: 'bg-emerald-100 text-emerald-800',
  CANCELLED: 'bg-ink/10 text-ink/70',
  DISPUTED: 'bg-red-100 text-red-800',
  REFUNDED: 'bg-ink/10 text-ink/70',
};

const TERMINAL: OTCOrderStatus[] = ['COMPLETED', 'CANCELLED', 'REFUNDED'];

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-ink/60">{label}</dt>
      <dd className={`mt-1 text-sm text-ink ${mono ? 'font-mono text-xs' : ''}`}>{value}</dd>
    </div>
  );
}

export default function OTCOrderDetailPage() {
  const params = useParams<{ id: string }>();
  const order = useMemo<OTCOrder | null>(
    () => getOTCOrderById(params.id),
    [params.id]
  );
  const escrow = useMemo(
    () => (order ? getEscrowByOrderId(order.id) : null),
    [order]
  );
  const dispute = useMemo(
    () => (order ? getOTCDisputes().find((d) => d.orderId === order.id) ?? null : null),
    [order]
  );

  const canIntervene = canInterveneOrder();
  const isTerminal = order ? TERMINAL.includes(order.status) : false;

  const [interventionOpen, setInterventionOpen] = useState(false);
  const [interventionReason, setInterventionReason] = useState('');
  const [interventionAction, setInterventionAction] = useState<'CANCEL' | 'FORCE_COMPLETE' | 'REFUND'>('CANCEL');
  const [interventionSubmitted, setInterventionSubmitted] = useState(false);
  const [interventionError, setInterventionError] = useState<string | null>(null);

  const pendingIntervention = interventionSubmitted
    ? {
        initiatedBy: 'u-admin-01',
        reason: interventionReason,
        action: interventionAction,
        at: new Date().toISOString(),
      }
    : null;

  const canApprove = canApproveIntervention(pendingIntervention);

  if (!canViewOTC()) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <Card>
          <h1 className="text-lg font-semibold text-ink">Permission denied</h1>
          <p className="mt-2 text-sm text-ink/70">
            You do not have access to the OTC desk.
          </p>
          <Link href="/admin/dashboard" className="mt-3 inline-block text-sm text-sky hover:underline">
            Return to dashboard
          </Link>
        </Card>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <Card>
          <h1 className="text-lg font-semibold text-ink">Order not found</h1>
          <p className="mt-2 text-sm text-ink/70">
            No OTC order exists with the supplied id.
          </p>
          <Link href="/admin/otc" className="mt-3 inline-block text-sm text-sky hover:underline">
            Back to order book
          </Link>
        </Card>
      </div>
    );
  }

  function handleInterventionSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (interventionReason.trim().length < 20) {
      setInterventionError('Reason must be at least 20 characters.');
      return;
    }
    setInterventionError(null);
    setInterventionSubmitted(true);
  }

  return (
    <div className="p-6">
      <nav aria-label="Breadcrumb" className="mb-3 text-xs text-ink/60">
        <Link href="/admin/otc" className="hover:text-sky">OTC Desk</Link>
        <span className="mx-2">/</span>
        <span className="text-ink">{order.reference}</span>
      </nav>

      <header className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-ink/60">PNL-13 · Order</p>
          <h1 className="mt-1 font-mono text-2xl font-semibold text-ink">{order.reference}</h1>
          <p className="mt-1 text-sm text-ink/70">
            {OTC_ORDER_SIDE_LABELS[order.side]} · {order.memberName} ({order.memberNumber})
          </p>
        </div>
        <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${STATUS_TONE[order.status]}`}>
          {OTC_ORDER_STATUS_LABELS[order.status]}
        </span>
      </header>

      {order.status === 'DISPUTED' && dispute ? (
        <div role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-medium text-red-900">
            This order is disputed — {dispute.reference}
          </p>
          <p className="mt-1 text-sm text-red-800">
            {OTC_DISPUTE_STATUS_LABELS[dispute.status]} · opened by {dispute.raisedByName}
          </p>
          <Link href={`/admin/otc/disputes/${dispute.id}`} className="mt-2 inline-block text-sm font-medium text-red-900 underline">
            Open the dispute workspace
          </Link>
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <h2 className="text-sm font-semibold text-ink">Order details</h2>
          <dl className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-3">
            <Field label="Fiat amount" value={formatMinor(order.fiatAmountMinor, order.fiatCurrency)} mono />
            <Field label="Crypto amount" value={formatUsdtMicro(order.cryptoAmountMicro)} mono />
            <Field label="Rate (fiat per USDT)" value={order.rate.toFixed(2)} mono />
            <Field label="Spread" value={`${order.spreadBps} bps`} mono />
            <Field label="Network" value={OTC_NETWORK_LABELS[order.network]} />
            <Field label="Payment method" value={OTC_PAYMENT_METHOD_LABELS[order.paymentMethod]} />
            <Field label="Agent" value={order.agentName ?? '—'} />
            <Field label="Created" value={new Date(order.createdAt).toLocaleString('en-GB')} />
            <Field label="Updated" value={new Date(order.updatedAt).toLocaleString('en-GB')} />
          </dl>

          {order.txHash ? (
            <div className="mt-4">
              <dt className="text-xs uppercase tracking-wide text-ink/60">On-chain transaction</dt>
              <dd className="mt-1 break-all font-mono text-xs text-ink">{order.txHash}</dd>
            </div>
          ) : null}
        </Card>

        <Card>
          <h2 className="text-sm font-semibold text-ink">Escrow</h2>
          {escrow ? (
            <dl className="mt-4 space-y-3">
              <Field label="Status" value={escrow.status} />
              <Field label="Amount" value={formatMinor(escrow.amountMinor, escrow.currency)} mono />
              <Field label="Held at" value={new Date(escrow.heldAt).toLocaleString('en-GB')} />
              {escrow.releasedAt ? (
                <Field label="Released" value={new Date(escrow.releasedAt).toLocaleString('en-GB')} />
              ) : null}
              {escrow.reason ? <Field label="Reason" value={escrow.reason} /> : null}
            </dl>
          ) : (
            <p className="mt-3 text-sm text-ink/60">No escrow hold — order not yet matched.</p>
          )}
        </Card>
      </div>

      <Card className="mt-4">
        <h2 className="text-sm font-semibold text-ink">Manual intervention</h2>

        {!canIntervene ? (
          <p className="mt-2 text-sm text-ink/60">
            Your role cannot intervene on OTC orders. Finance Officer or Super Admin only.
          </p>
        ) : isTerminal && !pendingIntervention ? (
          <p className="mt-2 text-sm text-ink/60">
            This order is in a terminal state ({OTC_ORDER_STATUS_LABELS[order.status]}) and cannot be changed.
          </p>
        ) : pendingIntervention ? (
          <div className="mt-3 rounded-lg border border-sky/30 bg-sky/5 p-4">
            <p className="text-sm font-medium text-ink">Intervention pending second approval</p>
            <dl className="mt-3 grid grid-cols-2 gap-3">
              <Field label="Requested action" value={pendingIntervention.action.replace('_', ' ')} />
              <Field label="Initiated by" value={pendingIntervention.initiatedBy} />
              <Field label="Reason" value={pendingIntervention.reason} />
            </dl>
            <div className="mt-4 flex gap-2">
              <Button
                variant="primary"
                disabled={!canApprove}
                title={!canApprove ? 'Four-eyes: cannot approve own intervention' : undefined}
              >
                Approve and apply
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setInterventionSubmitted(false);
                  setInterventionReason('');
                }}
              >
                Withdraw
              </Button>
            </div>
            {!canApprove ? (
              <p role="note" className="mt-2 text-xs text-clay">
                Four-eyes rule: the initiator cannot approve their own intervention.
              </p>
            ) : null}
          </div>
        ) : (
          <form onSubmit={handleInterventionSubmit} className="mt-3">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div>
                <label htmlFor="intervention-action" className="block text-xs font-medium text-ink/70">
                  Action
                </label>
                <select
                  id="intervention-action"
                  value={interventionAction}
                  onChange={(e) => setInterventionAction(e.target.value as typeof interventionAction)}
                  className="mt-1 w-full rounded-md border border-ink/15 bg-paper px-3 py-2 text-sm text-ink focus:border-sky focus:outline-none focus:ring-2 focus:ring-sky/40"
                >
                  <option value="CANCEL">Cancel order</option>
                  <option value="FORCE_COMPLETE">Force complete</option>
                  <option value="REFUND">Refund escrow to member</option>
                </select>
              </div>
            </div>
            <div className="mt-3">
              <label htmlFor="intervention-reason" className="block text-xs font-medium text-ink/70">
                Reason (minimum 20 characters, audited)
              </label>
              <textarea
                id="intervention-reason"
                value={interventionReason}
                onChange={(e) => setInterventionReason(e.target.value)}
                rows={3}
                className="mt-1 w-full rounded-md border border-ink/15 bg-paper px-3 py-2 text-sm text-ink focus:border-sky focus:outline-none focus:ring-2 focus:ring-sky/40"
                aria-invalid={interventionError ? 'true' : 'false'}
                aria-describedby={interventionError ? 'intervention-error' : undefined}
              />
              {interventionError ? (
                <p id="intervention-error" role="alert" className="mt-1 text-xs text-red-700">
                  {interventionError}
                </p>
              ) : (
                <p className="mt-1 text-xs text-ink/60">
                  {interventionReason.length} / 20 minimum
                </p>
              )}
            </div>
            <div className="mt-4">
              <Button variant="primary" type="submit">
                Raise intervention for second approval
              </Button>
            </div>
          </form>
        )}
      </Card>

      <Card className="mt-4">
        <h2 className="text-sm font-semibold text-ink">Activity</h2>
        <ol className="mt-4 space-y-3 text-sm">
          <li className="flex gap-3">
            <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-sky" aria-hidden />
            <div>
              <p className="text-ink">Order created</p>
              <p className="text-xs text-ink/60">{new Date(order.createdAt).toLocaleString('en-GB')}</p>
            </div>
          </li>
          {order.matchedAt ? (
            <li className="flex gap-3">
              <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-sky" aria-hidden />
              <div>
                <p className="text-ink">Matched with {order.agentName}</p>
                <p className="text-xs text-ink/60">{new Date(order.matchedAt).toLocaleString('en-GB')}</p>
              </div>
            </li>
          ) : null}
          {order.escrowHeldAt ? (
            <li className="flex gap-3">
              <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-clay" aria-hidden />
              <div>
                <p className="text-ink">Escrow hold placed</p>
                <p className="text-xs text-ink/60">{new Date(order.escrowHeldAt).toLocaleString('en-GB')}</p>
              </div>
            </li>
          ) : null}
          {order.completedAt ? (
            <li className="flex gap-3">
              <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-emerald-600" aria-hidden />
              <div>
                <p className="text-ink">Order completed</p>
                <p className="text-xs text-ink/60">{new Date(order.completedAt).toLocaleString('en-GB')}</p>
              </div>
            </li>
          ) : null}
          {order.cancelledAt ? (
            <li className="flex gap-3">
              <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-ink/40" aria-hidden />
              <div>
                <p className="text-ink">Order cancelled</p>
                <p className="text-xs text-ink/60">{new Date(order.cancelledAt).toLocaleString('en-GB')}</p>
              </div>
            </li>
          ) : null}
          {order.disputedAt ? (
            <li className="flex gap-3">
              <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-red-600" aria-hidden />
              <div>
                <p className="text-ink">Dispute raised</p>
                <p className="text-xs text-ink/60">{new Date(order.disputedAt).toLocaleString('en-GB')}</p>
              </div>
            </li>
          ) : null}
        </ol>
      </Card>
    </div>
  );
}