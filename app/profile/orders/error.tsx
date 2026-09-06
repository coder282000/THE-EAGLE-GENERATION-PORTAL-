// app/profile/orders/error.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/button';

export default function OrdersError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    console.error('Orders page error:', error);
  }, [error]);

  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <div className="text-6xl mb-4">😵</div>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Could not load orders</h2>
      <p className="text-gray-600 mb-6">
        We're having trouble loading your orders. Please try again.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button variant="primary" onClick={reset}>
          Try Again
        </Button>
        <Button variant="secondary" onClick={() => router.push('/dashboard')}>
          Go to Dashboard
        </Button>
      </div>
    </div>
  );
}