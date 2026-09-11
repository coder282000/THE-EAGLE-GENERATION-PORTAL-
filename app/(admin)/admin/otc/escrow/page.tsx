'use client';

// ADM-163 — Escrow Monitoring
// Route: /admin/otc/escrow

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/card';
import {
  getEscrowRecords,
  getEscrowTotals,
  canViewOTC,
  formatMinor,
  type EscrowRecord,
} from '@/lib/mock/otc';

type Filter = 'ALL' | EscrowRecord['status'];

const STATUS_TONE: Record<EscrowRecord['status'], string> = {
  HELD: 'bg-sky/15 text-sky',
  RELEASED: 'bg-emerald-100 text-emerald-800',
  REFUNDED: 'bg-ink/10 text-ink/70',
  DISPUTED: 'bg-red-100 text-red-800',
};

function Kpi({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <Card>
      <dl>
        <dt className="text-xs uppercase tracking-wide text-ink/60">{label}</dt>
        <dd className="mt-1 text-2xl font-semibold text-ink font-mono">{value}</dd>
        {hint ? <dd className="mt-1 text-xs text-ink/60">{hint}</dd> : null}
      </dl>
    </Card>
  );
}

export default function OTCescrowPage() {
  const allowed = canViewOTC();
  const records = useMemo(() => (allowed ? getEscrowRecords() : []), [allowed]);
  const totals = useMemo(() => getEscrowTotals(), []);

  const [filter, setFilter] = useState<Filter>('ALL');
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    let list = records;
    if (filter !== 'ALL') list = list.filter((r) => r.status === filter);
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (r) => r.orderRef.toLowerCase().includes(q) || r.id.toLowerCase().includes(q)
      );
    }
    return list;
  }, [records, filter, query]);

  if (!allowed) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <Card>
          <h1 className="text-lg font-semibold text-ink">Permission denied</h1>
          <p className="mt-2 text-sm text-ink/70">You do not have access to the OTC desk.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6">
      <header className="mb-6">
        <p className="text-xs uppercase tracking-wide text-ink/60">PNL-13 · OTC Desk</p>
        <h1 className="mt-1 text-2xl font-semibold text-ink">Escrow Monitoring</h1>
        <p className="mt-1 text-sm text-ink/70">
          Every escrow hold, release and refund. Disputed escrow is frozen until arbitration resolves it.
        </p>
      </header>

      <section aria-label="Escrow totals" className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Kpi
          label="Held now"
          value={formatMinor(totals.heldMinor, 'KES')}
          hint={`${totals.heldCount} order${totals.heldCount === 1 ? '' : 's'}`}
        />
        <Kpi
          label="Disputed (frozen)"
          value={formatMinor(totals.disputedMinor, 'KES')}
          hint={totals.disputedCount > 0 ? `${totals.disputedCount} order${totals.disputedCount === 1 ? '' : 's'}` : 'None'}
        />
        <Kpi
          label="Total released"
          value={String(records.filter((r) => r.status === 'RELEASED').length)}
          hint="Clean releases this cycle"
        />
        <Kpi
          label="Total refunded"
          value={String(records.filter((r) => r.status === 'REFUNDED').length)}
          hint="Refunds after dispute resolution"
        />
      </section>

      <Card className="mt-6">
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label htmlFor="esc-query" className="block text-xs font-medium text-ink/70">Search</label>
            <input
              id="esc-query"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Order reference or escrow id…"
              className="mt-1 w-64 rounded-md border border-ink/15 bg-paper px-3 py-2 text-sm text-ink focus:border-sky focus:outline-none focus:ring-2 focus:ring-sky/40"
            />
          </div>
          <div>
            <label htmlFor="esc-status" className="block text-xs font-medium text-ink/70">Status</label>
            <select
              id="esc-status"
              value={filter}
              onChange={(e) => setFilter(e.target.value as Filter)}
              className="mt-1 rounded-md border border-ink/15 bg-paper px-3 py-2 text-sm text-ink focus:border-sky focus:outline-none focus:ring-2 focus:ring-sky/40"
            >
              <option value="ALL">All statuses</option>
              <option value="HELD">Held</option>
              <option value="RELEASED">Released</option>
              <option value="REFUNDED">Refunded</option>
              <option value="DISPUTED">Disputed</option>
            </select>
          </div>
          <div className="ml-auto text-xs text-ink/60">
            Showing {filtered.length} of {records.length}
          </div>
        </div>
      </Card>

      <Card className="mt-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <caption className="sr-only">Escrow records</caption>
            <thead className="border-b border-ink/10 text-xs uppercase tracking-wide text-ink/60">
              <tr>
                <th scope="col" className="py-2 pr-4">Escrow</th>
                <th scope="col" className="py-2 pr-4">Order</th>
                <th scope="col" className="py-2 pr-4 text-right">Amount</th>
                <th scope="col" className="py-2 pr-4">Status</th>
                <th scope="col" className="py-2 pr-4">Held at</th>
                <th scope="col" className="py-2 pr-4">Released</th>
                <th scope="col" className="py-2 pr-4">Reason</th>
                <th scope="col" className="py-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-sm text-ink/60">
                    No escrow records match.
                  </td>
                </tr>
              ) : (
                filtered.map((r) => (
                  <tr key={r.id} className="border-b border-ink/5 hover:bg-paper">
                    <td className="py-2 pr-4 font-mono text-xs text-ink">{r.id}</td>
                    <td className="py-2 pr-4 font-mono text-xs text-ink">{r.orderRef}</td>
                    <td className="py-2 pr-4 text-right font-mono text-xs">
                      {formatMinor(r.amountMinor, r.currency)}
                    </td>
                    <td className="py-2 pr-4">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_TONE[r.status]}`}>
                        {r.status.charAt(0) + r.status.slice(1).toLowerCase()}
                      </span>
                    </td>
                    <td className="py-2 pr-4 text-xs text-ink/70">
                      {new Date(r.heldAt).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-2 pr-4 text-xs text-ink/70">
                      {r.releasedAt
                        ? new Date(r.releasedAt).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
                        : '—'}
                    </td>
                    <td className="py-2 pr-4 text-xs text-ink/70">{r.reason ?? '—'}</td>
                    <td className="py-2 text-right">
                      <Link
                        href={`/admin/otc/orders/${r.orderId}`}
                        className="text-xs font-medium text-sky hover:underline"
                      >
                        View order
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