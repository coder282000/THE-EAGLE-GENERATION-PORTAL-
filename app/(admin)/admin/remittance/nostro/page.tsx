'use client';

// ADM-176 — Float / Nostro Position by Corridor
// Route: /admin/remittance/nostro

import { useMemo, useState } from 'react';
import { Card } from '@/components/card';
import {
  getNostroBalances,
  getNostroAlerts,
  canViewRemittance,
  RAIL_LABELS,
  formatMinor,
  type NostroBalance,
} from '@/lib/mock/remittance';

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

function FloatBar({ balance }: { balance: NostroBalance }) {
  const max = Math.max(balance.sweepThresholdMinor, balance.balanceMinor) * 1.2;
  const floorPct = (balance.operatingFloorMinor / max) * 100;
  const sweepPct = (balance.sweepThresholdMinor / max) * 100;
  const balancePct = (balance.balanceMinor / max) * 100;

  const state: 'below' | 'nominal' | 'above' =
    balance.balanceMinor < balance.operatingFloorMinor
      ? 'below'
      : balance.balanceMinor > balance.sweepThresholdMinor
      ? 'above'
      : 'nominal';

  const barColor =
    state === 'below' ? 'bg-red-500' : state === 'above' ? 'bg-clay' : 'bg-emerald-500';

  return (
    <div>
      <div className="relative h-4 w-full overflow-hidden rounded-full bg-ink/5">
        <div
          className={`absolute inset-y-0 left-0 ${barColor}`}
          style={{ width: `${balancePct}%` }}
          aria-hidden
        />
        <div
          className="absolute inset-y-0 w-0.5 bg-red-700"
          style={{ left: `${floorPct}%` }}
          aria-hidden
        />
        <div
          className="absolute inset-y-0 w-0.5 bg-clay"
          style={{ left: `${sweepPct}%` }}
          aria-hidden
        />
      </div>
      <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-xs text-ink/60">
        <span>
          <span className="mr-1 inline-block h-2 w-2 rounded-full bg-red-700" aria-hidden />
          Floor {formatMinor(balance.operatingFloorMinor, balance.currency)}
        </span>
        <span>
          <span className="mr-1 inline-block h-2 w-2 rounded-full bg-clay" aria-hidden />
          Sweep {formatMinor(balance.sweepThresholdMinor, balance.currency)}
        </span>
      </div>
    </div>
  );
}

