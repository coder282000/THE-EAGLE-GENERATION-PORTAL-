'use client';

// ADM-189 — Regulatory Reporting Calendar
// Route: /admin/compliance/filings

import { useMemo, useState } from 'react';
import { Card } from '@/components/card';
import {
  getFilings,
  getFilingCounts,
  canViewCompliance,
  FILING_STATUS_LABELS,
  type FilingStatus,
} from '@/lib/mock/compliance';

type Filter = 'ALL' | FilingStatus | 'OPEN';

const STATUS_TONE: Record<FilingStatus, string> = {
  DRAFT: 'bg-ink/10 text-ink/70',
  READY: 'bg-sky/15 text-sky',
  SUBMITTED: 'bg-sky/15 text-sky',
  ACKNOWLEDGED: 'bg-emerald-100 text-emerald-800',
  OVERDUE: 'bg-red-100 text-red-800',
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

export default function FilingsPage() {
  const allowed = canViewCompliance();
  const filings = useMemo(() => (allowed ? getFilings() : []), [allowed]);
  const counts = useMemo(() => getFilingCounts(), []);

  const [filter, setFilter] = useState<Filter>('OPEN');
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    let list = filings;
    if (filter === 'OPEN') {
      list = list.filter(
        (f) => f.status !== 'ACKNOWLEDGED' && f.status !== 'SUBMITTED'
      );
    } else if (filter !== 'ALL') {
      list = list.filter((f) => f.status === filter);
    }
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (f) =>
          f.filingName.toLowerCase().includes(q) ||
          f.regulator.toLowerCase().includes(q) ||
          f.period.toLowerCase().includes(q) ||
          f.owner.toLowerCase().includes(q)
      );
    }
    return list;
  }, [filings, filter, query]);

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

  const nowMs = Date.now();

  return (
    <div className="p-6">
      <header className="mb-6">
        <p className="text-xs uppercase tracking-wide text-ink/60">PNL-15 · Compliance</p>
        <h1 className="mt-1 text-2xl font-semibold text-ink">Regulatory Reporting Calendar</h1>
        <p className="mt-1 text-sm text-ink/70">
          Every filing, per regulator, per period. Filings appear here 30 days before due date. Overdue
          filings escalate to the Compliance Lead and the Steering Committee.
        </p>
      </header>

      {counts.overdue > 0 ? (
        <div role="alert" className="mb-4 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-900">
          <strong className="font-medium">
            {counts.overdue} filing{counts.overdue === 1 ? '' : 's'} overdue.
          </strong>{' '}
          Overdue regulatory filings damage the platform&apos;s standing with regulators. Escalate to the
          Compliance Lead immediately.
        </div>
      ) : null}

      <section aria-label="Filing counts" className="grid grid-cols-2 gap-4 md:grid-cols-5">
        <Kpi label="Total filings" value={String(counts.total)} />
        <Kpi label="In preparation" value={String(counts.draft + counts.ready)} tone={counts.draft > 0 ? 'clay' : undefined} />
        <Kpi label="Submitted" value={String(counts.submitted)} />
        <Kpi label="Acknowledged" value={String(counts.acknowledged)} tone="emerald" />
        <Kpi label="Overdue" value={String(counts.overdue)} tone={counts.overdue > 0 ? 'red' : undefined} />
      </section>

      <Card className="mt-6">
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label htmlFor="fil-query" className="block text-xs font-medium text-ink/70">Search</label>
            <input
              id="fil-query"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filing, regulator, period, owner…"
              className="mt-1 w-72 rounded-md border border-ink/15 bg-paper px-3 py-2 text-sm text-ink focus:border-sky focus:outline-none focus:ring-2 focus:ring-sky/40"
            />
          </div>
          <div>
            <label htmlFor="fil-status" className="block text-xs font-medium text-ink/70">View</label>
            <select
              id="fil-status"
              value={filter}
              onChange={(e) => setFilter(e.target.value as Filter)}
              className="mt-1 rounded-md border border-ink/15 bg-paper px-3 py-2 text-sm text-ink focus:border-sky focus:outline-none focus:ring-2 focus:ring-sky/40"
            >
              <option value="OPEN">Open (not yet submitted)</option>
              <option value="ALL">All statuses</option>
              {(Object.keys(FILING_STATUS_LABELS) as FilingStatus[]).map((s) => (
                <option key={s} value={s}>{FILING_STATUS_LABELS[s]}</option>
              ))}
            </select>
          </div>
          <div className="ml-auto text-xs text-ink/60">
            Showing {filtered.length} of {filings.length}
          </div>
        </div>
      </Card>

      <Card className="mt-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <caption className="sr-only">Regulatory filings</caption>
            <thead className="border-b border-ink/10 text-xs uppercase tracking-wide text-ink/60">
              <tr>
                <th scope="col" className="py-2 pr-4">Filing</th>
                <th scope="col" className="py-2 pr-4">Regulator</th>
                <th scope="col" className="py-2 pr-4">Period</th>
                <th scope="col" className="py-2 pr-4">Due</th>
                <th scope="col" className="py-2 pr-4">Owner</th>
                <th scope="col" className="py-2 pr-4">Status</th>
                <th scope="col" className="py-2 pr-4">Submitted</th>
                <th scope="col" className="py-2 pr-4">Reference</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-sm text-ink/60">
                    No filings match the current filter.
                  </td>
                </tr>
              ) : (
                filtered.map((f) => {
                  const dueMs = new Date(f.dueAt).getTime();
                  const isOverdue =
                    f.status !== 'ACKNOWLEDGED' &&
                    f.status !== 'SUBMITTED' &&
                    dueMs < nowMs;
                  const daysUntil = Math.round((dueMs - nowMs) / 86400000);
                  const dueSoon = !isOverdue && daysUntil >= 0 && daysUntil <= 7;
                  return (
                    <tr key={f.id} className="border-b border-ink/5 hover:bg-paper">
                      <td className="py-2 pr-4 text-ink">{f.filingName}</td>
                      <td className="py-2 pr-4 text-xs font-medium">{f.regulator}</td>
                      <td className="py-2 pr-4 text-xs">{f.period}</td>
                      <td className="py-2 pr-4 text-xs">
                        <div className={isOverdue ? 'font-medium text-red-700' : dueSoon ? 'text-clay' : 'text-ink/70'}>
                          {new Date(f.dueAt).toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </div>
                        {isOverdue ? (
                          <div className="text-xs text-red-700">
                            {Math.abs(daysUntil)} day{Math.abs(daysUntil) === 1 ? '' : 's'} overdue
                          </div>
                        ) : dueSoon ? (
                          <div className="text-xs text-clay">
                            {daysUntil} day{daysUntil === 1 ? '' : 's'} left
                          </div>
                        ) : null}
                      </td>
                      <td className="py-2 pr-4 text-xs text-ink/70">{f.owner}</td>
                      <td className="py-2 pr-4">
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_TONE[f.status]}`}>
                          {FILING_STATUS_LABELS[f.status]}
                        </span>
                      </td>
                      <td className="py-2 pr-4 text-xs text-ink/70">
                        {f.submittedAt
                          ? new Date(f.submittedAt).toLocaleDateString('en-GB', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })
                          : '—'}
                      </td>
                      <td className="py-2 pr-4 font-mono text-xs text-ink/70">
                        {f.reference ?? '—'}
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
        <h2 className="text-sm font-semibold text-ink">Regulators covered</h2>
        <dl className="mt-3 grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
          <div className="rounded-lg border border-ink/10 p-3">
            <dt className="text-xs uppercase tracking-wide text-ink/60">CBK</dt>
            <dd className="mt-1 text-ink">Central Bank of Kenya — payment services and remittance returns</dd>
          </div>
          <div className="rounded-lg border border-ink/10 p-3">
            <dt className="text-xs uppercase tracking-wide text-ink/60">FRC</dt>
            <dd className="mt-1 text-ink">Financial Reporting Centre — AML and suspicious activity reports</dd>
          </div>
          <div className="rounded-lg border border-ink/10 p-3">
            <dt className="text-xs uppercase tracking-wide text-ink/60">ODPC</dt>
            <dd className="mt-1 text-ink">Office of the Data Protection Commissioner — data protection returns</dd>
          </div>
          <div className="rounded-lg border border-ink/10 p-3">
            <dt className="text-xs uppercase tracking-wide text-ink/60">SASRA</dt>
            <dd className="mt-1 text-ink">SACCO Societies Regulatory Authority — savings circles returns</dd>
          </div>
        </dl>
      </Card>
    </div>
  );
}