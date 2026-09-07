'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { Card } from '@/components/card';
import { Button } from '@/components/button';
import { Textarea } from '@/components/textarea';
import { formatCurrency } from '@/lib/utils';
import { mockLoans } from '@/components/mock/data';

export default function ArrearsRestructurePage() {
  const { id } = useParams();
  const router = useRouter();
  const loan = mockLoans.find((l) => l.id === id);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  if (!loan) {
    return <div className="text-center py-12 text-gray-500">Loan not found.</div>;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setLoading(false);
    router.push(`/credit/my-loans/${id}`);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-ink mb-6">Arrears Notice & Restructure Request</h1>
      <Card className="p-6">
        <div className="bg-red-50 p-4 rounded-lg border border-red-200 mb-4">
          <p className="font-semibold text-red-800">⚠️ Your loan is in arrears.</p>
          <p className="text-sm text-red-700">
            Outstanding balance: {formatCurrency(loan.outstandingBalance, 'KES')}
          </p>
          <p className="text-sm text-red-700">
            Please contact support or request a restructure to avoid further penalties.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            id="restructure-reason"
            label="Reason for Restructure Request"
            placeholder="Describe your situation and why you need a restructure..."
            rows={5}
            required
            value={reason}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setReason(e.target.value)}
          />
          <div className="flex gap-3">
            <Button
              variant="primary"
              type="submit"
              disabled={loading}
              className="flex-1"
            >
              {loading ? 'Submitting...' : 'Submit Request'}
            </Button>
            <Button
              variant="outline"
              type="button"
              onClick={() => router.back()}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}