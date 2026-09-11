'use client';

// ADM-155 — Address Whitelist Management
// Route: /admin/treasury/whitelist

import { useMemo, useState } from 'react';
import { Button } from '@/components/button';
import { Card } from '@/components/card';
import {
  getWhitelist,
  canViewTreasury,
  canOperateTreasury,
  WHITELIST_STATUS_LABELS,
  NETWORK_LABELS,
  type WhitelistedAddress,
  type Network,
} from '@/lib/mock/treasury';

type Filter = 'ALL' | WhitelistedAddress['status'];

const STATUS_TONE: Record<WhitelistedAddress['status'], string> = {
  COOLING_OFF: 'bg-clay/15 text-clay',
  ACTIVE: 'bg-emerald-100 text-emerald-800',
  REMOVED: 'bg-ink/10 text-ink/70',
};

function Kpi({ label, value, tone }: { label: string; value: string; tone?: 'clay' | 'emerald' }) {
  const cls = tone === 'emerald' ? 'text-emerald-700' : tone === 'clay' ? 'text-clay' : 'text-ink';
  return (
    <Card>
      <dl>
        <dt className="text-xs uppercase tracking-wide text-ink/60">{label}</dt>
        <dd className={`mt-1 text-2xl font-semibold ${cls}`}>{value}</dd>
      </dl>
    </Card>
  );
}

