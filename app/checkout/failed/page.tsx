'use client';
// app/checkout/failed/page.tsx

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/button';

export default function OrderFailedPage() {
  const router = useRouter();

  return (
    <div className="container mx-auto px-4 py-16 max-w-md">
      <div className="bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="text-6xl mb-4">😞</div>
        <h2 className="text-2xl font-bold text-red-600 mb-2">Payment Failed</h2>
        <p className="text-gray-600 mb-4">
          We couldn't process your payment. This could be due to insufficient funds, an incorrect PIN, or a network error.
        </p>
        <div className="bg-red-50 rounded-lg p-4 mb-6 text-sm text-red-700">
          <p>💡 Please check your balance and try again.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button variant="primary" onClick={() => router.push('/checkout')}>
            Try Again
          </Button>
          <Link href="/cart">
            <Button variant="secondary">Return to Cart</Button>
          </Link>
        </div>
        <div className="mt-4">
          <Link href="/help/support" className="text-sm text-blue-600 hover:underline">
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  );
}
