'use client';

// ADM-172 — Corridor Configuration
// Route: /admin/remittance/corridors

import { useMemo, useState } from 'react';
import { Button } from '@/components/button';
import { Card } from '@/components/card';
import {
  getCorridors,
  canViewRemittance,
  canManageCorridors,
  CORRIDOR_STATUS_LABELS,
  RAIL_LABELS,
  formatMinor,
  type Corridor,
  type CorridorStatus,
} from '@/lib/mock/remittance';

const STATUS_TONE: Record<CorridorStatus, string> = {
  ACTIVE: 'bg-emerald-100 text-emerald-800',
  PAUSED: 'bg-clay/15 text-clay',
  DISABLED: 'bg-ink/10 text-ink/70',
};

interface Draft {
  status: CorridorStatus;
  minAmount: string;
  maxAmount: string;
  dailyCap: string;
  cutoffLocalTime: string;
  fxMarginBps: string;
}

function toDraft(c: Corridor): Draft {
  return {
    status: c.status,
    minAmount: (c.minAmountMinor / 100).toFixed(2),
    maxAmount: (c.maxAmountMinor / 100).toFixed(2),
    dailyCap: (c.dailyCapMinor / 100).toFixed(2),
    cutoffLocalTime: c.cutoffLocalTime,
    fxMarginBps: String(c.fxMarginBps),
  };
}

