'use client';

// ADM-120 — Loan Application Queue
// Route: /admin/credit/applications

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/card';
import {
  getApplications,
  getApplicationCounts,
  canViewCredit,
  LOAN_APP_STATUS_LABELS,
  formatMinor,
  type LoanApplicationStatus,
} from '@/lib/mock/credit';

type Filter = 'OPEN' | 'ALL' | LoanApplicationStatus;

const STATUS_TONE: Record<LoanApplicationStatus, string> = {
  SUBMITTED: 'bg-clay/15 text-clay',
  ASSESSMENT: 'bg-sky/15 text-sky',
  RECOMMENDED: 'bg-clay/15 text-clay',
  APPROVED: 'bg-emerald-100 text-emerald-800',
  DECLINED: 'bg-red-100 text-red-800',
  WITHDRAWN: 'bg-ink/10 text-ink/70',
  OFFER_ISSUED: 'bg-sky/15 text-sky',
  OFFER_ACCEPTED: 'bg-sky/15 text-sky',
  DISBURSED: 'bg-emerald-100 text-emerald-800',
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

export default function CreditApplicationsPage() {
  const allowed = canViewCredit();
  const apps = useMemo(() => (allowed ? getApplications() : []), [allowed]);
  const counts = useMemo(() => getApplicationCounts(), []);

  const [filter, setFilter] = useState<Filter>('OPEN');
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    let list = apps;
    if (filter === 'OPEN') {
      list = list.filter(
        (a) =>
          a.status !== 'DISBURSED' &&
          a.status !== 'DECLINED' &&
          a.status !== 'WITHDRAWN'
      );
    } else if (filter !== 'ALL') {
      list = list.filter((a) => a.status === filter);
    }
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (a) =>
          a.reference.toLowerCase().includes(q) ||
          a.memberName.toLowerCase().includes(q) ||
          a.memberNumber.toLowerCase().includes(q) ||
          a.productName.toLowerCase().includes(q)
      );
    }
    return list;
  }, [apps, filter, query]);

  if (!allowed) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <Card>
          <h1 className="text-lg font-semibold text-ink">Permission denied</h1>
          <p className="mt-2 text-sm text-ink/70">
            You do not have access to the credit panel.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6">
      <nav aria-label="Breadcrumb" className="mb-3 text-xs text-ink/60">
        <Link href="/admin/credit" className="hover:text-sky">Credit</Link>
        <span className="mx-2">/</span>
        <span className="text-ink">Applications</span>
      </nav>

      <header className="mb-6">
        <p className="text-xs uppercase tracking-wide text-ink/60">PNL-10 · Credit</p>
        <h1 className="mt-1 text-2xl font-semibold text-ink">Loan Applications</h1>
        <p className="mt-1 text-sm text-ink/70">
          Every open application and its current state. Four-eyes on every decision.
        </p>
      </header>

      <section aria-label="Application counts" className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Kpi label="Open" value={String(counts.submitted + counts.assessment + counts.recommended)} tone={counts.submitted + counts.assessment + counts.recommended > 0 ? 'clay' : undefined} />
        <Kpi label="Approved" value={String(counts.approved)} tone="emerald" />
        <Kpi label="Declined" value={String(counts.declined)} />
        <Kpi label="Disbursed" value={String(counts.disbursed)} tone="emerald" />
      </section>

      <Card className="mt-6">
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label htmlFor="ca-query" className="block text-xs font-medium text-ink/70">Search</label>
            <input
              id="ca-query"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Reference, member, product…"
              className="mt-1 w-64 rounded-md border border-ink/15 bg-paper px-3 py-2 text-sm text-ink focus:border-sky focus:outline-none focus:ring-2 focus:ring-sky/40"
            />
          </div>
          <div>
            <label htmlFor="ca-status" className="block text-xs font-medium text-ink/70">Status</label>
            <select
              id="ca-status"
              value={filter}
              onChange={(e) => setFilter(e.target.value as Filter)}
              className="mt-1 rounded-md border border-ink/15 bg-paper px-3 py-2 text-sm text-ink focus:border-sky focus:outline-none focus:ring-2 focus:ring-sky/40"
            >
              <option value="OPEN">Open (not yet disbursed)</option>
              <option value="ALL">All statuses</option>
              {(Object.keys(LOAN_APP_STATUS_LABELS) as LoanApplicationStatus[]).map((s) => (
                <option key={s} value={s}>{LOAN_APP_STATUS_LABELS[s]}</option>
              ))}
            </select>
          </div>
          <div className="ml-auto text-xs text-ink/60">
            Showing {filtered.length} of {apps.length}
          </div>
        </div>
      </Card>

      <Card className="mt-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <caption className="sr-only">Loan applications</caption>
            <thead className="border-b border-ink/10 text-xs uppercase tracking-wide text-ink/60">
              <tr>
                <th scope="col" className="py-2 pr-4">Reference</th>
                <th scope="col" className="py-2 pr-4">Member</th>
                <th scope="col" className="py-2 pr-4">Product</th>
                <th scope="col" className="py-2 pr-4 text-right">Requested</th>
                <th scope="col" className="py-2 pr-4 text-right">Tenor</th>
                <th scope="col" className="py-2 pr-4 text-right">Guarantors</th>
                <th scope="col" className="py-2 pr-4">Status</th>
                <th scope="col" className="py-2 pr-4">Submitted</th>
                <th scope="col" className="py-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-sm text-ink/60">
                    No applications match the current filters.
                  </td>
                </tr>
              ) : (
                filtered.map((a) => (
                  <tr key={a.id} className="border-b border-ink/5 hover:bg-paper">
                    <td className="py-2 pr-4 font-mono text-xs text-ink">{a.reference}</td>
                    <td className="py-2 pr-4">
                      <div className="text-ink">{a.memberName}</div>
                      <div className="text-xs text-ink/60">{a.memberNumber}</div>
                    </td>
                    <td className="py-2 pr-4 text-xs">{a.productName}</td>
                    <td className="py-2 pr-4 text-right font-mono text-xs">
                      {formatMinor(a.requestedAmountMinor, 'KES')}
                    </td>
                    <td className="py-2 pr-4 text-right text-xs">{a.requestedTenorMonths}m</td>
                    <td className="py-2 pr-4 text-right font-mono text-xs">{a.guarantorCount}</td>
                    <td className="py-2 pr-4">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_TONE[a.status]}`}>
                        {LOAN_APP_STATUS_LABELS[a.status]}
                      </span>
                    </td>
                    <td className="py-2 pr-4 text-xs text-ink/60">
                      {new Date(a.submittedAt).toLocaleString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-2 text-right">
                      <Link
                        href={`/admin/credit/applications/${a.id}`}
                        className="text-xs font-medium text-sky hover:underline"
                      >
                        Assess
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}