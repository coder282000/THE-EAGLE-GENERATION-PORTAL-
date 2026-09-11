'use client';

// ADM-175 — Failed Payout and Recall Handling
// Route: /admin/remittance/recalls

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/button';
import { Card } from '@/components/card';
import {
  getTransfers,
  canViewRemittance,
  canInterveneTransfer,
  RAIL_LABELS,
  formatMinor,
  type TransferStatus,
} from '@/lib/mock/remittance';

type RecallStatus = Extract<TransferStatus, 'FAILED' | 'RECALLED' | 'REFUNDED'>;

const RECALL_STATUSES: RecallStatus[] = ['FAILED', 'RECALLED', 'REFUNDED'];

const STATUS_TONE: Record<RecallStatus, string> = {
  FAILED: 'bg-red-100 text-red-800',
  RECALLED: 'bg-clay/15 text-clay',
  REFUNDED: 'bg-emerald-100 text-emerald-800',
};

const STATUS_LABELS: Record<RecallStatus, string> = {
  FAILED: 'Failed',
  RECALLED: 'Recalled',
  REFUNDED: 'Refunded',
};

export default function RecallQueuePage() {
  const allowed = canViewRemittance();
  const canAct = canInterveneTransfer();

  const transfers = useMemo(() => (allowed ? getTransfers() : []), [allowed]);
  const [statusFilter, setStatusFilter] = useState<'ALL' | RecallStatus>('ALL');
  const [query, setQuery] = useState('');

  const failedTransfers = useMemo(
    () => transfers.filter((t) => RECALL_STATUSES.includes(t.status as RecallStatus)),
    [transfers]
  );

  const filtered = useMemo(() => {
    let list = failedTransfers;
    if (statusFilter !== 'ALL') list = list.filter((t) => t.status === statusFilter);
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (t) =>
          t.reference.toLowerCase().includes(q) ||
          t.recipientName.toLowerCase().includes(q) ||
          t.corridorCode.toLowerCase().includes(q)
      );
    }
    return list;
  }, [failedTransfers, statusFilter, query]);

  if (!allowed) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <Card>
          <h1 className="text-lg font-semibold text-ink">Permission denied</h1>
          <p className="mt-2 text-sm text-ink/70">You do not have access to remittance operations.</p>
        </Card>
      </div>
    );
  }

  const failedCount = failedTransfers.filter((t) => t.status === 'FAILED').length;
  const recalledCount = failedTransfers.filter((t) => t.status === 'RECALLED').length;
  const refundedCount = failedTransfers.filter((t) => t.status === 'REFUNDED').length;

  return (
    <div className="p-6">
      <header className="mb-6">
        <p className="text-xs uppercase tracking-wide text-ink/60">PNL-14 · Remittance Operations</p>
        <h1 className="mt-1 text-2xl font-semibold text-ink">Failed Payouts and Recalls</h1>
        <p className="mt-1 text-sm text-ink/70">
          Every failed payout and its recall path. Target: refund confirmed within 72 hours of failure.
        </p>
      </header>

      <section aria-label="Recall queue counts" className="grid grid-cols-2 gap-4 md:grid-cols-3">
        <Card>
          <dl>
            <dt className="text-xs uppercase tracking-wide text-ink/60">Awaiting action (FAILED)</dt>
            <dd className="mt-1 text-2xl font-semibold text-red-700">{failedCount}</dd>
            <dd className="mt-1 text-xs text-ink/60">Raise recall or retry</dd>
          </dl>
        </Card>
        <Card>
          <dl>
            <dt className="text-xs uppercase tracking-wide text-ink/60">In recall</dt>
            <dd className="mt-1 text-2xl font-semibold text-clay">{recalledCount}</dd>
            <dd className="mt-1 text-xs text-ink/60">Awaiting partner return</dd>
          </dl>
        </Card>
        <Card>
          <dl>
            <dt className="text-xs uppercase tracking-wide text-ink/60">Refunded</dt>
            <dd className="mt-1 text-2xl font-semibold text-emerald-700">{refundedCount}</dd>
            <dd className="mt-1 text-xs text-ink/60">Member made whole</dd>
          </dl>
        </Card>
      </section>

      <Card className="mt-6">
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label htmlFor="recall-query" className="block text-xs font-medium text-ink/70">Search</label>
            <input
              id="recall-query"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Reference, recipient, corridor…"
              className="mt-1 w-64 rounded-md border border-ink/15 bg-paper px-3 py-2 text-sm text-ink focus:border-sky focus:outline-none focus:ring-2 focus:ring-sky/40"
            />
          </div>
          <div>
            <label htmlFor="recall-status" className="block text-xs font-medium text-ink/70">Status</label>
            <select
              id="recall-status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'ALL' | RecallStatus)}
              className="mt-1 rounded-md border border-ink/15 bg-paper px-3 py-2 text-sm text-ink focus:border-sky focus:outline-none focus:ring-2 focus:ring-sky/40"
            >
              <option value="ALL">All statuses</option>
              <option value="FAILED">Failed (awaiting action)</option>
              <option value="RECALLED">Recalled</option>
              <option value="REFUNDED">Refunded</option>
            </select>
          </div>
          <div className="ml-auto text-xs text-ink/60">
            Showing {filtered.length} of {failedTransfers.length}
          </div>
        </div>
      </Card>

      <Card className="mt-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <caption className="sr-only">Failed payout and recall queue</caption>
            <thead className="border-b border-ink/10 text-xs uppercase tracking-wide text-ink/60">
              <tr>
                <th scope="col" className="py-2 pr-4">Reference</th>
                <th scope="col" className="py-2 pr-4">Corridor</th>
                <th scope="col" className="py-2 pr-4">Recipient</th>
                <th scope="col" className="py-2 pr-4 text-right">Amount</th>
                <th scope="col" className="py-2 pr-4">Partner</th>
                <th scope="col" className="py-2 pr-4">Status</th>
                <th scope="col" className="py-2 pr-4">Reason</th>
                <th scope="col" className="py-2 pr-4">Updated</th>
                <th scope="col" className="py-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-sm text-ink/60">
                    No failed or recalled transfers match the current filters.
                  </td>
                </tr>
              ) : (
                filtered.map((t) => {
                  const status = t.status as RecallStatus;
                  const reason = t.failureReason ?? t.recallReason ?? '—';
                  return (
                    <tr key={t.id} className="border-b border-ink/5 hover:bg-paper">
                      <td className="py-2 pr-4 font-mono text-xs text-ink">{t.reference}</td>
                      <td className="py-2 pr-4 font-mono text-xs">{t.corridorCode}</td>
                      <td className="py-2 pr-4">
                        <div className="text-ink">{t.recipientName}</div>
                        <div className="text-xs text-ink/60">{t.recipientPhone}</div>
                      </td>
                      <td className="py-2 pr-4 text-right font-mono text-xs">
                        {formatMinor(t.sendAmountMinor, t.fromCurrency)}
                      </td>
                      <td className="py-2 pr-4 text-xs">
                        <div>{t.payoutPartnerName}</div>
                        <div className="text-ink/50">{RAIL_LABELS[t.rail]}</div>
                      </td>
                      <td className="py-2 pr-4">
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_TONE[status]}`}>
                          {STATUS_LABELS[status]}
                        </span>
                      </td>
                      <td className="py-2 pr-4 text-xs text-ink/80">{reason}</td>
                      <td className="py-2 pr-4 text-xs text-ink/60">
                        {new Date(t.updatedAt).toLocaleString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="py-2 text-right">
                        <Link
                          href={`/admin/remittance/transfers/${t.id}`}
                          className="text-xs font-medium text-sky hover:underline"
                        >
                          {canAct && status === 'FAILED' ? 'Intervene' : 'View'}
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="mt-6">
        <h2 className="text-sm font-semibold text-ink">Recall procedure</h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-ink/70">
          <li>Confirm the failure reason from the payout partner.</li>
          <li>Raise a recall intervention on the transfer workspace (four-eyes: second approver required).</li>
          <li>Notify the payout partner via the settlement portal within the corridor&apos;s cut-off window.</li>
          <li>Await partner confirmation — typically 1 to 3 business days.</li>
          <li>On confirmation, execute the refund to the originating wallet or M-Pesa number.</li>
          <li>Verify the refund appears in the ledger (PNL-09) and the member receives a notification.</li>
        </ol>
        <p className="mt-3 text-xs text-clay">
          Target: full recall cycle completed within 72 hours. Transfers older than 72 hours without a
          resolved recall should be escalated to the Compliance Lead.
        </p>
      </Card>
    </div>
  );
}