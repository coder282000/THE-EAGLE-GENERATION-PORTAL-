'use client';

// ADM-171 — Transfer Detail and Intervention
// Route: /admin/remittance/transfers/[id]

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Button } from '@/components/button';
import { Card } from '@/components/card';
import {
  getTransferById,
  canViewRemittance,
  canInterveneTransfer,
  canApproveIntervention,
  TRANSFER_STATUS_LABELS,
  TRANSFER_DIRECTION_LABELS,
  RAIL_LABELS,
  formatMinor,
  type TransferStatus,
} from '@/lib/mock/remittance';

const STATUS_TONE: Record<TransferStatus, string> = {
  QUOTED: 'bg-clay/15 text-clay',
  CONFIRMED: 'bg-sky/15 text-sky',
  PAYMENT_RECEIVED: 'bg-sky/15 text-sky',
  PAYOUT_INITIATED: 'bg-sky/15 text-sky',
  PAYOUT_PROCESSING: 'bg-sky/15 text-sky',
  COMPLETED: 'bg-emerald-100 text-emerald-800',
  FAILED: 'bg-red-100 text-red-800',
  REFUNDED: 'bg-ink/10 text-ink/70',
  RECALLED: 'bg-red-100 text-red-800',
};

const TERMINAL: TransferStatus[] = ['COMPLETED', 'REFUNDED', 'RECALLED'];

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-ink/60">{label}</dt>
      <dd className={`mt-1 text-sm text-ink ${mono ? 'font-mono text-xs' : ''}`}>{value}</dd>
    </div>
  );
}

