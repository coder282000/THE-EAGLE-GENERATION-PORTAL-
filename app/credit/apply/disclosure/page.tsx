'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/card';
import { Button } from '@/components/button';
import { LoanApplicationStepper } from '@/components/credit/LoanApplicationStepper';
import { formatCurrency } from '@/lib/utils';
import { mockLoanProducts } from '@/components/mock/data';

// Mock calculation – in real app would be from backend
const mockApplication = {
  productId: 'lp1',
  amount: 30000,
  tenor: 3,
  interestRate: 12,
  serviceFee: 500,
};

export default function LoanApplyDisclosurePage() {
  const router = useRouter();
  const [accepted, setAccepted] = useState(false);

  const product = mockLoanProducts.find((p) => p.id === mockApplication.productId);
  const totalInterest = (mockApplication.amount * mockApplication.interestRate / 100) * (mockApplication.tenor / 12);
  const totalCost = mockApplication.amount + totalInterest + (product?.serviceFee || 0);
  const monthlyPayment = totalCost / mockApplication.tenor;

  const steps = [
    { label: 'Amount & Tenor', state: 'complete' as const },
    { label: 'Affordability', state: 'complete' as const },
    { label: 'Guarantors', state: 'complete' as const },
    { label: 'Disclosure', state: 'current' as const },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accepted) return;
    router.push('/credit/apply/pending');
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-ink mb-6">Total Cost of Credit Disclosure</h1>
      <LoanApplicationStepper steps={steps} currentIndex={3} />
      <Card className="p-6 mt-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
            <div className="flex justify-between"><span>Principal Amount</span><span className="font-bold">{formatCurrency(mockApplication.amount, 'KES')}</span></div>
            <div className="flex justify-between"><span>Interest ({mockApplication.interestRate}% p.a.)</span><span className="font-bold">{formatCurrency(totalInterest, 'KES')}</span></div>
            <div className="flex justify-between"><span>Service Fee</span><span className="font-bold">{formatCurrency(product?.serviceFee || 0, 'KES')}</span></div>
            <div className="flex justify-between border-t pt-2 font-bold"><span>Total Cost of Credit</span><span>{formatCurrency(totalCost, 'KES')}</span></div>
            <div className="flex justify-between"><span>Monthly Payment ({mockApplication.tenor} months)</span><span>{formatCurrency(monthlyPayment, 'KES')}</span></div>
          </div>

          <div className="border-l-4 border-amber-400 p-3 bg-amber-50 text-sm">
            <p className="font-semibold text-amber-800">Important:</p>
            <p className="text-amber-700">You are about to enter a legally binding credit agreement. Please ensure you understand all terms and that you can afford the repayments.</p>
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
              className="h-4 w-4 text-sky-600"
            />
            I have read and understand the Total Cost of Credit and agree to the terms.
          </label>

          <Button
            variant="primary"
            type="submit"
            className="w-full"
            disabled={!accepted}
          >
            Submit Application
          </Button>
        </form>
      </Card>
    </div>
  );
}