'use client';

import { useState } from 'react';
import { Card } from '@/components/card';
import { Button } from '@/components/button';
import { Select } from '@/components/select';
import { LoanStatusBadge } from '@/components/credit/LoanStatusBadge';
import { formatCurrency } from '@/lib/utils';
import { mockGuarantees, mockLoanApplications, mockMembers } from '@/components/mock/data';

export default function GuarantorRequestsPage() {
  const [filter, setFilter] = useState('ALL');

  // For demo, assume current user is Grace (id '1') as guarantor
  const requests = mockGuarantees.filter((g) => g.guarantorId === '1');
  const filtered = filter === 'ALL' ? requests : requests.filter((g) => g.status === filter);

  const handleDecision = async (id: string, accept: boolean) => {
    // Mock decision
    alert(`Guarantee ${id} ${accept ? 'accepted' : 'declined'} (mock)`);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-ink">Guarantor Requests</h1>
      <div className="flex flex-col sm:flex-row gap-3">
        <Select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          options={[
            { value: 'ALL', label: 'All' },
            { value: 'PENDING', label: 'Pending' },
            { value: 'ACTIVE', label: 'Active' },
            { value: 'RELEASED', label: 'Released' },
            { value: 'CALLED', label: 'Called' },
          ]}
          className="w-full sm:w-40"
        />
      </div>

      {filtered.length === 0 ? (
        <Card className="p-8 text-center text-gray-500">
          <p>No guarantor requests.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filtered.map((g) => {
            const app = mockLoanApplications.find((a) => a.id === g.loanId);
            const borrower = mockMembers.find((m) => m.id === g.borrowerId);
            return (
              <Card key={g.id} className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-ink">Guarantee for {borrower?.firstName} {borrower?.lastName}</p>
                    <p className="text-sm text-gray-500">Amount: {formatCurrency(g.amount, 'KES')}</p>
                    <p className="text-sm text-gray-500">Requested: {new Date(g.createdAt).toLocaleDateString()}</p>
                    <div className="mt-1"><LoanStatusBadge status={g.status} /></div>
                  </div>
                  {g.status === 'PENDING' && (
                    <div className="flex gap-2">
                      <Button variant="primary" size="sm" onClick={() => handleDecision(g.id, true)}>Accept</Button>
                      <Button variant="outline" size="sm" onClick={() => handleDecision(g.id, false)}>Decline</Button>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}