export default function TransferDetailPage() {
  const params = useParams<{ id: string }>();
  const transfer = useMemo(() => getTransferById(params.id), [params.id]);

  const canIntervene = canInterveneTransfer();
  const isTerminal = transfer ? TERMINAL.includes(transfer.status) : false;

  const [interventionOpen, setInterventionOpen] = useState(false);
  const [interventionAction, setInterventionAction] = useState<'RETRY' | 'RECALL' | 'REFUND'>('RETRY');
  const [interventionReason, setInterventionReason] = useState('');
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

  if (!canViewRemittance()) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <Card>
          <h1 className="text-lg font-semibold text-ink">Permission denied</h1>
          <p className="mt-2 text-sm text-ink/70">You do not have access to remittance operations.</p>
          <Link href="/admin/dashboard" className="mt-3 inline-block text-sm text-sky hover:underline">
            Return to dashboard
          </Link>
        </Card>
      </div>
    );
  }

  if (!transfer) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <Card>
          <h1 className="text-lg font-semibold text-ink">Transfer not found</h1>
          <p className="mt-2 text-sm text-ink/70">No transfer exists with the supplied id.</p>
          <Link href="/admin/remittance" className="mt-3 inline-block text-sm text-sky hover:underline">
            Back to queue
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
        <Link href="/admin/remittance" className="hover:text-sky">Remittance</Link>
        <span className="mx-2">/</span>
        <span className="text-ink">{transfer.reference}</span>
      </nav>

      <header className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-ink/60">PNL-14 · Transfer</p>
          <h1 className="mt-1 font-mono text-2xl font-semibold text-ink">{transfer.reference}</h1>
          <p className="mt-1 text-sm text-ink/70">
            {TRANSFER_DIRECTION_LABELS[transfer.direction]} · {transfer.corridorCode} · {RAIL_LABELS[transfer.rail]}
          </p>
        </div>
        <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${STATUS_TONE[transfer.status]}`}>
          {TRANSFER_STATUS_LABELS[transfer.status]}
        </span>
      </header>

      {transfer.status === 'FAILED' || transfer.status === 'RECALLED' ? (
        <div role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-medium text-red-900">
            {transfer.status === 'FAILED'
              ? `Payout failed: ${transfer.failureReason ?? 'No reason recorded'}`
              : `Transfer recalled: ${transfer.recallReason ?? 'No reason recorded'}`}
          </p>
          <Link href="/admin/remittance/recalls" className="mt-2 inline-block text-sm font-medium text-red-900 underline">
            Open the recall queue
          </Link>
        </div>
      ) : null}

      {!transfer.travelRuleComplete ? (
        <div role="note" className="mb-4 rounded-lg border border-clay/40 bg-clay/5 p-3 text-sm text-ink">
          <strong className="font-medium">Travel Rule data incomplete.</strong> Originator or beneficiary data
          is missing. This transfer cannot proceed until it is complete.
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <h2 className="text-sm font-semibold text-ink">Transfer details</h2>
          <dl className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-3">
            <Field label="Sender" value={transfer.senderName} />
            <Field label="Member number" value={transfer.senderMemberNumber} mono />
            <Field label="Recipient" value={transfer.recipientName} />
            <Field label="Recipient phone" value={transfer.recipientPhone} mono />
            <Field label="Send amount" value={formatMinor(transfer.sendAmountMinor, transfer.fromCurrency)} mono />
            <Field label="Fee" value={formatMinor(transfer.feeMinor, transfer.fromCurrency)} mono />
            <Field label="Payout amount" value={formatMinor(transfer.payoutAmountMinor, transfer.toCurrency)} mono />
            <Field label="FX rate" value={transfer.fxRate.toString()} mono />
            <Field label="Payout partner" value={transfer.payoutPartnerName} />
            <Field label="Travel Rule" value={transfer.travelRuleComplete ? 'Complete' : 'Incomplete'} />
            <Field label="Created" value={new Date(transfer.createdAt).toLocaleString('en-GB')} />
            <Field label="Updated" value={new Date(transfer.updatedAt).toLocaleString('en-GB')} />
          </dl>
        </Card>

        <Card>
          <h2 className="text-sm font-semibold text-ink">Settlement</h2>
          <dl className="mt-4 space-y-3">
            <Field label="Corridor" value={transfer.corridorCode} mono />
            <Field label="Rail" value={RAIL_LABELS[transfer.rail]} />
            <Field label="Payout partner" value={transfer.payoutPartnerName} />
            {transfer.completedAt ? (
              <Field label="Completed" value={new Date(transfer.completedAt).toLocaleString('en-GB')} />
            ) : (
              <Field label="Completed" value="—" />
            )}
          </dl>
        </Card>
      </div>

      <Card className="mt-4">
        <h2 className="text-sm font-semibold text-ink">Manual intervention</h2>

        {!canIntervene ? (
          <p className="mt-2 text-sm text-ink/60">
            Your role cannot intervene on transfers. Finance Officer or Super Admin only.
          </p>
        ) : isTerminal && !pendingIntervention ? (
          <p className="mt-2 text-sm text-ink/60">
            This transfer is in a terminal state ({TRANSFER_STATUS_LABELS[transfer.status]}) and cannot be changed.
          </p>
        ) : pendingIntervention ? (
          <div className="mt-3 rounded-lg border border-sky/30 bg-sky/5 p-4">
            <p className="text-sm font-medium text-ink">Intervention pending second approval</p>
            <dl className="mt-3 grid grid-cols-2 gap-3">
              <Field label="Requested action" value={pendingIntervention.action} />
              <Field label="Initiated by" value={pendingIntervention.initiatedBy} />
              <Field label="Reason" value={pendingIntervention.reason} />
            </dl>
            <div className="mt-4 flex gap-2">
              <Button variant="primary" disabled={!canApprove} title={!canApprove ? 'Four-eyes: cannot approve own intervention' : undefined}>
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
        ) : !interventionOpen ? (
          <div className="mt-3">
            <Button variant="outline" onClick={() => setInterventionOpen(true)}>
              Raise intervention
            </Button>
          </div>
        ) : (
          <form onSubmit={handleInterventionSubmit} className="mt-3">
            <div>
              <label htmlFor="int-action" className="block text-xs font-medium text-ink/70">Action</label>
              <select
                id="int-action"
                value={interventionAction}
                onChange={(e) => setInterventionAction(e.target.value as typeof interventionAction)}
                className="mt-1 w-full max-w-xs rounded-md border border-ink/15 bg-paper px-3 py-2 text-sm text-ink focus:border-sky focus:outline-none focus:ring-2 focus:ring-sky/40"
              >
                <option value="RETRY">Retry payout</option>
                <option value="RECALL">Recall to sender</option>
                <option value="REFUND">Refund sender</option>
              </select>
            </div>
            <div className="mt-3">
              <label htmlFor="int-reason" className="block text-xs font-medium text-ink/70">
                Reason (minimum 20 characters, audited)
              </label>
              <textarea
                id="int-reason"
                value={interventionReason}
                onChange={(e) => setInterventionReason(e.target.value)}
                rows={3}
                className="mt-1 w-full rounded-md border border-ink/15 bg-paper px-3 py-2 text-sm text-ink focus:border-sky focus:outline-none focus:ring-2 focus:ring-sky/40"
                aria-invalid={interventionError ? 'true' : 'false'}
                aria-describedby={interventionError ? 'int-error' : undefined}
              />
              {interventionError ? (
                <p id="int-error" role="alert" className="mt-1 text-xs text-red-700">{interventionError}</p>
              ) : (
                <p className="mt-1 text-xs text-ink/60">{interventionReason.length} / 20 minimum</p>
              )}
            </div>
            <div className="mt-4 flex gap-2">
              <Button variant="primary" type="submit">Raise intervention</Button>
              <Button variant="outline" type="button" onClick={() => setInterventionOpen(false)}>Cancel</Button>
            </div>
          </form>
        )}
      </Card>

      <Card className="mt-4">
        <h2 className="text-sm font-semibold text-ink">Timeline</h2>
        <ol className="mt-4 space-y-3 text-sm">
          <li className="flex gap-3">
            <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-sky" aria-hidden />
            <div>
              <p className="text-ink">Quote created</p>
              <p className="text-xs text-ink/60">{new Date(transfer.createdAt).toLocaleString('en-GB')}</p>
            </div>
          </li>
          {transfer.status !== 'QUOTED' ? (
            <li className="flex gap-3">
              <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-sky" aria-hidden />
              <div>
                <p className="text-ink">Transfer confirmed</p>
                <p className="text-xs text-ink/60">Payment received from member</p>
              </div>
            </li>
          ) : null}
          {transfer.completedAt ? (
            <li className="flex gap-3">
              <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-emerald-600" aria-hidden />
              <div>
                <p className="text-ink">Transfer completed</p>
                <p className="text-xs text-ink/60">{new Date(transfer.completedAt).toLocaleString('en-GB')}</p>
              </div>
            </li>
          ) : null}
          {transfer.failureReason ? (
            <li className="flex gap-3">
              <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-red-600" aria-hidden />
              <div>
                <p className="text-ink">Failed — {transfer.failureReason}</p>
                <p className="text-xs text-ink/60">{new Date(transfer.updatedAt).toLocaleString('en-GB')}</p>
              </div>
            </li>
          ) : null}
          {transfer.recallReason ? (
            <li className="flex gap-3">
              <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-red-600" aria-hidden />
              <div>
                <p className="text-ink">Recalled — {transfer.recallReason}</p>
                <p className="text-xs text-ink/60">{new Date(transfer.updatedAt).toLocaleString('en-GB')}</p>
              </div>
            </li>
          ) : null}
        </ol>
      </Card>
    </div>
  );
}