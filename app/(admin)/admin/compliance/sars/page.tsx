'use client';

// ADM-185 — SAR Preparation and Filing Log
// Route: /admin/compliance/sars

import { useMemo, useState } from 'react';
import { Card } from '@/components/card';
import {
  getSARs,
  getSARCounts,
  canViewCompliance,
  canApproveSARs,
  canApproveSAR,
  SAR_STATUS_LABELS,
  formatMinor,
  type SARStatus,
} from '@/lib/mock/compliance';

type Filter = 'ALL' | SARStatus;

const STATUS_TONE: Record<SARStatus, string> = {
  DRAFT: 'bg-ink/10 text-ink/70',
  PENDING_APPROVAL: 'bg-clay/15 text-clay',
  FILED: 'bg-emerald-100 text-emerald-800',
  REJECTED: 'bg-red-100 text-red-800',
  WITHDRAWN: 'bg-ink/10 text-ink/70',
};

function Kpi({ label, value, tone }: { label: string; value: string; tone?: 'clay' | 'red' | 'emerald' }) {
  const cls =
    tone === 'red'
      ? 'text-red-700'
      : tone === 'clay'
      ? 'text-clay'
      : tone === 'emerald'
      ? 'text-emerald-700'
      : 'text-ink';
  return (
    <Card>
      <dl>
        <dt className="text-xs uppercase tracking-wide text-ink/60">{label}</dt>
        <dd className={`mt-1 text-2xl font-semibold ${cls}`}>{value}</dd>
      </dl>
    </Card>
  );
}

