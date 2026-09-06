'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/button';

export default function PendingError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    console.error('Pending page error:', error);
  }, [error]);

  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <div className="text-6xl mb-4">😵</div>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Something went wrong</h2>
      <p className="text-gray-600 mb-6">Could not load pending status.</p>
      <Button variant="primary" onClick={reset}>Try Again</Button>
    </div>
  );
}