"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/button";
import { Card } from "@/components/card";
import { seedWithdrawals, type Withdrawal } from "@/components/mock/data";

export default function WithdrawalDetailPage() {
  const params = useParams<{ id: string }>();
  const [withdrawal, setWithdrawal] = useState<Withdrawal | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const stored: Withdrawal[] = JSON.parse(
      localStorage.getItem("withdrawals") ?? "[]"
    );
    const found =
      stored.find((w) => w.id === params.id) ??
      seedWithdrawals.find((w) => w.id === params.id) ??
      null;
    setWithdrawal(found);
    setLoaded(true);
  }, [params.id]);

  if (!loaded) {
    return (
      
        <div className="container-portal py-12">
          <Card>
            <div className="p-8">
              <div className="h-6 w-64 animate-pulse rounded bg-paper" />
              <div className="mt-4 h-48 animate-pulse rounded bg-paper" />
            </div>
          </Card>
        </div>
      
    );
  }

  if (!withdrawal) {
    return (
      
        <div className="container-portal py-12">
          <Card>
            <div className="p-8 text-center">
              <h1 className="font-display text-2xl text-ink">Withdrawal not found</h1>
              <p className="mt-2 text-sm text-ink/60">
                The reference you followed does not match a withdrawal on record.
              </p>
              <Link href="/wallet/transactions" className="mt-6 inline-block">
                <Button variant="primary">View transactions</Button>
              </Link>
            </div>
          </Card>
        </div>
      
    );
  }

  const fmt = (minor: number) => (minor / 100).toFixed(2);

  return (
    
      <div className="container-portal py-8">
        <nav aria-label="Breadcrumb" className="mb-6 text-sm text-ink/60">
          <ol className="flex flex-wrap items-center gap-2">
            <li><Link href="/wallet" className="hover:text-sky">Wallet</Link></li>
            <li aria-hidden="true">/</li>
            <li><Link href="/wallet/transactions" className="hover:text-sky">Transactions</Link></li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="text-ink">{withdrawal.reference}</li>
          </ol>
        </nav>

        <div className="mx-auto max-w-3xl">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="font-display text-2xl text-ink">
                Withdrawal {withdrawal.reference}
              </h1>
              <p className="mt-1 text-sm text-ink/60">
                Initiated {new Date(withdrawal.createdAt).toLocaleString("en-GB")}
              </p>
            </div>
            <StatusPill status={withdrawal.status} />
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <div className="p-6">
                <h2 className="text-xs font-medium uppercase tracking-wide text-ink/60">
                  Details
                </h2>
                <dl className="mt-4 space-y-3">
                  <Row label="Amount" value={`${fmt(withdrawal.amount)} ${withdrawal.currency}`} />
                  <Row label="Network fee" value={`${fmt(withdrawal.fee)} ${withdrawal.currency}`} />
                  <Row label="Total debit" value={`${fmt(withdrawal.total)} ${withdrawal.currency}`} strong />
                  <Row label="Network" value={withdrawal.networkLabel} />
                </dl>

                <div className="mt-6">
                  <span className="text-xs font-medium uppercase tracking-wide text-ink/60">
                    Destination address
                  </span>
                  <code className="mt-2 block break-all rounded-md border border-ink/10 bg-paper px-3 py-2 font-mono text-xs text-ink">
                    {withdrawal.address}
                  </code>
                </div>

                <div className="mt-6 rounded-md border border-sky/30 bg-sky/5 p-4">
                  <p className="text-sm text-sky">
                    <strong>Four-eyes approval in progress.</strong> A second
                    authorised user (Finance Officer or Super Admin) must
                    approve this withdrawal before it is broadcast. You cannot
                    approve your own request.
                  </p>
                </div>
              </div>
            </Card>

            <Card>
              <div className="p-6">
                <h2 className="text-xs font-medium uppercase tracking-wide text-ink/60">
                  Timeline
                </h2>
                <Timeline withdrawal={withdrawal} />
              </div>
            </Card>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/wallet/transactions">
              <Button variant="outline">View all transactions</Button>
            </Link>
            {withdrawal.status === "PENDING_APPROVAL" && (
              <Button variant="ghost">Cancel request</Button>
            )}
          </div>
        </div>
      </div>
    
  );
}

function Row({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="flex items-center justify-between border-b border-ink/5 pb-3 last:border-0">
      <dt className={`text-sm ${strong ? "font-medium text-ink" : "text-ink/60"}`}>
        {label}
      </dt>
      <dd className={`font-mono text-sm ${strong ? "font-semibold text-ink" : "text-ink"}`}>
        {value}
      </dd>
    </div>
  );
}

function StatusPill({ status }: { status: Withdrawal["status"] }) {
  const map: Record<Withdrawal["status"], { label: string; className: string }> = {
    PENDING_APPROVAL: { label: "Pending approval", className: "bg-clay/10 text-clay" },
    APPROVED: { label: "Approved", className: "bg-sky/10 text-sky" },
    BROADCASTING: { label: "Broadcasting", className: "bg-sky/10 text-sky" },
    CONFIRMED: { label: "Confirmed", className: "bg-green-100 text-green-700" },
    REJECTED: { label: "Rejected", className: "bg-red-100 text-red-700" },
    FAILED: { label: "Failed", className: "bg-red-100 text-red-700" },
  };
  const { label, className } = map[status];
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-medium ${className}`}>
      {label}
    </span>
  );
}

function Timeline({ withdrawal }: { withdrawal: Withdrawal }) {
  const stages: Array<{ key: Withdrawal["status"] | "SUBMITTED"; label: string }> = [
    { key: "SUBMITTED", label: "Requested" },
    { key: "PENDING_APPROVAL", label: "Awaiting approval" },
    { key: "APPROVED", label: "Approved" },
    { key: "BROADCASTING", label: "Broadcast on-chain" },
    { key: "CONFIRMED", label: "Confirmed" },
  ];

  const currentIndex = stages.findIndex((s) => s.key === withdrawal.status);
  const failed = withdrawal.status === "REJECTED" || withdrawal.status === "FAILED";

  return (
    <ol className="mt-4 space-y-4">
      {stages.map((stage, i) => {
        const done = currentIndex >= 0 && i <= currentIndex && !failed;
        const active = currentIndex === i && !failed;
        return (
          <li key={stage.key} className="flex items-start gap-3">
            <span
              aria-hidden="true"
              className={`mt-1 h-2.5 w-2.5 flex-none rounded-full ${
                failed && i === currentIndex
                  ? "bg-red-500"
                  : done
                  ? "bg-sky"
                  : "bg-ink/15"
              }`}
            />
            <div className="min-w-0">
              <p className={`text-sm ${active ? "font-medium text-ink" : "text-ink/70"}`}>
                {stage.label}
              </p>
              {withdrawal.timeline.find((t) => t.status === stage.key) && (
                <p className="mt-0.5 text-xs text-ink/50">
                  {new Date(
                    withdrawal.timeline.find((t) => t.status === stage.key)!.at
                  ).toLocaleString("en-GB")}
                </p>
              )}
            </div>
          </li>
        );
      })}
      {failed && (
        <li className="flex items-start gap-3">
          <span className="mt-1 h-2.5 w-2.5 flex-none rounded-full bg-red-500" aria-hidden="true" />
          <div>
            <p className="text-sm font-medium text-red-600">
              {withdrawal.status === "REJECTED" ? "Rejected" : "Failed"}
            </p>
          </div>
        </li>
      )}
    </ol>
  );
}