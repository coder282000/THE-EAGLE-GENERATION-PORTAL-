'use client';

// ADM-174 — Payout Partner Monitoring
// Route: /admin/remittance/partners

import { useMemo, useState } from 'react';
import { Card } from '@/components/card';
import {
  getPayoutPartners,
  getPartnerHealth,
  canViewRemittance,
  PARTNER_STATUS_LABELS,
  RAIL_LABELS,
  type PayoutPartnerStatus,
} from '@/lib/mock/remittance';

type Filter = 'ALL' | PayoutPartnerStatus;

const STATUS_TONE: Record<PayoutPartnerStatus, string> = {
  ACTIVE: 'bg-emerald-100 text-emerald-800',
  DEGRADED: 'bg-clay/15 text-clay',
  OFFLINE: 'bg-red-100 text-red-800',
};

function Kpi({ label, value, tone }: { label: string; value: string; tone?: 'clay' | 'red' | 'emerald' }) {
  const cls = tone === 'red' ? 'text-red-700' : tone === 'clay' ? 'text-clay' : tone === 'emerald' ? 'text-emerald-700' : 'text-ink';
  return (
    <Card>
      <dl>
        <dt className="text-xs uppercase tracking-wide text-ink/60">{label}</dt>
        <dd className={`mt-1 text-2xl font-semibold ${cls}`}>{value}</dd>
      </dl>
    </Card>
  );
}

export default function PartnersPage() {
  const allowed = canViewRemittance();
  const partners = useMemo(() => (allowed ? getPayoutPartners() : []), [allowed]);
  const health = useMemo(() => getPartnerHealth(), []);

  const [filter, setFilter] = useState<Filter>('ALL');
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    let list = partners;
    if (filter !== 'ALL') list = list.filter((p) => p.status === filter);
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (p) =>
          p.code.toLowerCase().includes(q) ||
          p.name.toLowerCase().includes(q) ||
          p.country.toLowerCase().includes(q)
      );
    }
    return list;
  }, [partners, filter, query]);

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
        <h1 className="mt-1 text-2xl font-semibold text-ink">Payout Partner Monitoring</h1>
        <p className="mt-1 text-sm text-ink/70">
          Per-partner success rate, latency and status. A degraded partner triggers failover to an alternate
          rail where one exists.
        </p>
      </header>

      <section aria-label="Partner health" className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Kpi label="Total partners" value={String(health.total)} />
        <Kpi label="Active" value={String(health.active)} tone="emerald" />
        <Kpi
          label="Degraded"
          value={String(health.degraded)}
          tone={health.degraded > 0 ? 'clay' : undefined}
        />
        <Kpi
          label="Offline"
          value={String(health.offline)}
          tone={health.offline > 0 ? 'red' : undefined}
        />
      </section>

      {health.offline > 0 ? (
        <div role="alert" className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-900">
          <strong className="font-medium">{health.offline} partner{health.offline === 1 ? '' : 's'} offline.</strong>{' '}
          Transfers on affected corridors are being queued or rerouted. Check corridor configuration in ADM-172.
        </div>
      ) : null}

      <Card className="mt-6">
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label htmlFor="pp-query" className="block text-xs font-medium text-ink/70">Search</label>
            <input
              id="pp-query"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Code, name, country…"
              className="mt-1 w-64 rounded-md border border-ink/15 bg-paper px-3 py-2 text-sm text-ink focus:border-sky focus:outline-none focus:ring-2 focus:ring-sky/40"
            />
          </div>
          <div>
            <label htmlFor="pp-status" className="block text-xs font-medium text-ink/70">Status</label>
            <select
              id="pp-status"
              value={filter}
              onChange={(e) => setFilter(e.target.value as Filter)}
              className="mt-1 rounded-md border border-ink/15 bg-paper px-3 py-2 text-sm text-ink focus:border-sky focus:outline-none focus:ring-2 focus:ring-sky/40"
            >
              <option value="ALL">All statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="DEGRADED">Degraded</option>
              <option value="OFFLINE">Offline</option>
            </select>
          </div>
          <div className="ml-auto text-xs text-ink/60">
            Showing {filtered.length} of {partners.length}
          </div>
        </div>
      </Card>

      <Card className="mt-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <caption className="sr-only">Payout partners</caption>
            <thead className="border-b border-ink/10 text-xs uppercase tracking-wide text-ink/60">
              <tr>
                <th scope="col" className="py-2 pr-4">Code</th>
                <th scope="col" className="py-2 pr-4">Partner</th>
                <th scope="col" className="py-2 pr-4">Country</th>
                <th scope="col" className="py-2 pr-4">Rail</th>
                <th scope="col" className="py-2 pr-4">Status</th>
                <th scope="col" className="py-2 pr-4 text-right">30d success</th>
                <th scope="col" className="py-2 pr-4 text-right">Avg latency</th>
                <th scope="col" className="py-2 pr-4">Settlement</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-sm text-ink/60">
                    No partners match the current filters.
                  </td>
                </tr>
              ) : (
                filtered.map((p) => {
                  const successCls =
                    p.successRate30d >= 95
                      ? 'text-emerald-700'
                      : p.successRate30d >= 85
                      ? 'text-clay'
                      : 'text-red-700';
                  const latencyCls = p.avgLatencyMinutes > 60 ? 'text-clay' : 'text-ink';
                  return (
                    <tr key={p.id} className="border-b border-ink/5 hover:bg-paper">
                      <td className="py-2 pr-4 font-mono text-xs text-ink">{p.code}</td>
                      <td className="py-2 pr-4 text-ink">{p.name}</td>
                      <td className="py-2 pr-4 text-xs">{p.country}</td>
                      <td className="py-2 pr-4 text-xs">{RAIL_LABELS[p.rail]}</td>
                      <td className="py-2 pr-4">
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_TONE[p.status]}`}>
                          {PARTNER_STATUS_LABELS[p.status]}
                        </span>
                      </td>
                      <td className={`py-2 pr-4 text-right font-mono text-xs ${successCls}`}>
                        {p.successRate30d.toFixed(1)}%
                      </td>
                      <td className={`py-2 pr-4 text-right font-mono text-xs ${latencyCls}`}>
                        {p.avgLatencyMinutes} min
                      </td>
                      <td className="py-2 pr-4 font-mono text-xs text-ink/70">{p.settlementAccount}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="mt-6">
        <h2 className="text-sm font-semibold text-ink">Failover behaviour</h2>
        <p className="mt-2 text-sm text-ink/70">
          A partner marked DEGRADED continues to receive new transfers but is flagged for intervention
          review. A partner marked OFFLINE stops receiving new transfers; in-flight transfers are held in
          PAYOUT_PROCESSING until the partner recovers or the transfer is recalled.
        </p>
      </Card>
    </div>
  );
}