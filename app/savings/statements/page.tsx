'use client';

import { useState } from 'react';
import { Card } from '@/components/card';
import { TextInput } from '@/components/input';
import { Select } from '@/components/select';
import LedgerTable from '@/components/savings/LedgerTable'; // Changed to default import
import { mockContributions, mockPayouts, mockCircles } from '@/components/mock/data';

export default function StatementsPage() {
  const [circleFilter, setCircleFilter] = useState('ALL');
  const allEntries = [
    ...mockContributions.map((c) => ({
      id: c.id,
      date: c.createdAt,
      description: `Contribution to ${mockCircles.find((cir) => cir.id === c.circleId)?.name || 'Circle'}`,
      amount: c.amount,
      currency: c.currency,
      type: 'CREDIT' as const,
      status: c.status,
    })),
    ...mockPayouts.map((p) => ({
      id: p.id,
      date: p.createdAt,
      description: `Payout from ${mockCircles.find((cir) => cir.id === p.circleId)?.name || 'Circle'}`,
      amount: p.amount,
      currency: p.currency,
      type: 'DEBIT' as const,
      status: p.status,
    })),
  ];

  const filtered = circleFilter === 'ALL'
    ? allEntries
    : allEntries.filter((e) => {
        const circle = mockCircles.find((c) => c.id === circleFilter);
        return e.description.includes(circle?.name || '');
      });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-ink">Contribution History & Statements</h1>
      <div className="flex flex-col sm:flex-row gap-3">
        <Select
          id="circle-filter"
          label="Filter by Circle"
          value={circleFilter}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setCircleFilter(e.target.value)}
          options={[
            { value: 'ALL', label: 'All Circles' },
            ...mockCircles.map((c) => ({ value: c.id, label: c.name })),
          ]}
          className="w-full sm:w-64"
        />
      </div>
      <Card className="p-4">
        <LedgerTable entries={filtered} currency="KES" title="All Transactions" />
      </Card>
    </div>
  );
}