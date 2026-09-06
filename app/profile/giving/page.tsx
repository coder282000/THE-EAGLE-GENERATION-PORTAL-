// app/profile/giving/page.tsx
'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { mockDonations, mockSupportPacks } from '@/components/mock/data';
import { Button } from '@/components/button';
import { formatCurrency } from '@/lib/utils';
import { cn } from '@/lib/utils';

// Mock current user ID (in a real app, this comes from auth)
const CURRENT_USER_ID = '1';

type StatusFilter = 'all' | 'pending' | 'success' | 'failed';

const STATUS_BADGE_STYLES = {
  pending: 'bg-yellow-100 text-yellow-800',
  success: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
};

const STATUS_LABELS = {
  pending: 'Pending',
  success: 'Completed',
  failed: 'Failed',
};

export default function GivingHistoryPage() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  // Filter donations for the current user
  const userDonations = useMemo(() => {
    const donations = mockDonations.filter((d) => d.userId === CURRENT_USER_ID);
    if (statusFilter !== 'all') {
      return donations.filter((d) => d.status === statusFilter);
    }
    return donations;
  }, [statusFilter]);

  // Sort by most recent first
  const sortedDonations = useMemo(() => {
    return [...userDonations].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [userDonations]);

  // Empty state
  if (sortedDonations.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">My Giving History</h1>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <div className="text-6xl mb-4">❤️</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No donations yet</h3>
          <p className="text-gray-500 mb-6">
            {statusFilter !== 'all'
              ? `You don't have any ${statusFilter} donations.`
              : "You haven't made any donations yet."}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {statusFilter !== 'all' && (
              <Button variant="secondary" onClick={() => setStatusFilter('all')}>
                View All
              </Button>
            )}
            <Link href="/giving">
              <Button variant="primary">Make a Donation</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const totalGiven = sortedDonations
    .filter((d) => d.status === 'success')
    .reduce((sum, d) => sum + d.amount, 0);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">My Giving History</h1>
          <p className="text-sm text-gray-500 mt-1">
            Total given: <span className="font-semibold text-gray-700">{formatCurrency(totalGiven, 'KES')}</span>
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Filter donations by status"
          >
            <option value="all">All Donations</option>
            <option value="pending">Pending</option>
            <option value="success">Completed</option>
            <option value="failed">Failed</option>
          </select>
          <Link href="/giving">
            <Button variant="primary" size="sm">Make a Donation</Button>
          </Link>
        </div>
      </div>

      <div className="space-y-4">
        {sortedDonations.map((donation) => {
          const pack = donation.supportPackId
            ? mockSupportPacks.find((p) => p.id === donation.supportPackId)
            : null;
          const statusColor = STATUS_BADGE_STYLES[donation.status];
          const statusLabel = STATUS_LABELS[donation.status];

          const date = new Date(donation.createdAt);
          const formattedDate = date.toLocaleDateString('en-KE', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          });

          return (
            <div
              key={donation.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-gray-900">
                      {formatCurrency(donation.amount, donation.currency)}
                    </span>
                    <span
                      className={cn(
                        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                        statusColor
                      )}
                    >
                      {statusLabel}
                    </span>
                  </div>
                  <div className="mt-1 text-sm text-gray-500">
                    {pack ? (
                      <>
                        <span className="font-medium text-gray-700">{pack.name}</span>
                        <span className="mx-1">•</span>
                        {pack.description}
                      </>
                    ) : (
                      'Custom donation'
                    )}
                    {donation.isAnonymous && (
                      <span className="ml-2 text-xs text-gray-400">(Anonymous)</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{formattedDate}</p>
                  {donation.message && (
                    <p className="text-sm text-gray-600 mt-2 italic">"{donation.message}"</p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  {donation.receiptUrl && donation.status === 'success' && (
                    <a
                      href={donation.receiptUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline"
                    >
                      Receipt
                    </a>
                  )}
                  {donation.status === 'pending' && (
                    <span className="text-sm text-yellow-600">Processing...</span>
                  )}
                  {donation.status === 'failed' && (
                    <span className="text-sm text-red-600">Failed</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}