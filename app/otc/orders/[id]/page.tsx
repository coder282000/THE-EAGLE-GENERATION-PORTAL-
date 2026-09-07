"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useMemo } from "react";
import { Card } from "@/components/card";
import { Button } from "@/components/button";
import { mockOTCOrders } from "@/components/mock/data";
import { formatCurrency, cn } from "@/lib/utils";
import {
  CheckCircle,
  Clock,
  Shield,
  AlertCircle,
  ExternalLink,
  MessageSquare,
  FileText,
  User,
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  XCircle, // <-- added missing import
} from "lucide-react";
import Link from "next/link";

const statusConfig: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  PENDING: { label: "Pending", color: "text-clay", bg: "bg-clay/10", icon: <Clock className="w-5 h-5" /> },
  IN_ESCROW: { label: "In Escrow", color: "text-sky-600", bg: "bg-sky-100", icon: <Shield className="w-5 h-5" /> },
  MATCHED: { label: "Matched", color: "text-dawn-600", bg: "bg-dawn-100", icon: <CheckCircle className="w-5 h-5" /> },
  COMPLETED: { label: "Completed", color: "text-green-600", bg: "bg-green-100", icon: <CheckCircle className="w-5 h-5" /> },
  CANCELLED: { label: "Cancelled", color: "text-ink-400", bg: "bg-paper", icon: <XCircle className="w-5 h-5" /> },
  DISPUTED: { label: "Disputed", color: "text-red-600", bg: "bg-red-100", icon: <AlertTriangle className="w-5 h-5" /> },
};

export default function OTCOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const order = useMemo(() => {
    return mockOTCOrders.find((o) => o.id === orderId);
  }, [orderId]);

  if (!order) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <Card className="p-8 border-red-200 bg-red-50/50">
          <h2 className="text-lg font-semibold text-red-700">Order not found</h2>
          <p className="text-sm text-red-600 mt-2">The order you're looking for doesn't exist.</p>
          <Button variant="primary" className="mt-4" onClick={() => router.push("/otc/orders")}>
            Back to Orders
          </Button>
        </Card>
      </div>
    );
  }

  const statusInfo = statusConfig[order.status] || statusConfig.PENDING;
  const isBuy = order.type === "BUY";
  const isCompleted = order.status === "COMPLETED";
  const isDisputed = order.status === "DISPUTED";
  const canDispute = order.status === "IN_ESCROW" || order.status === "PENDING";

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
          onClick={() => router.push("/otc/orders")}
          className="text-ink-400 hover:text-ink-600"
        >
          ← Back to Orders
        </button>
        <h1 className="text-2xl font-bold text-ink">Order Details</h1>
      </div>

      {/* Status banner */}
      <Card className={cn("p-4 flex items-center gap-4", statusInfo.bg)}>
        {statusInfo.icon}
        <div>
          <p className="font-semibold text-ink">{statusInfo.label}</p>
          <p className="text-sm text-ink-60">
            {order.status === "PENDING" && "Waiting for agent matching"}
            {order.status === "IN_ESCROW" && "Funds are held securely in escrow"}
            {order.status === "MATCHED" && "Order matched with agent, awaiting completion"}
            {order.status === "COMPLETED" && "Order completed successfully"}
            {order.status === "CANCELLED" && "Order was cancelled"}
            {order.status === "DISPUTED" && "Order is under dispute resolution"}
          </p>
        </div>
      </Card>

      {/* Order summary */}
      <Card className="p-6 space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-xs text-ink-40">Order ID</p>
            <p className="font-mono text-sm text-ink">{order.id}</p>
          </div>
          <span
            className={cn(
              "text-sm font-semibold",
              isBuy ? "text-green-600" : "text-red-600"
            )}
          >
            {isBuy ? "Buy" : "Sell"} USDT
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 border-t border-ink/10 pt-4">
          <div>
            <p className="text-xs text-ink-40">Amount</p>
            <p className="text-lg font-bold text-ink">{formatCurrency(order.amount, "USD")} USDT</p>
          </div>
          <div>
            <p className="text-xs text-ink-40">Rate</p>
            <p className="text-lg font-bold text-ink">{formatCurrency(Math.round(order.rate * 100), "KES")} / USDT</p>
          </div>
          <div>
            <p className="text-xs text-ink-40">Total</p>
            <p className="text-lg font-bold text-ink">{formatCurrency(order.total, "KES")}</p>
          </div>
          <div>
            <p className="text-xs text-ink-40">Fee</p>
            <p className="text-sm text-clay">{formatCurrency(order.fee, "KES")}</p>
          </div>
        </div>

        <div className="border-t border-ink/10 pt-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-ink-60">Created</span>
            <span className="text-ink">{formatDate(order.createdAt)}</span>
          </div>
          {order.updatedAt && (
            <div className="flex justify-between">
              <span className="text-ink-60">Last Updated</span>
              <span className="text-ink">{formatDate(order.updatedAt)}</span>
            </div>
          )}
          {order.completedAt && (
            <div className="flex justify-between">
              <span className="text-ink-60">Completed</span>
              <span className="text-ink">{formatDate(order.completedAt)}</span>
            </div>
          )}
          {order.matchedWith && (
            <div className="flex justify-between">
              <span className="text-ink-60">Agent</span>
              <span className="text-ink font-medium">{order.matchedWith}</span>
            </div>
          )}
          {order.escrowId && (
            <div className="flex justify-between">
              <span className="text-ink-60">Escrow Reference</span>
              <span className="font-mono text-sm text-ink">{order.escrowId}</span>
            </div>
          )}
        </div>
      </Card>

      {/* Escrow info (if in escrow) */}
      {order.status === "IN_ESCROW" && (
        <Card className="p-4 border-sky-200 bg-sky-50/30">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-sky-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-sky-700">Escrow Protection</p>
              <p className="text-sm text-ink-60">
                Your funds are held securely in escrow. The transaction will complete when both
                parties confirm. If there's an issue, you can raise a dispute.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        {canDispute && !isDisputed && (
          <Button
            variant="outline"
            className="flex items-center gap-2 border-red-300 text-red-600 hover:bg-red-50"
            onClick={() => router.push(`/otc/orders/${order.id}/dispute`)}
          >
            <AlertTriangle className="w-4 h-4" />
            Raise Dispute
          </Button>
        )}
        {isCompleted && (
          <Button variant="outline" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Download Receipt
          </Button>
        )}
        <Button variant="primary" onClick={() => router.push("/otc/orders")}>
          View All Orders
        </Button>
      </div>
    </div>
  );
}