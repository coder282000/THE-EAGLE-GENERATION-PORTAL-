'use client';

// ADM-154 — On-Chain Transaction Monitor
// Route: /admin/treasury/chain

import { useMemo, useState } from 'react';
import { Card } from '@/components/card';
import {
  getChainTransactions,
  canViewTreasury,
  NETWORK_LABELS,
  formatUsdt,
  type ChainTransaction,
  type Network,
} from '@/lib/mock/treasury';

type Filter = 'ALL' | 'PENDING' | 'CONFIRMED' | 'REORG';

function Kpi({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: 'clay' | 'red' | 'emerald';
}) {
  const cls =
    tone === 'red'
      ? 'text-red-700'
      : tone === 'clay'
      ? 'text-clay'
      : tone === 'emerald'
      ? 'text-emerald-700'
      : 'text-ink';
  return (
    <Card>
      <dl>
        <dt className="text-xs uppercase tracking-wide text-ink/60">{label}</dt>
        <dd className={`mt-1 text-2xl font-semibold ${cls}`}>{value}</dd>
      </dl>
    </Card>
  );
}

function progressPct(t: ChainTransaction): number {
  if (t.requiredConfirmations === 0) return 100;
  return Math.min(100, (t.confirmations / t.requiredConfirmations) * 100);
}

