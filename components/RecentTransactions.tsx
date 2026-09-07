"use client";

import { Card } from '@/components/card';
import { Button } from '@/components/button';
import { formatCurrency } from '@/lib/utils';
import { WalletTransaction } from '@/components/mock/data';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

interface RecentTransactionsProps {
  transactions: WalletTransaction[];
  limit?: number;
}

const statusConfig = {
  PENDING: { label: 'Pending', className: 'bg-clay/20 text-clay' },
  CONFIRMING: { label: 'Confirming', className: 'bg-sky/20 text-sky' },
  CONFIRMED: { label: 'Confirmed', className: 'bg-green-100 text-green-700' },
  FAILED: { label: 'Failed', className: 'bg-red-100 text-red-700' },
  REJECTED: { label: 'Rejected', className: 'bg-red-100 text-red-700' },
};

const typeIcon = {
  DEPOSIT: '↓',
  WITHDRAWAL: '↑',
  TRANSFER_IN: '←',
  TRANSFER_OUT: '→',
  OTC_BUY: '🔄',
  OTC_SELL: '🔄',
};

export function RecentTransactions({ transactions, limit = 5 }: RecentTransactionsProps) {
  const router = useRouter();
  const recent = transactions.slice(0, limit);

  if (recent.length === 0) {
    return (
      <Card className="p-6 text-center">
        <p className="text-ink/60">No recent transactions.</p>
        <Button variant="outline" className="mt-3" onClick={() => router.push("/wallet/transactions")}>
          View all
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-ink">Recent Transactions</h2>
        <Button variant="ghost" size="sm" onClick={() => router.push("/wallet/transactions")}>
          See all
        </Button>
      </div>
      <div className="space-y-2">
        {recent.map((tx) => {
          const status = statusConfig[tx.status] || { label: tx.status, className: '' };
          const icon = typeIcon[tx.type] || '•';
          const amount = tx.type === 'WITHDRAWAL' || tx.type === 'TRANSFER_OUT' || tx.type === 'OTC_SELL'
            ? `-${formatCurrency(tx.amount, 'USD')}`
            : `+${formatCurrency(tx.amount, 'USD')}`;
          const isPositive = !amount.startsWith('-');

          return (
            <Card key={tx.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-paper flex items-center justify-center text-ink/70 text-sm">
                  {icon}
                </div>
                <div>
                  <p className="font-medium text-ink text-sm capitalize">
                    {tx.type.replace('_', ' ').toLowerCase()}
                  </p>
                  <p className="text-xs text-ink/40">
                    {new Date(tx.timestamp).toLocaleString()}
                    {tx.counterparty && ` · ${tx.counterparty}`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={cn('font-semibold', isPositive ? 'text-green-600' : 'text-red-600')}>
                  {amount}
                </span>
                <span className={cn('text-xs px-2 py-0.5 rounded-full', status.className)}>
                  {status.label}
                </span>
                <Button variant="ghost" size="sm" className="text-ink/40" onClick={() => router.push(`/wallet/transactions/${tx.id}`)}>
                  Detail
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}