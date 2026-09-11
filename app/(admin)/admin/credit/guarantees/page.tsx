'use client';

// ADM-129 — Guarantor Register and Exposure
// Route: /admin/credit/guarantees

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/card';
import {
  getGuarantees,
  getGuaranteeCounts,
  canViewCredit,
  GUARANTEE_STATUS_LABELS,
  formatMinor,
  type GuaranteeStatus,
} from '@/lib/mock/credit';

type Filter = 'ALL' | GuaranteeStatus;

const STATUS_TONE: Record<GuaranteeStatus, string> = {
  ACTIVE: 'bg-emerald-100 text-emerald-800',
  RELEASED: 'bg-ink/10 text-ink/70',
  CALLED: 'bg-clay/15 text-clay',
  DEMANDED: 'bg-red-100 text-red-800',
};

function Kpi({ label, value, tone }: { label: string; value: string; tone?: 'clay' | 'red' | 'emerald' }) {
  const cls =
    tone === 'red' ? 'text-red-700' : tone === 'clay' ? 'text-clay' : tone === 'emerald' ? 'text-emerald-700' : 'text-ink';
  return (
    <Card>
      <dl>
        <dt className="text-xs uppercase tracking-wide text-ink/60">{label}</dt>
        <dd className={`mt-1 font-mono text-2xl font-semibold ${cls}`}>{value}</dd>
      </dl>
    </Card>
  );
}

