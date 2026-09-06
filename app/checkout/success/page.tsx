'use client';
// app/checkout/success/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/button';
import { formatCurrency } from '@/lib/utils';
import { useCart } from '@/context/CartContext';

export default function OrderSuccessPage() {
  const router = useRouter();
  const { totalItems, totalPrice, clearCart } = useCart();
  const [orderNumber] = useState(() => `ORD-${Math.floor(100000 + Math.random() * 900000)}`);
  const [summary] = useState({ items: totalItems, total: totalPrice });

  useEffect(() => {
    // Clear the cart after successful order
    clearCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="container mx-auto px-4 py-16 max-w-2xl">
      <div className="bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="text-6xl mb-4">✅</div>
        <h2 className="text-3xl font-bold text-green-600 mb-2">Order Placed Successfully!</h2>
        <p className="text-gray-600 mb-6">Thank you for your order. Your confirmation number is:</p>
        <p className="text-2xl font-mono text-blue-600 bg-blue-50 py-2 px-4 rounded-lg inline-block mb-6">
          {orderNumber}
        </p>

        <div className="bg-gray-50 rounded-lg p-6 text-left mb-8">
          <h3 className="font-semibold text-gray-900 mb-3">Order Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Items</span>
              <span className="font-medium">{summary.items}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total</span>
              <span className="font-bold">{formatCurrency(summary.total, 'KES')}</span>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-3">
            A confirmation email has been sent to your inbox.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/profile/orders">
            <Button variant="primary">View My Orders</Button>
          </Link>
          <Link href="/shop">
            <Button variant="secondary">Continue Shopping</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