export default function ChainMonitorPage() {
  const allowed = canViewTreasury();
  const txs = useMemo(() => (allowed ? getChainTransactions() : []), [allowed]);

  const [filter, setFilter] = useState<Filter>('ALL');
  const [networkFilter, setNetworkFilter] = useState<'ALL' | Network>('ALL');
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    let list = txs;
    if (filter === 'PENDING') list = list.filter((t) => t.confirmations < t.requiredConfirmations && !t.reorgFlagged);
    if (filter === 'CONFIRMED') list = list.filter((t) => t.confirmations >= t.requiredConfirmations && !t.reorgFlagged);
    if (filter === 'REORG') list = list.filter((t) => t.reorgFlagged);
    if (networkFilter !== 'ALL') list = list.filter((t) => t.network === networkFilter);
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (t) =>
          t.txHash.toLowerCase().includes(q) ||
          t.reference.toLowerCase().includes(q)
      );
    }
    return list;
  }, [txs, filter, networkFilter, query]);

  if (!allowed) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <Card>
          <h1 className="text-lg font-semibold text-ink">Permission denied</h1>
          <p className="mt-2 text-sm text-ink/70">You do not have access to the treasury.</p>
        </Card>
      </div>
    );
  }

  const pending = txs.filter((t) => t.confirmations < t.requiredConfirmations && !t.reorgFlagged).length;
  const reorg = txs.filter((t) => t.reorgFlagged).length;
  const confirmed = txs.filter((t) => t.confirmations >= t.requiredConfirmations && !t.reorgFlagged).length;

  return (
    <div className="p-6">
      <header className="mb-6">
        <p className="text-xs uppercase tracking-wide text-ink/60">PNL-12 · Treasury and Custody</p>
        <h1 className="mt-1 text-2xl font-semibold text-ink">On-Chain Transaction Monitor</h1>
        <p className="mt-1 text-sm text-ink/70">
          Every broadcast transaction, tracked from broadcast to confirmed. Reorg-flagged deposits are
          held for manual review — never auto-credited.
        </p>
      </header>

      {reorg > 0 ? (
        <div role="alert" className="mb-4 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-900">
          <strong className="font-medium">{reorg} transaction{reorg === 1 ? '' : 's'} flagged by a chain reorganisation.</strong>{' '}
          Affected deposits must not be credited until manually reviewed. Investigate before approving any
          related withdrawals.
        </div>
      ) : null}

      <section aria-label="Chain state" className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Kpi label="Total transactions" value={String(txs.length)} />
        <Kpi label="Pending confirmations" value={String(pending)} tone={pending > 0 ? 'clay' : undefined} />
        <Kpi label="Confirmed" value={String(confirmed)} tone="emerald" />
        <Kpi label="Reorg-flagged" value={String(reorg)} tone={reorg > 0 ? 'red' : undefined} />
      </section>

      <Card className="mt-6">
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label htmlFor="chain-query" className="block text-xs font-medium text-ink/70">Search</label>
            <input
              id="chain-query"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tx hash or reference…"
              className="mt-1 w-64 rounded-md border border-ink/15 bg-paper px-3 py-2 text-sm font-mono text-xs text-ink focus:border-sky focus:outline-none focus:ring-2 focus:ring-sky/40"
            />
          </div>
          <div>
            <label htmlFor="chain-network" className="block text-xs font-medium text-ink/70">Network</label>
            <select
              id="chain-network"
              value={networkFilter}
              onChange={(e) => setNetworkFilter(e.target.value as 'ALL' | Network)}
              className="mt-1 rounded-md border border-ink/15 bg-paper px-3 py-2 text-sm text-ink focus:border-sky focus:outline-none focus:ring-2 focus:ring-sky/40"
            >
              <option value="ALL">All networks</option>
              <option value="TRC20">TRC20</option>
              <option value="ERC20">ERC20</option>
              <option value="BEP20">BEP20</option>
            </select>
          </div>
          <div>
            <label htmlFor="chain-filter" className="block text-xs font-medium text-ink/70">Filter</label>
            <select
              id="chain-filter"
              value={filter}
              onChange={(e) => setFilter(e.target.value as Filter)}
              className="mt-1 rounded-md border border-ink/15 bg-paper px-3 py-2 text-sm text-ink focus:border-sky focus:outline-none focus:ring-2 focus:ring-sky/40"
            >
              <option value="ALL">All</option>
              <option value="PENDING">Pending confirmations</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="REORG">Reorg-flagged</option>
            </select>
          </div>
          <div className="ml-auto text-xs text-ink/60">
            Showing {filtered.length} of {txs.length}
          </div>
        </div>
      </Card>

      <Card className="mt-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <caption className="sr-only">On-chain transactions</caption>
            <thead className="border-b border-ink/10 text-xs uppercase tracking-wide text-ink/60">
              <tr>
                <th scope="col" className="py-2 pr-4">Reference</th>
                <th scope="col" className="py-2 pr-4">Direction</th>
                <th scope="col" className="py-2 pr-4">Network</th>
                <th scope="col" className="py-2 pr-4 text-right">Amount</th>
                <th scope="col" className="py-2 pr-4">Tx hash</th>
                <th scope="col" className="py-2 pr-4 text-right">Confirmations</th>
                <th scope="col" className="py-2 pr-4">Flag</th>
                <th scope="col" className="py-2 pr-4">Broadcast</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-sm text-ink/60">
                    No transactions match the current filters.
                  </td>
                </tr>
              ) : (
                filtered.map((t) => {
                  const pct = progressPct(t);
                  const complete = t.confirmations >= t.requiredConfirmations;
                  return (
                    <tr key={t.id} className={`border-b border-ink/5 hover:bg-paper ${t.reorgFlagged ? 'bg-red-50' : ''}`}>
                      <td className="py-2 pr-4 font-mono text-xs text-ink">{t.reference}</td>
                      <td className="py-2 pr-4 text-xs">
                        <span className={t.direction === 'INBOUND' ? 'text-emerald-700' : 'text-clay'}>
                          {t.direction === 'INBOUND' ? 'Inbound' : 'Outbound'}
                        </span>
                      </td>
                      <td className="py-2 pr-4 text-xs">{NETWORK_LABELS[t.network]}</td>
                      <td className="py-2 pr-4 text-right font-mono text-xs">
                        {formatUsdt(t.amountMicro)}
                      </td>
                      <td className="py-2 pr-4 font-mono text-xs text-ink/70">
                        {t.txHash.slice(0, 12)}…{t.txHash.slice(-6)}
                      </td>
                      <td className="py-2 pr-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <span className={`font-mono text-xs ${complete ? 'text-emerald-700' : 'text-ink'}`}>
                            {t.confirmations}/{t.requiredConfirmations}
                          </span>
                          <div className="h-1.5 w-16 overflow-hidden rounded-full bg-ink/5" aria-hidden>
                            <div
                              className={`h-full ${t.reorgFlagged ? 'bg-red-500' : complete ? 'bg-emerald-500' : 'bg-sky'}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-2 pr-4">
                        {t.reorgFlagged ? (
                          <span className="inline-flex rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800">
                            Reorg
                          </span>
                        ) : (
                          <span className="text-xs text-ink/40">—</span>
                        )}
                      </td>
                      <td className="py-2 pr-4 text-xs text-ink/60">
                        {new Date(t.broadcastAt).toLocaleString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
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
        <h2 className="text-sm font-semibold text-ink">Reorg handling</h2>
        <p className="mt-2 text-sm text-ink/70">
          A chain reorganisation can invalidate a transaction that appeared confirmed. The monitor flags
          any reorg that touches a platform transaction. Flagged inbound deposits are held in a pending
          state — never credited to a member balance — until manually reviewed against the chain. Flagged
          outbound withdrawals are held from further state transitions until the reorg resolves.
        </p>
      </Card>
    </div>
  );
}