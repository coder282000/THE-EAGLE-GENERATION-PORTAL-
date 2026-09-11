'use client';

// ADM-157 — Custody Reconciliation
// Route: /admin/treasury/reconciliation

import { useMemo, useState } from 'react';
import { Card } from '@/components/card';
import {
  getReconciliation,
  getReconciliationDrift,
  canViewTreasury,
  NETWORK_LABELS,
  formatUsdt,
  type CustodyReconciliationRow,
  type Network,
} from '@/lib/mock/treasury';

type Filter = 'ALL' | 'DRIFT';

function Kpi({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: string;
  hint?: string;
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
        <dd className={`mt-1 font-mono text-2xl font-semibold ${cls}`}>{value}</dd>
        {hint ? <dd className="mt-1 text-xs text-ink/60">{hint}</dd> : null}
      </dl>
    </Card>
  );
}

function DriftBar({ row }: { row: CustodyReconciliationRow }) {
  const max = Math.max(row.onChainMicro, row.ledgerMicro) * 1.05;
  const onChainPct = (row.onChainMicro / max) * 100;
  const ledgerPct = (row.ledgerMicro / max) * 100;

  return (
    <div className="mt-3">
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-xs">
          <span className="w-16 text-ink/60">On-chain</span>
          <div className="h-3 flex-1 overflow-hidden rounded-full bg-ink/5">
            <div
              className="h-full bg-sky"
              style={{ width: `${onChainPct}%` }}
              aria-hidden
            />
          </div>
          <span className="w-40 text-right font-mono text-ink">{formatUsdt(row.onChainMicro)}</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="w-16 text-ink/60">Ledger</span>
          <div className="h-3 flex-1 overflow-hidden rounded-full bg-ink/5">
            <div
              className={`h-full ${row.withinTolerance ? 'bg-emerald-500' : 'bg-red-500'}`}
              style={{ width: `${ledgerPct}%` }}
              aria-hidden
            />
          </div>
          <span className="w-40 text-right font-mono text-ink">{formatUsdt(row.ledgerMicro)}</span>
        </div>
      </div>
    </div>
  );
}

