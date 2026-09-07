"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/card";
import { Button } from "@/components/button";
import { TextInput } from "@/components/input";
import { Select } from "@/components/select";
import { mockOTCOrders } from "@/components/mock/data";
import { formatCurrency, cn } from "@/lib/utils";
import { Search, ChevronDown } from "lucide-react";

type OrderStatus = "ALL" | "PENDING" | "IN_ESCROW" | "MATCHED" | "COMPLETED" | "CANCELLED" | "DISPUTED";
type OrderType = "ALL" | "BUY" | "SELL";

const statusConfig: Record<Exclude<OrderStatus, "ALL">, { label: string; color: string; bg: string }> = {
  PENDING: { label: "Pending", color: "text-clay", bg: "bg-clay/10" },
  IN_ESCROW: { label: "In Escrow", color: "text-sky-600", bg: "bg-sky-100" },
  MATCHED: { label: "Matched", color: "text-dawn-600", bg: "bg-dawn-100" },
  COMPLETED: { label: "Completed", color: "text-green-600", bg: "bg-green-100" },
  CANCELLED: { label: "Cancelled", color: "text-ink-400", bg: "bg-paper" },
  DISPUTED: { label: "Disputed", color: "text-red-600", bg: "bg-red-100" },
};

const statusOptions = [
  { value: "ALL", label: "All Statuses" },
  { value: "PENDING", label: "Pending" },
  { value: "IN_ESCROW", label: "In Escrow" },
  { value: "MATCHED", label: "Matched" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
  { value: "DISPUTED", label: "Disputed" },
];

const typeOptions = [
  { value: "ALL", label: "All Types" },
  { value: "BUY", label: "Buy Orders" },
  { value: "SELL", label: "Sell Orders" },
];

export default function OTCOrdersPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus>("ALL");
  const [typeFilter, setTypeFilter] = useState<OrderType>("ALL");

  const filteredOrders = useMemo(() => {
    let result = mockOTCOrders;

    if (typeFilter !== "ALL") {
      result = result.filter((o) => o.type === typeFilter);
    }

    if (statusFilter !== "ALL") {
      result = result.filter((o) => o.status === statusFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (o) =>
          o.id.toLowerCase().includes(q) ||
          o.status.toLowerCase().includes(q) ||
          o.type.toLowerCase().includes(q)
      );
    }

    result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return result;
  }, [searchQuery, statusFilter, typeFilter]);

  const stats = useMemo(() => {
    const total = filteredOrders.length;
    const pending = filteredOrders.filter((o) => o.status === "PENDING").length;
    const inEscrow = filteredOrders.filter((o) => o.status === "IN_ESCROW").length;
    const completed = filteredOrders.filter((o) => o.status === "COMPLETED").length;
    return { total, pending, inEscrow, completed };
  }, [filteredOrders]);

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
    const config = statusConfig[status as Exclude<OrderStatus, "ALL">] || statusConfig.PENDING;
    return (
      <span className={cn("text-xs px-2 py-0.5 rounded-full", config.bg, config.color)}>
        {config.label}
      </span>
    );
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/wallet")}
            className="text-ink-400 hover:text-ink-600"
          >
            ← Back
          </button>
          <h1 className="text-2xl font-bold text-ink">OTC Orders</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => router.push("/otc/buy")}>
            Buy USDT
          </Button>
          <Button variant="primary" size="sm" onClick={() => router.push("/otc/sell")}>
            Sell USDT
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-3 text-center">
          <p className="text-xs text-ink-40">Total</p>
          <p className="text-xl font-bold text-ink">{stats.total}</p>
        </Card>
        <Card className="p-3 text-center border-clay/30 bg-clay/5">
          <p className="text-xs text-ink-40">Pending</p>
          <p className="text-xl font-bold text-clay">{stats.pending}</p>
        </Card>
        <Card className="p-3 text-center border-sky-200 bg-sky-50/30">
          <p className="text-xs text-ink-40">In Escrow</p>
          <p className="text-xl font-bold text-sky-600">{stats.inEscrow}</p>
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
              id="search-orders"
              label="Search orders"
              value={searchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
              placeholder="Search orders..."
              className="bg-white"
              
            />
          </div>
          <Select
            value={typeFilter}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setTypeFilter(e.target.value as OrderType)}
            options={typeOptions}
            className="min-w-[140px] bg-white"
            
          />
          <Select
            value={statusFilter}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setStatusFilter(e.target.value as OrderStatus)}
            options={statusOptions}
            className="min-w-[140px] bg-white"
            
          />
        </div>
      </Card>

      {/* Empty state */}
      {filteredOrders.length === 0 && (
        <Card className="p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-paper flex items-center justify-center mx-auto text-3xl">
            📋
          </div>
          <h3 className="text-lg font-semibold text-ink mt-4">No orders found</h3>
          <p className="text-sm text-ink-400 mt-1">Place your first OTC order to get started.</p>
          <div className="flex gap-3 justify-center mt-4">
            <Button variant="outline" onClick={() => router.push("/otc/buy")}>
              Buy USDT
            </Button>
            <Button variant="primary" onClick={() => router.push("/otc/sell")}>
              Sell USDT
            </Button>
          </div>
        </Card>
      )}

      {/* Orders list */}
      {filteredOrders.length > 0 && (
        <div className="space-y-3">
          {filteredOrders.map((order) => (
            <Card
              key={order.id}
              className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:shadow-md transition-all"
              onClick={() => router.push(`/otc/orders/${order.id}`)}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "text-sm font-semibold",
                      order.type === "BUY" ? "text-green-600" : "text-red-600"
                    )}
                  >
                    {order.type === "BUY" ? "Buy" : "Sell"}
                  </span>
                  <span className="text-xs text-ink-400">·</span>
                  <span className="font-mono text-xs text-ink-400">{order.id}</span>
                  {getStatusBadge(order.status)}
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-400 mt-1">
                  <span>{formatCurrency(order.amount, "USD")} USDT</span>
                  <span>·</span>
                  <span>Rate: {formatCurrency(Math.round(order.rate * 100), "KES")}</span>
                  <span>·</span>
                  <span>Total: {formatCurrency(order.total, "KES")}</span>
                  <span>·</span>
                  <span>{formatDate(order.createdAt)}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <ChevronDown className="w-4 h-4 text-ink-300" />
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}