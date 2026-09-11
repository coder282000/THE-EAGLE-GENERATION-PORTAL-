'use client';

// ADM-124 — Loan Book Overview
// Route: /admin/credit/loans

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/card';
import {
  getLoans,
  getLoanBookCounts,
  getAnalytics,
  canViewCredit,
  LOAN_STATUS_LABELS,
  formatMinor,
  bpsToPct,
  type LoanStatus,
} from '@/lib/mock/credit';

type Filter = 'ALL' | LoanStatus;

const STATUS_TONE: Record<LoanStatus, string> = {
  ACTIVE: 'bg-emerald-100 text-emerald-800',
  IN_ARREARS: 'bg-clay/15 text-clay',
  RESTRUCTURED: 'bg-sky/15 text-sky',
  CLOSED: 'bg-ink/10 text-ink/70',
  WRITTEN_OFF: 'bg-red-100 text-red-800',
};

function Kpi({ label, value, hint, tone }: { label: string; value: string; hint?: string; tone?: 'clay' | 'red' | 'emerald' }) {
  const cls = tone === 'red' ? 'text-red-700' : tone === 'clay' ? 'text-clay' : tone === 'emerald' ? 'text-emerald-700' : 'text-ink';
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

export default function LoanBookPage() {
  const allowed = canViewCredit();
  const loans = useMemo(() => (allowed ? getLoans() : []), [allowed]);
  const counts = useMemo(() => getLoanBookCounts(), []);
  const analytics = useMemo(() => getAnalytics(), []);
  const latest = analytics[0] ?? null;

  const [filter, setFilter] = useState<Filter>('ALL');
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    let list = loans;
    if (filter !== 'ALL') list = list.filter((l) => l.status === filter);
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (l) =>
          l.reference.toLowerCase().includes(q) ||
          l.memberName.toLowerCase().includes(q) ||
          l.memberNumber.toLowerCase().includes(q)
      );
    }
    return list;
  }, [loans, filter, query]);

  if (!allowed) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <Card>
          <h1 className="text-lg font-semibold text-ink">Permission denied</h1>
          <p className="mt-2 text-sm text-ink/70">You do not have access to the credit panel.</p>
        </Card>
      </div>
    );
  }

  const totalOutstanding = loans.reduce((s, l) => s + l.outstandingMinor, 0);

  return (
    <div className="p-6">
      <nav aria-label="Breadcrumb" className="mb-3 text-xs text-ink/60">
        <Link href="/admin/credit" className="hover:text-sky">Credit</Link>
        <span className="mx-2">/</span>
        <span className="text-ink">Loan book</span>
      </nav>

      <header className="mb-6">
        <p className="text-xs uppercase tracking-wide text-ink/60">PNL-10 · Credit</p>
        <h1 className="mt-1 text-2xl font-semibold text-ink">Loan Book Overview</h1>
        <p className="mt-1 text-sm text-ink/70">
          Every disbursed loan, its outstanding balance, and its servicing status.
        </p>
      </header>

      <section aria-label="Portfolio totals" className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Kpi
          label="Portfolio outstanding"
          value={formatMinor(totalOutstanding, 'KES')}
          hint={`${counts.active + counts.inArrears + counts.restructured} live loans`}
        />
        <Kpi
          label="Active"
          value={String(counts.active)}
          tone="emerald"
          hint={`${counts.closed} closed`}
        />
        <Kpi
          label="In arrears"
          value={String(counts.inArrears)}
          tone={counts.inArrears > 0 ? 'clay' : undefined}
        />
        <Kpi
          label="Restructured"
          value={String(counts.restructured)}
          hint={`${counts.writtenOff} written off`}
        />
      </section>

      {latest ? (
        <section aria-label="Portfolio quality" className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
          <Kpi
            label="PAR 30"
            value={`${latest.par30.toFixed(1)}%`}
            hint="Portfolio at risk, 30 days"
            tone={latest.par30 > 5 ? 'clay' : 'emerald'}
          />
          <Kpi
            label="PAR 60"
            value={`${latest.par60.toFixed(1)}%`}
            tone={latest.par60 > 3 ? 'clay' : 'emerald'}
          />
          <Kpi
            label="PAR 90"
            value={`${latest.par90.toFixed(1)}%`}
            tone={latest.par90 > 2 ? 'red' : 'emerald'}
          />
          <Kpi
            label="Disbursed (30d)"
            value={formatMinor(latest.disbursementsMinor, 'KES')}
            hint={`${latest.applicationsApproved} approvals`}
          />
        </section>
      ) : null}

      <Card className="mt-6">
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label htmlFor="loan-query" className="block text-xs font-medium text-ink/70">Search</label>
            <input
              id="loan-query"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Reference, member…"
              className="mt-1 w-64 rounded-md border border-ink/15 bg-paper px-3 py-2 text-sm text-ink focus:border-sky focus:outline-none focus:ring-2 focus:ring-sky/40"
            />
          </div>
          <div>
            <label htmlFor="loan-status" className="block text-xs font-medium text-ink/70">Status</label>
            <select
              id="loan-status"
              value={filter}
              onChange={(e) => setFilter(e.target.value as Filter)}
              className="mt-1 rounded-md border border-ink/15 bg-paper px-3 py-2 text-sm text-ink focus:border-sky focus:outline-none focus:ring-2 focus:ring-sky/40"
            >
              <option value="ALL">All statuses</option>
              {(Object.keys(LOAN_STATUS_LABELS) as LoanStatus[]).map((s) => (
                <option key={s} value={s}>{LOAN_STATUS_LABELS[s]}</option>
              ))}
            </select>
          </div>
          <div className="ml-auto text-xs text-ink/60">
            Showing {filtered.length} of {loans.length}
          </div>
        </div>
      </Card>

      <Card className="mt-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <caption className="sr-only">Loan book</caption>
            <thead className="border-b border-ink/10 text-xs uppercase tracking-wide text-ink/60">
              <tr>
                <th scope="col" className="py-2 pr-4">Reference</th>
                <th scope="col" className="py-2 pr-4">Member</th>
                <th scope="col" className="py-2 pr-4">Product</th>
                <th scope="col" className="py-2 pr-4 text-right">Principal</th>
                <th scope="col" className="py-2 pr-4 text-right">Outstanding</th>
                <th scope="col" className="py-2 pr-4 text-right">Instalment</th>
                <th scope="col" className="py-2 pr-4">Status</th>
                <th scope="col" className="py-2 pr-4 text-right">Days arrears</th>
                <th scope="col" className="py-2 pr-4">Next due</th>
                <th scope="col" className="py-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-sm text-ink/60">
                    No loans match the current filters.
                  </td>
                </tr>
              ) : (
                filtered.map((l) => (
                  <tr key={l.id} className="border-b border-ink/5 hover:bg-paper">
                    <td className="py-2 pr-4 font-mono text-xs text-ink">{l.reference}</td>
                    <td className="py-2 pr-4">
                      <div className="text-ink">{l.memberName}</div>
                      <div className="text-xs text-ink/60">{l.memberNumber}</div>
                    </td>
                    <td className="py-2 pr-4 text-xs">{l.productName}</td>
                    <td className="py-2 pr-4 text-right font-mono text-xs">
                      {formatMinor(l.principalMinor, l.currency)}
                    </td>
                    <td className="py-2 pr-4 text-right font-mono text-xs font-medium">
                      {formatMinor(l.outstandingMinor, l.currency)}
                    </td>
                    <td className="py-2 pr-4 text-right font-mono text-xs">
                      {formatMinor(l.monthlyInstalmentMinor, l.currency)}
                    </td>
                    <td className="py-2 pr-4">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_TONE[l.status]}`}>
                        {LOAN_STATUS_LABELS[l.status]}
                      </span>
                    </td>
                    <td className={`py-2 pr-4 text-right font-mono text-xs ${l.daysInArrears > 0 ? 'text-clay font-medium' : 'text-ink/60'}`}>
                      {l.daysInArrears > 0 ? l.daysInArrears : '—'}
                    </td>
                    <td className="py-2 pr-4 text-xs text-ink/70">
                      {l.nextDueAt
                        ? new Date(l.nextDueAt).toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: 'short',
                          })
                        : '—'}
                    </td>
                    <td className="py-2 text-right">
                      <Link
                        href={`/admin/credit/loans/${l.id}`}
                        className="text-xs font-medium text-sky hover:underline"
                      >
                        Open
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="mt-6">
        <h2 className="text-sm font-semibold text-ink">Reading the portfolio</h2>
        <p className="mt-2 text-sm text-ink/70">
          Portfolio at Risk (PAR) is the percentage of the book with a missed instalment. PAR 30 measures
          the whole book; PAR 90 isolates severe non-performance. A PAR 30 above 5% signals a collections
          problem; a PAR 90 above 2% signals credit standards are too loose. Every figure here is derived
          from the ledger and the repayment schedule, never from a stored balance column.
        </p>
      </Card>
    </div>
  );
}