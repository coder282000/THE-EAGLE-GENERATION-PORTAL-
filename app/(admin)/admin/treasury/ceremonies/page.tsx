'use client';

// ADM-153 — Cold Storage Operations and Key Ceremony Log
// Route: /admin/treasury/ceremonies

import { useMemo, useState } from 'react';
import { Card } from '@/components/card';
import {
  getCeremonies,
  canViewTreasury,
  CEREMONY_PURPOSE_LABELS,
  CEREMONY_OUTCOME_LABELS,
  type KeyCeremony,
  type CeremonyPurpose,
} from '@/lib/mock/treasury';

type Filter = 'ALL' | KeyCeremony['outcome'];

const OUTCOME_TONE: Record<KeyCeremony['outcome'], string> = {
  SCHEDULED: 'bg-sky/15 text-sky',
  COMPLETED: 'bg-emerald-100 text-emerald-800',
  ABORTED: 'bg-red-100 text-red-800',
};

function Kpi({ label, value, tone }: { label: string; value: string; tone?: 'clay' | 'emerald' }) {
  const cls =
    tone === 'emerald' ? 'text-emerald-700' : tone === 'clay' ? 'text-clay' : 'text-ink';
  return (
    <Card>
      <dl>
        <dt className="text-xs uppercase tracking-wide text-ink/60">{label}</dt>
        <dd className={`mt-1 text-2xl font-semibold ${cls}`}>{value}</dd>
      </dl>
    </Card>
  );
}

