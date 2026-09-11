'use client';

// ADM-164 — Dispute Arbitration Workspace (list)
// Route: /admin/otc/disputes

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/card';
import {
  getOTCDisputes,
  getOTCDisputeCounts,
  canViewOTC,
  OTC_DISPUTE_STATUS_LABELS,
  type OTCDisputeStatus,
} from '@/lib/mock/otc';

type Filter = 'ALL' | OTCDisputeStatus;

const STATUS_TONE: Record<OTCDisputeStatus, string> = {
  OPEN: 'bg-clay/15 text-clay',
  INVESTIGATING: 'bg-sky/15 text-sky',
  RESOLVED_BUYER: 'bg-emerald-100 text-emerald-800',
  RESOLVED_SELLER: 'bg-emerald-100 text-emerald-800',
  RESOLVED_SPLIT: 'bg-emerald-100 text-emerald-800',
  ESCALATED: 'bg-red-100 text-red-800',
  CLOSED: 'bg-ink/10 text-ink/70',
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

export default function OTCDisputesPage() {
  const allowed = canViewOTC();
  const disputes = useMemo(() => (allowed ? getOTCDisputes() : []), [allowed]);
  const counts = useMemo(() => getOTCDisputeCounts(), []);

  const [filter, setFilter] = useState<Filter>('ALL');
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    let list = disputes;
    if (filter !== 'ALL') list = list.filter((d) => d.status === filter);
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (d) =>
          d.reference.toLowerCase().includes(q) ||
          d.orderRef.toLowerCase().includes(q) ||
          d.raisedByName.toLowerCase().includes(q) ||
          d.againstName.toLowerCase().includes(q) ||
          d.reason.toLowerCase().includes(q)
      );
    }
    return list;
  }, [disputes, filter, query]);

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
        <h1 className="mt-1 text-2xl font-semibold text-ink">Dispute Arbitration</h1>
        <p className="mt-1 text-sm text-ink/70">
          Disputes raised by either party. 48-hour SLA from OPEN to RESOLVED, escalating at 24. Cannot be
          resolved by the same user who opened it.
        </p>
      </header>

      <section aria-label="Dispute counts" className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Kpi label="Open" value={String(counts.open)} hint="Awaiting assignment" tone={counts.open > 0 ? 'clay' : undefined} />
        <Kpi label="Investigating" value={String(counts.investigating)} hint="Assigned to arbitrator" />
        <Kpi label="Escalated" value={String(counts.escalated)} hint="Beyond first response" tone={counts.escalated > 0 ? 'red' : undefined} />
        <Kpi
          label="Breached SLA"
          value={String(counts.breachedSla)}
          hint="Past 48-hour deadline"
          tone={counts.breachedSla > 0 ? 'red' : undefined}
        />
      </section>

      <Card className="mt-6">
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label htmlFor="dsp-query" className="block text-xs font-medium text-ink/70">Search</label>
            <input
              id="dsp-query"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Reference, parties, reason…"
              className="mt-1 w-72 rounded-md border border-ink/15 bg-paper px-3 py-2 text-sm text-ink focus:border-sky focus:outline-none focus:ring-2 focus:ring-sky/40"
            />
          </div>
          <div>
            <label htmlFor="dsp-status" className="block text-xs font-medium text-ink/70">Status</label>
            <select
              id="dsp-status"
              value={filter}
              onChange={(e) => setFilter(e.target.value as Filter)}
              className="mt-1 rounded-md border border-ink/15 bg-paper px-3 py-2 text-sm text-ink focus:border-sky focus:outline-none focus:ring-2 focus:ring-sky/40"
            >
              <option value="ALL">All statuses</option>
              {(Object.keys(OTC_DISPUTE_STATUS_LABELS) as OTCDisputeStatus[]).map((s) => (
                <option key={s} value={s}>{OTC_DISPUTE_STATUS_LABELS[s]}</option>
              ))}
            </select>
          </div>
          <div className="ml-auto text-xs text-ink/60">
            Showing {filtered.length} of {disputes.length}
          </div>
        </div>
      </Card>

      <Card className="mt-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <caption className="sr-only">Disputes</caption>
            <thead className="border-b border-ink/10 text-xs uppercase tracking-wide text-ink/60">
              <tr>
                <th scope="col" className="py-2 pr-4">Reference</th>
                <th scope="col" className="py-2 pr-4">Order</th>
                <th scope="col" className="py-2 pr-4">Raised by</th>
                <th scope="col" className="py-2 pr-4">Against</th>
                <th scope="col" className="py-2 pr-4">Reason</th>
                <th scope="col" className="py-2 pr-4">Status</th>
                <th scope="col" className="py-2 pr-4">SLA</th>
                <th scope="col" className="py-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-sm text-ink/60">
                    No disputes match the current filters.
                  </td>
                </tr>
              ) : (
                filtered.map((d) => {
                  const now = new Date();
                  const deadline = new Date(d.slaDeadline);
                  const hoursLeft = Math.round((deadline.getTime() - now.getTime()) / 3600000);
                  const breached = !d.resolvedAt && hoursLeft < 0;
                  return (
                    <tr key={d.id} className="border-b border-ink/5 hover:bg-paper">
                      <td className="py-2 pr-4 font-mono text-xs text-ink">{d.reference}</td>
                      <td className="py-2 pr-4 font-mono text-xs text-ink">{d.orderRef}</td>
                      <td className="py-2 pr-4 text-xs text-ink">{d.raisedByName}</td>
                      <td className="py-2 pr-4 text-xs text-ink">{d.againstName}</td>
                      <td className="py-2 pr-4 text-xs text-ink/80">{d.reason}</td>
                      <td className="py-2 pr-4">
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_TONE[d.status]}`}>
                          {OTC_DISPUTE_STATUS_LABELS[d.status]}
                        </span>
                      </td>
                      <td className="py-2 pr-4 text-xs">
                        {d.resolvedAt ? (
                          <span className="text-ink/60">Resolved</span>
                        ) : breached ? (
                          <span className="font-medium text-red-700">Breached</span>
                        ) : (
                          <span className={hoursLeft < 12 ? 'text-clay' : 'text-ink/70'}>
                            {hoursLeft}h left
                          </span>
                        )}
                      </td>
                      <td className="py-2 text-right">
                        <Link
                          href={`/admin/otc/disputes/${d.id}`}
                          className="text-xs font-medium text-sky hover:underline"
                        >
                          Open
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
    </div>
  );
}