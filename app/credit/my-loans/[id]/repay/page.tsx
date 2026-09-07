'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { Card } from '@/components/card';
import { Button } from '@/components/button';
import { TextInput } from '@/components/input';
import { Select } from '@/components/select';
import { formatCurrency } from '@/lib/utils';
import { mockLoans } from '@/components/mock/data';

export default function LoanRepaymentPage() {
  const { id } = useParams();
  const router = useRouter();
  const loan = mockLoans.find((l) => l.id === id);
  const [amount, setAmount] = useState(loan?.repayments?.[0]?.amount || 0);
  const [method, setMethod] = useState('M-PESA');
  const [loading, setLoading] = useState(false);

  if (!loan) {
    return <div className="text-center py-12 text-gray-500">Loan not found.</div>;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setLoading(false);
    router.push(`/credit/my-loans/${id}`);
  };

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-ink mb-6">Make a Repayment</h1>
      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-sm text-gray-500">Loan Outstanding</p>
            <p className="text-xl font-bold">{formatCurrency(loan.outstandingBalance, 'KES')}</p>
          </div>
          <TextInput
            id="repayment-amount"
            label="Amount (KES)"
            type="number"
            required
            value={amount}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setAmount(Number(e.target.value))
            }
            max={loan.outstandingBalance}
          />
          <Select
            id="payment-method"
            label="Payment Method"
            value={method}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              setMethod(e.target.value)
            }
            options={[
              { value: 'M-PESA', label: 'M-PESA' },
              { value: 'BANK', label: 'Bank Transfer' },
              { value: 'WALLET', label: 'Wallet Balance' },
            ]}
          />
          <Button
            variant="primary"
            type="submit"
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Processing...' : 'Submit Payment'}
          </Button>
        </form>
      </Card>
    </div>
  );
}