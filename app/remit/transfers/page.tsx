"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/card";
import { Button } from "@/components/button";
import { TextInput } from "@/components/input";
import { Select } from "@/components/select";
import { mockRemittanceTransfers, getCorridorById, getRecipientById } from "@/components/mock/data";
import { formatCurrency, cn } from "@/lib/utils";
import { Search, ChevronDown, Clock, CheckCircle, AlertCircle, XCircle } from "lucide-react";

type TransferStatus = "ALL" | "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED" | "REFUNDED";

const statusOptions = [
  { value: "ALL", label: "All Statuses" },
  { value: "PENDING", label: "Pending" },
  { value: "PROCESSING", label: "Processing" },
  { value: "COMPLETED", label: "Completed" },
  { value: "FAILED", label: "Failed" },
  { value: "REFUNDED", label: "Refunded" },
];

const statusConfig: Record<Exclude<TransferStatus, "ALL">, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  PENDING: {
    label: "Pending",
    color: "text-clay",
    bg: "bg-clay/10",
    icon: <Clock className="w-4 h-4" />,
  },
  PROCESSING: {
    label: "Processing",
    color: "text-sky-600",
    bg: "bg-sky-100",
    icon: <Clock className="w-4 h-4" />,
  },
  COMPLETED: {
    label: "Completed",
    color: "text-green-600",
    bg: "bg-green-100",
    icon: <CheckCircle className="w-4 h-4" />,
  },
  FAILED: {
    label: "Failed",
    color: "text-red-600",
    bg: "bg-red-100",
    icon: <AlertCircle className="w-4 h-4" />,
  },
  REFUNDED: {
    label: "Refunded",
    color: "text-ink-400",
    bg: "bg-paper",
    icon: <XCircle className="w-4 h-4" />,
  },
};

export default function TransfersPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<TransferStatus>("ALL");

  const filteredTransfers = useMemo(() => {
    let result = mockRemittanceTransfers;

    if (statusFilter !== "ALL") {
      result = result.filter((t) => t.status === statusFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (t) =>
          t.id.toLowerCase().includes(q) ||
          t.trackingCode.toLowerCase().includes(q) ||
          t.purpose.toLowerCase().includes(q)
      );
    }

    result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return result;
  }, [searchQuery, statusFilter]);

  const stats = useMemo(() => {
    const total = filteredTransfers.length;
    const pending = filteredTransfers.filter((t) => t.status === "PENDING" || t.status === "PROCESSING").length;
    const completed = filteredTransfers.filter((t) => t.status === "COMPLETED").length;
    return { total, pending, completed };
  }, [filteredTransfers]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-KE", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: string) => {
    const config = statusConfig[status as Exclude<TransferStatus, "ALL">] || statusConfig.PENDING;
    return (
      <span className={cn("text-xs px-2 py-0.5 rounded-full flex items-center gap-1", config.bg, config.color)}>
        {config.icon}
        {config.label}
      </span>
    );
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/wallet")}
            className="text-ink-400 hover:text-ink-600"
          >
            ← Back
          </button>
          <h1 className="text-2xl font-bold text-ink">My Transfers</h1>
        </div>
        <Button variant="primary" size="sm" onClick={() => router.push("/remit")}>
          Send Money
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="p-3 text-center">
          <p className="text-xs text-ink-40">Total</p>
          <p className="text-xl font-bold text-ink">{stats.total}</p>
        </Card>
        <Card className="p-3 text-center border-clay/30 bg-clay/5">
          <p className="text-xs text-ink-40">Pending</p>
          <p className="text-xl font-bold text-clay">{stats.pending}</p>
        </Card>
        <Card className="p-3 text-center border-green-200 bg-green-50/30">
          <p className="text-xs text-ink-40">Completed</p>
          <p className="text-xl font-bold text-green-600">{stats.completed}</p>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <TextInput
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by ID, tracking code, or purpose..."
              leftElement={<Search className="w-4 h-4 text-ink-400" />}
              className="bg-white"
            
            />
          </div>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as TransferStatus)}
            options={statusOptions}
            className="min-w-[140px]"
            
          />
        </div>
      </Card>

      {/* Empty state */}
      {filteredTransfers.length === 0 && (
        <Card className="p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-paper flex items-center justify-center mx-auto text-3xl">
            📭
          </div>
          <h3 className="text-lg font-semibold text-ink mt-4">No transfers found</h3>
          <p className="text-sm text-ink-400 mt-1">Send money to get started.</p>
          <Button variant="primary" className="mt-4" onClick={() => router.push("/remit")}>
            Send Money
          </Button>
        </Card>
      )}

      {/* Transfers list */}
      {filteredTransfers.length > 0 && (
        <div className="space-y-3">
          {filteredTransfers.map((transfer) => {
            const corridor = getCorridorById(transfer.corridorId);
            const recipient = getRecipientById(transfer.recipientId);

            return (
              <Card
                key={transfer.id}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:shadow-md transition-all"
                onClick={() => router.push(`/remit/transfers/${transfer.id}`)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-ink">{recipient?.name || "Unknown"}</span>
                    <span className="text-xs text-ink-400">·</span>
                    <span className="text-xs font-mono text-ink-400">{transfer.trackingCode}</span>
                    {getStatusBadge(transfer.status)}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-400 mt-1">
                    <span>{formatCurrency(transfer.amount, transfer.sendCurrency)}</span>
                    <span>→</span>
                    <span className="text-green-600">
                      {formatCurrency(transfer.receiveAmount, transfer.receiveCurrency)}
                    </span>
                    <span>·</span>
                    <span>{corridor?.toCountry || "Unknown"}</span>
                    <span>·</span>
                    <span>{formatDate(transfer.createdAt)}</span>
                    {transfer.purpose && (
                      <>
                        <span>·</span>
                        <span className="text-ink-300">{transfer.purpose}</span>
                      </>
                    )}
                  </div>
                </div>
                <ChevronDown className="w-4 h-4 text-ink-300" />
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}