'use client';

// ADM-177 — Remittance Regulatory Returns
// Route: /admin/remittance/returns

import { useMemo, useState } from 'react';
import { Card } from '@/components/card';
import {
  getRemittanceReturns,
  canViewRemittance,
  RETURN_STATUS_LABELS,
  type ReturnStatus,
} from '@/lib/mock/remittance';

const STATUS_TONE: Record<ReturnStatus, string> = {
  DRAFT: 'bg-ink/10 text-ink/70',
  SUBMITTED: 'bg-sky/15 text-sky',
  ACCEPTED: 'bg-emerald-100 text-emerald-800',
  REJECTED: 'bg-red-100 text-red-800',
  OVERDUE: 'bg-red-100 text-red-800',
};

type Filter = 'ALL' | ReturnStatus;

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

export default function RemittanceReturnsPage() {
  const allowed = canViewRemittance();
  const returns = useMemo(() => (allowed ? getRemittanceReturns() : []), [allowed]);

  const [filter, setFilter] = useState<Filter>('ALL');

  const filtered = useMemo(() => {
    if (filter === 'ALL') return returns;
    return returns.filter((r) => r.status === filter);
  }, [returns, filter]);

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

  const nowIso = new Date().toISOString();
  const overdueCount = returns.filter(
    (r) => !r.submittedAt && r.dueAt < nowIso && r.status !== 'ACCEPTED'
  ).length;
  const draftCount = returns.filter((r) => r.status === 'DRAFT').length;
  const submittedCount = returns.filter(
    (r) => r.status === 'SUBMITTED' || r.status === 'ACCEPTED'
  ).length;

  return (
    <div className="p-6">
      <header className="mb-6">
        <p className="text-xs uppercase tracking-wide text-ink/60">PNL-14 · Remittance Operations</p>
        <h1 className="mt-1 text-2xl font-semibold text-ink">Remittance Regulatory Returns</h1>
        <p className="mt-1 text-sm text-ink/70">
          Per-corridor returns for the CBK and other regulators. Prepared by one officer, submitted by
          another (four-eyes).
        </p>
      </header>

      <section aria-label="Returns summary" className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Kpi label="Total returns" value={String(returns.length)} />
        <Kpi label="Draft" value={String(draftCount)} tone={draftCount > 0 ? 'clay' : undefined} />
        <Kpi label="Submitted / accepted" value={String(submittedCount)} tone="emerald" />
        <Kpi
          label="Overdue"
          value={String(overdueCount)}
          tone={overdueCount > 0 ? 'red' : undefined}
        />
      </section>

      {overdueCount > 0 ? (
        <div role="alert" className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-900">
          <strong className="font-medium">{overdueCount} return{overdueCount === 1 ? '' : 's'} overdue.</strong>{' '}
          Regulators expect timely submission. Escalate to the Compliance Lead if the return cannot be
          completed within 24 hours.
        </div>
      ) : null}

      <Card className="mt-6">
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label htmlFor="ret-filter" className="block text-xs font-medium text-ink/70">Status</label>
            <select
              id="ret-filter"
              value={filter}
              onChange={(e) => setFilter(e.target.value as Filter)}
              className="mt-1 rounded-md border border-ink/15 bg-paper px-3 py-2 text-sm text-ink focus:border-sky focus:outline-none focus:ring-2 focus:ring-sky/40"
            >
              <option value="ALL">All statuses</option>
              {(Object.keys(RETURN_STATUS_LABELS) as ReturnStatus[]).map((s) => (
                <option key={s} value={s}>{RETURN_STATUS_LABELS[s]}</option>
              ))}
            </select>
          </div>
          <div className="ml-auto text-xs text-ink/60">
            Showing {filtered.length} of {returns.length}
          </div>
        </div>
      </Card>

      <Card className="mt-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <caption className="sr-only">Regulatory returns</caption>
            <thead className="border-b border-ink/10 text-xs uppercase tracking-wide text-ink/60">
              <tr>
                <th scope="col" className="py-2 pr-4">Return</th>
                <th scope="col" className="py-2 pr-4">Period</th>
                <th scope="col" className="py-2 pr-4">Corridor</th>
                <th scope="col" className="py-2 pr-4">Regulator</th>
                <th scope="col" className="py-2 pr-4">Status</th>
                <th scope="col" className="py-2 pr-4">Due</th>
                <th scope="col" className="py-2 pr-4">Submitted</th>
                <th scope="col" className="py-2 pr-4">Submitted by</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-sm text-ink/60">
                    No returns match the current filter.
                  </td>
                </tr>
              ) : (
                filtered.map((r) => {
                  const dueSoon =
                    !r.submittedAt &&
                    r.status !== 'ACCEPTED' &&
                    new Date(r.dueAt).getTime() - Date.now() < 86400000 * 2;
                  return (
                    <tr key={r.id} className="border-b border-ink/5 hover:bg-paper">
                      <td className="py-2 pr-4 font-mono text-xs text-ink">{r.id}</td>
                      <td className="py-2 pr-4 text-xs">{r.period}</td>
                      <td className="py-2 pr-4 font-mono text-xs">{r.corridorCode}</td>
                      <td className="py-2 pr-4 text-xs font-medium">{r.regulator}</td>
                      <td className="py-2 pr-4">
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_TONE[r.status]}`}>
                          {RETURN_STATUS_LABELS[r.status]}
                        </span>
                      </td>
                      <td className={`py-2 pr-4 text-xs ${dueSoon ? 'font-medium text-clay' : 'text-ink/70'}`}>
                        {new Date(r.dueAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="py-2 pr-4 text-xs text-ink/70">
                        {r.submittedAt
                          ? new Date(r.submittedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                          : '—'}
                      </td>
                      <td className="py-2 pr-4 text-xs text-ink/70">{r.submittedBy ?? '—'}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="mt-6">
        <h2 className="text-sm font-semibold text-ink">Regulatory calendar</h2>
        <p className="mt-2 text-sm text-ink/70">
          CBK returns are submitted quarterly, within 15 working days of quarter-end. Country-specific
          returns (BOU, BoT, BNR, BCC) follow each regulator&apos;s calendar and are maintained in
          PNL-15 Compliance. Every return is prepared by a Finance Officer and submitted by a different
          Finance Officer or the Compliance Lead — a two-person control.
        </p>
      </Card>
    </div>
  );
}