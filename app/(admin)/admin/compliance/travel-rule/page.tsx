'use client';

// ADM-188 — Travel Rule Message Log
// Route: /admin/compliance/travel-rule

import { useMemo, useState } from 'react';
import { Card } from '@/components/card';
import {
  getTravelRuleMessages,
  getTravelRuleCounts,
  canViewCompliance,
  TRAVEL_RULE_STATUS_LABELS,
  formatMinor,
  type TravelRuleStatus,
  type TravelRuleDirection,
} from '@/lib/mock/compliance';

type StatusFilter = 'ALL' | TravelRuleStatus;
type DirectionFilter = 'ALL' | TravelRuleDirection;

const STATUS_TONE: Record<TravelRuleStatus, string> = {
  DELIVERED: 'bg-emerald-100 text-emerald-800',
  FAILED: 'bg-red-100 text-red-800',
  PENDING: 'bg-clay/15 text-clay',
};

function Kpi({ label, value, tone }: { label: string; value: string; tone?: 'clay' | 'red' | 'emerald' }) {
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

export default function TravelRulePage() {
  const allowed = canViewCompliance();
  const messages = useMemo(() => (allowed ? getTravelRuleMessages() : []), [allowed]);
  const counts = useMemo(() => getTravelRuleCounts(), []);

  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [directionFilter, setDirectionFilter] = useState<DirectionFilter>('ALL');
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    let list = messages;
    if (statusFilter !== 'ALL') list = list.filter((m) => m.status === statusFilter);
    if (directionFilter !== 'ALL') list = list.filter((m) => m.direction === directionFilter);
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (m) =>
          m.reference.toLowerCase().includes(q) ||
          m.counterpartyVasp.toLowerCase().includes(q) ||
          m.transferReference.toLowerCase().includes(q) ||
          m.originator.toLowerCase().includes(q) ||
          m.beneficiary.toLowerCase().includes(q)
      );
    }
    return list;
  }, [messages, statusFilter, directionFilter, query]);

  if (!allowed) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <Card>
          <h1 className="text-lg font-semibold text-ink">Permission denied</h1>
          <p className="mt-2 text-sm text-ink/70">You do not have access to the compliance panel.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6">
      <header className="mb-6">
        <p className="text-xs uppercase tracking-wide text-ink/60">PNL-15 · Compliance</p>
        <h1 className="mt-1 text-2xl font-semibold text-ink">Travel Rule Message Log</h1>
        <p className="mt-1 text-sm text-ink/70">
          Originator and beneficiary information exchanged with counterparty VASPs on qualifying
          transfers. Failed messages require manual resolution before the transfer can complete.
        </p>
      </header>

      <section aria-label="Travel Rule counts" className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Kpi label="Total messages" value={String(counts.total)} />
        <Kpi label="Delivered" value={String(counts.delivered)} tone="emerald" />
        <Kpi label="Failed" value={String(counts.failed)} tone={counts.failed > 0 ? 'red' : undefined} />
        <Kpi label="Pending" value={String(counts.pending)} tone={counts.pending > 0 ? 'clay' : undefined} />
      </section>

      {counts.failed > 0 ? (
        <div role="alert" className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-900">
          <strong className="font-medium">
            {counts.failed} Travel Rule message{counts.failed === 1 ? '' : 's'} failed.
          </strong>{' '}
          Affected transfers are held until the exchange succeeds. Investigate the counterparty and retry.
        </div>
      ) : null}

      <Card className="mt-6">
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label htmlFor="tr-query" className="block text-xs font-medium text-ink/70">Search</label>
            <input
              id="tr-query"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Reference, counterparty, transfer…"
              className="mt-1 w-64 rounded-md border border-ink/15 bg-paper px-3 py-2 text-sm text-ink focus:border-sky focus:outline-none focus:ring-2 focus:ring-sky/40"
            />
          </div>
          <div>
            <label htmlFor="tr-direction" className="block text-xs font-medium text-ink/70">Direction</label>
            <select
              id="tr-direction"
              value={directionFilter}
              onChange={(e) => setDirectionFilter(e.target.value as DirectionFilter)}
              className="mt-1 rounded-md border border-ink/15 bg-paper px-3 py-2 text-sm text-ink focus:border-sky focus:outline-none focus:ring-2 focus:ring-sky/40"
            >
              <option value="ALL">All directions</option>
              <option value="SENT">Sent</option>
              <option value="RECEIVED">Received</option>
            </select>
          </div>
          <div>
            <label htmlFor="tr-status" className="block text-xs font-medium text-ink/70">Status</label>
            <select
              id="tr-status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              className="mt-1 rounded-md border border-ink/15 bg-paper px-3 py-2 text-sm text-ink focus:border-sky focus:outline-none focus:ring-2 focus:ring-sky/40"
            >
              <option value="ALL">All statuses</option>
              {(Object.keys(TRAVEL_RULE_STATUS_LABELS) as TravelRuleStatus[]).map((s) => (
                <option key={s} value={s}>{TRAVEL_RULE_STATUS_LABELS[s]}</option>
              ))}
            </select>
          </div>
          <div className="ml-auto text-xs text-ink/60">
            Showing {filtered.length} of {messages.length}
          </div>
        </div>
      </Card>

      <Card className="mt-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <caption className="sr-only">Travel Rule messages</caption>
            <thead className="border-b border-ink/10 text-xs uppercase tracking-wide text-ink/60">
              <tr>
                <th scope="col" className="py-2 pr-4">Reference</th>
                <th scope="col" className="py-2 pr-4">Direction</th>
                <th scope="col" className="py-2 pr-4">Counterparty</th>
                <th scope="col" className="py-2 pr-4">Transfer</th>
                <th scope="col" className="py-2 pr-4">Originator</th>
                <th scope="col" className="py-2 pr-4">Beneficiary</th>
                <th scope="col" className="py-2 pr-4 text-right">Amount</th>
                <th scope="col" className="py-2 pr-4">Status</th>
                <th scope="col" className="py-2 pr-4">Sent</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-sm text-ink/60">
                    No messages match the current filters.
                  </td>
                </tr>
              ) : (
                filtered.map((m) => (
                  <tr key={m.id} className="border-b border-ink/5 hover:bg-paper">
                    <td className="py-2 pr-4 font-mono text-xs text-ink">{m.reference}</td>
                    <td className="py-2 pr-4 text-xs">
                      <span className={m.direction === 'SENT' ? 'text-clay' : 'text-emerald-700'}>
                        {m.direction === 'SENT' ? 'Sent' : 'Received'}
                      </span>
                    </td>
                    <td className="py-2 pr-4 text-xs">
                      <div className="text-ink">{m.counterpartyVasp}</div>
                      <div className="text-ink/60">{m.counterpartyCountry}</div>
                    </td>
                    <td className="py-2 pr-4 font-mono text-xs text-ink/70">{m.transferReference}</td>
                    <td className="py-2 pr-4 text-xs text-ink/80">{m.originator}</td>
                    <td className="py-2 pr-4 text-xs text-ink/80">{m.beneficiary}</td>
                    <td className="py-2 pr-4 text-right font-mono text-xs">
                      {formatMinor(m.amountMinor, m.currency)}
                    </td>
                    <td className="py-2 pr-4">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_TONE[m.status]}`}>
                        {TRAVEL_RULE_STATUS_LABELS[m.status]}
                      </span>
                      {m.failureReason ? (
                        <div className="mt-1 text-xs text-red-700">{m.failureReason}</div>
                      ) : null}
                    </td>
                    <td className="py-2 pr-4 text-xs text-ink/60">
                      {new Date(m.sentAt).toLocaleString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="mt-6">
        <h2 className="text-sm font-semibold text-ink">About the Travel Rule</h2>
        <p className="mt-2 text-sm text-ink/70">
          The Travel Rule (FATF Recommendation 16, enacted in Kenya through the VASP Act 2025) requires
          originator and beneficiary information to travel with qualifying virtual asset transfers. Every
          outbound remittance and every OTC trade that crosses a VASP boundary produces a Travel Rule
          message. Delivered messages complete the transfer; failed messages hold it until the counterparty
          acknowledges or the transfer is recalled.
        </p>
      </Card>
    </div>
  );
}