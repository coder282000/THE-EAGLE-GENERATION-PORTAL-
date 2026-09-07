'use client';

import { Card } from '@/components/card';
import { Button } from '@/components/button';
import { formatCurrency } from '@/lib/utils';
import { WalletBalance } from '@/components/mock/data';
import { useRouter } from 'next/navigation';

interface AssetListProps {
  balances: WalletBalance[];
}

export function AssetList({ balances }: AssetListProps) {
  const router = useRouter();

  if (balances.length === 0) {
    return (
      <Card className="p-6 text-center">
        <p className="text-ink/60">No assets found.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-ink">Assets</h2>
      {balances.map((balance) => {
        const available = formatCurrency(balance.available, 'USD');
        const pending = balance.pending > 0 ? formatCurrency(balance.pending, 'USD') : null;

        return (
          <Card key={`${balance.asset}-${balance.network}`} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-sky-100 flex items-center justify-center text-sky-700 font-bold text-sm">
                {balance.asset.slice(0, 2)}
              </div>
              <div>
                <p className="font-semibold text-ink">{balance.asset}</p>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-ink/60">{balance.network}</span>
                  {pending && (
                    <span className="text-xs text-clay font-medium">Pending: {pending}</span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 sm:ml-auto">
              <span className="font-bold text-ink text-lg">{available}</span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`/wallet/deposit?asset=${balance.asset}&network=${balance.network}`)}
                >
                  Receive
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => router.push(`/wallet/withdraw?asset=${balance.asset}&network=${balance.network}`)}
                >
                  Send
                </Button>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}