'use client';

import { Card } from '@/components/card';
import { Button } from '@/components/button';
import { formatCurrency, cn } from '@/lib/utils';
import { KYCStatus as KYCType } from '@/components/mock/data';
import { useRouter } from 'next/navigation';

interface KYCStatusProps {
  kyc: KYCType;
}

export function KYCStatus({ kyc }: KYCStatusProps) {
  const router = useRouter();

  const tierLabels: Record<number, string> = {
    0: 'Unverified',
    1: 'Basic',
    2: 'Full',
  };

  const tierColors: Record<number, string> = {
    0: 'bg-red-100 text-red-700',
    1: 'bg-clay/20 text-clay',
    2: 'bg-green-100 text-green-700',
  };

  const remaining = kyc.dailyLimit - kyc.dailyUsed;
  const percentUsed = Math.min((kyc.dailyUsed / kyc.dailyLimit) * 100, 100);

  if (kyc.tier === 0) {
    return (
      <Card className="p-4 border-clay/30 bg-clay/5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="font-semibold text-ink">KYC Required</p>
            <p className="text-sm text-ink/60">Complete verification to unlock wallet features.</p>
          </div>
          <Button variant="primary" onClick={() => router.push('/profile/verification')}>
            Verify Now
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', tierColors[kyc.tier])}>
              {tierLabels[kyc.tier]}
            </span>
            <span className="text-sm text-ink/60">Daily Limit</span>
          </div>
          <p className="text-sm font-medium text-ink">
            {formatCurrency(remaining, 'USD')} remaining
          </p>
          <div className="w-full max-w-xs h-1.5 bg-paper rounded-full mt-1">
            <div
              className="h-1.5 rounded-full bg-sky"
              style={{ width: `${percentUsed}%` }}
            />
          </div>
        </div>
        <div className="text-xs text-ink/40">
          Used {formatCurrency(kyc.dailyUsed, 'USD')} of {formatCurrency(kyc.dailyLimit, 'USD')}
        </div>
      </div>
    </Card>
  );
}