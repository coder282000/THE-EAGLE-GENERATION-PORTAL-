'use client';

import { useState, useMemo } from 'react';
import { LoanProductCard } from '@/components/credit/LoanProductCard';
import { TextInput } from '@/components/input';
import { Select } from '@/components/select';
import { mockLoanProducts, mockKYCSubmissions, mockCircles } from '@/components/mock/data';

export default function CreditProductsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Mock current user data (Grace – ID '1')
  const userKyc = mockKYCSubmissions.find((k) => k.userId === '1');
  const userKycLevel = userKyc?.status === 'approved' ? (userKyc.tier === 'enhanced' ? 2 : 1) : 0;
  const userTier = 'PROFESSIONAL'; // mock
  const userSavingsBalance = mockCircles
    .filter((c) => c.memberIds.includes('1'))
    .reduce((sum, c) => sum + c.totalBalance, 0);

  const filtered = useMemo(() => {
    let result = mockLoanProducts;
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== 'ALL') {
      result = result.filter((p) => p.status === statusFilter);
    }
    return result;
  }, [search, statusFilter]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-ink">Loan Products</h1>
        <span className="text-sm text-gray-500">{filtered.length} products</span>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <TextInput
          id="search-products"
          label="Search products"
          placeholder="Search products..."
          value={search}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
          className="flex-1"
        />
        <Select
          id="status-filter"
          label="Status"
          value={statusFilter}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setStatusFilter(e.target.value)}
          options={[
            { value: 'ALL', label: 'All Status' },
            { value: 'ACTIVE', label: 'Active' },
            { value: 'PAUSED', label: 'Paused' },
            { value: 'ARCHIVED', label: 'Archived' },
          ]}
          className="w-full sm:w-40"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg">No loan products found.</p>
          <p className="text-sm">Try adjusting your search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((product) => (
            <LoanProductCard
              key={product.id}
              product={product}
              userKycLevel={userKycLevel}
              userTier={userTier}
              userSavingsBalance={userSavingsBalance}
            />
          ))}
        </div>
      )}
    </div>
  );
}