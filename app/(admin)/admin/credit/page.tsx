'use client';

// ADM-120 — Loan Application Queue
// Route: /admin/credit

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/card';
import {
  getApplications,
  getApplicationCounts,
  getLoanBookCounts,
  getArrearsBuckets,
  getRestructureCounts,
  getWriteOffCounts,
  canViewCredit,
  LOAN_APP_STATUS_LABELS,
  formatMinor,
  type LoanApplicationStatus,
} from '@/lib/mock/credit';

type Filter = 'ALL' | LoanApplicationStatus | 'OPEN';

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

function Kpi({
  label,
  value,
  hint,
  tone,
  href,
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: 'clay' | 'red' | 'emerald';
  href?: string;
}) {
  const cls =
    tone === 'red'
      ? 'text-red-700'
      : tone === 'clay'
      ? 'text-clay'
      : tone === 'emerald'
      ? 'text-emerald-700'
      : 'text-ink';
  const inner = (
    <Card>
      <dl>
        <dt className="text-xs uppercase tracking-wide text-ink/60">{label}</dt>
        <dd className={`mt-1 text-2xl font-semibold ${cls}`}>{value}</dd>
        {hint ? <dd className="mt-1 text-xs text-ink/60">{hint}</dd> : null}
      </dl>
    </Card>
  );
  return href ? (
    <Link href={href} className="block hover:opacity-90">
      {inner}
    </Link>
  ) : (
    inner
  );
}

export default function CreditDashboardPage() {
  const allowed = canViewCredit();
  const apps = useMemo(() => (allowed ? getApplications() : []), [allowed]);
  const appCounts = useMemo(() => getApplicationCounts(), []);
  const loanCounts = useMemo(() => getLoanBookCounts(), []);
  const arrearsBuckets = useMemo(() => getArrearsBuckets(), []);
  const restructureCounts = useMemo(() => getRestructureCounts(), []);
  const writeOffCounts = useMemo(() => getWriteOffCounts(), []);

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
            You do not have access to the credit panel. Restricted to Credit Officer, Credit Analyst,
            Credit Manager, Finance Officer, Compliance Lead, Admin and Super Admin roles.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6">
      <header className="mb-6">
        <p className="text-xs uppercase tracking-wide text-ink/60">PNL-10 · Credit</p>
        <h1 className="mt-1 text-2xl font-semibold text-ink">Credit Dashboard</h1>
        <p className="mt-1 text-sm text-ink/70">
          Application pipeline, loan book, arrears position. Every credit decision is four-eyes.
        </p>
      </header>

      <section aria-label="Key queues" className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Kpi
          label="Open applications"
          value={String(appCounts.submitted + appCounts.assessment + appCounts.recommended)}
          hint={`${appCounts.recommended} awaiting decision`}
          tone={appCounts.recommended > 0 ? 'clay' : undefined}
          href="/admin/credit/applications"
        />
        <Kpi
          label="Active loans"
          value={String(loanCounts.active + loanCounts.restructured)}
          hint={`${loanCounts.total} total in book`}
          href="/admin/credit/loans"
        />
        <Kpi
          label="In arrears"
          value={String(loanCounts.inArrears)}
          hint={arrearsBuckets.d1_30 + arrearsBuckets.d31_60 + arrearsBuckets.d61_90 + arrearsBuckets.d90Plus > 0
            ? `${arrearsBuckets.d90Plus} over 90 days`
            : 'No active arrears'}
          tone={arrearsBuckets.d90Plus > 0 ? 'red' : loanCounts.inArrears > 0 ? 'clay' : undefined}
          href="/admin/credit/arrears"
        />
        <Kpi
          label="Restructures pending"
          value={String(restructureCounts.pending)}
          hint={`${restructureCounts.approved} approved to date`}
          tone={restructureCounts.pending > 0 ? 'clay' : undefined}
          href="/admin/credit/restructures"
        />
      </section>

      <section aria-label="Secondary queues" className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
        <Kpi
          label="Write-offs pending"
          value={String(writeOffCounts.pending + writeOffCounts.creditApproved)}
          hint={`${writeOffCounts.financeApproved} completed`}
          tone={writeOffCounts.pending + writeOffCounts.creditApproved > 0 ? 'clay' : undefined}
          href="/admin/credit/write-offs"
        />
        <Kpi
          label="Active guarantees"
          value={String(loanCounts.total)}
          hint="Across all loans"
          href="/admin/credit/guarantees"
        />
        <Kpi
          label="CRB submissions"
          value={String(loanCounts.total)}
          hint="Per-loan, append-only"
          href="/admin/credit/crb"
        />
        <Kpi
          label="Products enabled"
          value="4"
          hint="Personal, business, emergency, education"
          href="/admin/credit/products"
        />
      </section>

      <section aria-label="Quick links" className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Link href="/admin/credit/applications" className="rounded-lg border border-sky/30 bg-sky/5 p-3 text-sm font-medium text-sky hover:bg-sky/10">
          Applications →
        </Link>
        <Link href="/admin/credit/loans" className="rounded-lg border border-ink/15 bg-paper p-3 text-sm font-medium text-ink hover:bg-ink/5">
          Loan book →
        </Link>
        <Link href="/admin/credit/arrears" className="rounded-lg border border-ink/15 bg-paper p-3 text-sm font-medium text-ink hover:bg-ink/5">
          Arrears & collections →
        </Link>
        <Link href="/admin/credit/restructures" className="rounded-lg border border-ink/15 bg-paper p-3 text-sm font-medium text-ink hover:bg-ink/5">
          Restructures →
        </Link>
        <Link href="/admin/credit/write-offs" className="rounded-lg border border-ink/15 bg-paper p-3 text-sm font-medium text-ink hover:bg-ink/5">
          Write-offs →
        </Link>
        <Link href="/admin/credit/guarantees" className="rounded-lg border border-ink/15 bg-paper p-3 text-sm font-medium text-ink hover:bg-ink/5">
          Guarantors →
        </Link>
        <Link href="/admin/credit/crb" className="rounded-lg border border-ink/15 bg-paper p-3 text-sm font-medium text-ink hover:bg-ink/5">
          CRB →
        </Link>
        <Link href="/admin/credit/analytics" className="rounded-lg border border-ink/15 bg-paper p-3 text-sm font-medium text-ink hover:bg-ink/5">
          Credit analytics →
        </Link>
      </section>

      <Card className="mt-6">
        <h2 className="text-sm font-semibold text-ink">Application queue</h2>
        <div className="mt-3 flex flex-wrap items-end gap-3">
          <div>
            <label htmlFor="app-query" className="block text-xs font-medium text-ink/70">Search</label>
            <input
              id="app-query"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Reference, member, product…"
              className="mt-1 w-64 rounded-md border border-ink/15 bg-paper px-3 py-2 text-sm text-ink focus:border-sky focus:outline-none focus:ring-2 focus:ring-sky/40"
            />
          </div>
          <div>
            <label htmlFor="app-status" className="block text-xs font-medium text-ink/70">Status</label>
            <select
              id="app-status"
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

        <div className="mt-4 overflow-x-auto">
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