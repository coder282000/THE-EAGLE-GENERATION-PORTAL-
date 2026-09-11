"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/button";
import {
  getLedgerEntries,
  getTransactions,
  canViewCommerce,
  canExportReports,
  formatMoney,
  type LedgerEntry,
  type LedgerAccountType,
  type LedgerEntryType,
} from "@/lib/mock/commerce";

type ActionKey = null | "verify";

export default function LedgerExplorerPage() {
  const [search, setSearch] = useState("");
  const [accountTypeFilter, setAccountTypeFilter] = useState("all");
  const [entryTypeFilter, setEntryTypeFilter] = useState("all");
  const [confirmVerify, setConfirmVerify] = useState(false);

  const canView = canViewCommerce();
  const canExport = canExportReports();
  const all = useMemo(() => getLedgerEntries(), []);
  const transactions = useMemo(() => getTransactions(), []);

  const filtered = useMemo(() => {
    let r = all;
    if (accountTypeFilter !== "all") r = r.filter((e) => e.accountType === accountTypeFilter);
    if (entryTypeFilter !== "all") r = r.filter((e) => e.entryType === entryTypeFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter(
        (e) =>
          e.reference.toLowerCase().includes(q) ||
          e.pairId.toLowerCase().includes(q) ||
          e.accountId.toLowerCase().includes(q)
      );
    }
    return r;
  }, [all, search, accountTypeFilter, entryTypeFilter]);

  if (!canView) {
    return (
      <div className="p-6">
        <div className="rounded-lg border border-ink/10 bg-paper p-6 text-sm text-ink/70">
          You do not have permission to view the ledger.
        </div>
      </div>
    );
  }

  const debits = all.filter((e) => e.entryType === "DEBIT");
  const credits = all.filter((e) => e.entryType === "CREDIT");
  const debitTotal = debits.reduce((s, e) => s + e.amountMinor, 0);
  const creditTotal = credits.reduce((s, e) => s + e.amountMinor, 0);
  const drift = debitTotal - creditTotal;
  const accounts = new Set(all.map((e) => e.accountId));

  return (
    <div className="space-y-6 p-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Chart of accounts and ledger</h1>
          <p className="mt-1 text-sm text-ink/60">
            Every entry, every pair. Append-only. Balances derived.
          </p>
        </div>
        <div className="flex gap-2">
          {canExport && (
            <Button variant="outline" onClick={() => { /* export */ }}>
              Export entries
            </Button>
          )}
          <Button variant="primary" onClick={() => setConfirmVerify(true)}>
            Verify ledger
          </Button>
        </div>
      </header>

      {drift !== 0 ? (
        <div role="alert" className="rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-900">
          <strong>Ledger drift of {formatMoney(drift, "KES")}.</strong>{" "}
          This is a P0 incident. Investigate immediately.
        </div>
      ) : (
        <div className="rounded-lg border border-green-600/30 bg-green-50 p-3 text-sm text-green-900">
          Ledger balanced. Zero drift across {all.length} entries.
        </div>
      )}

      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Kpi label="Entries" value={all.length} />
        <Kpi
          label="Status"
          value={drift === 0 ? "Balanced" : formatMoney(drift, "KES")}
          tone={drift === 0 ? "success" : "danger"}
        />
        <Kpi label="Active accounts" value={accounts.size} />
        <Kpi label="Debits / Credits" value={`${debits.length} / ${credits.length}`} />
      </section>

      <div className="rounded-lg border border-ink/10 bg-paper">
        <div className="flex flex-wrap gap-3 border-b border-ink/10 p-4">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search reference, pair id, account"
            className="flex-1 min-w-[220px] rounded-md border border-ink/20 bg-white px-3 py-2 text-sm"
            aria-label="Search ledger entries"
          />
          <select
            value={accountTypeFilter}
            onChange={(e) => setAccountTypeFilter(e.target.value)}
            className="rounded-md border border-ink/20 bg-white px-3 py-2 text-sm"
            aria-label="Filter by account type"
          >
            <option value="all">All account types</option>
            {(["MEMBER", "CIRCLE", "ORG", "TREASURY"] as LedgerAccountType[]).map((k) => (
              <option key={k} value={k}>{k}</option>
            ))}
          </select>
          <select
            value={entryTypeFilter}
            onChange={(e) => setEntryTypeFilter(e.target.value)}
            className="rounded-md border border-ink/20 bg-white px-3 py-2 text-sm"
            aria-label="Filter by entry type"
          >
            <option value="all">All entry types</option>
            {(["DEBIT", "CREDIT"] as LedgerEntryType[]).map((k) => (
              <option key={k} value={k}>{k}</option>
            ))}
          </select>
        </div>

        {filtered.length === 0 ? (
          <div className="p-8 text-center text-sm text-ink/60">
            No ledger entries match your filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <caption className="sr-only">Ledger entries</caption>
              <thead className="bg-ink/5 text-left text-xs uppercase tracking-wide text-ink/60">
                <tr>
                  <th scope="col" className="px-4 py-2">Date</th>
                  <th scope="col" className="px-4 py-2">Account</th>
                  <th scope="col" className="px-4 py-2">Account type</th>
                  <th scope="col" className="px-4 py-2">Entry</th>
                  <th scope="col" className="px-4 py-2">Amount</th>
                  <th scope="col" className="px-4 py-2">Pair</th>
                  <th scope="col" className="px-4 py-2">Reference</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/5">
                {filtered.map((e: LedgerEntry) => {
                  const txn = transactions.find((t) => t.ledgerPairId === e.pairId);
                  return (
                    <tr key={e.id} className="hover:bg-ink/5">
                      <td className="px-4 py-3 text-ink/70">
                        {new Date(e.createdAt).toLocaleString("en-GB")}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs">{e.accountId}</td>
                      <td className="px-4 py-3 text-ink/70">{e.accountType}</td>
                      <td className={"px-4 py-3 font-semibold " + (e.entryType === "DEBIT" ? "text-sky" : "text-clay")}>
                        {e.entryType}
                      </td>
                      <td className="px-4 py-3">{formatMoney(e.amountMinor, e.currency)}</td>
                      <td className="px-4 py-3 font-mono text-xs text-ink/50">{e.pairId}</td>
                      <td className="px-4 py-3">
                        {txn ? (
                          <Link
                            href={`/admin/finance/transactions/${txn.id}`}
                            className="text-sky hover:underline font-mono text-xs"
                          >
                            {e.reference}
                          </Link>
                        ) : (
                          <span className="font-mono text-xs text-ink/60">{e.reference}</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {confirmVerify && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4">
          <div className="w-full max-w-md rounded-lg bg-paper p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-ink">Verify the full ledger?</h3>
            <p className="mt-2 text-sm text-ink/70">
              This runs across every entry ever written and may take a moment. It is audited.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setConfirmVerify(false)}>Cancel</Button>
              <Button variant="primary" onClick={() => setConfirmVerify(false)}>Verify</Button>
            </div>
          </div>
        </div>
      )}
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