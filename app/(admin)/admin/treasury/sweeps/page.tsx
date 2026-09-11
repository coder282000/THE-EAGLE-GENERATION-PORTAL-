'use client';

// ADM-152 — Hot Wallet Top-Up / Sweep
// Route: /admin/treasury/sweeps

import { useMemo, useState } from 'react';
import { Button } from '@/components/button';
import { Card } from '@/components/card';
import {
  getSweeps,
  getTreasuryBalances,
  getPendingSweeps,
  canViewTreasury,
  canOperateTreasury,
  canWitnessSweep,
  SWEEP_DIRECTION_LABELS,
  SWEEP_STATUS_LABELS,
  NETWORK_LABELS,
  TIER_LABELS,
  formatUsdt,
  type WalletSweep,
  type Network,
  type SweepDirection,
} from '@/lib/mock/treasury';

const STATUS_TONE: Record<WalletSweep['status'], string> = {
  DRAFT: 'bg-ink/10 text-ink/70',
  PENDING_WITNESS: 'bg-clay/15 text-clay',
  BROADCAST: 'bg-sky/15 text-sky',
  CONFIRMING: 'bg-sky/15 text-sky',
  COMPLETED: 'bg-emerald-100 text-emerald-800',
  FAILED: 'bg-red-100 text-red-800',
};

