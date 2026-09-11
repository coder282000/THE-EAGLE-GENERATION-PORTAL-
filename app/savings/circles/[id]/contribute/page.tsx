'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { Card } from '@/components/card';
import { Button } from '@/components/button';
import { TextInput } from '@/components/input';
import { Select } from '@/components/select';
import { mockCircles } from '@/components/mock/data';
import { formatCurrency } from '@/lib/utils';

export default function ContributePage() {
  const { id } = useParams();
  const router = useRouter();
  const circle = mockCircles.find((c) => c.id === id);
  const [amount, setAmount] = useState(circle?.contributionAmount || 0);
  const [method, setMethod] = useState('M-PESA');
  const [loading, setLoading] = useState(false);

  if (!circle) {
    return <div className="text-center py-12 text-ink/50">Circle not found.</div>;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setLoading(false);
    router.push(`/savings/circles/${id}`);
  };

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-ink mb-6">Contribute to {circle.name}</h1>
      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-paper p-3 rounded-lg">
            <p className="text-sm text-ink/50">Expected Contribution</p>
            <p className="text-xl font-bold">{formatCurrency(circle.contributionAmount, circle.currency)}</p>
          </div>
          <TextInput
            id="contribution-amount"
            label="Amount (KES)"
            type="number"
            required
            value={amount}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setAmount(Number(e.target.value))
            }
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
            {loading ? 'Submitting...' : 'Submit Contribution'}
          </Button>
        </form>
      </Card>
    </div>
  );
}