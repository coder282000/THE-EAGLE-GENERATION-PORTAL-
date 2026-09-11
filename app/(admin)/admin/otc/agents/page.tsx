'use client';

// ADM-165 — Agent Management
// Route: /admin/otc/agents

import { useMemo, useState } from 'react';
import { Card } from '@/components/card';
import {
  getOTCAgents,
  canViewOTC,
  OTC_AGENT_STATUS_LABELS,
  OTC_AGENT_TIER_LABELS,
  OTC_AGENT_KYC_LABELS,
  formatMinor,
  type OTCAgentStatus,
} from '@/lib/mock/otc';

type Filter = 'ALL' | OTCAgentStatus;

const STATUS_TONE: Record<OTCAgentStatus, string> = {
  ACTIVE: 'bg-emerald-100 text-emerald-800',
  SUSPENDED: 'bg-red-100 text-red-800',
  PENDING_REVIEW: 'bg-clay/15 text-clay',
};

const KYC_TONE: Record<string, string> = {
  VERIFIED: 'text-emerald-700',
  PENDING: 'text-clay',
  EXPIRED: 'text-red-700',
};

export default function OTCAgentsPage() {
  const allowed = canViewOTC();
  const agents = useMemo(() => (allowed ? getOTCAgents() : []), [allowed]);

  const [filter, setFilter] = useState<Filter>('ALL');
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    let list = agents;
    if (filter !== 'ALL') list = list.filter((a) => a.status === filter);
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (a) =>
          a.code.toLowerCase().includes(q) ||
          a.name.toLowerCase().includes(q) ||
          a.phone.toLowerCase().includes(q) ||
          a.email.toLowerCase().includes(q)
      );
    }
    return list;
  }, [agents, filter, query]);

  const totalVolume = agents.reduce((s, a) => s + a.volume30dMinor, 0);
  const totalOrders = agents.reduce((s, a) => s + a.orders30d, 0);

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
        <h1 className="mt-1 text-2xl font-semibold text-ink">Agent Management</h1>
        <p className="mt-1 text-sm text-ink/70">
          P2P counterparties who provide liquidity to the desk. Each agent carries KYC, tier limits, and
          commission.
        </p>
      </header>

      <section aria-label="Agent totals" className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card>
          <dl>
            <dt className="text-xs uppercase tracking-wide text-ink/60">Total agents</dt>
            <dd className="mt-1 text-2xl font-semibold text-ink">{agents.length}</dd>
          </dl>
        </Card>
        <Card>
          <dl>
            <dt className="text-xs uppercase tracking-wide text-ink/60">Active</dt>
            <dd className="mt-1 text-2xl font-semibold text-emerald-700">
              {agents.filter((a) => a.status === 'ACTIVE').length}
            </dd>
          </dl>
        </Card>
        <Card>
          <dl>
            <dt className="text-xs uppercase tracking-wide text-ink/60">30-day volume</dt>
            <dd className="mt-1 font-mono text-2xl font-semibold text-ink">
              {formatMinor(totalVolume, 'KES')}
            </dd>
          </dl>
        </Card>
        <Card>
          <dl>
            <dt className="text-xs uppercase tracking-wide text-ink/60">30-day orders</dt>
            <dd className="mt-1 text-2xl font-semibold text-ink">{totalOrders}</dd>
          </dl>
        </Card>
      </section>

      <Card className="mt-6">
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label htmlFor="ag-query" className="block text-xs font-medium text-ink/70">Search</label>
            <input
              id="ag-query"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Code, name, phone, email…"
              className="mt-1 w-64 rounded-md border border-ink/15 bg-paper px-3 py-2 text-sm text-ink focus:border-sky focus:outline-none focus:ring-2 focus:ring-sky/40"
            />
          </div>
          <div>
            <label htmlFor="ag-status" className="block text-xs font-medium text-ink/70">Status</label>
            <select
              id="ag-status"
              value={filter}
              onChange={(e) => setFilter(e.target.value as Filter)}
              className="mt-1 rounded-md border border-ink/15 bg-paper px-3 py-2 text-sm text-ink focus:border-sky focus:outline-none focus:ring-2 focus:ring-sky/40"
            >
              <option value="ALL">All statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="SUSPENDED">Suspended</option>
              <option value="PENDING_REVIEW">Pending review</option>
            </select>
          </div>
          <div className="ml-auto text-xs text-ink/60">
            Showing {filtered.length} of {agents.length}
          </div>
        </div>
      </Card>

      <Card className="mt-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <caption className="sr-only">OTC agents</caption>
            <thead className="border-b border-ink/10 text-xs uppercase tracking-wide text-ink/60">
              <tr>
                <th scope="col" className="py-2 pr-4">Code</th>
                <th scope="col" className="py-2 pr-4">Name</th>
                <th scope="col" className="py-2 pr-4">Contact</th>
                <th scope="col" className="py-2 pr-4">Tier</th>
                <th scope="col" className="py-2 pr-4">Status</th>
                <th scope="col" className="py-2 pr-4">KYC</th>
                <th scope="col" className="py-2 pr-4 text-right">Daily limit</th>
                <th scope="col" className="py-2 pr-4 text-right">Commission</th>
                <th scope="col" className="py-2 pr-4 text-right">30d volume</th>
                <th scope="col" className="py-2 text-right">30d orders</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-sm text-ink/60">
                    No agents match the current filters.
                  </td>
                </tr>
              ) : (
                filtered.map((a) => (
                  <tr key={a.id} className="border-b border-ink/5 hover:bg-paper">
                    <td className="py-2 pr-4 font-mono text-xs text-ink">{a.code}</td>
                    <td className="py-2 pr-4 text-ink">{a.name}</td>
                    <td className="py-2 pr-4 text-xs text-ink/70">
                      <div>{a.phone}</div>
                      <div className="text-ink/50">{a.email}</div>
                    </td>
                    <td className="py-2 pr-4 text-xs">{OTC_AGENT_TIER_LABELS[a.tier]}</td>
                    <td className="py-2 pr-4">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_TONE[a.status]}`}>
                        {OTC_AGENT_STATUS_LABELS[a.status]}
                      </span>
                    </td>
                    <td className={`py-2 pr-4 text-xs font-medium ${KYC_TONE[a.kycStatus]}`}>
                      {OTC_AGENT_KYC_LABELS[a.kycStatus]}
                    </td>
                    <td className="py-2 pr-4 text-right font-mono text-xs">
                      {formatMinor(a.dailyLimitMinor, 'KES')}
                    </td>
                    <td className="py-2 pr-4 text-right font-mono text-xs">{a.commissionBps} bps</td>
                    <td className="py-2 pr-4 text-right font-mono text-xs">
                      {formatMinor(a.volume30dMinor, 'KES')}
                    </td>
                    <td className="py-2 text-right font-mono text-xs">{a.orders30d}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="mt-6">
        <h2 className="text-sm font-semibold text-ink">Agent onboarding and suspension</h2>
        <p className="mt-2 text-sm text-ink/70">
          An agent cannot become ACTIVE until KYC is VERIFIED and the code of conduct is accepted. Suspension
          is one-click, audited, and prevents new matches. Existing matched orders are not cancelled by
          suspension — they complete under the pre-suspension terms.
        </p>
      </Card>
    </div>
  );
}