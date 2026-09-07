'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { Card } from '@/components/card';
import { Button } from '@/components/button';
import { formatCurrency } from '@/lib/utils';
import { mockLoanApplications } from '@/components/mock/data';

export default function LoanOfferPage() {
  const { id } = useParams();
  const router = useRouter();
  const application = mockLoanApplications.find((a) => a.id === id);
  const [loading, setLoading] = useState(false);

  if (!application || !application.offer) {
    return <div className="text-center py-12 text-gray-500">Offer not found.</div>;
  }

  const handleDecision = async (accept: boolean) => {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setLoading(false);
    router.push('/credit/my-loans');
  };

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-ink mb-6">Loan Offer</h1>
      <Card className="p-6">
        <div className="space-y-4">
          <div className="bg-emerald-50 p-4 rounded-lg text-center">
            <p className="text-sm text-emerald-600">Congratulations! You have been pre-approved.</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
            <div className="flex justify-between"><span>Approved Amount</span><span className="font-bold">{formatCurrency(application.offer.approvedAmount, 'KES')}</span></div>
            <div className="flex justify-between"><span>Tenor</span><span className="font-bold">{application.offer.approvedTenor} months</span></div>
            <div className="flex justify-between"><span>Interest Rate</span><span className="font-bold">{application.offer.interestRate}% p.a.</span></div>
            <div className="flex justify-between"><span>Total Cost</span><span className="font-bold">{formatCurrency(application.offer.totalCost, 'KES')}</span></div>
            <div className="flex justify-between"><span>Monthly Payment</span><span className="font-bold">{formatCurrency(application.offer.monthlyPayment, 'KES')}</span></div>
          </div>
          <div className="text-xs text-gray-500">
            Offer expires on {new Date(application.offer.expiresAt).toLocaleDateString()}
          </div>
          <div className="flex flex-col sm:flex-row gap-3 mt-4">
            <Button
              variant="primary"
              onClick={() => handleDecision(true)}
              disabled={loading}
              className="flex-1"
            >
              {loading ? 'Processing...' : 'Accept Offer'}
            </Button>
            <Button
              variant="outline"
              onClick={() => handleDecision(false)}
              disabled={loading}
              className="flex-1"
            >
              Decline
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}