export default function WhitelistPage() {
  const allowed = canViewTreasury();
  const canOperate = canOperateTreasury();

  const entries = useMemo(() => (allowed ? getWhitelist() : []), [allowed]);

  const [filter, setFilter] = useState<Filter>('ALL');
  const [query, setQuery] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [addLabel, setAddLabel] = useState('');
  const [addAddress, setAddAddress] = useState('');
  const [addNetwork, setAddNetwork] = useState<Network>('TRC20');
  const [addError, setAddError] = useState<string | null>(null);
  const [addSubmitted, setAddSubmitted] = useState(false);

  const filtered = useMemo(() => {
    let list = entries;
    if (filter !== 'ALL') list = list.filter((e) => e.status === filter);
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (e) =>
          e.label.toLowerCase().includes(q) ||
          e.addressMasked.toLowerCase().includes(q) ||
          e.proposedBy.toLowerCase().includes(q)
      );
    }
    return list;
  }, [entries, filter, query]);

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

  function submitAdd(e: React.FormEvent) {
    e.preventDefault();
    if (addLabel.trim().length < 3) {
      setAddError('Label must be at least 3 characters.');
      return;
    }
    if (addAddress.trim().length < 10) {
      setAddError('Address looks too short.');
      return;
    }
    setAddError(null);
    setAddSubmitted(true);
  }

  const activeCount = entries.filter((e) => e.status === 'ACTIVE').length;
  const cooling = entries.filter((e) => e.status === 'COOLING_OFF').length;

  return (
    <div className="p-6">
      <header className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-ink/60">PNL-12 · Treasury and Custody</p>
          <h1 className="mt-1 text-2xl font-semibold text-ink">Address Whitelist Management</h1>
          <p className="mt-1 text-sm text-ink/70">
            Every withdrawal destination must be on this list and past its cooling-off period. Additions
            require two operators.
          </p>
        </div>
        {canOperate && !addOpen && !addSubmitted ? (
          <Button variant="primary" onClick={() => setAddOpen(true)}>
            Propose address
          </Button>
        ) : null}
      </header>

      {addSubmitted ? (
        <div role="status" className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
          Address &ldquo;{addLabel}&rdquo; proposed for {NETWORK_LABELS[addNetwork]}. Cooling-off begins now;
          a second operator must approve after 24 hours before any withdrawal can use it.
        </div>
      ) : null}

      {addOpen ? (
        <Card className="mb-4">
          <h2 className="text-sm font-semibold text-ink">Propose new withdrawal address</h2>
          <form onSubmit={submitAdd} className="mt-4">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <div>
                <label className="block text-xs font-medium text-ink/70">Label</label>
                <input
                  type="text"
                  value={addLabel}
                  onChange={(e) => setAddLabel(e.target.value)}
                  placeholder="e.g. Grace — personal wallet"
                  className="mt-1 w-full rounded-md border border-ink/15 bg-paper px-3 py-2 text-sm text-ink focus:border-sky focus:outline-none focus:ring-2 focus:ring-sky/40"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-ink/70">Network</label>
                <select
                  value={addNetwork}
                  onChange={(e) => setAddNetwork(e.target.value as Network)}
                  className="mt-1 w-full rounded-md border border-ink/15 bg-paper px-3 py-2 text-sm text-ink focus:border-sky focus:outline-none focus:ring-2 focus:ring-sky/40"
                >
                  <option value="TRC20">TRC20 (Tron)</option>
                  <option value="ERC20">ERC20 (Ethereum)</option>
                  <option value="BEP20">BEP20 (BSC)</option>
                </select>
              </div>
              <div className="md:col-span-1">
                <label className="block text-xs font-medium text-ink/70">Address</label>
                <input
                  type="text"
                  value={addAddress}
                  onChange={(e) => setAddAddress(e.target.value)}
                  placeholder="TJ…"
                  className="mt-1 w-full rounded-md border border-ink/15 bg-paper px-3 py-2 font-mono text-xs text-ink focus:border-sky focus:outline-none focus:ring-2 focus:ring-sky/40"
                />
              </div>
            </div>

            {addError ? (
              <p role="alert" className="mt-2 text-xs text-red-700">{addError}</p>
            ) : null}

            <div role="note" className="mt-3 rounded-lg border border-clay/30 bg-clay/5 p-3 text-xs text-ink">
              Once proposed, this address enters a 24-hour cooling-off period. A second operator must
              confirm after cooling-off ends. Both actions are audited.
            </div>

            <div className="mt-4 flex gap-2">
              <Button variant="primary" type="submit">Propose address</Button>
              <Button
                variant="outline"
                type="button"
                onClick={() => {
                  setAddOpen(false);
                  setAddError(null);
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      ) : null}

      <section aria-label="Whitelist counts" className="grid grid-cols-3 gap-4">
        <Kpi label="Total entries" value={String(entries.length)} />
        <Kpi label="Active" value={String(activeCount)} tone="emerald" />
        <Kpi label="Cooling off" value={String(cooling)} tone={cooling > 0 ? 'clay' : undefined} />
      </section>

      <Card className="mt-6">
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label htmlFor="wl-query" className="block text-xs font-medium text-ink/70">Search</label>
            <input
              id="wl-query"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Label, address, proposer…"
              className="mt-1 w-64 rounded-md border border-ink/15 bg-paper px-3 py-2 text-sm text-ink focus:border-sky focus:outline-none focus:ring-2 focus:ring-sky/40"
            />
          </div>
          <div>
            <label htmlFor="wl-status" className="block text-xs font-medium text-ink/70">Status</label>
            <select
              id="wl-status"
              value={filter}
              onChange={(e) => setFilter(e.target.value as Filter)}
              className="mt-1 rounded-md border border-ink/15 bg-paper px-3 py-2 text-sm text-ink focus:border-sky focus:outline-none focus:ring-2 focus:ring-sky/40"
            >
              <option value="ALL">All statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="COOLING_OFF">Cooling off</option>
              <option value="REMOVED">Removed</option>
            </select>
          </div>
          <div className="ml-auto text-xs text-ink/60">
            Showing {filtered.length} of {entries.length}
          </div>
        </div>
      </Card>

      <Card className="mt-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <caption className="sr-only">Whitelisted withdrawal addresses</caption>
            <thead className="border-b border-ink/10 text-xs uppercase tracking-wide text-ink/60">
              <tr>
                <th scope="col" className="py-2 pr-4">Label</th>
                <th scope="col" className="py-2 pr-4">Address</th>
                <th scope="col" className="py-2 pr-4">Network</th>
                <th scope="col" className="py-2 pr-4">Status</th>
                <th scope="col" className="py-2 pr-4">Proposed</th>
                <th scope="col" className="py-2 pr-4">Cooling off ends</th>
                <th scope="col" className="py-2 pr-4">Approved by</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-sm text-ink/60">
                    No addresses match the current filters.
                  </td>
                </tr>
              ) : (
                filtered.map((w) => {
                  const coolingActive = w.status === 'COOLING_OFF';
                  const endsAt = new Date(w.coolingOffEndsAt);
                  const hoursLeft = Math.max(
                    0,
                    Math.round((endsAt.getTime() - Date.now()) / 3600000)
                  );
                  return (
                    <tr key={w.id} className="border-b border-ink/5 hover:bg-paper">
                      <td className="py-2 pr-4 text-ink">{w.label}</td>
                      <td className="py-2 pr-4 font-mono text-xs text-ink/70">{w.addressMasked}</td>
                      <td className="py-2 pr-4 text-xs">{NETWORK_LABELS[w.network]}</td>
                      <td className="py-2 pr-4">
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_TONE[w.status]}`}>
                          {WHITELIST_STATUS_LABELS[w.status]}
                        </span>
                      </td>
                      <td className="py-2 pr-4 text-xs text-ink/70">
                        {new Date(w.proposedAt).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                        <div className="text-ink/50">{w.proposedBy}</div>
                      </td>
                      <td className="py-2 pr-4 text-xs">
                        {coolingActive ? (
                          <span className="font-medium text-clay">
                            {hoursLeft}h remaining
                          </span>
                        ) : (
                          <span className="text-ink/70">
                            {new Date(w.coolingOffEndsAt).toLocaleDateString('en-GB', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                        )}
                      </td>
                      <td className="py-2 pr-4 text-xs">
                        {w.approvedBy ?? <span className="text-ink/40">—</span>}
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
        <h2 className="text-sm font-semibold text-ink">Cooling-off, and why it matters</h2>
        <p className="mt-2 text-sm text-ink/70">
          A whitelisted address is a strong control against a compromised member account. But an attacker
          who takes over an admin session could add their own address and empty the hot wallet in minutes.
          The cooling-off period — 24 hours between proposal and approval, then approval by a different
          operator — makes that attack window survivable. The address is not usable until cooling-off has
          expired, enforced in code, not policy.
        </p>
      </Card>
    </div>
  );
}