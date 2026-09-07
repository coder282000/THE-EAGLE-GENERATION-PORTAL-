'use client';

import { Card } from '@/components/card';
import { formatCurrency } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface BalanceCardProps {
  totalBalanceUsd: number;
  className?: string;
}

export function BalanceCard({ totalBalanceUsd, className }: BalanceCardProps) {
  const formatted = formatCurrency(totalBalanceUsd, 'USD');

  return (
    <Card className={cn('p-6 bg-gradient-to-br from-sky-50 to-white border-sky-200', className)}>
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium text-ink/60">Total Balance</p>
        <p className="text-3xl font-bold text-ink tracking-tight" aria-live="polite">
          {formatted}
        </p>
        <p className="text-xs text-ink/40">≈ KES {(totalBalanceUsd * 150).toLocaleString()}</p>
        {/* Approximate exchange rate; in production, fetch live rate */}
      </div>
    </Card>
  );
}