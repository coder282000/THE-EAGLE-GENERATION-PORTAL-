"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card } from "@/components/card";
import { Button } from "@/components/button";
import { TextInput } from "@/components/input";
import { Select} from "@/components/select";
import { mockWalletTransactions } from "@/components/mock/data";
import { formatCurrency, cn } from "@/lib/utils";
import Link from "next/link";
import {
  ArrowDown,
  ArrowUp,
  Send,
  RefreshCw,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Calendar,
} from "lucide-react";

type TransactionType =
  | "DEPOSIT"
  | "WITHDRAWAL"
  | "TRANSFER_IN"
  | "TRANSFER_OUT"
  | "OTC_BUY"
  | "OTC_SELL";

type TransactionStatus =
  | "PENDING"
  | "CONFIRMING"
  | "CONFIRMED"
  | "FAILED"
  | "REJECTED";

interface FilterState {
  type: TransactionType | "ALL";
  status: TransactionStatus | "ALL";
  network: string | "ALL";
  dateRange: "ALL" | "TODAY" | "WEEK" | "MONTH" | "YEAR";
}

const typeOptions = [
  { value: "ALL", label: "All Types" },
  { value: "DEPOSIT", label: "Deposits" },
  { value: "WITHDRAWAL", label: "Withdrawals" },
  { value: "TRANSFER_IN", label: "Transfers In" },
  { value: "TRANSFER_OUT", label: "Transfers Out" },
  { value: "OTC_BUY", label: "OTC Buy" },
  { value: "OTC_SELL", label: "OTC Sell" },
];

const statusOptions = [
  { value: "ALL", label: "All Statuses" },
  { value: "PENDING", label: "Pending" },
  { value: "CONFIRMING", label: "Confirming" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "FAILED", label: "Failed" },
  { value: "REJECTED", label: "Rejected" },
];

const networkOptions = [
  { value: "ALL", label: "All Networks" },
  { value: "TRC20", label: "TRC20" },
  { value: "ERC20", label: "ERC20" },
  { value: "BEP20", label: "BEP20" },
];

const dateRangeOptions = [
  { value: "ALL", label: "All Time" },
  { value: "TODAY", label: "Today" },
  { value: "WEEK", label: "This Week" },
  { value: "MONTH", label: "This Month" },
  { value: "YEAR", label: "This Year" },
];

const typeIcons = {
  DEPOSIT: { icon: ArrowDown, color: "text-green-600", bg: "bg-green-100" },
  WITHDRAWAL: { icon: ArrowUp, color: "text-red-600", bg: "bg-red-100" },
  TRANSFER_IN: { icon: Send, color: "text-blue-600", bg: "bg-blue-100" },
  TRANSFER_OUT: { icon: Send, color: "text-orange-600", bg: "bg-orange-100" },
  OTC_BUY: { icon: RefreshCw, color: "text-purple-600", bg: "bg-purple-100" },
  OTC_SELL: { icon: RefreshCw, color: "text-pink-600", bg: "bg-pink-100" },
};

const statusConfig = {
  PENDING: { label: "Pending", color: "text-clay", bg: "bg-clay/10" },
  CONFIRMING: { label: "Confirming", color: "text-sky-600", bg: "bg-sky-100" },
  CONFIRMED: { label: "Confirmed", color: "text-green-600", bg: "bg-green-100" },
  FAILED: { label: "Failed", color: "text-red-600", bg: "bg-red-100" },
  REJECTED: { label: "Rejected", color: "text-red-600", bg: "bg-red-100" },
};

