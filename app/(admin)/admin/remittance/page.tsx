'use client';

// ADM-170 — Transfer Queue and Status Board
// Route: /admin/remittance

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/card';
import {
  getTransfers,
  getTransferCounts,
  getCorridorCounts,
  getPartnerHealth,
  canViewRemittance,
  TRANSFER_STATUS_LABELS,
  TRANSFER_DIRECTION_LABELS,
  RAIL_LABELS,
  formatMinor,
  type TransferStatus,
  type TransferDirection,
} from '@/lib/mock/remittance';

type StatusFilter = 'ALL' | TransferStatus;
type DirectionFilter = 'ALL' | TransferDirection;

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

function Kpi({ label, value, hint, tone }: { label: string; value: string; hint?: string; tone?: 'clay' | 'red' }) {
  const cls = tone === 'red' ? 'text-red-700' : tone === 'clay' ? 'text-clay' : 'text-ink';
  return (
    <Card>
      <dl>
        <dt className="text-xs uppercase tracking-wide text-ink/60">{label}</dt>
        <dd className={`mt-1 text-2xl font-semibold ${cls}`}>{value}</dd>
        {hint ? <dd className="mt-1 text-xs text-ink/60">{hint}</dd> : null}
      </dl>
    </Card>
  );
}

export default function RemittanceQueuePage() {
  const allowed = canViewRemittance();
  const transfers = useMemo(() => (allowed ? getTransfers() : []), [allowed]);
  const counts = useMemo(() => getTransferCounts(), []);
  const corridorCounts = useMemo(() => getCorridorCounts(), []);
  const partnerHealth = useMemo(() => getPartnerHealth(), []);

  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [directionFilter, setDirectionFilter] = useState<DirectionFilter>('ALL');
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    let list = transfers;
    if (statusFilter !== 'ALL') list = list.filter((t) => t.status === statusFilter);
    if (directionFilter !== 'ALL') list = list.filter((t) => t.direction === directionFilter);
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (t) =>
          t.reference.toLowerCase().includes(q) ||
          t.senderName.toLowerCase().includes(q) ||
          t.recipientName.toLowerCase().includes(q) ||
          t.corridorCode.toLowerCase().includes(q)
      );
    }
    return list;
  }, [transfers, statusFilter, directionFilter, query]);

  if (!allowed) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <Card>
          <h1 className="text-lg font-semibold text-ink">Permission denied</h1>
          <p className="mt-2 text-sm text-ink/70">
            You do not have access to remittance operations. This panel is restricted to Finance Officer,
            Admin, Super Admin, and Compliance Lead roles.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6">
      <header className="mb-6">
        <p className="text-xs uppercase tracking-wide text-ink/60">PNL-14 · Remittance Operations</p>
        <h1 className="mt-1 text-2xl font-semibold text-ink">Transfer Queue and Status Board</h1>
        <p className="mt-1 text-sm text-ink/70">
          Every cross-border transfer, in every state, across every corridor.
        </p>
      </header>

      <section aria-label="Key figures" className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Kpi
          label="In flight"
          value={String(counts.inFlight)}
          hint={`${counts.total} total transfers`}
        />
        <Kpi
          label="Failed (24h)"
          value={String(counts.failed)}
          hint="Awaiting recall or retry"
          tone={counts.failed > 0 ? 'red' : undefined}
        />
        <Kpi
          label="Corridors active"
          value={`${corridorCounts.active} / ${corridorCounts.total}`}
          hint={
            corridorCounts.paused + corridorCounts.disabled > 0
              ? `${corridorCounts.paused} paused, ${corridorCounts.disabled} disabled`
              : 'All corridors live'
          }
        />
        <Kpi
          label="Partners healthy"
          value={`${partnerHealth.active} / ${partnerHealth.total}`}
          hint={
            partnerHealth.degraded + partnerHealth.offline > 0
              ? `${partnerHealth.degraded} degraded, ${partnerHealth.offline} offline`
              : 'All partners nominal'
          }
          tone={partnerHealth.offline > 0 ? 'red' : partnerHealth.degraded > 0 ? 'clay' : undefined}
        />
      </section>

      <Card className="mt-6">
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label htmlFor="rem-query" className="block text-xs font-medium text-ink/70">Search</label>
            <input
              id="rem-query"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Reference, sender, recipient, corridor…"
              className="mt-1 w-72 rounded-md border border-ink/15 bg-paper px-3 py-2 text-sm text-ink focus:border-sky focus:outline-none focus:ring-2 focus:ring-sky/40"
            />
          </div>
          <div>
            <label htmlFor="rem-direction" className="block text-xs font-medium text-ink/70">Direction</label>
            <select
              id="rem-direction"
              value={directionFilter}
              onChange={(e) => setDirectionFilter(e.target.value as DirectionFilter)}
              className="mt-1 rounded-md border border-ink/15 bg-paper px-3 py-2 text-sm text-ink focus:border-sky focus:outline-none focus:ring-2 focus:ring-sky/40"
            >
              <option value="ALL">All directions</option>
              <option value="OUTBOUND">Outbound</option>
              <option value="INBOUND">Inbound</option>
            </select>
          </div>
          <div>
            <label htmlFor="rem-status" className="block text-xs font-medium text-ink/70">Status</label>
            <select
              id="rem-status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              className="mt-1 rounded-md border border-ink/15 bg-paper px-3 py-2 text-sm text-ink focus:border-sky focus:outline-none focus:ring-2 focus:ring-sky/40"
            >
              <option value="ALL">All statuses</option>
              {(Object.keys(TRANSFER_STATUS_LABELS) as TransferStatus[]).map((s) => (
                <option key={s} value={s}>{TRANSFER_STATUS_LABELS[s]}</option>
              ))}
            </select>
          </div>
          <div className="ml-auto text-xs text-ink/60">
            Showing {filtered.length} of {transfers.length}
          </div>
        </div>
      </Card>

      <Card className="mt-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <caption className="sr-only">Remittance transfers</caption>
            <thead className="border-b border-ink/10 text-xs uppercase tracking-wide text-ink/60">
              <tr>
                <th scope="col" className="py-2 pr-4">Reference</th>
                <th scope="col" className="py-2 pr-4">Direction</th>
                <th scope="col" className="py-2 pr-4">Sender</th>
                <th scope="col" className="py-2 pr-4">Recipient</th>
                <th scope="col" className="py-2 pr-4">Corridor</th>
                <th scope="col" className="py-2 pr-4 text-right">Send</th>
                <th scope="col" className="py-2 pr-4 text-right">Payout</th>
                <th scope="col" className="py-2 pr-4">Status</th>
                <th scope="col" className="py-2 pr-4">Updated</th>
                <th scope="col" className="py-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-sm text-ink/60">
                    No transfers match the current filters.
                  </td>
                </tr>
              ) : (
                filtered.map((t) => (
                  <tr key={t.id} className="border-b border-ink/5 hover:bg-paper">
                    <td className="py-2 pr-4 font-mono text-xs text-ink">{t.reference}</td>
                    <td className="py-2 pr-4 text-xs">
                      <span className={t.direction === 'OUTBOUND' ? 'text-clay' : 'text-emerald-700'}>
                        {TRANSFER_DIRECTION_LABELS[t.direction]}
                      </span>
                    </td>
                    <td className="py-2 pr-4">
                      <div className="text-ink">{t.senderName}</div>
                      <div className="text-xs text-ink/60">{t.senderMemberNumber}</div>
                    </td>
                    <td className="py-2 pr-4">
                      <div className="text-ink">{t.recipientName}</div>
                      <div className="text-xs text-ink/60">{t.recipientPhone}</div>
                    </td>
                    <td className="py-2 pr-4 font-mono text-xs">{t.corridorCode}</td>
                    <td className="py-2 pr-4 text-right font-mono text-xs">
                      {formatMinor(t.sendAmountMinor, t.fromCurrency)}
                    </td>
                    <td className="py-2 pr-4 text-right font-mono text-xs">
                      {formatMinor(t.payoutAmountMinor, t.toCurrency)}
                    </td>
                    <td className="py-2 pr-4">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_TONE[t.status]}`}>
                        {TRANSFER_STATUS_LABELS[t.status]}
                      </span>
                    </td>
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
                        Open
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}