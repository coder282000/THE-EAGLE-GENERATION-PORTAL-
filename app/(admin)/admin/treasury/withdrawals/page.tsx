'use client';

// ADM-151 — Withdrawal Approval Queue (four-eyes)
// Route: /admin/treasury/withdrawals

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/button';
import { Card } from '@/components/card';
import {
  getWithdrawals,
  getWithdrawalCounts,
  getKillSwitch,
  canViewTreasury,
  canOperateTreasury,
  canApproveWithdrawal,
  WITHDRAWAL_STATUS_LABELS,
  NETWORK_LABELS,
  formatUsdt,
  type WithdrawalRequest,
  type WithdrawalStatus,
} from '@/lib/mock/treasury';

type StatusFilter = 'ALL' | WithdrawalStatus;

const STATUS_TONE: Record<WithdrawalStatus, string> = {
  PENDING_APPROVAL: 'bg-clay/15 text-clay',
  APPROVED: 'bg-sky/15 text-sky',
  BROADCAST: 'bg-sky/15 text-sky',
  CONFIRMING: 'bg-sky/15 text-sky',
  COMPLETED: 'bg-emerald-100 text-emerald-800',
  REJECTED: 'bg-ink/10 text-ink/70',
  HALTED: 'bg-red-100 text-red-800',
};

function riskTone(score: number): string {
  if (score >= 60) return 'text-red-700 font-medium';
  if (score >= 30) return 'text-clay';
  return 'text-ink/70';
}

