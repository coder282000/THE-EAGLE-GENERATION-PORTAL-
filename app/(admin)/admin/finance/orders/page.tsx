"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/button";
import {
  getOrders,
  canViewCommerce,
  canActionCommerce,
  formatMoney,
  TRANSACTION_SURFACE_LABELS,
  PAYMENT_STATUS_LABELS,
  FULFILMENT_STATUS_LABELS,
  type Order,
  type PaymentStatus,
  type FulfilmentStatus,
} from "@/lib/mock/commerce";

const PAYMENT_TONE: Record<PaymentStatus, string> = {
  PENDING: "bg-clay/15 text-clay",
  PAID: "bg-green-100 text-green-800",
  FAILED: "bg-red-100 text-red-800",
  REFUNDED: "bg-ink/10 text-ink/70",
  PARTIALLY_REFUNDED: "bg-clay/15 text-clay",
};

const FULFILMENT_TONE: Record<FulfilmentStatus, string> = {
  NOT_STARTED: "bg-ink/10 text-ink/70",
  IN_PROGRESS: "bg-sky/10 text-sky",
  FULFILLED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
};

const PAGE_SIZE = 50;

export default function OrderManagementPage() {
  const [search, setSearch] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [fulfilmentFilter, setFulfilmentFilter] = useState("all");
  const [surfaceFilter, setSurfaceFilter] = useState("all");
  const [page, setPage] = useState(1);

  const canView = canViewCommerce();
  const canAction = canActionCommerce();
  const all = useMemo(() => getOrders(), []);

  const filtered = useMemo(() => {
    let r = all;
    if (paymentFilter !== "all") r = r.filter((o) => o.paymentStatus === paymentFilter);
    if (fulfilmentFilter !== "all") r = r.filter((o) => o.fulfilmentStatus === fulfilmentFilter);
    if (surfaceFilter !== "all") r = r.filter((o) => o.surface === surfaceFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter(
        (o) =>
          o.reference.toLowerCase().includes(q) ||
          o.memberNumber.toLowerCase().includes(q)
      );
    }
    return r;
  }, [all, search, paymentFilter, fulfilmentFilter, surfaceFilter]);

  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  if (!canView) {
    return (
      <div className="p-6">
        <div className="rounded-lg border border-ink/10 bg-paper p-6 text-sm text-ink/70">
          You do not have permission to view orders.
        </div>
      </div>
    );
  }

  const fulfilled = filtered.filter((o) => o.fulfilmentStatus === "FULFILLED").length;
  const pending = filtered.filter(
    (o) => o.fulfilmentStatus === "NOT_STARTED" || o.fulfilmentStatus === "IN_PROGRESS"
  ).length;
  const cancelled = filtered.filter((o) => o.fulfilmentStatus === "CANCELLED").length;
  const totalValue = filtered.reduce((s, o) => s + o.totalMinor, 0);

  return (
    <div className="space-y-6 p-6">
      <header>
        <h1 className="text-2xl font-semibold text-ink">Orders</h1>
        <p className="mt-1 text-sm text-ink/60">
          Every order placed on the platform.
        </p>
      </header>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <Kpi label="Orders" value={filtered.length} />
        <Kpi label="Fulfilled" value={fulfilled} tone="success" />
        <Kpi label="Pending fulfilment" value={pending} tone={pending > 0 ? "clay" : "ink"} />
        <Kpi label="Cancelled" value={cancelled} tone={cancelled > 0 ? "danger" : "ink"} />
        <Kpi label="Total value" value={formatMoney(totalValue, "KES")} />
      </div>

      <div className="rounded-lg border border-ink/10 bg-paper">
        <div className="flex flex-wrap gap-3 border-b border-ink/10 p-4">
          <input
            type="search"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search order reference or member no."
            className="flex-1 min-w-[220px] rounded-md border border-ink/20 bg-white px-3 py-2 text-sm"
            aria-label="Search orders"
          />
          <select value={surfaceFilter} onChange={(e) => { setSurfaceFilter(e.target.value); setPage(1); }}
            className="rounded-md border border-ink/20 bg-white px-3 py-2 text-sm" aria-label="Filter by surface">
            <option value="all">All surfaces</option>
            {Object.entries(TRANSACTION_SURFACE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <select value={paymentFilter} onChange={(e) => { setPaymentFilter(e.target.value); setPage(1); }}
            className="rounded-md border border-ink/20 bg-white px-3 py-2 text-sm" aria-label="Filter by payment status">
            <option value="all">All payment statuses</option>
            {Object.entries(PAYMENT_STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <select value={fulfilmentFilter} onChange={(e) => { setFulfilmentFilter(e.target.value); setPage(1); }}
            className="rounded-md border border-ink/20 bg-white px-3 py-2 text-sm" aria-label="Filter by fulfilment status">
            <option value="all">All fulfilment statuses</option>
            {Object.entries(FULFILMENT_STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>

        {paged.length === 0 ? (
          <div className="p-8 text-center text-sm text-ink/60">
            No orders in this period.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <caption className="sr-only">Orders</caption>
              <thead className="bg-ink/5 text-left text-xs uppercase tracking-wide text-ink/60">
                <tr>
                  <th scope="col" className="px-4 py-2">Reference</th>
                  <th scope="col" className="px-4 py-2">Date</th>
                  <th scope="col" className="px-4 py-2">Member no.</th>
                  <th scope="col" className="px-4 py-2">Surface</th>
                  <th scope="col" className="px-4 py-2">Items</th>
                  <th scope="col" className="px-4 py-2">Total</th>
                  <th scope="col" className="px-4 py-2">Payment</th>
                  <th scope="col" className="px-4 py-2">Fulfilment</th>
                  {canAction && <th scope="col" className="px-4 py-2"></th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/5">
                {paged.map((o: Order) => (
                  <tr key={o.id} className="hover:bg-ink/5">
                    <td className="px-4 py-3 font-medium text-ink">{o.reference}</td>
                    <td className="px-4 py-3 text-ink/70">
                      {new Date(o.createdAt).toLocaleDateString("en-GB")}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">{o.memberNumber}</td>
                    <td className="px-4 py-3 text-ink/70">
                      {TRANSACTION_SURFACE_LABELS[o.surface]}
                    </td>
                    <td className="px-4 py-3">{o.itemsCount}</td>
                    <td className="px-4 py-3">{formatMoney(o.totalMinor, o.currency)}</td>
                    <td className="px-4 py-3">
                      <span className={"rounded-full px-2 py-0.5 text-xs " + PAYMENT_TONE[o.paymentStatus]}>
                        {PAYMENT_STATUS_LABELS[o.paymentStatus]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={"rounded-full px-2 py-0.5 text-xs " + FULFILMENT_TONE[o.fulfilmentStatus]}>
                        {FULFILMENT_STATUS_LABELS[o.fulfilmentStatus]}
                      </span>
                    </td>
                    {canAction && (
                      <td className="px-4 py-3">
                        {o.paymentStatus === "PAID" && o.fulfilmentStatus !== "FULFILLED" && o.fulfilmentStatus !== "CANCELLED" && (
                          <Button variant="outline" onClick={() => { /* mark fulfilled */ }}>
                            Mark fulfilled
                          </Button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {filtered.length > PAGE_SIZE && (
          <div className="flex items-center justify-between border-t border-ink/10 p-4 text-sm">
            <span className="text-ink/60">
              Page {page} of {totalPages} ({filtered.length} orders)
            </span>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>
                Previous
              </Button>
              <Button variant="outline" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Kpi({
  label,
  value,
  tone = "ink",
}: {
  label: string;
  value: string | number;
  tone?: "ink" | "clay" | "danger" | "success";
}) {
  const tones: Record<string, string> = {
    ink: "text-ink",
    clay: "text-clay",
    danger: "text-red-600",
    success: "text-green-700",
  };
  return (
    <div className="rounded-lg border border-ink/10 bg-paper p-4">
      <div className="text-xs uppercase tracking-wide text-ink/50">{label}</div>
      <div className={"mt-1 text-lg font-semibold " + tones[tone]}>{value}</div>
    </div>
  );
}