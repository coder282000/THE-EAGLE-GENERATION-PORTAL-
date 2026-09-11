"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/button";
import { Card } from "@/components/card";
import type { Withdrawal } from "@/components/mock/data";

const DRAFT_KEY = "withdrawal_draft";

interface Draft {
  amount: number;
  currency: "USDT";
  fee: number;
  total: number;
  address: string;
  network: "TRC20" | "ERC20" | "BEP20";
  networkLabel: string;
}

export default function WithdrawConfirmPage() {
  const router = useRouter();
  const [draft, setDraft] = useState<Draft | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(DRAFT_KEY);
      if (raw) setDraft(JSON.parse(raw));
    } catch {
      /* ignore */
    }
    setLoaded(true);
  }, []);

  if (!loaded) {
    return (
      
        <div className="container-portal py-12">
          <Card>
            <div className="p-8">
              <div className="h-6 w-48 animate-pulse rounded bg-paper" />
              <div className="mt-4 h-32 animate-pulse rounded bg-paper" />
            </div>
          </Card>
        </div>
      
    );
  }

  if (!draft) {
    return (
      
        <div className="container-portal py-12">
          <Card>
            <div className="p-8 text-center">
              <h1 className="font-display text-2xl text-ink">Withdrawal session expired</h1>
              <p className="mt-2 text-sm text-ink/60">
                Start a new withdrawal to continue.
              </p>
              <Link href="/wallet/withdraw" className="mt-6 inline-block">
                <Button variant="primary">New withdrawal</Button>
              </Link>
            </div>
          </Card>
        </div>
      
    );
  }

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!/^\d{6}$/.test(code)) {
      setError("Enter the 6-digit code from your authenticator app.");
      return;
    }

    setSubmitting(true);
    try {
      // Mock 2FA verification — any 6 digits accepted
      await new Promise((r) => setTimeout(r, 600));

      const id = `wd_${Date.now().toString(36)}`;
      const refNum = Math.floor(100000 + Math.random() * 900000);
      const year = new Date().getFullYear().toString().slice(-2);
      const withdrawal: Withdrawal = {
        id,
        reference: `WD-${year}-${refNum}`,
        amount: draft.amount,
        currency: draft.currency,
        fee: draft.fee,
        total: draft.total,
        address: draft.address,
        network: draft.network,
        networkLabel: draft.networkLabel,
        status: "PENDING_APPROVAL",
        initiatedBy: "current_user",
        createdAt: new Date().toISOString(),
        timeline: [
          {
            status: "SUBMITTED",
            at: new Date().toISOString(),
            actor: "You",
            note: "Withdrawal requested and awaiting second approval.",
          },
        ],
      };

      const existing: Withdrawal[] = JSON.parse(
        localStorage.getItem("withdrawals") ?? "[]"
      );
      localStorage.setItem(
        "withdrawals",
        JSON.stringify([withdrawal, ...existing])
      );
      sessionStorage.removeItem(DRAFT_KEY);

      router.push(`/wallet/withdraw/${id}`);
    } catch {
      setError("Could not submit the withdrawal. Please try again.");
      setSubmitting(false);
    }
  };

  const fmt = (minor: number) => (minor / 100).toFixed(2);

  return (
    
      <div className="container-portal py-8">
        <nav aria-label="Breadcrumb" className="mb-6 text-sm text-ink/60">
          <ol className="flex flex-wrap items-center gap-2">
            <li><Link href="/wallet" className="hover:text-sky">Wallet</Link></li>
            <li aria-hidden="true">/</li>
            <li><Link href="/wallet/withdraw" className="hover:text-sky">Withdraw</Link></li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="text-ink">Confirm</li>
          </ol>
        </nav>

        <div className="mx-auto max-w-2xl">
          <h1 className="font-display text-2xl text-ink">Confirm withdrawal</h1>
          <p className="mt-1 text-sm text-ink/60">
            Review the details and confirm with your authenticator code.
          </p>

          <Card className="mt-6">
            <div className="p-6">
              <h2 className="text-xs font-medium uppercase tracking-wide text-ink/60">
                Summary
              </h2>

              <dl className="mt-4 space-y-3">
                <SummaryRow label="Amount" value={`${fmt(draft.amount)} ${draft.currency}`} />
                <SummaryRow label="Network fee" value={`${fmt(draft.fee)} ${draft.currency}`} />
                <div className="border-t border-ink/10 pt-3">
                  <SummaryRow
                    label="Total debit"
                    value={`${fmt(draft.total)} ${draft.currency}`}
                    strong
                  />
                </div>
              </dl>

              <div className="mt-6">
                <h3 className="text-xs font-medium uppercase tracking-wide text-ink/60">
                  Destination
                </h3>
                <div className="mt-3 rounded-md border border-ink/10 bg-paper p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-ink/60">Network</span>
                    <span className="text-sm font-medium text-ink">{draft.networkLabel}</span>
                  </div>
                  <div className="mt-3">
                    <span className="text-sm text-ink/60">Address</span>
                    <code className="mt-1 block break-all rounded border border-ink/10 bg-white px-3 py-2 font-mono text-xs text-ink">
                      {draft.address}
                    </code>
                  </div>
                </div>
              </div>

              <div className="mt-6 rounded-md border border-clay/30 bg-clay/5 p-4">
                <p className="text-sm text-clay">
                  Withdrawals require approval from a second authorised user
                  (four-eyes). Once approved, the ledger is debited and the
                  transfer is broadcast on-chain. This cannot be reversed once
                  broadcast.
                </p>
              </div>

              <form onSubmit={handleConfirm} className="mt-6">
                <label
                  htmlFor="mfa-code"
                  className="block text-sm font-medium text-ink"
                >
                  Authenticator code
                </label>
                <p className="mt-1 text-xs text-ink/60">
                  Enter the 6-digit code from your authenticator app.
                </p>
                <input
                  id="mfa-code"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                  aria-invalid={!!error}
                  aria-describedby={error ? "mfa-error" : undefined}
                  className="mt-3 w-full rounded-md border border-ink/15 bg-white px-4 py-3 text-center font-mono text-lg tracking-[0.5em] text-ink focus:border-sky focus:outline-none focus:ring-2 focus:ring-sky/40"
                  placeholder="000000"
                />
                {error && (
                  <p id="mfa-error" className="mt-2 text-sm text-red-600">
                    {error}
                  </p>
                )}

                <div className="mt-6 flex flex-col gap-3 sm:flex-row-reverse">
                  <Button
                    type="submit"
                    variant="primary"
                    fullWidth
                    disabled={submitting}
                  >
                    {submitting ? "Submitting…" : "Confirm withdrawal"}
                  </Button>
                  <Link href="/wallet/withdraw" className="sm:flex-1">
                    <Button type="button" variant="outline" fullWidth>
                      Cancel
                    </Button>
                  </Link>
                </div>
              </form>
            </div>
          </Card>
        </div>
      </div>
    
  );
}

function SummaryRow({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <dt className={`text-sm ${strong ? "font-medium text-ink" : "text-ink/60"}`}>
        {label}
      </dt>
      <dd className={`font-mono text-sm ${strong ? "font-semibold text-ink" : "text-ink"}`}>
        {value}
      </dd>
    </div>
  );
}