'use client';

// ADM-166 — Liquidity and Exposure Monitor
// Route: /admin/otc/liquidity

import { useMemo, useState } from 'react';
import { Card } from '@/components/card';
import {
  getOTCExposure,
  getExposureTotals,
  canViewOTC,
  OTC_NETWORK_LABELS,
  type OTCNetwork,
} from '@/lib/mock/otc';

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

function AllocationBar({
  hot,
  warm,
  cold,
  inEscrow,
  inFlight,
  total,
}: {
  hot: number;
  warm: number;
  cold: number;
  inEscrow: number;
  inFlight: number;
  total: number;
}) {
  const pct = (n: number) => (total === 0 ? 0 : (n / total) * 100);
  return (
    <div>
      <div
        className="flex h-3 w-full overflow-hidden rounded-full"
        role="img"
        aria-label={`Allocation: hot ${pct(hot).toFixed(1)} percent, warm ${pct(warm).toFixed(1)} percent, cold ${pct(cold).toFixed(1)} percent, in escrow ${pct(inEscrow).toFixed(1)} percent, in flight ${pct(inFlight).toFixed(1)} percent`}
      >
        <div className="bg-clay" style={{ width: `${pct(hot)}%` }} />
        <div className="bg-sky" style={{ width: `${pct(warm)}%` }} />
        <div className="bg-ink/60" style={{ width: `${pct(cold)}%` }} />
        <div className="bg-emerald-500" style={{ width: `${pct(inEscrow)}%` }} />
        <div className="bg-dawn" style={{ width: `${pct(inFlight)}%` }} />
      </div>
      <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-xs md:grid-cols-5">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-clay" aria-hidden />
          <dt className="text-ink/60">Hot</dt>
          <dd className="ml-auto font-mono text-ink">{hot.toLocaleString('en-KE')}</dd>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-sky" aria-hidden />
          <dt className="text-ink/60">Warm</dt>
          <dd className="ml-auto font-mono text-ink">{warm.toLocaleString('en-KE')}</dd>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-ink/60" aria-hidden />
          <dt className="text-ink/60">Cold</dt>
          <dd className="ml-auto font-mono text-ink">{cold.toLocaleString('en-KE')}</dd>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden />
          <dt className="text-ink/60">In escrow</dt>
          <dd className="ml-auto font-mono text-ink">{inEscrow.toLocaleString('en-KE')}</dd>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-dawn" aria-hidden />
          <dt className="text-ink/60">In flight</dt>
          <dd className="ml-auto font-mono text-ink">{inFlight.toLocaleString('en-KE')}</dd>
        </div>
      </dl>
    </div>
  );
}

const HOT_THRESHOLD = 100_000;
const COLD_RATIO_TARGET = 0.5;

