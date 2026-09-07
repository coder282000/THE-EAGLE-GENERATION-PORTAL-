'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/card';
import { Button } from '@/components/button';
// Removed Avatar import – using inline initials instead
import { PillarTag } from '@/components/pillarTag';
import LedgerTable from '@/components/savings/LedgerTable'; // Changed to default import
import { ApprovalStatus } from '@/components/savings/ApprovalStatus';
import { formatCurrency } from '@/lib/utils';
import { mockCircles, mockContributions, mockPayouts, mockMembers } from '@/components/mock/data';

export default function CircleDetailPage() {
  const { id } = useParams();
  const circle = mockCircles.find((c) => c.id === id);
  const members = mockMembers.filter((m) => circle?.memberIds.includes(m.id));
  const contributions = mockContributions.filter((c) => c.circleId === id);
  const payouts = mockPayouts.filter((p) => p.circleId === id);

  // Build ledger entries from contributions + payouts
  const ledgerEntries = [
    ...contributions.map((c) => ({
      id: c.id,
      date: c.createdAt,
      description: `Contribution by ${mockMembers.find((m) => m.id === c.memberId)?.firstName || 'Unknown'}`,
      amount: c.amount,
      currency: c.currency,
      type: 'CREDIT' as const,
      status: c.status,
    })),
    ...payouts.map((p) => ({
      id: p.id,
      date: p.createdAt,
      description: `Payout to ${mockMembers.find((m) => m.id === p.memberId)?.firstName || 'Unknown'}`,
      amount: p.amount,
      currency: p.currency,
      type: 'DEBIT' as const,
      status: p.status,
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (!circle) {
    return <div className="text-center py-12 text-gray-500">Circle not found.</div>;
  }

  const isMember = circle.memberIds.includes('1');
  const isLeader = circle.leaderId === '1';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-ink">{circle.name}</h1>
          <p className="text-gray-600 mt-1">{circle.description}</p>
          <div className="flex gap-2 mt-2">
            <span className="text-sm bg-gray-100 px-2 py-1 rounded-full capitalize">{circle.type}</span>
            <span className={`text-sm px-2 py-1 rounded-full ${
              circle.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' :
              circle.status === 'PAUSED' ? 'bg-amber-100 text-amber-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {circle.status}
            </span>
          </div>
        </div>
        {isMember && (
          <div className="flex gap-2">
            <Link href={`/savings/circles/${circle.id}/contribute`}>
              <Button variant="primary">Contribute</Button>  {/* Changed from "sky" to "primary" */}
            </Link>
            {isLeader && (
              <Link href={`/savings/circles/${circle.id}/manage`}>
                <Button variant="secondary">Manage</Button>  {/* Changed from "clay" to "secondary" */}
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-3">
          <p className="text-sm text-gray-500">Total Balance</p>
          <p className="text-xl font-bold">{formatCurrency(circle.totalBalance, circle.currency)}</p>
        </Card>
        <Card className="p-3">
          <p className="text-sm text-gray-500">Members</p>
          <p className="text-xl font-bold">{circle.memberCount}</p>
        </Card>
        <Card className="p-3">
          <p className="text-sm text-gray-500">Contributions</p>
          <p className="text-xl font-bold">{circle.contributionCount}</p>
        </Card>
        <Card className="p-3">
          <p className="text-sm text-gray-500">Next Payout</p>
          <p className="text-xl font-bold">
            {circle.nextPayoutDate ? new Date(circle.nextPayoutDate).toLocaleDateString() : '—'}
          </p>
        </Card>
      </div>

      {/* Members */}
      <Card className="p-4">
        <h3 className="font-semibold text-ink mb-3">Members ({members.length})</h3>
        <div className="flex flex-wrap gap-3">
          {members.map((member) => (
            <div key={member.id} className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-full">
              {/* Replaced Avatar with inline initials */}
              <div className="w-6 h-6 rounded-full bg-sky-200 flex items-center justify-center text-xs font-medium text-sky-700">
                {member.firstName[0]}
              </div>
              <span className="text-sm font-medium">{member.firstName} {member.lastName}</span>
              {member.id === circle.leaderId && (
                <span className="text-xs bg-clay/20 text-clay px-1.5 py-0.5 rounded">Leader</span>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Ledger */}
      <Card className="p-4">
        <LedgerTable entries={ledgerEntries} currency={circle.currency} />
      </Card>

      {/* Pending approvals (if any) */}
      {payouts.some((p) => p.status === 'PENDING') && (
        <Card className="p-4 border-amber-200 bg-amber-50">
          <h3 className="font-semibold text-amber-800">Pending Approvals</h3>
          {payouts.filter((p) => p.status === 'PENDING').map((p) => (
            <div key={p.id} className="flex justify-between items-center py-2 border-b border-amber-100">
              <div>
                <p className="text-sm">
                  Payout to {mockMembers.find((m) => m.id === p.memberId)?.firstName}
                </p>
                <p className="text-xs text-gray-500">
                  {formatCurrency(p.amount, p.currency)} • Scheduled {new Date(p.scheduledDate).toLocaleDateString()}
                </p>
              </div>
              <ApprovalStatus status="PENDING" initiatedBy={p.initiatedBy} />
            </div>
          ))}
        </Card>
      )}

      {/* Dispute link */}
      <div className="text-right">
        <Link href={`/savings/circles/${circle.id}/dispute`}>
          <Button variant="outline" size="sm">Raise a Dispute</Button>
        </Link>
      </div>
    </div>
  );
}