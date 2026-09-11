'use client';

// ADM-126 — Arrears and Collections Workspace
// Route: /admin/credit/arrears

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/card';
import {
  getArrears,
  getArrearsBuckets,
  canViewCredit,
  ARREARS_BUCKET_LABELS,
  formatMinor,
  type ArrearsBucket,
} from '@/lib/mock/credit';

type Filter = 'ALL' | ArrearsBucket;

const BUCKET_TONE: Record<ArrearsBucket, string> = {
  CURRENT: 'bg-emerald-100 text-emerald-800',
  D1_30: 'bg-clay/15 text-clay',
  D31_60: 'bg-clay/15 text-clay',
  D61_90: 'bg-red-100 text-red-800',
  D90_PLUS: 'bg-red-200 text-red-900',
};

export default function ArrearsPage() {
  const allowed = canViewCredit();
  const cases = useMemo(() => (allowed ? getArrears() : []), [allowed]);
  const buckets = useMemo(() => getArrearsBuckets(), []);

  const [filter, setFilter] = useState<Filter>('ALL');
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    let list = cases;
    if (filter !== 'ALL') list = list.filter((c) => c.bucket === filter);
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (c) =>
          c.loanReference.toLowerCase().includes(q) ||
          c.memberName.toLowerCase().includes(q) ||
          c.memberNumber.toLowerCase().includes(q)
      );
    }
    return list;
  }, [cases, filter, query]);

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

  return (
    <div className="p-6">
      <nav aria-label="Breadcrumb" className="mb-3 text-xs text-ink/60">
        <Link href="/admin/credit" className="hover:text-sky">Credit</Link>
        <span className="mx-2">/</span>
        <span className="text-ink">Arrears & collections</span>
      </nav>

      <header className="mb-6">
        <p className="text-xs uppercase tracking-wide text-ink/60">PNL-10 · Credit</p>
        <h1 className="mt-1 text-2xl font-semibold text-ink">Arrears and Collections</h1>
        <p className="mt-1 text-sm text-ink/70">
          Every loan in arrears, its ageing bucket, and the next scheduled action. Compliant collections
          only — CBK Prudential Guidelines apply.
        </p>
      </header>

      <section aria-label="Arrears buckets" className="grid grid-cols-2 gap-4 md:grid-cols-5">
        <Card>
          <dl>
            <dt className="text-xs uppercase tracking-wide text-ink/60">1–30 days</dt>
            <dd className="mt-1 text-2xl font-semibold text-clay">{buckets.d1_30}</dd>
          </dl>
        </Card>
        <Card>
          <dl>
            <dt className="text-xs uppercase tracking-wide text-ink/60">31–60 days</dt>
            <dd className="mt-1 text-2xl font-semibold text-clay">{buckets.d31_60}</dd>
          </dl>
        </Card>
        <Card>
          <dl>
            <dt className="text-xs uppercase tracking-wide text-ink/60">61–90 days</dt>
            <dd className={`mt-1 text-2xl font-semibold ${buckets.d61_90 > 0 ? 'text-red-700' : 'text-ink'}`}>
              {buckets.d61_90}
            </dd>
          </dl>
        </Card>
        <Card>
          <dl>
            <dt className="text-xs uppercase tracking-wide text-ink/60">90+ days</dt>
            <dd className={`mt-1 text-2xl font-semibold ${buckets.d90Plus > 0 ? 'text-red-700' : 'text-ink'}`}>
              {buckets.d90Plus}
            </dd>
          </dl>
        </Card>
        <Card>
          <dl>
            <dt className="text-xs uppercase tracking-wide text-ink/60">Total cases</dt>
            <dd className="mt-1 text-2xl font-semibold text-ink">{buckets.total}</dd>
          </dl>
        </Card>
      </section>

      <div role="note" className="mt-4 rounded-lg border border-clay/30 bg-clay/5 p-3 text-sm text-ink">
        <strong className="font-medium">Compliant collections only.</strong> Contact hours 08:00–20:00
        local. No third-party disclosure. No threats or pressure. Every contact is logged. Recovery
        outcomes are secondary to compliance; if in doubt, escalate to the Credit Manager before acting.
      </div>

      <Card className="mt-6">
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label htmlFor="arr-query" className="block text-xs font-medium text-ink/70">Search</label>
            <input
              id="arr-query"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Loan, member…"
              className="mt-1 w-64 rounded-md border border-ink/15 bg-paper px-3 py-2 text-sm text-ink focus:border-sky focus:outline-none focus:ring-2 focus:ring-sky/40"
            />
          </div>
          <div>
            <label htmlFor="arr-bucket" className="block text-xs font-medium text-ink/70">Bucket</label>
            <select
              id="arr-bucket"
              value={filter}
              onChange={(e) => setFilter(e.target.value as Filter)}
              className="mt-1 rounded-md border border-ink/15 bg-paper px-3 py-2 text-sm text-ink focus:border-sky focus:outline-none focus:ring-2 focus:ring-sky/40"
            >
              <option value="ALL">All buckets</option>
              <option value="D1_30">1–30 days</option>
              <option value="D31_60">31–60 days</option>
              <option value="D61_90">61–90 days</option>
              <option value="D90_PLUS">90+ days</option>
            </select>
          </div>
          <div className="ml-auto text-xs text-ink/60">
            Showing {filtered.length} of {cases.length}
          </div>
        </div>
      </Card>

      <div className="mt-4 space-y-4">
        {filtered.length === 0 ? (
          <Card>
            <p className="text-center text-sm text-ink/60">No arrears cases match the current filters.</p>
          </Card>
        ) : (
          filtered.map((c) => (
            <Card key={c.id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-mono text-sm font-semibold text-ink">{c.loanReference}</h2>
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${BUCKET_TONE[c.bucket]}`}>
                      {ARREARS_BUCKET_LABELS[c.bucket]}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-ink">
                    {c.memberName} · {c.memberNumber}
                  </p>
                  <p className="mt-1 text-xs text-ink/60">
                    {c.daysInArrears} days in arrears · Opened{' '}
                    {new Date(c.openedAt).toLocaleDateString('en-GB')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs uppercase tracking-wide text-ink/60">Outstanding</p>
                  <p className="font-mono text-lg font-semibold text-ink">
                    {formatMinor(c.outstandingMinor, c.currency)}
                  </p>
                </div>
              </div>

              <dl className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-3">
                <div>
                  <dt className="text-xs uppercase tracking-wide text-ink/60">Last contact</dt>
                  <dd className="mt-1 text-sm text-ink">
                    {c.lastContactAt
                      ? `${new Date(c.lastContactAt).toLocaleDateString('en-GB')} · ${c.lastContactMethod}`
                      : '—'}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-ink/60">Next action</dt>
                  <dd className="mt-1 text-sm text-ink">
                    {c.nextActionAt
                      ? new Date(c.nextActionAt).toLocaleDateString('en-GB')
                      : 'Not scheduled'}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-ink/60">Note</dt>
                  <dd className="mt-1 text-sm text-ink">{c.nextActionNote ?? '—'}</dd>
                </div>
              </dl>

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  className="rounded-md border border-ink/20 bg-paper px-3 py-1.5 text-xs font-medium text-ink hover:bg-ink/5"
                >
                  Log contact
                </button>
                <button
                  type="button"
                  className="rounded-md border border-ink/20 bg-paper px-3 py-1.5 text-xs font-medium text-ink hover:bg-ink/5"
                >
                  Propose restructure
                </button>
                <Link
                  href={`/admin/credit/loans/${c.loanId}`}
                  className="rounded-md border border-ink/20 bg-paper px-3 py-1.5 text-xs font-medium text-ink hover:bg-ink/5"
                >
                  Open loan
                </Link>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}