export default function ReconciliationPage() {
  const allowed = canViewTreasury();
  const rows = useMemo(() => (allowed ? getReconciliation() : []), [allowed]);
  const drift = useMemo(() => getReconciliationDrift(), []);

  const [filter, setFilter] = useState<Filter>('ALL');
  const [networkFilter, setNetworkFilter] = useState<'ALL' | Network>('ALL');
  const [lastRun, setLastRun] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let list = rows;
    if (filter === 'DRIFT') list = list.filter((r) => !r.withinTolerance);
    if (networkFilter !== 'ALL') list = list.filter((r) => r.network === networkFilter);
    return list;
  }, [rows, filter, networkFilter]);

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

  const allClear = drift.driftCount === 0;
  const totalOnChain = rows.reduce((s, r) => s + r.onChainMicro, 0);
  const totalLedger = rows.reduce((s, r) => s + r.ledgerMicro, 0);

  return (
    <div className="p-6">
      <header className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-ink/60">PNL-12 · Treasury and Custody</p>
          <h1 className="mt-1 text-2xl font-semibold text-ink">Custody Reconciliation</h1>
          <p className="mt-1 text-sm text-ink/70">
            On-chain holdings vs ledger balance, per asset per network. Drift above tolerance is a P0
            incident and blocks new withdrawal approvals.
          </p>
        </div>
        <div className="text-right">
          <button
            type="button"
            onClick={() => setLastRun(new Date().toISOString())}
            className="rounded-md border border-ink/20 bg-paper px-3 py-1.5 text-sm font-medium text-ink hover:bg-ink/5"
          >
            Run reconciliation
          </button>
          {lastRun ? (
            <p className="mt-2 text-xs text-ink/60">
              Last run {new Date(lastRun).toLocaleString('en-GB')}
            </p>
          ) : null}
        </div>
      </header>

      <section
        aria-label="Reconciliation summary"
        className="grid grid-cols-2 gap-4 md:grid-cols-4"
      >
        <Kpi label="Networks checked" value={String(rows.length)} />
        <Kpi
          label="Total on-chain"
          value={formatUsdt(totalOnChain)}
          hint="Across all networks"
        />
        <Kpi
          label="Total ledger"
          value={formatUsdt(totalLedger)}
          hint="Per the append-only ledger"
        />
        <Kpi
          label="Status"
          value={allClear ? 'Balanced' : 'Drift detected'}
          hint={
            allClear
              ? 'Within tolerance on every network'
              : `${drift.driftCount} network${drift.driftCount === 1 ? '' : 's'} over tolerance`
          }
          tone={allClear ? 'emerald' : 'red'}
        />
      </section>

      {!allClear ? (
        <div role="alert" className="mt-4 rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-900">
          <strong className="font-medium">
            Drift detected on {drift.driftCount} network{drift.driftCount === 1 ? '' : 's'}.
          </strong>{' '}
          New withdrawal approvals are blocked until drift is resolved. Escalate to the Tech Lead and
          Compliance Lead; do not manually adjust balances outside the ledger.
        </div>
      ) : null}

      <Card className="mt-6">
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label htmlFor="rec-status" className="block text-xs font-medium text-ink/70">View</label>
            <select
              id="rec-status"
              value={filter}
              onChange={(e) => setFilter(e.target.value as Filter)}
              className="mt-1 rounded-md border border-ink/15 bg-paper px-3 py-2 text-sm text-ink focus:border-sky focus:outline-none focus:ring-2 focus:ring-sky/40"
            >
              <option value="ALL">All networks</option>
              <option value="DRIFT">Drift only</option>
            </select>
          </div>
          <div>
            <label htmlFor="rec-network" className="block text-xs font-medium text-ink/70">Network</label>
            <select
              id="rec-network"
              value={networkFilter}
              onChange={(e) => setNetworkFilter(e.target.value as 'ALL' | Network)}
              className="mt-1 rounded-md border border-ink/15 bg-paper px-3 py-2 text-sm text-ink focus:border-sky focus:outline-none focus:ring-2 focus:ring-sky/40"
            >
              <option value="ALL">All</option>
              <option value="TRC20">TRC20</option>
              <option value="ERC20">ERC20</option>
              <option value="BEP20">BEP20</option>
            </select>
          </div>
          <div className="ml-auto text-xs text-ink/60">
            Showing {filtered.length} of {rows.length}
          </div>
        </div>
      </Card>

      <div className="mt-4 space-y-4">
        {filtered.length === 0 ? (
          <Card>
            <p className="text-center text-sm text-ink/60">
              No networks match the current filters.
            </p>
          </Card>
        ) : (
          filtered.map((row) => (
            <Card key={row.id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-sm font-semibold text-ink">
                      {row.asset} · {NETWORK_LABELS[row.network]}
                    </h2>
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                        row.withinTolerance
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {row.withinTolerance ? 'Balanced' : 'Drift detected'}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-ink/60">
                    Last check {new Date(row.at).toLocaleString('en-GB')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs uppercase tracking-wide text-ink/60">Drift</p>
                  <p
                    className={`font-mono text-lg font-semibold ${
                      row.withinTolerance ? 'text-emerald-700' : 'text-red-700'
                    }`}
                  >
                    {row.driftMicro === 0
                      ? '0.00'
                      : (row.driftMicro > 0 ? '+' : '') + formatUsdt(row.driftMicro).split(' ')[0]}{' '}
                    <span className="text-xs font-normal text-ink/60">USDT</span>
                  </p>
                </div>
              </div>

              <DriftBar row={row} />

              <p className="mt-3 text-xs text-ink/60">
                Tolerance {formatUsdt(row.toleranceMicro)} · Total checked {formatUsdt(row.onChainMicro)}
              </p>

              {!row.withinTolerance ? (
                <p role="alert" className="mt-2 text-xs font-medium text-red-700">
                  Drift is above tolerance. Investigate before approving withdrawals on this network.
                </p>
              ) : null}
            </Card>
          ))
        )}
      </div>

      <Card className="mt-6">
        <h2 className="text-sm font-semibold text-ink">Why reconciliation is P0</h2>
        <p className="mt-2 text-sm text-ink/70">
          On-chain holdings and the ledger should always agree. When they do not, one of three things has
          happened: a deposit was credited without a corresponding on-chain transfer, a withdrawal was
          signed without a ledger debit, or a correction was made outside the ledger. None of those is
          acceptable. The reconciliation screen exists to catch drift before it compounds, and the
          tolerance is intentionally tight — a platform that holds member funds does not have room for
          &ldquo;close enough.&rdquo;
        </p>
        <p className="mt-2 text-sm text-ink/70">
          If drift persists, escalate to the Tech Lead and the Compliance Lead immediately. Do not attempt
          to correct balances outside the append-only ledger — corrections are reversing entries, never
          edits.
        </p>
      </Card>
    </div>
  );
}