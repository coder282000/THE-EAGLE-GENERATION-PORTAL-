'use client';

// ADM-131 — Credit Analytics and Regulatory Returns
// Route: /admin/credit/analytics

import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Card } from '@/components/card';
import {
  getAnalytics,
  getLoanBookCounts,
  getArrearsBuckets,
  getApplicationCounts,
  canViewCredit,
  formatMinor,
} from '@/lib/mock/credit';

function Kpi({
  label,
  value,
  denominator,
  hint,
  tone,
}: {
  label: string;
  value: string;
  denominator?: string;
  hint?: string;
  tone?: 'clay' | 'red' | 'emerald';
}) {
  const cls =
    tone === 'red' ? 'text-red-700' : tone === 'clay' ? 'text-clay' : tone === 'emerald' ? 'text-emerald-700' : 'text-ink';
  return (
    <Card>
      <dl>
        <dt className="text-xs uppercase tracking-wide text-ink/60">{label}</dt>
        <dd className={`mt-1 font-mono text-2xl font-semibold ${cls}`}>{value}</dd>
        {denominator ? (
          <dd className="mt-0.5 text-xs text-ink/60">
            <span className="font-medium">Denominator:</span> {denominator}
          </dd>
        ) : null}
        {hint ? <dd className="mt-1 text-xs text-ink/60">{hint}</dd> : null}
      </dl>
    </Card>
  );
}

