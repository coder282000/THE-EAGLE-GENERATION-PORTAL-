'use client';

// ADM-182 — AML Alert Queue
// Route: /admin/compliance/aml

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/card';
import {
  getAMLAlerts,
  getAMLQueueCounts,
  canViewCompliance,
  AML_STATUS_LABELS,
  AML_SEVERITY_LABELS,
  formatMinor,
  type AMLDisposition,
  type AMLAlertSeverity,
} from '@/lib/mock/compliance';

type StatusFilter = 'ALL' | AMLDisposition | 'OPEN';
type SeverityFilter = 'ALL' | AMLAlertSeverity;

const STATUS_TONE: Record<AMLDisposition, string> = {
  PENDING: 'bg-clay/15 text-clay',
  TRUE_POSITIVE: 'bg-red-100 text-red-800',
  FALSE_POSITIVE: 'bg-ink/10 text-ink/70',
  ESCALATED: 'bg-clay/15 text-clay',
  SAR_FILED: 'bg-sky/15 text-sky',
};

const SEVERITY_TONE: Record<AMLAlertSeverity, string> = {
  LOW: 'bg-ink/10 text-ink/70',
  MEDIUM: 'bg-clay/15 text-clay',
  HIGH: 'bg-red-100 text-red-800',
  CRITICAL: 'bg-red-200 text-red-900',
};

