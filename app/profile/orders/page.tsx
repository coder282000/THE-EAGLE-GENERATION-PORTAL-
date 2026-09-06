// app/profile/orders/page.tsx
'use client';

import React, { useState, useMemo } from 'react';
import { mockOrders } from '@/components/mock/data';
import { Order } from '@/components/mock/data';
import { OrderCard } from '@/components/orders/OrderCard';
import { Button } from '@/components/button';
import { SelectInput } from '@/components/input';

type StatusFilter = 'all' | 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';

const STATUS_FILTERS = [
  { value: 'all', label: 'All Orders' },
  { value: 'pending', label: 'Pending' },
  { value: 'paid', label: 'Paid' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'refunded', label: 'Refunded' },
];

export default function OrdersPage() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const filteredOrders = useMemo(() => {
    let result = mockOrders;
    if (statusFilter !== 'all') {
      result = result.filter((order) => order.status === statusFilter);
    }
    // Sort by newest first
    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [statusFilter]);

  // Empty state
  if (filteredOrders.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">My Orders</h1>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <div className="text-6xl mb-4">📦</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No orders found</h3>
          <p className="text-gray-500 mb-6">
            {statusFilter !== 'all'
              ? `You don't have any ${statusFilter} orders.`
              : "You haven't placed any orders yet."}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {statusFilter !== 'all' && (
              <Button variant="secondary" onClick={() => setStatusFilter('all')}>
                View All Orders
              </Button>
            )}
            <Button variant="primary" onClick={() => window.location.href = '/shop'}>
              Start Shopping
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">My Orders</h1>
        <div className="sm:w-48">
          <SelectInput
            id="statusFilter"
            label="Status"
            value={statusFilter}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setStatusFilter(e.target.value as StatusFilter)}
            options={STATUS_FILTERS}
            aria-label="Filter orders by status"
          />
        </div>
      </div>

      <div className="space-y-4">
        {filteredOrders.map((order) => (
          <OrderCard key={order.id} order={order} />
        ))}
      </div>

      <div className="mt-4 text-sm text-gray-500">
        Showing {filteredOrders.length} order{filteredOrders.length > 1 ? 's' : ''}
      </div>
    </div>
  );
}