export default function OTCLiquidityPage() {
  const allowed = canViewOTC();
  const exposure = useMemo(() => (allowed ? getOTCExposure() : []), [allowed]);
  const totals = useMemo(() => getExposureTotals(), []);

  const [networkFilter, setNetworkFilter] = useState<'ALL' | OTCNetwork>('ALL');

  const filtered = useMemo(() => {
    if (networkFilter === 'ALL') return exposure;
    return exposure.filter((e) => e.network === networkFilter);
  }, [exposure, networkFilter]);

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

  const hotTone = totals.hotCrypto < HOT_THRESHOLD ? 'clay' : 'emerald';
  const coldRatio = totals.totalCrypto === 0 ? 0 : totals.coldCrypto / totals.totalCrypto;
  const coldTone = coldRatio < COLD_RATIO_TARGET ? 'clay' : 'emerald';

  return (
    <div className="p-6">
      <header className="mb-6">
        <p className="text-xs uppercase tracking-wide text-ink/60">PNL-13 · OTC Desk</p>
        <h1 className="mt-1 text-2xl font-semibold text-ink">Liquidity and Exposure</h1>
        <p className="mt-1 text-sm text-ink/70">
          Hot, warm and cold balances per network. Alerts fire when hot falls below operational floor or cold
          falls below the treasury ratio.
        </p>
      </header>

      <section aria-label="Total exposure" className="grid grid-cols-2 gap-4 md:grid-cols-5">
        <Kpi label="Total USDT" value={totals.totalCrypto.toLocaleString('en-KE')} hint="All networks" />
        <Kpi
          label="Hot"
          value={totals.hotCrypto.toLocaleString('en-KE')}
          hint={`Floor ${HOT_THRESHOLD.toLocaleString('en-KE')}`}
          tone={hotTone}
        />
        <Kpi label="Warm" value={totals.warmCrypto.toLocaleString('en-KE')} />
        <Kpi
          label="Cold"
          value={totals.coldCrypto.toLocaleString('en-KE')}
          hint={`Target ${(COLD_RATIO_TARGET * 100).toFixed(0)}%`}
          tone={coldTone}
        />
        <Kpi
          label="In escrow"
          value={totals.inEscrowCrypto.toLocaleString('en-KE')}
          hint="Held for members"
        />
      </section>

      {totals.hotCrypto < HOT_THRESHOLD ? (
        <div role="alert" className="mt-4 rounded-lg border border-clay/40 bg-clay/5 p-3 text-sm text-ink">
          <strong className="font-medium">Hot balance below floor.</strong> Total hot balance is{' '}
          {totals.hotCrypto.toLocaleString('en-KE')} USDT against a floor of{' '}
          {HOT_THRESHOLD.toLocaleString('en-KE')}. Sweep from warm is recommended on PNL-12.
        </div>
      ) : null}

      {coldRatio < COLD_RATIO_TARGET ? (
        <div role="note" className="mt-3 rounded-lg border border-clay/30 bg-clay/5 p-3 text-sm text-ink">
          <strong className="font-medium">Cold ratio below treasury policy.</strong> Cold holds{' '}
          {(coldRatio * 100).toFixed(1)}% against a {(COLD_RATIO_TARGET * 100).toFixed(0)}% target. Review
          sweep schedule.
        </div>
      ) : null}

      <Card className="mt-6">
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label htmlFor="net-filter" className="block text-xs font-medium text-ink/70">Network</label>
            <select
              id="net-filter"
              value={networkFilter}
              onChange={(e) => setNetworkFilter(e.target.value as 'ALL' | OTCNetwork)}
              className="mt-1 rounded-md border border-ink/15 bg-paper px-3 py-2 text-sm text-ink focus:border-sky focus:outline-none focus:ring-2 focus:ring-sky/40"
            >
              <option value="ALL">All networks</option>
              <option value="TRC20">TRC20 (Tron)</option>
              <option value="ERC20">ERC20 (Ethereum)</option>
              <option value="BEP20">BEP20 (BSC)</option>
            </select>
          </div>
          <div className="ml-auto text-xs text-ink/60">
            Showing {filtered.length} of {exposure.length} networks
          </div>
        </div>
      </Card>

      <div className="mt-4 space-y-4">
        {filtered.map((e) => {
          const hotPctOfNetwork = e.totalCrypto === 0 ? 0 : (e.hotCrypto / e.totalCrypto) * 100;
          const belowFloor = hotPctOfNetwork < 10;
          return (
            <Card key={`${e.asset}-${e.network}`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-sm font-semibold text-ink">
                    {e.asset} · {OTC_NETWORK_LABELS[e.network]}
                  </h2>
                  <p className="mt-1 text-xs text-ink/60">
                    Snapshot at {new Date(e.at).toLocaleString('en-GB')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs uppercase tracking-wide text-ink/60">Total</p>
                  <p className="font-mono text-lg font-semibold text-ink">
                    {e.totalCrypto.toLocaleString('en-KE')}
                  </p>
                </div>
              </div>

              <div className="mt-4">
                <AllocationBar
                  hot={e.hotCrypto}
                  warm={e.warmCrypto}
                  cold={e.coldCrypto}
                  inEscrow={e.inEscrowCrypto}
                  inFlight={e.inFlightCrypto}
                  total={e.totalCrypto}
                />
              </div>

              {belowFloor ? (
                <p role="note" className="mt-3 text-xs text-clay">
                  Hot balance is only {hotPctOfNetwork.toFixed(1)}% of this network&apos;s total. Consider a
                  top-up from warm.
                </p>
              ) : null}
            </Card>
          );
        })}
      </div>

      <Card className="mt-6">
        <h2 className="text-sm font-semibold text-ink">About this view</h2>
        <p className="mt-2 text-sm text-ink/70">
          Hot balances are operational and sign quickly. Warm balances are pre-staged for top-ups. Cold
          balances are off-line and only move at documented key ceremonies. In-escrow balances belong to
          members and never count toward liquidity. Every top-up and sweep action lives on PNL-12 Treasury
          and Custody, not here.
        </p>
      </Card>
    </div>
  );
}