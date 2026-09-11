'use client';

// ADM-150 — Treasury Dashboard
// Route: /admin/treasury

import { useMemo } from 'react';
import Link from 'next/link';
import { Card } from '@/components/card';
import {
  getTreasuryBalances,
  getTreasuryTotals,
  getWithdrawalCounts,
  getReconciliationDrift,
  getPendingSweeps,
  getKillSwitch,
  canViewTreasury,
  NETWORK_LABELS,
  TIER_LABELS,
  formatUsdt,
  type CustodyTier,
  type Network,
} from '@/lib/mock/treasury';

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

function TierBar({
  hot,
  warm,
  cold,
}: {
  hot: number;
  warm: number;
  cold: number;
}) {
  const total = hot + warm + cold;
  const pct = (n: number) => (total === 0 ? 0 : (n / total) * 100);
  return (
    <div>
      <div
        className="flex h-3 w-full overflow-hidden rounded-full"
        role="img"
        aria-label={`Treasury split: hot ${pct(hot).toFixed(1)} percent, warm ${pct(warm).toFixed(1)} percent, cold ${pct(cold).toFixed(1)} percent`}
      >
        <div className="bg-clay" style={{ width: `${pct(hot)}%` }} />
        <div className="bg-sky" style={{ width: `${pct(warm)}%` }} />
        <div className="bg-ink/70" style={{ width: `${pct(cold)}%` }} />
      </div>
      <dl className="mt-3 grid grid-cols-3 gap-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-clay" aria-hidden />
          <dt className="text-ink/60">Hot</dt>
          <dd className="ml-auto font-mono text-ink">{pct(hot).toFixed(1)}%</dd>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-sky" aria-hidden />
          <dt className="text-ink/60">Warm</dt>
          <dd className="ml-auto font-mono text-ink">{pct(warm).toFixed(1)}%</dd>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-ink/70" aria-hidden />
          <dt className="text-ink/60">Cold</dt>
          <dd className="ml-auto font-mono text-ink">{pct(cold).toFixed(1)}%</dd>
        </div>
      </dl>
    </div>
  );
}

const TIER_ORDER: CustodyTier[] = ['HOT', 'WARM', 'COLD'];
const NETWORK_ORDER: Network[] = ['TRC20', 'ERC20', 'BEP20'];