export default function AMLQueuePage() {
  const allowed = canViewCompliance();
  const alerts = useMemo(() => (allowed ? getAMLAlerts() : []), [allowed]);
  const counts = useMemo(() => getAMLQueueCounts(), []);

  const [statusFilter, setStatusFilter] = useState<StatusFilter>('OPEN');
  const [severityFilter, setSeverityFilter] = useState<SeverityFilter>('ALL');
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    let list = alerts;
    if (statusFilter === 'OPEN') {
      list = list.filter((a) => a.status === 'PENDING' || a.status === 'ESCALATED');
    } else if (statusFilter !== 'ALL') {
      list = list.filter((a) => a.status === statusFilter);
    }
    if (severityFilter !== 'ALL') list = list.filter((a) => a.severity === severityFilter);
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (a) =>
          a.reference.toLowerCase().includes(q) ||
          a.memberName.toLowerCase().includes(q) ||
          a.memberNumber.toLowerCase().includes(q) ||
          a.ruleName.toLowerCase().includes(q)
      );
    }
    return list;
  }, [alerts, statusFilter, severityFilter, query]);

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
      <nav aria-label="Breadcrumb" className="mb-3 text-xs text-ink/60">
        <Link href="/admin/compliance" className="hover:text-sky">Compliance</Link>
        <span className="mx-2">/</span>
        <span className="text-ink">AML alerts</span>
      </nav>

      <header className="mb-6">
        <p className="text-xs uppercase tracking-wide text-ink/60">PNL-15 · Compliance</p>
        <h1 className="mt-1 text-2xl font-semibold text-ink">AML Alert Queue</h1>
        <p className="mt-1 text-sm text-ink/70">
          Alerts raised by transaction monitoring. 48-hour SLA from raise to disposition. Critical alerts
          surface first.
        </p>
      </header>

      <section aria-label="Alert counts" className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card>
          <dl>
            <dt className="text-xs uppercase tracking-wide text-ink/60">Pending triage</dt>
            <dd className="mt-1 text-2xl font-semibold text-clay">{counts.pending}</dd>
          </dl>
        </Card>
        <Card>
          <dl>
            <dt className="text-xs uppercase tracking-wide text-ink/60">Critical severity</dt>
            <dd className={`mt-1 text-2xl font-semibold ${counts.critical > 0 ? 'text-red-700' : 'text-ink'}`}>
              {counts.critical}
            </dd>
          </dl>
        </Card>
        <Card>
          <dl>
            <dt className="text-xs uppercase tracking-wide text-ink/60">Escalated</dt>
            <dd className="mt-1 text-2xl font-semibold text-clay">{counts.escalated}</dd>
          </dl>
        </Card>
        <Card>
          <dl>
            <dt className="text-xs uppercase tracking-wide text-ink/60">SARs filed</dt>
            <dd className="mt-1 text-2xl font-semibold text-sky">{counts.sarFiled}</dd>
          </dl>
        </Card>
      </section>

      <Card className="mt-6">
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label htmlFor="aml-query" className="block text-xs font-medium text-ink/70">Search</label>
            <input
              id="aml-query"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Reference, member, rule…"
              className="mt-1 w-64 rounded-md border border-ink/15 bg-paper px-3 py-2 text-sm text-ink focus:border-sky focus:outline-none focus:ring-2 focus:ring-sky/40"
            />
          </div>
          <div>
            <label htmlFor="aml-status" className="block text-xs font-medium text-ink/70">Status</label>
            <select
              id="aml-status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              className="mt-1 rounded-md border border-ink/15 bg-paper px-3 py-2 text-sm text-ink focus:border-sky focus:outline-none focus:ring-2 focus:ring-sky/40"
            >
              <option value="OPEN">Open (pending + escalated)</option>
              <option value="ALL">All statuses</option>
              {(Object.keys(AML_STATUS_LABELS) as AMLDisposition[]).map((s) => (
                <option key={s} value={s}>{AML_STATUS_LABELS[s]}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="aml-severity" className="block text-xs font-medium text-ink/70">Severity</label>
            <select
              id="aml-severity"
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value as SeverityFilter)}
              className="mt-1 rounded-md border border-ink/15 bg-paper px-3 py-2 text-sm text-ink focus:border-sky focus:outline-none focus:ring-2 focus:ring-sky/40"
            >
              <option value="ALL">All severities</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>
          <div className="ml-auto text-xs text-ink/60">
            Showing {filtered.length} of {alerts.length}
          </div>
        </div>
      </Card>

      <Card className="mt-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <caption className="sr-only">AML alerts</caption>
            <thead className="border-b border-ink/10 text-xs uppercase tracking-wide text-ink/60">
              <tr>
                <th scope="col" className="py-2 pr-4">Reference</th>
                <th scope="col" className="py-2 pr-4">Member</th>
                <th scope="col" className="py-2 pr-4">Rule</th>
                <th scope="col" className="py-2 pr-4">Severity</th>
                <th scope="col" className="py-2 pr-4 text-right">Amount</th>
                <th scope="col" className="py-2 pr-4">Status</th>
                <th scope="col" className="py-2 pr-4">Raised</th>
                <th scope="col" className="py-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-sm text-ink/60">
                    No alerts match the current filters.
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
                    <td className="py-2 pr-4">
                      <div className="text-ink">{a.ruleName}</div>
                      <div className="font-mono text-xs text-ink/60">{a.ruleCode}</div>
                    </td>
                    <td className="py-2 pr-4">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${SEVERITY_TONE[a.severity]}`}>
                        {AML_SEVERITY_LABELS[a.severity]}
                      </span>
                    </td>
                    <td className="py-2 pr-4 text-right font-mono text-xs">
                      {formatMinor(a.amountMinor, a.currency)}
                    </td>
                    <td className="py-2 pr-4">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_TONE[a.status]}`}>
                        {AML_STATUS_LABELS[a.status]}
                      </span>
                    </td>
                    <td className="py-2 pr-4 text-xs text-ink/60">
                      {new Date(a.raisedAt).toLocaleString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-2 text-right">
                      <Link
                        href={`/admin/compliance/aml/${a.id}`}
                        className="text-xs font-medium text-sky hover:underline"
                      >
                        Investigate
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
        <h2 className="text-sm font-semibold text-ink">About this queue</h2>
        <p className="mt-2 text-sm text-ink/70">
          Alerts are raised automatically by the monitoring rules on ADM-186. Every alert must be
          dispositioned with a reason: TRUE_POSITIVE (file SAR), FALSE_POSITIVE (dismiss with reason),
          ESCALATED (to Compliance Lead for EDD). Alerts are never deleted — a false positive stays in the
          log as a pattern signal.
        </p>
      </Card>
    </div>
  );
}