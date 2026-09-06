// components/orders/OrderCard.tsx
import React from 'react';
import Link from 'next/link';
import { Order } from '@/components/mock/data';
import { formatCurrency } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface OrderCardProps {
  order: Order;
}

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800',
  paid: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  refunded: 'bg-gray-100 text-gray-800',
};

const STATUS_LABELS = {
  pending: 'Pending',
  paid: 'Paid',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  refunded: 'Refunded',
};

export const OrderCard: React.FC<OrderCardProps> = ({ order }) => {
  const statusColor = STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-800';
  const statusLabel = STATUS_LABELS[order.status] || order.status;

  const orderDate = new Date(order.createdAt);
  const formattedDate = orderDate.toLocaleDateString('en-KE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <Link href={`/profile/orders/${order.id}`} className="block">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3">
              <span className="font-mono text-sm font-medium text-gray-900">
                {order.id}
              </span>
              <span className={cn(
                'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                statusColor
              )}>
                {statusLabel}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {order.items.length} item{order.items.length > 1 ? 's' : ''} • {formattedDate}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-lg font-bold text-gray-900">
              {formatCurrency(order.total, order.currency)}
            </span>
            <span className="text-sm text-blue-600 hover:underline">
              View Details →
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};