export default function TreasuryDashboardPage() {
  const allowed = canViewTreasury();
  const balances = useMemo(() => (allowed ? getTreasuryBalances() : []), [allowed]);
  const totals = useMemo(() => getTreasuryTotals(), []);
  const withdrawalCounts = useMemo(() => getWithdrawalCounts(), []);
  const drift = useMemo(() => getReconciliationDrift(), []);
  const sweeps = useMemo(() => getPendingSweeps(), []);
  const killSwitch = useMemo(() => getKillSwitch(), []);

  if (!allowed) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <Card>
          <h1 className="text-lg font-semibold text-ink">Permission denied</h1>
          <p className="mt-2 text-sm text-ink/70">
            You do not have access to the treasury. This panel is restricted to Finance Officer, Admin,
            Super Admin, and Compliance Lead roles.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6">
      <header className="mb-6">
        <p className="text-xs uppercase tracking-wide text-ink/60">PNL-12 · Treasury and Custody</p>
        <h1 className="mt-1 text-2xl font-semibold text-ink">Treasury Dashboard</h1>
        <p className="mt-1 text-sm text-ink/70">
          Hot, warm and cold balances across every supported network. Total holdings, active queues, and
          reconciliation status at a glance.
        </p>
      </header>

      {killSwitch.active ? (
        <div role="alert" className="mb-4 rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-900">
          <strong className="font-medium">Kill switch is ACTIVE.</strong> All withdrawals are halted
          platform-wide. Set by {killSwitch.setBy ?? 'unknown'} at{' '}
          {killSwitch.setAt ? new Date(killSwitch.setAt).toLocaleString('en-GB') : 'unknown time'}.
          {killSwitch.reason ? ` Reason: ${killSwitch.reason}` : ''}
        </div>
      ) : null}

      {drift.driftCount > 0 ? (
        <div role="alert" className="mb-4 rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-900">
          <strong className="font-medium">
            Reconciliation drift detected on {drift.driftCount} network{drift.driftCount === 1 ? '' : 's'}.
          </strong>{' '}
          New withdrawal approvals are blocked until drift is resolved. Investigate on ADM-157.
        </div>
      ) : null}

      <section aria-label="Total holdings" className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Kpi
          label="Total USDT"
          value={formatUsdt(totals.totalMicro)}
          hint="Hot + warm + cold, all networks"
        />
        <Kpi
          label="Hot"
          value={formatUsdt(totals.hotMicro)}
          hint="Operational, signs quickly"
          tone="clay"
        />
        <Kpi
          label="Warm"
          value={formatUsdt(totals.warmMicro)}
          hint="Pre-staged for top-ups"
        />
        <Kpi
          label="Cold"
          value={formatUsdt(totals.coldMicro)}
          hint="Offline, ceremony-gated"
          tone="emerald"
        />
      </section>

      <Card className="mt-6">
        <h2 className="text-sm font-semibold text-ink">Overall tier split</h2>
        <div className="mt-4">
          <TierBar hot={totals.hotMicro} warm={totals.warmMicro} cold={totals.coldMicro} />
        </div>
      </Card>

      <section aria-label="Action queues" className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <h2 className="text-sm font-semibold text-ink">Withdrawals</h2>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-ink/70">Pending approval</dt>
              <dd className="font-mono font-medium text-ink">{withdrawalCounts.pendingApproval}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink/70">AML flagged</dt>
              <dd className={`font-mono font-medium ${withdrawalCounts.amlFlagged > 0 ? 'text-red-700' : 'text-ink'}`}>
                {withdrawalCounts.amlFlagged}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink/70">High risk (score ≥ 60)</dt>
              <dd className={`font-mono font-medium ${withdrawalCounts.highRisk > 0 ? 'text-clay' : 'text-ink'}`}>
                {withdrawalCounts.highRisk}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink/70">Confirming on-chain</dt>
              <dd className="font-mono font-medium text-ink">{withdrawalCounts.confirming}</dd>
            </div>
          </dl>
          <Link
            href="/admin/treasury/withdrawals"
            className="mt-3 inline-block text-sm font-medium text-sky hover:underline"
          >
            Open withdrawal queue →
          </Link>
        </Card>

        <Card>
          <h2 className="text-sm font-semibold text-ink">Sweeps</h2>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-ink/70">Pending witness</dt>
              <dd className={`font-mono font-medium ${sweeps.pendingWitness > 0 ? 'text-clay' : 'text-ink'}`}>
                {sweeps.pendingWitness}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink/70">Confirming</dt>
              <dd className="font-mono font-medium text-ink">{sweeps.confirming}</dd>
            </div>
          </dl>
          <Link
            href="/admin/treasury/sweeps"
            className="mt-3 inline-block text-sm font-medium text-sky hover:underline"
          >
            Open sweep queue →
          </Link>
        </Card>

        <Card>
          <h2 className="text-sm font-semibold text-ink">Reconciliation</h2>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-ink/70">Networks checked</dt>
              <dd className="font-mono font-medium text-ink">{drift.rowCount}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink/70">Drift detected</dt>
              <dd className={`font-mono font-medium ${drift.driftCount > 0 ? 'text-red-700' : 'text-emerald-700'}`}>
                {drift.driftCount}
              </dd>
            </div>
          </dl>
          <Link
            href="/admin/treasury/reconciliation"
            className="mt-3 inline-block text-sm font-medium text-sky hover:underline"
          >
            Open reconciliation →
          </Link>
        </Card>
      </section>

      <Card className="mt-6">
        <h2 className="text-sm font-semibold text-ink">Balances by network</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <caption className="sr-only">Treasury balances by network and tier</caption>
            <thead className="border-b border-ink/10 text-xs uppercase tracking-wide text-ink/60">
              <tr>
                <th scope="col" className="py-2 pr-4">Network</th>
                {TIER_ORDER.map((tier) => (
                  <th key={tier} scope="col" className="py-2 pr-4 text-right">
                    {TIER_LABELS[tier]}
                  </th>
                ))}
                <th scope="col" className="py-2 pr-4 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {NETWORK_ORDER.map((net) => {
                const rows = balances.filter((b) => b.network === net);
                const total = rows.reduce((s, b) => s + b.amountMicro, 0);
                return (
                  <tr key={net} className="border-b border-ink/5">
                    <td className="py-2 pr-4 text-ink">{NETWORK_LABELS[net]}</td>
                    {TIER_ORDER.map((tier) => {
                      const row = rows.find((r) => r.tier === tier);
                      return (
                        <td
                          key={tier}
                          className="py-2 pr-4 text-right font-mono text-xs text-ink"
                        >
                          {row ? formatUsdt(row.amountMicro) : '—'}
                        </td>
                      );
                    })}
                    <td className="py-2 pr-4 text-right font-mono text-xs font-medium text-ink">
                      {formatUsdt(total)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="mt-6">
        <h2 className="text-sm font-semibold text-ink">Operational notes</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-ink/70">
          <li>
            Hot balances fund day-to-day member withdrawals. A hot shortfall results in failed
            withdrawals, not delayed ones.
          </li>
          <li>
            Sweeps between tiers require two operators — an initiator and a witness — and are audited.
          </li>
          <li>
            Cold transfers require a documented key ceremony on ADM-153 before any broadcast occurs.
          </li>
          <li>
            Custody keys are held by a managed provider or HSM. They never touch this application.
          </li>
        </ul>
      </Card>
    </div>
  );
}