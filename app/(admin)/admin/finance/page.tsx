"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/button";
import {
  getTransactions,
  canViewCommerce,
  canExportReports,
  formatMoney,
  TRANSACTION_TYPE_LABELS,
  TRANSACTION_SURFACE_LABELS,
  TRANSACTION_METHOD_LABELS,
  TRANSACTION_STATUS_LABELS,
  type Transaction,
  type TransactionStatus,
} from "@/lib/mock/commerce";

const STATUS_TONE: Record<TransactionStatus, string> = {
  PENDING: "bg-clay/15 text-clay",
  SUCCESS: "bg-green-100 text-green-800",
  FAILED: "bg-red-100 text-red-800",
  REVERSED: "bg-ink/10 text-ink/70",
};

const PAGE_SIZE = 50;

export default function TransactionListPage() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [surfaceFilter, setSurfaceFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);

  const canView = canViewCommerce();
  const canExport = canExportReports();
  const all = useMemo(() => getTransactions(), []);

  const filtered = useMemo(() => {
    let r = all;
    if (typeFilter !== "all") r = r.filter((t) => t.type === typeFilter);
    if (surfaceFilter !== "all") r = r.filter((t) => t.surface === surfaceFilter);
    if (statusFilter !== "all") r = r.filter((t) => t.status === statusFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter(
        (t) =>
          t.reference.toLowerCase().includes(q) ||
          t.memberNumber.toLowerCase().includes(q) ||
          (t.pspReference ?? "").toLowerCase().includes(q) ||
          (t.orderId ?? "").toLowerCase().includes(q)
      );
    }
    return r;
  }, [all, search, typeFilter, surfaceFilter, statusFilter]);

  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  if (!canView) {
    return (
      <div className="p-6">
        <div className="rounded-lg border border-ink/10 bg-paper p-6 text-sm text-ink/70">
          You do not have permission to view transactions.
        </div>
      </div>
    );
  }

  const payments = filtered.filter((t) => t.type === "PAYMENT" && t.status === "SUCCESS");
  const revenue = payments.reduce((s, t) => s + t.amountMinor, 0);
  const refunds = filtered.filter((t) => t.type === "REFUND" && t.status === "SUCCESS");
  const refundTotal = refunds.reduce((s, t) => s + t.amountMinor, 0);
  const failed = filtered.filter((t) => t.status === "FAILED").length;
  const avg = payments.length > 0 ? Math.round(revenue / payments.length) : 0;

  return (
    <div className="space-y-6 p-6">
      <header>
        <h1 className="text-2xl font-semibold text-ink">Transactions</h1>
        <p className="mt-1 text-sm text-ink/60">
          Every fiat money movement on the platform.
        </p>
      </header>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <Kpi label="Revenue collected" value={formatMoney(revenue, "KES")} tone="success" />
        <Kpi label="Transactions" value={filtered.length} />
        <Kpi label="Average value" value={formatMoney(avg, "KES")} />
        <Kpi label="Refunds issued" value={formatMoney(refundTotal, "KES")} tone={refundTotal > 0 ? "clay" : "ink"} />
        <Kpi label="Failed" value={failed} tone={failed > 0 ? "danger" : "ink"} />
      </div>

      <div className="rounded-lg border border-ink/10 bg-paper">
        <div className="flex flex-wrap gap-3 border-b border-ink/10 p-4">
          <input
            type="search"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search reference, member, PSP ref, order id"
            className="flex-1 min-w-[240px] rounded-md border border-ink/20 bg-white px-3 py-2 text-sm"
            aria-label="Search transactions"
          />
          <select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
            className="rounded-md border border-ink/20 bg-white px-3 py-2 text-sm" aria-label="Filter by type">
            <option value="all">All types</option>
            {Object.entries(TRANSACTION_TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <select value={surfaceFilter} onChange={(e) => { setSurfaceFilter(e.target.value); setPage(1); }}
            className="rounded-md border border-ink/20 bg-white px-3 py-2 text-sm" aria-label="Filter by surface">
            <option value="all">All surfaces</option>
            {Object.entries(TRANSACTION_SURFACE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="rounded-md border border-ink/20 bg-white px-3 py-2 text-sm" aria-label="Filter by status">
            <option value="all">All statuses</option>
            {Object.entries(TRANSACTION_STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          {canExport && (
            <Button variant="outline" onClick={() => { /* export */ }}>Export</Button>
          )}
        </div>

        {paged.length === 0 ? (
          <div className="p-8 text-center text-sm text-ink/60">
            No transactions in this period.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <caption className="sr-only">Transactions</caption>
              <thead className="bg-ink/5 text-left text-xs uppercase tracking-wide text-ink/60">
                <tr>
                  <th scope="col" className="px-4 py-2">Date</th>
                  <th scope="col" className="px-4 py-2">Reference</th>
                  <th scope="col" className="px-4 py-2">Type</th>
                  <th scope="col" className="px-4 py-2">Surface</th>
                  <th scope="col" className="px-4 py-2">Member no.</th>
                  <th scope="col" className="px-4 py-2">Amount</th>
                  <th scope="col" className="px-4 py-2">Method</th>
                  <th scope="col" className="px-4 py-2">PSP reference</th>
                  <th scope="col" className="px-4 py-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/5">
                {paged.map((t: Transaction) => (
                  <tr key={t.id} className="hover:bg-ink/5">
                    <td className="px-4 py-3 text-ink/70">
                      {new Date(t.createdAt).toLocaleDateString("en-GB")}
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/admin/finance/transactions/${t.id}`} className="text-sky hover:underline">
                        {t.reference}
                      </Link>
                    </td>
                    <td className="px-4 py-3">{TRANSACTION_TYPE_LABELS[t.type]}</td>
                    <td className="px-4 py-3 text-ink/70">
                      {t.surface ? TRANSACTION_SURFACE_LABELS[t.surface] : "—"}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">{t.memberNumber}</td>
                    <td className="px-4 py-3">{formatMoney(t.amountMinor, t.currency)}</td>
                    <td className="px-4 py-3 text-ink/70">{TRANSACTION_METHOD_LABELS[t.method]}</td>
                    <td className="px-4 py-3 font-mono text-xs text-ink/50">
                      {t.pspReference ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span className={"rounded-full px-2 py-0.5 text-xs " + STATUS_TONE[t.status]}>
                        {TRANSACTION_STATUS_LABELS[t.status]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {filtered.length > PAGE_SIZE && (
          <div className="flex items-center justify-between border-t border-ink/10 p-4 text-sm">
            <span className="text-ink/60">
              Page {page} of {totalPages} ({filtered.length} transactions)
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