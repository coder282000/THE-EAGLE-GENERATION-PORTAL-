'use client';

// ADM-190 — Compliance Control Evidence Dashboard
// Route: /admin/compliance/controls

import { useMemo, useState } from 'react';
import { Card } from '@/components/card';
import {
  getControls,
  getControlCounts,
  canViewCompliance,
  CONTROL_STATUS_LABELS,
  type ControlStatus,
  type ControlEvidence,
} from '@/lib/mock/compliance';

type Filter = 'ALL' | ControlStatus;

const STATUS_TONE: Record<ControlStatus, string> = {
  EFFECTIVE: 'bg-emerald-100 text-emerald-800',
  NEEDS_ATTENTION: 'bg-clay/15 text-clay',
  FAILING: 'bg-red-100 text-red-800',
  NOT_TESTED: 'bg-ink/10 text-ink/70',
};

function Kpi({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: 'clay' | 'red' | 'emerald';
}) {
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

function ageDays(iso: string): number {
  return Math.round((Date.now() - new Date(iso).getTime()) / 86400000);
}

export default function ControlsPage() {
  const allowed = canViewCompliance();
  const controls = useMemo(() => (allowed ? getControls() : []), [allowed]);
  const counts = useMemo(() => getControlCounts(), []);

  const [filter, setFilter] = useState<Filter>('ALL');
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    let list = controls;
    if (filter !== 'ALL') list = list.filter((c) => c.status === filter);
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (c) =>
          c.code.toLowerCase().includes(q) ||
          c.name.toLowerCase().includes(q) ||
          c.owner.toLowerCase().includes(q)
      );
    }
    return list;
  }, [controls, filter, query]);

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
        <h1 className="mt-1 text-2xl font-semibold text-ink">Compliance Control Evidence</h1>
        <p className="mt-1 text-sm text-ink/70">
          Every regulatory obligation maps to a technical control, and every control has an owner, a last
          tested date, and a status. This is the dashboard an auditor reads first.
        </p>
      </header>

      {counts.failing > 0 ? (
        <div role="alert" className="mb-4 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-900">
          <strong className="font-medium">
            {counts.failing} control{counts.failing === 1 ? '' : 's'} failing.
          </strong>{' '}
          Failing controls require immediate remediation. Notify the Compliance Lead and the Tech Lead.
        </div>
      ) : null}

      <section aria-label="Control counts" className="grid grid-cols-2 gap-4 md:grid-cols-5">
        <Kpi label="Total controls" value={String(counts.total)} />
        <Kpi label="Effective" value={String(counts.effective)} tone="emerald" />
        <Kpi
          label="Needs attention"
          value={String(counts.needsAttention)}
          tone={counts.needsAttention > 0 ? 'clay' : undefined}
        />
        <Kpi label="Failing" value={String(counts.failing)} tone={counts.failing > 0 ? 'red' : undefined} />
        <Kpi
          label="Not tested"
          value={String(counts.notTested)}
          tone={counts.notTested > 0 ? 'clay' : undefined}
        />
      </section>

      <Card className="mt-6">
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label htmlFor="ctl-query" className="block text-xs font-medium text-ink/70">Search</label>
            <input
              id="ctl-query"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Code, name, owner…"
              className="mt-1 w-64 rounded-md border border-ink/15 bg-paper px-3 py-2 text-sm text-ink focus:border-sky focus:outline-none focus:ring-2 focus:ring-sky/40"
            />
          </div>
          <div>
            <label htmlFor="ctl-status" className="block text-xs font-medium text-ink/70">Status</label>
            <select
              id="ctl-status"
              value={filter}
              onChange={(e) => setFilter(e.target.value as Filter)}
              className="mt-1 rounded-md border border-ink/15 bg-paper px-3 py-2 text-sm text-ink focus:border-sky focus:outline-none focus:ring-2 focus:ring-sky/40"
            >
              <option value="ALL">All statuses</option>
              {(Object.keys(CONTROL_STATUS_LABELS) as ControlStatus[]).map((s) => (
                <option key={s} value={s}>{CONTROL_STATUS_LABELS[s]}</option>
              ))}
            </select>
          </div>
          <div className="ml-auto text-xs text-ink/60">
            Showing {filtered.length} of {controls.length}
          </div>
        </div>
      </Card>

      <div className="mt-4 space-y-4">
        {filtered.length === 0 ? (
          <Card>
            <p className="text-center text-sm text-ink/60">No controls match the current filters.</p>
          </Card>
        ) : (
          filtered.map((c: ControlEvidence) => {
            const daysSinceTest = ageDays(c.lastTestedAt);
            const daysToReview = Math.round(
              (new Date(c.nextReviewAt).getTime() - Date.now()) / 86400000
            );
            return (
              <Card key={c.id}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-mono text-sm font-semibold text-ink">{c.code}</h2>
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_TONE[c.status]}`}>
                        {CONTROL_STATUS_LABELS[c.status]}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-ink">{c.name}</p>
                    <p className="mt-1 text-xs text-ink/60">
                      Owner {c.owner} · {c.evidenceCount} evidence item
                      {c.evidenceCount === 1 ? '' : 's'} on file
                    </p>
                  </div>
                </div>

                <dl className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-3">
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-ink/60">Last tested</dt>
                    <dd className="mt-1 text-sm text-ink">
                      {new Date(c.lastTestedAt).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                      <span className="ml-2 text-xs text-ink/60">({daysSinceTest}d ago)</span>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-ink/60">Next review</dt>
                    <dd className="mt-1 text-sm text-ink">
                      {new Date(c.nextReviewAt).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                      <span className="ml-2 text-xs text-ink/60">in {daysToReview}d</span>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-ink/60">Evidence repository</dt>
                    <dd className="mt-1 text-sm">
                      <a href="#" className="text-sky hover:underline">
                        D8.1 — open evidence pack
                      </a>
                    </dd>
                  </div>
                </dl>

                {c.notes ? (
                  <div className="mt-3 rounded-lg border border-clay/30 bg-clay/5 p-3 text-sm text-ink">
                    {c.notes}
                  </div>
                ) : null}
              </Card>
            );
          })
        )}
      </div>

      <Card className="mt-6">
        <h2 className="text-sm font-semibold text-ink">How this maps to the regulator</h2>
        <p className="mt-2 text-sm text-ink/70">
          Every compliance obligation from the charter (RO-1 through RO-10) maps to at least one control on
          this dashboard, and every control maps to the technical implementation that satisfies it. When a
          regulator asks how the platform ensures a given behaviour, the answer starts here: control code,
          owner, last test, evidence pack, next review. This dashboard is the visible surface of the D8.1
          Compliance Evidence Repository and the D2.7 Compliance Control Matrix.
        </p>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-ink/70">
          <li>KYC and CDD controls are tested on every case review; sample testing quarterly.</li>
          <li>AML monitoring rule coverage is tested on every rule change and quarterly in full.</li>
          <li>Sanctions and PEP screening integrity is tested after every provider change and quarterly in full.</li>
          <li>SAR filing timeliness is tested on every filed SAR and quarterly in full.</li>
          <li>Append-only audit log integrity is verified nightly by automated test.</li>
          <li>Data protection controls (DPO appointment, DPIA currency) are reviewed annually.</li>
        </ul>
      </Card>
    </div>
  );
}