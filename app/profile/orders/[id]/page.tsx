'use client';
// app/profile/orders/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { notFound, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { mockOrders, Order } from '@/components/mock/data';
import { Button } from '@/components/button';
import { formatCurrency, cn } from '@/lib/utils';

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

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API fetch
    const found = mockOrders.find((o) => o.id === orderId);
    setTimeout(() => {
      if (found) {
        setOrder(found);
      } else {
        notFound();
      }
      setLoading(false);
    }, 500);
  }, [orderId]);

  if (loading) {
    return <OrderDetailLoading />;
  }

  if (!order) {
    return notFound();
  }

  const statusColor = STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-800';
  const statusLabel = STATUS_LABELS[order.status] || order.status;

  const orderDate = new Date(order.createdAt);
  const formattedDate = orderDate.toLocaleDateString('en-KE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const formattedTime = orderDate.toLocaleTimeString('en-KE', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadReceipt = () => {
    // Mock download – just alert for now
    alert('Receipt download would start here. In production, this would generate a PDF.');
  };

  return (
    <div className="container mx-auto px-4 py-8 print:py-4">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-6 print:hidden">
        <Link href="/profile/orders" className="hover:text-blue-600">
          My Orders
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-700">Order {order.id}</span>
      </nav>

      {/* Order Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Order {order.id}
          </h1>
          <p className="text-sm text-gray-500">
            Placed on {formattedDate} at {formattedTime}
          </p>
        </div>
        <div className="flex items-center gap-3 print:hidden">
          <span className={cn(
            'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium',
            statusColor
          )}>
            {statusLabel}
          </span>
          <Button variant="secondary" size="sm" onClick={handlePrint}>
            🖨️ Print
          </Button>
          <Button variant="secondary" size="sm" onClick={handleDownloadReceipt}>
            📄 Receipt
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content - Items */}
        <div className="lg:col-span-2 space-y-6">
          {/* Items List */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h2 className="font-semibold text-gray-900">Order Items</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {order.items.map((item, index) => (
                <div key={index} className="p-4 flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900">{item.productName}</p>
                    {item.variant && (
                      <p className="text-sm text-gray-500">Variant: {item.variant}</p>
                    )}
                    <p className="text-sm text-gray-500">
                      {item.quantity} × {formatCurrency(item.price, order.currency)}
                    </p>
                  </div>
                  <div className="font-semibold text-gray-900">
                    {formatCurrency(item.total, order.currency)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Timeline (mock) */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 print:hidden">
            <h2 className="font-semibold text-gray-900 mb-3">Order Status Timeline</h2>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center text-xs">✓</div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Order Placed</p>
                  <p className="text-xs text-gray-500">{formattedDate}</p>
                </div>
              </div>
              {order.status !== 'pending' && (
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center text-xs">✓</div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Payment Confirmed</p>
                    <p className="text-xs text-gray-500">{formattedDate}</p>
                  </div>
                </div>
              )}
              {order.status === 'shipped' && (
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs">⏳</div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Shipped</p>
                    <p className="text-xs text-gray-500">In transit</p>
                  </div>
                </div>
              )}
              {order.status === 'delivered' && (
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center text-xs">✓</div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Delivered</p>
                    <p className="text-xs text-gray-500">Delivered to your address</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar - Summary */}
        <div className="lg:col-span-1">
          <div className="bg-gray-50 rounded-lg p-6 sticky top-24">
            <h2 className="font-semibold text-gray-900 mb-4">Order Summary</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="text-gray-900 font-medium">
                  {formatCurrency(order.subtotal, order.currency)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span className="text-gray-900 font-medium">
                  {formatCurrency(order.shipping, order.currency)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tax</span>
                <span className="text-gray-900 font-medium">
                  {formatCurrency(order.tax, order.currency)}
                </span>
              </div>
            </div>
            <hr className="my-4" />
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span>{formatCurrency(order.total, order.currency)}</span>
            </div>

            <div className="mt-6 space-y-3 text-sm">
              <div>
                <p className="text-gray-500">Payment Method</p>
                <p className="font-medium text-gray-900 capitalize">
                  {order.paymentMethod.replace('_', ' ')}
                </p>
              </div>
              {order.paymentReference && (
                <div>
                  <p className="text-gray-500">Reference</p>
                  <p className="font-mono text-xs text-gray-900 break-all">
                    {order.paymentReference}
                  </p>
                </div>
              )}
              <div>
                <p className="text-gray-500">Shipping Address</p>
                <p className="text-sm text-gray-900">
                  {order.shippingAddress.line1}
                  {order.shippingAddress.line2 && (
                    <>, {order.shippingAddress.line2}</>
                  )}
                  <br />
                  {order.shippingAddress.city}, {order.shippingAddress.county}
                  <br />
                  {order.shippingAddress.postalCode}, {order.shippingAddress.country}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 space-y-2 print:hidden">
              <Button
                variant="primary"
                className="w-full"
                onClick={() => router.push('/shop')}
              >
                Continue Shopping
              </Button>
              {order.status === 'pending' && (
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={() => alert('This would cancel the order')}
                >
                  Cancel Order
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Loading component
function OrderDetailLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 w-32 bg-gray-200 rounded mt-2 animate-pulse"></div>
        </div>
        <div className="h-8 w-24 bg-gray-200 rounded-full animate-pulse"></div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-4"></div>
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 py-3 border-t border-gray-200">
                <div className="flex-1">
                  <div className="h-5 w-40 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 w-24 bg-gray-200 rounded mt-1 animate-pulse"></div>
                </div>
                <div className="h-5 w-20 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
        <div className="lg:col-span-1">
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="h-10 bg-gray-200 rounded animate-pulse mt-6"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
