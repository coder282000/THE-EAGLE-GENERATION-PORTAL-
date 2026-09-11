'use client';

// ADM-184 — Sanctions and PEP Screening Results
// Route: /admin/compliance/sanctions

import { useMemo, useState } from 'react';
import { Card } from '@/components/card';
import {
  getSanctionsHits,
  getSanctionsCounts,
  canViewCompliance,
  SANCTIONS_STATUS_LABELS,
  type SanctionsHitStatus,
} from '@/lib/mock/compliance';

type Filter = 'ALL' | SanctionsHitStatus | 'OPEN';

const STATUS_TONE: Record<SanctionsHitStatus, string> = {
  PENDING: 'bg-clay/15 text-clay',
  CONFIRMED_TRUE: 'bg-red-100 text-red-800',
  CONFIRMED_FALSE: 'bg-ink/10 text-ink/70',
  ESCALATED: 'bg-red-100 text-red-800',
};

function scoreTone(score: number): string {
  if (score >= 85) return 'text-red-700 font-medium';
  if (score >= 70) return 'text-clay';
  return 'text-ink/70';
}

export default function SanctionsPage() {
  const allowed = canViewCompliance();
  const hits = useMemo(() => (allowed ? getSanctionsHits() : []), [allowed]);
  const counts = useMemo(() => getSanctionsCounts(), []);

  const [filter, setFilter] = useState<Filter>('OPEN');
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    let list = hits;
    if (filter === 'OPEN') {
      list = list.filter((h) => h.status === 'PENDING' || h.status === 'ESCALATED');
    } else if (filter !== 'ALL') {
      list = list.filter((h) => h.status === filter);
    }
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (h) =>
          h.reference.toLowerCase().includes(q) ||
          h.subjectName.toLowerCase().includes(q) ||
          h.subjectMemberNumber.toLowerCase().includes(q) ||
          h.list.toLowerCase().includes(q)
      );
    }
    return list;
  }, [hits, filter, query]);

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
      <header className="mb-6">
        <p className="text-xs uppercase tracking-wide text-ink/60">PNL-15 · Compliance</p>
        <h1 className="mt-1 text-2xl font-semibold text-ink">Sanctions and PEP Screening</h1>
        <p className="mt-1 text-sm text-ink/70">
          Matches against OFAC, UN, EU, and PEP lists. 12-hour SLA from raise to disposition.
        </p>
      </header>

      <section aria-label="Sanctions counts" className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card>
          <dl>
            <dt className="text-xs uppercase tracking-wide text-ink/60">Total hits</dt>
            <dd className="mt-1 text-2xl font-semibold text-ink">{counts.total}</dd>
          </dl>
        </Card>
        <Card>
          <dl>
            <dt className="text-xs uppercase tracking-wide text-ink/60">Pending</dt>
            <dd className={`mt-1 text-2xl font-semibold ${counts.pending > 0 ? 'text-clay' : 'text-emerald-700'}`}>
              {counts.pending}
            </dd>
          </dl>
        </Card>
        <Card>
          <dl>
            <dt className="text-xs uppercase tracking-wide text-ink/60">Confirmed false</dt>
            <dd className="mt-1 text-2xl font-semibold text-emerald-700">{counts.confirmedFalse}</dd>
          </dl>
        </Card>
        <Card>
          <dl>
            <dt className="text-xs uppercase tracking-wide text-ink/60">Confirmed true / escalated</dt>
            <dd className={`mt-1 text-2xl font-semibold ${counts.confirmedTrue + counts.escalated > 0 ? 'text-red-700' : 'text-ink'}`}>
              {counts.confirmedTrue + counts.escalated}
            </dd>
          </dl>
        </Card>
      </section>

      <Card className="mt-6">
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label htmlFor="san-query" className="block text-xs font-medium text-ink/70">Search</label>
            <input
              id="san-query"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Reference, subject, list…"
              className="mt-1 w-64 rounded-md border border-ink/15 bg-paper px-3 py-2 text-sm text-ink focus:border-sky focus:outline-none focus:ring-2 focus:ring-sky/40"
            />
          </div>
          <div>
            <label htmlFor="san-status" className="block text-xs font-medium text-ink/70">Status</label>
            <select
              id="san-status"
              value={filter}
              onChange={(e) => setFilter(e.target.value as Filter)}
              className="mt-1 rounded-md border border-ink/15 bg-paper px-3 py-2 text-sm text-ink focus:border-sky focus:outline-none focus:ring-2 focus:ring-sky/40"
            >
              <option value="OPEN">Open (pending + escalated)</option>
              <option value="ALL">All statuses</option>
              {(Object.keys(SANCTIONS_STATUS_LABELS) as SanctionsHitStatus[]).map((s) => (
                <option key={s} value={s}>{SANCTIONS_STATUS_LABELS[s]}</option>
              ))}
            </select>
          </div>
          <div className="ml-auto text-xs text-ink/60">
            Showing {filtered.length} of {hits.length}
          </div>
        </div>
      </Card>

      <Card className="mt-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <caption className="sr-only">Sanctions and PEP hits</caption>
            <thead className="border-b border-ink/10 text-xs uppercase tracking-wide text-ink/60">
              <tr>
                <th scope="col" className="py-2 pr-4">Reference</th>
                <th scope="col" className="py-2 pr-4">Subject</th>
                <th scope="col" className="py-2 pr-4">List</th>
                <th scope="col" className="py-2 pr-4 text-right">Score</th>
                <th scope="col" className="py-2 pr-4">Status</th>
                <th scope="col" className="py-2 pr-4">Raised</th>
                <th scope="col" className="py-2 pr-4">Decided by</th>
                <th scope="col" className="py-2 pr-4">Reason</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-sm text-ink/60">
                    No hits match the current filters.
                  </td>
                </tr>
              ) : (
                filtered.map((h) => (
                  <tr key={h.id} className="border-b border-ink/5 hover:bg-paper">
                    <td className="py-2 pr-4 font-mono text-xs text-ink">{h.reference}</td>
                    <td className="py-2 pr-4">
                      <div className="text-ink">{h.subjectName}</div>
                      <div className="text-xs text-ink/60">{h.subjectMemberNumber}</div>
                    </td>
                    <td className="py-2 pr-4 text-xs">{h.list}</td>
                    <td className={`py-2 pr-4 text-right font-mono text-xs ${scoreTone(h.matchScore)}`}>
                      {h.matchScore}
                    </td>
                    <td className="py-2 pr-4">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_TONE[h.status]}`}>
                        {SANCTIONS_STATUS_LABELS[h.status]}
                      </span>
                    </td>
                    <td className="py-2 pr-4 text-xs text-ink/60">
                      {new Date(h.raisedAt).toLocaleString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-2 pr-4 text-xs text-ink/70">{h.decidedBy ?? '—'}</td>
                    <td className="py-2 pr-4 text-xs text-ink/70">{h.reason ?? '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="mt-6">
        <h2 className="text-sm font-semibold text-ink">Lists screened against</h2>
        <ul className="mt-3 grid grid-cols-1 gap-2 text-sm md:grid-cols-2">
          <li className="rounded border border-ink/10 p-2">
            <span className="font-medium text-ink">OFAC SDN</span> — US Treasury sanctions
          </li>
          <li className="rounded border border-ink/10 p-2">
            <span className="font-medium text-ink">UN Consolidated</span> — UN Security Council sanctions
          </li>
          <li className="rounded border border-ink/10 p-2">
            <span className="font-medium text-ink">EU Consolidated</span> — EU sanctions list
          </li>
          <li className="rounded border border-ink/10 p-2">
            <span className="font-medium text-ink">PEP</span> — politically exposed persons and close
            associates
          </li>
        </ul>
        <p className="mt-3 text-xs text-ink/60">
          A 12-hour SLA applies to every hit. Confirmed true hits require immediate escalation to the
          Compliance Lead and, if the subject is transacting, a kill-switch review on PNL-12.
        </p>
      </Card>
    </div>
  );
}