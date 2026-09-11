'use client';

// ADM-130 — CRB Submission and Enquiry Log
// Route: /admin/credit/crb

import { useMemo, useState } from 'react';
import { Card } from '@/components/card';
import {
  getCRBSubmissions,
  getCRBEnquiries,
  getCRBCounts,
  canViewCredit,
  CRB_STATUS_LABELS,
  formatMinor,
  type CRBSubmissionStatus,
} from '@/lib/mock/credit';

type Tab = 'SUBMISSIONS' | 'ENQUIRIES';
type Filter = 'ALL' | CRBSubmissionStatus;

const STATUS_TONE: Record<CRBSubmissionStatus, string> = {
  PENDING: 'bg-clay/15 text-clay',
  SUBMITTED: 'bg-sky/15 text-sky',
  ACKNOWLEDGED: 'bg-emerald-100 text-emerald-800',
  FAILED: 'bg-red-100 text-red-800',
};

function Kpi({ label, value, tone }: { label: string; value: string; tone?: 'clay' | 'red' | 'emerald' }) {
  const cls =
    tone === 'red' ? 'text-red-700' : tone === 'clay' ? 'text-clay' : tone === 'emerald' ? 'text-emerald-700' : 'text-ink';
  return (
    <Card>
      <dl>
        <dt className="text-xs uppercase tracking-wide text-ink/60">{label}</dt>
        <dd className={`mt-1 text-2xl font-semibold ${cls}`}>{value}</dd>
      </dl>
    </Card>
  );
}

