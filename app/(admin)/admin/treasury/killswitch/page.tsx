'use client';

// ADM-156 — Emergency Kill Switch
// Route: /admin/treasury/killswitch

import { useMemo, useState } from 'react';
import { Button } from '@/components/button';
import { Card } from '@/components/card';
import {
  getKillSwitch,
  getWithdrawalCounts,
  canViewTreasury,
  canToggleKillSwitch,
} from '@/lib/mock/treasury';

export default function KillSwitchPage() {
  const allowed = canViewTreasury();
  const canToggle = canToggleKillSwitch();

  const initial = useMemo(() => getKillSwitch(), []);
  const counts = useMemo(() => getWithdrawalCounts(), []);

  const [active, setActive] = useState(initial.active);
  const [reason, setReason] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<
    Array<{ at: string; action: 'SET' | 'RELEASED'; reason: string; by: string }>
  >(
    initial.active && initial.setAt && initial.setBy
      ? [
          {
            at: initial.setAt,
            action: 'SET',
            reason: initial.reason ?? '',
            by: initial.setBy,
          },
        ]
      : []
  );

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

  function requestToggle() {
    if (!canToggle) {
      setError('Only a SUPER_ADMIN can operate the kill switch.');
      return;
    }
    if (!active && reason.trim().length < 20) {
      setError('Reason must be at least 20 characters — this is audited.');
      return;
    }
    if (!active && !confirmOpen) {
      setError(null);
      setConfirmOpen(true);
      return;
    }
    setError(null);
    const now = new Date().toISOString();
    const action: 'SET' | 'RELEASED' = active ? 'RELEASED' : 'SET';
    const entryReason = active
      ? reason || 'Withdrawals resumed after review'
      : reason;
    setHistory([{ at: now, action, reason: entryReason, by: 'u-super-admin-01' }, ...history]);
    setActive(!active);
    setReason('');
    setConfirmOpen(false);
  }

  return (
    <div className="p-6">
      <header className="mb-6">
        <p className="text-xs uppercase tracking-wide text-ink/60">PNL-12 · Treasury and Custody</p>
        <h1 className="mt-1 text-2xl font-semibold text-ink">Emergency Kill Switch</h1>
        <p className="mt-1 text-sm text-ink/70">
          Halt all platform withdrawals in one audited action. Deposits and reads are unaffected.
          Restricted to SUPER_ADMIN.
        </p>
      </header>

      <Card>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span
                className={`inline-block h-3 w-3 rounded-full ${active ? 'bg-red-600' : 'bg-emerald-500'}`}
                aria-hidden
              />
              <h2 className="text-base font-semibold text-ink">
                {active ? 'Withdrawals halted' : 'Withdrawals operational'}
              </h2>
            </div>
            <p className="mt-2 max-w-2xl text-sm text-ink/70">
              When active, no withdrawal can be approved on the platform. Every pending withdrawal stays in
              its current state and is marked HALTED until the switch is released. Member-facing wallet
              requests will receive a clear &ldquo;withdrawals temporarily paused&rdquo; message.
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-wide text-ink/60">Pending right now</p>
            <p className="text-2xl font-semibold text-ink">{counts.pendingApproval}</p>
          </div>
        </div>

        {!canToggle ? (
          <div role="note" className="mt-4 rounded-lg border border-clay/30 bg-clay/5 p-3 text-sm text-ink">
            Your role can view the switch state but cannot toggle it. SUPER_ADMIN only.
          </div>
        ) : null}

        {active && initial.setBy ? (
          <div role="alert" className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-900">
            <strong className="font-medium">Active since {initial.setAt ? new Date(initial.setAt).toLocaleString('en-GB') : '—'}.</strong>{' '}
            Set by {initial.setBy}. {initial.reason ? `Reason: ${initial.reason}` : ''}
          </div>
        ) : null}

        <div className="mt-5">
          <label htmlFor="ks-reason" className="block text-xs font-medium text-ink/70">
            {active
              ? 'Release reason (optional but recommended)'
              : 'Reason for halting (minimum 20 characters, audited)'}
          </label>
          <textarea
            id="ks-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            disabled={!canToggle}
            className="mt-1 w-full rounded-md border border-ink/15 bg-paper px-3 py-2 text-sm text-ink focus:border-sky focus:outline-none focus:ring-2 focus:ring-sky/40 disabled:opacity-50"
          />
        </div>

        {error ? (
          <p role="alert" className="mt-2 text-xs text-red-700">{error}</p>
        ) : null}

        {confirmOpen && !active ? (
          <div role="alertdialog" className="mt-4 rounded-lg border-2 border-red-400 bg-red-50 p-4">
            <h3 className="text-sm font-semibold text-red-900">Confirm halt</h3>
            <p className="mt-1 text-sm text-red-800">
              This will halt every withdrawal on the platform immediately, including the{' '}
              {counts.pendingApproval} currently pending approval. Members will see a paused message.
              You can release the switch at any time — this is reversible — but every action is logged.
            </p>
            <div className="mt-4 flex gap-2">
              <Button variant="destructive" onClick={requestToggle}>
                Yes, halt withdrawals
              </Button>
              <Button variant="outline" onClick={() => setConfirmOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="mt-4">
            <Button
              variant={active ? 'primary' : 'destructive'}
              onClick={requestToggle}
              disabled={!canToggle}
            >
              {active ? 'Release and resume withdrawals' : 'Halt all withdrawals'}
            </Button>
          </div>
        )}
      </Card>

      <Card className="mt-6">
        <h2 className="text-sm font-semibold text-ink">Switch history</h2>
        {history.length === 0 ? (
          <p className="mt-3 text-sm text-ink/60">
            No kill switch events recorded in this session. In production the full history is pulled from
            the audit log — every set and every release.
          </p>
        ) : (
          <ol className="mt-4 space-y-3">
            {history.map((h, i) => (
              <li key={i} className="flex gap-3">
                <span
                  className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                    h.action === 'SET' ? 'bg-red-600' : 'bg-emerald-500'
                  }`}
                  aria-hidden
                />
                <div>
                  <p className="text-sm text-ink">
                    {h.action === 'SET' ? 'Kill switch set' : 'Kill switch released'} by {h.by}
                  </p>
                  <p className="text-xs text-ink/60">{new Date(h.at).toLocaleString('en-GB')}</p>
                  {h.reason ? <p className="mt-1 text-xs text-ink/70">{h.reason}</p> : null}
                </div>
              </li>
            ))}
          </ol>
        )}
      </Card>

      <Card className="mt-6">
        <h2 className="text-sm font-semibold text-ink">When to use this</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-ink/70">
          <li>Suspected key compromise or unauthorised signing activity.</li>
          <li>A chain-level incident affecting the custody network.</li>
          <li>A confirmed AML/CFT event requiring immediate halt pending investigation.</li>
          <li>A regulator-issued direction to pause operations.</li>
          <li>Any time the risk of continued withdrawals exceeds the cost of pausing them.</li>
        </ul>
        <p className="mt-3 text-xs text-clay">
          Kill switch releases should be preceded by a documented review. Document the review in the audit
          log before releasing.
        </p>
      </Card>
    </div>
  );
}