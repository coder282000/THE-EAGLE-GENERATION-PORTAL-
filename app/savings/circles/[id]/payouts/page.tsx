'use client';

import { useParams } from 'next/navigation';
import { Card } from '@/components/card';
import { mockCircles, mockPayouts, mockMembers } from '@/components/mock/data';
import { formatCurrency } from '@/lib/utils';
import ApprovalStatus from '@/components/savings/ApprovalStatus'; // ✅ Default import

export default function PayoutSchedulePage() {
  const { id } = useParams();
  const circle = mockCircles.find((c) => c.id === id);
  const payouts = mockPayouts.filter((p) => p.circleId === id);

  if (!circle) {
    return <div className="text-center py-12 text-gray-500">Circle not found.</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-ink">Payout Schedule – {circle.name}</h1>
      <Card className="p-4">
        {payouts.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No payouts scheduled yet.</p>
        ) : (
          <div className="space-y-3">
            {payouts.map((p) => (
              <div key={p.id} className="flex justify-between items-center border-b border-gray-100 py-3">
                <div>
                  <p className="font-medium">
                    {mockMembers.find((m) => m.id === p.memberId)?.firstName || 'Member'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {formatCurrency(p.amount, p.currency)} • {new Date(p.scheduledDate).toLocaleDateString()}
                  </p>
                </div>
                <ApprovalStatus status={p.status} />
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}