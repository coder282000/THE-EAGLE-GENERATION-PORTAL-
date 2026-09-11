'use client';

// ADM-162 — Rate and Spread Management
// Route: /admin/otc/rates

import { useMemo, useState } from 'react';
import { Button } from '@/components/button';
import { Card } from '@/components/card';
import {
  getOTCSpreadConfigs,
  canViewOTC,
  canManageRates,
  OTC_TIER_LABELS,
  type OTCSpreadConfig,
  type OTCTier,
} from '@/lib/mock/otc';

interface Draft {
  buyRate: string;
  sellRate: string;
  spreadBps: string;
  minAmount: string;
  maxAmount: string;
}

function toDraft(c: OTCSpreadConfig): Draft {
  return {
    buyRate: c.buyRate.toFixed(2),
    sellRate: c.sellRate.toFixed(2),
    spreadBps: String(c.spreadBps),
    minAmount: (c.minAmountMinor / 100).toFixed(2),
    maxAmount: (c.maxAmountMinor / 100).toFixed(2),
  };
}

export default function OTCRatesPage() {
  const allowed = canViewOTC();
  const canEdit = canManageRates();

  const configs = useMemo(() => (allowed ? getOTCSpreadConfigs() : []), [allowed]);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  function beginEdit(c: OTCSpreadConfig) {
    setEditingId(c.id);
    setDraft(toDraft(c));
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
    const buy = parseFloat(draft.buyRate);
    const sell = parseFloat(draft.sellRate);
    const spread = parseInt(draft.spreadBps, 10);
    const min = parseFloat(draft.minAmount);
    const max = parseFloat(draft.maxAmount);

    if (!Number.isFinite(buy) || buy <= 0) return setError('Buy rate must be a positive number.');
    if (!Number.isFinite(sell) || sell <= 0) return setError('Sell rate must be a positive number.');
    if (sell >= buy) return setError('Sell rate must be lower than buy rate (spread is the difference).');
    if (!Number.isFinite(spread) || spread < 0 || spread > 500) return setError('Spread must be between 0 and 500 bps.');
    if (!Number.isFinite(min) || min <= 0) return setError('Minimum amount must be a positive number.');
    if (!Number.isFinite(max) || max <= min) return setError('Maximum amount must exceed minimum.');

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
          <p className="mt-2 text-sm text-ink/70">You do not have access to the OTC desk.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6">
      <header className="mb-6">
        <p className="text-xs uppercase tracking-wide text-ink/60">PNL-13 · OTC Desk</p>
        <h1 className="mt-1 text-2xl font-semibold text-ink">Rate and Spread Management</h1>
        <p className="mt-1 text-sm text-ink/70">
          Buy and sell rates per membership tier. Every change is audited with before and after values.
        </p>
      </header>

      {savedAt ? (
        <div role="status" className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
          Rate change recorded at {new Date(savedAt).toLocaleString('en-GB')}. In production this would be
          applied to the live quote engine and logged to the audit trail.
        </div>
      ) : null}

      {!canEdit ? (
        <div role="note" className="mb-4 rounded-lg border border-clay/30 bg-clay/5 p-3 text-sm text-ink">
          Your role can view rates but not modify them. Finance Officer or Super Admin only.
        </div>
      ) : null}

      <div className="space-y-4">
        {configs.map((c) => {
          const isEditing = editingId === c.id && draft !== null;
          return (
            <Card key={c.id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-sm font-semibold text-ink">
                    {c.pair} · {OTC_TIER_LABELS[c.tier]}
                  </h2>
                  <p className="mt-1 text-xs text-ink/60">
                    Last updated {new Date(c.updatedAt).toLocaleString('en-GB')} by {c.updatedBy}
                  </p>
                </div>
                {!isEditing && canEdit ? (
                  <Button variant="outline" onClick={() => beginEdit(c)}>
                    Edit rates
                  </Button>
                ) : null}
              </div>

              {isEditing && draft ? (
                <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-5">
                  <div>
                    <label className="block text-xs font-medium text-ink/70">Buy rate (KES per USDT)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={draft.buyRate}
                      onChange={(e) => setDraft({ ...draft, buyRate: e.target.value })}
                      className="mt-1 w-full rounded-md border border-ink/15 bg-paper px-3 py-2 text-sm font-mono text-ink focus:border-sky focus:outline-none focus:ring-2 focus:ring-sky/40"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-ink/70">Sell rate</label>
                    <input
                      type="number"
                      step="0.01"
                      value={draft.sellRate}
                      onChange={(e) => setDraft({ ...draft, sellRate: e.target.value })}
                      className="mt-1 w-full rounded-md border border-ink/15 bg-paper px-3 py-2 text-sm font-mono text-ink focus:border-sky focus:outline-none focus:ring-2 focus:ring-sky/40"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-ink/70">Spread (bps)</label>
                    <input
                      type="number"
                      value={draft.spreadBps}
                      onChange={(e) => setDraft({ ...draft, spreadBps: e.target.value })}
                      className="mt-1 w-full rounded-md border border-ink/15 bg-paper px-3 py-2 text-sm font-mono text-ink focus:border-sky focus:outline-none focus:ring-2 focus:ring-sky/40"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-ink/70">Min (KES)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={draft.minAmount}
                      onChange={(e) => setDraft({ ...draft, minAmount: e.target.value })}
                      className="mt-1 w-full rounded-md border border-ink/15 bg-paper px-3 py-2 text-sm font-mono text-ink focus:border-sky focus:outline-none focus:ring-2 focus:ring-sky/40"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-ink/70">Max (KES)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={draft.maxAmount}
                      onChange={(e) => setDraft({ ...draft, maxAmount: e.target.value })}
                      className="mt-1 w-full rounded-md border border-ink/15 bg-paper px-3 py-2 text-sm font-mono text-ink focus:border-sky focus:outline-none focus:ring-2 focus:ring-sky/40"
                    />
                  </div>
                  {error ? (
                    <p role="alert" className="col-span-full text-xs text-red-700">{error}</p>
                  ) : null}
                  <div className="col-span-full flex gap-2">
                    <Button variant="primary" onClick={validateAndConfirm}>
                      Save rate change
                    </Button>
                    <Button variant="outline" onClick={cancelEdit}>
                      Cancel
                    </Button>
                  </div>
                  <p role="note" className="col-span-full text-xs text-clay">
                    Four-eyes not enforced on rate changes — every save is audited instead. Confirm the
                    before/after in the audit log after saving.
                  </p>
                </div>
              ) : (
                <dl className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-5">
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-ink/60">Buy rate</dt>
                    <dd className="mt-1 font-mono text-sm text-ink">{c.buyRate.toFixed(2)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-ink/60">Sell rate</dt>
                    <dd className="mt-1 font-mono text-sm text-ink">{c.sellRate.toFixed(2)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-ink/60">Spread</dt>
                    <dd className="mt-1 font-mono text-sm text-ink">{c.spreadBps} bps</dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-ink/60">Min (KES)</dt>
                    <dd className="mt-1 font-mono text-sm text-ink">{(c.minAmountMinor / 100).toLocaleString('en-KE')}</dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-ink/60">Max (KES)</dt>
                    <dd className="mt-1 font-mono text-sm text-ink">{(c.maxAmountMinor / 100).toLocaleString('en-KE')}</dd>
                  </div>
                </dl>
              )}
            </Card>
          );
        })}
      </div>

      <Card className="mt-6">
        <h2 className="text-sm font-semibold text-ink">Why tiers differ</h2>
        <p className="mt-2 text-sm text-ink/70">
          Higher membership tiers receive a tighter spread. Nestling members pay the widest spread; Eagle
          members the narrowest. This is the mechanism that rewards member progression and matches the
          tier-based limits on the member-facing OTC screens.
        </p>
      </Card>
    </div>
  );
}