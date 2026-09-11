"use client";

import { use } from "react";
import Link from "next/link";
import {
  getTransactionById,
  getOrderById,
  getLedgerEntries,
  canViewCommerce,
  formatMoney,
  TRANSACTION_TYPE_LABELS,
  TRANSACTION_SURFACE_LABELS,
  TRANSACTION_METHOD_LABELS,
  TRANSACTION_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
  FULFILMENT_STATUS_LABELS,
  type TransactionStatus,
  type LedgerEntry,
} from "@/lib/mock/commerce";

const STATUS_TONE: Record<TransactionStatus, string> = {
  PENDING: "bg-clay/15 text-clay",
  SUCCESS: "bg-green-100 text-green-800",
  FAILED: "bg-red-100 text-red-800",
  REVERSED: "bg-ink/10 text-ink/70",
};

export default function TransactionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const canView = canViewCommerce();
  const txn = getTransactionById(id);

  if (!canView || !txn) {
    return (
      <div className="p-6">
        <div className="rounded-lg border border-ink/10 bg-paper p-6 text-sm text-ink/70">
          This transaction does not exist or you do not have access.
        </div>
      </div>
    );
  }

  const order = txn.orderId ? getOrderById(txn.orderId) : null;
  const ledger = getLedgerEntries().filter((e) => e.pairId === txn.ledgerPairId);

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link href="/admin/finance" className="text-sm text-sky hover:underline">
            Back to transactions
          </Link>
          <h1 className="mt-2 text-2xl font-semibold text-ink">{txn.reference}</h1>
          <p className="mt-1 text-sm text-ink/60">
            {TRANSACTION_TYPE_LABELS[txn.type]}
            {txn.surface ? ` / ${TRANSACTION_SURFACE_LABELS[txn.surface]}` : ""}
            {" / "}
            {formatMoney(txn.amountMinor, txn.currency)}
          </p>
        </div>
        <span className={"rounded-full px-3 py-1 text-xs " + STATUS_TONE[txn.status]}>
          {TRANSACTION_STATUS_LABELS[txn.status]}
        </span>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <section className="rounded-lg border border-ink/10 bg-paper p-5">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink/60">
              Transaction summary
            </h2>
            <dl className="grid gap-3 sm:grid-cols-2 text-sm">
              <Row k="Reference" v={txn.reference} />
              <Row k="Type" v={TRANSACTION_TYPE_LABELS[txn.type]} />
              <Row k="Amount" v={formatMoney(txn.amountMinor, txn.currency)} />
              <Row k="Method" v={TRANSACTION_METHOD_LABELS[txn.method]} />
              <Row k="Member number" v={txn.memberNumber} />
              <Row k="Created" v={new Date(txn.createdAt).toLocaleString("en-GB")} />
              {txn.pspAcceptedAt && (
                <Row k="PSP accepted" v={new Date(txn.pspAcceptedAt).toLocaleString("en-GB")} />
              )}
              {txn.pspSettledAt && (
                <Row k="PSP settled" v={new Date(txn.pspSettledAt).toLocaleString("en-GB")} />
              )}
            </dl>
          </section>

          <section className="rounded-lg border border-ink/10 bg-paper p-5">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink/60">
              PSP reference
            </h2>
            {txn.pspReference ? (
              <div className="rounded-md border border-ink/10 bg-white p-3 text-sm">
                <div className="font-mono text-xs text-ink/70">{txn.pspReference}</div>
                <div className="mt-1 text-xs text-ink/50">
                  Method: {TRANSACTION_METHOD_LABELS[txn.method]}
                </div>
              </div>
            ) : (
              <p className="text-sm text-ink/60">No PSP reference recorded yet.</p>
            )}
          </section>

          <section className="rounded-lg border border-ink/10 bg-paper p-5">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink/60">
              Ledger pair
            </h2>
            {ledger.length === 0 ? (
              <p className="text-sm text-ink/60">No ledger entries linked to this transaction.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <caption className="sr-only">Ledger entries</caption>
                  <thead className="bg-ink/5 text-left text-xs uppercase tracking-wide text-ink/60">
                    <tr>
                      <th scope="col" className="px-3 py-2">Account</th>
                      <th scope="col" className="px-3 py-2">Account type</th>
                      <th scope="col" className="px-3 py-2">Entry</th>
                      <th scope="col" className="px-3 py-2">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ink/5">
                    {ledger.map((e: LedgerEntry) => (
                      <tr key={e.id}>
                        <td className="px-3 py-2 font-mono text-xs">{e.accountId}</td>
                        <td className="px-3 py-2 text-ink/70">{e.accountType}</td>
                        <td className="px-3 py-2">{e.entryType}</td>
                        <td className="px-3 py-2">{formatMoney(e.amountMinor, e.currency)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <p className="mt-3 text-xs text-ink/50">
              Pair id: <span className="font-mono">{txn.ledgerPairId ?? "—"}</span>
            </p>
          </section>

          {order && (
            <section className="rounded-lg border border-ink/10 bg-paper p-5">
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink/60">
                Order
              </h2>
              <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
                <div>
                  <Link
                    href={`/admin/finance/orders`}
                    className="text-sky hover:underline"
                  >
                    {order.reference}
                  </Link>
                  <div className="mt-1 text-xs text-ink/60">
                    {TRANSACTION_SURFACE_LABELS[order.surface]} / {order.itemsCount} item
                    {order.itemsCount === 1 ? "" : "s"}
                  </div>
                </div>
                <div className="text-right text-sm">
                  <div>{formatMoney(order.totalMinor, order.currency)}</div>
                  <div className="mt-1 text-xs text-ink/60">
                    Payment: {PAYMENT_STATUS_LABELS[order.paymentStatus]} / Fulfilment:{" "}
                    {FULFILMENT_STATUS_LABELS[order.fulfilmentStatus]}
                  </div>
                </div>
              </div>
              {order.items.length > 0 && (
                <ul className="mt-4 space-y-2 text-sm">
                  {order.items.map((it) => (
                    <li key={it.id} className="flex items-center justify-between border-b border-ink/5 pb-2">
                      <span>{it.productName} × {it.quantity}</span>
                      <span>{formatMoney(it.totalMinor, order.currency)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}
        </div>

        <div className="space-y-6">
          <section className="rounded-lg border border-ink/10 bg-paper p-5">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink/60">
              Actions
            </h2>
            <div className="flex flex-col gap-2">
              {txn.type === "PAYMENT" && txn.status === "SUCCESS" && (
                <Link
                  href="/admin/finance/refunds"
                  className="rounded-md border border-sky bg-sky px-3 py-2 text-center text-sm text-white hover:bg-sky/90"
                >
                  Initiate refund
                </Link>
              )}
              {order && (
                <Link
                  href="/admin/finance/orders"
                  className="rounded-md border border-ink/20 px-3 py-2 text-center text-sm hover:bg-ink/5"
                >
                  View order
                </Link>
              )}
              {txn.ledgerPairId && (
                <Link
                  href="/admin/finance/ledger"
                  className="rounded-md border border-ink/20 px-3 py-2 text-center text-sm hover:bg-ink/5"
                >
                  Open ledger explorer
                </Link>
              )}
              <button
                type="button"
                className="rounded-md border border-ink/20 px-3 py-2 text-sm hover:bg-ink/5"
              >
                Export receipt
              </button>
            </div>
            <p className="mt-3 text-xs text-ink/60">
              Refunds require a second approver. Every action is audited.
            </p>
          </section>

          <section className="rounded-lg border border-ink/10 bg-paper p-5">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink/60">
              Timeline
            </h2>
            <ol className="space-y-3 text-sm">
              <li className="border-l-2 border-ink/10 pl-3">
                <div className="text-xs text-ink/60">
                  {new Date(txn.createdAt).toLocaleString("en-GB")}
                </div>
                <div>Transaction created</div>
              </li>
              {txn.pspAcceptedAt && (
                <li className="border-l-2 border-ink/10 pl-3">
                  <div className="text-xs text-ink/60">
                    {new Date(txn.pspAcceptedAt).toLocaleString("en-GB")}
                  </div>
                  <div>PSP accepted</div>
                </li>
              )}
              {txn.ledgerPairId && (
                <li className="border-l-2 border-ink/10 pl-3">
                  <div className="text-xs text-ink/60">Ledger pair created</div>
                  <div className="font-mono text-xs text-ink/60">{txn.ledgerPairId}</div>
                </li>
              )}
              {txn.pspSettledAt && (
                <li className="border-l-2 border-ink/10 pl-3">
                  <div className="text-xs text-ink/60">
                    {new Date(txn.pspSettledAt).toLocaleString("en-GB")}
                  </div>
                  <div>Settled</div>
                </li>
              )}
            </ol>
          </section>
        </div>
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <dt className="text-ink/60">{k}</dt>
      <dd>{v}</dd>
    </div>
  );
}