export default function NostroPage() {
  const allowed = canViewRemittance();
  const balances = useMemo(() => (allowed ? getNostroBalances() : []), [allowed]);
  const alerts = useMemo(() => getNostroAlerts(), []);

  const [filter, setFilter] = useState<'ALL' | 'ALERTS'>('ALL');

  const filtered = useMemo(() => {
    if (filter === 'ALL') return balances;
    return balances.filter(
      (b) => b.balanceMinor < b.operatingFloorMinor || b.balanceMinor > b.sweepThresholdMinor
    );
  }, [balances, filter]);

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

  return (
    <div className="p-6">
      <header className="mb-6">
        <p className="text-xs uppercase tracking-wide text-ink/60">PNL-14 · Remittance Operations</p>
        <h1 className="mt-1 text-2xl font-semibold text-ink">Float / Nostro Position by Corridor</h1>
        <p className="mt-1 text-sm text-ink/70">
          Pre-funded balance held with each payout partner. Below floor = transfers may fail; above sweep =
          capital is idle.
        </p>
      </header>

      <section aria-label="Nostro summary" className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Kpi
          label="Corridors funded"
          value={String(balances.length)}
          hint="All active partners"
        />
        <Kpi
          label="Below floor"
          value={String(alerts.belowFloor.length)}
          hint={
            alerts.belowFloor.length > 0
              ? 'Top-up from treasury recommended'
              : 'All corridors funded above floor'
          }
          tone={alerts.belowFloor.length > 0 ? 'red' : 'emerald'}
        />
        <Kpi
          label="Above sweep threshold"
          value={String(alerts.aboveSweep.length)}
          hint={
            alerts.aboveSweep.length > 0
              ? 'Sweep to treasury recommended'
              : 'No idle float'
          }
          tone={alerts.aboveSweep.length > 0 ? 'clay' : 'emerald'}
        />
        <Kpi
          label="Total alerts"
          value={String(alerts.count)}
          hint="Below floor + above sweep"
          tone={alerts.count > 0 ? 'clay' : undefined}
        />
      </section>

      {alerts.belowFloor.length > 0 ? (
        <div role="alert" className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-900">
          <strong className="font-medium">
            {alerts.belowFloor.length} corridor{alerts.belowFloor.length === 1 ? '' : 's'} below operating floor.
          </strong>{' '}
          Transfers may fail on these corridors. Top up from treasury (PNL-12) before the next batch.
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {alerts.belowFloor.map((b) => (
              <li key={b.id}>
                <span className="font-mono">{b.corridorCode}</span> · {b.partnerName} ·{' '}
                {formatMinor(b.balanceMinor, b.currency)} vs floor{' '}
                {formatMinor(b.operatingFloorMinor, b.currency)}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {alerts.aboveSweep.length > 0 ? (
        <div role="note" className="mt-3 rounded-lg border border-clay/30 bg-clay/5 p-3 text-sm text-ink">
          <strong className="font-medium">
            {alerts.aboveSweep.length} corridor{alerts.aboveSweep.length === 1 ? '' : 's'} above sweep threshold.
          </strong>{' '}
          Idle float is not earning. Consider a sweep to treasury on PNL-12.
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {alerts.aboveSweep.map((b) => (
              <li key={b.id}>
                <span className="font-mono">{b.corridorCode}</span> · {b.partnerName} ·{' '}
                {formatMinor(b.balanceMinor, b.currency)} vs sweep{' '}
                {formatMinor(b.sweepThresholdMinor, b.currency)}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <Card className="mt-6">
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label htmlFor="nostro-filter" className="block text-xs font-medium text-ink/70">View</label>
            <select
              id="nostro-filter"
              value={filter}
              onChange={(e) => setFilter(e.target.value as 'ALL' | 'ALERTS')}
              className="mt-1 rounded-md border border-ink/15 bg-paper px-3 py-2 text-sm text-ink focus:border-sky focus:outline-none focus:ring-2 focus:ring-sky/40"
            >
              <option value="ALL">All corridors</option>
              <option value="ALERTS">Alerts only</option>
            </select>
          </div>
          <div className="ml-auto text-xs text-ink/60">
            Showing {filtered.length} of {balances.length}
          </div>
        </div>
      </Card>

      <div className="mt-4 space-y-4">
        {filtered.length === 0 ? (
          <Card>
            <p className="text-center text-sm text-ink/60">
              No corridors match. Switch to &ldquo;All corridors&rdquo; to see the full position.
            </p>
          </Card>
        ) : (
          filtered.map((b) => {
            const state =
              b.balanceMinor < b.operatingFloorMinor
                ? 'below'
                : b.balanceMinor > b.sweepThresholdMinor
                ? 'above'
                : 'nominal';
            const stateLabel = state === 'below' ? 'Below floor' : state === 'above' ? 'Above sweep' : 'Nominal';
            const stateTone =
              state === 'below'
                ? 'bg-red-100 text-red-800'
                : state === 'above'
                ? 'bg-clay/15 text-clay'
                : 'bg-emerald-100 text-emerald-800';
            return (
              <Card key={b.id}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-mono text-sm font-semibold text-ink">{b.corridorCode}</h2>
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${stateTone}`}>
                        {stateLabel}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-ink/60">
                      {b.partnerName} · Snapshot at {new Date(b.at).toLocaleString('en-GB')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs uppercase tracking-wide text-ink/60">Balance</p>
                    <p className="font-mono text-lg font-semibold text-ink">
                      {formatMinor(b.balanceMinor, b.currency)}
                    </p>
                  </div>
                </div>

                <div className="mt-4">
                  <FloatBar balance={b} />
                </div>
              </Card>
            );
          })
        )}
      </div>

      <Card className="mt-6">
        <h2 className="text-sm font-semibold text-ink">About float management</h2>
        <p className="mt-2 text-sm text-ink/70">
          Nostro accounts are pre-funded with payout partners so that member transfers settle in seconds
          rather than days. The operating floor is the minimum balance required to keep payouts flowing
          through the corridor&apos;s batch window. The sweep threshold is the maximum idle balance held with a
          partner before funds return to treasury. Both are corridor-specific and reviewed quarterly.
        </p>
      </Card>
    </div>
  );
}