export default function CRBPage() {
  const allowed = canViewCredit();
  const submissions = useMemo(() => (allowed ? getCRBSubmissions() : []), [allowed]);
  const enquiries = useMemo(() => (allowed ? getCRBEnquiries() : []), [allowed]);
  const counts = useMemo(() => getCRBCounts(), []);

  const [tab, setTab] = useState<Tab>('SUBMISSIONS');
  const [filter, setFilter] = useState<Filter>('ALL');
  const [query, setQuery] = useState('');

  const filteredSubs = useMemo(() => {
    let list = submissions;
    if (filter !== 'ALL') list = list.filter((s) => s.status === filter);
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (s) =>
          s.reference.toLowerCase().includes(q) ||
          s.loanReference.toLowerCase().includes(q) ||
          s.memberName.toLowerCase().includes(q) ||
          s.memberNumber.toLowerCase().includes(q)
      );
    }
    return list;
  }, [submissions, filter, query]);

  const filteredEnq = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return enquiries;
    return enquiries.filter(
      (e) =>
        e.reference.toLowerCase().includes(q) ||
        e.memberName.toLowerCase().includes(q) ||
        e.memberNumber.toLowerCase().includes(q) ||
        e.purpose.toLowerCase().includes(q)
    );
  }, [enquiries, query]);

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
      <header className="mb-6">
        <p className="text-xs uppercase tracking-wide text-ink/60">PNL-10 · Credit</p>
        <h1 className="mt-1 text-2xl font-semibold text-ink">CRB Submission and Enquiry Log</h1>
        <p className="mt-1 text-sm text-ink/70">
          Every submission to the Credit Reference Bureau and every enquiry the platform makes on a member.
          Submissions are append-only — a correction is a new submission, never an edit.
        </p>
      </header>

      <section aria-label="CRB counts" className="grid grid-cols-2 gap-4 md:grid-cols-5">
        <Kpi label="Total submissions" value={String(counts.submissions)} />
        <Kpi label="Acknowledged" value={String(counts.submitted)} tone="emerald" />
        <Kpi label="Pending" value={String(counts.pending)} tone={counts.pending > 0 ? 'clay' : undefined} />
        <Kpi label="Failed" value={String(counts.failed)} tone={counts.failed > 0 ? 'red' : undefined} />
        <Kpi label="Total enquiries" value={String(counts.enquiries)} />
      </section>

      <Card className="mt-6">
        <div className="flex flex-wrap items-end gap-3">
          <div role="tablist" aria-label="View" className="flex gap-1 rounded-md border border-ink/10 p-1">
            {(['SUBMISSIONS', 'ENQUIRIES'] as Tab[]).map((t) => (
              <button
                key={t}
                role="tab"
                aria-selected={tab === t}
                type="button"
                onClick={() => setTab(t)}
                className={`rounded px-3 py-1.5 text-xs font-medium ${
                  tab === t ? 'bg-sky/15 text-sky' : 'text-ink/70 hover:bg-ink/5'
                }`}
              >
                {t === 'SUBMISSIONS' ? 'Submissions' : 'Enquiries'}
              </button>
            ))}
          </div>
          <div>
            <label htmlFor="crb-query" className="block text-xs font-medium text-ink/70">Search</label>
            <input
              id="crb-query"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Reference, member, loan…"
              className="mt-1 w-64 rounded-md border border-ink/15 bg-paper px-3 py-2 text-sm text-ink focus:border-sky focus:outline-none focus:ring-2 focus:ring-sky/40"
            />
          </div>
          {tab === 'SUBMISSIONS' ? (
            <div>
              <label htmlFor="crb-status" className="block text-xs font-medium text-ink/70">Status</label>
              <select
                id="crb-status"
                value={filter}
                onChange={(e) => setFilter(e.target.value as Filter)}
                className="mt-1 rounded-md border border-ink/15 bg-paper px-3 py-2 text-sm text-ink focus:border-sky focus:outline-none focus:ring-2 focus:ring-sky/40"
              >
                <option value="ALL">All statuses</option>
                {(Object.keys(CRB_STATUS_LABELS) as CRBSubmissionStatus[]).map((s) => (
                  <option key={s} value={s}>{CRB_STATUS_LABELS[s]}</option>
                ))}
              </select>
            </div>
          ) : null}
        </div>
      </Card>

      <Card className="mt-4">
        {tab === 'SUBMISSIONS' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <caption className="sr-only">CRB submissions</caption>
              <thead className="border-b border-ink/10 text-xs uppercase tracking-wide text-ink/60">
                <tr>
                  <th scope="col" className="py-2 pr-4">Reference</th>
                  <th scope="col" className="py-2 pr-4">Loan</th>
                  <th scope="col" className="py-2 pr-4">Member</th>
                  <th scope="col" className="py-2 pr-4">Event</th>
                  <th scope="col" className="py-2 pr-4">Status</th>
                  <th scope="col" className="py-2 pr-4">Submitted</th>
                  <th scope="col" className="py-2 pr-4">Acknowledged</th>
                  <th scope="col" className="py-2 pr-4">CRB reference</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubs.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-sm text-ink/60">
                      No submissions match the current filters.
                    </td>
                  </tr>
                ) : (
                  filteredSubs.map((s) => (
                    <tr key={s.id} className="border-b border-ink/5 hover:bg-paper">
                      <td className="py-2 pr-4 font-mono text-xs text-ink">{s.reference}</td>
                      <td className="py-2 pr-4 font-mono text-xs">{s.loanReference}</td>
                      <td className="py-2 pr-4">
                        <div className="text-ink">{s.memberName}</div>
                        <div className="text-xs text-ink/60">{s.memberNumber}</div>
                      </td>
                      <td className="py-2 pr-4 text-xs">{s.eventType}</td>
                      <td className="py-2 pr-4">
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_TONE[s.status]}`}>
                          {CRB_STATUS_LABELS[s.status]}
                        </span>
                      </td>
                      <td className="py-2 pr-4 text-xs text-ink/70">
                        {new Date(s.submittedAt).toLocaleDateString('en-GB')}
                      </td>
                      <td className="py-2 pr-4 text-xs text-ink/70">
                        {s.acknowledgedAt
                          ? new Date(s.acknowledgedAt).toLocaleDateString('en-GB')
                          : '—'}
                      </td>
                      <td className="py-2 pr-4 font-mono text-xs text-ink/70">
                        {s.crbReference ?? '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <caption className="sr-only">CRB enquiries</caption>
              <thead className="border-b border-ink/10 text-xs uppercase tracking-wide text-ink/60">
                <tr>
                  <th scope="col" className="py-2 pr-4">Reference</th>
                  <th scope="col" className="py-2 pr-4">Member</th>
                  <th scope="col" className="py-2 pr-4">Purpose</th>
                  <th scope="col" className="py-2 pr-4">Requested by</th>
                  <th scope="col" className="py-2 pr-4">Requested</th>
                  <th scope="col" className="py-2 pr-4">Status</th>
                  <th scope="col" className="py-2 pr-4">Result</th>
                </tr>
              </thead>
              <tbody>
                {filteredEnq.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-sm text-ink/60">
                      No enquiries match the current filters.
                    </td>
                  </tr>
                ) : (
                  filteredEnq.map((e) => (
                    <tr key={e.id} className="border-b border-ink/5 hover:bg-paper">
                      <td className="py-2 pr-4 font-mono text-xs text-ink">{e.reference}</td>
                      <td className="py-2 pr-4">
                        <div className="text-ink">{e.memberName}</div>
                        <div className="text-xs text-ink/60">{e.memberNumber}</div>
                      </td>
                      <td className="py-2 pr-4 text-xs">{e.purpose.replace('_', ' ')}</td>
                      <td className="py-2 pr-4 text-xs text-ink/70">{e.requestedBy}</td>
                      <td className="py-2 pr-4 text-xs text-ink/70">
                        {new Date(e.requestedAt).toLocaleDateString('en-GB')}
                      </td>
                      <td className="py-2 pr-4">
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                            e.status === 'COMPLETED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : e.status === 'FAILED'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-clay/15 text-clay'
                          }`}
                        >
                          {e.status}
                        </span>
                      </td>
                      <td className="py-2 pr-4 text-xs text-ink/70">{e.resultSummary ?? '—'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card className="mt-6">
        <h2 className="text-sm font-semibold text-ink">Why submissions are append-only</h2>
        <p className="mt-2 text-sm text-ink/70">
          A CRB submission is a legal record of a credit event. If it needs correction, the correction is
          a new submission with a reference to the original — never an edit. This is the same discipline
          the ledger and audit log follow: append-only, corrections as reversing entries. In this view,
          every row is immutable after submission.
        </p>
      </Card>
    </div>
  );
}