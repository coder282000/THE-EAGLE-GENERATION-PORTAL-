"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useMemo, useEffect } from "react";
import { Card } from "@/components/card";
import { Button } from "@/components/button";
import {
  mockRemittanceTransfers,
  getCorridorById,
  getRecipientById,
} from "@/components/mock/data";
import { formatCurrency, cn } from "@/lib/utils";
import {
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  ExternalLink,
  RefreshCw,
  Phone,
  User,
  ArrowRight,
  FileText,
} from "lucide-react";

const statusSteps = [
  { status: "PENDING", label: "Pending", icon: Clock },
  { status: "PROCESSING", label: "Processing", icon: RefreshCw },
  { status: "COMPLETED", label: "Completed", icon: CheckCircle },
  { status: "FAILED", label: "Failed", icon: XCircle },
  { status: "REFUNDED", label: "Refunded", icon: XCircle },
];

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  PENDING: { label: "Pending", color: "text-clay", bg: "bg-clay/10" },
  PROCESSING: { label: "Processing", color: "text-sky-600", bg: "bg-sky-100" },
  COMPLETED: { label: "Completed", color: "text-green-600", bg: "bg-green-100" },
  FAILED: { label: "Failed", color: "text-red-600", bg: "bg-red-100" },
  REFUNDED: { label: "Refunded", color: "text-ink-400", bg: "bg-paper" },
};

