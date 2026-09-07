'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { Card } from '@/components/card';
import { Button } from '@/components/button';
import { formatCurrency } from '@/lib/utils';
import { mockLoans } from '@/components/mock/data';

export default function EarlySettlementPage() {
  const { id } = useParams();
  const router = useRouter();
  const loan = mockLoans.find((l) => l.id === id);
  const [loading, setLoading] = useState(false);

  if (!loan) {
    return <div className="text-center py-12 text-gray-500">Loan not found.</div>;
  }

  // Mock early settlement calculation: outstanding balance minus a small rebate
  const rebate = Math.round(loan.outstandingBalance * 0.02);
  const settlementAmount = loan.outstandingBalance - rebate;

  const handleSettle = async () => {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setLoading(false);
    router.push('/credit/my-loans');
  };

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-ink mb-6">Early Settlement Quote</h1>
      <Card className="p-6">
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
            <div className="flex justify-between"><span>Outstanding Balance</span><span>{formatCurrency(loan.outstandingBalance, 'KES')}</span></div>
            <div className="flex justify-between text-emerald-600"><span>Rebate (2%)</span><span>-{formatCurrency(rebate, 'KES')}</span></div>
            <div className="flex justify-between border-t pt-2 font-bold"><span>Settlement Amount</span><span>{formatCurrency(settlementAmount, 'KES')}</span></div>
          </div>
          <p className="text-xs text-gray-500">Offer valid for 7 days.</p>
          <div className="flex gap-3">
            <Button
              variant="primary"
              onClick={handleSettle}
              disabled={loading}
              className="flex-1"
            >
              {loading ? 'Processing...' : 'Proceed to Pay'}
            </Button>
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}