export default function GuaranteesPage() {
  const allowed = canViewCredit();
  const guarantees = useMemo(() => (allowed ? getGuarantees() : []), [allowed]);
  const counts = useMemo(() => getGuaranteeCounts(), []);

  const [filter, setFilter] = useState<Filter>('ALL');
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    let list = guarantees;
    if (filter !== 'ALL') list = list.filter((g) => g.status === filter);
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (g) =>
          g.loanReference.toLowerCase().includes(q) ||
          g.borrowerName.toLowerCase().includes(q) ||
          g.borrowerNumber.toLowerCase().includes(q) ||
          g.guarantorName.toLowerCase().includes(q) ||
          g.guarantorNumber.toLowerCase().includes(q)
      );
    }
    return list;
  }, [guarantees, filter, query]);

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

  const totalExposure = guarantees.filter((g) => g.status === 'ACTIVE').reduce((s, g) => s + g.amountMinor, 0);

  return (
    <div className="p-6">
      <nav aria-label="Breadcrumb" className="mb-3 text-xs text-ink/60">
        <Link href="/admin/credit" className="hover:text-sky">Credit</Link>
        <span className="mx-2">/</span>
        <span className="text-ink">Guarantor register</span>
      </nav>

      <header className="mb-6">
        <p className="text-xs uppercase tracking-wide text-ink/60">PNL-10 · Credit</p>
        <h1 className="mt-1 text-2xl font-semibold text-ink">Guarantor Register and Exposure</h1>
        <p className="mt-1 text-sm text-ink/70">
          Every guarantee on the book, its amount, and its status. A demand cannot be issued without a
          recorded notification to the guarantor.
        </p>
      </header>

      <section aria-label="Guarantee counts" className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Kpi label="Total guarantees" value={String(counts.total)} />
        <Kpi label="Active" value={String(counts.active)} tone="emerald" />
        <Kpi label="Active exposure" value={formatMinor(totalExposure, 'KES')} />
        <Kpi
          label="Demanded / called"
          value={String(counts.demanded)}
          tone={counts.demanded > 0 ? 'red' : undefined}
        />
      </section>

      <Card className="mt-6">
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label htmlFor="gu-query" className="block text-xs font-medium text-ink/70">Search</label>
            <input
              id="gu-query"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Loan, borrower, guarantor…"
              className="mt-1 w-72 rounded-md border border-ink/15 bg-paper px-3 py-2 text-sm text-ink focus:border-sky focus:outline-none focus:ring-2 focus:ring-sky/40"
            />
          </div>
          <div>
            <label htmlFor="gu-status" className="block text-xs font-medium text-ink/70">Status</label>
            <select
              id="gu-status"
              value={filter}
              onChange={(e) => setFilter(e.target.value as Filter)}
              className="mt-1 rounded-md border border-ink/15 bg-paper px-3 py-2 text-sm text-ink focus:border-sky focus:outline-none focus:ring-2 focus:ring-sky/40"
            >
              <option value="ALL">All statuses</option>
              {(Object.keys(GUARANTEE_STATUS_LABELS) as GuaranteeStatus[]).map((s) => (
                <option key={s} value={s}>{GUARANTEE_STATUS_LABELS[s]}</option>
              ))}
            </select>
          </div>
          <div className="ml-auto text-xs text-ink/60">
            Showing {filtered.length} of {guarantees.length}
          </div>
        </div>
      </Card>

      <Card className="mt-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <caption className="sr-only">Guarantees</caption>
            <thead className="border-b border-ink/10 text-xs uppercase tracking-wide text-ink/60">
              <tr>
                <th scope="col" className="py-2 pr-4">Loan</th>
                <th scope="col" className="py-2 pr-4">Borrower</th>
                <th scope="col" className="py-2 pr-4">Guarantor</th>
                <th scope="col" className="py-2 pr-4 text-right">Amount</th>
                <th scope="col" className="py-2 pr-4">Status</th>
                <th scope="col" className="py-2 pr-4">Registered</th>
                <th scope="col" className="py-2 pr-4">Released / demanded</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-sm text-ink/60">
                    No guarantees match the current filters.
                  </td>
                </tr>
              ) : (
                filtered.map((g) => (
                  <tr key={g.id} className="border-b border-ink/5 hover:bg-paper">
                    <td className="py-2 pr-4 font-mono text-xs">
                      <Link href={`/admin/credit/loans/${g.loanId}`} className="text-sky hover:underline">
                        {g.loanReference}
                      </Link>
                    </td>
                    <td className="py-2 pr-4">
                      <div className="text-ink">{g.borrowerName}</div>
                      <div className="text-xs text-ink/60">{g.borrowerNumber}</div>
                    </td>
                    <td className="py-2 pr-4">
                      <div className="text-ink">{g.guarantorName}</div>
                      <div className="text-xs text-ink/60">{g.guarantorNumber}</div>
                    </td>
                    <td className="py-2 pr-4 text-right font-mono text-xs">
                      {formatMinor(g.amountMinor, g.currency)}
                    </td>
                    <td className="py-2 pr-4">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_TONE[g.status]}`}>
                        {GUARANTEE_STATUS_LABELS[g.status]}
                      </span>
                    </td>
                    <td className="py-2 pr-4 text-xs text-ink/70">
                      {new Date(g.registeredAt).toLocaleDateString('en-GB')}
                    </td>
                    <td className="py-2 pr-4 text-xs text-ink/70">
                      {g.releasedAt
                        ? `Released ${new Date(g.releasedAt).toLocaleDateString('en-GB')}`
                        : g.demandIssuedAt
                        ? `Demanded ${new Date(g.demandIssuedAt).toLocaleDateString('en-GB')}`
                        : '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="mt-6">
        <h2 className="text-sm font-semibold text-ink">Demand procedure</h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-ink/70">
          <li>Only after the loan is in arrears beyond the product&apos;s written-off trigger.</li>
          <li>Notify the guarantor in writing, with the amount due and a 14-day response window.</li>
          <li>Record the notification in the credit file.</li>
          <li>Only then issue the demand. The demand itself is a separate audited action.</li>
          <li>If the guarantor pays, the loan account is credited and the guarantee is marked CALLED.</li>
          <li>If the guarantor does not pay, escalate to the Credit Manager and consider write-off.</li>
        </ol>
      </Card>
    </div>
  );
}