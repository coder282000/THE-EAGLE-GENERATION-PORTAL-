// app/checkout/mpesa/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/button';
import { formatCurrency } from '@/lib/utils';
import { useCart } from '@/context/CartContext';

export default function MpesaWaitPage() {
  const router = useRouter();
  const { totalPrice } = useCart();
  const [status, setStatus] = useState<'waiting' | 'success' | 'failed'>('waiting');
  const [countdown, setCountdown] = useState(30);

  useEffect(() => {
    // Simulate STK push and polling
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Simulate random outcome: 80% success, 20% failure
          const success = Math.random() < 0.8;
          setStatus(success ? 'success' : 'failed');
          if (success) {
            // Redirect to success after 1.5s
            setTimeout(() => router.push('/checkout/success'), 1500);
          } else {
            // Redirect to failed after 1.5s
            setTimeout(() => router.push('/checkout/failed'), 1500);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  if (status === 'success') {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="text-6xl mb-4">✅</div>
        <h2 className="text-2xl font-bold text-green-600 mb-2">Payment Successful!</h2>
        <p className="text-gray-600">Redirecting to your order confirmation...</p>
      </div>
    );
  }

  if (status === 'failed') {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="text-6xl mb-4">❌</div>
        <h2 className="text-2xl font-bold text-red-600 mb-2">Payment Failed</h2>
        <p className="text-gray-600">Redirecting to try again...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16 max-w-md">
      <div className="bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="text-6xl mb-4">📱</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">M-Pesa STK Push</h2>
        <p className="text-gray-600 mb-4">
          Please check your phone and enter your M-Pesa PIN to complete payment.
        </p>
        <div className="bg-blue-50 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-600">Amount</p>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalPrice, 'KES')}</p>
        </div>
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-sm text-gray-500">Waiting for confirmation... ({countdown}s)</p>
        </div>
        <Button
          variant="secondary"
          className="mt-6"
          onClick={() => router.push('/checkout')}
        >
          Cancel & Return
        </Button>
      </div>
    </div>
  );
}