export default function SweepsPage() {
  const allowed = canViewTreasury();
  const canOperate = canOperateTreasury();

  const sweeps = useMemo(() => (allowed ? getSweeps() : []), [allowed]);
  const balances = useMemo(() => (allowed ? getTreasuryBalances() : []), [allowed]);
  const pending = useMemo(() => getPendingSweeps(), []);

  const [draftOpen, setDraftOpen] = useState(false);
  const [draftNetwork, setDraftNetwork] = useState<Network>('TRC20');
  const [draftDirection, setDraftDirection] = useState<SweepDirection>('HOT_TO_WARM');
  const [draftAmount, setDraftAmount] = useState('');
  const [draftReason, setDraftReason] = useState('');
  const [draftError, setDraftError] = useState<string | null>(null);
  const [draftSubmitted, setDraftSubmitted] = useState(false);

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

  const availableBalances = balances.filter((b) => b.network === draftNetwork);

  function submitDraft(e: React.FormEvent) {
    e.preventDefault();
    const amount = parseFloat(draftAmount);
    if (!Number.isFinite(amount) || amount <= 0) {
      setDraftError('Amount must be a positive number.');
      return;
    }
    if (draftReason.trim().length < 20) {
      setDraftError('Reason must be at least 20 characters — sweeps are audited.');
      return;
    }
    setDraftError(null);
    setDraftSubmitted(true);
  }

  return (
    <div className="p-6">
      <header className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-ink/60">PNL-12 · Treasury and Custody</p>
          <h1 className="mt-1 text-2xl font-semibold text-ink">Hot Wallet Top-Up and Sweep</h1>
          <p className="mt-1 text-sm text-ink/70">
            Move USDT between hot, warm and cold custody tiers. Every sweep requires a witness different
            from the initiator.
          </p>
        </div>
        {canOperate && !draftOpen && !draftSubmitted ? (
          <Button variant="primary" onClick={() => setDraftOpen(true)}>
            New sweep
          </Button>
        ) : null}
      </header>

      {!canOperate ? (
        <div role="note" className="mb-4 rounded-lg border border-clay/30 bg-clay/5 p-3 text-sm text-ink">
          Your role can view sweeps but not initiate them. Finance Officer or Super Admin only.
        </div>
      ) : null}

      {draftSubmitted ? (
        <div role="status" className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
          Sweep draft created for {draftAmount} USDT ({SWEEP_DIRECTION_LABELS[draftDirection]}, {NETWORK_LABELS[draftNetwork]}).
          In production this would enter PENDING_WITNESS and wait for a second operator. Notify the witness.
        </div>
      ) : null}

      {draftOpen ? (
        <Card className="mb-4">
          <h2 className="text-sm font-semibold text-ink">New sweep</h2>
          <form onSubmit={submitDraft} className="mt-4">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <div>
                <label className="block text-xs font-medium text-ink/70">Network</label>
                <select
                  value={draftNetwork}
                  onChange={(e) => setDraftNetwork(e.target.value as Network)}
                  className="mt-1 w-full rounded-md border border-ink/15 bg-paper px-3 py-2 text-sm text-ink focus:border-sky focus:outline-none focus:ring-2 focus:ring-sky/40"
                >
                  <option value="TRC20">TRC20 (Tron)</option>
                  <option value="ERC20">ERC20 (Ethereum)</option>
                  <option value="BEP20">BEP20 (BSC)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-ink/70">Direction</label>
                <select
                  value={draftDirection}
                  onChange={(e) => setDraftDirection(e.target.value as SweepDirection)}
                  className="mt-1 w-full rounded-md border border-ink/15 bg-paper px-3 py-2 text-sm text-ink focus:border-sky focus:outline-none focus:ring-2 focus:ring-sky/40"
                >
                  <option value="HOT_TO_WARM">Hot → Warm (top up warm)</option>
                  <option value="WARM_TO_HOT">Warm → Hot (top up hot)</option>
                  <option value="WARM_TO_COLD">Warm → Cold (cold storage)</option>
                  <option value="COLD_TO_HOT">Cold → Hot (emergency)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-ink/70">Amount (USDT)</label>
                <input
                  type="number"
                  step="0.01"
                  value={draftAmount}
                  onChange={(e) => setDraftAmount(e.target.value)}
                  className="mt-1 w-full rounded-md border border-ink/15 bg-paper px-3 py-2 text-sm font-mono text-ink focus:border-sky focus:outline-none focus:ring-2 focus:ring-sky/40"
                />
              </div>
            </div>

            <div className="mt-3">
              <label className="block text-xs font-medium text-ink/70">
                Reason (minimum 20 characters, audited)
              </label>
              <textarea
                value={draftReason}
                onChange={(e) => setDraftReason(e.target.value)}
                rows={2}
                className="mt-1 w-full rounded-md border border-ink/15 bg-paper px-3 py-2 text-sm text-ink focus:border-sky focus:outline-none focus:ring-2 focus:ring-sky/40"
              />
            </div>

            <div className="mt-3">
              <p className="text-xs text-ink/60">
                Current balances on {NETWORK_LABELS[draftNetwork]}:
                {availableBalances.map((b) => (
                  <span key={b.id} className="ml-2 font-mono text-ink">
                    {TIER_LABELS[b.tier]} {formatUsdt(b.amountMicro)}
                  </span>
                ))}
              </p>
            </div>

            {draftError ? (
              <p role="alert" className="mt-2 text-xs text-red-700">{draftError}</p>
            ) : null}

            <div className="mt-4 flex gap-2">
              <Button variant="primary" type="submit">Create sweep</Button>
              <Button
                variant="outline"
                type="button"
                onClick={() => {
                  setDraftOpen(false);
                  setDraftError(null);
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      ) : null}

      {pending.pendingWitness > 0 ? (
        <div role="alert" className="mb-4 rounded-lg border border-clay/40 bg-clay/5 p-3 text-sm text-ink">
          <strong className="font-medium">
            {pending.pendingWitness} sweep{pending.pendingWitness === 1 ? '' : 's'} awaiting witness.
          </strong>{' '}
          A second operator must confirm before broadcast.
        </div>
      ) : null}

      <Card>
        <h2 className="text-sm font-semibold text-ink">Sweep history</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <caption className="sr-only">Sweep history</caption>
            <thead className="border-b border-ink/10 text-xs uppercase tracking-wide text-ink/60">
              <tr>
                <th scope="col" className="py-2 pr-4">Reference</th>
                <th scope="col" className="py-2 pr-4">Direction</th>
                <th scope="col" className="py-2 pr-4">Network</th>
                <th scope="col" className="py-2 pr-4 text-right">Amount</th>
                <th scope="col" className="py-2 pr-4">Reason</th>
                <th scope="col" className="py-2 pr-4">Status</th>
                <th scope="col" className="py-2 pr-4">Initiated</th>
                <th scope="col" className="py-2 pr-4">Witness</th>
                <th scope="col" className="py-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {sweeps.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-sm text-ink/60">
                    No sweeps recorded.
                  </td>
                </tr>
              ) : (
                sweeps.map((s) => {
                  const canWitness = canWitnessSweep(s);
                  return (
                    <tr key={s.id} className="border-b border-ink/5 hover:bg-paper">
                      <td className="py-2 pr-4 font-mono text-xs text-ink">{s.reference}</td>
                      <td className="py-2 pr-4 text-xs">{SWEEP_DIRECTION_LABELS[s.direction]}</td>
                      <td className="py-2 pr-4 text-xs">{NETWORK_LABELS[s.network]}</td>
                      <td className="py-2 pr-4 text-right font-mono text-xs">
                        {formatUsdt(s.amountMicro)}
                      </td>
                      <td className="py-2 pr-4 text-xs text-ink/80">{s.reason}</td>
                      <td className="py-2 pr-4">
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_TONE[s.status]}`}>
                          {SWEEP_STATUS_LABELS[s.status]}
                        </span>
                      </td>
                      <td className="py-2 pr-4 text-xs text-ink/60">
                        {new Date(s.createdAt).toLocaleString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="py-2 pr-4 text-xs">
                        {s.witnessBy ? (
                          <span className="text-emerald-700">{s.witnessBy}</span>
                        ) : (
                          <span className="text-clay">Awaiting</span>
                        )}
                      </td>
                      <td className="py-2 text-right">
                        {s.status === 'PENDING_WITNESS' && canWitness ? (
                          <button
                            type="button"
                            className="text-xs font-medium text-sky hover:underline"
                            title="Witness sweep"
                          >
                            Witness
                          </button>
                        ) : (
                          <span className="text-xs text-ink/40">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="mt-6">
        <h2 className="text-sm font-semibold text-ink">Why sweeps are witnesses</h2>
        <p className="mt-2 text-sm text-ink/70">
          A single operator moving funds between tiers is a single point of failure and a single point of
          compromise. Requiring a witness enforces the two-person control regulators expect, and creates
          the audit trail that proves the sweep was legitimate. Sweeps into cold storage are additionally
          gated by a key ceremony on ADM-153 — the sweep screen records the intent, the ceremony records
          the execution.
        </p>
      </Card>
    </div>
  );
}