'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Card } from '@/components/card';
import { Button } from '@/components/button';
import { TextInput } from '@/components/input';
import { Select } from '@/components/select';
import { LoanStatusBadge } from '@/components/credit/LoanStatusBadge';
import { formatCurrency } from '@/lib/utils';
import { mockLoans } from '@/components/mock/data';

export default function MyLoansPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filtered = useMemo(() => {
    let result = mockLoans;
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((l) => l.id.toLowerCase().includes(q));
    }
    if (statusFilter !== 'ALL') {
      result = result.filter((l) => l.status === statusFilter);
    }
    return result;
  }, [search, statusFilter]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-ink">My Loans</h1>
        <Link href="/credit">
          <Button variant="primary" size="sm">Apply for a Loan</Button>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <TextInput
          id="search-loans"
          label="Search loans"
          placeholder="Search loans..."
          value={search}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setSearch(e.target.value)
          }
          className="flex-1"
        />
        <Select
          id="loan-status-filter"
          label="Status"
          value={statusFilter}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
            setStatusFilter(e.target.value)
          }
          options={[
            { value: 'ALL', label: 'All Status' },
            { value: 'ACTIVE', label: 'Active' },
            { value: 'PAID', label: 'Paid' },
            { value: 'DEFAULTED', label: 'Defaulted' },
            { value: 'RESTRUCTURED', label: 'Restructured' },
          ]}
          className="w-full sm:w-40"
        />
      </div>

      {filtered.length === 0 ? (
        <Card className="p-8 text-center text-gray-500">
          <p>You have no loans.</p>
          <Link href="/credit">
            <Button variant="primary" className="mt-4">Browse Loan Products</Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-4">
          {filtered.map((loan) => (
            <Link key={loan.id} href={`/credit/my-loans/${loan.id}`}>
              <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-ink">Loan #{loan.id.slice(0, 8)}</p>
                    <p className="text-sm text-gray-500">Disbursed: {new Date(loan.disbursedAt).toLocaleDateString()}</p>
                  </div>
                  <LoanStatusBadge status={loan.status} />
                </div>
                <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                  <div><span className="text-gray-500">Principal</span> {formatCurrency(loan.principal, 'KES')}</div>
                  <div><span className="text-gray-500">Outstanding</span> {formatCurrency(loan.outstandingBalance, 'KES')}</div>
                  <div><span className="text-gray-500">Next Due</span> {new Date(loan.nextDueDate).toLocaleDateString()}</div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}