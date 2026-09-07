'use client';

import Link from 'next/link';
import { Card } from '@/components/card';
import { Button } from '@/components/button';

export default function LoanApplyPendingPage() {
  return (
    <div className="max-w-lg mx-auto text-center">
      <Card className="p-8">
        <div className="text-5xl mb-4">📨</div>
        <h1 className="text-2xl font-bold text-ink">Application Submitted</h1>
        <p className="text-gray-600 mt-2">
          Your loan application has been received and is under review.
        </p>
        <div className="mt-4 bg-gray-50 p-3 rounded-lg text-sm">
          <p className="font-medium">Reference: <span className="font-mono">LN-2026-0042</span></p>
          <p className="text-gray-500">You will be notified when a decision is made.</p>
        </div>
        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/credit/my-loans">
            <Button variant="primary">View My Loans</Button>
          </Link>
          <Link href="/credit">
            <Button variant="outline">Browse Other Products</Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}