export default function CeremoniesPage() {
  const allowed = canViewTreasury();
  const ceremonies = useMemo(() => (allowed ? getCeremonies() : []), [allowed]);

  const [filter, setFilter] = useState<Filter>('ALL');
  const [purposeFilter, setPurposeFilter] = useState<'ALL' | CeremonyPurpose>('ALL');
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    let list = ceremonies;
    if (filter !== 'ALL') list = list.filter((c) => c.outcome === filter);
    if (purposeFilter !== 'ALL') list = list.filter((c) => c.purpose === purposeFilter);
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (c) =>
          c.reference.toLowerCase().includes(q) ||
          c.notes.toLowerCase().includes(q) ||
          c.participants.some((p) => p.toLowerCase().includes(q))
      );
    }
    return list;
  }, [ceremonies, filter, purposeFilter, query]);

  if (!allowed) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <Card>
          <h1 className="text-lg font-semibold text-ink">Permission denied</h1>
          <p className="mt-2 text-sm text-ink/70">You do not have access to the treasury.</p>
        </Card>
      </div>
    );
  }

  const scheduled = ceremonies.filter((c) => c.outcome === 'SCHEDULED').length;
  const completed = ceremonies.filter((c) => c.outcome === 'COMPLETED').length;
  const aborted = ceremonies.filter((c) => c.outcome === 'ABORTED').length;

  return (
    <div className="p-6">
      <header className="mb-6">
        <p className="text-xs uppercase tracking-wide text-ink/60">PNL-12 · Treasury and Custody</p>
        <h1 className="mt-1 text-2xl font-semibold text-ink">Cold Storage Operations and Key Ceremonies</h1>
        <p className="mt-1 text-sm text-ink/70">
          Every cold transfer, key rotation, recovery test and audit. Each is a documented procedure, not
          just a screen. Ceremony logs are append-only and immutable.
        </p>
      </header>

      <section aria-label="Ceremony counts" className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Kpi label="Total ceremonies" value={String(ceremonies.length)} />
        <Kpi label="Scheduled" value={String(scheduled)} tone={scheduled > 0 ? 'clay' : undefined} />
        <Kpi label="Completed" value={String(completed)} tone="emerald" />
        <Kpi label="Aborted" value={String(aborted)} />
      </section>

      <div role="note" className="mt-4 rounded-lg border border-ink/15 bg-paper p-3 text-sm text-ink/80">
        <strong className="font-medium">This screen records, it does not execute.</strong> Key ceremonies
        happen physically, with participants present and the procedure followed. The portal holds the
        audit record: who attended, when, what was done, and what the outcome was.
      </div>

      <Card className="mt-6">
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label htmlFor="kc-query" className="block text-xs font-medium text-ink/70">Search</label>
            <input
              id="kc-query"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Reference, participant, notes…"
              className="mt-1 w-64 rounded-md border border-ink/15 bg-paper px-3 py-2 text-sm text-ink focus:border-sky focus:outline-none focus:ring-2 focus:ring-sky/40"
            />
          </div>
          <div>
            <label htmlFor="kc-purpose" className="block text-xs font-medium text-ink/70">Purpose</label>
            <select
              id="kc-purpose"
              value={purposeFilter}
              onChange={(e) => setPurposeFilter(e.target.value as 'ALL' | CeremonyPurpose)}
              className="mt-1 rounded-md border border-ink/15 bg-paper px-3 py-2 text-sm text-ink focus:border-sky focus:outline-none focus:ring-2 focus:ring-sky/40"
            >
              <option value="ALL">All purposes</option>
              {(Object.keys(CEREMONY_PURPOSE_LABELS) as CeremonyPurpose[]).map((p) => (
                <option key={p} value={p}>{CEREMONY_PURPOSE_LABELS[p]}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="kc-outcome" className="block text-xs font-medium text-ink/70">Outcome</label>
            <select
              id="kc-outcome"
              value={filter}
              onChange={(e) => setFilter(e.target.value as Filter)}
              className="mt-1 rounded-md border border-ink/15 bg-paper px-3 py-2 text-sm text-ink focus:border-sky focus:outline-none focus:ring-2 focus:ring-sky/40"
            >
              <option value="ALL">All outcomes</option>
              <option value="SCHEDULED">Scheduled</option>
              <option value="COMPLETED">Completed</option>
              <option value="ABORTED">Aborted</option>
            </select>
          </div>
          <div className="ml-auto text-xs text-ink/60">
            Showing {filtered.length} of {ceremonies.length}
          </div>
        </div>
      </Card>

      <div className="mt-4 space-y-4">
        {filtered.length === 0 ? (
          <Card>
            <p className="text-center text-sm text-ink/60">No ceremonies match the current filters.</p>
          </Card>
        ) : (
          filtered.map((c) => (
            <Card key={c.id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-mono text-sm font-semibold text-ink">{c.reference}</h2>
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${OUTCOME_TONE[c.outcome]}`}>
                      {CEREMONY_OUTCOME_LABELS[c.outcome]}
                    </span>
                    <span className="text-xs text-ink/60">
                      {CEREMONY_PURPOSE_LABELS[c.purpose]}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-ink/60">
                    Scheduled {new Date(c.scheduledAt).toLocaleString('en-GB')}
                    {c.completedAt ? ` · Completed ${new Date(c.completedAt).toLocaleString('en-GB')}` : ''}
                  </p>
                </div>
              </div>

              <div className="mt-4">
                <h3 className="text-xs uppercase tracking-wide text-ink/60">Participants</h3>
                <ul className="mt-2 flex flex-wrap gap-2">
                  {c.participants.map((p) => (
                    <li
                      key={p}
                      className="rounded-full bg-sky/10 px-2 py-0.5 text-xs font-medium text-sky"
                    >
                      {p}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-4">
                <h3 className="text-xs uppercase tracking-wide text-ink/60">Notes</h3>
                <p className="mt-1 whitespace-pre-wrap text-sm text-ink">{c.notes}</p>
              </div>
            </Card>
          ))
        )}
      </div>

      <Card className="mt-6">
        <h2 className="text-sm font-semibold text-ink">Procedure reference</h2>
        <p className="mt-2 text-sm text-ink/70">
          Every ceremony follows the custody procedure documented in D2.6 Security Architecture:
          participants are pre-identified, the purpose is stated, the transaction is signed offline, the
          broadcast is performed by a different operator, and the outcome — success, partial, or abort — is
          recorded here. Key material never appears in this application; the ceremony log references only
          the resulting transaction and the participants.
        </p>
      </Card>
    </div>
  );
}