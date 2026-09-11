'use client';

// ADM-187 — Risk Scoring Configuration and Member Risk Register
// Route: /admin/compliance/risk

import { useMemo, useState } from 'react';
import { Card } from '@/components/card';
import {
  getMemberRisk,
  canViewCompliance,
  KYC_TIER_LABELS,
  type MemberRiskProfile,
} from '@/lib/mock/compliance';

type Filter = 'ALL' | 'LOW' | 'MEDIUM' | 'HIGH';

const BAND_TONE: Record<MemberRiskProfile['band'], string> = {
  LOW: 'bg-emerald-100 text-emerald-800',
  MEDIUM: 'bg-clay/15 text-clay',
  HIGH: 'bg-red-100 text-red-800',
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

export default function RiskPage() {
  const allowed = canViewCompliance();
  const members = useMemo(() => (allowed ? getMemberRisk() : []), [allowed]);

  const [filter, setFilter] = useState<Filter>('ALL');
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    let list = members;
    if (filter !== 'ALL') list = list.filter((m) => m.band === filter);
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (m) =>
          m.memberName.toLowerCase().includes(q) ||
          m.memberNumber.toLowerCase().includes(q) ||
          m.flags.some((f) => f.toLowerCase().includes(q))
      );
    }
    return list;
  }, [members, filter, query]);

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

  const low = members.filter((m) => m.band === 'LOW').length;
  const medium = members.filter((m) => m.band === 'MEDIUM').length;
  const high = members.filter((m) => m.band === 'HIGH').length;

  return (
    <div className="p-6">
      <header className="mb-6">
        <p className="text-xs uppercase tracking-wide text-ink/60">PNL-15 · Compliance</p>
        <h1 className="mt-1 text-2xl font-semibold text-ink">Risk Scoring and Member Risk Register</h1>
        <p className="mt-1 text-sm text-ink/70">
          Every member carries a risk score built from KYC tier, jurisdiction, transaction velocity, and
          sanctions history. Scores are re-evaluated nightly.
        </p>
      </header>

      <section aria-label="Risk bands" className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Kpi label="Members on register" value={String(members.length)} />
        <Kpi label="Low risk" value={String(low)} tone="emerald" />
        <Kpi label="Medium risk" value={String(medium)} tone={medium > 0 ? 'clay' : undefined} />
        <Kpi label="High risk" value={String(high)} tone={high > 0 ? 'red' : undefined} />
      </section>

      <Card className="mt-6">
        <h2 className="text-sm font-semibold text-ink">Scoring weights</h2>
        <p className="mt-2 text-sm text-ink/70">
          In production, weights are configurable by the Compliance Lead. Each factor contributes to a
          0–100 score.
        </p>
        <dl className="mt-4 grid grid-cols-1 gap-4 text-sm md:grid-cols-4">
          <div className="rounded-lg border border-ink/10 p-3">
            <dt className="text-xs uppercase tracking-wide text-ink/60">KYC tier</dt>
            <dd className="mt-1 font-mono text-ink">30% weight</dd>
            <dd className="mt-1 text-xs text-ink/60">Lower tier, higher score</dd>
          </div>
          <div className="rounded-lg border border-ink/10 p-3">
            <dt className="text-xs uppercase tracking-wide text-ink/60">Jurisdiction</dt>
            <dd className="mt-1 font-mono text-ink">20% weight</dd>
            <dd className="mt-1 text-xs text-ink/60">FATF grey/grey-listed countries score higher</dd>
          </div>
          <div className="rounded-lg border border-ink/10 p-3">
            <dt className="text-xs uppercase tracking-wide text-ink/60">Velocity</dt>
            <dd className="mt-1 font-mono text-ink">30% weight</dd>
            <dd className="mt-1 text-xs text-ink/60">Recent transaction count and value</dd>
          </div>
          <div className="rounded-lg border border-ink/10 p-3">
            <dt className="text-xs uppercase tracking-wide text-ink/60">Sanctions history</dt>
            <dd className="mt-1 font-mono text-ink">20% weight</dd>
            <dd className="mt-1 text-xs text-ink/60">Confirmed true hits carry the maximum</dd>
          </div>
        </dl>
      </Card>

      <Card className="mt-6">
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label htmlFor="risk-query" className="block text-xs font-medium text-ink/70">Search</label>
            <input
              id="risk-query"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Member, number, flag…"
              className="mt-1 w-64 rounded-md border border-ink/15 bg-paper px-3 py-2 text-sm text-ink focus:border-sky focus:outline-none focus:ring-2 focus:ring-sky/40"
            />
          </div>
          <div>
            <label htmlFor="risk-band" className="block text-xs font-medium text-ink/70">Band</label>
            <select
              id="risk-band"
              value={filter}
              onChange={(e) => setFilter(e.target.value as Filter)}
              className="mt-1 rounded-md border border-ink/15 bg-paper px-3 py-2 text-sm text-ink focus:border-sky focus:outline-none focus:ring-2 focus:ring-sky/40"
            >
              <option value="ALL">All bands</option>
              <option value="HIGH">High risk</option>
              <option value="MEDIUM">Medium risk</option>
              <option value="LOW">Low risk</option>
            </select>
          </div>
          <div className="ml-auto text-xs text-ink/60">
            Showing {filtered.length} of {members.length}
          </div>
        </div>
      </Card>

      <Card className="mt-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <caption className="sr-only">Member risk register</caption>
            <thead className="border-b border-ink/10 text-xs uppercase tracking-wide text-ink/60">
              <tr>
                <th scope="col" className="py-2 pr-4">Member</th>
                <th scope="col" className="py-2 pr-4">KYC tier</th>
                <th scope="col" className="py-2 pr-4">Jurisdiction</th>
                <th scope="col" className="py-2 pr-4 text-right">Score</th>
                <th scope="col" className="py-2 pr-4">Band</th>
                <th scope="col" className="py-2 pr-4">Flags</th>
                <th scope="col" className="py-2 pr-4">Last reviewed</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-sm text-ink/60">
                    No members match the current filters.
                  </td>
                </tr>
              ) : (
                filtered.map((m) => (
                  <tr key={m.id} className="border-b border-ink/5 hover:bg-paper">
                    <td className="py-2 pr-4">
                      <div className="text-ink">{m.memberName}</div>
                      <div className="text-xs text-ink/60">{m.memberNumber}</div>
                    </td>
                    <td className="py-2 pr-4 text-xs">{KYC_TIER_LABELS[m.kycTier]}</td>
                    <td className="py-2 pr-4 text-xs">{m.jurisdiction}</td>
                    <td className="py-2 pr-4 text-right font-mono text-xs font-medium">{m.score}</td>
                    <td className="py-2 pr-4">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${BAND_TONE[m.band]}`}>
                        {m.band}
                      </span>
                    </td>
                    <td className="py-2 pr-4">
                      {m.flags.length === 0 ? (
                        <span className="text-xs text-ink/40">—</span>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {m.flags.map((f) => (
                            <span
                              key={f}
                              className="rounded-full bg-clay/15 px-2 py-0.5 text-xs text-clay"
                            >
                              {f}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="py-2 pr-4 text-xs text-ink/60">
                      {new Date(m.lastReviewedAt).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="mt-6">
        <h2 className="text-sm font-semibold text-ink">How scores are used</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-ink/70">
          <li>HIGH band members trigger enhanced due diligence on next transaction.</li>
          <li>Withdrawal limits scale down automatically for HIGH band members.</li>
          <li>Scores are advisory, not deterministic — compliance officers can override with reason.</li>
          <li>Every score change is logged; the register is append-only for score history.</li>
        </ul>
      </Card>
    </div>
  );
}