export default function SARsPage() {
  const allowed = canViewCompliance();
  const canApprove = canApproveSARs();

  const sars = useMemo(() => (allowed ? getSARs() : []), [allowed]);
  const counts = useMemo(() => getSARCounts(), []);

  const [filter, setFilter] = useState<Filter>('ALL');
  const [query, setQuery] = useState('');
  const [openId, setOpenId] = useState<string | null>(null);
  const [approveError, setApproveError] = useState<string | null>(null);
  const [actioned, setActioned] = useState<Record<string, 'APPROVED' | 'REJECTED'>>({});

  const filtered = useMemo(() => {
    let list = sars;
    if (filter !== 'ALL') list = list.filter((s) => s.status === filter);
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (s) =>
          s.reference.toLowerCase().includes(q) ||
          s.subjectName.toLowerCase().includes(q) ||
          s.subjectMemberNumber.toLowerCase().includes(q)
      );
    }
    return list;
  }, [sars, filter, query]);

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

  function tryApprove(sarId: string, draftedBy: string) {
    if (!canApproveSAR({ draftedBy })) {
      setApproveError(
        'Four-eyes: SARs cannot be approved by the analyst who drafted them, and only the Compliance Lead can approve.'
      );
      return;
    }
    setApproveError(null);
    setActioned((a) => ({ ...a, [sarId]: 'APPROVED' }));
  }

  return (
    <div className="p-6">
      <header className="mb-6">
        <p className="text-xs uppercase tracking-wide text-ink/60">PNL-15 · Compliance</p>
        <h1 className="mt-1 text-2xl font-semibold text-ink">SAR Preparation and Filing Log</h1>
        <p className="mt-1 text-sm text-ink/70">
          Draft, approve, and file suspicious activity reports. Every SAR is drafted by an analyst and
          approved by the Compliance Lead — never the same person.
        </p>
      </header>

      <section aria-label="SAR counts" className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Kpi label="Total SARs" value={String(counts.total)} />
        <Kpi label="Pending approval" value={String(counts.pendingApproval)} tone={counts.pendingApproval > 0 ? 'clay' : undefined} />
        <Kpi label="Filed" value={String(counts.filed)} tone="emerald" />
        <Kpi label="Withdrawn" value={String(counts.withdrawn)} />
      </section>

      {approveError ? (
        <div role="alert" className="mt-4 rounded-lg border border-clay/40 bg-clay/5 p-3 text-sm text-ink">
          {approveError}
        </div>
      ) : null}

      <Card className="mt-6">
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label htmlFor="sar-query" className="block text-xs font-medium text-ink/70">Search</label>
            <input
              id="sar-query"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Reference, subject…"
              className="mt-1 w-64 rounded-md border border-ink/15 bg-paper px-3 py-2 text-sm text-ink focus:border-sky focus:outline-none focus:ring-2 focus:ring-sky/40"
            />
          </div>
          <div>
            <label htmlFor="sar-status" className="block text-xs font-medium text-ink/70">Status</label>
            <select
              id="sar-status"
              value={filter}
              onChange={(e) => setFilter(e.target.value as Filter)}
              className="mt-1 rounded-md border border-ink/15 bg-paper px-3 py-2 text-sm text-ink focus:border-sky focus:outline-none focus:ring-2 focus:ring-sky/40"
            >
              <option value="ALL">All statuses</option>
              {(Object.keys(SAR_STATUS_LABELS) as SARStatus[]).map((s) => (
                <option key={s} value={s}>{SAR_STATUS_LABELS[s]}</option>
              ))}
            </select>
          </div>
          <div className="ml-auto text-xs text-ink/60">
            Showing {filtered.length} of {sars.length}
          </div>
        </div>
      </Card>

      <div className="mt-4 space-y-4">
        {filtered.length === 0 ? (
          <Card>
            <p className="text-center text-sm text-ink/60">No SARs match the current filters.</p>
          </Card>
        ) : (
          filtered.map((s) => {
            const expanded = openId === s.id;
            const action = actioned[s.id];
            const isPending = s.status === 'PENDING_APPROVAL';
            return (
              <Card key={s.id}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-mono text-sm font-semibold text-ink">{s.reference}</h2>
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_TONE[s.status]}`}>
                        {SAR_STATUS_LABELS[s.status]}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-ink">
                      {s.subjectName} · {s.subjectMemberNumber}
                    </p>
                    <p className="mt-1 text-xs text-ink/60">
                      Drafted by {s.draftedBy} on {new Date(s.draftedAt).toLocaleString('en-GB')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs uppercase tracking-wide text-ink/60">Amount</p>
                    <p className="font-mono text-lg font-semibold text-ink">
                      {formatMinor(s.amountMinor, s.currency)}
                    </p>
                  </div>
                </div>

                <div className="mt-4">
                  <button
                    type="button"
                    onClick={() => setOpenId(expanded ? null : s.id)}
                    className="text-xs font-medium text-sky hover:underline"
                  >
                    {expanded ? 'Hide narrative' : 'Show narrative'}
                  </button>
                  {expanded ? (
                    <div className="mt-3 rounded-lg border border-ink/10 bg-paper p-3">
                      <p className="whitespace-pre-wrap text-sm text-ink">{s.narrative}</p>
                    </div>
                  ) : null}
                </div>

                {s.filingReference ? (
                  <p className="mt-3 text-xs text-emerald-700">
                    Filed with {s.regulator} on{' '}
                    {s.filedAt ? new Date(s.filedAt).toLocaleDateString('en-GB') : '—'} · Ref{' '}
                    <span className="font-mono">{s.filingReference}</span>
                  </p>
                ) : null}

                {action ? (
                  <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
                    SAR marked {action === 'APPROVED' ? 'approved for filing' : 'rejected'} in this session.
                    In production the filing is submitted to {s.regulator} and the reference recorded here.
                  </div>
                ) : isPending ? (
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => tryApprove(s.id, s.draftedBy)}
                      disabled={!canApprove}
                      className={`rounded-md px-3 py-1.5 text-sm font-medium ${
                        canApprove
                          ? 'bg-sky text-white hover:bg-sky/90'
                          : 'cursor-not-allowed bg-ink/10 text-ink/50'
                      }`}
                    >
                      Approve for filing
                    </button>
                    <button
                      type="button"
                      onClick={() => setActioned((a) => ({ ...a, [s.id]: 'REJECTED' }))}
                      disabled={!canApprove}
                      className={`rounded-md border px-3 py-1.5 text-sm font-medium ${
                        canApprove
                          ? 'border-red-300 text-red-700 hover:bg-red-50'
                          : 'cursor-not-allowed border-ink/10 text-ink/30'
                      }`}
                    >
                      Reject draft
                    </button>
                    {!canApprove ? (
                      <p className="w-full text-xs text-clay">
                        Only the Compliance Lead can approve, and never their own draft.
                      </p>
                    ) : null}
                  </div>
                ) : null}
              </Card>
            );
          })
        )}
      </div>

      <Card className="mt-6">
        <h2 className="text-sm font-semibold text-ink">Filing discipline</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-ink/70">
          <li>SARs are drafted only after an alert is dispositioned TRUE_POSITIVE.</li>
          <li>Drafting and approval are separated — a single analyst cannot file alone.</li>
          <li>The narrative is the file. It is never disclosed to the member, and never indexed in search.</li>
          <li>Filed SARs are retained for 7 years. Withdrawal requires a documented reason.</li>
          <li>Regulator is typically the FRC (Financial Reporting Centre) in Kenya.</li>
        </ul>
      </Card>
    </div>
  );
}