export default function WithdrawalQueuePage() {
  const allowed = canViewTreasury();
  const canOperate = canOperateTreasury();
  const killSwitch = useMemo(() => getKillSwitch(), []);

  const withdrawals = useMemo(() => (allowed ? getWithdrawals() : []), [allowed]);
  const counts = useMemo(() => getWithdrawalCounts(), []);

  const [statusFilter, setStatusFilter] = useState<StatusFilter>('PENDING_APPROVAL');
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    let list = withdrawals;
    if (statusFilter !== 'ALL') list = list.filter((w) => w.status === statusFilter);
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (w) =>
          w.reference.toLowerCase().includes(q) ||
          w.memberName.toLowerCase().includes(q) ||
          w.memberNumber.toLowerCase().includes(q) ||
          w.destinationMasked.toLowerCase().includes(q)
      );
    }
    return list;
  }, [withdrawals, statusFilter, query]);

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

  return (
    <div className="p-6">
      <header className="mb-6">
        <p className="text-xs uppercase tracking-wide text-ink/60">PNL-12 · Treasury and Custody</p>
        <h1 className="mt-1 text-2xl font-semibold text-ink">Withdrawal Approval Queue</h1>
        <p className="mt-1 text-sm text-ink/70">
          Every member withdrawal pending review. Four-eyes: the approver cannot be the initiator.
        </p>
      </header>

      {killSwitch.active ? (
        <div role="alert" className="mb-4 rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-900">
          <strong className="font-medium">Kill switch is ACTIVE.</strong> No withdrawal can be approved until
          it is released.
        </div>
      ) : null}

      <section aria-label="Withdrawal counts" className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card>
          <dl>
            <dt className="text-xs uppercase tracking-wide text-ink/60">Pending approval</dt>
            <dd className="mt-1 text-2xl font-semibold text-clay">{counts.pendingApproval}</dd>
          </dl>
        </Card>
        <Card>
          <dl>
            <dt className="text-xs uppercase tracking-wide text-ink/60">AML flagged</dt>
            <dd className={`mt-1 text-2xl font-semibold ${counts.amlFlagged > 0 ? 'text-red-700' : 'text-ink'}`}>
              {counts.amlFlagged}
            </dd>
          </dl>
        </Card>
        <Card>
          <dl>
            <dt className="text-xs uppercase tracking-wide text-ink/60">High risk</dt>
            <dd className={`mt-1 text-2xl font-semibold ${counts.highRisk > 0 ? 'text-clay' : 'text-ink'}`}>
              {counts.highRisk}
            </dd>
          </dl>
        </Card>
        <Card>
          <dl>
            <dt className="text-xs uppercase tracking-wide text-ink/60">Confirming on-chain</dt>
            <dd className="mt-1 text-2xl font-semibold text-sky">{counts.confirming}</dd>
          </dl>
        </Card>
      </section>

      <Card className="mt-6">
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label htmlFor="wd-query" className="block text-xs font-medium text-ink/70">Search</label>
            <input
              id="wd-query"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Reference, member, address…"
              className="mt-1 w-64 rounded-md border border-ink/15 bg-paper px-3 py-2 text-sm text-ink focus:border-sky focus:outline-none focus:ring-2 focus:ring-sky/40"
            />
          </div>
          <div>
            <label htmlFor="wd-status" className="block text-xs font-medium text-ink/70">Status</label>
            <select
              id="wd-status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              className="mt-1 rounded-md border border-ink/15 bg-paper px-3 py-2 text-sm text-ink focus:border-sky focus:outline-none focus:ring-2 focus:ring-sky/40"
            >
              <option value="ALL">All statuses</option>
              <option value="PENDING_APPROVAL">Pending approval</option>
              <option value="APPROVED">Approved</option>
              <option value="BROADCAST">Broadcast</option>
              <option value="CONFIRMING">Confirming</option>
              <option value="COMPLETED">Completed</option>
              <option value="REJECTED">Rejected</option>
              <option value="HALTED">Halted</option>
            </select>
          </div>
          <div className="ml-auto text-xs text-ink/60">
            Showing {filtered.length} of {withdrawals.length}
          </div>
        </div>
      </Card>

      <Card className="mt-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <caption className="sr-only">Withdrawal requests</caption>
            <thead className="border-b border-ink/10 text-xs uppercase tracking-wide text-ink/60">
              <tr>
                <th scope="col" className="py-2 pr-4">Reference</th>
                <th scope="col" className="py-2 pr-4">Member</th>
                <th scope="col" className="py-2 pr-4 text-right">Amount</th>
                <th scope="col" className="py-2 pr-4">Network</th>
                <th scope="col" className="py-2 pr-4">Destination</th>
                <th scope="col" className="py-2 pr-4 text-right">KYC</th>
                <th scope="col" className="py-2 pr-4 text-right">Risk</th>
                <th scope="col" className="py-2 pr-4">AML</th>
                <th scope="col" className="py-2 pr-4">Status</th>
                <th scope="col" className="py-2 pr-4">Initiated</th>
                <th scope="col" className="py-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-8 text-center text-sm text-ink/60">
                    No withdrawals match the current filters.
                  </td>
                </tr>
              ) : (
                filtered.map((w) => (
                  <tr key={w.id} className="border-b border-ink/5 hover:bg-paper">
                    <td className="py-2 pr-4 font-mono text-xs text-ink">{w.reference}</td>
                    <td className="py-2 pr-4">
                      <div className="text-ink">{w.memberName}</div>
                      <div className="text-xs text-ink/60">{w.memberNumber}</div>
                    </td>
                    <td className="py-2 pr-4 text-right font-mono text-xs">
                      {formatUsdt(w.amountMicro)}
                    </td>
                    <td className="py-2 pr-4 text-xs">{NETWORK_LABELS[w.network]}</td>
                    <td className="py-2 pr-4 font-mono text-xs text-ink/70">{w.destinationMasked}</td>
                    <td className="py-2 pr-4 text-right text-xs">
                      {w.kycTier === 2 ? 'Full' : w.kycTier === 1 ? 'Basic' : 'None'}
                    </td>
                    <td className={`py-2 pr-4 text-right font-mono text-xs ${riskTone(w.riskScore)}`}>
                      {w.riskScore}
                    </td>
                    <td className="py-2 pr-4">
                      {w.amlFlagged ? (
                        <span className="inline-flex rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800">
                          Flagged
                        </span>
                      ) : (
                        <span className="text-xs text-ink/50">Clear</span>
                      )}
                    </td>
                    <td className="py-2 pr-4">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_TONE[w.status]}`}>
                        {WITHDRAWAL_STATUS_LABELS[w.status]}
                      </span>
                    </td>
                    <td className="py-2 pr-4 text-xs text-ink/60">
                      {new Date(w.initiatedAt).toLocaleString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-2 text-right">
                      <Link
                        href={`/admin/treasury/withdrawals/${w.id}`}
                        className="text-xs font-medium text-sky hover:underline"
                      >
                        {w.status === 'PENDING_APPROVAL' && canOperate ? 'Review' : 'View'}
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="mt-6">
        <h2 className="text-sm font-semibold text-ink">Four-eyes on every withdrawal</h2>
        <p className="mt-2 text-sm text-ink/70">
          The withdrawer cannot approve their own request. Approvals from the same user are refused
          server-side and highlighted in the detail view. When the kill switch is active, no approval
          actions are available — the queue becomes read-only until the switch is released.
        </p>
      </Card>
    </div>
  );
}