export default function CorridorConfigPage() {
  const allowed = canViewRemittance();
  const canEdit = canManageCorridors();

  const corridors = useMemo(() => (allowed ? getCorridors() : []), [allowed]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  function beginEdit(c: Corridor) {
    setEditingId(c.id);
    setDraft(toDraft(c));
    setReason('');
    setError(null);
    setSavedAt(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setDraft(null);
    setReason('');
    setError(null);
  }

  function validateAndConfirm() {
    if (!draft) return;
    const min = parseFloat(draft.minAmount);
    const max = parseFloat(draft.maxAmount);
    const cap = parseFloat(draft.dailyCap);
    const margin = parseInt(draft.fxMarginBps, 10);

    if (!Number.isFinite(min) || min <= 0) return setError('Minimum amount must be positive.');
    if (!Number.isFinite(max) || max <= min) return setError('Maximum must exceed minimum.');
    if (!Number.isFinite(cap) || cap <= 0) return setError('Daily cap must be positive.');
    if (!Number.isFinite(margin) || margin < 0 || margin > 1000) return setError('FX margin must be between 0 and 1000 bps.');
    if (!/^\d{2}:\d{2}$/.test(draft.cutoffLocalTime)) return setError('Cut-off must be HH:MM (24-hour).');
    if (reason.trim().length < 15) return setError('Change reason must be at least 15 characters — this is audited.');

    setError(null);
    setSavedAt(new Date().toISOString());
    setEditingId(null);
    setDraft(null);
    setReason('');
  }

  if (!allowed) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <Card>
          <h1 className="text-lg font-semibold text-ink">Permission denied</h1>
          <p className="mt-2 text-sm text-ink/70">You do not have access to remittance operations.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6">
      <header className="mb-6">
        <p className="text-xs uppercase tracking-wide text-ink/60">PNL-14 · Remittance Operations</p>
        <h1 className="mt-1 text-2xl font-semibold text-ink">Corridor Configuration</h1>
        <p className="mt-1 text-sm text-ink/70">
          Enable, pause or configure each corridor. Every change is audited with a mandatory reason.
        </p>
      </header>

      {savedAt ? (
        <div role="status" className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
          Corridor change recorded at {new Date(savedAt).toLocaleString('en-GB')}. In production this would take
          effect on the next quote and write to the audit trail.
        </div>
      ) : null}

      {!canEdit ? (
        <div role="note" className="mb-4 rounded-lg border border-clay/30 bg-clay/5 p-3 text-sm text-ink">
          Your role can view corridors but not modify them. Finance Officer or Super Admin only.
        </div>
      ) : null}

      <div className="space-y-4">
        {corridors.map((c) => {
          const isEditing = editingId === c.id && draft !== null;
          return (
            <Card key={c.id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-mono text-sm font-semibold text-ink">{c.code}</h2>
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_TONE[c.status]}`}>
                      {CORRIDOR_STATUS_LABELS[c.status]}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-ink/60">
                    {c.fromCountry} → {c.toCountry} · {RAIL_LABELS[c.rail]} · {c.fromCurrency}/{c.toCurrency}
                  </p>
                  <p className="mt-1 text-xs text-ink/60">
                    Last updated {new Date(c.updatedAt).toLocaleString('en-GB')} by {c.updatedBy}
                  </p>
                </div>
                {!isEditing && canEdit ? (
                  <Button variant="outline" onClick={() => beginEdit(c)}>Edit corridor</Button>
                ) : null}
              </div>

              {isEditing && draft ? (
                <div className="mt-4">
                  <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                    <div>
                      <label className="block text-xs font-medium text-ink/70">Status</label>
                      <select
                        value={draft.status}
                        onChange={(e) => setDraft({ ...draft, status: e.target.value as CorridorStatus })}
                        className="mt-1 w-full rounded-md border border-ink/15 bg-paper px-3 py-2 text-sm text-ink focus:border-sky focus:outline-none focus:ring-2 focus:ring-sky/40"
                      >
                        <option value="ACTIVE">Active</option>
                        <option value="PAUSED">Paused</option>
                        <option value="DISABLED">Disabled</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-ink/70">Min ({c.fromCurrency})</label>
                      <input
                        type="number"
                        step="0.01"
                        value={draft.minAmount}
                        onChange={(e) => setDraft({ ...draft, minAmount: e.target.value })}
                        className="mt-1 w-full rounded-md border border-ink/15 bg-paper px-3 py-2 text-sm font-mono text-ink focus:border-sky focus:outline-none focus:ring-2 focus:ring-sky/40"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-ink/70">Max ({c.fromCurrency})</label>
                      <input
                        type="number"
                        step="0.01"
                        value={draft.maxAmount}
                        onChange={(e) => setDraft({ ...draft, maxAmount: e.target.value })}
                        className="mt-1 w-full rounded-md border border-ink/15 bg-paper px-3 py-2 text-sm font-mono text-ink focus:border-sky focus:outline-none focus:ring-2 focus:ring-sky/40"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-ink/70">Daily cap ({c.fromCurrency})</label>
                      <input
                        type="number"
                        step="0.01"
                        value={draft.dailyCap}
                        onChange={(e) => setDraft({ ...draft, dailyCap: e.target.value })}
                        className="mt-1 w-full rounded-md border border-ink/15 bg-paper px-3 py-2 text-sm font-mono text-ink focus:border-sky focus:outline-none focus:ring-2 focus:ring-sky/40"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-ink/70">Cut-off (HH:MM)</label>
                      <input
                        type="text"
                        value={draft.cutoffLocalTime}
                        onChange={(e) => setDraft({ ...draft, cutoffLocalTime: e.target.value })}
                        className="mt-1 w-full rounded-md border border-ink/15 bg-paper px-3 py-2 text-sm font-mono text-ink focus:border-sky focus:outline-none focus:ring-2 focus:ring-sky/40"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-ink/70">FX margin (bps)</label>
                      <input
                        type="number"
                        value={draft.fxMarginBps}
                        onChange={(e) => setDraft({ ...draft, fxMarginBps: e.target.value })}
                        className="mt-1 w-full rounded-md border border-ink/15 bg-paper px-3 py-2 text-sm font-mono text-ink focus:border-sky focus:outline-none focus:ring-2 focus:ring-sky/40"
                      />
                    </div>
                  </div>

                  <div className="mt-3">
                    <label className="block text-xs font-medium text-ink/70">
                      Change reason (minimum 15 characters, audited)
                    </label>
                    <textarea
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      rows={2}
                      className="mt-1 w-full rounded-md border border-ink/15 bg-paper px-3 py-2 text-sm text-ink focus:border-sky focus:outline-none focus:ring-2 focus:ring-sky/40"
                    />
                  </div>

                  {error ? <p role="alert" className="mt-2 text-xs text-red-700">{error}</p> : null}

                  <div className="mt-3 flex gap-2">
                    <Button variant="primary" onClick={validateAndConfirm}>Save corridor</Button>
                    <Button variant="outline" onClick={cancelEdit}>Cancel</Button>
                  </div>
                </div>
              ) : (
                <dl className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-5">
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-ink/60">Min</dt>
                    <dd className="mt-1 font-mono text-sm text-ink">{formatMinor(c.minAmountMinor, c.fromCurrency)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-ink/60">Max</dt>
                    <dd className="mt-1 font-mono text-sm text-ink">{formatMinor(c.maxAmountMinor, c.fromCurrency)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-ink/60">Daily cap</dt>
                    <dd className="mt-1 font-mono text-sm text-ink">{formatMinor(c.dailyCapMinor, c.fromCurrency)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-ink/60">Cut-off</dt>
                    <dd className="mt-1 font-mono text-sm text-ink">{c.cutoffLocalTime}</dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-ink/60">FX margin</dt>
                    <dd className="mt-1 font-mono text-sm text-ink">{c.fxMarginBps} bps</dd>
                  </div>
                </dl>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}