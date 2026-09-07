"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from './hooks/useWallet';
import { BalanceCard } from '@/components/BalanceCard';
import { AssetList } from '@/components/AssetList';
import { QuickActions } from '@/components/QuickActions';
import { RecentTransactions } from '@/components/RecentTransactions';
import { KYCStatus } from '@/components/KycStatus';
import { Button } from '@/components/button';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { mockKYCStatus } from '@/components/mock/data';

export default function WalletPage() {
  const router = useRouter();
  const { data, isLoading, error, refetch } = useWallet();

  // Loading state
  if (isLoading) {
    return <WalletLoading />;
  }

  // Error state
  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
          <h2 className="text-lg font-semibold text-red-700">Unable to load wallet</h2>
          <p className="text-sm text-red-600 mt-1">{error.message}</p>
          <Button variant="primary" className="mt-4" onClick={refetch}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  // Empty state (no balances)
  if (!data || data.balances.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <div className="bg-paper rounded-lg border border-dashed border-ink/20 p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-sky/10 flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">💰</span>
          </div>
          <h2 className="text-xl font-semibold text-ink">Your wallet is empty</h2>
          <p className="text-ink/60 mt-2 max-w-md mx-auto">
            Deposit to get started with USDT on TRC20, ERC20, or BEP20.
          </p>
          <Button variant="primary" className="mt-6" onClick={() => router.push("/wallet/deposit")}>
            Deposit Now
          </Button>
        </div>
        <KYCStatus kyc={data?.kyc ?? mockKYCStatus} />
      </div>
    );
  }

  // Populated state
  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-ink">Wallet</h1>
        <Button variant="ghost" size="sm" onClick={refetch} className="text-ink/40">
          <RefreshCw className="w-4 h-4" />
          <span className="sr-only">Refresh</span>
        </Button>
      </div>

      {/* Total Balance */}
      <BalanceCard totalBalanceUsd={data.totalBalanceUsd} />

      {/* Quick Actions */}
      <QuickActions />

      {/* Asset List */}
      <AssetList balances={data.balances} />

      {/* KYC Status */}
      <KYCStatus kyc={data.kyc} />

      {/* Recent Transactions */}
      <RecentTransactions transactions={data.transactions} limit={5} />
    </div>
  );
}

// Loading skeleton component
function WalletLoading() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6 animate-pulse">
      <div className="h-8 w-32 bg-paper rounded" />
      <div className="h-32 w-full bg-paper rounded" />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-10 bg-paper rounded" />
        ))}
      </div>
      <div className="space-y-3">
        <div className="h-6 w-24 bg-paper rounded" />
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-16 bg-paper rounded" />
        ))}
      </div>
      <div className="h-20 bg-paper rounded" />
      <div className="space-y-3">
        <div className="h-6 w-32 bg-paper rounded" />
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-14 bg-paper rounded" />
        ))}
      </div>
    </div>
  );
}