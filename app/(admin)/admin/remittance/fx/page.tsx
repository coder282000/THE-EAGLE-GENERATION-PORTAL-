'use client';

// ADM-173 — FX Rate and Margin Management
// Route: /admin/remittance/fx

import { useMemo, useState } from 'react';
import { Button } from '@/components/button';
import { Card } from '@/components/card';
import {
  getFXRates,
  canViewRemittance,
  canManageFXRates,
  type FXRate,
} from '@/lib/mock/remittance';

interface Draft {
  midMarket: string;
  platformRate: string;
  marginBps: string;
}

function toDraft(r: FXRate): Draft {
  return {
    midMarket: r.midMarket.toFixed(4),
    platformRate: r.platformRate.toFixed(4),
    marginBps: String(r.marginBps),
  };
}

export default function FXRatePage() {
  const allowed = canViewRemittance();
  const canEdit = canManageFXRates();

  const rates = useMemo(() => (allowed ? getFXRates() : []), [allowed]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  function beginEdit(r: FXRate) {
    setEditingId(r.id);
    setDraft(toDraft(r));
    setError(null);
    setSavedAt(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setDraft(null);
    setError(null);
  }

  function validateAndConfirm() {
    if (!draft) return;
    const mid = parseFloat(draft.midMarket);
    const platform = parseFloat(draft.platformRate);
    const margin = parseInt(draft.marginBps, 10);

    if (!Number.isFinite(mid) || mid <= 0) return setError('Mid-market must be positive.');
    if (!Number.isFinite(platform) || platform <= 0) return setError('Platform rate must be positive.');
    if (!Number.isFinite(margin) || margin < 0 || margin > 1000) return setError('Margin must be between 0 and 1000 bps.');

    // margin bps should be roughly (platform-mid)/mid * 10000
    const impliedMargin = Math.round(((platform - mid) / mid) * 10000);
    if (Math.abs(impliedMargin - margin) > 50) {
      return setError(`Margin (${margin} bps) does not match the implied margin (${impliedMargin} bps) from mid-market and platform rate.`);
    }

    setError(null);
    setSavedAt(new Date().toISOString());
    setEditingId(null);
    setDraft(null);
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
        <h1 className="mt-1 text-2xl font-semibold text-ink">FX Rate and Margin Management</h1>
        <p className="mt-1 text-sm text-ink/70">
          Mid-market rates and platform margins per corridor. Changes take effect on the next quote; they are
          not retroactive. Every change is audited with before/after.
        </p>
      </header>

      {savedAt ? (
        <div role="status" className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
          FX rate change recorded at {new Date(savedAt).toLocaleString('en-GB')}. Member quotes will reflect
          the new rate on their next request.
        </div>
      ) : null}

      {!canEdit ? (
        <div role="note" className="mb-4 rounded-lg border border-clay/30 bg-clay/5 p-3 text-sm text-ink">
          Your role can view FX rates but not modify them. Finance Officer or Super Admin only.
        </div>
      ) : null}

      <div className="space-y-4">
        {rates.map((r) => {
          const isEditing = editingId === r.id && draft !== null;
          return (
            <Card key={r.id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="font-mono text-sm font-semibold text-ink">{r.corridorCode}</h2>
                  <p className="mt-1 text-xs text-ink/60">
                    Refreshed {new Date(r.refreshedAt).toLocaleString('en-GB')}
                  </p>
                </div>
                {!isEditing && canEdit ? (
                  <Button variant="outline" onClick={() => beginEdit(r)}>Edit rate</Button>
                ) : null}
              </div>

              {isEditing && draft ? (
                <div className="mt-4">
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                    <div>
                      <label className="block text-xs font-medium text-ink/70">Mid-market</label>
                      <input
                        type="number"
                        step="0.0001"
                        value={draft.midMarket}
                        onChange={(e) => setDraft({ ...draft, midMarket: e.target.value })}
                        className="mt-1 w-full rounded-md border border-ink/15 bg-paper px-3 py-2 text-sm font-mono text-ink focus:border-sky focus:outline-none focus:ring-2 focus:ring-sky/40"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-ink/70">Platform rate</label>
                      <input
                        type="number"
                        step="0.0001"
                        value={draft.platformRate}
                        onChange={(e) => setDraft({ ...draft, platformRate: e.target.value })}
                        className="mt-1 w-full rounded-md border border-ink/15 bg-paper px-3 py-2 text-sm font-mono text-ink focus:border-sky focus:outline-none focus:ring-2 focus:ring-sky/40"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-ink/70">Margin (bps)</label>
                      <input
                        type="number"
                        value={draft.marginBps}
                        onChange={(e) => setDraft({ ...draft, marginBps: e.target.value })}
                        className="mt-1 w-full rounded-md border border-ink/15 bg-paper px-3 py-2 text-sm font-mono text-ink focus:border-sky focus:outline-none focus:ring-2 focus:ring-sky/40"
                      />
                    </div>
                  </div>

                  {error ? (
                    <p role="alert" className="mt-2 text-xs text-red-700">{error}</p>
                  ) : null}

                  <div className="mt-4 flex gap-2">
                    <Button variant="primary" onClick={validateAndConfirm}>Save rate</Button>
                    <Button variant="outline" onClick={cancelEdit}>Cancel</Button>
                  </div>

                  <p role="note" className="mt-3 text-xs text-clay">
                    Four-eyes is not enforced on FX rate changes — every save is audited with before/after
                    values instead.
                  </p>
                </div>
              ) : (
                <dl className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-ink/60">Mid-market</dt>
                    <dd className="mt-1 font-mono text-sm text-ink">{r.midMarket.toFixed(4)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-ink/60">Platform rate</dt>
                    <dd className="mt-1 font-mono text-sm text-ink">{r.platformRate.toFixed(4)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-ink/60">Margin</dt>
                    <dd className="mt-1 font-mono text-sm text-ink">{r.marginBps} bps</dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-ink/60">Effective spread</dt>
                    <dd className="mt-1 font-mono text-sm text-ink">
                      {(((r.platformRate - r.midMarket) / r.midMarket) * 10000).toFixed(0)} bps
                    </dd>
                  </div>
                </dl>
              )}
            </Card>
          );
        })}
      </div>

      <Card className="mt-6">
        <h2 className="text-sm font-semibold text-ink">How margins work</h2>
        <p className="mt-2 text-sm text-ink/70">
          The mid-market rate is what the corridor costs the platform. The platform rate is what the member
          sees. The difference is the margin, which covers FX risk, float cost, and partner fees. A corridor
          with a thin margin against a volatile currency bleeds money on every transfer.
        </p>
      </Card>
    </div>
  );
}