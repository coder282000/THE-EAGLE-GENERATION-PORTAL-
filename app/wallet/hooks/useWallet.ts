'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  mockWalletBalances,
  mockWalletTransactions,
  mockKYCStatus,
  type WalletBalance,
  type WalletTransaction,
  type KYCStatus,
} from '@/components/mock/data';

interface WalletData {
  balances: WalletBalance[];
  transactions: WalletTransaction[];
  kyc: KYCStatus;
  totalBalanceUsd: number;
}

interface UseWalletReturn {
  data: WalletData | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useWallet(): UseWalletReturn {
  const [data, setData] = useState<WalletData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Calculate total in USD (convert cents to dollars for display)
      const total = mockWalletBalances.reduce(
        (sum, b) => sum + b.available + b.pending,
        0
      );

      setData({
        balances: mockWalletBalances,
        transactions: mockWalletTransactions,
        kyc: mockKYCStatus,
        totalBalanceUsd: total,
      });
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load wallet'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { data, isLoading, error, refetch: fetchData };
}