export default function TransferDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const transfer = useMemo(() => {
    return mockRemittanceTransfers.find((t) => t.id === id);
  }, [id]);

  const corridor = useMemo(() => {
    return transfer ? getCorridorById(transfer.corridorId) : null;
  }, [transfer]);

  const recipient = useMemo(() => {
    return transfer ? getRecipientById(transfer.recipientId) : null;
  }, [transfer]);

  const [currentStatus, setCurrentStatus] = useState(transfer?.status || "PENDING");

  // Simulate status updates for demo (only if PENDING or PROCESSING)
  useEffect(() => {
    if (transfer && (transfer.status === "PROCESSING" || transfer.status === "PENDING")) {
      const timer = setTimeout(() => {
        if (currentStatus === "PENDING") setCurrentStatus("PROCESSING");
        else if (currentStatus === "PROCESSING") setCurrentStatus("COMPLETED");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [currentStatus, transfer]);

  if (!transfer || !corridor || !recipient) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <Card className="p-8 border-red-200 bg-red-50/50">
          <p className="text-red-700">Transfer not found.</p>
          <Button variant="primary" className="mt-4" onClick={() => router.push("/remit/transfers")}>
            Back to Transfers
          </Button>
        </Card>
      </div>
    );
  }

  const statusInfo = statusConfig[currentStatus] || statusConfig.PENDING;
  const currentStepIndex = statusSteps.findIndex((s) => s.status === currentStatus);
  const isCompleted = currentStatus === "COMPLETED";
  const isFailed = currentStatus === "FAILED" || currentStatus === "REFUNDED";

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

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push("/remit/transfers")}
          className="text-ink-400 hover:text-ink-600"
        >
          ← Back to Transfers
        </button>
        <h1 className="text-2xl font-bold text-ink">Transfer Status</h1>
      </div>

      {/* Status banner */}
      <Card className={cn("p-4 flex items-center gap-4", statusInfo.bg)}>
        {isCompleted ? (
          <CheckCircle className="w-6 h-6 text-green-600" />
        ) : isFailed ? (
          <AlertCircle className="w-6 h-6 text-red-600" />
        ) : (
          <Clock className="w-6 h-6 text-clay" />
        )}
        <div>
          <p className="font-semibold text-ink">{statusInfo.label}</p>
          <p className="text-sm text-ink-60">
            {currentStatus === "PENDING" && "Waiting for processing"}
            {currentStatus === "PROCESSING" && "Your transfer is being processed"}
            {currentStatus === "COMPLETED" && "Transfer completed successfully"}
            {currentStatus === "FAILED" && "Transfer failed. Please contact support."}
            {currentStatus === "REFUNDED" && "Transfer has been refunded"}
          </p>
        </div>
      </Card>

      {/* Progress steps */}
      <Card className="p-6">
        <div className="flex justify-between items-start">
          {statusSteps.map((step, index) => {
            const isActive = index <= currentStepIndex;
            const isCurrent = index === currentStepIndex;
            const Icon = step.icon;

            return (
              <div key={step.status} className="flex flex-col items-center flex-1">
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                    isActive
                      ? isCurrent
                        ? "bg-sky-600 text-white ring-4 ring-sky-200"
                        : "bg-green-500 text-white"
                      : "bg-paper text-ink-300"
                  )}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <p
                  className={cn(
                    "text-xs mt-2 text-center",
                    isActive ? "text-ink font-medium" : "text-ink-300"
                  )}
                >
                  {step.label}
                </p>
                {index < statusSteps.length - 1 && (
                  <div
                    className={cn(
                      "w-full h-0.5 mt-5 -ml-4",
                      isActive && index < currentStepIndex ? "bg-green-500" : "bg-paper"
                    )}
                  />
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Transfer details */}
      <Card className="p-6 space-y-4">
        <h3 className="font-semibold text-ink">Transfer Details</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-ink-400">Transfer ID</p>
            <p className="font-mono text-ink">{transfer.id}</p>
          </div>
          <div>
            <p className="text-ink-400">Tracking Code</p>
            <p className="font-mono text-ink">{transfer.trackingCode}</p>
          </div>
          <div>
            <p className="text-ink-400">Amount Sent</p>
            <p className="font-bold text-ink">{formatCurrency(transfer.amount, transfer.sendCurrency)}</p>
          </div>
          <div>
            <p className="text-ink-400">Recipient Gets</p>
            <p className="font-bold text-green-600">{formatCurrency(transfer.receiveAmount, transfer.receiveCurrency)}</p>
          </div>
          <div>
            <p className="text-ink-400">Fee</p>
            <p className="text-clay">{formatCurrency(transfer.fee, transfer.sendCurrency)}</p>
          </div>
          <div>
            <p className="text-ink-400">Exchange Rate</p>
            <p>1 {transfer.sendCurrency} = {transfer.rate} {transfer.receiveCurrency}</p>
          </div>
          <div className="sm:col-span-2">
            <p className="text-ink-400">Created</p>
            <p>{formatDate(transfer.createdAt)}</p>
          </div>
          {transfer.completedAt && (
            <div className="sm:col-span-2">
              <p className="text-ink-400">Completed</p>
              <p>{formatDate(transfer.completedAt)}</p>
            </div>
          )}
        </div>
      </Card>

      {/* Recipient info */}
      <Card className="p-6 space-y-3">
        <h3 className="font-semibold text-ink">Recipient</h3>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-paper flex items-center justify-center text-2xl">
            👤
          </div>
          <div>
            <p className="font-medium text-ink">{recipient.name}</p>
            <p className="text-sm text-ink-400 flex items-center gap-2">
              <Phone className="w-3 h-3" /> {recipient.phone}
            </p>
            {recipient.email && (
              <p className="text-sm text-ink-400">{recipient.email}</p>
            )}
            <p className="text-xs text-ink-300">
              {recipient.country} · {recipient.mobileNetwork || recipient.bankName || "Bank"}
            </p>
          </div>
        </div>
      </Card>

      {/* Corridor info */}
      <Card className="p-6 space-y-3">
        <h3 className="font-semibold text-ink">Corridor</h3>
        <div className="flex items-center gap-3 text-sm">
          <span>{corridor.fromCountry}</span>
          <ArrowRight className="w-4 h-4 text-ink-300" />
          <span className="font-medium">{corridor.toCountry}</span>
          <span className="text-ink-400">·</span>
          <span className="text-ink-400">{corridor.partner}</span>
        </div>
        {transfer.purpose && (
          <div className="text-sm">
            <span className="text-ink-400">Purpose:</span> {transfer.purpose}
          </div>
        )}
      </Card>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        {isCompleted && (
          <Button variant="outline" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Download Receipt
          </Button>
        )}
        {isFailed && (
          <Button variant="primary" onClick={() => router.push("/remit")}>
            Try Again
          </Button>
        )}
        <Button variant="outline" onClick={() => router.push("/remit/transfers")}>
          All Transfers
        </Button>
      </div>
    </div>
  );
}