export default function TransactionsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTxId = searchParams.get("id");

  const [filters, setFilters] = useState<FilterState>({
    type: "ALL",
    status: "ALL",
    network: "ALL",
    dateRange: "ALL",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTransaction, setSelectedTransaction] = useState<
    (typeof mockWalletTransactions)[0] | null
  >(null);
  const [showDetail, setShowDetail] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Auto-select transaction from URL param
  useEffect(() => {
    if (initialTxId) {
      const tx = mockWalletTransactions.find((t) => t.id === initialTxId);
      if (tx) {
        setSelectedTransaction(tx);
        setShowDetail(true);
      }
    }
  }, [initialTxId]);

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    let result = [...mockWalletTransactions];

    // Type filter
    if (filters.type !== "ALL") {
      result = result.filter((t) => t.type === filters.type);
    }

    // Status filter
    if (filters.status !== "ALL") {
      result = result.filter((t) => t.status === filters.status);
    }

    // Network filter
    if (filters.network !== "ALL") {
      result = result.filter((t) => t.network === filters.network);
    }

    // Date filter
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    if (filters.dateRange === "TODAY") {
      result = result.filter((t) => new Date(t.timestamp) >= today);
    } else if (filters.dateRange === "WEEK") {
      const weekAgo = new Date(now);
      weekAgo.setDate(weekAgo.getDate() - 7);
      result = result.filter((t) => new Date(t.timestamp) >= weekAgo);
    } else if (filters.dateRange === "MONTH") {
      const monthAgo = new Date(now);
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      result = result.filter((t) => new Date(t.timestamp) >= monthAgo);
    } else if (filters.dateRange === "YEAR") {
      const yearAgo = new Date(now);
      yearAgo.setFullYear(yearAgo.getFullYear() - 1);
      result = result.filter((t) => new Date(t.timestamp) >= yearAgo);
    }

    // Search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(
        (t) =>
          t.id.toLowerCase().includes(query) ||
          t.type.toLowerCase().includes(query) ||
          (t.txHash && t.txHash.toLowerCase().includes(query)) ||
          (t.counterparty && t.counterparty.toLowerCase().includes(query))
      );
    }

    // Sort by timestamp (newest first)
    result.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return result;
  }, [filters, searchQuery]);

  const handleViewDetail = (tx: (typeof mockWalletTransactions)[0]) => {
    setSelectedTransaction(tx);
    setShowDetail(true);
    // Update URL with id
    router.push(`/wallet/transactions?id=${tx.id}`, { scroll: false });
  };

  const handleCloseDetail = () => {
    setShowDetail(false);
    setSelectedTransaction(null);
    router.push("/wallet/transactions", { scroll: false });
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return `Today at ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday at ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
    } else {
      return date.toLocaleDateString([], {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
  };

  const getAmountDisplay = (tx: (typeof mockWalletTransactions)[0]) => {
    const amount = formatCurrency(tx.amount, "USD");
    const isPositive = tx.type === "DEPOSIT" || tx.type === "TRANSFER_IN" || tx.type === "OTC_BUY";
    return {
      display: `${isPositive ? "+" : "-"}${amount}`,
      isPositive,
    };
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/wallet")}
            className="text-ink-400 hover:text-ink-600"
            aria-label="Back to wallet"
          >
            ← Back
          </button>
          <h1 className="text-2xl font-bold text-ink">Transaction History</h1>
        </div>
        <div className="flex items-center gap-2 text-sm text-ink-400">
          <span>{filteredTransactions.length} transactions</span>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="col-span-1 sm:col-span-2">
            <TextInput
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by ID, hash, or counterparty..."
              leftElement={<Search className="w-4 h-4 text-ink-400" />}
              className="bg-white"
            />
          </div>
          <Select
            value={filters.type}
            onChange={(e) => setFilters((f) => ({ ...f, type: e.target.value as any }))}
            options={typeOptions}
            className="bg-white"
          />
          <Select
            value={filters.status}
            onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value as any }))}
            options={statusOptions}
            className="bg-white"
          />
          <Select
            value={filters.network}
            onChange={(e) => setFilters((f) => ({ ...f, network: e.target.value as any }))}
            options={networkOptions}
            className="bg-white"
          />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-ink-400">Date:</span>
            <div className="flex flex-wrap gap-1">
              {dateRangeOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setFilters((f) => ({ ...f, dateRange: opt.value as any }))}
                  className={cn(
                    "px-2.5 py-1 text-xs rounded-full transition-colors",
                    filters.dateRange === opt.value
                      ? "bg-sky-100 text-sky-700 font-medium"
                      : "text-ink-400 hover:bg-paper"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          {Object.values(filters).some((v) => v !== "ALL" && v !== "") && (
            <button
              onClick={() =>
                setFilters({ type: "ALL", status: "ALL", network: "ALL", dateRange: "ALL" })
              }
              className="text-xs text-sky-600 hover:text-sky-800"
            >
              Clear all filters
            </button>
          )}
        </div>
      </Card>

      {/* Empty state */}
      {filteredTransactions.length === 0 && (
        <Card className="p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-paper flex items-center justify-center mx-auto text-3xl">
            📭
          </div>
          <h3 className="text-lg font-semibold text-ink mt-4">No transactions found</h3>
          <p className="text-sm text-ink-400 mt-1">Try adjusting your filters or search query.</p>
        </Card>
      )}

      {/* Transaction list */}
      {filteredTransactions.length > 0 && (
        <div className="space-y-3">
          {filteredTransactions.map((tx) => {
            const Icon = typeIcons[tx.type]?.icon || RefreshCw;
            const colorClass = typeIcons[tx.type]?.color || "text-ink-400";
            const bgClass = typeIcons[tx.type]?.bg || "bg-paper";
            const amountDisplay = getAmountDisplay(tx);
            const status = statusConfig[tx.status] || statusConfig.PENDING;

            return (
              <Card
                key={tx.id}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:shadow-md transition-all"
                onClick={() => handleViewDetail(tx)}
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className={cn("w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0", bgClass)}>
                    <Icon className={cn("w-5 h-5", colorClass)} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-ink capitalize">
                        {tx.type.replace("_", " ").toLowerCase()}
                      </p>
                      {tx.counterparty && (
                        <span className="text-xs text-ink-400">· {tx.counterparty}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-ink-400">{formatDate(tx.timestamp)}</span>
                      {tx.network && (
                        <>
                          <span className="text-ink-200">|</span>
                          <span className="text-ink-400">{tx.network}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 ml-auto">
                  <span className={cn("text-sm font-semibold", amountDisplay.isPositive ? "text-green-600" : "text-red-600")}>
                    {amountDisplay.display}
                  </span>
                  <span className={cn("text-xs px-2 py-0.5 rounded-full", status.bg, status.color)}>
                    {status.label}
                  </span>
                  <ChevronDown className="w-4 h-4 text-ink-300" />
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Transaction Detail Modal */}
      {showDetail && selectedTransaction && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <Card className="p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-xl font-bold text-ink">Transaction Details</h2>
              <button
                onClick={handleCloseDetail}
                className="text-ink-400 hover:text-ink-600"
                aria-label="Close details"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-center gap-4">
                {(() => {
                  const Icon = typeIcons[selectedTransaction.type]?.icon || RefreshCw;
                  const colorClass = typeIcons[selectedTransaction.type]?.color || "text-ink-400";
                  const bgClass = typeIcons[selectedTransaction.type]?.bg || "bg-paper";
                  const status = statusConfig[selectedTransaction.status] || statusConfig.PENDING;
                  return (
                    <>
                      <div className={cn("w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0", bgClass)}>
                        <Icon className={cn("w-6 h-6", colorClass)} />
                      </div>
                      <div>
                        <p className="font-bold text-ink text-lg capitalize">
                          {selectedTransaction.type.replace("_", " ").toLowerCase()}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className={cn("text-xs px-2 py-0.5 rounded-full", status.bg, status.color)}>
                            {status.label}
                          </span>
                          <span className="text-xs text-ink-400">
                            {formatDate(selectedTransaction.timestamp)}
                          </span>
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>

              {/* Details grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border-t border-ink/10 pt-4">
                <div>
                  <p className="text-xs text-ink-400">Transaction ID</p>
                  <p className="font-mono text-sm text-ink break-all">{selectedTransaction.id}</p>
                </div>
                {selectedTransaction.txHash && (
                  <div>
                    <p className="text-xs text-ink-400">Transaction Hash</p>
                    <p className="font-mono text-sm text-ink break-all">{selectedTransaction.txHash}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-ink-400">Amount</p>
                  <p className="font-bold text-lg text-ink">
                    {formatCurrency(selectedTransaction.amount, "USD")} USDT
                  </p>
                </div>
                <div>
                  <p className="text-xs text-ink-400">Fee</p>
                  <p className="text-sm text-ink">
                    {formatCurrency(selectedTransaction.fee, "USD")}
                  </p>
                </div>
                {selectedTransaction.network && (
                  <div>
                    <p className="text-xs text-ink-400">Network</p>
                    <p className="text-sm text-ink">{selectedTransaction.network}</p>
                  </div>
                )}
                {selectedTransaction.counterparty && (
                  <div>
                    <p className="text-xs text-ink-400">Counterparty</p>
                    <p className="text-sm text-ink">{selectedTransaction.counterparty}</p>
                  </div>
                )}
                {selectedTransaction.memo && (
                  <div className="sm:col-span-2">
                    <p className="text-xs text-ink-400">Memo</p>
                    <p className="text-sm text-ink">{selectedTransaction.memo}</p>
                  </div>
                )}
                {selectedTransaction.confirmations !== undefined && (
                  <div>
                    <p className="text-xs text-ink-400">Confirmations</p>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-ink">{selectedTransaction.confirmations}</span>
                      {selectedTransaction.confirmationThreshold && (
                        <span className="text-xs text-ink-400">
                          of {selectedTransaction.confirmationThreshold}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="border-t border-ink/10 pt-4 flex flex-wrap gap-2">
                {selectedTransaction.txHash && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                    onClick={() => window.open(`https://tronscan.org/#/transaction/${selectedTransaction.txHash}`, "_blank")}
                  >
                    <ExternalLink className="w-4 h-4" />
                    View on Explorer
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                  onClick={handleCloseDetail}
                >
                  Close
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}