export default function CreditAnalyticsPage() {
  const allowed = canViewCredit();
  const analytics = useMemo(() => (allowed ? getAnalytics() : []), [allowed]);
  const loanCounts = useMemo(() => getLoanBookCounts(), []);
  const buckets = useMemo(() => getArrearsBuckets(), []);
  const appCounts = useMemo(() => getApplicationCounts(), []);

  const latest = analytics[0] ?? null;

  const parData = useMemo(() => {
    if (!latest) return [];
    return [
      { label: 'PAR 30', value: latest.par30 },
      { label: 'PAR 60', value: latest.par60 },
      { label: 'PAR 90', value: latest.par90 },
    ];
  }, [latest]);

  const volumeData = useMemo(
    () =>
      analytics.map((a) => ({
        period: a.period,
        disbursements: a.disbursementsMinor / 100,
        repayments: a.repaymentsMinor / 100,
      })),
    [analytics]
  );

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

  const approvalRate =
    latest && latest.applicationsReceived > 0
      ? ((latest.applicationsApproved / latest.applicationsReceived) * 100).toFixed(1)
      : '—';

  return (
    <div className="p-6">
      <header className="mb-6">
        <p className="text-xs uppercase tracking-wide text-ink/60">PNL-10 · Credit</p>
        <h1 className="mt-1 text-2xl font-semibold text-ink">Credit Analytics and Regulatory Returns</h1>
        <p className="mt-1 text-sm text-ink/70">
          Portfolio quality, approval rates, and portfolio-at-risk. Every rate displays its denominator
          (FR-10.6).
        </p>
      </header>

      <section aria-label="Portfolio quality" className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Kpi
          label="Portfolio outstanding"
          value={latest ? formatMinor(latest.portfolioOutstandingMinor, 'KES') : '—'}
          denominator={`${loanCounts.active + loanCounts.inArrears + loanCounts.restructured} live loans`}
        />
        <Kpi
          label="Approval rate (30d)"
          value={`${approvalRate}%`}
          denominator={
            latest ? `${latest.applicationsApproved} of ${latest.applicationsReceived} applications` : undefined
          }
          hint="Lower rate = tighter underwriting"
        />
        <Kpi
          label="Restructures (30d)"
          value={String(latest?.restructures ?? 0)}
          denominator={`${loanCounts.restructured} restructured in book`}
        />
        <Kpi
          label="Write-offs (30d)"
          value={latest ? formatMinor(latest.writeOffsMinor, 'KES') : '—'}
          denominator={`${loanCounts.writtenOff} written off lifetime`}
          tone={latest && latest.writeOffsMinor > 0 ? 'clay' : undefined}
        />
      </section>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="text-sm font-semibold text-ink">Portfolio at risk (PAR)</h2>
          <p className="mt-1 text-xs text-ink/60">
            Share of the book with a missed instalment at each ageing threshold. Targets: PAR 30 under 5%,
            PAR 90 under 2%.
          </p>
          <div className="mt-4 h-64" aria-hidden>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={parData} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}%`} />
                <Tooltip formatter={(v) => `${Number(v ?? 0).toFixed(2)}%`} />
                <Bar dataKey="value" fill="#D97706" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <table className="sr-only">
            <caption>Portfolio at risk</caption>
            <thead>
              <tr>
                <th scope="col">Threshold</th>
                <th scope="col">Rate</th>
              </tr>
            </thead>
            <tbody>
              {parData.map((p) => (
                <tr key={p.label}>
                  <td>{p.label}</td>
                  <td>{p.value.toFixed(2)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <Card>
          <h2 className="text-sm font-semibold text-ink">Disbursements vs repayments</h2>
          <p className="mt-1 text-xs text-ink/60">
            Net cash flow through the credit book. Repayments exceeding disbursements means the book is
            de-growing.
          </p>
          <div className="mt-4 h-64" aria-hidden>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={volumeData} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="period" tick={{ fontSize: 11 }} />
                <YAxis
                  tick={{ fontSize: 11 }}
                  tickFormatter={(v) => Number(v ?? 0).toLocaleString('en-KE')}
                />
                <Tooltip formatter={(v) => `KES ${Number(v ?? 0).toLocaleString('en-KE')}`} />
                <Line type="monotone" dataKey="disbursements" stroke="#D97706" strokeWidth={2} />
                <Line type="monotone" dataKey="repayments" stroke="#2563EB" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <table className="sr-only">
            <caption>Disbursements and repayments</caption>
            <thead>
              <tr>
                <th scope="col">Period</th>
                <th scope="col">Disbursements</th>
                <th scope="col">Repayments</th>
              </tr>
            </thead>
            <tbody>
              {volumeData.map((v) => (
                <tr key={v.period}>
                  <td>{v.period}</td>
                  <td>{v.disbursements.toLocaleString('en-KE')}</td>
                  <td>{v.repayments.toLocaleString('en-KE')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>

      <Card className="mt-6">
        <h2 className="text-sm font-semibold text-ink">Application pipeline</h2>
        <dl className="mt-3 grid grid-cols-2 gap-4 md:grid-cols-4">
          <div>
            <dt className="text-xs uppercase tracking-wide text-ink/60">Submitted</dt>
            <dd className="mt-1 font-mono text-xl font-semibold text-clay">{appCounts.submitted}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-ink/60">Assessment</dt>
            <dd className="mt-1 font-mono text-xl font-semibold text-sky">{appCounts.assessment}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-ink/60">Awaiting decision</dt>
            <dd className="mt-1 font-mono text-xl font-semibold text-clay">{appCounts.recommended}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-ink/60">Disbursed (all time)</dt>
            <dd className="mt-1 font-mono text-xl font-semibold text-emerald-700">{appCounts.disbursed}</dd>
          </div>
        </dl>
      </Card>

      <Card className="mt-6">
        <h2 className="text-sm font-semibold text-ink">Arrears ageing</h2>
        <dl className="mt-3 grid grid-cols-2 gap-4 md:grid-cols-5">
          <div>
            <dt className="text-xs uppercase tracking-wide text-ink/60">Current</dt>
            <dd className="mt-1 font-mono text-xl font-semibold text-emerald-700">{buckets.current}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-ink/60">1–30 days</dt>
            <dd className="mt-1 font-mono text-xl font-semibold text-clay">{buckets.d1_30}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-ink/60">31–60 days</dt>
            <dd className="mt-1 font-mono text-xl font-semibold text-clay">{buckets.d31_60}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-ink/60">61–90 days</dt>
            <dd className={`mt-1 font-mono text-xl font-semibold ${buckets.d61_90 > 0 ? 'text-red-700' : 'text-ink'}`}>
              {buckets.d61_90}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-ink/60">90+ days</dt>
            <dd className={`mt-1 font-mono text-xl font-semibold ${buckets.d90Plus > 0 ? 'text-red-700' : 'text-ink'}`}>
              {buckets.d90Plus}
            </dd>
          </div>
        </dl>
      </Card>

      <Card className="mt-6">
        <h2 className="text-sm font-semibold text-ink">Regulatory returns</h2>
        <p className="mt-2 text-sm text-ink/70">
          Credit returns are filed with the Central Bank of Kenya quarterly. The returns themselves are
          prepared in PNL-15 Compliance (ADM-189 Regulatory Reporting Calendar). Figures here are the
          inputs; the return is assembled from the ledger and the loan book, never from a spreadsheet.
        </p>
      </Card>
    </div>
  );
}