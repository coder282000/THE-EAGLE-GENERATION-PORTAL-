'use client';

// ADM-180 — KYC Verification Queue
// Route: /admin/compliance

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/card';
import {
  getKYCCases,
  getKYCQueueCounts,
  getAMLQueueCounts,
  getSanctionsCounts,
  getSARCounts,
  getTravelRuleCounts,
  getFilingCounts,
  getControlCounts,
  canViewCompliance,
  KYC_STATUS_LABELS,
  KYC_TIER_LABELS,
  AML_SEVERITY_LABELS,
  type KYCCaseStatus,
} from '@/lib/mock/compliance';

type Filter = 'ALL' | KYCCaseStatus | 'PENDING_ALL';

const STATUS_TONE: Record<KYCCaseStatus, string> = {
  SUBMITTED: 'bg-clay/15 text-clay',
  IN_REVIEW: 'bg-sky/15 text-sky',
  MORE_INFO_NEEDED: 'bg-clay/15 text-clay',
  APPROVED: 'bg-emerald-100 text-emerald-800',
  REJECTED: 'bg-red-100 text-red-800',
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

export default function ComplianceDashboardPage() {
  const allowed = canViewCompliance();
  const kycCounts = useMemo(() => getKYCQueueCounts(), []);
  const amlCounts = useMemo(() => getAMLQueueCounts(), []);
  const sanctionsCounts = useMemo(() => getSanctionsCounts(), []);
  const sarCounts = useMemo(() => getSARCounts(), []);
  const trCounts = useMemo(() => getTravelRuleCounts(), []);
  const filingCounts = useMemo(() => getFilingCounts(), []);
  const controlCounts = useMemo(() => getControlCounts(), []);

  const cases = useMemo(() => (allowed ? getKYCCases() : []), [allowed]);
  const [filter, setFilter] = useState<Filter>('PENDING_ALL');
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    let list = cases;
    if (filter === 'PENDING_ALL') {
      list = list.filter((c) => c.status === 'SUBMITTED' || c.status === 'IN_REVIEW' || c.status === 'MORE_INFO_NEEDED');
    } else if (filter !== 'ALL') {
      list = list.filter((c) => c.status === filter);
    }
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (c) =>
          c.reference.toLowerCase().includes(q) ||
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
          <p className="mt-2 text-sm text-ink/70">
            You do not have access to the compliance panel. Restricted to Compliance Lead, Compliance
            Analyst, Finance Officer, Admin and Super Admin roles.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6">
      <header className="mb-6">
        <p className="text-xs uppercase tracking-wide text-ink/60">PNL-15 · Compliance</p>
        <h1 className="mt-1 text-2xl font-semibold text-ink">Compliance Dashboard</h1>
        <p className="mt-1 text-sm text-ink/70">
          Every active queue: KYC, AML, sanctions, SARs, Travel Rule, filings, controls. This is the
          auditor&apos;s entry point.
        </p>
      </header>

      <section aria-label="KYC queue" className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Kpi
          label="KYC pending"
          value={String(kycCounts.pending)}
          hint={`${kycCounts.total} total cases`}
          tone={kycCounts.breachedSla > 0 ? 'red' : kycCounts.pending > 0 ? 'clay' : undefined}
        />
        <Kpi
          label="AML alerts pending"
          value={String(amlCounts.pending)}
          hint={amlCounts.critical > 0 ? `${amlCounts.critical} critical` : `${amlCounts.escalated} escalated`}
          tone={amlCounts.critical > 0 ? 'red' : amlCounts.pending > 0 ? 'clay' : undefined}
        />
        <Kpi
          label="Sanctions pending"
          value={String(sanctionsCounts.pending)}
          hint={`${sanctionsCounts.total} total hits`}
          tone={sanctionsCounts.pending > 0 ? 'clay' : undefined}
        />
        <Kpi
          label="SARs pending approval"
          value={String(sarCounts.pendingApproval)}
          hint={`${sarCounts.filed} filed to date`}
          tone={sarCounts.pendingApproval > 0 ? 'clay' : undefined}
        />
      </section>

      <section aria-label="Secondary queues" className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
        <Kpi
          label="Travel Rule failures"
          value={String(trCounts.failed)}
          hint={`${trCounts.delivered} delivered · ${trCounts.pending} pending`}
          tone={trCounts.failed > 0 ? 'red' : 'emerald'}
        />
        <Kpi
          label="Filings overdue"
          value={String(filingCounts.overdue)}
          hint={`${filingCounts.draft + filingCounts.ready} in preparation`}
          tone={filingCounts.overdue > 0 ? 'red' : 'emerald'}
        />
        <Kpi
          label="Controls effective"
          value={`${controlCounts.effective} / ${controlCounts.total}`}
          hint={
            controlCounts.needsAttention + controlCounts.failing > 0
              ? `${controlCounts.needsAttention} attention · ${controlCounts.failing} failing`
              : 'All controls current'
          }
          tone={
            controlCounts.failing > 0
              ? 'red'
              : controlCounts.needsAttention > 0
              ? 'clay'
              : 'emerald'
          }
        />
        <Kpi
          label="KYC breached SLA"
          value={String(kycCounts.breachedSla)}
          hint="Open beyond 24h"
          tone={kycCounts.breachedSla > 0 ? 'red' : undefined}
        />
      </section>

      <section aria-label="Compliance sections" className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Link href="/admin/compliance" className="rounded-lg border border-sky/30 bg-sky/5 p-3 text-sm font-medium text-sky hover:bg-sky/10">
          KYC queue →
        </Link>
        <Link href="/admin/compliance/aml" className="rounded-lg border border-ink/15 bg-paper p-3 text-sm font-medium text-ink hover:bg-ink/5">
          AML alerts →
        </Link>
        <Link href="/admin/compliance/sanctions" className="rounded-lg border border-ink/15 bg-paper p-3 text-sm font-medium text-ink hover:bg-ink/5">
          Sanctions & PEP →
        </Link>
        <Link href="/admin/compliance/sars" className="rounded-lg border border-ink/15 bg-paper p-3 text-sm font-medium text-ink hover:bg-ink/5">
          SAR filing log →
        </Link>
        <Link href="/admin/compliance/rules" className="rounded-lg border border-ink/15 bg-paper p-3 text-sm font-medium text-ink hover:bg-ink/5">
          Monitoring rules →
        </Link>
        <Link href="/admin/compliance/risk" className="rounded-lg border border-ink/15 bg-paper p-3 text-sm font-medium text-ink hover:bg-ink/5">
          Risk register →
        </Link>
        <Link href="/admin/compliance/travel-rule" className="rounded-lg border border-ink/15 bg-paper p-3 text-sm font-medium text-ink hover:bg-ink/5">
          Travel Rule log →
        </Link>
        <Link href="/admin/compliance/filings" className="rounded-lg border border-ink/15 bg-paper p-3 text-sm font-medium text-ink hover:bg-ink/5">
          Regulatory filings →
        </Link>
        <Link href="/admin/compliance/controls" className="rounded-lg border border-ink/15 bg-paper p-3 text-sm font-medium text-ink hover:bg-ink/5">
          Control evidence →
        </Link>
      </section>

      <Card className="mt-6">
        <h2 className="text-sm font-semibold text-ink">KYC verification queue</h2>
        <div className="mt-3 flex flex-wrap items-end gap-3">
          <div>
            <label htmlFor="kyc-query" className="block text-xs font-medium text-ink/70">Search</label>
            <input
              id="kyc-query"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Reference, member, number…"
              className="mt-1 w-64 rounded-md border border-ink/15 bg-paper px-3 py-2 text-sm text-ink focus:border-sky focus:outline-none focus:ring-2 focus:ring-sky/40"
            />
          </div>
          <div>
            <label htmlFor="kyc-status" className="block text-xs font-medium text-ink/70">Status</label>
            <select
              id="kyc-status"
              value={filter}
              onChange={(e) => setFilter(e.target.value as Filter)}
              className="mt-1 rounded-md border border-ink/15 bg-paper px-3 py-2 text-sm text-ink focus:border-sky focus:outline-none focus:ring-2 focus:ring-sky/40"
            >
              <option value="PENDING_ALL">Pending (all open)</option>
              <option value="ALL">All statuses</option>
              {(Object.keys(KYC_STATUS_LABELS) as KYCCaseStatus[]).map((s) => (
                <option key={s} value={s}>{KYC_STATUS_LABELS[s]}</option>
              ))}
            </select>
          </div>
          <div className="ml-auto text-xs text-ink/60">
            Showing {filtered.length} of {cases.length}
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <caption className="sr-only">KYC verification cases</caption>
            <thead className="border-b border-ink/10 text-xs uppercase tracking-wide text-ink/60">
              <tr>
                <th scope="col" className="py-2 pr-4">Reference</th>
                <th scope="col" className="py-2 pr-4">Member</th>
                <th scope="col" className="py-2 pr-4">Country</th>
                <th scope="col" className="py-2 pr-4">Requested tier</th>
                <th scope="col" className="py-2 pr-4 text-right">Docs</th>
                <th scope="col" className="py-2 pr-4">Status</th>
                <th scope="col" className="py-2 pr-4">Submitted</th>
                <th scope="col" className="py-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-sm text-ink/60">
                    No KYC cases match the current filters.
                  </td>
                </tr>
              ) : (
                filtered.map((c) => {
                  const submitted = new Date(c.submittedAt).getTime();
                  const deadline = submitted + c.slaHours * 3600000;
                  const isOpen = c.status !== 'APPROVED' && c.status !== 'REJECTED';
                  const breached = isOpen && deadline < Date.now();
                  return (
                    <tr key={c.id} className="border-b border-ink/5 hover:bg-paper">
                      <td className="py-2 pr-4 font-mono text-xs text-ink">{c.reference}</td>
                      <td className="py-2 pr-4">
                        <div className="text-ink">{c.memberName}</div>
                        <div className="text-xs text-ink/60">{c.memberNumber}</div>
                      </td>
                      <td className="py-2 pr-4 text-xs">{c.memberCountry}</td>
                      <td className="py-2 pr-4 text-xs">{KYC_TIER_LABELS[c.tier]}</td>
                      <td className="py-2 pr-4 text-right font-mono text-xs">{c.documentCount}</td>
                      <td className="py-2 pr-4">
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_TONE[c.status]}`}>
                          {KYC_STATUS_LABELS[c.status]}
                        </span>
                      </td>
                      <td className="py-2 pr-4 text-xs">
                        <div className="text-ink/70">
                          {new Date(c.submittedAt).toLocaleString('en-GB', {
                            day: '2-digit',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                        {breached ? (
                          <div className="font-medium text-red-700">Breached SLA</div>
                        ) : null}
                      </td>
                      <td className="py-2 text-right">
                        <Link
                          href={`/admin/compliance/cases/${c.id}`}
                          className="text-xs font-medium text-sky hover:underline"
                        >
                          Open case
                        </Link>
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
        <h2 className="text-sm font-semibold text-ink">Compliance SLAs</h2>
        <dl className="mt-3 grid grid-cols-1 gap-3 text-sm md:grid-cols-4">
          <div>
            <dt className="text-xs uppercase tracking-wide text-ink/60">KYC review</dt>
            <dd className="mt-1 font-mono font-medium text-ink">24 hours</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-ink/60">AML alert triage</dt>
            <dd className="mt-1 font-mono font-medium text-ink">48 hours</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-ink/60">Sanctions hit</dt>
            <dd className="mt-1 font-mono font-medium text-ink">12 hours</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-ink/60">SAR filing</dt>
            <dd className="mt-1 font-mono font-medium text-ink">72 hours from confirmation</dd>
          </div>
        </dl>
        <p className="mt-3 text-xs text-ink/60">
          Every breach is tracked in the control evidence dashboard and surfaced to the Compliance Lead
          in the weekly review.
        </p>
      </Card>
    </div>
  );
}