'use client';

// ADM-160 — OTC Order Book and Live Orders
// Route: /admin/otc

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/button';
import { Card } from '@/components/card';
import {
  getOTCOrders,
  getOTCOrderCounts,
  getEscrowTotals,
  canViewOTC,
  canInterveneOrder,
  OTC_ORDER_STATUS_LABELS,
  OTC_ORDER_SIDE_LABELS,
  OTC_NETWORK_LABELS,
  formatMinor,
  formatUsdtMicro,
  type OTCOrder,
  type OTCOrderStatus,
} from '@/lib/mock/otc';

type StatusFilter = 'ALL' | OTCOrderStatus;
type SideFilter = 'ALL' | 'BUY' | 'SELL';

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

function Kpi({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <Card>
      <dl>
        <dt className="text-xs uppercase tracking-wide text-ink/60">{label}</dt>
        <dd className="mt-1 text-2xl font-semibold text-ink">{value}</dd>
        {hint ? <dd className="mt-1 text-xs text-ink/60">{hint}</dd> : null}
      </dl>
    </Card>
  );
}

function StatusPill({ status }: { status: OTCOrderStatus }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_TONE[status]}`}>
      {OTC_ORDER_STATUS_LABELS[status]}
    </span>
  );
}

export default function OTCOrderBookPage() {
  const allowed = canViewOTC();
  const canIntervene = canInterveneOrder();

  const orders = useMemo<OTCOrder[]>(() => (allowed ? getOTCOrders() : []), [allowed]);
  const counts = useMemo(() => getOTCOrderCounts(), []);
  const escrow = useMemo(() => getEscrowTotals(), []);

  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [sideFilter, setSideFilter] = useState<SideFilter>('ALL');
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    let list = orders;
    if (statusFilter !== 'ALL') list = list.filter((o) => o.status === statusFilter);
    if (sideFilter !== 'ALL') list = list.filter((o) => o.side === sideFilter);
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (o) =>
          o.reference.toLowerCase().includes(q) ||
          o.memberName.toLowerCase().includes(q) ||
          o.memberNumber.toLowerCase().includes(q) ||
          (o.agentName ?? '').toLowerCase().includes(q)
      );
    }
    return list;
  }, [orders, statusFilter, sideFilter, query]);

  if (!allowed) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <Card>
          <h1 className="text-lg font-semibold text-ink">Permission denied</h1>
          <p className="mt-2 text-sm text-ink/70">
            You do not have access to the OTC desk. This panel is restricted to Finance Officer,
            Admin, Super Admin, and Compliance Lead roles.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6">
      <header className="mb-6">
        <p className="text-xs uppercase tracking-wide text-ink/60">PNL-13 · OTC Desk</p>
        <h1 className="mt-1 text-2xl font-semibold text-ink">Order Book and Live Orders</h1>
        <p className="mt-1 text-sm text-ink/70">
          Every USDT trade on the desk, in every state. Click any row to open the order workspace.
        </p>
      </header>

      <section aria-label="Key figures" className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Kpi
          label="Open orders"
          value={`${counts.pending + counts.escrowHeld + counts.inFlight}`}
          hint={`${counts.pending} pending · ${counts.escrowHeld} escrow · ${counts.inFlight} in flight`}
        />
        <Kpi
          label="Completed (all time)"
          value={`${counts.completed}`}
          hint="Settled cleanly on-chain"
        />
        <Kpi
          label="In escrow"
          value={formatMinor(escrow.heldMinor, 'KES')}
          hint={`${escrow.heldCount} order${escrow.heldCount === 1 ? '' : 's'} held`}
        />
        <Kpi
          label="Disputed"
          value={`${counts.disputed}`}
          hint={escrow.disputedCount > 0 ? `${formatMinor(escrow.disputedMinor, 'KES')} frozen` : 'No frozen funds'}
        />
      </section>

      <Card className="mt-6">
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label htmlFor="otc-query" className="block text-xs font-medium text-ink/70">
              Search
            </label>
            <input
              id="otc-query"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Reference, member, agent…"
              className="mt-1 w-64 rounded-md border border-ink/15 bg-paper px-3 py-2 text-sm text-ink focus:border-sky focus:outline-none focus:ring-2 focus:ring-sky/40"
            />
          </div>
          <div>
            <label htmlFor="otc-side" className="block text-xs font-medium text-ink/70">
              Side
            </label>
            <select
              id="otc-side"
              value={sideFilter}
              onChange={(e) => setSideFilter(e.target.value as SideFilter)}
              className="mt-1 rounded-md border border-ink/15 bg-paper px-3 py-2 text-sm text-ink focus:border-sky focus:outline-none focus:ring-2 focus:ring-sky/40"
            >
              <option value="ALL">All sides</option>
              <option value="BUY">Buy USDT</option>
              <option value="SELL">Sell USDT</option>
            </select>
          </div>
          <div>
            <label htmlFor="otc-status" className="block text-xs font-medium text-ink/70">
              Status
            </label>
            <select
              id="otc-status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              className="mt-1 rounded-md border border-ink/15 bg-paper px-3 py-2 text-sm text-ink focus:border-sky focus:outline-none focus:ring-2 focus:ring-sky/40"
            >
              <option value="ALL">All statuses</option>
              {(Object.keys(OTC_ORDER_STATUS_LABELS) as OTCOrderStatus[]).map((s) => (
                <option key={s} value={s}>
                  {OTC_ORDER_STATUS_LABELS[s]}
                </option>
              ))}
            </select>
          </div>
          <div className="ml-auto text-xs text-ink/60">
            Showing {filtered.length} of {orders.length}
          </div>
        </div>
      </Card>

      <Card className="mt-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <caption className="sr-only">OTC orders</caption>
            <thead className="border-b border-ink/10 text-xs uppercase tracking-wide text-ink/60">
              <tr>
                <th scope="col" className="py-2 pr-4">Reference</th>
                <th scope="col" className="py-2 pr-4">Side</th>
                <th scope="col" className="py-2 pr-4">Member</th>
                <th scope="col" className="py-2 pr-4 text-right">Fiat</th>
                <th scope="col" className="py-2 pr-4 text-right">Crypto</th>
                <th scope="col" className="py-2 pr-4 text-right">Rate</th>
                <th scope="col" className="py-2 pr-4">Network</th>
                <th scope="col" className="py-2 pr-4">Status</th>
                <th scope="col" className="py-2 pr-4">Updated</th>
                <th scope="col" className="py-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-sm text-ink/60">
                    No orders match the current filters.
                  </td>
                </tr>
              ) : (
                filtered.map((o) => (
                  <tr key={o.id} className="border-b border-ink/5 hover:bg-paper">
                    <td className="py-2 pr-4 font-mono text-xs text-ink">{o.reference}</td>
                    <td className="py-2 pr-4">
                      <span className={o.side === 'BUY' ? 'text-sky' : 'text-clay'}>
                        {OTC_ORDER_SIDE_LABELS[o.side]}
                      </span>
                    </td>
                    <td className="py-2 pr-4">
                      <div className="text-ink">{o.memberName}</div>
                      <div className="text-xs text-ink/60">{o.memberNumber}</div>
                    </td>
                    <td className="py-2 pr-4 text-right font-mono text-xs">
                      {formatMinor(o.fiatAmountMinor, o.fiatCurrency)}
                    </td>
                    <td className="py-2 pr-4 text-right font-mono text-xs">
                      {formatUsdtMicro(o.cryptoAmountMicro)}
                    </td>
                    <td className="py-2 pr-4 text-right font-mono text-xs">{o.rate.toFixed(2)}</td>
                    <td className="py-2 pr-4 text-xs">{OTC_NETWORK_LABELS[o.network]}</td>
                    <td className="py-2 pr-4">
                      <StatusPill status={o.status} />
                    </td>
                    <td className="py-2 pr-4 text-xs text-ink/60">
                      {new Date(o.updatedAt).toLocaleString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-2 text-right">
                      <Link
                        href={`/admin/otc/orders/${o.id}`}
                        className="text-xs font-medium text-sky hover:underline"
                      >
                        {canIntervene ? 'Open' : 'View'}
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